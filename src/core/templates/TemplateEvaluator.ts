import type { FunctionDescriptor, AnyFunctionDescriptor } from "../../types";
import type { 
    MetaDataTemplateProcessed, 
    MetaDataTemplateFieldProcessed,
    FormData,
    JSONObject
} from "../../types";
import { QueryWhereClause, QueryReturnClause } from "../../types/templates";
import { QueryEngine, SearchResult } from "../../search/QueryEngine";
import type ElnPlugin from "../../main";
import { createLogger } from "../../utils/Logger";
import { FunctionEvaluator } from "./FunctionEvaluator";
import { FunctionEvaluatorLegacy } from "./FunctionEvaluatorLegacy";
import { QueryEvaluator } from "./QueryEvaluator";

const logger = createLogger('template');

/**
 * New thin coordinator for template evaluation.
 * Delegates to:
 * - FunctionEvaluator: New safe function evaluation (Phase 1)
 * - FunctionEvaluatorLegacy: Legacy function formats (temporary, removed in Phase 2.4)
 * - QueryEvaluator: Query execution with WHERE/RETURN clauses
 */
export class TemplateEvaluator {
    private plugin: ElnPlugin;
    private functionEvaluator: FunctionEvaluator;
    private queryEvaluator: QueryEvaluator;

    constructor(plugin: ElnPlugin) {
        this.plugin = plugin;
        
        // Initialize function evaluator (new format)
        this.functionEvaluator = new FunctionEvaluator(plugin);
        
        // Initialize query evaluator with dependency injection
        const queryEngine = new QueryEngine(plugin.app);
        this.queryEvaluator = new QueryEvaluator(queryEngine);
        
        // Inject function evaluator into query evaluator (breaks circular dependency)
        this.queryEvaluator.setFunctionEvaluator(
            (descriptor: AnyFunctionDescriptor, userData: FormData) => 
                this.evaluateUserInputFunction(descriptor, userData)
        );
    }

    /**
     * Evaluates a function descriptor with user input context.
     * Routes to appropriate evaluator based on descriptor format.
     * 
     * @param descriptor The function descriptor to evaluate
     * @param userData The current user data
     * @returns The evaluated result
     */
    evaluateUserInputFunction(descriptor: AnyFunctionDescriptor, userData: FormData): unknown {
        if (descriptor.type !== "function") {
            throw new Error("Invalid function descriptor type");
        }

        try {
            // Route to appropriate evaluator based on format
            if (FunctionEvaluatorLegacy.isLegacyFormat(descriptor)) {
                logger.debug(`[evaluateUserInputFunction] Using legacy function evaluation`);
                const context = {
                    ...this.plugin,
                    ...userData  // Preserves nested structure of userData
                };
                return FunctionEvaluatorLegacy.evaluateFunctionDescriptor(descriptor, context);
            }
            
            if (FunctionEvaluatorLegacy.isEnhancedFormat(descriptor)) {
                logger.debug(`[evaluateUserInputFunction] Using enhanced function evaluation`);
                return FunctionEvaluatorLegacy.evaluateEnhancedFunction(descriptor, userData, this.plugin);
            }
            
            // NEW format - use FunctionEvaluator (Phase 1)
            logger.debug(`[evaluateUserInputFunction] Using new FunctionEvaluator`);
            return this.functionEvaluator.evaluateFunction(descriptor, userData);
            
        } catch (error) {
            logger.error("Error evaluating user input function:", error);
            return null;
        }
    }

    /**
     * Execute a template query and return results with mapping.
     * Delegates to QueryEvaluator.
     * 
     * @param config Query configuration with search, where, return, userData
     * @returns Results array and field mapping
     */
    executeTemplateQuery(config: {
        search?: string;
        where?: QueryWhereClause;
        return?: QueryReturnClause;
        userData?: FormData;
    }): { results: SearchResult[]; mapping: Record<string, string> } {
        return this.queryEvaluator.executeTemplateQuery(config);
    }

    /**
     * Extract return fields from return clause.
     * Delegates to QueryEvaluator.
     */
    extractReturnFields(returnClause: QueryReturnClause): string[] {
        return this.queryEvaluator.extractReturnFields(returnClause);
    }

    /**
     * Processes dynamic fields (e.g., `callback`, `default`, `options`) in the metadata template.
     * Evaluates function descriptors that don't have reactive dependencies.
     * 
     * @param template The metadata template to process.
     */
    processDynamicFields(template: MetaDataTemplateProcessed): void {
        for (const key in template) {
            const field = template[key];
            if (field && typeof field === "object") {
                if ("inputType" in field) {
                    // This is a MetaDataTemplateFieldProcessed
                    const templateField = field as MetaDataTemplateFieldProcessed;
                    
                    // Process callback - keep as descriptor for later evaluation
                    // Callbacks need to be evaluated when the field value changes, not during template initialization
                    // The new FunctionEvaluator supports "input" context for callback functions
                    // Legacy format or enhanced format descriptors are kept as-is
                    if (TemplateEvaluator.isFunctionDescriptor(templateField.callback)) {
                        logger.debug(`Keeping callback as descriptor for key "${key}":`, templateField.callback);
                        // Callback descriptors are kept as-is and evaluated when field value changes
                        // NEW: Use FunctionEvaluator with input context instead of legacy evaluator
                    } else if (typeof templateField.callback === "string" && this.isInlineFunction(templateField.callback)) {
                        // Handle legacy string-based functions
                        logger.debug(`Processing legacy callback string for key "${key}":`, templateField.callback);
                        templateField.callback = this.evaluateDynamicField(templateField.callback) as typeof templateField.callback;
                        if (typeof templateField.callback !== "function") {
                            logger.warn(`Callback for key "${key}" is not a valid function.`, templateField.callback);
                        }
                    }
                    
                    // Process action - must evaluate to a function
                    if (TemplateEvaluator.isFunctionDescriptor(templateField.action)) {
                        logger.debug(`Processing action function descriptor for key "${key}":`, templateField.action);
                        // Actions evaluate to function objects (not values), so we use the legacy evaluator
                        // Actions often need plugin context (e.g., this.chemicalLookup) for complex operations
                        // Legacy format (value: "this.something") is required for actions that need plugin context
                        if (FunctionEvaluatorLegacy.isLegacyFormat(templateField.action)) {
                            templateField.action = TemplateEvaluator.evaluateFunctionDescriptor(
                                templateField.action as FunctionDescriptor, 
                                this.plugin,
                                key
                            ) as typeof templateField.action;
                            if (typeof templateField.action !== "function") {
                                logger.warn(`Action for key "${key}" did not evaluate to a valid function.`, templateField.action);
                            }
                        }
                    } else if (typeof templateField.action === "string" && this.isInlineFunction(templateField.action)) {
                        // Handle legacy string-based functions
                        logger.debug(`Processing legacy action string for key "${key}":`, templateField.action);
                        templateField.action = this.evaluateDynamicField(templateField.action) as typeof templateField.action;
                        if (typeof templateField.action !== "function") {
                            logger.warn(`Action for key "${key}" is not a valid function.`, templateField.action);
                        }
                    }
                    
                    // Process default - only evaluate non-reactive functions during initialization
                    if (TemplateEvaluator.isFunctionDescriptor(templateField.default)) {
                        if (!this.isReactiveFunction(templateField.default)) {
                            if (FunctionEvaluatorLegacy.isLegacyFormat(templateField.default)) {
                                // Legacy function descriptor - evaluate immediately
                                templateField.default = TemplateEvaluator.evaluateFunctionDescriptor(
                                    templateField.default as FunctionDescriptor, 
                                    this.plugin,
                                    key
                                ) as typeof templateField.default;
                            }
                            // NEW format (expression or function) - keep as descriptor for later evaluation
                            // Will be evaluated in extractDefaultValuesFromTemplate with proper context
                        }
                        // Reactive function descriptors are kept as-is and evaluated when dependencies change
                    } else if (typeof templateField.default === "string" && this.isInlineFunction(templateField.default)) {
                        // Handle legacy string-based functions
                        templateField.default = this.evaluateDynamicField(templateField.default) as typeof templateField.default;
                    }
                    
                    // Process options - only evaluate non-reactive functions during initialization
                    if (TemplateEvaluator.isFunctionDescriptor(templateField.options)) {
                        if (!this.isReactiveFunction(templateField.options)) {
                            if (FunctionEvaluatorLegacy.isLegacyFormat(templateField.options)) {
                                // Legacy function descriptor - evaluate immediately
                                templateField.options = TemplateEvaluator.evaluateFunctionDescriptor(
                                    templateField.options as FunctionDescriptor, 
                                    this.plugin,
                                    key
                                ) as typeof templateField.options;
                            } else {
                                // NEW format (expression or function) - evaluate with FunctionEvaluator
                                logger.debug(`Evaluating NEW format options for field with FunctionEvaluator`);
                                templateField.options = this.functionEvaluator.evaluateFunction(
                                    templateField.options,
                                    {}  // No user input context during initialization
                                ) as typeof templateField.options;
                            }
                        }
                        // Reactive function descriptors are kept as-is and evaluated when dependencies change
                    } else if (typeof templateField.options === "string" && this.isInlineFunction(templateField.options)) {
                        // Handle legacy string-based functions
                        templateField.options = this.evaluateDynamicField(templateField.options) as typeof templateField.options;
                    }

                    // Process objectTemplate if it exists (for list fields with object types)
                    if (templateField.inputType === "list" && 
                        templateField.listType === "object" && 
                        templateField.objectTemplate &&
                        typeof templateField.objectTemplate === "object") {
                        logger.debug(`Processing objectTemplate for list field "${key}"`);
                        this.processDynamicFields(templateField.objectTemplate as MetaDataTemplateProcessed);
                    }
                } else {
                    // Recursively process nested MetaDataTemplateProcessed objects
                    this.processDynamicFields(field as MetaDataTemplateProcessed);
                }
            }
        }
    }

    /**
     * Evaluates a field's default value with the given context.
     * 
     * @param field The field to evaluate
     * @param userData The user data context
     * @returns The evaluated default value
     */
    evaluateFieldDefault(field: MetaDataTemplateFieldProcessed, userData: FormData): unknown {
        if (TemplateEvaluator.isFunctionDescriptor(field.default)) {
            // Check if this is a reactive function (either format)
            const isReactive = this.isReactiveFunction(field.default);
            
            if (isReactive) {
                // For reactive functions, use evaluateUserInputFunction with current user data
                return this.evaluateUserInputFunction(field.default, userData);
            } else {
                // For non-reactive functions, evaluate normally
                if (FunctionEvaluatorLegacy.isLegacyFormat(field.default)) {
                    // Legacy function descriptor - still supported for backward compatibility
                    const func = TemplateEvaluator.evaluateFunctionDescriptor(
                        field.default as FunctionDescriptor, 
                        this.plugin
                    );
                    return typeof func === "function" ? func(userData as JSONObject) : func;
                } else {
                    // NEW FunctionEvaluator format (expression or function) - use FunctionEvaluator
                    return this.functionEvaluator.evaluateFunction(field.default, userData);
                }
            }
        } else if (typeof field.default === "function") {
            // Handle legacy function defaults
            return (field.default as (userData: JSONObject) => unknown)(userData as JSONObject);
        } else {
            // Handle static defaults
            return field.default;
        }
    }

    /**
     * Evaluate a field's callback function with an input value.
     * Callbacks transform field values before they are written to frontmatter.
     * 
     * @param field The field configuration containing the callback
     * @param inputValue The raw input value to transform
     * @param userData The current user data for context
     * @returns The transformed value
     */
    evaluateFieldCallback(field: MetaDataTemplateFieldProcessed, inputValue: unknown, userData: FormData): unknown {
        if (!field.callback) {
            return inputValue;
        }

        // If callback is a function (legacy), call it directly
        if (typeof field.callback === "function") {
            return field.callback(inputValue as string | number | boolean | null);
        }

        // If callback is a function descriptor, evaluate it with the new FunctionEvaluator
        if (TemplateEvaluator.isFunctionDescriptor(field.callback)) {
            // Use the new FunctionEvaluator with "input" context
            return this.functionEvaluator.evaluateFunction(field.callback, userData, undefined, inputValue);
        }

        // If no valid callback, return original value
        return inputValue;
    }

    /**
     * Checks if a field has any function descriptors that depend on the changed field.
     * 
     * @param field The field to check
     * @param changedFieldPath The path of the field that was changed
     * @returns True if the field depends on the changed field
     */
    checkFieldForUserInputDependencies(field: MetaDataTemplateFieldProcessed, changedFieldPath: string): boolean {
        // Check all possible function descriptor fields
        const descriptorFields = ['default', 'options', 'callback', 'action'] as const;
        
        for (const descriptorField of descriptorFields) {
            const value = field[descriptorField];
            if (TemplateEvaluator.isFunctionDescriptor(value)) {
                const dependencies = this.getReactiveDependencies(value);
                if (dependencies.includes(changedFieldPath)) {
                    return true;
                }
            }
        }
        
        return false;
    }

    // ========== STATIC METHODS (for backward compatibility) ==========

    /**
     * Static helper to check if a value is a function descriptor.
     * Used by UniversalObjectRenderer and internal methods.
     */
    static isFunctionDescriptor(value: unknown): value is AnyFunctionDescriptor {
        return FunctionEvaluatorLegacy.isFunctionDescriptor(value);
    }

    /**
     * Static helper to evaluate a legacy function descriptor.
     * Used by UniversalObjectRenderer and internal methods.
     * 
     * @deprecated This only handles legacy format. Use instance method evaluateUserInputFunction() instead.
     */
    static evaluateFunctionDescriptor(descriptor: FunctionDescriptor, context?: object, fieldName?: string): unknown {
        return FunctionEvaluatorLegacy.evaluateFunctionDescriptor(descriptor, context, fieldName);
    }

    // ========== PRIVATE HELPER METHODS ==========

    /**
     * Check if a function descriptor is reactive (has dependencies on user input)
     */
    private isReactiveFunction(descriptor: AnyFunctionDescriptor): boolean {
        return FunctionEvaluatorLegacy.hasReactiveDependencies(descriptor);
    }

    /**
     * Get reactive dependencies from either function descriptor format
     */
    private getReactiveDependencies(descriptor: AnyFunctionDescriptor): string[] {
        if (FunctionEvaluatorLegacy.isEnhancedFormat(descriptor)) {
            return descriptor.reactiveDeps || [];
        } else if (FunctionEvaluatorLegacy.isLegacyFormat(descriptor)) {
            return descriptor.userInputs || [];
        }
        return [];
    }

    /**
     * Checks if a string represents an inline function (legacy support).
     * @param field The string to check.
     * @returns True if the string is an inline function, false otherwise.
     */
    private isInlineFunction(field: string): boolean {
        const inlineFunctionPattern = /^(\(?\w+\)?\s*=>|function\s*\(|this\.\w+\(|return\s|[a-zA-Z_$][a-zA-Z0-9_$]*\s*\()/;
        
        // Don't treat simple strings, URLs, file names, etc. as functions
        if (field.includes(' ') && !field.includes('=>') && !field.includes('function') && !field.includes('this.')) {
            return false;
        }
        
        return inlineFunctionPattern.test(field.trim());
    }

    /**
     * Evaluates a dynamic field (legacy string-based function)
     * @deprecated Legacy support only. Use function descriptors instead.
     */
    private evaluateDynamicField(field: string): unknown {
        logger.warn(`Legacy string-based function evaluation is deprecated. Please use function descriptors instead. Field: ${field}`);
        
        // Convert legacy string to function descriptor and evaluate
        const functionDescriptor: FunctionDescriptor = {
            type: "function",
            value: field
        };
        
        return TemplateEvaluator.evaluateFunctionDescriptor(functionDescriptor, this.plugin);
    }
}
