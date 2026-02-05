import type { FunctionDescriptor } from "../../types";
import type { 
    MetaDataTemplateProcessed, 
    MetaDataTemplateFieldProcessed,
    FormData,
    JSONObject
} from "../../types";
import type ElnPlugin from "../../main";

/**
 * Handles evaluation of function descriptors and dynamic fields in templates
 */
export class TemplateEvaluator {
    private plugin: ElnPlugin;

    constructor(plugin: ElnPlugin) {
        this.plugin = plugin;
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
        console.warn(`Legacy string-based function evaluation is deprecated. Please use function descriptors instead. Field: ${field}`);
        
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
    evaluateUserInputFunction(descriptor: FunctionDescriptor, userData: FormData): unknown {
        if (descriptor.type !== "function") {
            throw new Error("Invalid function descriptor type");
        }

        try {
            // Create a context object that includes user data as nested properties
            // Keep the nested structure intact so that code like "chemical.type" works
            const context = {
                ...this.plugin,
                ...userData  // This preserves the nested structure of userData
            };
            
            // Use the existing evaluation function with the enhanced context
            return TemplateEvaluator.evaluateFunctionDescriptor(descriptor, context);
        } catch (error) {
            console.error("Error evaluating user input function:", error);
            throw error;
        }
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
                        console.log(`Processing callback function descriptor for key "${key}":`, templateField.callback);
                        templateField.callback = TemplateEvaluator.evaluateFunctionDescriptor(templateField.callback, this.plugin) as typeof templateField.callback;
                        if (typeof templateField.callback !== "function") {
                            console.warn(`Callback for key "${key}" did not evaluate to a valid function.`, templateField.callback);
                        }
                    } else if (typeof templateField.callback === "string" && this.isInlineFunction(templateField.callback)) {
                        // Handle legacy string-based functions (only if they look like actual functions)
                        console.log(`Processing legacy callback string for key "${key}":`, templateField.callback);
                        templateField.callback = this.evaluateDynamicField(templateField.callback) as typeof templateField.callback;
                        if (typeof templateField.callback !== "function") {
                            console.warn(`Callback for key "${key}" is not a valid function.`, templateField.callback);
                        }
                    }
                    
                    if (TemplateEvaluator.isFunctionDescriptor(templateField.action)) {
                        console.log(`Processing action function descriptor for key "${key}":`, templateField.action);
                        templateField.action = TemplateEvaluator.evaluateFunctionDescriptor(templateField.action, this.plugin) as typeof templateField.action;
                        if (typeof templateField.action !== "function") {
                            console.warn(`Action for key "${key}" did not evaluate to a valid function.`, templateField.action);
                        }
                    } else if (typeof templateField.action === "string" && this.isInlineFunction(templateField.action)) {
                        // Handle legacy string-based functions (only if they look like actual functions)
                        console.log(`Processing legacy action string for key "${key}":`, templateField.action);
                        templateField.action = this.evaluateDynamicField(templateField.action) as typeof templateField.action;
                        if (typeof templateField.action !== "function") {
                            console.warn(`Action for key "${key}" is not a valid function.`, templateField.action);
                        }
                    }
                    
                    if (TemplateEvaluator.isFunctionDescriptor(templateField.default)) {
                        // Only evaluate non-reactive function descriptors during initialization
                        if (!templateField.default.userInputs || templateField.default.userInputs.length === 0) {
                            templateField.default = TemplateEvaluator.evaluateFunctionDescriptor(templateField.default, this.plugin) as typeof templateField.default;
                        }
                        // Reactive function descriptors are kept as-is and evaluated when dependencies change
                    } else if (typeof templateField.default === "string" && this.isInlineFunction(templateField.default)) {
                        // Handle legacy string-based functions (only if they look like actual functions)
                        templateField.default = this.evaluateDynamicField(templateField.default) as typeof templateField.default;
                    }
                    
                    if (TemplateEvaluator.isFunctionDescriptor(templateField.options)) {
                        // Only evaluate non-reactive function descriptors during initialization
                        if (!templateField.options.userInputs || templateField.options.userInputs.length === 0) {
                            templateField.options = TemplateEvaluator.evaluateFunctionDescriptor(templateField.options, this.plugin) as typeof templateField.options;
                        }
                        // Reactive function descriptors are kept as-is and evaluated when dependencies change
                    } else if (typeof templateField.options === "string" && this.isInlineFunction(templateField.options)) {
                        // Handle legacy string-based functions (only if they look like actual functions)
                        templateField.options = this.evaluateDynamicField(templateField.options) as typeof templateField.options;
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
                if (value.userInputs && value.userInputs.includes(changedFieldPath)) {
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Evaluates a field's default value with the given context
     * @param field The field to evaluate
     * @param userData The user data context
     * @returns The evaluated default value
     */
    evaluateFieldDefault(field: MetaDataTemplateFieldProcessed, userData: FormData): unknown {
        if (TemplateEvaluator.isFunctionDescriptor(field.default)) {
            // Handle function descriptor defaults
            if (field.default.userInputs && field.default.userInputs.length > 0) {
                // For reactive functions, use evaluateUserInputFunction with current user data
                return this.evaluateUserInputFunction(field.default, userData);
            } else {
                // For non-reactive functions, evaluate normally
                const func = TemplateEvaluator.evaluateFunctionDescriptor(field.default, this.plugin);
                return typeof func === "function" ? func(userData as JSONObject) : func;
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
     * Helper function to check if a value is a function descriptor
     */
    static isFunctionDescriptor(value: unknown): value is FunctionDescriptor {
        return (
            typeof value === 'object' &&
            value !== null &&
            'type' in value &&
            'value' in value &&
            (value as FunctionDescriptor).type === 'function' &&
            typeof (value as FunctionDescriptor).value === 'string'
        );
    }

    /**
     * Helper function to evaluate a function descriptor safely
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
            console.error("Error evaluating function descriptor:", error);
            return null;
        }
    }
}
