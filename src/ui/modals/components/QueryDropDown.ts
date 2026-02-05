import { App, DropdownComponent, TFile } from "obsidian";
import { LabeledInputBaseOptions, LabeledInputBase } from "./LabeledInputBase";
import { DropdownUIHelper } from "../utils/DropdownUIHelper";
import { QueryCondition, QueryLogic } from "../../../search/QueryEngine";
import { QueryWhereClause, QueryReturnClause } from "../../../types/templates";
import { createLogger } from "../../../utils/Logger";
import { TemplateEvaluator } from "../../../core/templates/TemplateEvaluator";
import { FunctionEvaluator } from "../../../core/templates/FunctionEvaluator";
import { QueryDropdownContext } from "../../../core/templates/ContextProviders";
import type { AnyFunctionDescriptor, FormData } from "../../../types";
import type ElnPlugin from "../../../main";

export interface QueryDropdownOptions extends LabeledInputBaseOptions<string | string[]> {
    app: App;
    plugin: ElnPlugin;
    search?: string;  // Made optional since 'from' can replace this
    where?: QueryWhereClause;
    return?: QueryReturnClause;
    from?: AnyFunctionDescriptor | string;  // Source file for frontmatter-based queries
    get?: AnyFunctionDescriptor;  // Function to extract options from frontmatter
    multiselect?: boolean;
    onValueChange?: (value: string | string[], returnValues?: Record<string, unknown> | Record<string, unknown>[]) => void;
    getUserData?: () => FormData; // Function to get current user data for reactive evaluation
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
    protected plugin: ElnPlugin;
    protected search?: string;
    protected where?: QueryWhereClause;
    protected returnClause?: QueryReturnClause;
    protected from?: AnyFunctionDescriptor | string;  // Source file for frontmatter-based queries
    protected get?: AnyFunctionDescriptor;  // Function to extract options from frontmatter
    protected frontmatterCache: Map<string, Record<string, unknown>> = new Map(); // Cache for loaded frontmatter
    protected returnMapping: Record<string, string> = {};
    protected searchResults: QueryResult[] = [];
    protected queryOnValueChange?: (value: string | string[], returnValues?: Record<string, unknown> | Record<string, unknown>[]) => void;
    protected multiselect: boolean;
    protected dropdowns: DropdownComponent[] = [];
    protected addButton?: HTMLElement;
    protected initialDefaultValue?: string | string[];
    protected logger = createLogger('ui');
    protected getUserData?: () => FormData;
    protected templateEvaluator: TemplateEvaluator;
    protected functionEvaluator: FunctionEvaluator;
    protected reactiveDependencies: string[] = []; // Track reactive dependencies for this component

    constructor(options: QueryDropdownOptions) {
        const { app, plugin, search, where, return: returnClause, from, get, multiselect = false, onValueChange, getUserData, ...baseOptions } = options;
        
        super(baseOptions);
        
        this.app = app;
        this.plugin = plugin;
        this.search = search;
        this.where = where;
        this.returnClause = returnClause;
        this.from = from;
        this.get = get;
        this.multiselect = multiselect;
        this.queryOnValueChange = onValueChange;
        this.initialDefaultValue = baseOptions.defaultValue;
        this.getUserData = getUserData;
        this.templateEvaluator = new TemplateEvaluator(this.plugin);
        this.functionEvaluator = new FunctionEvaluator(this.plugin);
        
        this.logger.debug('🔹 QueryDropdown constructor called:', {
            label: options.label,
            multiselect: this.multiselect,
            search: this.search,
            where: this.where,
            returnClause: this.returnClause,
            defaultValue: baseOptions.defaultValue,
            hasGetUserData: !!this.getUserData
        });
        
        // Analyze where clause for reactive dependencies
        this.extractReactiveDependencies();
        
        this.logger.debug('🔹 QueryDropdown dependencies extracted:', {
            label: options.label,
            reactiveDependencies: this.reactiveDependencies
        });
        
        // Call createValueEditor to initialize the UI
        this.createValueEditor(baseOptions);
    }

    // Implement abstract method from LabeledInputBase
    protected createValueEditor(options: LabeledInputBaseOptions<string | string[]>): void {
        this.logger.debug('🔹 Creating query dropdown value editor:', {
            label: this.label,
            search: this.search,
            where: this.where,
            returnClause: this.returnClause,
            multiselect: this.multiselect,
            reactiveDependencies: this.reactiveDependencies
        });
        
        // Execute query to get options
        this.executeQuery();
        
        // Create dropdown UI with query results
        this.createDropdownUI();
    }

    protected executeQuery(): void {
        this.logger.debug('🔹 Executing query for QueryDropdown:', { 
            label: this.label,
            search: this.search, 
            where: this.where,
            from: this.from,
            get: this.get,
            hasGetUserData: !!this.getUserData
        });
        
        try {
            // Check if we have reactive dependencies and if they're satisfied
            if (this.reactiveDependencies.length > 0 && this.getUserData) {
                const userData = this.getUserData();
                const dependenciesSatisfied = this.reactiveDependencies.every(dep => {
                    const value = this.getNestedValue(userData, dep);
                    const satisfied = value !== undefined && value !== null && value !== '';
                    this.logger.debug('🔹 Checking dependency satisfaction:', {
                        label: this.label,
                        dependency: dep,
                        value: value,
                        satisfied: satisfied,
                        userData: userData,
                        userDataKeys: Object.keys(userData),
                        fullPath: this.exploreNestedPath(userData, dep)
                    });
                    return satisfied;
                });
                
                if (!dependenciesSatisfied) {
                    // Dependencies not satisfied - defer query execution
                    this.logger.debug('🔹 Dependencies not satisfied - showing empty results:', {
                        label: this.label,
                        dependencies: this.reactiveDependencies,
                        userData: userData
                    });
                    this.searchResults = [];
                    return;
                }
            }

            // Check if this is a frontmatter-based query (has 'from' and 'get')
            if (this.from && this.get) {
                this.executeFrontmatterQuery();
            } else if (this.search || this.where) {
                // Traditional search-based query (search can be optional if where is provided)
                const templateQuery = {
                    search: this.search,
                    where: this.where,
                    return: this.returnClause,
                    userData: this.getUserData ? this.getUserData() : undefined
                };
                
                const queryResult = this.templateEvaluator.executeTemplateQuery(templateQuery);
                
                this.logger.debug('🔹 TemplateEvaluator results:', {
                    label: this.label,
                    resultCount: queryResult.results.length,
                    results: queryResult.results
                });
                
                // Convert to our format
                this.searchResults = queryResult.results.map(result => ({
                    file: { basename: result.file.basename },
                    returnValues: result.returnValues
                }));
                
                // Store return mapping for later use
                this.returnMapping = queryResult.mapping;
                
                this.logger.debug('🔹 Query results processed:', {
                    label: this.label,
                    resultCount: this.searchResults.length,
                    fileNames: this.searchResults.map(r => r.file.basename),
                    searchResults: this.searchResults
                });
            } else {
                this.logger.warn('QueryDropdown requires either: (1) search parameter, (2) both from and get parameters, or (3) where parameter without search', {
                    label: this.label,
                    hasSearch: !!this.search,
                    hasFrom: !!this.from,
                    hasGet: !!this.get,
                    hasWhere: !!this.where
                });
                this.searchResults = [];
            }
        } catch (error) {
            this.logger.warn('Query execution failed:', error);
            this.searchResults = [];
        }
    }

    protected executeFrontmatterQuery(): void {
        if (!this.from || !this.get) return;
        
        this.logger.debug('🔹 Executing frontmatter query:', {
            label: this.label,
            from: this.from,
            get: this.get
        });

        try {
            // Evaluate the 'from' parameter to get the target file name
            let targetFile: string;
            
            if (typeof this.from === 'string') {
                targetFile = this.from;
            } else {
                // Evaluate function to get filename
                const userData = this.getUserData ? this.getUserData() : {};
                
                this.logger.debug('🔹 Evaluating from function with user data:', {
                    label: this.label,
                    userData,
                    fromFunction: this.from
                });
                
                const evaluatedFrom = this.templateEvaluator.evaluateUserInputFunction(this.from, userData);
                targetFile = String(evaluatedFrom);
                
                this.logger.debug('🔹 From function evaluation result:', {
                    label: this.label,
                    evaluatedFrom,
                    targetFile
                });
            }

            if (!targetFile || targetFile === 'undefined' || targetFile === 'null') {
                this.logger.debug('🔹 Target file not specified or invalid, showing empty results:', {
                    label: this.label,
                    targetFile,
                    fromType: typeof this.from
                });
                this.searchResults = [];
                return;
            }

            // Load frontmatter from the target file
            const frontmatter = this.loadFrontmatter(targetFile);
            
            if (!frontmatter) {
                this.logger.debug('🔹 Could not load frontmatter from file:', targetFile);
                this.searchResults = [];
                return;
            }

            // Create queryDropdown context for the 'get' function
            const queryDropdownContext: QueryDropdownContext = {
                selection: null, // No selection yet, we're getting options
                frontmatter: frontmatter,
                file: {
                    name: targetFile,
                    link: `[[${targetFile}]]`,
                    path: targetFile // Will be updated if full path is available
                }
            };
            
            this.logger.debug('🔹 Evaluating get function with queryDropdown context:', {
                label: this.label,
                getFunction: this.get,
                queryDropdownContext
            });
            
            // Evaluate the 'get' function using FunctionEvaluator with queryDropdown context
            const userData = this.getUserData ? this.getUserData() : {};
            const options = this.functionEvaluator.evaluateFunction(
                this.get,
                userData,
                undefined, // noteType
                undefined, // inputValue
                queryDropdownContext // queryDropdown context
            );
            
            this.logger.debug('🔹 Get function evaluation result:', {
                label: this.label,
                options,
                optionsType: typeof options,
                isArray: Array.isArray(options),
                optionsLength: Array.isArray(options) ? options.length : 'N/A'
            });
            
            if (!Array.isArray(options)) {
                this.logger.warn('🔹 Get function did not return an array:', {
                    label: this.label,
                    options,
                    optionsType: typeof options,
                    getFunction: this.get
                });
                this.searchResults = [];
                return;
            }

            // Convert options to search results format
            this.searchResults = options.map(option => ({
                file: { basename: String(option) },
                returnValues: { selection: option, frontmatter }
            }));

            this.logger.debug('🔹 Frontmatter query results processed:', {
                label: this.label,
                targetFile,
                optionsCount: options.length,
                options,
                searchResults: this.searchResults
            });

        } catch (error) {
            this.logger.warn('Frontmatter query execution failed:', error);
            this.searchResults = [];
        }
    }

    protected loadFrontmatter(fileName: string): Record<string, unknown> | null {
        // Check cache first
        if (this.frontmatterCache.has(fileName)) {
            return this.frontmatterCache.get(fileName)!;
        }

        try {
            // Get instrument folder from settings for better path resolution
            let sourcePath = '';
            
            // Try to get instrument folder from plugin settings
            if (this.plugin?.settings?.note?.instrument?.folderTemplate) {
                const folderTemplate = this.plugin.settings.note.instrument.folderTemplate;
                if (Array.isArray(folderTemplate) && folderTemplate.length > 0) {
                    // Extract the folder path from the template
                    const firstTemplate = folderTemplate[0];
                    if (firstTemplate.type === 'string' && firstTemplate.field) {
                        sourcePath = firstTemplate.field;
                    }
                }
            }
            
            this.logger.debug('🔹 Attempting file resolution:', {
                fileName,
                sourcePath,
                hasPlugin: !!this.plugin,
                hasSettings: !!this.plugin?.settings
            });

            // Use Obsidian's link resolution to find the best matching file
            // Try with sourcePath first (more reliable), then fallback to empty path
            let file = this.app.metadataCache.getFirstLinkpathDest(fileName, sourcePath);
            
            if (!file && sourcePath) {
                // Fallback to empty source path
                file = this.app.metadataCache.getFirstLinkpathDest(fileName, '');
            }
            
            if (!file) {
                // Try with .md extension if not found
                file = this.app.metadataCache.getFirstLinkpathDest(`${fileName}.md`, sourcePath);
                
                if (!file && sourcePath) {
                    // Fallback with .md and empty source path
                    file = this.app.metadataCache.getFirstLinkpathDest(`${fileName}.md`, '');
                }
            }
            
            if (!file) {
                this.logger.warn('File not found using link resolution:', {
                    fileName,
                    sourcePath,
                    searchAttempts: [
                        `${fileName} (source: ${sourcePath})`,
                        `${fileName} (source: '')`,
                        `${fileName}.md (source: ${sourcePath})`,
                        `${fileName}.md (source: '')`
                    ]
                });
                return null;
            }
            
            this.logger.debug('Successfully resolved file:', {
                fileName,
                sourcePath,
                resolvedPath: file.path,
                resolvedName: file.name
            });
            
            return this.loadFrontmatterFromFile(file, fileName);
            
        } catch (error) {
            this.logger.warn('Error loading frontmatter:', error);
            return null;
        }
    }

    protected loadFrontmatterFromFile(file: TFile, cacheKey: string): Record<string, unknown> | null {
        try {
            // Get cached frontmatter from Obsidian's metadata cache
            const cachedFile = this.app.metadataCache.getFileCache(file);
            
            this.logger.debug('Loading frontmatter from file:', {
                fileName: file.name,
                filePath: file.path,
                cacheKey,
                hasCachedFile: !!cachedFile,
                hasFrontmatter: !!cachedFile?.frontmatter,
                frontmatterKeys: cachedFile?.frontmatter ? Object.keys(cachedFile.frontmatter) : []
            });
            
            if (cachedFile?.frontmatter) {
                // Cache the result
                this.frontmatterCache.set(cacheKey, cachedFile.frontmatter);
                
                this.logger.debug('Successfully loaded frontmatter:', {
                    cacheKey,
                    frontmatter: cachedFile.frontmatter
                });
                
                return cachedFile.frontmatter;
            }
            
            this.logger.warn('No frontmatter found in file:', {
                cacheKey,
                fileName: file.name,
                filePath: file.path,
                hasCachedFile: !!cachedFile
            });
            return {};
            
        } catch (error) {
            this.logger.warn('Error extracting frontmatter:', error);
            return null;
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
        const defaultValue = Array.isArray(this.getDefaultValue()) ? undefined : this.getDefaultValue() as string;
        
        const dropdown = DropdownUIHelper.createSingleDropdown({
            container: this.valueSection,
            options,
            defaultValue: defaultValue,
            onValueChange: (value) => {
                this.handleValueChange(value);
            }
        });
        
        this.dropdowns = [dropdown];
        
        // Determine which value to process for return values
        let valueToProcess: string | undefined = defaultValue;
        
        // If no default value but options are available, use first option
        // This handles the case of queryDropdowns in array items
        if (!valueToProcess && options.length > 0) {
            valueToProcess = options[0];
        }
        
        // If we have a value and return clause, process return values immediately
        // This ensures that when the dropdown is first rendered (especially in array items),
        // the return values get populated correctly
        if (valueToProcess && this.returnClause && options.includes(valueToProcess)) {
            this.logger.debug('🔹 Processing return values for initial value:', {
                label: this.label,
                value: valueToProcess,
                hadDefaultValue: !!defaultValue
            });
            this.handleValueChange(valueToProcess);
        }
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
                const processedReturnValues = this.processReturnValues(selectedValue);
                returnValuesList.push(processedReturnValues);
            }
            returnValues = returnValuesList;
        } else {
            // Single select: return single return value object
            returnValues = this.processReturnValues(value);
        }
        
        this.logger.debug('QueryDropdown return values:', { returnValues, mapping: this.returnMapping });
        
        // Call the callback with both the selected value(s) and return values
        if (this.queryOnValueChange) {
            this.queryOnValueChange(value, returnValues);
        }
    }

    protected processReturnValues(selectedValue: string): Record<string, unknown> {
        const result = this.searchResults.find(r => r.file.basename === selectedValue);
        
        if (!result?.returnValues) {
            this.logger.debug('QueryDropdown: No return values found for selection:', {
                label: this.label,
                selectedValue,
                hasResult: !!result
            });
            return {};
        }

        this.logger.debug('QueryDropdown: Processing return values:', {
            label: this.label,
            selectedValue,
            returnClause: this.returnClause,
            availableReturnValues: result.returnValues,
            returnValueKeys: Object.keys(result.returnValues)
        });

        // Check if we have function-based return clause
        if (this.returnClause && typeof this.returnClause === 'object' && !Array.isArray(this.returnClause)) {
            const functionBasedReturn: Record<string, unknown> = {};
            
            // Process each return field
            for (const [targetField, returnSpec] of Object.entries(this.returnClause)) {
                if (typeof returnSpec === 'string') {
                    // Traditional string mapping
                    if (result.returnValues[returnSpec] !== undefined) {
                        functionBasedReturn[targetField] = result.returnValues[returnSpec];
                        this.logger.debug('QueryDropdown: Mapped return value:', {
                            label: this.label,
                            targetField,
                            returnSpec,
                            value: result.returnValues[returnSpec]
                        });
                    } else {
                        this.logger.warn('QueryDropdown: Return spec not found in returnValues:', {
                            label: this.label,
                            targetField,
                            returnSpec,
                            availableKeys: Object.keys(result.returnValues)
                        });
                    }
                } else if (typeof returnSpec === 'object' && returnSpec.type === 'function') {
                    // Function-based return processing using FunctionEvaluator
                    try {
                        // Create queryDropdown context with selection and frontmatter
                        const queryDropdownContext: QueryDropdownContext = {
                            selection: selectedValue,
                            frontmatter: result.returnValues.frontmatter as Record<string, unknown> || {},
                            file: {
                                name: selectedValue,
                                link: `[[${selectedValue}]]`,
                                path: selectedValue
                            }
                        };
                        
                        const userData = this.getUserData ? this.getUserData() : {};
                        const evaluatedValue = this.functionEvaluator.evaluateFunction(
                            returnSpec as AnyFunctionDescriptor,
                            userData,
                            undefined, // noteType
                            undefined, // inputValue
                            queryDropdownContext // queryDropdown context
                        );
                        
                        functionBasedReturn[targetField] = evaluatedValue;
                        
                        this.logger.debug('Evaluated return function with queryDropdown context:', {
                            targetField,
                            selectedValue,
                            evaluatedValue,
                            returnSpec
                        });
                    } catch (error) {
                        this.logger.warn('Error evaluating return function:', error);
                        // Use fallback if available (only exists on EnhancedFunctionDescriptor)
                        const fallback = 'fallback' in returnSpec ? returnSpec.fallback : null;
                        functionBasedReturn[targetField] = fallback;
                    }
                }
            }
            
            return functionBasedReturn;
        }
        
        // Traditional return mapping
        if (Object.keys(this.returnMapping).length > 0) {
            const mappedReturnValues: Record<string, unknown> = {};
            for (const [sourceField, targetField] of Object.entries(this.returnMapping)) {
                if (result.returnValues[sourceField] !== undefined) {
                    mappedReturnValues[targetField] = result.returnValues[sourceField];
                }
            }
            return mappedReturnValues;
        }
        
        return result.returnValues;
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
                let value: string | number | boolean = ops[op];
                
                // Check if value is a function descriptor that needs evaluation
                if (this.isFunctionDescriptor(value)) {
                    const evaluatedValue = this.evaluateWhereFunction(value as unknown as AnyFunctionDescriptor);
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
                const evaluatedValue = this.evaluateWhereFunction(value as unknown as AnyFunctionDescriptor);
                value = typeof evaluatedValue === 'string' || typeof evaluatedValue === 'number' || typeof evaluatedValue === 'boolean' 
                    ? evaluatedValue 
                    : String(evaluatedValue);
            }
            return { field: where.field, operator: where.operator, value } as QueryCondition;
        }
        
        if ('operator' in where && 'conditions' in where) {
            return {
                operator: where.operator,
                conditions: where.conditions.map(cond => this.parseWhereClause(cond as QueryWhereClause)).filter(c => c !== undefined) as (QueryCondition | QueryLogic)[]
            } as QueryLogic;
        }
        
        return undefined;
    }

    /**
     * Check if a value is a function descriptor
     */
    private isFunctionDescriptor(value: unknown): boolean {
        return Boolean(value && typeof value === 'object' && 'type' in value && (value as Record<string, unknown>).type === 'function');
    }

    /**
     * Evaluate a function descriptor in the where clause
     */
    private evaluateWhereFunction(descriptor: AnyFunctionDescriptor): unknown {
        this.logger.debug('🔹 Evaluating where function:', {
            label: this.label,
            descriptor: descriptor,
            hasGetUserData: !!this.getUserData
        });

        if (!this.getUserData) {
            this.logger.warn('🔹 Cannot evaluate reactive where function - no getUserData provided:', {
                label: this.label,
                descriptor: descriptor
            });
            return this.getFallbackValue(descriptor);
        }

        try {
            const userData = this.getUserData();
            this.logger.debug('🔹 Current user data for where function evaluation:', {
                label: this.label,
                userData: userData,
                descriptor: descriptor
            });

            const result = this.templateEvaluator.evaluateUserInputFunction(descriptor, userData);
            
            this.logger.debug('🔹 Where function evaluation result:', {
                label: this.label,
                result: result,
                descriptor: descriptor
            });

            return result;
        } catch (error) {
            this.logger.error('🔹 Error evaluating where function:', {
                label: this.label,
                error: error,
                descriptor: descriptor
            });
            return this.getFallbackValue(descriptor);
        }
    }

    /**
     * Get fallback value from function descriptor
     */
    private getFallbackValue(descriptor: AnyFunctionDescriptor): unknown {
        if ('fallback' in descriptor) {
            return descriptor.fallback;
        }
        return '';
    }

    /**
     * Get a nested value from an object using dot notation
     */
    private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
        if (!obj || !path) return undefined;
        
        const keys = path.split('.');
        let current: unknown = obj;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = (current as Record<string, unknown>)[key];
            } else {
                return undefined;
            }
        }
        
        return current;
    }

    /**
     * Debug helper to explore nested path structure
     */
    private exploreNestedPath(obj: Record<string, unknown>, path: string): Record<string, unknown> {
        const keys = path.split('.');
        let current: unknown = obj;
        const exploration: Record<string, unknown> = {};
        
        for (let i = 0; i < keys.length; i++) {
            const partialPath = keys.slice(0, i + 1).join('.');
            const key = keys[i];
            
            if (current && typeof current === 'object' && key in current) {
                current = (current as Record<string, unknown>)[key];
                exploration[partialPath] = {
                    exists: true,
                    value: current,
                    type: typeof current,
                    keys: current && typeof current === 'object' ? Object.keys(current) : []
                };
            } else {
                exploration[partialPath] = {
                    exists: false,
                    availableKeys: current && typeof current === 'object' ? Object.keys(current) : [],
                    searchedKey: key
                };
                break;
            }
        }
        
        return exploration;
    }

    /**
     * Extract reactive dependencies from the where clause
     */
    private extractReactiveDependencies(): void {
        const dependencies: string[] = [];
        
        // Extract dependencies from where clause
        if (this.where) {
            dependencies.push(...this.extractDependenciesFromWhereClause(this.where));
        }
        
        // Extract dependencies from 'from' parameter
        if (this.from && typeof this.from === 'object' && this.isFunctionDescriptor(this.from)) {
            const descriptor = this.from as AnyFunctionDescriptor;
            if ('reactiveDeps' in descriptor && Array.isArray(descriptor.reactiveDeps)) {
                dependencies.push(...descriptor.reactiveDeps);
            }
        }
        
        this.reactiveDependencies = dependencies;
        
        this.logger.debug('🔹 Extracted reactive dependencies for QueryDropdown:', {
            label: this.label,
            dependencies: this.reactiveDependencies,
            whereClause: this.where,
            fromClause: this.from
        });
    }

    /**
     * Recursively extract dependencies from where clause
     */
    private extractDependenciesFromWhereClause(where: QueryWhereClause): string[] {
        const dependencies: string[] = [];
        
        if (!where) return dependencies;
        
        if (Array.isArray(where)) {
            for (const condition of where) {
                // Handle the legacy array format: { field: string, [op: string]: value }
                if (typeof condition === 'object' && condition !== null) {
                    for (const value of Object.values(condition)) {
                        if (this.isFunctionDescriptor(value)) {
                            const descriptor = value as unknown as AnyFunctionDescriptor;
                            if ('reactiveDeps' in descriptor && Array.isArray(descriptor.reactiveDeps)) {
                                dependencies.push(...descriptor.reactiveDeps);
                            }
                        }
                    }
                }
            }
        } else if (typeof where === 'object') {
            // Check if any value is a function descriptor with dependencies
            for (const value of Object.values(where)) {
                if (this.isFunctionDescriptor(value)) {
                    const descriptor = value as AnyFunctionDescriptor;
                    if ('reactiveDeps' in descriptor && Array.isArray(descriptor.reactiveDeps)) {
                        dependencies.push(...descriptor.reactiveDeps);
                    }
                }
                
                // Recursively check nested conditions for QueryLogicObject
                if (Array.isArray(value)) {
                    dependencies.push(...this.extractDependenciesFromWhereClause(value as QueryWhereClause));
                } else if (typeof value === 'object' && value !== null) {
                    dependencies.push(...this.extractDependenciesFromWhereClause(value as QueryWhereClause));
                }
            }
        }
        
        return [...new Set(dependencies)]; // Remove duplicates
    }

    /**
     * Get reactive dependencies for this component
     */
    getReactiveDependencies(): string[] {
        return this.reactiveDependencies;
    }

    /**
     * Update the query when reactive dependencies change
     */
    updateQuery(): void {
        this.logger.debug('🔹 UpdateQuery called for QueryDropdown:', {
            label: this.label,
            dependencies: this.reactiveDependencies,
            hasGetUserData: !!this.getUserData
        });

        if (!this.getUserData) {
            this.logger.warn('🔹 Cannot update query - no getUserData function available:', {
                label: this.label
            });
            return;
        }

        const currentUserData = this.getUserData();
        this.logger.debug('🔹 Current user data for query update:', {
            label: this.label,
            userData: currentUserData,
            dependencies: this.reactiveDependencies
        });
        
        // Re-execute the query with current user data
        this.executeQuery();
        
        // Update the dropdown options
        this.updateDropdownOptions();
        
        this.logger.debug('🔹 Query update completed for QueryDropdown:', {
            label: this.label,
            newResultCount: this.searchResults.length
        });
    }

    /**
     * Update dropdown options after query re-execution
     */
    private updateDropdownOptions(): void {
        const options = this.searchResults.map(result => result.file.basename);
        
        this.logger.debug('🔹 Updating dropdown options:', {
            label: this.label,
            optionCount: options.length,
            options: options,
            searchResults: this.searchResults
        });
        
        // Clear existing dropdowns
        this.dropdowns.forEach(dropdown => dropdown.selectEl.remove());
        this.dropdowns = [];
        
        if (this.addButton) {
            this.addButton.remove();
            this.addButton = undefined;
        }
        
        // Clear value section
        this.valueSection.empty();
        
        // Recreate UI with new options
        if (options.length === 0) {
            this.logger.debug('🔹 No options available - displaying empty message:', {
                label: this.label
            });
            this.displayEmptyMessage();
        } else {
            if (this.multiselect) {
                this.logger.debug('🔹 Creating multiselect UI with options:', {
                    label: this.label,
                    options: options
                });
                this.createMultiSelectUI(options);
            } else {
                this.logger.debug('🔹 Creating single select UI with options:', {
                    label: this.label,
                    options: options
                });
                this.createSingleSelectUI(options);
                
                // For from/get queryDropdowns, automatically populate return values with first option
                // This ensures return fields get updated when reactive dependencies change
                if (this.from && this.get && options.length > 0) {
                    this.logger.debug('🔹 Auto-populating return values for first option after reactive update:', {
                        label: this.label,
                        firstOption: options[0]
                    });
                    this.handleValueChange(options[0]);
                }
            }
        }
    }

    /**
     * Display empty message when no options are available
     */
    private displayEmptyMessage(): void {
        const emptyMessage = this.valueSection.createEl("div", { 
            text: "No options available", 
            cls: "eln-query-dropdown-empty" 
        });
        emptyMessage.style.color = "var(--text-muted)";
        emptyMessage.style.fontStyle = "italic";
        emptyMessage.style.marginTop = "4px";
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
