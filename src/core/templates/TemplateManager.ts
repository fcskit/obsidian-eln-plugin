import type { 
    MetaDataTemplate,
    MetaDataTemplateProcessed, 
    MetaDataTemplateFieldProcessed,
    FormData,
    FormFieldValue,
    SubclassMetadataTemplate,
    JSONObject,
    FunctionDescriptor,
    EnhancedFunctionDescriptor,
    AnyFunctionDescriptor
} from "../../types";
import type ElnPlugin from "../../main";
import { TemplateEvaluator } from "./TemplateEvaluator";
import { QueryEngine, SearchResult } from "../../search/QueryEngine";
import { QueryReturnClause } from "../../types/templates";
import { QueryDropdownContext } from "./ContextProviders";
import { createLogger } from "../../utils/Logger";

const logger = createLogger('template');

export interface TemplateManagerOptions {
    plugin: ElnPlugin;
    noteType?: string;
    baseTemplate?: MetaDataTemplateProcessed;
    initialData?: FormData;
}

/**
 * Enhanced TemplateManager that handles template loading, processing, and transformations
 * Incorporates functionality from TemplateEvaluator for form data preparation
 */
export class TemplateManager {
    private plugin: ElnPlugin;
    private evaluator: TemplateEvaluator;
    private queryEngine: QueryEngine;
    private noteType?: string;
    private originalTemplate: MetaDataTemplateProcessed; // Never modified - the pristine original
    private baseTemplate: MetaDataTemplateProcessed; // Original + default subclass applied
    private currentTemplate: MetaDataTemplateProcessed; // Working copy
    private templateHistory: MetaDataTemplateProcessed[] = [];
    private data: FormData;
    private lastAppliedSubclass?: string; // Track the currently applied subclass
    private defaultSubclassApplied: boolean = false; // Track if default subclass has been applied

    constructor(options: TemplateManagerOptions) {
        logger.debug('TemplateManager constructor called', { noteType: options.noteType });
        
        // Test to verify template logging works with file logging
        logger.info('🧪 TemplateManager constructor - FILE LOGGING TEST', { 
            timestamp: new Date().toISOString(),
            noteType: options.noteType 
        });
        
        this.plugin = options.plugin;
        this.evaluator = new TemplateEvaluator(options.plugin);
        this.queryEngine = new QueryEngine(options.plugin.app); // Simple QueryEngine without template processing
        this.noteType = options.noteType;
        this.data = options.initialData || {};

        // Load the raw original template (never modified - the pristine original)
        if (options.baseTemplate) {
            this.originalTemplate = JSON.parse(JSON.stringify(options.baseTemplate));
        } else {
            const rawTemplate = this.loadRawTemplate(options.noteType);
            this.originalTemplate = JSON.parse(JSON.stringify(rawTemplate)) as MetaDataTemplateProcessed;
        }

        // Create base template with default subclass applied (this will be processed)
        this.baseTemplate = this.applyDefaultSubclassToTemplate(this.originalTemplate);
        
        // Working copy starts as base template
        this.currentTemplate = JSON.parse(JSON.stringify(this.baseTemplate));
        this.templateHistory = [this.baseTemplate];
    }

    /**
     * Provide access to the template evaluator for external components
     */
    getEvaluator(): TemplateEvaluator {
        return this.evaluator;
    }

    /**
     * Get the plugin instance
     */
    getPlugin(): ElnPlugin {
        return this.plugin;
    }

    /**
     * Loads a raw metadata template from plugin settings
     */
    private loadRawTemplate(noteType?: string): MetaDataTemplate {
        let template: MetaDataTemplate;
        
        if (noteType && noteType in this.plugin.settings.note) {
            const noteSettings = this.plugin.settings.note[noteType as keyof typeof this.plugin.settings.note];
            template = noteSettings.metadataTemplate;
        } else {
            template = this.plugin.settings.note.default.metadataTemplate;
        }

        if (!template) {
            throw new Error("Failed to load metadata template.");
        }

        return template;
    }

    /**
     * Loads and processes a template from plugin settings
     */
    private loadAndProcessTemplate(noteType?: string): MetaDataTemplateProcessed {
        const rawTemplate = this.loadRawTemplate(noteType);
        return this.processTemplate(rawTemplate as MetaDataTemplateProcessed);
    }

    /**
     * Processes a template (handles preprocessing and dynamic field evaluation)
     */
    private processTemplate(template: MetaDataTemplateProcessed): MetaDataTemplateProcessed {
        // Create a deep copy to avoid modifying the original
        const processed = JSON.parse(JSON.stringify(template)) as MetaDataTemplateProcessed;
        
        // Normalize template fields (apply defaults like query: true)
        this.normalizeTemplateFields(processed);
        
        // Process dynamic fields first
        this.evaluator.processDynamicFields(processed);
        
        // Handle author settings
        this.preprocessAuthorSettings(processed);
        
        return processed;
    }

    /**
     * Normalize template fields by applying sensible defaults
     * - Sets query: true by default for all fields unless explicitly set to false
     * - Recursively processes nested objects and objectTemplates
     */
    private normalizeTemplateFields(template: MetaDataTemplateProcessed): void {
        for (const key in template) {
            const field = template[key];
            
            // Skip non-field entries
            if (!field || typeof field !== 'object') {
                continue;
            }
            
            // Check if this is a field definition (has inputType or other field properties)
            const isField = 'inputType' in field || 'query' in field || 'default' in field;
            
            if (isField) {
                const fieldDef = field as MetaDataTemplateFieldProcessed;
                
                // Set query: true by default if not explicitly defined
                if (fieldDef.query === undefined) {
                    fieldDef.query = true;
                }
                
                // Process objectTemplate for list fields
                if (fieldDef.inputType === 'list' && 
                    fieldDef.listType === 'object' && 
                    fieldDef.objectTemplate &&
                    typeof fieldDef.objectTemplate === 'object') {
                    
                    // Recursively normalize fields in objectTemplate
                    this.normalizeTemplateFields(fieldDef.objectTemplate as MetaDataTemplateProcessed);
                }
                
                // Process objectTemplate for editableObject fields
                if (fieldDef.inputType === 'editableObject' && 
                    fieldDef.objectTemplate &&
                    typeof fieldDef.objectTemplate === 'object') {
                    
                    // Recursively normalize fields in objectTemplate
                    this.normalizeTemplateFields(fieldDef.objectTemplate as MetaDataTemplateProcessed);
                }
            } else {
                // This is a nested object structure, recurse into it
                this.normalizeTemplateFields(field as MetaDataTemplateProcessed);
            }
        }
    }

    /**
     * Applies the default subclass template to the original template during initialization
     */
    private applyDefaultSubclassToTemplate(template: MetaDataTemplateProcessed): MetaDataTemplateProcessed {
        // Create a working copy and process it (dynamic fields, author settings, etc.)
        const workingTemplate = this.processTemplate(template);
        
        // Find subclass field
        const subclassField = this.findSubclassFieldInTemplate(workingTemplate);
        if (!subclassField || !this.noteType) {
            return workingTemplate; // No subclass field or note type, return as-is
        }
        
        // Get the default subclass name
        const defaultSubclass = this.getDefaultSubclassFromField(subclassField);
        if (!defaultSubclass) {
            return workingTemplate; // No default subclass, return as-is
        }
        
        logger.debug('[TemplateManager] Applying default subclass template:', {
            noteType: this.noteType,
            defaultSubclass
        });
        
        // Find and apply the default subclass template
        const subclassTemplate = this.findSubclassTemplate(this.noteType, defaultSubclass);
        if (subclassTemplate) {
            this.applySubclassTemplateToTemplate(workingTemplate, subclassTemplate);
            logger.debug('[TemplateManager] Applied default subclass template:', defaultSubclass);
        }
        
        // Track the applied subclass and mark default as applied
        this.lastAppliedSubclass = defaultSubclass;
        this.defaultSubclassApplied = true;
        
        return workingTemplate;
    }

    /**
     * Gets the default subclass name from a subclass field
     */
    private getDefaultSubclassFromField(subclassField: MetaDataTemplateFieldProcessed): string | null {
        if (subclassField.default) {
            return subclassField.default as string;
        }
        
        // Fall back to first option if no default
        let options: string[] = [];
        if (Array.isArray(subclassField.options)) {
            options = subclassField.options;
        } else if (typeof subclassField.options === "function") {
            const evaluatedOptions = (subclassField.options as (data: JSONObject) => unknown)({} as JSONObject);
            options = Array.isArray(evaluatedOptions) ? evaluatedOptions : [];
        }
        
        return options[0] || null;
    }

    /**
     * Finds subclass field in a specific template (doesn't use this.currentTemplate)
     */
    private findSubclassFieldInTemplate(template: MetaDataTemplateProcessed): MetaDataTemplateFieldProcessed | undefined {
        for (const value of Object.values(template)) {
            if (value && typeof value === "object") {
                if ("inputType" in value && value.inputType === "subclass") {
                    return value as MetaDataTemplateFieldProcessed;
                }
                // Recursively search nested objects (but not arrays)
                if (!("inputType" in value)) {
                    const nested = this.findSubclassFieldInTemplate(value as MetaDataTemplateProcessed);
                    if (nested) return nested;
                }
            }
        }
        return undefined;
    }

    /**
     * Applies legacy subclass template to a specific template (doesn't modify this.currentTemplate)
     */
    private applySubclassTemplateToTemplate(template: MetaDataTemplateProcessed, subclassTemplate: SubclassMetadataTemplate): void {
        // Remove fields
        if (Array.isArray(subclassTemplate.remove)) {
            for (const fullKey of subclassTemplate.remove) {
                this.removeFieldFromTemplateObject(template, fullKey);
            }
        }
        
        // Replace fields
        if (subclassTemplate.replace && Array.isArray(subclassTemplate.replace)) {
            for (const replaceItem of subclassTemplate.replace) {
                if (replaceItem.fullKey && replaceItem.newKey) {
                    this.replaceFieldInTemplateObject(template, { 
                        fullKey: replaceItem.fullKey, 
                        newKey: replaceItem.newKey, 
                        input: replaceItem.input as Record<string, unknown>
                    });
                }
            }
        }
        
        // Add fields
        if (Array.isArray(subclassTemplate.add)) {
            for (const { fullKey, input } of subclassTemplate.add) {
                this.addFieldToTemplateObject(template, { fullKey, input: input as Record<string, unknown> });
            }
        }
        
        // Re-process dynamic fields after modifications
        this.evaluator.processDynamicFields(template);
    }
    private preprocessAuthorSettings(template: MetaDataTemplateProcessed): void {
        if (this.plugin.settings.footer.includeAuthor && template.author) {
            const authorList = this.plugin.settings.general.authors.map((author: { name: string; initials: string }) => author.name);
            const authorField = template.author as MetaDataTemplateFieldProcessed;
            
            if (authorList.length > 1) {
                authorField.query = true;
                authorField.inputType = "dropdown";
                authorField.default = authorList[0];
                authorField.options = authorList;
            } else {
                authorField.default = authorList[0];
            }
        }
    }

    /**
     * Gets the current processed template
     */
    getCurrentTemplate(): MetaDataTemplateProcessed {
        return JSON.parse(JSON.stringify(this.currentTemplate));
    }

    /**
     * Gets the base template (without modifications)
     */
    getBaseTemplate(): MetaDataTemplateProcessed {
        return JSON.parse(JSON.stringify(this.baseTemplate));
    }

    /**
     * Checks if a field is editable based on template configuration
     */
    isFieldEditable(fieldPath: string): boolean {
        const templateField = this.getFieldTemplate(fieldPath);
        return templateField?.editable !== false;
    }

    /**
     * Checks if new fields are allowed for the given object path
     */
    allowsNewFields(objectPath: string): boolean {
        // For now, allow new fields unless explicitly disabled in template
        return true;
    }

    /**
     * Gets template configuration for a specific field
     */
    getFieldTemplate(fieldPath: string): MetaDataTemplateFieldProcessed | undefined {
        const keys = fieldPath.split('.');
        let current: unknown = this.currentTemplate;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = (current as Record<string, unknown>)[key];
            } else {
                return undefined;
            }
        }
        
        return current as MetaDataTemplateFieldProcessed;
    }

    /**
     * Gets the evaluated default value for a specific field
     */
    getFieldDefaultValue(fieldPath: string): FormFieldValue {
        const field = this.getFieldTemplate(fieldPath);
        if (!field) return "";
        
        if (field.default !== undefined) {
            // Check if it's a function descriptor and evaluate it
            if (this.isFunctionDescriptor(field.default)) {
                try {
                    return this.evaluator.evaluateFieldDefault(field, this.data) as FormFieldValue;
                } catch (error) {
                    logger.warn(`Failed to evaluate function default for ${fieldPath}:`, error);
                    return "";
                }
            } else {
                return field.default as FormFieldValue;
            }
        } else if (field.inputType === "list") {
            // Only return empty array if no default is specified
            return [];
        } else if (field.inputType === "number" && field.units) {
            const unit = field.defaultUnit || (Array.isArray(field.units) ? field.units[0] : field.units);
            return { value: null, unit };
        }
        
        return "";
    }

    /**
     * Gets all field paths that are defined in the template
     */
    getDefinedFieldPaths(): string[] {
        const paths: string[] = [];
        this.collectFieldPaths(this.currentTemplate, '', paths);
        return paths;
    }

    /**
     * Gets form data with default values populated from the metadata template
     * This is specifically for initializing the modal form inputs, not for final processing
     */
    async getFormDataWithDefaults(): Promise<FormData> {
        try {
            // Extract default values from template (skipping reactive functions)
            const defaultData = this.extractDefaultValuesFromTemplate(this.currentTemplate, "", 0);
            
            // IMPORTANT: Ensure we have a complete nested structure before reactive evaluation
            // Extract default values from ALL template levels, including those that might have been missed
            const completeDefaultData = this.extractAllDefaultValues(this.currentTemplate);
            
            // Merge in order: complete defaults -> partial defaults -> existing data
            const mergedData: FormData = { ...completeDefaultData, ...defaultData, ...this.data };

            // Process QueryDropdown returns to create return fields
            const dataWithQueryReturns = await this.processQueryDropdownReturns(mergedData);

            logger.debug('[getFormDataWithDefaults] Data after processing QueryDropdown returns:', dataWithQueryReturns);
            
            // Now evaluate reactive functions with the complete data context (including return fields)
            const finalData = this.evaluateReactiveFunctions(dataWithQueryReturns);
            
            logger.debug('[getFormDataWithDefaults] Final data after reactive evaluation:', finalData);
            
            return finalData;
        } catch (error) {
            logger.error('Error extracting form data with defaults:', error);
            // Fall back to original data if processing fails
            return this.data;
        }
    }

    /**
     * Extract default values from ALL levels of the template, including nested objects
     * This is a comprehensive fallback to ensure no defaults are missed
     */
    private extractAllDefaultValues(template: MetaDataTemplateProcessed, basePath: string = ''): FormData {
        const result: FormData = {};
        
        for (const [key, field] of Object.entries(template)) {
            const fieldPath = basePath ? `${basePath}.${key}` : key;
            
            if (field && typeof field === 'object' && !Array.isArray(field)) {
                // Check if this is a field with inputType (a field definition)
                if ('inputType' in field) {
                    const templateField = field as MetaDataTemplateFieldProcessed;
                    
                    // Check if this is an object list
                    if (templateField.inputType === "list" && 
                        templateField.listType === "object" &&
                        templateField.objectTemplate) {
                        
                        // Ensure objectTemplate functions are processed before extracting defaults
                        const objectTemplate = JSON.parse(JSON.stringify(templateField.objectTemplate));
                        this.evaluator.processDynamicFields(objectTemplate);
                        logger.debug(`[extractAllDefaultValues] Processed dynamic fields for ${fieldPath} objectTemplate`);
                        
                        // Process the objectTemplate to get defaults for each object
                        const objectDefaults = this.extractAllDefaultValues(
                            objectTemplate as MetaDataTemplateProcessed, 
                            fieldPath
                        );
                        
                        // Create initial objects based on initialItems
                        const initialItems = (templateField.initialItems as number) || 1;
                        const initialObjects: FormFieldValue[] = [];
                        
                        for (let i = 0; i < initialItems; i++) {
                            initialObjects.push({ ...objectDefaults } as FormFieldValue);
                        }
                        
                        this.setNestedValue(result, fieldPath, initialObjects as FormFieldValue);
                        logger.debug(`[extractAllDefaultValues] Created object list for ${fieldPath}:`, initialObjects);
                        
                    } else {
                        // Regular field processing
                        
                        // Check if it has an explicit default value
                        if ('default' in templateField && templateField.default !== undefined) {
                            const defaultValue = templateField.default;
                            
                            // Skip reactive functions (they'll be evaluated later)
                            if (this.isFunctionDescriptor(defaultValue) && this.hasReactiveDependencies(defaultValue)) {
                                // This is a reactive function - skip it
                                continue;
                            }
                            
                            // Set the default value
                            if (this.isFunctionDescriptor(defaultValue)) {
                                // Static function - evaluate it
                                try {
                                    const evaluatedValue = this.evaluator.evaluateFieldDefault(templateField, {});
                                    this.setNestedValue(result, fieldPath, evaluatedValue);
                                } catch (error) {
                                    logger.warn(`Failed to evaluate static function for ${fieldPath}:`, error);
                                }
                            } else {
                                // Simple default value - but check if it needs transformation for number+units
                                if (templateField.inputType === 'number' && templateField.units) {
                                    // Transform scalar default to structured format
                                    const unit = templateField.defaultUnit || 
                                        (Array.isArray(templateField.units) ? templateField.units[0] : templateField.units);
                                    this.setNestedValue(result, fieldPath, { 
                                        value: defaultValue === "" ? null : defaultValue, 
                                        unit 
                                    } as FormFieldValue);
                                    logger.debug(`[extractAllDefaultValues] Transformed number+units default for ${fieldPath}:`, { value: defaultValue, unit });
                                } else {
                                    this.setNestedValue(result, fieldPath, defaultValue as FormFieldValue);
                                }
                            }
                        } else {
                            // No explicit default - check if we can infer one based on inputType
                            const inferredDefault = this.inferDefaultValueForField(templateField, fieldPath);
                            if (inferredDefault !== undefined) {
                                this.setNestedValue(result, fieldPath, inferredDefault);
                                logger.debug(`[extractAllDefaultValues] Inferred default for ${fieldPath}:`, inferredDefault);
                            }
                        }
                    }
                } else {
                    // This is a nested object - recurse into it
                    const nestedDefaults = this.extractAllDefaultValues(field as MetaDataTemplateProcessed, fieldPath);
                    
                    // Merge nested defaults into result
                    for (const [nestedKey, nestedValue] of Object.entries(nestedDefaults)) {
                        this.setNestedValue(result, nestedKey, nestedValue);
                    }
                }
            }
        }
        
        return result;
    }

    /**
     * Process QueryDropdown returns to create return fields before modal rendering
     */
    private async processQueryDropdownReturns(data: FormData): Promise<FormData> {
        logger.debug('[processQueryDropdownReturns] Processing QueryDropdown returns:', {
            dataKeys: Object.keys(data)
        });

        const resultData = { ...data };
        const queryDropdownFields = this.findQueryDropdownFields(this.currentTemplate);
        
        logger.debug('[processQueryDropdownReturns] Found QueryDropdown fields:', queryDropdownFields);

        for (const fieldInfo of queryDropdownFields) {
            await this.processQueryDropdownField(fieldInfo, resultData);
        }

        logger.debug('[processQueryDropdownReturns] Final data with return fields:', resultData);
        return resultData;
    }

    /**
     * Find all QueryDropdown fields in the template
     */
    private findQueryDropdownFields(template: MetaDataTemplateProcessed, parentPath = ""): Array<{
        path: string;
        field: MetaDataTemplateFieldProcessed;
    }> {
        const queryFields: Array<{ path: string; field: MetaDataTemplateFieldProcessed }> = [];

        for (const [key, config] of Object.entries(template)) {
            const currentPath = parentPath ? `${parentPath}.${key}` : key;

            // Check if this is a template field (has inputType property)
            if (config && typeof config === 'object' && 'inputType' in config) {
                const field = config as MetaDataTemplateFieldProcessed;
                
                // Check if this field itself is a queryDropdown
                if (field.inputType === 'queryDropdown' || field.inputType === 'multiQueryDropdown') {
                    queryFields.push({ path: currentPath, field });
                }
                
                // Also check inside objectTemplate for list fields
                if (field.objectTemplate && typeof field.objectTemplate === 'object') {
                    logger.debug(`[findQueryDropdownFields] Searching inside objectTemplate for list field: ${currentPath}`);
                    // For object lists, we need to look inside objectTemplate for queryDropdowns
                    // The path for these fields should reflect that they're inside the list items
                    queryFields.push(...this.findQueryDropdownFields(
                        field.objectTemplate as MetaDataTemplateProcessed, 
                        `${currentPath}[0]` // Use [0] to indicate this is inside array items
                    ));
                }
            } else if (typeof config === 'object' && config !== null) {
                // Recursively search nested objects
                queryFields.push(...this.findQueryDropdownFields(config as MetaDataTemplateProcessed, currentPath));
            }
        }

        return queryFields;
    }

    /**
     * Process a single QueryDropdown field to execute query and populate return fields
     */
    private async processQueryDropdownField(fieldInfo: { path: string; field: MetaDataTemplateFieldProcessed }, data: FormData): Promise<void> {
        const { path, field } = fieldInfo;
        
        logger.debug(`[processQueryDropdownField] Processing field: ${path}`, {
            field: field,
            hasReturn: !!field.return,
            hasWhere: !!field.where,
            search: field.search,
            currentData: data // Add current data to see what's available
        });

        // Special debug for sample field
        if (path === 'sample') {
            const projectObj = data.project as Record<string, FormFieldValue>;
            logger.debug(`[processQueryDropdownField] SAMPLE FIELD DEBUG:`, {
                fullData: data,
                projectName: projectObj?.name || 'NOT FOUND in data.project.name',
                flatProjectName: data['project.name'] || 'NOT FOUND in data["project.name"]',
                projectObject: data.project
            });
        }

        // Skip if no valid query parameters
        // Accept either traditional search-based OR new frontmatter-based QueryDropdown
        const hasTraditionalQuery = field.search;
        const hasFrontmatterQuery = field.from && field.get;
        
        if (!hasTraditionalQuery && !hasFrontmatterQuery) {
            logger.debug(`[processQueryDropdownField] Skipping ${path} - no valid query parameters`, {
                hasSearch: !!field.search,
                hasFromAndGet: !!(field.from && field.get)
            });
            return;
        }

        try {
            // Handle frontmatter-based queries (from/get pattern)
            if (hasFrontmatterQuery) {
                logger.debug(`[processQueryDropdownField] Processing frontmatter-based query for: ${path}`);
                await this.processFrontmatterQuery(field, path, data);
                return;
            }
            
            // Use TemplateEvaluator to execute the template query for traditional search-based fields
            const { results, mapping } = this.evaluator.executeTemplateQuery({
                search: field.search,
                where: field.where,
                return: field.return,
                userData: data // Pass current form data for reactive where clause evaluation
            });
            
            logger.debug(`[processQueryDropdownField] Template query results for ${path}:`, {
                resultCount: results.length,
                mapping: mapping,
                hasReturn: !!field.return,
                results: results.map(r => ({ file: r.file.basename, returnValues: r.returnValues }))
            });

            // Check if this is a multiQueryDropdown
            const isMultiQuery = field.inputType === 'multiQueryDropdown';

            if (isMultiQuery) {
                // For multiQueryDropdown, populate as array of objects
                if (results.length > 0) {
                    const firstResult = results[0];
                    
                    if (field.return && Object.keys(mapping).length > 0 && firstResult.returnValues) {
                        // Has return clause - create object with mapped return values
                        const resultObject: Record<string, unknown> = {};
                        
                        for (const [sourceField] of Object.entries(mapping)) {
                            if (firstResult.returnValues[sourceField] !== undefined) {
                                // Extract just the field name (last part after the dot)
                                const targetFieldPath = this.getTargetFieldPath(field.return, sourceField);
                                if (targetFieldPath) {
                                    const fieldName = targetFieldPath.split('.').pop()!;
                                    resultObject[fieldName] = firstResult.returnValues[sourceField];
                                }
                            }
                        }
                        
                        // Set the entire field to an array containing the result object
                        this.setNestedValue(data, path, [resultObject]);
                        
                        logger.debug(`[processQueryDropdownField] Set multiQueryDropdown ${path} as array with return values:`, {
                            fieldPath: path,
                            value: [resultObject]
                        });
                    } else {
                        // No return clause - use file basename directly as array of simple values
                        this.setNestedValue(data, path, [firstResult.file.basename]);
                        logger.debug(`[processQueryDropdownField] Set multiQueryDropdown ${path} as array with file basename:`, {
                            fieldPath: path,
                            value: [firstResult.file.basename]
                        });
                    }
                } else {
                    // No results - initialize as empty array
                    this.setNestedValue(data, path, []);
                }
            } else {
                // For regular queryDropdown
                if (field.return) {
                    // Has return clause - populate return fields
                    this.initializeReturnFields(field.return, data);

                    if (results.length > 0 && Object.keys(mapping).length > 0) {
                        const firstResult = results[0];
                        
                        if (firstResult.returnValues) {
                            for (const [sourceField] of Object.entries(mapping)) {
                                if (firstResult.returnValues[sourceField] !== undefined) {
                                    // Use the full target field path from the return clause
                                    const targetFieldPath = this.getTargetFieldPath(field.return, sourceField);
                                    if (targetFieldPath) {
                                        this.setNestedValue(data, targetFieldPath, firstResult.returnValues[sourceField]);
                                        
                                        logger.debug(`[processQueryDropdownField] Set return field ${targetFieldPath} = ${firstResult.returnValues[sourceField]}`, {
                                            fieldPath: path,
                                            sourceField: sourceField,
                                            targetFieldPath: targetFieldPath,
                                            value: firstResult.returnValues[sourceField]
                                        });
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // No return clause - assign file basename directly to the field
                    if (results.length > 0) {
                        const firstResult = results[0];
                        this.setNestedValue(data, path, firstResult.file.basename);
                        logger.debug(`[processQueryDropdownField] Set queryDropdown ${path} to file basename:`, {
                            fieldPath: path,
                            value: firstResult.file.basename
                        });
                    }
                }
            }

        } catch (error) {
            logger.error(`[processQueryDropdownField] Error processing ${path}:`, error);
        }
    }

    /**
     * Process frontmatter-based query (from/get pattern) for queryDropdown fields.
     * Evaluates the from function to get target note, loads frontmatter, evaluates get to get options,
     * takes first option as default, and evaluates return functions.
     */
    private async processFrontmatterQuery(
        field: MetaDataTemplateFieldProcessed,
        fieldPath: string,
        data: FormData
    ): Promise<void> {
        logger.debug(`[processFrontmatterQuery] Starting for field: ${fieldPath}`, {
            hasFrom: !!field.from,
            hasGet: !!field.get,
            hasReturn: !!field.return
        });

        try {
            // 1. Evaluate 'from' function to get target note name
            if (!field.from || typeof field.from !== 'object' || field.from.type !== 'function') {
                logger.warn(`[processFrontmatterQuery] No valid 'from' function for ${fieldPath}`);
                return;
            }

            const targetNoteName = this.evaluator.evaluateUserInputFunction(field.from as AnyFunctionDescriptor, data);
            
            if (!targetNoteName || typeof targetNoteName !== 'string') {
                logger.debug(`[processFrontmatterQuery] No valid target note name from 'from' function for ${fieldPath}:`, targetNoteName);
                // Initialize return fields with empty values
                if (field.return) {
                    this.initializeReturnFields(field.return, data);
                }
                return;
            }

            logger.debug(`[processFrontmatterQuery] Target note from 'from' function: ${targetNoteName}`);

            // 2. Load frontmatter from target note
            const files = this.plugin.app.vault.getMarkdownFiles();
            const targetFile = files.find(f => f.basename === targetNoteName);
            
            if (!targetFile) {
                logger.debug(`[processFrontmatterQuery] Target note not found: ${targetNoteName}`);
                if (field.return) {
                    this.initializeReturnFields(field.return, data);
                }
                return;
            }

            const cache = this.plugin.app.metadataCache.getFileCache(targetFile);
            const frontmatter = cache?.frontmatter || null;

            logger.debug(`[processFrontmatterQuery] Loaded frontmatter from ${targetNoteName}:`, {
                hasFrontmatter: !!frontmatter,
                frontmatter: frontmatter
            });

            // 3. Evaluate 'get' function with queryDropdown context (frontmatter only, no selection yet)
            if (!field.get || typeof field.get !== 'object' || field.get.type !== 'function') {
                logger.warn(`[processFrontmatterQuery] No valid 'get' function for ${fieldPath}`);
                if (field.return) {
                    this.initializeReturnFields(field.return, data);
                }
                return;
            }
            
            const getContext: QueryDropdownContext = {
                selection: null,
                frontmatter: frontmatter,
                file: {
                    name: targetFile.basename,
                    link: this.plugin.app.fileManager.generateMarkdownLink(targetFile, ''),
                    path: targetFile.path
                }
            };

            // Access the function evaluator through a public method
            // We need to add a method to TemplateEvaluator or access functionEvaluator directly
            const evaluator = this.evaluator as any;
            const options = evaluator.functionEvaluator.evaluateFunction(
                field.get as AnyFunctionDescriptor,
                data,
                undefined,
                undefined,
                getContext
            );

            if (!Array.isArray(options) || options.length === 0) {
                logger.debug(`[processFrontmatterQuery] No options from 'get' function for ${fieldPath}:`, options);
                if (field.return) {
                    this.initializeReturnFields(field.return, data);
                }
                return;
            }

            logger.debug(`[processFrontmatterQuery] Options from 'get' function:`, options);

            // 4. Take first option as default selection
            const defaultSelection = options[0];
            
            logger.debug(`[processFrontmatterQuery] Default selection: ${defaultSelection}`);

            // 5. Evaluate return functions with full queryDropdown context (selection + frontmatter)
            if (!field.return) {
                logger.debug(`[processFrontmatterQuery] No 'return' clause for ${fieldPath}`);
                return;
            }

            const returnContext: QueryDropdownContext = {
                selection: defaultSelection,
                frontmatter: frontmatter,
                file: getContext.file
            };

            // Process each return function
            if (typeof field.return === 'object' && !Array.isArray(field.return)) {
                for (const [targetFieldPath, returnFunction] of Object.entries(field.return)) {
                    if (typeof returnFunction !== 'object' || (returnFunction as any).type !== 'function') {
                        logger.warn(`[processFrontmatterQuery] Return function for ${targetFieldPath} is not valid`);
                        continue;
                    }

                    try {
                        const returnValue = evaluator.functionEvaluator.evaluateFunction(
                            returnFunction as AnyFunctionDescriptor,
                            data,
                            undefined,
                            undefined,
                            returnContext
                        );

                        this.setNestedValue(data, targetFieldPath, returnValue);

                        logger.debug(`[processFrontmatterQuery] Set return field ${targetFieldPath} = ${returnValue}`, {
                            fieldPath: fieldPath,
                            targetFieldPath: targetFieldPath,
                            value: returnValue
                        });
                    } catch (error) {
                        logger.error(`[processFrontmatterQuery] Error evaluating return function for ${targetFieldPath}:`, error);
                    }
                }
            }

        } catch (error) {
            logger.error(`[processFrontmatterQuery] Error processing ${fieldPath}:`, error);
            // Initialize return fields with empty values on error
            if (field.return) {
                this.initializeReturnFields(field.return, data);
            }
        }
    }

    /**
     * Get the full target field path from return clause
     */
    private getTargetFieldPath(returnClause: QueryReturnClause, sourceField: string): string | undefined {
        if (typeof returnClause === 'object' && returnClause !== null && !Array.isArray(returnClause)) {
            for (const [targetFieldPath, returnSourceField] of Object.entries(returnClause)) {
                if (returnSourceField === sourceField) {
                    return targetFieldPath;
                }
            }
        }
        return undefined;
    }

    /**
     * Handle QueryDropdown value changes and populate return fields
     */
    populateQueryDropdownReturnFields(fieldPath: string, selectedFile: string, returnClause: QueryReturnClause): void {
        if (!selectedFile || !returnClause) return;

        try {
            // Find the selected file and extract return values
            const files = this.plugin.app.vault.getMarkdownFiles();
            const file = files.find(f => f.basename === selectedFile);
            
            if (!file) {
                logger.warn(`[populateQueryDropdownReturnFields] File not found: ${selectedFile}`);
                return;
            }

            // Extract return values from the selected file using TemplateEvaluator
            const returnFields = this.evaluator.extractReturnFields(returnClause);
            const results = this.queryEngine.search({ 
                tags: [], // No tag filter needed since we have specific file
                return: returnFields 
            }).filter(r => r.file.basename === selectedFile);

            if (results.length > 0 && results[0].returnValues) {
                const returnValues = results[0].returnValues;
                
                // Map return values to target fields using full target field paths
                if (typeof returnClause === 'object' && !Array.isArray(returnClause)) {
                    for (const [targetFieldPath, sourceField] of Object.entries(returnClause)) {
                        if (typeof sourceField === 'string' && returnValues[sourceField] !== undefined) {
                            this.setNestedValue(this.data, targetFieldPath, returnValues[sourceField]);
                            
                            logger.debug(`[populateQueryDropdownReturnFields] Set ${targetFieldPath} = ${returnValues[sourceField]}`, {
                                fieldPath: fieldPath,
                                selectedFile: selectedFile,
                                targetFieldPath: targetFieldPath,
                                sourceField: sourceField,
                                value: returnValues[sourceField]
                            });
                        }
                    }
                }
            }

        } catch (error) {
            logger.error(`[populateQueryDropdownReturnFields] Error for ${fieldPath}:`, error);
        }
    }

    /**
     * Initialize return fields with empty values so reactive dependencies are satisfied
     */
    private initializeReturnFields(returnClause: QueryReturnClause, data: FormData): void {
        if (typeof returnClause === 'object' && returnClause !== null && !Array.isArray(returnClause)) {
            for (const [targetField, sourceField] of Object.entries(returnClause)) {
                if (typeof targetField === 'string') {
                    // Initialize the target field with empty string so reactive dependencies work
                    this.setNestedValue(data, targetField, "");
                    
                    logger.debug(`[initializeReturnFields] Initialized return field ${targetField} = ""`, {
                        targetField: targetField,
                        sourceField: sourceField
                    });
                }
            }
        }
    }

    /**
     * Populate return fields based on query results and current field value
     */
    private populateReturnFields(
        fieldPath: string, 
        currentValue: unknown, 
        results: SearchResult[], 
        returnMapping: { queryReturn: string[]; mapping: Record<string, string> }, 
        data: FormData
    ): void {
        logger.debug(`[populateReturnFields] Populating return fields for ${fieldPath}:`, {
            currentValue,
            resultCount: results.length,
            mapping: returnMapping.mapping
        });

        if (!currentValue && results.length > 0) {
            // No current value - populate with first result as default to create the fields
            const firstResult = results[0];
            if (firstResult?.returnValues) {
                for (const [sourceField, targetField] of Object.entries(returnMapping.mapping)) {
                    if (firstResult.returnValues[sourceField] !== undefined) {
                        this.setNestedValue(data, targetField, firstResult.returnValues[sourceField]);
                        logger.debug(`[populateReturnFields] Set ${targetField} = ${firstResult.returnValues[sourceField]} (default from first result)`);
                    }
                }
            }
        }
    }

    /**
     * Process query return clause to extract field mappings
     */
    private processQueryReturnClause(returnClause: unknown): { queryReturn: string[]; mapping: Record<string, string> } {
        const queryReturn: string[] = [];
        const mapping: Record<string, string> = {};

        if (typeof returnClause === 'object' && returnClause !== null) {
            for (const [targetField, sourceField] of Object.entries(returnClause)) {
                if (typeof sourceField === 'string') {
                    queryReturn.push(sourceField);
                    mapping[sourceField] = targetField;
                }
            }
        }

        return { queryReturn, mapping };
    }

    /**
     * Infer a default value for a field based on its inputType and options
     */
    private inferDefaultValueForField(field: MetaDataTemplateFieldProcessed, fieldPath: string): FormFieldValue | undefined {
        switch (field.inputType) {
            case 'dropdown':
            case 'subclass':
            case 'queryDropdown':
                // For dropdowns (including query dropdowns), use the first option as default if available
                // Query dropdowns should select first result if query returns results
                return this.getFirstOptionAsDefault(field, fieldPath);
                
            case 'list':
                // Lists default to empty arrays
                return [];
                
            case 'multiselect':
                // Multiselect fields default to empty arrays
                return [];
                
            case 'number':
                if (field.units) {
                    // Number fields with units get a structured default
                    const unit = field.defaultUnit || (Array.isArray(field.units) ? field.units[0] : field.units);
                    return { value: null, unit };
                }
                return null;
                
            case 'text':
            case 'actiontext':
                return '';
                
            case 'boolean':
                return false;
                
            case 'date':
                return new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
                
            case 'editableObject':
                return {}; // Empty object for editable objects
                
            case 'multiQueryDropdown':
                // Multi-select query dropdowns default to empty array
                logger.debug(`[inferDefaultValueForField] MultiQueryDropdown field "${fieldPath}" - defaulting to empty array`);
                return [];
                
            default:
                return undefined; // No default can be inferred
        }
    }

    /**
     * Get the first option from a dropdown/subclass field as the default value
     */
    private getFirstOptionAsDefault(field: MetaDataTemplateFieldProcessed, fieldPath: string): string | undefined {
        if (!field.options) {
            return undefined;
        }
        
        try {
            let options: string[] = [];
            
            if (Array.isArray(field.options)) {
                // Static options array
                options = field.options;
            } else if (typeof field.options === 'function') {
                // Dynamic options function - evaluate it
                const evaluatedOptions = (field.options as (data: JSONObject) => unknown)({} as JSONObject);
                options = Array.isArray(evaluatedOptions) ? evaluatedOptions : [];
            } else if (this.isFunctionDescriptor(field.options)) {
                // Function descriptor for options
                try {
                    const evaluatedOptions = this.evaluator.evaluateFieldDefault(
                        { ...field, default: field.options } as MetaDataTemplateFieldProcessed, 
                        {}
                    );
                    options = Array.isArray(evaluatedOptions) ? evaluatedOptions : [];
                } catch (error) {
                    logger.warn(`Failed to evaluate options function for ${fieldPath}:`, error);
                    return undefined;
                }
            }
            
            if (options.length > 0) {
                logger.debug(`[extractAllDefaultValues] Using first option as default for ${fieldPath}:`, options[0]);
                return options[0];
            }
        } catch (error) {
            logger.warn(`Failed to get options for dropdown field ${fieldPath}:`, error);
        }
        
        return undefined;
    }

    /**
     * Gets fresh form data for subclass changes - only uses template defaults and preserved user data
     * This ensures clean data after subclass template application
     */
    async getFormDataForSubclassChange(): Promise<FormData> {
        try {
            // Debug: Check current data before processing
            this.debugFlatFields('TemplateManager.data before getFormDataForSubclassChange', this.data);
            
            // Extract default values from template (static functions only)
            const defaultData = this.extractDefaultValuesFromTemplate(this.currentTemplate, "", 0);
            this.debugFlatFields('extractDefaultValuesFromTemplate result', defaultData);
            
            // IMPORTANT: Also extract ALL default values to ensure completeness
            const completeDefaultData = this.extractAllDefaultValues(this.currentTemplate);
            this.debugFlatFields('extractAllDefaultValues result', completeDefaultData);
            
            // Only preserve user data for fields that still exist in the template
            const currentTemplatePaths = this.getDefinedFieldPaths();
            const preservedUserData: FormData = {};
            
            for (const [key, value] of Object.entries(this.data)) {
                logger.debug('[TemplateManager] Checking user data key for preservation:', {
                    key,
                    value,
                    hasValue: value !== undefined && value !== null && value !== "",
                    isFlat: key.includes('.'),
                    isInTemplatePaths: currentTemplatePaths.includes(key)
                });
                
                // Skip flat fields - they should not be preserved
                if (key.includes('.')) {
                    logger.debug('[TemplateManager] Skipping flat field during preservation:', key);
                    continue;
                }
                
                // CRITICAL FIX: Check if this value looks like a template config object (has "inputType", "query", etc.)
                // Template config objects should NEVER be in user data
                if (value && typeof value === 'object' && !Array.isArray(value) && 'inputType' in value) {
                    logger.warn('[TemplateManager] 🚨 FOUND TEMPLATE CONFIG IN DATA - SKIPPING:', {
                        key,
                        value,
                        message: 'Template config objects should not be in user data!'
                    });
                    continue;
                }
                
                // Keep user data only if the field still exists in the template
                if (currentTemplatePaths.includes(key)) {
                    preservedUserData[key] = value;
                    logger.debug('[TemplateManager] Preserved user data:', { key, value });
                } else {
                    logger.debug('[TemplateManager] Skipping user data (not in template):', { key, value });
                }
            }
            this.debugFlatFields('preservedUserData', preservedUserData);
            
            // Deep merge: complete defaults -> partial defaults -> preserved user data
            // Use deep merge to ensure object array items get merged field-by-field
            const mergedData = this.deepMergeFormData(completeDefaultData, defaultData, preservedUserData);
            this.debugFlatFields('mergedData before query returns', mergedData);
            
            // Process QueryDropdown returns to repopulate return fields (like project.name, project.type, etc.)
            const dataWithQueryReturns = await this.processQueryDropdownReturns(mergedData);
            this.debugFlatFields('dataWithQueryReturns', dataWithQueryReturns);
            
            // Now evaluate reactive functions with the complete data context
            const finalData = this.evaluateReactiveFunctions(dataWithQueryReturns);
            this.debugFlatFields('finalData after reactive evaluation', finalData);
            
            logger.debug('[TemplateManager] Generated form data for subclass change:', {
                templateDefaultsCount: Object.keys(defaultData).length,
                preservedUserDataCount: Object.keys(preservedUserData).length,
                finalDataCount: Object.keys(finalData).length,
                subclassFieldValue: finalData[this.findSubclassFieldKey() || 'type']
            });
            
            return finalData;
        } catch (error) {
            logger.error('Error generating form data for subclass change:', error);
            // Fall back to current cleaned data if processing fails
            return this.data;
        }
    }

    private debugFlatFields(context: string, data: FormData): void {
        const flatFields = Object.keys(data).filter(key => key.includes('.'));
        if (flatFields.length > 0) {
            logger.error(`🚨 FLAT FIELDS DETECTED [${context}]:`, flatFields);
            logger.error(`🔍 Full data [${context}]:`, data);
            
            // Log stack trace to see where this was called from
            logger.error(`📍 Stack trace [${context}]:`, new Error().stack);
        } else {
            logger.debug(`✅ No flat fields found [${context}]`);
        }
    }

    /**
     * Deep merge multiple FormData objects, properly handling arrays of objects
     * For arrays of objects (like objectTemplate lists), merge each object's properties individually
     */
    private deepMergeFormData(...sources: FormData[]): FormData {
        const result: FormData = {};
        
        for (const source of sources) {
            for (const [key, value] of Object.entries(source)) {
                if (value === undefined || value === null) {
                    // Skip undefined/null values - they shouldn't override existing values
                    continue;
                }
                
                if (!result[key]) {
                    // Key doesn't exist in result yet - just assign it
                    result[key] = value;
                } else if (Array.isArray(value) && Array.isArray(result[key])) {
                    // Both are arrays - need special handling for arrays of objects
                    const resultArray = result[key] as FormFieldValue[];
                    const sourceArray = value as FormFieldValue[];
                    
                    // Check if this is an array of objects (objectTemplate list)
                    const isObjectArray = sourceArray.some(item => 
                        item !== null && typeof item === 'object' && !Array.isArray(item)
                    );
                    
                    if (isObjectArray) {
                        // Array of objects - merge each object at same index
                        const mergedArray: FormFieldValue[] = [];
                        const maxLength = Math.max(resultArray.length, sourceArray.length);
                        
                        for (let i = 0; i < maxLength; i++) {
                            const resultItem = resultArray[i];
                            const sourceItem = sourceArray[i];
                            
                            if (resultItem && sourceItem && 
                                typeof resultItem === 'object' && !Array.isArray(resultItem) &&
                                typeof sourceItem === 'object' && !Array.isArray(sourceItem)) {
                                // Both items are objects - deep merge them
                                mergedArray[i] = this.deepMergeFormData(
                                    resultItem as FormData, 
                                    sourceItem as FormData
                                ) as FormFieldValue;
                            } else if (sourceItem !== undefined) {
                                // Source has a value - use it
                                mergedArray[i] = sourceItem;
                            } else {
                                // Only result has a value - use it
                                mergedArray[i] = resultItem;
                            }
                        }
                        
                        result[key] = mergedArray as FormFieldValue;
                    } else {
                        // Array of primitives - source overwrites result
                        result[key] = value;
                    }
                } else if (typeof value === 'object' && !Array.isArray(value) &&
                           typeof result[key] === 'object' && !Array.isArray(result[key])) {
                    // Both are objects (not arrays) - recursively merge
                    result[key] = this.deepMergeFormData(
                        result[key] as FormData, 
                        value as FormData
                    ) as FormFieldValue;
                } else {
                    // Primitive value or type mismatch - source overwrites result
                    result[key] = value;
                }
            }
        }
        
        return result;
    }

    /**
     * Type guard to check if a value is a function descriptor (either format)
     */
    private isFunctionDescriptor(value: unknown): value is AnyFunctionDescriptor {
        return typeof value === 'object' && 
               value !== null && 
               'type' in value && 
               (value as { type: unknown }).type === 'function';
    }

    /**
     * Type guard to check if a value is an enhanced function descriptor
     */
    public isEnhancedFunctionDescriptor(value: unknown): value is EnhancedFunctionDescriptor {
        return this.isFunctionDescriptor(value) && 
               'context' in value && 
               'reactiveDeps' in value &&
               'function' in value;
    }

    /**
     * Type guard to check if a value is a legacy function descriptor
     */
    private isLegacyFunctionDescriptor(value: unknown): value is FunctionDescriptor {
        return this.isFunctionDescriptor(value) && 
               'value' in value && 
               typeof (value as FunctionDescriptor).value === 'string';
    }

    /**
     * Check if a function descriptor has reactive dependencies (any format: NEW, enhanced, or legacy)
     */
    private hasReactiveDependencies(descriptor: unknown): boolean {
        // Check for NEW SimpleFunctionDescriptor or enhanced format (both use reactiveDeps)
        if (this.isFunctionDescriptor(descriptor) && 'reactiveDeps' in descriptor) {
            const deps = (descriptor as { reactiveDeps?: string[] }).reactiveDeps;
            return !!(deps && deps.length > 0);
        }
        // Check for legacy format (uses userInputs)
        if (this.isLegacyFunctionDescriptor(descriptor)) {
            return !!(descriptor.userInputs && descriptor.userInputs.length > 0);
        }
        return false;
    }

    /**
     * Get reactive dependencies from any function descriptor format (NEW, enhanced, or legacy)
     */
    private getReactiveDependencies(descriptor: unknown): string[] {
        // Check for NEW SimpleFunctionDescriptor or enhanced format (both use reactiveDeps)
        if (this.isFunctionDescriptor(descriptor) && 'reactiveDeps' in descriptor) {
            return (descriptor as { reactiveDeps?: string[] }).reactiveDeps || [];
        }
        // Check for legacy format (uses userInputs)
        if (this.isLegacyFunctionDescriptor(descriptor)) {
            return descriptor.userInputs || [];
        }
        return [];
    }

    /**
     * Recursively extracts default values from template for form initialization
     */
    private extractDefaultValuesFromTemplate(template: MetaDataTemplateProcessed, parentKey = "", depth = 0): FormData {
        const result: FormData = {};
        
        // Prevent infinite recursion with depth limit
        if (depth > 10) {
            logger.error(`[extractDefaultValuesFromTemplate] RECURSION LIMIT REACHED at depth ${depth}, parentKey: "${parentKey}"`);
            return result;
        }
        
        logger.debug(`[extractDefaultValuesFromTemplate] Processing template at depth ${depth}, parentKey: "${parentKey}", keys: ${Object.keys(template).join(', ')}`);
        
        for (const [key, config] of Object.entries(template)) {
            
            // More robust nested object detection
            // A nested object is an object that contains field definitions but is not itself a field definition
            // Field definitions have inputType, function descriptors have type="function"
            // Query configurations have "query" in them
            const isNestedObject = (
                config !== null &&
                typeof config === "object" &&
                !Array.isArray(config) &&
                // Not a field definition (doesn't have inputType)
                !("inputType" in config) &&
                // Not a function descriptor (doesn't have type="function")
                !(("type" in config) && config.type === "function") &&
                // Not a query configuration
                !("query" in config) &&
                // Must have at least one property (empty objects aren't useful)
                Object.keys(config).length > 0
            );

            // Check if this is an object list (list of objects with objectTemplate)
            const isObjectList = (
                config !== null &&
                typeof config === "object" &&
                !Array.isArray(config) &&
                "inputType" in config &&
                config.inputType === "list" &&
                "listType" in config &&
                config.listType === "object" &&
                "objectTemplate" in config &&
                config.objectTemplate &&
                typeof config.objectTemplate === "object"
            );
            
            logger.debug(`[extractDefaultValuesFromTemplate] Key "${key}" isNestedObject: ${isNestedObject}, isObjectList: ${isObjectList}`);
            
            if (isObjectList) {
                // Handle object lists - create initial objects based on objectTemplate and initialItems
                const field = config as MetaDataTemplateFieldProcessed;
                const initialItems = (field.initialItems as number) || 1;
                logger.debug(`[extractDefaultValuesFromTemplate] Processing object list: ${key} with ${initialItems} initial items`);
                
                // Ensure objectTemplate functions are processed before extracting defaults
                const objectTemplate = JSON.parse(JSON.stringify(field.objectTemplate));
                this.evaluator.processDynamicFields(objectTemplate);
                logger.debug(`[extractDefaultValuesFromTemplate] Processed dynamic fields for ${key} objectTemplate`);
                
                // Extract defaults from the processed objectTemplate
                const objectDefaults = this.extractDefaultValuesFromTemplate(
                    objectTemplate as MetaDataTemplateProcessed, 
                    `${key}[template]`, 
                    depth + 1
                );
                logger.debug(`[extractDefaultValuesFromTemplate] Object template defaults for ${key}:`, objectDefaults);
                
                // Create array with initial objects
                const initialObjects: FormFieldValue[] = [];
                for (let i = 0; i < initialItems; i++) {
                    initialObjects.push({ ...objectDefaults } as FormFieldValue);
                }
                
                result[key] = initialObjects as FormFieldValue;
                logger.debug(`[extractDefaultValuesFromTemplate] Created initial objects for ${key}:`, initialObjects);
            } else if (isNestedObject) {
                // Recursively process nested objects
                logger.debug(`[extractDefaultValuesFromTemplate] Processing nested object: ${key} under parent: ${parentKey} at depth ${depth}`);
                result[key] = this.extractDefaultValuesFromTemplate(config as MetaDataTemplateProcessed, key, depth + 1);
                logger.debug(`[extractDefaultValuesFromTemplate] Nested result for ${key}:`, result[key]);
            } else {
                const field = config as MetaDataTemplateFieldProcessed;
                
                // Skip editableObject fields - they should start empty
                if (field.inputType === "editableObject") {
                    // Don't set any default value for editableObject fields
                    continue;
                }
                
                if (field.default !== undefined) {
                    // Check if it's a function descriptor
                    if (this.isFunctionDescriptor(field.default)) {
                        try {
                            // Evaluate ALL function descriptors (both static and reactive)
                            // Reactive functions will use current this.data values and re-evaluate when dependencies change
                            if (this.hasReactiveDependencies(field.default)) {
                                const dependencies = this.getReactiveDependencies(field.default);
                                logger.debug(`[extractDefaultValuesFromTemplate] Evaluating REACTIVE function for: ${key} with current data (dependencies: ${dependencies.join(', ')})`);
                            } else {
                                logger.debug(`[extractDefaultValuesFromTemplate] Evaluating static function for: ${key}, parentKey: ${parentKey}`);
                            }
                            
                            // Use TemplateEvaluator's safe evaluation method with current this.data
                            const evaluatedValue = this.evaluator.evaluateFieldDefault(field, this.data) as FormFieldValue;
                            result[key] = evaluatedValue;
                            logger.debug(`[extractDefaultValuesFromTemplate] Function evaluation result for ${key}:`, evaluatedValue);
                        } catch (error) {
                            logger.warn(`Failed to evaluate function default for ${key}:`, error);
                            // Fall back to a reasonable default based on fallback or field type
                            if (this.isFunctionDescriptor(field.default) && 'fallback' in field.default) {
                                result[key] = field.default.fallback as FormFieldValue;
                            } else if (field.inputType === "list") {
                                result[key] = [];
                            } else {
                                result[key] = "";
                            }
                        }
                    } else {
                        // Use the default value directly - but check if it needs transformation for number+units
                        if (field.inputType === 'number' && field.units) {
                            // Transform scalar default to structured format
                            const unit = field.defaultUnit || 
                                (Array.isArray(field.units) ? field.units[0] : field.units);
                            result[key] = { 
                                value: field.default === "" ? null : field.default, 
                                unit 
                            } as FormFieldValue;
                            logger.debug(`[extractDefaultValuesFromTemplate] Transformed number+units default for ${key}:`, { value: field.default, unit });
                        } else {
                            logger.debug(`[extractDefaultValuesFromTemplate] Using direct default for ${key}:`, field.default);
                            result[key] = field.default;
                        }
                    }
                } else {
                    // No explicit default - always infer one based on inputType to ensure no fields are undefined
                    const inferredDefault = this.inferDefaultValueForField(field, key);
                    // If inferDefaultValueForField returns undefined, use a basic fallback based on inputType
                    if (inferredDefault !== undefined) {
                        result[key] = inferredDefault;
                        logger.debug(`[extractDefaultValuesFromTemplate] Inferred default for ${key} (inputType: ${field.inputType}):`, inferredDefault);
                    } else {
                        // Final fallback to prevent undefined values
                        const fallbackDefault = field.inputType === "list" ? [] : "";
                        result[key] = fallbackDefault;
                        logger.debug(`[extractDefaultValuesFromTemplate] Using fallback default for ${key} (inputType: ${field.inputType}):`, fallbackDefault);
                    }
                }
            }
        }
        
        logger.debug(`[extractDefaultValuesFromTemplate] Final result for parentKey "${parentKey}":`, result);
        this.debugFlatFields(`extractDefaultValuesFromTemplate result for "${parentKey}"`, result);
        
        return result;
    }

    /**
     * Evaluate all reactive functions (those with userInputs) after template is fully processed
     */
    evaluateReactiveFunctions(userData: FormData): FormData {
        const result = { ...userData };
        
        logger.debug('[evaluateReactiveFunctions] Evaluating reactive functions with data:', userData);
        
        this.evaluateReactiveFunctionsInTemplate(this.currentTemplate, result);
        
        return result;
    }
    
    /**
     * Recursively evaluate reactive functions in a template
     */
    private evaluateReactiveFunctionsInTemplate(template: MetaDataTemplateProcessed, userData: FormData, basePath: string = ''): void {
        for (const [key, field] of Object.entries(template)) {
            const fieldPath = basePath ? `${basePath}.${key}` : key;
            
            if (field && typeof field === 'object') {
                if ('inputType' in field) {
                    // This is a template field - check if it has reactive dependencies
                    const templateField = field as MetaDataTemplateFieldProcessed;
                    
                    // Check for reactive dependencies in default field
                    if (this.isFunctionDescriptor(templateField.default) && 
                        this.hasReactiveDependencies(templateField.default)) {
                        
                        // Check if all dependencies are satisfied (exist in userData, even if empty string)
                        const dependencies = this.getReactiveDependencies(templateField.default);
                        const allDependenciesSatisfied = dependencies.every((dep: string) => {
                            const depValue = this.getNestedValue(userData, dep);
                            // Consider dependency satisfied if it exists (not undefined/null)
                            // Empty string IS a valid value for text/dropdown fields
                            return depValue !== undefined && depValue !== null;
                        });
                        
                        if (allDependenciesSatisfied) {
                            try {
                                logger.debug(`[evaluateReactiveFunctions] Evaluating reactive function for ${fieldPath}, dependencies:`, dependencies);
                                const evaluatedValue = this.evaluator.evaluateFieldDefault(templateField, userData) as FormFieldValue;
                                this.setNestedValue(userData, fieldPath, evaluatedValue);
                                logger.debug(`[evaluateReactiveFunctions] Set ${fieldPath} =`, evaluatedValue);
                            } catch (error) {
                                logger.warn(`Failed to evaluate reactive function for ${fieldPath}:`, error);
                            }
                        } else {
                            logger.debug(`[evaluateReactiveFunctions] Dependencies not satisfied for ${fieldPath}:`, {
                                dependencies,
                                values: dependencies.map((dep: string) => ({ [dep]: this.getNestedValue(userData, dep) }))
                            });
                        }
                    }
                    
                    // Check for reactive dependencies in QueryDropdown where clauses
                    if (this.hasReactiveQueryDropdownDependencies(templateField)) {
                        const dependencies = this.getQueryDropdownReactiveDependencies(templateField);
                        logger.debug(`[evaluateReactiveFunctions] Found reactive QueryDropdown ${fieldPath} with dependencies:`, dependencies);
                        
                        // For now, just log that we found a reactive QueryDropdown
                        // The actual reprocessing will be handled by the InputManager when dependencies change
                        // TODO: Implement proper QueryDropdown reactive update mechanism
                    }
                } else {
                    // This is a nested object - recurse
                    this.evaluateReactiveFunctionsInTemplate(field as MetaDataTemplateProcessed, userData, fieldPath);
                }
            }
        }
    }

    /**
     * Check if a QueryDropdown field has reactive dependencies in its where clause
     */
    private hasReactiveQueryDropdownDependencies(field: MetaDataTemplateFieldProcessed): boolean {
        if (field.inputType !== 'queryDropdown' || !field.where) {
            return false;
        }

        // Handle array-style where clauses
        if (Array.isArray(field.where)) {
            return field.where.some((whereClause) => {
                if (whereClause.is && typeof whereClause.is === 'object' && 
                    this.isFunctionDescriptor(whereClause.is) && 
                    this.hasReactiveDependencies(whereClause.is)) {
                    return true;
                }
                return false;
            });
        }

        return false;
    }

    /**
     * Get reactive dependencies from a QueryDropdown field's where clause
     */
    private getQueryDropdownReactiveDependencies(field: MetaDataTemplateFieldProcessed): string[] {
        if (field.inputType !== 'queryDropdown' || !field.where) {
            return [];
        }

        const deps: string[] = [];
        
        // Handle array-style where clauses
        if (Array.isArray(field.where)) {
            field.where.forEach((whereClause) => {
                if (whereClause.is && typeof whereClause.is === 'object' && 
                    this.isFunctionDescriptor(whereClause.is) && 
                    this.hasReactiveDependencies(whereClause.is)) {
                    const clauseDeps = this.getReactiveDependencies(whereClause.is);
                    deps.push(...clauseDeps);
                }
            });
        }
        
        return deps;
    }

    /**
     * Get all reactive fields from the template for InputManager registration
     * Returns both fields with reactive default values and QueryDropdown fields with reactive where clauses
     */
    public getReactiveFieldsForRegistration(): Array<{
        fieldPath: string;
        dependencies: string[];
        type: 'default' | 'queryDropdown';
        field: MetaDataTemplateFieldProcessed;
    }> {
        const reactiveFields: Array<{
            fieldPath: string;
            dependencies: string[];
            type: 'default' | 'queryDropdown';
            field: MetaDataTemplateFieldProcessed;
        }> = [];

        this.collectReactiveFieldsFromTemplate(this.currentTemplate, '', reactiveFields);
        
        logger.debug('[getReactiveFieldsForRegistration] Found reactive fields:', reactiveFields.map(f => ({
            path: f.fieldPath,
            type: f.type,
            dependencies: f.dependencies
        })));
        
        return reactiveFields;
    }

    /**
     * Recursively collect reactive fields from template
     */
    private collectReactiveFieldsFromTemplate(
        template: MetaDataTemplateProcessed, 
        basePath: string, 
        reactiveFields: Array<{
            fieldPath: string;
            dependencies: string[];
            type: 'default' | 'queryDropdown';
            field: MetaDataTemplateFieldProcessed;
        }>
    ): void {
        for (const [key, field] of Object.entries(template)) {
            const fieldPath = basePath ? `${basePath}.${key}` : key;
            
            if (field && typeof field === 'object') {
                if ('inputType' in field) {
                    const templateField = field as MetaDataTemplateFieldProcessed;
                    
                    // Check for reactive dependencies in default field
                    if (this.isFunctionDescriptor(templateField.default) && 
                        this.hasReactiveDependencies(templateField.default)) {
                        
                        const dependencies = this.getReactiveDependencies(templateField.default);
                        reactiveFields.push({
                            fieldPath,
                            dependencies,
                            type: 'default',
                            field: templateField
                        });
                    }
                    
                    // Check for reactive dependencies in QueryDropdown where clauses
                    if (this.hasReactiveQueryDropdownDependencies(templateField)) {
                        const dependencies = this.getQueryDropdownReactiveDependencies(templateField);
                        reactiveFields.push({
                            fieldPath,
                            dependencies,
                            type: 'queryDropdown',
                            field: templateField
                        });
                    }
                } else {
                    // This is a nested object - recurse
                    this.collectReactiveFieldsFromTemplate(field as MetaDataTemplateProcessed, fieldPath, reactiveFields);
                }
            }
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
     * Helper to set nested values in userData using dot notation
     */
    private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
        const keys = path.split('.');
        const lastKey = keys.pop()!;
        
        let current: unknown = obj;
        for (const key of keys) {
            // Handle array notation: "field[0]" -> field name "field", index 0
            const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
            if (arrayMatch) {
                const fieldName = arrayMatch[1];
                const index = parseInt(arrayMatch[2], 10);
                
                // Ensure the field exists and is an array
                if (!(fieldName in (current as Record<string, unknown>)) || 
                    !Array.isArray((current as Record<string, unknown>)[fieldName])) {
                    (current as Record<string, unknown>)[fieldName] = [];
                }
                
                const arr = (current as Record<string, unknown>)[fieldName] as unknown[];
                
                // Ensure the array has an object at the specified index
                while (arr.length <= index) {
                    arr.push({});
                }
                
                current = arr[index];
            } else {
                // Regular object property
                if (!(key in (current as Record<string, unknown>)) || 
                    typeof (current as Record<string, unknown>)[key] !== 'object') {
                    (current as Record<string, unknown>)[key] = {};
                }
                current = (current as Record<string, unknown>)[key];
            }
        }
        
        // Handle array notation in the last key
        const arrayMatch = lastKey.match(/^(.+)\[(\d+)\]$/);
        if (arrayMatch) {
            const fieldName = arrayMatch[1];
            const index = parseInt(arrayMatch[2], 10);
            
            // Ensure the field exists and is an array
            if (!(fieldName in (current as Record<string, unknown>)) || 
                !Array.isArray((current as Record<string, unknown>)[fieldName])) {
                (current as Record<string, unknown>)[fieldName] = [];
            }
            
            const arr = (current as Record<string, unknown>)[fieldName] as unknown[];
            
            // Ensure the array has entries up to the specified index
            while (arr.length <= index) {
                arr.push(undefined);
            }
            
            arr[index] = value;
        } else {
            // Regular object property
            (current as Record<string, unknown>)[lastKey] = value;
        }
    }



    /**
     * Applies a subclass template by name (creates new template from original + subclass)
     */
    applySubclassTemplateByName(subclassName: string): void {
        logger.info('🧪 applySubclassTemplateByName called - FILE LOGGING TEST', { 
            subclassName,
            timestamp: new Date().toISOString()
        });
        
        logger.debug('[TemplateManager] Attempting to apply subclass template:', {
            subclassName,
            noteType: this.noteType,
            hasNoteType: !!this.noteType,
            lastAppliedSubclass: this.lastAppliedSubclass
        });
        
        // Add template debugging
        logger.debug('[TemplateManager] Current baseTemplate:', this.baseTemplate);
        logger.debug('[TemplateManager] Current currentTemplate before change:', this.currentTemplate);
        
        if (!this.noteType) {
            logger.warn('[TemplateManager] Cannot apply subclass template without noteType');
            return;
        }

        // Skip if this subclass is already applied (prevents infinite loops)
        if (this.lastAppliedSubclass === subclassName) {
            logger.debug('[TemplateManager] Subclass already applied, skipping to prevent loop:', subclassName);
            return;
        }

        // Skip if this is the default subclass and it's already been applied during initialization
        if (this.defaultSubclassApplied && subclassName === this.getDefaultSubclassName()) {
            logger.debug('[TemplateManager] Default subclass already applied during initialization, skipping:', {
                subclassName,
                defaultSubclassName: this.getDefaultSubclassName(),
                defaultSubclassApplied: this.defaultSubclassApplied
            });
            return;
        }

        // Start with a fresh copy of the original template and process it
        const newTemplate = this.processTemplate(this.originalTemplate);
        
        // Find the subclass field in the new template
        const subclassField = this.findSubclassFieldInTemplate(newTemplate);
        if (!subclassField) {
            logger.warn('[TemplateManager] No subclass field found in template');
            return;
        }

        // Update the default value to the selected subclass
        subclassField.default = subclassName;
        logger.debug('[TemplateManager] Updated subclass default value to:', subclassName);

        // Find and apply the subclass template modifications
        const subclassTemplate = this.findSubclassTemplate(this.noteType, subclassName);
        logger.debug('[TemplateManager] Found subclass template:', {
            subclassName,
            noteType: this.noteType,
            template: subclassTemplate,
            hasTemplate: !!subclassTemplate
        });
        
        if (subclassTemplate) {
            this.applySubclassTemplateToTemplate(newTemplate, subclassTemplate);
            logger.debug('[TemplateManager] Successfully applied subclass template:', subclassName);
        } else {
            logger.warn('[TemplateManager] No subclass template found for:', {
                subclassName,
                noteType: this.noteType
            });
        }
        
        // Save current state to history and update current template
        this.templateHistory.push(JSON.parse(JSON.stringify(this.currentTemplate)));
        this.currentTemplate = newTemplate;
        this.lastAppliedSubclass = subclassName; // Track what was applied
        
        // Add post-change template debugging
        logger.debug('[TemplateManager] Updated currentTemplate after change:', this.currentTemplate);
        
        // Update the form data to reflect the new subclass selection
        // Find the subclass field key in the current data
        const subclassFieldKey = this.findSubclassFieldKey();
        if (subclassFieldKey) {
            this.setNestedValue(this.data, subclassFieldKey, subclassName);
            logger.debug('[TemplateManager] Updated form data subclass value:', {
                fieldKey: subclassFieldKey,
                newValue: subclassName
            });
        }
        
        // Clear form data for fields that are no longer present in the new template
        this.cleanupFormDataForNewTemplate();
    }

    /**
     * Removes form data entries for fields that no longer exist in the current template
     */
    private cleanupFormDataForNewTemplate(): void {
        logger.debug('[TemplateManager] Starting cleanup - current data keys:', Object.keys(this.data));
        logger.debug('[TemplateManager] Starting cleanup - current data structure:', this.data);
        
        const currentTemplatePaths = this.getDefinedFieldPaths();
        logger.debug('[TemplateManager] Template paths after subclass change:', currentTemplatePaths);
        
        // Recursively clean the data object
        this.cleanupNestedData(this.data, '', currentTemplatePaths);
        
        logger.debug('[TemplateManager] Data after cleanup:', this.data);
    }

    /**
     * Recursively cleans nested data objects, removing fields not in template
     */
    private cleanupNestedData(data: FormData, parentPath: string, templatePaths: string[]): void {
        const keysToRemove: string[] = [];
        
        for (const [key, value] of Object.entries(data)) {
            const currentPath = parentPath ? `${parentPath}.${key}` : key;
            
            logger.debug('[TemplateManager] Checking nested field:', {
                key,
                currentPath,
                isInTemplate: templatePaths.includes(currentPath)
            });
            
            // Check if this field exists in the template
            if (!templatePaths.includes(currentPath)) {
                // Also check if it's a parent of template fields (nested object)
                const isParentOfTemplateFields = templatePaths.some(path => 
                    path.startsWith(currentPath + '.')
                );
                
                if (!isParentOfTemplateFields) {
                    keysToRemove.push(key);
                    logger.debug('[TemplateManager] Marking for removal:', { currentPath });
                    continue;
                }
            }
            
            // If it's a nested object, recurse into it
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                this.cleanupNestedData(value as FormData, currentPath, templatePaths);
            }
        }
        
        // Remove obsolete keys
        for (const key of keysToRemove) {
            logger.debug('[TemplateManager] Removing obsolete field:', {
                path: parentPath ? `${parentPath}.${key}` : key
            });
            delete data[key];
        }
    }

    /**
     * Finds a subclass template in plugin settings
     */
    private findSubclassTemplate(noteType: string, subclassName: string): SubclassMetadataTemplate | undefined {
        logger.debug('[TemplateManager] Searching for subclass template:', {
            noteType,
            subclassName,
            availableNoteTypes: Object.keys(this.plugin.settings.note)
        });
        
        if (noteType in this.plugin.settings.note) {
            const noteSettings = this.plugin.settings.note[noteType as keyof typeof this.plugin.settings.note];
            logger.debug('[TemplateManager] Found note settings:', {
                noteType,
                hasTypeArray: 'type' in noteSettings
            });
            
            if ('type' in noteSettings) {
                type NoteSettingsWithTypes = { type: Array<{ name: string; subClassMetadataTemplate?: unknown }> };
                const typeArray = (noteSettings as NoteSettingsWithTypes).type;
                logger.debug('[TemplateManager] Type array:', {
                    typeArray: Array.isArray(typeArray) ? typeArray.map(t => t.name) : 'not an array',
                    isArray: Array.isArray(typeArray)
                });
                
                const typeObj = Array.isArray(typeArray)
                    ? typeArray.find((type) => type.name === subclassName)
                    : undefined;
                
                logger.debug('[TemplateManager] Found type object:', {
                    subclassName,
                    typeObj: typeObj ? { name: typeObj.name, hasTemplate: !!typeObj.subClassMetadataTemplate } : null
                });
                
                return typeObj?.subClassMetadataTemplate as SubclassMetadataTemplate;
            }
        } else {
            logger.debug('[TemplateManager] Note type not found in settings:', {
                noteType,
                availableTypes: Object.keys(this.plugin.settings.note)
            });
        }
        return undefined;
    }



    /**
     * Finds a field with inputType "subclass" in the template
     */
    findSubclassInputField(): MetaDataTemplateFieldProcessed | undefined {
        return this.findSubclassFieldRecursive(this.currentTemplate);
    }

    /**
     * Finds the key/path of the subclass field in the template
     */
    findSubclassFieldKey(): string | undefined {
        return this.findSubclassFieldKeyRecursive(this.currentTemplate, "");
    }

    private findSubclassFieldKeyRecursive(template: MetaDataTemplateProcessed, currentPath: string): string | undefined {
        for (const [key, value] of Object.entries(template)) {
            if (value && typeof value === "object") {
                if ("inputType" in value && value.inputType === "subclass") {
                    return currentPath ? `${currentPath}.${key}` : key;
                }
                // Recursively search nested objects (but not arrays)
                if (!("inputType" in value)) {
                    const nested = this.findSubclassFieldKeyRecursive(value as MetaDataTemplateProcessed, currentPath ? `${currentPath}.${key}` : key);
                    if (nested) return nested;
                }
            }
        }
        return undefined;
    }

    private findSubclassFieldRecursive(template: MetaDataTemplateProcessed): MetaDataTemplateFieldProcessed | undefined {
        for (const value of Object.values(template)) {
            if (value && typeof value === "object") {
                if ("inputType" in value && value.inputType === "subclass") {
                    return value as MetaDataTemplateFieldProcessed;
                }
                // Recursively search nested objects (but not arrays)
                if (!("inputType" in value)) {
                    const nested = this.findSubclassFieldRecursive(value as MetaDataTemplateProcessed);
                    if (nested) return nested;
                }
            }
        }
        return undefined;
    }

    /**
     * Gets the default subclass name for the current note type
     */
    getDefaultSubclassName(): string | null {
        if (!this.noteType) return null;
        
        const subclassInput = this.findSubclassInputField();
        if (subclassInput) {
            let options: string[] = [];
            if (Array.isArray(subclassInput.options)) {
                options = subclassInput.options;
            } else if (typeof subclassInput.options === "function") {
                const evaluatedOptions = (subclassInput.options as (data: JSONObject) => unknown)({} as JSONObject);
                options = Array.isArray(evaluatedOptions) ? evaluatedOptions : [];
            }
            
            return (subclassInput.default as string) || options[0] || null;
        }
        return null;
    }

    /**
     * Evaluates a field's default value with current data context
     */
    evaluateFieldDefault(fieldPath: string): unknown {
        const field = this.getFieldTemplate(fieldPath);
        if (!field) return undefined;
        
        return this.evaluator.evaluateFieldDefault(field, this.data);
    }

    /**
     * Checks if a field has dependencies on user input
     */
    hasUserInputDependencies(fieldPath: string, changedFieldPath: string): boolean {
        const field = this.getFieldTemplate(fieldPath);
        if (!field) return false;
        
        return this.evaluator.checkFieldForUserInputDependencies(field, changedFieldPath);
    }

    /**
     * Updates the data context for template evaluation
     */
    updateDataContext(data: FormData): void {
        this.data = { ...data };
    }

    /**
     * Reset template to base state (original + default subclass)
     */
    resetToBase(): void {
        this.currentTemplate = JSON.parse(JSON.stringify(this.baseTemplate));
        this.templateHistory = [this.baseTemplate];
        // Reset tracking to the default subclass
        const subclassField = this.findSubclassInputField();
        this.lastAppliedSubclass = subclassField?.default as string;
    }

    /**
     * Undo last template change
     */
    undoLastChange(): boolean {
        if (this.templateHistory.length > 1) {
            this.templateHistory.pop();
            this.currentTemplate = JSON.parse(JSON.stringify(this.templateHistory[this.templateHistory.length - 1]));
            return true;
        }
        return false;
    }









    private addFieldToTemplateObject(template: MetaDataTemplateProcessed, addition: {
        fullKey: string;
        insertAfter?: string;
        insertBefore?: string;
        input?: Record<string, unknown>;
        value?: FormFieldValue;
    }): void {
        // Extract parent path and field key
        const keyParts = addition.fullKey.split('.');
        const fieldKey = keyParts.pop()!;
        const parentPath = keyParts.join('.');
        
        // Navigate to parent object in template
        let current = template as Record<string, unknown>;
        if (parentPath) {
            const pathKeys = parentPath.split('.');
            for (const key of pathKeys) {
                if (!current[key]) {
                    current[key] = {};
                }
                current = current[key] as Record<string, unknown>;
            }
        }

        // Add field configuration to template
        // Use the entire input object to preserve all parameters (search, where, etc.)
        const fieldConfig = {
            ...addition.input, // Spread all input parameters to preserve everything
            inputType: addition.input?.inputType || "text", // Ensure inputType has a default
            // CRITICAL FIX: Use ?? instead of || to handle falsy default values (0, false, "")
            default: addition.input?.default ?? addition.value, // Handle legacy value parameter
            editable: true,
            position: {
                insertAfter: addition.insertAfter,
                insertBefore: addition.insertBefore
            }
        };
        
        logger.debug('[TemplateManager] Adding field to template object:', {
            fullKey: addition.fullKey,
            fieldKey: fieldKey,
            fieldConfig: fieldConfig,
            originalInput: addition.input
        });
        
        current[fieldKey] = fieldConfig;
    }

    private removeFieldFromTemplateObject(template: MetaDataTemplateProcessed, fieldPath: string): void {
        const keys = fieldPath.split('.');
        const fieldKey = keys.pop()!;
        
        let current = template as Record<string, unknown>;
        for (const key of keys) {
            if (current && current[key]) {
                current = current[key] as Record<string, unknown>;
            } else {
                return; // Path doesn't exist
            }
        }
        
        if (current && fieldKey in current) {
            delete current[fieldKey];
        }
    }

    private replaceFieldInTemplateObject(template: MetaDataTemplateProcessed, replacement: {
        fullKey: string;
        newKey: string;
        input?: Record<string, unknown>;
        value?: FormFieldValue;
    }): void {
        // Check if the old field exists before trying to replace it
        const oldFieldExists = this.fieldExistsInTemplate(template, replacement.fullKey);
        
        if (oldFieldExists) {
            // Remove the old field
            this.removeFieldFromTemplateObject(template, replacement.fullKey);
        } else {
            logger.debug('[TemplateManager] Old field not found for replacement, will add new field instead:', {
                oldKey: replacement.fullKey,
                newKey: replacement.newKey
            });
        }
        
        // Determine the new full key
        let newFullKey: string;
        if (replacement.newKey.includes('.')) {
            // newKey is already a full path, use it directly
            newFullKey = replacement.newKey;
        } else {
            // newKey is just a field name, combine with parent path of old key
            const keyParts = replacement.fullKey.split('.');
            keyParts[keyParts.length - 1] = replacement.newKey;
            newFullKey = keyParts.join('.');
        }
        
        // Add the new field
        this.addFieldToTemplateObject(template, {
            fullKey: newFullKey,
            input: replacement.input,
            value: replacement.value
        });
        
        logger.debug('[TemplateManager] Field replacement completed:', {
            oldKey: replacement.fullKey,
            newKey: replacement.newKey,
            newFullKey: newFullKey,
            oldFieldExisted: oldFieldExists
        });
    }

    /**
     * Checks if a field exists in the template using dot notation path
     */
    private fieldExistsInTemplate(template: MetaDataTemplateProcessed, fieldPath: string): boolean {
        const keys = fieldPath.split('.');
        let current: unknown = template;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = (current as Record<string, unknown>)[key];
            } else {
                return false; // Path doesn't exist
            }
        }
        
        return true;
    }

    private collectFieldPaths(obj: Record<string, unknown>, currentPath: string, paths: string[]): void {
        for (const [key, value] of Object.entries(obj)) {
            const newPath = currentPath ? `${currentPath}.${key}` : key;
            paths.push(newPath);
            
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                this.collectFieldPaths(value as Record<string, unknown>, newPath, paths);
            }
        }
    }
}
