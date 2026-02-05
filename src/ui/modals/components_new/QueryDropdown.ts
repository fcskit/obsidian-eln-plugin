import { App, DropdownComponent } from "obsidian";
import { LabeledInputBaseOptions, LabeledInputBase } from "./LabeledInputBase";
import { DropdownUIHelper } from "./DropdownUIHelper";
import { QueryEngine, SearchQuery, QueryCondition, QueryLogic } from "../../../search/QueryEngine";
import { QueryWhereClause, QueryReturnClause } from "../../../types/templates";
import { createLogger } from "../../../utils/Logger";

export interface QueryDropdownOptions extends LabeledInputBaseOptions<string | string[]> {
    app: App;
    search: string;
    where?: QueryWhereClause;
    return?: QueryReturnClause;
    multiselect?: boolean;
    onValueChange?: (value: string | string[], returnValues?: Record<string, unknown> | Record<string, unknown>[]) => void;
}

export interface QueryResult {
    file: { basename: string };
    returnValues?: Record<string, unknown>;
}

/**
 * Query-powered dropdown that searches the vault and provides options based on search results.
 * This is a standalone component (not extending LabeledDropdown) to avoid Obsidian dropdown limitations.
 */
export class QueryDropdown extends LabeledInputBase<string | string[]> {
    protected app: App;
    protected queryEngine: QueryEngine;
    protected search: string;
    protected where?: QueryWhereClause;
    protected returnClause?: QueryReturnClause;
    protected returnMapping: Record<string, string> = {};
    protected searchResults: QueryResult[] = [];
    protected queryOnValueChange?: (value: string | string[], returnValues?: Record<string, unknown> | Record<string, unknown>[]) => void;
    protected multiselect: boolean;
    protected dropdowns: DropdownComponent[] = [];
    protected addButton?: HTMLElement;
    protected initialDefaultValue?: string | string[];
    protected logger = createLogger('ui');

    constructor(options: QueryDropdownOptions) {
        const { app, search, where, return: returnClause, multiselect = false, onValueChange, ...baseOptions } = options;
        
        super(baseOptions);
        
        this.app = app;
        this.search = search;
        this.where = where;
        this.returnClause = returnClause;
        this.multiselect = multiselect;
        this.queryOnValueChange = onValueChange;
        this.initialDefaultValue = baseOptions.defaultValue;
        this.queryEngine = new QueryEngine(this.app);
        
        this.logger.debug('QueryDropdown constructor called:', {
            label: options.label,
            multiselect: this.multiselect,
            search: this.search
        });
        
        // Call createValueEditor to initialize the UI
        this.createValueEditor(baseOptions);
    }

    // Implement abstract method from LabeledInputBase
    protected createValueEditor(options: LabeledInputBaseOptions<string | string[]>): void {
        this.logger.debug('Creating query dropdown value editor:', {
            search: this.search,
            where: this.where,
            returnClause: this.returnClause,
            multiselect: this.multiselect
        });
        
        // Execute query to get options
        this.executeQuery();
        
        // Create dropdown UI with query results
        this.createDropdownUI();
    }

    protected executeQuery(): void {
        this.logger.debug('Executing query:', { search: this.search, where: this.where });
        
        try {
            // Build search query
            const query: SearchQuery = { tags: [this.search] };
            
            if (this.where) {
                const parsedWhere = this.parseWhereClause(this.where);
                if (parsedWhere) {
                    query.where = parsedWhere;
                }
            }
            
            // Handle return fields and mapping
            if (this.returnClause) {
                const parsed = this.parseReturnClause(this.returnClause);
                query.return = parsed.queryReturn;
                this.returnMapping = parsed.mapping;
            }
            
            this.logger.debug('Built query object:', query);
            
            // Execute search using QueryEngine
            const engineResults = this.queryEngine.search(query);
            
            this.logger.debug('QueryEngine raw results:', engineResults);
            
            // Convert to our format
            this.searchResults = engineResults.map(result => ({
                file: { basename: result.file.basename },
                returnValues: result.returnValues
            }));
            
            this.logger.debug('Query results:', {
                resultCount: this.searchResults.length,
                fileNames: this.searchResults.map(r => r.file.basename),
                searchResults: this.searchResults
            });
        } catch (error) {
            this.logger.warn('Query execution failed:', error);
            this.searchResults = [];
        }
    }

    protected createDropdownUI(): void {
        // Extract file names for dropdown options
        const options = this.searchResults.map(result => result.file.basename);
        
        this.logger.debug('Creating dropdown UI with options:', {
            optionsCount: options.length,
            options: options
        });
        
        // Always create a dropdown, even if empty
        if (this.multiselect) {
            this.createMultiSelectUI(options);
        } else {
            this.createSingleSelectUI(options);
        }
        
        // Add empty state message if no options found
        if (options.length === 0) {
            const emptyMessage = this.valueSection.createDiv({
                cls: "query-dropdown-empty-message",
                text: `No ${this.search} files found in vault`
            });
            emptyMessage.style.fontSize = "0.8em";
            emptyMessage.style.color = "var(--text-muted)";
            emptyMessage.style.marginTop = "4px";
        }
    }

    protected createSingleSelectUI(options: string[]): void {
        const dropdown = DropdownUIHelper.createSingleDropdown({
            container: this.valueSection,
            options,
            defaultValue: Array.isArray(this.getDefaultValue()) ? undefined : this.getDefaultValue() as string,
            onValueChange: (value) => {
                this.handleValueChange(value);
            }
        });
        
        this.dropdowns = [dropdown];
    }

    protected createMultiSelectUI(options: string[]): void {
        // Add multiselect class to value section for proper CSS styling
        this.valueSection.addClass("eln-modal-multiselect-container");
        
        const defaultValues = Array.isArray(this.getDefaultValue()) 
            ? this.getDefaultValue() as string[]
            : (this.getDefaultValue() ? [this.getDefaultValue() as string] : []);
        
        const multiSetup = DropdownUIHelper.createMultiDropdownSetup({
            container: this.valueSection,
            options,
            defaultValues,
            onValueChange: () => {
                const values = multiSetup.getSelectedValues();
                this.handleValueChange(values);
            }
        });
        
        this.dropdowns = multiSetup.dropdowns;
        this.addButton = multiSetup.addButton;
    }

    protected handleValueChange(value: string | string[]): void {
        this.logger.debug('QueryDropdown value changed:', { value });
        
        // Get return values for the selected files
        let returnValues: Record<string, unknown> | Record<string, unknown>[] | undefined;
        
        if (Array.isArray(value)) {
            // Multi-select: return array of return values
            const returnValuesList: Record<string, unknown>[] = [];
            for (const selectedValue of value) {
                const result = this.searchResults.find(r => r.file.basename === selectedValue);
                if (result?.returnValues && Object.keys(this.returnMapping).length > 0) {
                    const mappedReturnValues: Record<string, unknown> = {};
                    for (const [sourceField, targetField] of Object.entries(this.returnMapping)) {
                        if (result.returnValues[sourceField] !== undefined) {
                            mappedReturnValues[targetField] = result.returnValues[sourceField];
                        }
                    }
                    returnValuesList.push(mappedReturnValues);
                } else {
                    returnValuesList.push(result?.returnValues || {});
                }
            }
            returnValues = returnValuesList;
        } else {
            // Single select: return single return value object
            const result = this.searchResults.find(r => r.file.basename === value);
            if (result?.returnValues && Object.keys(this.returnMapping).length > 0) {
                const mappedReturnValues: Record<string, unknown> = {};
                for (const [sourceField, targetField] of Object.entries(this.returnMapping)) {
                    if (result.returnValues[sourceField] !== undefined) {
                        mappedReturnValues[targetField] = result.returnValues[sourceField];
                    }
                }
                returnValues = mappedReturnValues;
            } else {
                returnValues = result?.returnValues;
            }
        }
        
        this.logger.debug('QueryDropdown return values:', { returnValues, mapping: this.returnMapping });
        
        // Call the callback with both the selected value(s) and return values
        if (this.queryOnValueChange) {
            this.queryOnValueChange(value, returnValues);
        }
    }

    protected getDefaultValue(): string | string[] | undefined {
        // Get the default value from the options or empty array/string
        const defaultValue = this.initialDefaultValue;
        this.logger.debug('Getting default value:', { defaultValue, multiselect: this.multiselect });
        
        if (this.multiselect) {
            if (Array.isArray(defaultValue)) {
                return defaultValue;
            } else if (defaultValue) {
                return [String(defaultValue)];
            } else {
                return [];
            }
        } else {
            if (Array.isArray(defaultValue)) {
                return defaultValue.length > 0 ? String(defaultValue[0]) : "";
            } else {
                return defaultValue ? String(defaultValue) : "";
            }
        }
    }

    protected parseWhereClause(where: QueryWhereClause): QueryLogic | QueryCondition | QueryCondition[] | undefined {
        if (!where) return undefined;
        
        if (typeof where === 'string') {
            return this.parseWhereString(where);
        }
        
        if (Array.isArray(where)) {
            return where.map(cond => {
                const { field, ...ops } = cond;
                const op = Object.keys(ops)[0];
                const value = ops[op];
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
            return { field: where.field, operator: where.operator, value: where.value } as QueryCondition;
        }
        
        if ('operator' in where && 'conditions' in where) {
            return {
                operator: where.operator,
                conditions: where.conditions.map(cond => this.parseWhereClause(cond as QueryWhereClause)).filter(c => c !== undefined) as (QueryCondition | QueryLogic)[]
            } as QueryLogic;
        }
        
        return undefined;
    }

    protected parseWhereString(whereStr: string): QueryCondition {
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

    protected parseReturnClause(returnClause: QueryReturnClause): {
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
                queryReturn.push(sourceField);
                // Extract the final key part (e.g., "process.devices.name" -> "name")
                const finalKeyPart = targetFieldPath.split('.').pop() || targetFieldPath;
                mapping[sourceField] = finalKeyPart;
            }
            
            return { queryReturn, mapping };
        }
        
        return { queryReturn: [], mapping: {} };
    }

    /**
     * Public API methods
     */
    
    getValue(): string | string[] {
        if (this.multiselect) {
            return this.dropdowns.map(d => d.getValue()).filter(v => v);
        } else {
            return this.dropdowns[0]?.getValue() || "";
        }
    }

    setValue(value: string | string[]): void {
        // Re-execute query and rebuild if needed
        this.executeQuery();
        this.valueSection.empty();
        this.createDropdownUI();
        
        // Set the new value
        if (this.multiselect && Array.isArray(value)) {
            // For multiselect, we'd need to update the dropdowns appropriately
            this.logger.debug('Setting multiselect value:', value);
        } else if (!this.multiselect && typeof value === 'string') {
            if (this.dropdowns[0] && this.searchResults.some(r => r.file.basename === value)) {
                this.dropdowns[0].setValue(value);
            }
        }
    }
}
