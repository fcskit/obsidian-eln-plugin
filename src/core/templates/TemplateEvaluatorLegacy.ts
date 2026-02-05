import type { FunctionDescriptor, EnhancedFunctionDescriptor, AnyFunctionDescriptor } from "../../types";
import type { 
    MetaDataTemplate,
    MetaDataTemplateProcessed, 
    MetaDataTemplateFieldProcessed,
    FormData,
    JSONObject
} from "../../types";
import { QueryWhereClause, QueryReturnClause } from "../../types/templates";
import { QueryEngine, SearchQuery, QueryCondition, QueryLogic, SearchResult } from "../../search/QueryEngine";
import type ElnPlugin from "../../main";
import { createLogger } from "../../utils/Logger";

const logger = createLogger('template');

/**
 * Handles evaluation of function descriptors and dynamic fields in templates
 */
export class TemplateEvaluator {
    private plugin: ElnPlugin;
    private queryEngine: QueryEngine;

    constructor(plugin: ElnPlugin) {
        this.plugin = plugin;
        this.queryEngine = new QueryEngine(plugin.app);
    }

    /**
     * Checks if a string represents an inline function.
     * @param field The string to check.
     * @returns True if the string is an inline function, false otherwise.
     */
    isInlineFunction(field: string): boolean {
        // Match common inline function patterns like "(value) => ..." or "value => ..."
        // Also match function expressions like "function(...)"
        // Also match expressions that contain method calls like "this.something(...)"
        const inlineFunctionPattern = /^(\(?\w+\)?\s*=>|function\s*\(|this\.\w+\(|return\s|[a-zA-Z_$][a-zA-Z0-9_$]*\s*\()/;
        
        // Don't treat simple strings, URLs, file names, etc. as functions
        if (field.includes(' ') && !field.includes('=>') && !field.includes('function') && !field.includes('this.')) {
            return false;
        }
        
        return inlineFunctionPattern.test(field.trim());
    }

    /**
     * Evaluates a dynamic field (legacy string-based function)
     * @param field The string field to evaluate
     * @returns The evaluated result
     */
    evaluateDynamicField(field: string): unknown {
        logger.warn(`Legacy string-based function evaluation is deprecated. Please use function descriptors instead. Field: ${field}`);
        
        // Convert legacy string to function descriptor and evaluate
        const functionDescriptor: FunctionDescriptor = {
            type: "function",
            value: field
        };
        
        return TemplateEvaluator.evaluateFunctionDescriptor(functionDescriptor, this.plugin);
    }

    /**
     * Evaluates a function descriptor with user input context.
     * @param descriptor The function descriptor to evaluate
     * @param userData The current user data
     * @returns The evaluated result
     */
    evaluateUserInputFunction(descriptor: AnyFunctionDescriptor, userData: FormData): unknown {
        if (descriptor.type !== "function") {
            throw new Error("Invalid function descriptor type");
        }

        try {
            // Check if this is the new enhanced function descriptor format
            logger.debug(`[evaluateUserInputFunction] Checking descriptor format:`, {
                descriptor,
                hasContext: 'context' in descriptor,
                hasReactiveDeps: 'reactiveDeps' in descriptor,
                hasFunction: 'function' in descriptor,
                hasValue: 'value' in descriptor,
                isEnhanced: this.isEnhancedFunctionDescriptor(descriptor)
            });
            
            if (this.isEnhancedFunctionDescriptor(descriptor)) {
                logger.debug(`[evaluateUserInputFunction] Using enhanced function evaluation`);
                return this.evaluateEnhancedFunction(descriptor, userData);
            } else {
                logger.debug(`[evaluateUserInputFunction] Using legacy function evaluation`);
                // Legacy format - use existing evaluation method
                const context = {
                    ...this.plugin,
                    ...userData  // This preserves the nested structure of userData
                };
                
                return TemplateEvaluator.evaluateFunctionDescriptor(descriptor, context);
            }
        } catch (error) {
            logger.error("Error evaluating user input function:", error);
            throw error;
        }
    }

    /**
     * Type guard to check if a descriptor is the enhanced format
     */
    private isEnhancedFunctionDescriptor(descriptor: AnyFunctionDescriptor): descriptor is EnhancedFunctionDescriptor {
        return 'context' in descriptor && 'function' in descriptor;
    }

    /**
     * Evaluates an enhanced function descriptor with proper context handling
     */
    public evaluateEnhancedFunction(descriptor: EnhancedFunctionDescriptor, userData: FormData): unknown {
        try {
            // Log the function evaluation attempt
            logger.debug(`[evaluateEnhancedFunction] Evaluating function:`, {
                function: descriptor.function,
                contextKeys: descriptor.context,
                dependencies: descriptor.reactiveDeps,
                userData: userData
            });

            // Check if all reactive dependencies are satisfied (if any)
            const reactiveDeps = descriptor.reactiveDeps || [];
            const dependencyCheck = reactiveDeps.map(dep => {
                const depValue = this.getNestedValue(userData, dep);
                const satisfied = depValue !== undefined && depValue !== null && depValue !== '';
                logger.debug(`[evaluateEnhancedFunction] Dependency check for '${dep}':`, {
                    dependency: dep,
                    value: depValue,
                    satisfied: satisfied
                });
                return satisfied;
            });
            
            const allDependenciesSatisfied = dependencyCheck.every(satisfied => satisfied);

            if (reactiveDeps.length > 0 && !allDependenciesSatisfied) {
                logger.debug(`[evaluateEnhancedFunction] Dependencies not satisfied, using fallback:`, {
                    dependencies: reactiveDeps,
                    values: reactiveDeps.map(dep => ({ [dep]: this.getNestedValue(userData, dep) })),
                    fallback: descriptor.fallback
                });
                return descriptor.fallback;
            }

            // Build the context object based on requested contexts
            const contextObject: Record<string, unknown> = {};
            
            for (const contextType of descriptor.context) {
                switch (contextType) {
                    case 'userInput':
                        contextObject.userInput = userData;
                        break;
                    case 'settings':
                        contextObject.settings = this.plugin.settings;
                        break;
                    case 'plugin':
                        contextObject.plugin = this.plugin;
                        break;
                    case 'frontmatter':
                        // For frontmatter context, expect it to be passed in userData with 'frontmatter' key
                        contextObject.frontmatter = (userData as Record<string, unknown>).frontmatter || {};
                        break;
                    case 'selection':
                        // For selection context, expect it to be passed in userData with 'selection' key
                        contextObject.selection = (userData as Record<string, unknown>).selection;
                        break;
                    default:
                        logger.warn(`Unknown context type: ${contextType}`);
                }
            }

            // Evaluate the function with the built context
            const functionCode = descriptor.function;
            const contextKeys = Object.keys(contextObject);
            
            logger.debug(`[evaluateEnhancedFunction] Executing function:`, {
                function: functionCode,
                contextKeys,
                contextObject,
                dependencies: descriptor.reactiveDeps
            });

            // Create and execute the function directly with the context object
            logger.debug(`[evaluateEnhancedFunction] Creating function from:`, functionCode);
            const fn = new Function(`return ${functionCode}`)();
            logger.debug(`[evaluateEnhancedFunction] Function created successfully, type:`, typeof fn);
            
            logger.debug(`[evaluateEnhancedFunction] Calling function with contextObject:`, {
                contextObject,
                contextObjectType: typeof contextObject,
                contextObjectKeys: Object.keys(contextObject)
            });
            
            const result = fn(contextObject);
            
            logger.debug(`[evaluateEnhancedFunction] Function execution completed:`, {
                function: functionCode,
                result: result,
                resultType: typeof result,
                isArray: Array.isArray(result),
                resultLength: Array.isArray(result) ? result.length : 'N/A'
            });

            return result;

        } catch (error) {
            logger.error(`[evaluateEnhancedFunction] Error evaluating enhanced function:`, error);
            return descriptor.fallback;
        }
    }

    /**
     * Helper to get nested values from userData using dot notation
     */
    private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
        return path.split('.').reduce((current: unknown, key: string) => {
            return (current && typeof current === 'object' && key in current) 
                ? (current as Record<string, unknown>)[key] 
                : undefined;
        }, obj);
    }

    /**
     * Processes dynamic fields (e.g., `callback`, `default`, `options`) in the metadata template.
     * @param template The metadata template to process.
     */
    processDynamicFields(template: MetaDataTemplateProcessed): void {
        for (const key in template) {
            const field = template[key];
            if (field && typeof field === "object") {
                if ("inputType" in field) {
                    // This is a MetaDataTemplateFieldProcessed
                    const templateField = field as MetaDataTemplateFieldProcessed;
                    
                    // Process function descriptors for callback, action, default, and options fields
                    if (TemplateEvaluator.isFunctionDescriptor(templateField.callback)) {
                        logger.debug(`Processing callback function descriptor for key "${key}":`, templateField.callback);
                        // Enhanced function descriptors for callbacks/actions aren't supported yet - skip them
                        if (!this.isEnhancedFunctionDescriptor(templateField.callback)) {
                            templateField.callback = TemplateEvaluator.evaluateFunctionDescriptor(templateField.callback as FunctionDescriptor, this.plugin) as typeof templateField.callback;
                            if (typeof templateField.callback !== "function") {
                                logger.warn(`Callback for key "${key}" did not evaluate to a valid function.`, templateField.callback);
                            }
                        }
                    } else if (typeof templateField.callback === "string" && this.isInlineFunction(templateField.callback)) {
                        // Handle legacy string-based functions (only if they look like actual functions)
                        logger.debug(`Processing legacy callback string for key "${key}":`, templateField.callback);
                        templateField.callback = this.evaluateDynamicField(templateField.callback) as typeof templateField.callback;
                        if (typeof templateField.callback !== "function") {
                            logger.warn(`Callback for key "${key}" is not a valid function.`, templateField.callback);
                        }
                    }
                    
                    if (TemplateEvaluator.isFunctionDescriptor(templateField.action)) {
                        logger.debug(`Processing action function descriptor for key "${key}":`, templateField.action);
                        // Enhanced function descriptors for callbacks/actions aren't supported yet - skip them
                        if (!this.isEnhancedFunctionDescriptor(templateField.action)) {
                            templateField.action = TemplateEvaluator.evaluateFunctionDescriptor(templateField.action as FunctionDescriptor, this.plugin) as typeof templateField.action;
                            if (typeof templateField.action !== "function") {
                                logger.warn(`Action for key "${key}" did not evaluate to a valid function.`, templateField.action);
                            }
                        }
                    } else if (typeof templateField.action === "string" && this.isInlineFunction(templateField.action)) {
                        // Handle legacy string-based functions (only if they look like actual functions)
                        logger.debug(`Processing legacy action string for key "${key}":`, templateField.action);
                        templateField.action = this.evaluateDynamicField(templateField.action) as typeof templateField.action;
                        if (typeof templateField.action !== "function") {
                            logger.warn(`Action for key "${key}" is not a valid function.`, templateField.action);
                        }
                    }
                    
                    if (TemplateEvaluator.isFunctionDescriptor(templateField.default)) {
                        // Only evaluate non-reactive function descriptors during initialization
                        if (!this.isReactiveFunction(templateField.default)) {
                            if (this.isEnhancedFunctionDescriptor(templateField.default)) {
                                // Enhanced function without dependencies - use fallback
                                templateField.default = templateField.default.fallback as typeof templateField.default;
                            } else {
                                // Legacy function descriptor
                                templateField.default = TemplateEvaluator.evaluateFunctionDescriptor(templateField.default as FunctionDescriptor, this.plugin) as typeof templateField.default;
                            }
                        }
                        // Reactive function descriptors are kept as-is and evaluated when dependencies change
                    } else if (typeof templateField.default === "string" && this.isInlineFunction(templateField.default)) {
                        // Handle legacy string-based functions (only if they look like actual functions)
                        templateField.default = this.evaluateDynamicField(templateField.default) as typeof templateField.default;
                    }
                    
                    if (TemplateEvaluator.isFunctionDescriptor(templateField.options)) {
                        // Only evaluate non-reactive function descriptors during initialization
                        if (!this.isReactiveFunction(templateField.options)) {
                            if (this.isEnhancedFunctionDescriptor(templateField.options)) {
                                // Enhanced function without dependencies - use fallback
                                templateField.options = templateField.options.fallback as typeof templateField.options;
                            } else {
                                // Legacy function descriptor
                                templateField.options = TemplateEvaluator.evaluateFunctionDescriptor(templateField.options as FunctionDescriptor, this.plugin) as typeof templateField.options;
                            }
                        }
                        // Reactive function descriptors are kept as-is and evaluated when dependencies change
                    } else if (typeof templateField.options === "string" && this.isInlineFunction(templateField.options)) {
                        // Handle legacy string-based functions (only if they look like actual functions)
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
     * Checks if a field has any function descriptors that depend on the changed field.
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

    /**
     * Get reactive dependencies from either function descriptor format
     */
    private getReactiveDependencies(descriptor: AnyFunctionDescriptor): string[] {
        if (this.isEnhancedFunctionDescriptor(descriptor)) {
            return descriptor.reactiveDeps || [];
        } else {
            // Legacy format
            return (descriptor as FunctionDescriptor).userInputs || [];
        }
    }

    /**
     * Evaluates a field's default value with the given context
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
                if (this.isEnhancedFunctionDescriptor(field.default)) {
                    // Enhanced function without dependencies - just return fallback
                    return field.default.fallback;
                } else {
                    // Legacy function descriptor
                    const func = TemplateEvaluator.evaluateFunctionDescriptor(field.default as FunctionDescriptor, this.plugin);
                    return typeof func === "function" ? func(userData as JSONObject) : func;
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
     * Check if a function descriptor is reactive (has dependencies on user input)
     */
    private isReactiveFunction(descriptor: AnyFunctionDescriptor): boolean {
        if (this.isEnhancedFunctionDescriptor(descriptor)) {
            return !!(descriptor.reactiveDeps && descriptor.reactiveDeps.length > 0);
        } else {
            // Legacy format
            return !!((descriptor as FunctionDescriptor).userInputs && 
                   (descriptor as FunctionDescriptor).userInputs!.length > 0);
        }
    }

    /**
     * Helper function to check if a value is a function descriptor (either format)
     */
    static isFunctionDescriptor(value: unknown): value is AnyFunctionDescriptor {
        if (typeof value !== 'object' || value === null || !('type' in value)) {
            return false;
        }
        
        const obj = value as { type: unknown };
        if (obj.type !== 'function') {
            return false;
        }
        
        // Check for legacy format (has 'value' property)
        if ('value' in value && typeof (value as FunctionDescriptor).value === 'string') {
            return true;
        }
        
        // Check for enhanced format (has 'context', 'reactiveDeps', 'function' properties)
        if ('context' in value && 'reactiveDeps' in value && 'function' in value) {
            return true;
        }
        
        return false;
    }

    /**
     * Helper function to evaluate a function descriptor safely (legacy format only)
     */
    static evaluateFunctionDescriptor(descriptor: FunctionDescriptor, context?: object): unknown {
        try {
            const functionCode = descriptor.value;
            
            if (functionCode.startsWith("this.") && context) {
                // Handle expressions that reference `this`
                const expression = functionCode.replace(/this\./g, "context.");
                return new Function("context", "return " + expression)(context);
            } else if (functionCode.startsWith("new ")) {
                // Handle `new SomeObject()` or `new SomeObject().someFunction()`
                if (context) {
                    // Create variables from context properties for the evaluation scope
                    const contextKeys = Object.keys(context);
                    const contextValues = Object.values(context);
                    return new Function(...contextKeys, "return " + functionCode)(...contextValues);
                } else {
                    return new Function("return " + functionCode)();
                }
            } else {
                // Handle standalone expressions
                if (context) {
                    const contextKeys = Object.keys(context);
                    const contextValues = Object.values(context);
                    return new Function(...contextKeys, "return " + functionCode)(...contextValues);
                } else {
                    return new Function("return " + functionCode)();
                }
            }
        } catch (error) {
            logger.error("Error evaluating function descriptor:", error);
            return null;
        }
    }

    /**
     * Execute a template query and return results with mapping
     */
    executeTemplateQuery(config: {
        search?: string;
        where?: QueryWhereClause;
        return?: QueryReturnClause;
        userData?: FormData;
    }): { results: SearchResult[]; mapping: Record<string, string> } {
        const query: SearchQuery = {};
        if (config.search) {
            query.tags = [config.search];
        }
        let mapping: Record<string, string> = {};

        // Preprocess where clause if provided
        if (config.where) {
            const processedWhere = this.preprocessWhereClause(config.where, config.userData);
            if (processedWhere) {
                query.where = processedWhere;
            }
        }

        // Parse return clause if provided
        if (config.return) {
            const parsed = this.parseReturnClause(config.return);
            query.return = parsed.queryReturn;
            mapping = parsed.mapping;
        }

        const results = this.queryEngine.search(query);
        return { results, mapping };
    }

    /**
     * Preprocess where clause by evaluating function descriptors
     */
    preprocessWhereClause(where: QueryWhereClause, userData?: FormData): QueryLogic | QueryCondition | QueryCondition[] | undefined {
        if (!where) return undefined;
        
        if (typeof where === 'string') {
            return this.parseWhereString(where);
        }
        
        if (Array.isArray(where)) {
            return where.map(cond => {
                const { field, ...ops } = cond;
                const op = Object.keys(ops)[0];
                let value: string | number | boolean = ops[op];
                
                // Check if value is a function descriptor that needs evaluation
                if (this.isFunctionDescriptor(value)) {
                    const evaluatedValue = this.evaluateUserInputFunction(value as unknown as AnyFunctionDescriptor, userData || {});
                    value = typeof evaluatedValue === 'string' || typeof evaluatedValue === 'number' || typeof evaluatedValue === 'boolean' 
                        ? evaluatedValue 
                        : String(evaluatedValue);
                }
                
                const operatorMap: Record<string, QueryCondition['operator']> = { 
                    'is': 'is', 
                    'contains': 'contains',
                    'not': 'not',
                    'gt': 'gt',
                    'lt': 'lt',
                    'gte': 'gte',
                    'lte': 'lte',
                    'exists': 'exists',
                    'regex': 'regex'
                };
                return { field, operator: operatorMap[op] || 'is', value } as QueryCondition;
            });
        }
        
        if ('field' in where) {
            let value = where.value;
            // Check if value is a function descriptor that needs evaluation
            if (this.isFunctionDescriptor(value)) {
                const evaluatedValue = this.evaluateUserInputFunction(value as unknown as AnyFunctionDescriptor, userData || {});
                value = typeof evaluatedValue === 'string' || typeof evaluatedValue === 'number' || typeof evaluatedValue === 'boolean' 
                    ? evaluatedValue 
                    : String(evaluatedValue);
            }
            return { field: where.field, operator: where.operator, value } as QueryCondition;
        }
        
        if ('operator' in where && 'conditions' in where) {
            return {
                operator: where.operator,
                conditions: where.conditions.map(cond => this.preprocessWhereClause(cond as QueryWhereClause, userData)).filter(c => c !== undefined) as (QueryCondition | QueryLogic)[]
            } as QueryLogic;
        }
        
        return undefined;
    }

    /**
     * Parse a template return clause into QueryEngine format
     */
    parseReturnClause(returnClause: QueryReturnClause): {
        queryReturn: string[];
        mapping: Record<string, string>;
    } {
        if (Array.isArray(returnClause)) {
            return { 
                queryReturn: returnClause, 
                mapping: Object.fromEntries(returnClause.map(field => [field, field])) 
            };
        } else if (typeof returnClause === 'object' && returnClause !== null) {
            // returnClause format: { "target.field.path": "source.field" }
            // mapping should be: { "source.field": "finalKeyPart" }
            // where finalKeyPart is the part after the last dot in target.field.path
            const mapping: Record<string, string> = {};
            const queryReturn: string[] = [];
            
            for (const [targetFieldPath, sourceField] of Object.entries(returnClause)) {
                if (typeof sourceField === 'string') {
                    queryReturn.push(sourceField);
                    // Extract the final key part (e.g., "process.devices.name" -> "name")
                    const finalKeyPart = targetFieldPath.split('.').pop() || targetFieldPath;
                    mapping[sourceField] = finalKeyPart;
                }
            }
            
            return { queryReturn, mapping };
        }
        
        return { queryReturn: [], mapping: {} };
    }

    /**
     * Extract return fields from return clause
     */
    extractReturnFields(returnClause: QueryReturnClause): string[] {
        if (Array.isArray(returnClause)) {
            return returnClause;
        } else if (typeof returnClause === 'object' && returnClause !== null) {
            return Object.values(returnClause).filter(v => typeof v === 'string') as string[];
        }
        return [];
    }

    /**
     * Check if a value is a function descriptor
     */
    private isFunctionDescriptor(value: unknown): boolean {
        return Boolean(value && typeof value === 'object' && 'type' in value && (value as Record<string, unknown>).type === 'function');
    }

    /**
     * Parse a string where clause
     */
    private parseWhereString(whereStr: string): QueryCondition {
        const operators = ['=', '!=', 'contains', 'exists', '>', '<', '>=', '<='];
        for (const op of operators) {
            if (whereStr.includes(` ${op} `)) {
                const [field, value] = whereStr.split(` ${op} `).map(s => s.trim());
                const cleanValue = value?.replace(/^['"]|['"]$/g, '');
                const operatorMap: Record<string, QueryCondition['operator']> = {
                    '=': 'is', 
                    '!=': 'not', 
                    'contains': 'contains', 
                    'exists': 'exists', 
                    '>': 'gt', 
                    '<': 'lt', 
                    '>=': 'gte', 
                    '<=': 'lte'
                };
                return { field, operator: operatorMap[op] || 'is', value: cleanValue };
            }
        }
        return { field: whereStr, operator: 'exists' };
    }
}
