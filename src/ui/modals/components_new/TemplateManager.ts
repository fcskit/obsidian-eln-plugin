import type { 
    MetaDataTemplate,
    MetaDataTemplateProcessed, 
    MetaDataTemplateFieldProcessed,
    FormData,
    FormFieldValue,
    SubclassMetadataTemplate,
    JSONObject,
    FunctionDescriptor
} from "../../../types";
import type ElnPlugin from "../../../main";
import { TemplateEvaluator } from "./TemplateEvaluator";
import { MetadataProcessor } from "../../../core/notes/MetadataProcessor";

export interface SubclassTemplateOperation {
    add?: Array<{
        fullKey: string;
        insertAfter?: string;
        insertBefore?: string;
        input?: Record<string, unknown>;
        value?: FormFieldValue;
    }>;
    remove?: string[];
    replace?: Array<{
        fullKey: string;
        newKey: string;
        input?: Record<string, unknown>;
        value?: FormFieldValue;
    }>;
}

export interface TemplateManagerOptions {
    plugin: ElnPlugin;
    noteType?: string;
    baseTemplate?: MetaDataTemplateProcessed;
    initialData?: FormData;
}

/**
 * Enhanced TemplateManager that handles template loading, processing, and transformations
 * Incorporates functionality from MetadataProcessor and TemplateEvaluator
 */
export class TemplateManager {
    private plugin: ElnPlugin;
    private evaluator: TemplateEvaluator;
    private metadataProcessor: MetadataProcessor;
    private noteType?: string;
    private baseTemplate: MetaDataTemplateProcessed;
    private currentTemplate: MetaDataTemplateProcessed;
    private templateHistory: MetaDataTemplateProcessed[] = [];
    private data: FormData;

    constructor(options: TemplateManagerOptions) {
        this.plugin = options.plugin;
        this.evaluator = new TemplateEvaluator(options.plugin);
        this.metadataProcessor = new MetadataProcessor(options.plugin);
        this.noteType = options.noteType;
        this.data = options.initialData || {};

        // Load and process the base template
        if (options.baseTemplate) {
            this.baseTemplate = this.processTemplate(options.baseTemplate);
        } else {
            this.baseTemplate = this.loadAndProcessTemplate(options.noteType);
        }

        this.currentTemplate = JSON.parse(JSON.stringify(this.baseTemplate));
        this.templateHistory = [this.baseTemplate];
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
        
        // Process dynamic fields first
        this.evaluator.processDynamicFields(processed);
        
        // Handle author settings
        this.preprocessAuthorSettings(processed);
        
        return processed;
    }

    /**
     * Handles author settings preprocessing
     */
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
                    console.warn(`Failed to evaluate function default for ${fieldPath}:`, error);
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
            // Extract default values from template without full processing
            const defaultData = this.extractDefaultValuesFromTemplate(this.currentTemplate);
            
            // Merge with any provided initial data (initial data takes precedence)
            const mergedData: FormData = { ...defaultData, ...this.data };
            
            return mergedData;
        } catch (error) {
            console.error('Error extracting form data with defaults:', error);
            // Fall back to original data if processing fails
            return this.data;
        }
    }

    /**
     * Type guard to check if a value is a function descriptor
     */
    private isFunctionDescriptor(value: unknown): value is FunctionDescriptor {
        return typeof value === 'object' && 
               value !== null && 
               'type' in value && 
               'value' in value &&
               (value as { type: unknown }).type === 'function';
    }

    /**
     * Recursively extracts default values from template for form initialization
     */
    private extractDefaultValuesFromTemplate(template: MetaDataTemplateProcessed, parentKey = ""): FormData {
        const result: FormData = {};
        
        for (const [key, config] of Object.entries(template)) {
            if (
                config !== null &&
                typeof config === "object" &&
                !("inputType" in config) &&
                !("query" in config) &&
                !("default" in config) &&
                !("callback" in config)
            ) {
                // Recursively process nested objects
                result[key] = this.extractDefaultValuesFromTemplate(config as MetaDataTemplateProcessed, key);
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
                            // Use TemplateEvaluator's safe evaluation method
                            result[key] = this.evaluator.evaluateFieldDefault(field, this.data) as FormFieldValue;
                        } catch (error) {
                            console.warn(`Failed to evaluate function default for ${key}:`, error);
                            // Fall back to a reasonable default
                            result[key] = "";
                        }
                    } else {
                        // Use the default value directly
                        result[key] = field.default;
                    }
                } else if (field.inputType === "list") {
                    // Only initialize empty arrays for list inputs if no default is specified
                    result[key] = [];
                } else if (field.inputType === "number" && field.units) {
                    // Initialize number fields with units
                    const unit = field.defaultUnit || (Array.isArray(field.units) ? field.units[0] : field.units);
                    result[key] = { value: null, unit };
                }
            }
        }
        
        return result;
    }

    /**
     * Applies a subclass template operation
     */
    applySubclassTemplate(subclassTemplate: SubclassTemplateOperation): void {
        // Save current state to history
        this.templateHistory.push(JSON.parse(JSON.stringify(this.currentTemplate)));
        
        // Apply the operation
        this.processSubclassTemplate(subclassTemplate);
        
        // Re-process dynamic fields after modifications
        this.evaluator.processDynamicFields(this.currentTemplate);
    }

    /**
     * Applies a subclass template by name (for backward compatibility with existing system)
     */
    applySubclassTemplateByName(subclassName: string): void {
        if (!this.noteType) {
            console.warn('Cannot apply subclass template without noteType');
            return;
        }

        const subclassTemplate = this.findSubclassTemplate(this.noteType, subclassName);
        if (subclassTemplate) {
            this.applyLegacySubclassTemplate(subclassTemplate);
        }
    }

    /**
     * Finds a subclass template in plugin settings
     */
    private findSubclassTemplate(noteType: string, subclassName: string): SubclassMetadataTemplate | undefined {
        if (noteType in this.plugin.settings.note) {
            const noteSettings = this.plugin.settings.note[noteType as keyof typeof this.plugin.settings.note];
            if ('type' in noteSettings) {
                type NoteSettingsWithTypes = { type: Array<{ name: string; subClassMetadataTemplate?: unknown }> };
                const typeArray = (noteSettings as NoteSettingsWithTypes).type;
                const typeObj = Array.isArray(typeArray)
                    ? typeArray.find((type) => type.name === subclassName)
                    : undefined;
                
                return typeObj?.subClassMetadataTemplate as SubclassMetadataTemplate;
            }
        }
        return undefined;
    }

    /**
     * Applies a legacy subclass template format
     */
    private applyLegacySubclassTemplate(subclassTemplate: SubclassMetadataTemplate): void {
        // Save current state to history
        this.templateHistory.push(JSON.parse(JSON.stringify(this.currentTemplate)));
        
        // Remove fields (legacy format)
        if (Array.isArray(subclassTemplate.remove)) {
            for (const fullKey of subclassTemplate.remove) {
                this.removeFieldFromTemplate(fullKey);
            }
        }
        
        // Replace fields (legacy format)
        if (subclassTemplate.replace && Array.isArray(subclassTemplate.replace)) {
            for (const replaceItem of subclassTemplate.replace) {
                if (replaceItem.fullKey && replaceItem.newKey) {
                    this.replaceFieldInTemplate({ 
                        fullKey: replaceItem.fullKey, 
                        newKey: replaceItem.newKey, 
                        input: replaceItem.input as Record<string, unknown>
                    });
                }
            }
        }
        
        // Add fields (legacy format)
        if (Array.isArray(subclassTemplate.add)) {
            for (const { fullKey, input } of subclassTemplate.add) {
                this.addFieldToTemplate({ fullKey, input: input as Record<string, unknown> });
            }
        }
        
        // Re-process dynamic fields after modifications
        this.evaluator.processDynamicFields(this.currentTemplate);
    }

    /**
     * Finds a field with inputType "subclass" in the template
     */
    findSubclassInputField(): MetaDataTemplateFieldProcessed | undefined {
        return this.findSubclassFieldRecursive(this.currentTemplate);
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
     * Reset template to base state
     */
    resetToBase(): void {
        this.currentTemplate = JSON.parse(JSON.stringify(this.baseTemplate));
        this.templateHistory = [this.baseTemplate];
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

    private processSubclassTemplate(subclassTemplate: SubclassTemplateOperation): void {
        if (subclassTemplate.add) {
            for (const addition of subclassTemplate.add) {
                this.addFieldToTemplate(addition);
            }
        }
        
        if (subclassTemplate.remove) {
            for (const fieldPath of subclassTemplate.remove) {
                this.removeFieldFromTemplate(fieldPath);
            }
        }
        
        if (subclassTemplate.replace) {
            for (const replacement of subclassTemplate.replace) {
                this.replaceFieldInTemplate(replacement);
            }
        }
    }

    private addFieldToTemplate(addition: {
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
        let current = this.currentTemplate as Record<string, unknown>;
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
        current[fieldKey] = {
            inputType: addition.input?.inputType || "text",
            defaultValue: addition.value,
            options: addition.input || {},
            editable: true,
            position: {
                insertAfter: addition.insertAfter,
                insertBefore: addition.insertBefore
            }
        };
    }

    private removeFieldFromTemplate(fieldPath: string): void {
        const keys = fieldPath.split('.');
        const fieldKey = keys.pop()!;
        
        let current = this.currentTemplate as Record<string, unknown>;
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

    private replaceFieldInTemplate(replacement: {
        fullKey: string;
        newKey: string;
        input?: Record<string, unknown>;
        value?: FormFieldValue;
    }): void {
        // First remove the old field
        this.removeFieldFromTemplate(replacement.fullKey);
        
        // Then add the new field
        const keyParts = replacement.fullKey.split('.');
        keyParts[keyParts.length - 1] = replacement.newKey;
        const newFullKey = keyParts.join('.');
        
        this.addFieldToTemplate({
            fullKey: newFullKey,
            input: replacement.input,
            value: replacement.value
        });
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
