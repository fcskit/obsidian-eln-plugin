/**
 * FunctionEvaluatorLegacy - Legacy function evaluation
 * 
 * @deprecated DO NOT USE FOR NEW CODE
 * 
 * This module contains the OLD function evaluation logic extracted from TemplateEvaluator.
 * It is maintained ONLY for backward compatibility during the Phase 2 migration period.
 * 
 * All new code should use FunctionEvaluator from FunctionEvaluator.ts instead.
 * 
 * This module will be DELETED in Phase 2.4 after all metadata templates are migrated.
 * 
 * ⚠️ WARNING: This code uses UNSAFE evaluation with full plugin context access.
 * It exposes the entire plugin instance and settings, which is a security risk.
 * 
 * Phase 2 Migration Status:
 * - Phase 2.1a: ✅ Extracted into this file
 * - Phase 2.2: Will be used by TemplateEvaluator for legacy templates
 * - Phase 2.3: Templates will be migrated away from this
 * - Phase 2.4: This file will be DELETED
 */

import type { FunctionDescriptor, EnhancedFunctionDescriptor, AnyFunctionDescriptor } from "../../types";
import type { FormData } from "../../types";
import { createLogger } from "../../utils/Logger";
import type ElnPlugin from "../../main";

const logger = createLogger('template');

/**
 * @deprecated Legacy function evaluator - DO NOT USE FOR NEW CODE
 * 
 * This class evaluates function descriptors using the old unsafe format.
 * Use FunctionEvaluator instead for all new code.
 */
export class FunctionEvaluatorLegacy {
    
    /**
     * Evaluates a legacy function descriptor (old format with 'value' field)
     * 
     * @deprecated Use FunctionEvaluator instead
     * 
     * Legacy format:
     * ```typescript
     * {
     *     type: "function",
     *     value: "this.settings.operators[this.userInput.sample.operator].initials"
     * }
     * ```
     * 
     * ⚠️ WARNING: Uses unsafe `this` context that exposes full plugin instance
     */
    static evaluateFunctionDescriptor(descriptor: FunctionDescriptor, context?: object, fieldName?: string): unknown {
        const fieldInfo = fieldName ? ` for field "${fieldName}"` : '';
        logger.warn(`[LEGACY] Using deprecated legacy function evaluator${fieldInfo}. Please migrate to FunctionEvaluator.`);
        
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
            logger.error("[LEGACY] Error evaluating legacy function descriptor:", error);
            return null;
        }
    }
    
    /**
     * Evaluates enhanced function descriptor (transitional format)
     * 
     * @deprecated Use FunctionEvaluator instead
     * 
     * Enhanced format (transitional):
     * ```typescript
     * {
     *     type: "function",
     *     context: ["userInput", "settings"],
     *     function: "({ userInput, settings }) => settings.operators[userInput.sample.operator].initials",
     *     reactiveDeps: ["sample.operator"],
     *     fallback: ""
     * }
     * ```
     * 
     * ⚠️ WARNING: Exposes full plugin.settings and plugin instance (unsafe)
     */
    static evaluateEnhancedFunction(
        descriptor: EnhancedFunctionDescriptor,
        userData: FormData,
        plugin: ElnPlugin
    ): unknown {
        logger.warn('[LEGACY] Using deprecated enhanced function evaluator. Please migrate to FunctionEvaluator.');
        
        try {
            // Log the function evaluation attempt
            logger.debug(`[LEGACY:evaluateEnhancedFunction] Evaluating function:`, {
                function: descriptor.function,
                contextKeys: descriptor.context,
                dependencies: descriptor.reactiveDeps
            });

            // Check if all reactive dependencies are satisfied (if any)
            const reactiveDeps = descriptor.reactiveDeps || [];
            const dependencyCheck = reactiveDeps.map(dep => {
                const depValue = getNestedValue(userData, dep);
                const satisfied = depValue !== undefined && depValue !== null && depValue !== '';
                logger.debug(`[LEGACY:evaluateEnhancedFunction] Dependency check for '${dep}':`, {
                    dependency: dep,
                    value: depValue,
                    satisfied: satisfied
                });
                return satisfied;
            });
            
            const allDependenciesSatisfied = dependencyCheck.every(satisfied => satisfied);

            if (reactiveDeps.length > 0 && !allDependenciesSatisfied) {
                logger.debug(`[LEGACY:evaluateEnhancedFunction] Dependencies not satisfied, using fallback:`, {
                    dependencies: reactiveDeps,
                    fallback: descriptor.fallback
                });
                return descriptor.fallback;
            }

            // Build the context object based on requested contexts
            // ⚠️ WARNING: This exposes full plugin instance and settings (UNSAFE)
            const contextObject: Record<string, unknown> = {};
            
            for (const contextType of descriptor.context) {
                switch (contextType) {
                    case 'userInput':
                        contextObject.userInput = userData;
                        break;
                    case 'settings':
                        contextObject.settings = plugin.settings;  // ⚠️ UNSAFE - exposes full settings
                        break;
                    case 'plugin':
                        contextObject.plugin = plugin;  // ⚠️ UNSAFE - exposes full plugin
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
                        logger.warn(`[LEGACY] Unknown context type: ${contextType}`);
                }
            }

            // Evaluate the function with the built context
            const functionCode = descriptor.function;
            
            logger.debug(`[LEGACY:evaluateEnhancedFunction] Executing function:`, {
                function: functionCode,
                contextKeys: Object.keys(contextObject)
            });

            // Create and execute the function directly with the context object
            const fn = new Function(`return ${functionCode}`)();
            const result = fn(contextObject);
            
            logger.debug(`[LEGACY:evaluateEnhancedFunction] Function execution completed:`, {
                result: result,
                resultType: typeof result
            });

            return result;

        } catch (error) {
            logger.error(`[LEGACY:evaluateEnhancedFunction] Error evaluating enhanced function:`, error);
            return descriptor.fallback;
        }
    }
    
    /**
     * Checks if a descriptor is in legacy format (has 'value' field)
     */
    static isLegacyFormat(descriptor: unknown): descriptor is FunctionDescriptor {
        return typeof descriptor === 'object' 
            && descriptor !== null 
            && 'type' in descriptor 
            && (descriptor as Record<string, unknown>).type === 'function'
            && 'value' in descriptor 
            && typeof (descriptor as Record<string, unknown>).value === 'string'
            && !('context' in descriptor)  // Not enhanced format
            && !('function' in descriptor); // Not enhanced format
    }
    
    /**
     * Checks if a descriptor is in enhanced (transitional) format
     */
    static isEnhancedFormat(descriptor: unknown): descriptor is EnhancedFunctionDescriptor {
        return typeof descriptor === 'object'
            && descriptor !== null
            && 'type' in descriptor
            && (descriptor as Record<string, unknown>).type === 'function'
            && 'function' in descriptor
            && 'context' in descriptor
            && !('expression' in descriptor); // Not new format (which has 'expression')
    }
    
    /**
     * Checks if ANY function descriptor (legacy or enhanced) has reactive dependencies
     */
    static hasReactiveDependencies(descriptor: AnyFunctionDescriptor): boolean {
        if ('reactiveDeps' in descriptor && descriptor.reactiveDeps) {
            // Enhanced format with reactiveDeps
            return !!(descriptor.reactiveDeps && descriptor.reactiveDeps.length > 0);
        } else if ('userInputs' in descriptor && (descriptor as FunctionDescriptor).userInputs) {
            // Legacy format with userInputs
            return !!((descriptor as FunctionDescriptor).userInputs && 
                   (descriptor as FunctionDescriptor).userInputs!.length > 0);
        }
        return false;
    }
    
    /**
     * Checks if a value is a function descriptor (any format)
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
        
        // Check for enhanced format (has 'context', 'function' properties)
        if ('context' in value && 'function' in value) {
            return true;
        }
        
        // Check for NEW SimpleFunctionDescriptor format (has 'context', 'expression' properties)
        if ('context' in value && 'expression' in value) {
            return true;
        }
        
        return false;
    }
}

/**
 * Helper to get nested value from object using dot notation
 */
function getNestedValue(obj: unknown, path: string): unknown {
    if (!obj || typeof obj !== 'object') {
        return undefined;
    }
    
    const parts = path.split('.');
    let current: unknown = obj;
    
    for (const part of parts) {
        if (current == null) {
            return undefined;
        }
        if (typeof current === 'object' && part in current) {
            current = (current as Record<string, unknown>)[part];
        } else {
            return undefined;
        }
    }
    
    return current;
}
