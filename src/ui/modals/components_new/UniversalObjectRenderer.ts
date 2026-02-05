import { Component } from "obsidian";
import type { App } from "obsidian";
import type { FormFieldValue } from "../../../types";
import { TemplateManager } from "./TemplateManager";
import { InputManager } from "./InputManager";
import { LabeledPrimitiveInput, PrimitiveType, PrimitiveValue } from "./LabeledPrimitiveInput";
import { LabeledDropdown } from "./LabeledDropdown";
import { QueryDropdown } from "./QueryDropdown";
import { QueryWhereClause, QueryReturnClause } from "../../../types/templates";
import { createLogger } from "../../../utils/Logger";

export type ObjectRenderingMode = "editable" | "readonly" | "mixed";

export interface UniversalObjectRendererOptions {
    container: HTMLElement;
    label: string;
    objectPath?: string; // Path in the overall form data
    defaultValue?: Record<string, FormFieldValue>;
    templateManager?: TemplateManager;
    inputManager?: InputManager;
    renderingMode?: ObjectRenderingMode;
    allowNewFields?: boolean;
    onChangeCallback?: (object: Record<string, FormFieldValue>) => void;
    app: App;
    isEditableObject?: boolean; // Flag to indicate this is an editableObject field
}

export interface FieldRenderingConfig {
    key: string;
    value: PrimitiveValue; // Use PrimitiveValue to match LabeledPrimitiveInput
    isEditable: boolean;
    allowKeyEdit: boolean;
    allowTypeSwitch: boolean;
    inputType: string;
    inputOptions?: Record<string, unknown>;
    isFromTemplate: boolean;
    position?: {
        insertAfter?: string;
        insertBefore?: string;
    };
}

/**
 * Universal object renderer that can handle:
 * - Editable objects (current ImprovedEditableObject functionality)
 * - Readonly objects (template-defined, non-editable)  
 * - Mixed objects (some fields editable, some readonly)
 * - Recursive nested objects
 * 
 * This replaces ImprovedEditableObject and becomes the universal solution.
 */
export class UniversalObjectRenderer extends Component {
    private container: HTMLElement;
    private wrapper!: HTMLElement;
    private fieldsContainer!: HTMLElement;
    private object: Record<string, FormFieldValue>;
    private onChangeCallback: (object: Record<string, FormFieldValue>) => void;
    private app: App;
    private templateManager?: TemplateManager;
    private inputManager?: InputManager;
    private objectPath: string;
    private renderingMode: ObjectRenderingMode;
    private allowNewFields: boolean;
    private isEditableObject: boolean;
    private fieldComponents: Map<string, LabeledPrimitiveInput | LabeledDropdown | QueryDropdown | UniversalObjectRenderer> = new Map();
    private logger = createLogger('ui');

    constructor(options: UniversalObjectRendererOptions) {
        super();
        
        this.container = options.container;
        this.object = options.defaultValue ? { ...options.defaultValue } : {};
        this.onChangeCallback = options.onChangeCallback || (() => {});
        this.app = options.app;
        this.templateManager = options.templateManager;
        this.inputManager = options.inputManager;
        this.objectPath = options.objectPath || "";
        this.renderingMode = options.renderingMode || "editable";
        this.allowNewFields = options.allowNewFields ?? true;
        this.isEditableObject = options.isEditableObject ?? false;
        
        this.createUI(options.label);
        this.render();
    }

    private createUI(label: string): void {
        this.wrapper = this.container.createDiv({ cls: "editable-object-wrapper" });
        
        // Header with label and controls (matching ImprovedEditableObject structure)
        const header = this.wrapper.createDiv({ cls: "editable-object-header" });
        header.createDiv({ cls: "editable-object-label", text: label });
        
        // Controls section for add field button etc.
        if (this.shouldShowAddButton()) {
            const addButton = header.createDiv({ cls: "editable-object-add-button", text: "+" });
            addButton.setAttribute("title", "Add new field");
            addButton.addEventListener("click", () => this.addNewField());
        }
        
        // Fields container (matching ImprovedEditableObject structure)
        this.fieldsContainer = this.wrapper.createDiv({ cls: "editable-object-fields" });
    }

    private render(): void {
        this.fieldsContainer.empty();
        this.fieldComponents.clear();
        
        const analysis = this.analyzeForRendering();
        
        // Render fields according to analysis
        for (const fieldConfig of analysis.fields) {
            this.renderField(fieldConfig);
        }
        
        // Render nested objects recursively
        for (const nestedConfig of analysis.nestedObjects) {
            this.renderNestedObject(nestedConfig);
        }
        
        // Show empty state if no fields or nested objects
        if (analysis.fields.length === 0 && analysis.nestedObjects.length === 0) {
            const emptyState = this.fieldsContainer.createDiv({ cls: "editable-object-empty" });
            emptyState.createDiv({ 
                cls: "improved-editable-object-empty-text", 
                text: "No fields added yet. Click + to add a field." 
            });
        }
    }

    private analyzeForRendering(): {
        fields: FieldRenderingConfig[];
        nestedObjects: Array<{
            key: string;
            path: string;
            config: UniversalObjectRendererOptions;
        }>;
    } {
        const fields: FieldRenderingConfig[] = [];
        const nestedObjects: Array<{
            key: string;
            path: string;
            config: UniversalObjectRendererOptions;
        }> = [];
        
        // Get template-defined fields first
        const templateFields = this.getTemplateFields();
        
        // Get data fields
        const dataFields = Object.keys(this.object);
        
        // Combine and deduplicate
        const allFieldKeysSet = new Set([...templateFields, ...dataFields]);
        const allFieldKeys = Array.from(allFieldKeysSet);
        
        for (const key of allFieldKeys) {
            const value = this.object[key];
            const fieldPath = this.objectPath ? `${this.objectPath}.${key}` : key;
            
            // Check if this is a nested object vs an editableObject field
            // For editableObject fields, use the correct template path
            const templatePath = this.isEditableObject 
                ? (this.objectPath ? `${this.objectPath}.objectTemplate.${key}` : `objectTemplate.${key}`)
                : fieldPath;
            const templateField = this.templateManager?.getFieldTemplate(templatePath);
            const isEditableObjectField = templateField?.inputType === "editableObject";
            const isNestedByValue = this.isNestedObject(value);
            const isNestedByTemplate = this.isNestedObjectByTemplate(fieldPath);
            
            // Debug logging for nested object detection
            if (key === 'metadata') {
                this.logger.debug('Analyzing metadata field:', {
                    key,
                    fieldPath,
                    value,
                    isEditableObjectField,
                    isNestedByValue,
                    isNestedByTemplate,
                    templateField,
                    allPaths: this.templateManager?.getDefinedFieldPaths()
                });
            }
            
            if (isEditableObjectField) {
                // This is an editableObject field - render it as a field with special handling
                // For editableObject fields, we only use the current data value, never template defaults
                const currentObjectValue = this.object[key];
                let objectValue: Record<string, FormFieldValue>;
                
                if (currentObjectValue && typeof currentObjectValue === 'object' && !Array.isArray(currentObjectValue)) {
                    objectValue = currentObjectValue as Record<string, FormFieldValue>;
                } else {
                    // For editableObject fields, always start with empty object if no current data
                    objectValue = {};
                }
                
                // Create a custom config for editableObject fields
                const fieldConfig: FieldRenderingConfig = {
                    key,
                    value: objectValue as unknown as PrimitiveValue, // This will be handled specially in renderEditableObjectField
                    isEditable: this.templateManager?.isFieldEditable(fieldPath) ?? true,
                    allowKeyEdit: false, // editableObject field keys are typically not editable
                    allowTypeSwitch: false,
                    inputType: "editableObject",
                    isFromTemplate: true
                };
                fields.push(fieldConfig);
            } else if (isNestedByValue || isNestedByTemplate) {
                // This is a regular nested object - render sub-fields directly
                const nestedValue = isNestedByValue ? value as Record<string, FormFieldValue> : {};
                
                nestedObjects.push({
                    key,
                    path: fieldPath,
                    config: {
                        container: this.fieldsContainer,
                        label: key,
                        objectPath: fieldPath,
                        defaultValue: nestedValue,
                        templateManager: this.templateManager,
                        inputManager: this.inputManager,
                        renderingMode: this.determineNestedObjectMode(fieldPath),
                        onChangeCallback: (nestedObj) => this.handleNestedChange(key, nestedObj),
                        app: this.app,
                        allowNewFields: false // Regular nested objects shouldn't allow adding new fields
                    }
                });
            } else {
                // Regular field - check if it should be displayed (query field)
                // For editableObject fields, use the correct template path
                const templateFieldForQuery = this.isEditableObject 
                    ? (this.objectPath ? `${this.objectPath}.objectTemplate.${key}` : `objectTemplate.${key}`)
                    : fieldPath;
                const templateField = this.templateManager?.getFieldTemplate(templateFieldForQuery);
                
                // Skip rendering if query is explicitly set to false
                if (templateField && templateField.query === false) {
                    this.logger.debug('Skipping field with query=false:', {
                        key,
                        fieldPath,
                        templateField
                    });
                    
                    // Still set the default value in the data if specified
                    if (templateField.default !== undefined) {
                        const defaultValue = this.templateManager?.getFieldDefaultValue(templateFieldForQuery);
                        if (defaultValue !== undefined) {
                            this.inputManager?.setValue(fieldPath, defaultValue);
                        }
                    }
                    continue;
                }
                
                const fieldConfig = this.createFieldConfig(key, value, fieldPath);
                fields.push(fieldConfig);
            }
        }
        
        return { fields, nestedObjects };
    }

    private createFieldConfig(key: string, value: FormFieldValue, fieldPath: string): FieldRenderingConfig {
        // For editableObject fields, look for template under objectTemplate path
        const templatePath = this.isEditableObject 
            ? (this.objectPath ? `${this.objectPath}.objectTemplate.${key}` : `objectTemplate.${key}`)
            : fieldPath;
        
        const templateField = this.templateManager?.getFieldTemplate(templatePath);
        const isFromTemplate = !!templateField;
        
        // For list inputs, handle array values properly
        if (templateField?.inputType === "list") {
            // Get the evaluated default value from template if no current value
            let listValue: FormFieldValue[];
            if (Array.isArray(value) && value.length > 0) {
                listValue = value;
            } else {
                // Use TemplateManager to get properly evaluated default value
                const templateDefault = this.templateManager?.getFieldDefaultValue(templatePath);
                listValue = Array.isArray(templateDefault) ? templateDefault : [];
            }
            
            // Convert to appropriate array type for PrimitiveValue
            const listType = this.determineListType(templateField, listValue);
            let primitiveListValue: string[] | number[] | boolean[] | Date[];
            
            if (listType.includes("number")) {
                primitiveListValue = listValue.map(item => 
                    typeof item === 'number' ? item : parseFloat(String(item)) || 0
                );
            } else if (listType.includes("boolean")) {
                primitiveListValue = listValue.map(item => {
                    if (typeof item === 'boolean') return item;
                    const str = String(item).toLowerCase();
                    return str === "true" || str === "1" || str === "yes";
                });
            } else if (listType.includes("date")) {
                primitiveListValue = listValue.map(item => {
                    if (item instanceof Date) return item;
                    const date = new Date(String(item));
                    return isNaN(date.getTime()) ? new Date() : date;
                });
            } else {
                primitiveListValue = listValue.map(item => String(item));
            }
            
            return {
                key,
                value: primitiveListValue as PrimitiveValue,
                isEditable: this.templateManager?.isFieldEditable(templatePath) ?? true,
                allowKeyEdit: !isFromTemplate && this.renderingMode !== "readonly",
                allowTypeSwitch: !isFromTemplate && this.renderingMode === "editable",
                inputType: listType,
                inputOptions: (typeof templateField?.options === 'object' && !Array.isArray(templateField?.options)) 
                    ? templateField.options as Record<string, unknown> 
                    : undefined,
                isFromTemplate,
                position: (templateField?.position && typeof templateField.position === 'object') 
                    ? templateField.position as { insertAfter?: string; insertBefore?: string; }
                    : undefined
            };
        } else {
            // Convert value to primitive type for non-list inputs
            let primitiveValue: string | number | boolean | null = null;
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                primitiveValue = value;
            } else if (value === null || value === undefined) {
                primitiveValue = null;
            } else {
                primitiveValue = String(value);
            }
            
            // Get the evaluated default value from template if no current value
            let defaultValue: PrimitiveValue;
            if (primitiveValue !== null) {
                defaultValue = primitiveValue;
            } else if (templateField) {
                // Use TemplateManager to get properly evaluated default value
                const templateDefault = this.templateManager?.getFieldDefaultValue(templatePath);
                if (typeof templateDefault === 'string' || typeof templateDefault === 'number' || typeof templateDefault === 'boolean') {
                    defaultValue = templateDefault;
                } else {
                    defaultValue = templateDefault ? String(templateDefault) : "";
                }
            } else {
                defaultValue = "";
            }
            
            return {
                key,
                value: defaultValue,
                isEditable: this.templateManager?.isFieldEditable(templatePath) ?? true,
                allowKeyEdit: !isFromTemplate && this.renderingMode !== "readonly",
                allowTypeSwitch: !isFromTemplate && this.renderingMode === "editable",
                inputType: templateField?.inputType || this.inferInputType(value),
                inputOptions: (typeof templateField?.options === 'object' && !Array.isArray(templateField?.options)) 
                    ? templateField.options as Record<string, unknown> 
                    : undefined,
                isFromTemplate,
                position: (templateField?.position && typeof templateField.position === 'object') 
                    ? templateField.position as { insertAfter?: string; insertBefore?: string; }
                    : undefined
            };
        }
    }

    /**
     * Determines the specific list type based on template field configuration
     */
    private determineListType(templateField: Record<string, unknown>, listValue: FormFieldValue[]): string {
        // Check if template has a 'type' field specifying the list element type
        if (templateField.type) {
            switch (templateField.type) {
                case "string":
                case "text":
                    return "list (string)";
                case "number":
                    return "list (number)";
                case "boolean":
                    return "list (boolean)";
                case "date":
                    return "list (date)";
                case "mixed":
                    return "list (mixed)";
                case "object":
                    return "list (object)";
                default:
                    return "list (string)";
            }
        }
        
        // Fallback: infer from the actual values if available
        if (listValue && listValue.length > 0) {
            // For arrays, infer the type from the first element
            const firstElement = listValue[0];
            if (typeof firstElement === "number") {
                return "list (number)";
            } else if (typeof firstElement === "boolean") {
                return "list (boolean)";
            } else if (firstElement instanceof Date) {
                return "list (date)";
            } else if (typeof firstElement === "object") {
                return "list (object)";
            } else {
                return "list (string)";
            }
        }
        
        // Default to string list
        return "list (string)";
    }

    private renderField(config: FieldRenderingConfig): void {
        const fieldContainer = this.fieldsContainer.createDiv({ cls: "editable-object-field" });
        
        if (!config.isEditable) {
            // Readonly field
            this.renderReadonlyField(fieldContainer, config);
        } else {
            // Editable field using LabeledPrimitiveInput
            this.renderEditableField(fieldContainer, config);
        }
    }

    private renderReadonlyField(container: HTMLElement, config: FieldRenderingConfig): void {
        // Use the same wrapper structure as editable fields for proper alignment
        const wrapper = container.createDiv({ cls: "eln-modal-enhanced-input-wrapper readonly" });
        
        // Key section (same as editable fields)
        const keySection = wrapper.createDiv({ cls: "eln-modal-enhanced-input-key-section" });
        keySection.createDiv({
            cls: "eln-modal-enhanced-input-key-static",
            text: config.key
        });
        
        // Value section with readonly styling
        const valueSection = wrapper.createDiv({ cls: "eln-modal-enhanced-input-value-section" });
        valueSection.createDiv({
            cls: "eln-modal-enhanced-input-value-readonly",
            text: String(config.value)
        });
    }

    private renderEditableField(container: HTMLElement, config: FieldRenderingConfig): void {
        // Debug: Log the config to see what values are being passed
        this.logger.debug('Rendering field:', {
            key: config.key,
            value: config.value,
            inputType: config.inputType,
            mappedType: this.mapInputTypeToPrimitive(config.inputType)
        });
        
        // Check if this is an editableObject field
        if (config.inputType === "editableObject") {
            this.renderEditableObjectField(container, config);
        } else if (this.isDropdownType(config.inputType)) {
            this.renderDropdownField(container, config);
        } else {
            // Use LabeledPrimitiveInput for primitive types and lists
            this.renderPrimitiveField(container, config);
        }
    }

    private isDropdownType(inputType: string): boolean {
        return inputType === "dropdown" || 
               inputType === "multiselect" || 
               inputType === "queryDropdown" || 
               inputType === "multiQueryDropdown";
    }

    private renderEditableObjectField(container: HTMLElement, config: FieldRenderingConfig): void {
        const fieldPath = this.objectPath ? `${this.objectPath}.${config.key}` : config.key;
        
        // For editableObject fields, the config.value should already be the correct object value
        // from the analysis phase
        let objectValue = config.value as Record<string, FormFieldValue>;
        if (!objectValue || typeof objectValue !== 'object' || Array.isArray(objectValue)) {
            objectValue = {};
        }
        
        // Create the UniversalObjectRenderer for this editableObject field
        const editableObjectRenderer = new UniversalObjectRenderer({
            container: container,
            label: config.key,
            objectPath: fieldPath, // Keep the actual field path for data management
            defaultValue: objectValue,
            templateManager: this.templateManager,
            inputManager: this.inputManager,
            renderingMode: "editable",
            allowNewFields: true, // editableObject fields allow adding new fields
            isEditableObject: true, // Mark as editableObject to use objectTemplate for template reading
            onChangeCallback: (updatedObject) => {
                // Update the parent object with the new editable object value
                this.object[config.key] = updatedObject;
                this.updateInputManager();
                this.onChangeCallback(this.object);
            },
            app: this.app
        });
        
        this.addChild(editableObjectRenderer);
    }

    private renderDropdownField(container: HTMLElement, config: FieldRenderingConfig): void {
        const templateField = this.templateManager?.getFieldTemplate(
            this.objectPath ? `${this.objectPath}.${config.key}` : config.key
        );
        
        this.logger.debug('Rendering dropdown field:', {
            key: config.key,
            inputType: config.inputType,
            templateField,
            options: templateField?.options
        });
        
        if (config.inputType === "queryDropdown" || config.inputType === "multiQueryDropdown") {
            this.renderQueryDropdownField(container, config, templateField);
        } else {
            this.renderRegularDropdownField(container, config, templateField);
        }
    }

    private renderRegularDropdownField(container: HTMLElement, config: FieldRenderingConfig, templateField?: Record<string, unknown>): void {
        // Get options from template
        let options: string[] = [];
        if (templateField?.options) {
            if (Array.isArray(templateField.options)) {
                options = templateField.options;
            } else if (typeof templateField.options === 'function') {
                try {
                    const result = (templateField.options as () => string[])();
                    options = Array.isArray(result) ? result : [];
                } catch (error) {
                    console.error('Error evaluating dropdown options function:', error);
                }
            } else if (typeof templateField.options === 'string') {
                options = [templateField.options];
            }
        }
        
        this.logger.debug('Regular dropdown options processed:', {
            key: config.key,
            originalOptions: templateField?.options,
            processedOptions: options
        });
        
        // Determine if this is multiselect
        const isMultiselect = config.inputType === "multiselect" || 
                             (templateField?.multiselect === true);
        
        // Get current value
        let currentValue: string | string[];
        if (isMultiselect) {
            if (Array.isArray(config.value)) {
                currentValue = config.value.map(v => String(v));
            } else {
                currentValue = config.value ? [String(config.value)] : [];
            }
        } else {
            currentValue = String(config.value || "");
        }
        
        const dropdown = new LabeledDropdown({
            container: container,
            label: config.key,
            defaultValue: currentValue,
            options: options,
            multiselect: isMultiselect,
            editableKey: config.allowKeyEdit,
            allowTypeSwitch: config.allowTypeSwitch,
            removeable: !config.isFromTemplate,
            onKeyChange: config.allowKeyEdit ? (oldKey, newKey) => this.handleKeyChange(oldKey, newKey) : undefined,
            onTypeChange: config.allowTypeSwitch ? (newType) => {
                // Handle type change - would need to re-render the field
                this.logger.debug('Regular dropdown type change requested:', newType);
            } : undefined,
            onRemove: !config.isFromTemplate ? () => {
                this.handleFieldRemove(config.key);
            } : undefined,
            onValueChange: (value) => {
                this.handleFieldChangeWithCurrentKey(config.key, value);
            }
        });
        
        this.fieldComponents.set(config.key, dropdown);
    }

    private renderQueryDropdownField(container: HTMLElement, config: FieldRenderingConfig, templateField?: Record<string, unknown>): void {
        if (!templateField?.search || typeof templateField.search !== 'string') {
            console.error('QueryDropdown requires a search parameter');
            return;
        }
        
        // Determine if this is multiselect
        const isMultiselect = config.inputType === "multiQueryDropdown" || 
                             (templateField?.multiselect === true);
        
        // Get current value
        let currentValue: string | string[];
        if (isMultiselect) {
            if (Array.isArray(config.value)) {
                currentValue = config.value.map(v => String(v));
            } else {
                currentValue = config.value ? [String(config.value)] : [];
            }
        } else {
            currentValue = String(config.value || "");
        }
        
        const queryDropdown = new QueryDropdown({
            container: container,
            label: config.key,
            defaultValue: currentValue,
            multiselect: isMultiselect,
            app: this.app,
            search: templateField.search,
            where: templateField.where as QueryWhereClause,
            return: templateField.return as QueryReturnClause,
            editableKey: config.allowKeyEdit,
            allowTypeSwitch: config.allowTypeSwitch,
            removeable: !config.isFromTemplate,
            onKeyChange: config.allowKeyEdit ? (oldKey, newKey) => this.handleKeyChange(oldKey, newKey) : undefined,
            onTypeChange: config.allowTypeSwitch ? (newType) => {
                // Handle type change - would need to re-render the field
                this.logger.debug('Query dropdown type change requested:', newType);
            } : undefined,
            onRemove: !config.isFromTemplate ? () => {
                this.handleFieldRemove(config.key);
            } : undefined,
            onValueChange: (value, returnValues) => {
                // When return values are specified, use them instead of the raw file names
                if (returnValues && Array.isArray(returnValues) && returnValues.length > 0) {
                    // Multi-select with return values - store the array of return value objects
                    this.handleFieldChangeWithCurrentKey(config.key, returnValues as unknown as FormFieldValue);
                } else if (returnValues && !Array.isArray(returnValues)) {
                    // Single select with return values - store the return value object
                    this.handleFieldChangeWithCurrentKey(config.key, returnValues as unknown as FormFieldValue);
                } else {
                    // No return values specified, use the file names
                    this.handleFieldChangeWithCurrentKey(config.key, value);
                }
                this.logger.debug('Query dropdown storing value:', {
                    key: config.key,
                    fileNames: value,
                    returnValues: returnValues,
                    storedValue: returnValues || value
                });
            }
        });
        
        this.fieldComponents.set(config.key, queryDropdown);
    }

    private renderPrimitiveField(container: HTMLElement, config: FieldRenderingConfig): void {
        // Use LabeledPrimitiveInput for all primitive types and lists
        const input = new LabeledPrimitiveInput({
            container: container,
            label: config.key,
            type: this.mapInputTypeToPrimitive(config.inputType),
            defaultValue: config.value as PrimitiveValue,
            editableKey: config.allowKeyEdit,
            allowTypeSwitch: config.allowTypeSwitch,
            removeable: !config.isFromTemplate,
            units: Array.isArray(config.inputOptions?.units) ? config.inputOptions.units as string[] : undefined,
            multiline: typeof config.inputOptions?.multiline === 'boolean' ? config.inputOptions.multiline : undefined,
            onValueChange: (value) => {
                // Always use the current key from the component, not the original config.key
                const currentKey = input.getCurrentKey();
                this.handleFieldChangeWithCurrentKey(currentKey, value);
            },
            onKeyChange: config.allowKeyEdit ? (oldKey, newKey) => this.handleKeyChange(oldKey, newKey) : undefined,
            onRemove: !config.isFromTemplate ? () => {
                // For removal, also use the current key
                const currentKey = input.getCurrentKey();
                this.handleFieldRemove(currentKey);
            } : undefined
        });
        
        this.fieldComponents.set(config.key, input);
    }

    private renderNestedObject(nestedConfig: {
        key: string;
        path: string;
        config: UniversalObjectRendererOptions;
    }): void {
        // For regular nested objects (like 'process'), render fields directly without extra container
        // Create nested renderer that renders directly into the parent container
        const nestedRenderer = new UniversalObjectRenderer(nestedConfig.config);
        this.addChild(nestedRenderer);
    }

    private handleFieldChange(originalKey: string, value: FormFieldValue): void {
        // Check if this field has been renamed by looking up the component
        const component = this.fieldComponents.get(originalKey);
        let actualKey = originalKey;
        
        if (component instanceof LabeledPrimitiveInput) {
            actualKey = component.getCurrentKey();
        }
        
        // If the key changed, we need to update our field mapping
        if (actualKey !== originalKey && component) {
            // Move the component to the new key
            this.fieldComponents.delete(originalKey);
            this.fieldComponents.set(actualKey, component);
            
            // Remove the old key from the object if it exists
            if (this.object.hasOwnProperty(originalKey)) {
                delete this.object[originalKey];
            }
        }
        
        this.object[actualKey] = value;
        this.updateInputManager();
        this.onChangeCallback(this.object);
    }

    private handleFieldChangeWithCurrentKey(currentKey: string, value: FormFieldValue): void {
        // This method is called when we already know the current key
        // No need to look it up from the component
        this.object[currentKey] = value;
        this.updateInputManager();
        this.onChangeCallback(this.object);
    }

    private handleKeyChange(oldKey: string, newKey: string): void {
        if (oldKey !== newKey && !this.object.hasOwnProperty(newKey)) {
            // Update the object data
            this.object[newKey] = this.object[oldKey];
            delete this.object[oldKey];
            
            // Update component mapping
            const component = this.fieldComponents.get(oldKey);
            if (component) {
                this.fieldComponents.delete(oldKey);
                this.fieldComponents.set(newKey, component);
                
                // If it's a LabeledPrimitiveInput, update its key tracking
                if (component instanceof LabeledPrimitiveInput) {
                    component.updateKey(newKey);
                }
            }
            
            this.updateInputManager();
            this.onChangeCallback(this.object);
        }
    }

    private handleFieldRemove(key: string): void {
        delete this.object[key];
        this.fieldComponents.delete(key);
        this.updateInputManager();
        this.onChangeCallback(this.object);
        this.render(); // Re-render to remove the field
    }

    private handleNestedChange(key: string, nestedObject: Record<string, FormFieldValue>): void {
        this.object[key] = nestedObject;
        this.updateInputManager();
        this.onChangeCallback(this.object);
    }

    private addNewField(): void {
        const key = `field${Object.keys(this.object).length + 1}`;
        this.object[key] = "";
        this.updateInputManager();
        this.render(); // Re-render to show new field
        this.onChangeCallback(this.object);
    }

    private updateInputManager(): void {
        if (this.inputManager) {
            const path = this.objectPath;
            if (path) {
                this.inputManager.setValue(path, this.object);
            } else {
                // Update root level
                for (const [key, value] of Object.entries(this.object)) {
                    this.inputManager.setValue(key, value);
                }
            }
        }
    }

    private shouldShowAddButton(): boolean {
        return this.allowNewFields && 
               this.renderingMode !== "readonly" &&
               (this.templateManager?.allowsNewFields(this.objectPath) ?? true);
    }

    private isNestedObject(value: FormFieldValue): boolean {
        return value !== null && 
               typeof value === "object" && 
               !Array.isArray(value) &&
               !(value instanceof Date);
    }

    private isNestedObjectByTemplate(fieldPath: string): boolean {
        if (!this.templateManager) return false;
        
        // Get the field template for this path
        const fieldTemplate = this.templateManager.getFieldTemplate(fieldPath);
        
        // If this field has an inputType, it's a regular input field, not a nested object
        // This includes editableObject fields which should be handled as input fields
        if (fieldTemplate && fieldTemplate.inputType) {
            return false;
        }
        
        // Check if there are any template fields that start with this path + "."
        // AND this path itself doesn't have an inputType (meaning it's a container, not a field)
        const allPaths = this.templateManager.getDefinedFieldPaths();
        const nestedPrefix = `${fieldPath}.`;
        
        return allPaths.some(path => path.startsWith(nestedPrefix));
    }

    private determineNestedObjectMode(fieldPath: string): ObjectRenderingMode {
        if (this.templateManager) {
            return this.templateManager.isFieldEditable(fieldPath) ? "editable" : "readonly";
        }
        return this.renderingMode;
    }

    private getTemplateFields(): string[] {
        if (!this.templateManager) return [];
        
        const allPaths = this.templateManager.getDefinedFieldPaths();
        // For editableObject fields, look for template fields under objectTemplate
        const prefix = this.isEditableObject 
            ? (this.objectPath ? `${this.objectPath}.objectTemplate.` : "objectTemplate.")
            : (this.objectPath ? `${this.objectPath}.` : "");
        
        return allPaths
            .filter(path => path.startsWith(prefix))
            .map(path => path.substring(prefix.length))
            .filter(path => !path.includes('.')); // Only direct children
    }

    private inferInputType(value: FormFieldValue): string {
        if (typeof value === "string") return "text";
        if (typeof value === "number") return "number";
        if (typeof value === "boolean") return "boolean";
        if (value instanceof Date) return "date";
        if (Array.isArray(value)) {
            if (value.length > 0) {
                const firstElement = value[0];
                if (typeof firstElement === "number") return "list (number)";
                if (typeof firstElement === "boolean") return "list (boolean)";
                if (firstElement instanceof Date) return "list (date)";
            }
            return "list (string)";
        }
        return "text";
    }

    private mapInputTypeToPrimitive(inputType: string): PrimitiveType {
        const mapping: Record<string, PrimitiveType> = {
            "text": "text",
            "number": "number",
            "boolean": "boolean", 
            "date": "date",
            "list": "list (string)",
            "list (string)": "list (string)",
            "list (number)": "list (number)",
            "list (boolean)": "list (boolean)",
            "list (date)": "list (date)",
            "list (mixed)": "list (string)", // Fallback to string for mixed
            "list (object)": "list (string)", // Fallback to string for objects
            "numberList": "list (number)"
        };
        return mapping[inputType] || "text";
    }

    /**
     * Public API methods
     */
    
    getValue(): Record<string, FormFieldValue> {
        return { ...this.object };
    }

    setValue(value: Record<string, FormFieldValue>): void {
        this.object = { ...value };
        this.render();
        this.onChangeCallback(this.object);
    }

    updateTemplate(templateManager: TemplateManager): void {
        this.templateManager = templateManager;
        this.render();
    }

    setRenderingMode(mode: ObjectRenderingMode): void {
        this.renderingMode = mode;
        this.render();
    }
}
