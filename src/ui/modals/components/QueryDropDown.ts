import { App, DropdownComponent, TFile } from "obsidian";
import { QueryEngine, SearchQuery, QueryCondition, QueryLogic } from "../../../search/QueryEngine";
import { QueryWhereClause, QueryReturnClause, QueryConditionObject, QueryLogicObject } from "../../../types/templates";

export interface QueryDropDownOptions {
    container: HTMLElement;
    label: string;
    search: string;
    where?: QueryWhereClause;
    return?: QueryReturnClause;
    defaultValue?: string | (() => string); // Support both string and function defaults
    placeholder?: string; // Add placeholder support
    onChangeCallback?: (value: string, returnValues?: Record<string, unknown>) => void;
    isNested?: boolean; // Add hierarchical styling support
}

/**
 * Parse a simple where string like "sample.type = 'electrode'" into QueryCondition
 */
function parseWhereString(whereStr: string): QueryCondition {
    // Basic parsing for simple conditions like "field = 'value'" or "field contains 'value'"
    const operators = ['=', '!=', 'contains', 'exists', '>', '<', '>=', '<='];
    
    for (const op of operators) {
        if (whereStr.includes(` ${op} `)) {
            const [field, value] = whereStr.split(` ${op} `).map(s => s.trim());
            
            // Remove quotes from value if present
            const cleanValue = value?.replace(/^['"]|['"]$/g, '');
            
            // Map operators to QueryEngine format
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
                field: field,
                operator: operatorMap[op] || 'is',
                value: cleanValue
            };
        }
    }
    
    // Default fallback
    return {
        field: whereStr,
        operator: 'exists'
    };
}

/**
 * Parse a where clause into QueryEngine format
 */
function parseWhereClause(where: QueryWhereClause): QueryLogic | QueryCondition | QueryCondition[] | undefined {
    if (!where) return undefined;
    
    // Handle string format (backward compatibility)
    if (typeof where === 'string') {
        return parseWhereString(where);
    }
    
    // Handle legacy array format
    if (Array.isArray(where)) {
        return where.map(cond => {
            const { field, ...ops } = cond;
            const op = Object.keys(ops)[0];
            const value = ops[op];
            
            const operatorMap: Record<string, QueryCondition['operator']> = {
                'is': 'is',
                'contains': 'contains'
            };
            
            return {
                field: field,
                operator: operatorMap[op] || 'is',
                value: value
            } as QueryCondition;
        });
    }
    
    // Handle new object format
    if ('field' in where) {
        // Single condition
        return {
            field: where.field,
            operator: where.operator,
            value: where.value
        } as QueryCondition;
    }
    
    if ('operator' in where && 'conditions' in where) {
        // Logic object
        return {
            operator: where.operator,
            conditions: where.conditions.map(cond => parseWhereClause(cond as QueryWhereClause))
                .filter(c => c !== undefined) as (QueryCondition | QueryLogic)[]
        } as QueryLogic;
    }
    
    return undefined;
}

/**
 * Parse return clause and prepare for mapping
 */
function parseReturnClause(returnClause: QueryReturnClause): { 
    queryReturn: string[], 
    mapping: Record<string, string> 
} {
    if (Array.isArray(returnClause)) {
        // Simple array format - no mapping needed
        return {
            queryReturn: returnClause,
            mapping: Object.fromEntries(returnClause.map(field => [field, field]))
        };
    } else {
        // Mapping object format - extract source fields (values) for QueryEngine
        // and keep the full mapping for later transformation
        return {
            queryReturn: Object.values(returnClause),
            mapping: returnClause
        };
    }
}

export class QueryDropDown {
    private app: App;
    private wrapper: HTMLElement;
    private dropdown: DropdownComponent;
    private queryEngine: QueryEngine;

    constructor(app: App, options: QueryDropDownOptions) {
        this.app = app;
        this.queryEngine = new QueryEngine(app);
        const { 
            container, 
            label, 
            search, 
            where, 
            return: returnFields, 
            defaultValue, 
            placeholder, 
            isNested = false, 
            onChangeCallback = (value) => value 
        } = options;

        console.debug("QueryDropDown: Initializing with options:", options);
        
        if (isNested) {
            // Use simple styling for nested contexts
            this.wrapper = container.createDiv({ cls: "eln-simple-input" });
            this.wrapper.createEl("label", { cls: "eln-simple-label", text: label });
            this.dropdown = new DropdownComponent(this.wrapper);
            this.dropdown.selectEl.addClass("eln-simple-field");
        } else {
            // Use enhanced styling for top-level contexts
            this.wrapper = container.createDiv({ cls: "eln-input-wrapper" });
            
            // Create header with label
            const header = this.wrapper.createDiv({ cls: "eln-input-header" });
            header.createDiv({ cls: "eln-input-label", text: label });
            
            // Create content container
            const content = this.wrapper.createDiv({ cls: "eln-input-content" });
            this.dropdown = new DropdownComponent(content);
        }

        // Add placeholder option if provided
        if (placeholder) {
            this.dropdown.addOption("", placeholder);
        }

        // Build search query
        const query: SearchQuery = {
            tags: [search]
        };

        // Handle where conditions
        if (where) {
            query.where = parseWhereClause(where);
        }

        // Handle return fields and mapping
        let returnMapping: Record<string, string> = {};
        if (returnFields) {
            const parsed = parseReturnClause(returnFields);
            query.return = parsed.queryReturn;
            returnMapping = parsed.mapping;
        }

        // Execute search using QueryEngine
        const searchResults = this.queryEngine.search(query);
        const files = searchResults.map(result => result.file);
        
        if (files.length > 0) {
            const fileNames = files.map(file => file.basename);
            this.dropdown.addOptions(
                Object.fromEntries(fileNames.map((name) => [name, name]))
            );
            console.debug("QueryDropDown: Populated dropdown with files:", fileNames);
            
            // Determine the best default value with robust validation
            let selectedValue: string;
            
            // Evaluate defaultValue if it's a function
            let evaluatedDefault: string | undefined;
            if (typeof defaultValue === "function") {
                try {
                    evaluatedDefault = defaultValue();
                    console.debug("QueryDropDown: Evaluated function default to:", evaluatedDefault);
                } catch (error) {
                    console.warn("QueryDropDown: Error evaluating default value function:", error);
                    evaluatedDefault = undefined;
                }
            } else {
                evaluatedDefault = defaultValue;
            }
            
            if (evaluatedDefault && fileNames.includes(evaluatedDefault)) {
                // Use evaluated default if it exists in the options
                selectedValue = evaluatedDefault;
                console.debug("QueryDropDown: Using evaluated default value:", evaluatedDefault);
            } else {
                // Fallback to first item in the list
                selectedValue = fileNames[0];
                if (evaluatedDefault) {
                    console.warn(`QueryDropDown: Evaluated default value "${evaluatedDefault}" not found in options. Using first item: "${selectedValue}"`);
                } else {
                    console.debug("QueryDropDown: No default specified, using first item:", selectedValue);
                }
            }
            
            this.dropdown.setValue(selectedValue);
            
            // Find return values for the selected default and apply mapping
            const defaultResult = searchResults.find(result => result.file.basename === selectedValue);
            
            if (defaultResult?.returnValues && Object.keys(returnMapping).length > 0) {
                // Apply return value mapping
                const mappedReturnValues: Record<string, unknown> = {};
                for (const [targetField, sourceField] of Object.entries(returnMapping)) {
                    if (defaultResult.returnValues[sourceField] !== undefined) {
                        mappedReturnValues[targetField] = defaultResult.returnValues[sourceField];
                    }
                }
                onChangeCallback(selectedValue, mappedReturnValues);
            } else {
                // No mapping needed or no return values
                onChangeCallback(selectedValue, defaultResult?.returnValues);
            }
        }

        // Register the onChange callback with proper return value mapping
        this.dropdown.onChange((value) => {
            // Find the selected file and its return values
            const selectedResult = searchResults.find(result => result.file.basename === value);
            
            if (selectedResult?.returnValues && Object.keys(returnMapping).length > 0) {
                // Apply return value mapping
                const mappedReturnValues: Record<string, unknown> = {};
                for (const [targetField, sourceField] of Object.entries(returnMapping)) {
                    if (selectedResult.returnValues[sourceField] !== undefined) {
                        mappedReturnValues[targetField] = selectedResult.returnValues[sourceField];
                    }
                }
                onChangeCallback(value, mappedReturnValues);
            } else {
                // No mapping needed or no return values
                onChangeCallback(value, selectedResult?.returnValues);
            }
        });
    }
}