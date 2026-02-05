/**
 * FunctionEvaluator - Safe function evaluation with dual syntax support.
 * 
 * This is a NEW evaluator separate from the legacy TemplateEvaluator.
 * Initially used ONLY for PathEvaluator (fileName/folderPath generation).
 * Once proven stable, TemplateEvaluator will be refactored to use this.
 * 
 * Supports two function syntaxes:
 * 1. Simple expressions: Explicit context specification
 * 2. Complex functions: Context inferred from arrow function parameters
 * 
 * @module FunctionEvaluator
 */

import { createLogger } from "../../utils/Logger";
import { ContextFactory, QueryDropdownContext, PostprocessorContext } from "./ContextProviders";
import type ElnPlugin from "../../main";
import type { FormData } from "../../types/forms";
import type {
    ContextType,
    SimpleFunctionDescriptor,
    ComplexFunctionDescriptor
} from "../../types/templates";

const logger = createLogger('template');

/**
 * Legacy function descriptor (deprecated, for backward compatibility)
 */
export interface LegacyFunctionDescriptor {
    type: "function";
    value: string;                    // Old format: "this.settings.value"
}

/**
 * Union type for all function descriptor formats
 */
export type EnhancedFunctionDescriptor = 
    | SimpleFunctionDescriptor 
    | ComplexFunctionDescriptor 
    | LegacyFunctionDescriptor;

/**
 * NEW function evaluator with safe context interfaces and dual syntax support.
 * Separate from legacy TemplateEvaluator to minimize risk during migration.
 * 
 * Initially used ONLY for PathEvaluator (fileName/folderPath generation).
 * Once proven stable, TemplateEvaluator will be refactored to use this (Phase 2).
 */
export class FunctionEvaluator {
    private contextFactory: ContextFactory;
    
    constructor(private plugin: ElnPlugin) {
        this.contextFactory = new ContextFactory(plugin);
        logger.debug('FunctionEvaluator initialized');
    }
    
    /**
     * Evaluate a function descriptor with user input context.
     * Supports both simple expressions and complex arrow functions.
     * 
     * @param descriptor Function descriptor (simple, complex, or legacy)
     * @param userInput User form data
     * @param noteType Optional note type for subclass context
     * @param inputValue Optional input value for callback functions (available as 'input' context)
     * @param queryDropdownContext Optional queryDropdown context (selection, frontmatter, file)
     * @returns Evaluated result
     * @throws Error if legacy format or evaluation fails
     */
    evaluateFunction(
        descriptor: EnhancedFunctionDescriptor,
        userInput: FormData,
        noteType?: string,
        inputValue?: unknown,
        queryDropdownContext?: QueryDropdownContext,
        postprocessorContext?: PostprocessorContext
    ): unknown {
        if (descriptor.type !== "function") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            throw new Error(`Invalid descriptor type: ${(descriptor as any).type}`);
        }
        
        // Type guard to distinguish between syntaxes
        if (this.isSimpleFunctionDescriptor(descriptor)) {
            return this.evaluateSimpleExpression(descriptor, userInput, noteType, inputValue, queryDropdownContext, postprocessorContext);
        } else if (this.isComplexFunctionDescriptor(descriptor)) {
            return this.evaluateComplexFunction(descriptor, userInput, noteType, inputValue, queryDropdownContext, postprocessorContext);
        } else {
            // Legacy format - reject with clear error
            logger.error('Legacy function descriptor detected:', descriptor);
            throw new Error(
                'Legacy function descriptors are not supported in FunctionEvaluator. ' +
                'Please migrate to new format: use "expression" for simple expressions ' +
                'or "function" for complex arrow functions.'
            );
        }
    }
    
    /**
     * Type guard for simple function descriptor (explicit context)
     */
    private isSimpleFunctionDescriptor(
        descriptor: EnhancedFunctionDescriptor
    ): descriptor is SimpleFunctionDescriptor {
        return 'expression' in descriptor && 'context' in descriptor;
    }
    
    /**
     * Type guard for complex function descriptor (inferred context)
     */
    private isComplexFunctionDescriptor(
        descriptor: EnhancedFunctionDescriptor
    ): descriptor is ComplexFunctionDescriptor {
        return 'function' in descriptor && !('expression' in descriptor) && !('value' in descriptor);
    }
    
    /**
     * Evaluate simple expression with explicit context specification.
     * 
     * Example:
     * {
     *   type: "function",
     *   context: ["settings", "userInput"],
     *   expression: "settings.operators[userInput.sample.operator].initials",
     *   reactiveDeps: ["sample.operator"],
     *   fallback: "unknown"
     * }
     * 
     * @param descriptor Simple function descriptor
     * @param userInput User form data
     * @param noteType Optional note type for subclass context
     * @param inputValue Optional input value for callback functions
     * @param queryDropdownContext Optional queryDropdown context
     * @param postprocessorContext Optional postprocessor context
     * @returns Evaluated result or fallback
     */
    private evaluateSimpleExpression(
        descriptor: SimpleFunctionDescriptor,
        userInput: FormData,
        noteType?: string,
        inputValue?: unknown,
        queryDropdownContext?: QueryDropdownContext,
        postprocessorContext?: PostprocessorContext
    ): unknown {
        logger.debug('Evaluating simple expression:', {
            expression: descriptor.expression,
            contexts: descriptor.context,
            reactiveDeps: descriptor.reactiveDeps
        });
        
        // Check reactive dependencies
        if (descriptor.reactiveDeps && !this.checkDependencies(descriptor.reactiveDeps, userInput)) {
            logger.debug('Dependencies not satisfied, using fallback:', {
                deps: descriptor.reactiveDeps,
                fallback: descriptor.fallback
            });
            return descriptor.fallback;
        }
        
        // Build context objects (safe interfaces)
        const contexts = this.buildContexts(descriptor.context, userInput, noteType, inputValue, queryDropdownContext, postprocessorContext);
        
        // Evaluate expression
        try {
            // Create function with context parameters
            const func = new Function(...descriptor.context, `return ${descriptor.expression}`);
            const args = descriptor.context.map(name => contexts[name]);
            const result = func(...args);
            
            logger.debug('Expression evaluated successfully:', { result });
            return result;
        } catch (error) {
            logger.error('Error evaluating expression:', {
                expression: descriptor.expression,
                error
            });
            return descriptor.fallback;
        }
    }
    
    /**
     * Evaluate complex arrow function with inferred context.
     * 
     * Example:
     * {
     *   type: "function",
     *   function: "({ userInput, settings }) => settings.operators[userInput.sample.operator].initials",
     *   reactiveDeps: ["sample.operator"],
     *   fallback: "unknown"
     * }
     * 
     * @param descriptor Complex function descriptor
     * @param userInput User form data
     * @param noteType Optional note type for subclass context
     * @param inputValue Optional input value for callback functions
     * @param queryDropdownContext Optional queryDropdown context
     * @param postprocessorContext Optional postprocessor context
     * @returns Evaluated result or fallback
     */
    private evaluateComplexFunction(
        descriptor: ComplexFunctionDescriptor,
        userInput: FormData,
        noteType?: string,
        inputValue?: unknown,
        queryDropdownContext?: QueryDropdownContext,
        postprocessorContext?: PostprocessorContext
    ): unknown {
        logger.debug('Evaluating complex function:', {
            function: descriptor.function.substring(0, 100), // Log first 100 chars
            reactiveDeps: descriptor.reactiveDeps
        });
        
        // Check reactive dependencies
        if (descriptor.reactiveDeps && !this.checkDependencies(descriptor.reactiveDeps, userInput)) {
            logger.debug('Dependencies not satisfied, using fallback:', {
                deps: descriptor.reactiveDeps,
                fallback: descriptor.fallback
            });
            return descriptor.fallback;
        }
        
        // Extract context names from function parameters
        const contextNames = this.extractContextNames(descriptor.function);
        logger.debug('Extracted context names:', contextNames);
        
        // Build context objects (safe interfaces)
        const contexts = this.buildContexts(contextNames, userInput, noteType, inputValue, queryDropdownContext, postprocessorContext);
        
        // Evaluate function
        try {
            // Create the arrow function from string
            const func = new Function('return (' + descriptor.function + ')')();
            
            // Build context object for destructuring parameter
            const contextObj = contextNames.reduce((obj, name) => {
                obj[name] = contexts[name];
                return obj;
            }, {} as Record<string, unknown>);
            
            const result = func(contextObj);
            logger.debug('Function evaluated successfully:', { result });
            return result;
        } catch (error) {
            logger.error('Error evaluating function:', {
                function: descriptor.function.substring(0, 100),
                error
            });
            return descriptor.fallback;
        }
    }
    
    /**
     * Extract context names from arrow function string.
     * Parses: "({ userInput, settings }) => ..." to ["userInput", "settings"]
     * 
     * Supports:
     * - Destructured parameters: ({ userInput, settings }) =>
     * - Single parameter with parens: (userInput) =>
     * - Single parameter no parens: userInput =>
     * 
     * @param functionStr Arrow function string
     * @returns Array of context names
     * @throws Error if cannot parse context names
     */
    private extractContextNames(functionStr: string): ContextType[] {
        // Match parameterless function: () =>
        const parameterlessMatch = functionStr.match(/^\s*\(\s*\)\s*=>/);
        if (parameterlessMatch) {
            return []; // No context needed
        }
        
        // Match destructured parameters: ({ userInput, settings }) =>
        const destructuredMatch = functionStr.match(/^\s*\(\s*\{\s*([^}]+)\s*\}\s*\)\s*=>/);
        if (destructuredMatch) {
            const names = destructuredMatch[1].split(',').map(s => s.trim());
            return this.validateContextNames(names);
        }
        
        // Match single parameter with parentheses: (userInput) =>
        const singleParenMatch = functionStr.match(/^\s*\(\s*(\w+)\s*\)\s*=>/);
        if (singleParenMatch) {
            return this.validateContextNames([singleParenMatch[1]]);
        }
        
        // Match single parameter without parentheses: userInput =>
        const noParenMatch = functionStr.match(/^\s*(\w+)\s*=>/);
        if (noParenMatch) {
            return this.validateContextNames([noParenMatch[1]]);
        }
        
        throw new Error(
            `Cannot parse context names from function: ${functionStr.substring(0, 100)}. ` +
            'Expected format: "() => ..." or "({ context1, context2 }) => ..." or "(context) => ..." or "context => ..."'
        );
    }
    
    /**
     * Validate that context names are valid ContextType values
     */
    private validateContextNames(names: string[]): ContextType[] {
        const validContexts: ContextType[] = [
            "userInput", "settings", "plugin", "noteMetadata", 
            "fs", "vault", "subclasses", "date", "input"
        ];
        
        for (const name of names) {
            if (!validContexts.includes(name as ContextType)) {
                throw new Error(
                    `Invalid context name: "${name}". ` +
                    `Valid contexts are: ${validContexts.join(', ')}`
                );
            }
        }
        
        return names as ContextType[];
    }
    
    /**
     * Check if all reactive dependencies are satisfied.
     * A dependency is satisfied if it exists, is not null, and is not empty string.
     * 
     * @param deps Array of dependency paths (dot notation)
     * @param userInput User form data
     * @returns True if all dependencies satisfied
     */
    private checkDependencies(deps: string[], userInput: FormData): boolean {
        return deps.every(dep => {
            const value = this.getNestedValue(userInput, dep);
            const satisfied = value !== undefined && value !== null && value !== '';
            
            if (!satisfied) {
                logger.debug(`Dependency not satisfied: ${dep}`, { value });
            }
            
            return satisfied;
        });
    }
    
    /**
     * Build context objects from context names.
     * Uses ContextFactory to create safe interfaces.
     * 
     * @param contextNames Array of context type names
     * @param userInput User form data
     * @param noteType Optional note type for subclass context
     * @param inputValue Optional input value for callback functions
     * @param queryDropdownContext Optional queryDropdown context
     * @param postprocessorContext Optional postprocessor context
     * @returns Record of context name to context object
     * @throws Error if unknown context type
     */
    private buildContexts(
        contextNames: ContextType[],
        userInput: FormData,
        noteType?: string,
        inputValue?: unknown,
        queryDropdownContext?: QueryDropdownContext,
        postprocessorContext?: PostprocessorContext
    ): Record<string, unknown> {
        const contexts: Record<string, unknown> = {};
        
        for (const name of contextNames) {
            switch (name) {
                case 'userInput':
                    contexts.userInput = userInput; // Direct reference, read-only in function
                    break;
                    
                case 'settings':
                    contexts.settings = this.contextFactory.createSettingsContext();
                    break;
                    
                case 'plugin':
                    contexts.plugin = this.contextFactory.createPluginContext();
                    break;
                    
                case 'fs':
                    contexts.fs = this.contextFactory.createFileSystemContext();
                    break;
                    
                case 'noteMetadata':
                    contexts.noteMetadata = this.contextFactory.createNoteMetadataContext();
                    break;
                    
                case 'vault':
                    contexts.vault = this.contextFactory.createVaultContext();
                    break;
                    
                case 'subclasses':
                    if (!noteType) {
                        logger.warn('Subclasses context requested but noteType not provided');
                        contexts.subclasses = this.contextFactory.createSubclassContext('');
                    } else {
                        contexts.subclasses = this.contextFactory.createSubclassContext(noteType);
                    }
                    break;
                    
                case 'date':
                    contexts.date = this.contextFactory.createDateContext();
                    break;
                    
                case 'input':
                    // Input value context for callback functions
                    // Provides the current field value being processed
                    contexts.input = inputValue;
                    break;
                    
                case 'queryDropdown':
                    // QueryDropdown context for accessing referenced note and selection
                    // Provides selection, frontmatter, and file metadata
                    if (!queryDropdownContext) {
                        logger.warn('QueryDropdown context requested but not provided');
                        contexts.queryDropdown = {
                            selection: null,
                            frontmatter: null,
                            file: null
                        };
                    } else {
                        contexts.queryDropdown = queryDropdownContext;
                    }
                    break;
                    
                case 'postprocessor':
                    // Postprocessor context for accessing resolved file paths
                    // Provides filename, folderPath, and fullPath after note creation
                    if (!postprocessorContext) {
                        // Debug level - this is expected during initial form evaluation
                        // The actual value will be set by NoteCreator after path resolution
                        logger.debug('Postprocessor context requested but not provided (expected during initial form evaluation)');
                        contexts.postprocessor = {
                            filename: '',
                            folderPath: '',
                            fullPath: ''
                        };
                    } else {
                        contexts.postprocessor = postprocessorContext;
                    }
                    break;
                    
                default:
                    logger.error(`Unknown context type: ${name}`);
                    throw new Error(`Unknown context type: ${name}`);
            }
        }
        
        return contexts;
    }
    
    /**
     * Get nested value from object using dot notation path.
     * 
     * @param obj Object to traverse
     * @param path Dot notation path (e.g., "sample.operator")
     * @returns Value at path or undefined if not found
     */
    private getNestedValue(obj: unknown, path: string): unknown {
        const parts = path.split('.');
        let current = obj;
        
        for (const part of parts) {
            if (current == null) {
                return undefined;
            }
            current = (current as Record<string, unknown>)[part];
        }
        
        return current;
    }
}
