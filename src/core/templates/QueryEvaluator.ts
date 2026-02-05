/**
 * QueryEvaluator - Template query evaluation
 * 
 * This module handles evaluation of query clauses in metadata templates.
 * Extracted from TemplateEvaluator in Phase 2.1b for better separation of concerns.
 * 
 * Query evaluation is separate from function evaluation and deserves its own module.
 * This handles the complex logic of:
 * - WHERE clause parsing and evaluation
 * - RETURN clause field extraction
 * - Search query building
 * - Result processing
 * - Function descriptor evaluation in query values
 * 
 * Phase 2 Migration Status:
 * - Phase 2.1b: ✅ Extracted into this file
 * - Phase 2.2: Will be used by TemplateEvaluator
 * - Phase 2.3+: Permanent module (not deleted)
 */

import { QueryWhereClause, QueryReturnClause } from "../../types/templates";
import { QueryEngine, SearchQuery, QueryCondition, QueryLogic, SearchResult } from "../../search/QueryEngine";
import type { FormData, AnyFunctionDescriptor } from "../../types";
import { createLogger } from "../../utils/Logger";

const logger = createLogger('template');

/**
 * QueryEvaluator - Handles template query evaluation
 * 
 * This class processes WHERE and RETURN clauses in metadata templates,
 * converting them into QueryEngine queries and processing results.
 */
export class QueryEvaluator {
    private queryEngine: QueryEngine;
    private functionEvaluator?: (descriptor: AnyFunctionDescriptor, userData: FormData) => unknown;
    
    constructor(queryEngine: QueryEngine) {
        this.queryEngine = queryEngine;
    }
    
    /**
     * Set the function evaluator for evaluating function descriptors in queries.
     * This is injected to avoid circular dependencies.
     * 
     * @param evaluator - Function that evaluates function descriptors
     */
    setFunctionEvaluator(evaluator: (descriptor: AnyFunctionDescriptor, userData: FormData) => unknown): void {
        this.functionEvaluator = evaluator;
    }
    
    /**
     * Execute a template query and return results with mapping
     * 
     * @param config - Query configuration with search, where, return, and userData
     * @returns Results and field mapping
     */
    executeTemplateQuery(config: {
        search?: string;
        where?: QueryWhereClause;
        return?: QueryReturnClause;
        userData?: FormData;
    }): { results: SearchResult[]; mapping: Record<string, string> } {
        logger.debug('[QueryEvaluator] Executing template query:', config);
        
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
        
        logger.debug('[QueryEvaluator] Query executed:', {
            resultCount: results.length,
            mapping
        });
        
        return { results, mapping };
    }

    /**
     * Preprocess where clause by evaluating function descriptors
     * 
     * WHERE clauses can contain:
     * - String format: "field = value"
     * - Array format: [{ field: "...", is: "..." }, ...]
     * - Single condition: { field: "...", operator: "...", value: "..." }
     * - Logical operator: { operator: "AND", conditions: [...] }
     * 
     * Function descriptors in values are evaluated before query execution.
     * 
     * @param where - WHERE clause to preprocess
     * @param userData - User data for function evaluation
     * @returns Processed WHERE clause in QueryEngine format
     */
    preprocessWhereClause(
        where: QueryWhereClause, 
        userData?: FormData
    ): QueryLogic | QueryCondition | QueryCondition[] | undefined {
        if (!where) return undefined;
        
        // Handle string format: "field = value"
        if (typeof where === 'string') {
            return this.parseWhereString(where);
        }
        
        // Handle array format: [{ field: "...", is: "..." }, ...]
        if (Array.isArray(where)) {
            return where.map(cond => {
                const { field, ...ops } = cond;
                const op = Object.keys(ops)[0];
                let value: string | number | boolean = ops[op];
                
                // Check if value is a function descriptor that needs evaluation
                if (this.isFunctionDescriptor(value)) {
                    const evaluatedValue = this.evaluateFunctionDescriptor(
                        value as unknown as AnyFunctionDescriptor, 
                        userData || {}
                    );
                    value = typeof evaluatedValue === 'string' || 
                            typeof evaluatedValue === 'number' || 
                            typeof evaluatedValue === 'boolean' 
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
        
        // Handle single condition: { field: "...", operator: "...", value: "..." }
        if ('field' in where) {
            let value = where.value;
            
            // Check if value is a function descriptor that needs evaluation
            if (this.isFunctionDescriptor(value)) {
                const evaluatedValue = this.evaluateFunctionDescriptor(
                    value as unknown as AnyFunctionDescriptor, 
                    userData || {}
                );
                value = typeof evaluatedValue === 'string' || 
                        typeof evaluatedValue === 'number' || 
                        typeof evaluatedValue === 'boolean' 
                    ? evaluatedValue 
                    : String(evaluatedValue);
            }
            
            return { field: where.field, operator: where.operator, value } as QueryCondition;
        }
        
        // Handle logical operator: { operator: "AND", conditions: [...] }
        if ('operator' in where && 'conditions' in where) {
            return {
                operator: where.operator,
                conditions: where.conditions
                    .map(cond => this.preprocessWhereClause(cond as QueryWhereClause, userData))
                    .filter(c => c !== undefined) as (QueryCondition | QueryLogic)[]
            } as QueryLogic;
        }
        
        return undefined;
    }

    /**
     * Parse a template return clause into QueryEngine format
     * 
     * RETURN clauses can be:
     * - Array format: ["field1", "field2"]
     * - Object format: { "target.path": "source.field" }
     * 
     * @param returnClause - RETURN clause to parse
     * @returns Query return fields and field mapping
     */
    parseReturnClause(returnClause: QueryReturnClause): {
        queryReturn: string[];
        mapping: Record<string, string>;
    } {
        // Handle array format: ["field1", "field2"]
        if (Array.isArray(returnClause)) {
            return { 
                queryReturn: returnClause, 
                mapping: Object.fromEntries(returnClause.map(field => [field, field])) 
            };
        }
        
        // Handle object format: { "target.field.path": "source.field" }
        if (typeof returnClause === 'object' && returnClause !== null) {
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
     * 
     * Extracts just the field names from a RETURN clause,
     * ignoring any mapping information.
     * 
     * @param returnClause - RETURN clause to extract from
     * @returns Array of field names to return
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
     * Parse a string where clause
     * 
     * Converts string format WHERE clauses to QueryCondition format.
     * 
     * Supported operators:
     * - "field = value" → { field, operator: 'is', value }
     * - "field != value" → { field, operator: 'not', value }
     * - "field contains value" → { field, operator: 'contains', value }
     * - "field exists" → { field, operator: 'exists' }
     * - "field > value" → { field, operator: 'gt', value }
     * - "field < value" → { field, operator: 'lt', value }
     * - "field >= value" → { field, operator: 'gte', value }
     * - "field <= value" → { field, operator: 'lte', value }
     * 
     * @param whereStr - String WHERE clause
     * @returns Parsed query condition
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
                
                return { 
                    field, 
                    operator: operatorMap[op] || 'is', 
                    value: cleanValue 
                };
            }
        }
        
        // No operator found - assume "exists"
        return { field: whereStr, operator: 'exists' };
    }
    
    /**
     * Check if a value is a function descriptor
     * 
     * @param value - Value to check
     * @returns True if value is a function descriptor
     */
    private isFunctionDescriptor(value: unknown): boolean {
        return Boolean(
            value && 
            typeof value === 'object' && 
            'type' in value && 
            (value as Record<string, unknown>).type === 'function'
        );
    }
    
    /**
     * Evaluate a function descriptor
     * 
     * Uses the injected function evaluator to evaluate function descriptors.
     * If no evaluator is set, logs a warning and returns undefined.
     * 
     * @param descriptor - Function descriptor to evaluate
     * @param userData - User data for evaluation context
     * @returns Evaluated result
     */
    private evaluateFunctionDescriptor(
        descriptor: AnyFunctionDescriptor, 
        userData: FormData
    ): unknown {
        if (!this.functionEvaluator) {
            logger.warn('[QueryEvaluator] Function evaluator not set. Cannot evaluate function descriptor in query.');
            return undefined;
        }
        
        try {
            return this.functionEvaluator(descriptor, userData);
        } catch (error) {
            logger.error('[QueryEvaluator] Error evaluating function descriptor in query:', error);
            return undefined;
        }
    }
}
