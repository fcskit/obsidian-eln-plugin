/**
 * PathEvaluator - Evaluates PathTemplate segments to generate file names and folder paths
 * 
 * This is the new unified path evaluation system that replaces the legacy PathTemplateParser.
 * It supports four segment types:
 * - Literal: Static text
 * - Field: Extract values from userInput
 * - Function: Dynamic computation using FunctionEvaluator
 * - Counter: Auto-increment based on existing files
 * 
 * Phase 1.5 of the template system migration.
 */

import { TFolder } from "obsidian";
import { 
    PathTemplate, 
    PathSegment, 
    LiteralSegment, 
    FieldSegment, 
    FunctionSegment, 
    CounterSegment
} from "../../types/templates";
import { FunctionEvaluator } from "./FunctionEvaluator";
import { createLogger } from "../../utils/Logger";
import type ElnPlugin from "../../main";
import type { FormData } from "../../types/forms";

const logger = createLogger('path');

/**
 * Options for path evaluation
 */
export interface PathEvaluatorOptions {
    plugin: ElnPlugin;
    userInput: FormData;
    targetFolder?: string;  // Parent folder for counter resolution
    dateOffset?: string;    // Offset for date context (e.g., "+1d", "-2w")
    inheritedCounter?: string;  // Counter value inherited from folderPath evaluation
}

/**
 * Result of path evaluation
 */
export interface PathEvaluationResult {
    path: string;
    counterValue?: string;  // The counter value if a counter segment was evaluated
}

/**
 * Result of evaluating a single segment
 */
interface SegmentResult {
    value: string;
    separator: string;
    isCounter?: boolean;  // Flag to track if this was a counter segment
}

/**
 * PathEvaluator class - evaluates PathTemplate to generate file/folder paths
 */
export class PathEvaluator {
    private plugin: ElnPlugin;
    private functionEvaluator: FunctionEvaluator;

    constructor(plugin: ElnPlugin) {
        this.plugin = plugin;
        this.functionEvaluator = new FunctionEvaluator(plugin);
        
        logger.debug("PathEvaluator initialized");
    }

    /**
     * Evaluate a PathTemplate to generate a complete path
     * 
     * @param template - The PathTemplate with segments to evaluate
     * @param options - Evaluation options (userInput, targetFolder, etc.)
     * @returns Object with the evaluated path and counter value (if any)
     */
    async evaluatePath(
        template: PathTemplate,
        options: PathEvaluatorOptions
    ): Promise<PathEvaluationResult> {
        logger.debug("Evaluating path template", { 
            segmentCount: template.segments.length,
            hasUserInput: !!options.userInput,
            hasInheritedCounter: !!options.inheritedCounter,
            targetFolder: options.targetFolder
        });

        const results: SegmentResult[] = [];
        let accumulatedPrefix = '';  // Track prefix for counter segments (within same folder/filename)
        let accumulatedFolderPath = '';  // Track folder path (only segments with '/' separator)
        let counterValue: string | undefined;  // Track counter value for inheritance

        // Evaluate each segment
        for (const segment of template.segments) {
            try {
                // For counter segments, use accumulated folder path as targetFolder (without trailing slash)
                const segmentOptions = segment.kind === 'counter' 
                    ? { ...options, targetFolder: accumulatedFolderPath.replace(/\/$/, '') || options.targetFolder || '' }
                    : options;
                
                // Pass accumulated prefix to counter segments
                const result = await this.evaluateSegment(segment, segmentOptions, accumulatedPrefix);
                if (result.value) {  // Only include non-empty values
                    results.push(result);
                    
                    // Build accumulated folder path (only segments that end with '/')
                    // These represent actual folder boundaries in the path
                    if (result.separator === '/' && !result.isCounter) {
                        accumulatedFolderPath += result.value + result.separator;
                    }
                    
                    // Build prefix for counter (segments that DON'T end with '/')
                    // These are part of the folder/file name itself
                    if (!result.isCounter) {
                        if (result.separator !== '/') {
                            // Non-folder separators contribute to the prefix
                            accumulatedPrefix += result.value + result.separator;
                        } else {
                            // Folder separators reset the prefix
                            accumulatedPrefix = '';
                        }
                    } else {
                        // Counter resets the prefix
                        accumulatedPrefix = '';
                    }
                    
                    // Track counter value for potential inheritance
                    if (result.isCounter) {
                        counterValue = result.value;
                        logger.debug("Counter value captured for potential inheritance", { counterValue });
                    }
                }
            } catch (error) {
                logger.error(`Failed to evaluate segment`, { segment, error });
                // Continue with other segments even if one fails
            }
        }

        // Concatenate results with separators
        const path = results
            .map(r => r.value + r.separator)
            .join('')
            .trim();

        logger.debug("Path evaluation complete", { path, counterValue });
        return { path, counterValue };
    }

    /**
     * Evaluate a single path segment
     */
    private async evaluateSegment(
        segment: PathSegment,
        options: PathEvaluatorOptions,
        accumulatedPrefix: string = ''
    ): Promise<SegmentResult> {
        const separator = segment.separator ?? '';

        switch (segment.kind) {
            case 'literal':
                return this.evaluateLiteral(segment as LiteralSegment, separator);
            
            case 'field':
                return this.evaluateField(segment as FieldSegment, options, separator);
            
            case 'function':
                return await this.evaluateFunction(segment as FunctionSegment, options, separator);
            
            case 'counter':
                return await this.evaluateCounter(segment as CounterSegment, options, separator, accumulatedPrefix);
            
            default:
                logger.warn(`Unknown segment kind`, { segment });
                return { value: '', separator };
        }
    }

    /**
     * Evaluate a literal segment (static text)
     */
    private evaluateLiteral(
        segment: LiteralSegment,
        separator: string
    ): SegmentResult {
        logger.debug("Evaluating literal segment", { value: segment.value });
        return {
            value: segment.value,
            separator
        };
    }

    /**
     * Evaluate a field segment (extract from userInput)
     */
    private evaluateField(
        segment: FieldSegment,
        options: PathEvaluatorOptions,
        separator: string
    ): SegmentResult {
        logger.debug("Evaluating field segment", { path: segment.path });

        let value = this.getNestedValue(options.userInput, segment.path);

        // Apply transformation if specified
        if (value && segment.transform) {
            value = this.applyTransform(value, segment.transform);
        }

        return {
            value: value?.toString() ?? '',
            separator
        };
    }

    /**
     * Evaluate a function segment (dynamic computation)
     */
    private async evaluateFunction(
        segment: FunctionSegment,
        options: PathEvaluatorOptions,
        separator: string
    ): Promise<SegmentResult> {
        logger.debug("Evaluating function segment", { 
            hasContext: !!segment.context,
            hasExpression: !!segment.expression,
            hasFunction: !!segment.function 
        });

        try {
            // Build function descriptor for FunctionEvaluator
            let functionDescriptor;
            
            if (segment.context && segment.expression) {
                // Simple expression format
                functionDescriptor = {
                    type: "function" as const,
                    context: segment.context,
                    expression: segment.expression,
                    reactiveDeps: segment.reactiveDeps,
                    fallback: segment.fallback
                };
            } else if (segment.function) {
                // Complex function format
                functionDescriptor = {
                    type: "function" as const,
                    function: segment.function,
                    reactiveDeps: segment.reactiveDeps,
                    fallback: segment.fallback
                };
            } else {
                logger.error("Invalid function segment: missing both expression and function");
                return { value: '', separator };
            }

            const result = await this.functionEvaluator.evaluateFunction(
                functionDescriptor,
                options.userInput,
                options.dateOffset
            );

            logger.debug("Function evaluation result", { result });

            return {
                value: result?.toString() ?? '',
                separator
            };

        } catch (error) {
            logger.error("Function evaluation failed", { segment, error });
            
            // Use fallback if available
            if (segment.fallback !== undefined && segment.fallback !== null) {
                logger.debug("Using fallback after function error", { fallback: segment.fallback });
                return {
                    value: String(segment.fallback),
                    separator
                };
            }
            
            return { value: '', separator };
        }
    }

    /**
     * Evaluate a counter segment (auto-increment)
     */
    private async evaluateCounter(
        segment: CounterSegment,
        options: PathEvaluatorOptions,
        separator: string,
        accumulatedPrefix: string = ''
    ): Promise<SegmentResult> {
        logger.debug("Evaluating counter segment", { 
            prefix: segment.prefix,
            width: segment.width,
            accumulatedPrefix,
            inheritFrom: segment.inheritFrom,
            hasInheritedCounter: !!options.inheritedCounter
        });

        const width = segment.width ?? 2;

        // If inheritFrom is specified and we have an inherited counter, use it
        if (segment.inheritFrom === 'folderPath' && options.inheritedCounter) {
            logger.debug("Using inherited counter from folderPath", { 
                inheritedCounter: options.inheritedCounter 
            });
            
            return {
                value: options.inheritedCounter,
                separator,
                isCounter: true
            };
        }

        // Otherwise, compute the counter normally
        const targetFolder = options.targetFolder ?? '';
        // Use accumulated prefix from previous segments if segment.prefix is empty
        const prefix = segment.prefix || accumulatedPrefix;

        try {
            const counter = await this.getNextCounter(targetFolder, prefix, width);
            
            return {
                value: counter,
                separator,
                isCounter: true
            };
        } catch (error) {
            logger.error("Counter evaluation failed", { segment, error });
            
            // Return default counter on error
            const defaultCounter = '1'.padStart(width, '0');
            return {
                value: defaultCounter,
                separator,
                isCounter: true
            };
        }
    }

    /**
     * Get the next available counter value
     */
    private async getNextCounter(
        folderPath: string,
        prefix: string,
        width: number
    ): Promise<string> {
        const folder = this.plugin.app.vault.getAbstractFileByPath(folderPath);
        
        if (!folder || !(folder instanceof TFolder)) {
            logger.warn("Folder not found for counter", { folderPath });
            return '1'.padStart(width, '0');
        }

        // Get all files/folders in the target folder
        const existingNames = folder.children.map(child => child.name);
        
        logger.debug("Searching for counter matches", { 
            folderPath, 
            prefix, 
            existingCount: existingNames.length 
        });
        
        // Find the highest counter value with matching prefix
        // Pattern matches: prefix + digits + optional extension
        let maxCounter = 0;
        const pattern = prefix 
            ? new RegExp(`^${this.escapeRegex(prefix)}(\\d+)(?:\\.md)?$`) 
            : /^(\d+)(?:\.md)?$/;
        
        for (const name of existingNames) {
            const match = name.match(pattern);
            if (match) {
                const counter = parseInt(match[1], 10);
                logger.debug("Found counter match", { name, counter });
                if (!isNaN(counter) && counter > maxCounter) {
                    maxCounter = counter;
                }
            }
        }

        // Return next counter (incremented and padded)
        const nextCounter = maxCounter + 1;
        logger.debug("Next counter determined", { maxCounter, nextCounter, prefix });
        return nextCounter.toString().padStart(width, '0');
    }

    /**
     * Get nested value from object using dot notation path
     */
    private getNestedValue(obj: unknown, path: string): unknown {
        if (!obj || !path) return undefined;

        const keys = path.split('.');
        let current: unknown = obj;

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = (current as Record<string, unknown>)[key];
            } else {
                logger.debug(`Path not found in object`, { path, failedKey: key });
                return undefined;
            }
        }

        return current;
    }

    /**
     * Apply transformation to a value
     */
    private applyTransform(value: unknown, transform: string): unknown {
        const str = value?.toString() ?? '';

        switch (transform) {
            case 'uppercase':
                return str.toUpperCase();
            
            case 'lowercase':
                return str.toLowerCase();
            
            case 'capitalize':
                return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
            
            case 'kebab-case':
                return str
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            
            case 'snake-case':
                return str
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '_')
                    .replace(/^_+|_+$/g, '');
            
            default:
                logger.warn(`Unknown transform type`, { transform });
                return value;
        }
    }

    /**
     * Escape special regex characters
     */
    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
