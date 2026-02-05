import { Component, ButtonComponent, Notice, setIcon } from "obsidian";
import type { App } from "obsidian";
import type { FormFieldValue, FunctionDescriptor } from "../../../types";
import type { AnyFunctionDescriptor } from "../../../types/templates";
import { TemplateManager } from "../../../core/templates/TemplateManager";
import { TemplateEvaluator } from "../../../core/templates/TemplateEvaluator";
import { FunctionEvaluator } from "../../../core/templates/FunctionEvaluator";
import { InputManager } from "../utils/InputManager";
import { LabeledPrimitiveInput, PrimitiveType, PrimitiveValue } from "./LabeledPrimitiveInput";
import { LabeledDropdown } from "./LabeledDropdown";
import { LabeledSubclassDropdown } from "./LabeledSubclassDropdown";
import { QueryDropdown } from "./QueryDropdown";
import { FilePicker } from "./FilePicker";
import { QueryWhereClause, QueryReturnClause } from "../../../types/templates";
import { createLogger } from "../../../utils/Logger";
import { createEditableDiv, getEditableDivValue } from "../../renderer/npe/elements/createEditableDiv";
import type ElnPlugin from "../../../main";

const logger = createLogger('ui');

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
    isListObject?: boolean; // Flag to indicate this is a list object item
    objectTemplatePath?: string; // Path to the objectTemplate for this object
    allowKeyEdit?: boolean; // Allow editing the object key name
    onKeyChange?: (oldKey: string, newKey: string) => void; // Callback when key changes
    removeable?: boolean; // Allow removing the entire object
    onRemove?: () => void; // Callback when object is removed
}

export interface FieldRenderingConfig {
    key: string;
    value: PrimitiveValue; // Use PrimitiveValue to match LabeledPrimitiveInput
    isEditable: boolean;
    allowKeyEdit: boolean;
    allowTypeSwitch: boolean;
    removeable: boolean;
    inputType: string;
    inputOptions?: Record<string, unknown>;
    isFromTemplate: boolean;
    position?: {
        insertAfter?: string;
        insertBefore?: string;
    };
    // Object list properties
    listType?: string;
    objectTemplate?: Record<string, unknown>;
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
    private isListObject: boolean;
    private objectTemplatePath: string; // Path to the objectTemplate for this object
    private fieldComponents: Map<string, LabeledPrimitiveInput | LabeledDropdown | QueryDropdown | FilePicker | UniversalObjectRenderer> = new Map();
    private logger = createLogger('ui');
    private isUpdatingTemplate: boolean = false; // Flag to prevent recursive updates
    private label: string; // The current label/key for this object
    private allowKeyEdit: boolean = false; // Whether the key can be edited
    private onKeyChange?: (oldKey: string, newKey: string) => void; // Callback for key changes
    private removeable: boolean = false; // Whether this object can be removed
    private onRemove?: () => void; // Callback for removal
    private reactiveFieldsRegistered: boolean = false; // Flag to track reactive field registration

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
        this.isListObject = options.isListObject ?? false;
        this.label = options.label;
        this.allowKeyEdit = options.allowKeyEdit ?? false;
        this.onKeyChange = options.onKeyChange;
        this.removeable = options.removeable ?? false;
        this.onRemove = options.onRemove;
        
        // 🔍 DEBUG: Check for template configs in defaultValue
        if (options.defaultValue) {
            for (const [key, value] of Object.entries(options.defaultValue)) {
                if (value && typeof value === 'object' && !Array.isArray(value) && 'inputType' in value) {
                    this.logger.error(`🚨 [CONSTRUCTOR] TEMPLATE CONFIG in defaultValue:`, {
                        objectPath: options.objectPath,
                        key,
                        value,
                        message: 'Template config passed as defaultValue!'
                    });
                }
            }
        }
        
        // Calculate objectTemplatePath based on the object type
        if (options.objectTemplatePath) {
            // Explicitly provided template path (for nested objects)
            this.objectTemplatePath = options.objectTemplatePath;
        } else if (this.isEditableObject) {
            // For editableObject fields: objectPath.objectTemplate
            this.objectTemplatePath = this.objectPath ? `${this.objectPath}.objectTemplate` : "objectTemplate";
        } else if (this.isListObject) {
            // For list object items: replace .N with .objectTemplate (e.g., "methods.0" -> "methods.objectTemplate")
            this.objectTemplatePath = this.objectPath.replace(/\.\d+$/, '.objectTemplate');
        } else {
            // For regular objects: same as objectPath
            this.objectTemplatePath = this.objectPath;
        }
        
        this.logger.debug('🏗️ UniversalObjectRenderer created:', {
            label: options.label,
            objectPath: this.objectPath,
            renderingMode: this.renderingMode,
            objectKeys: Object.keys(this.object)
        });
        
        // CRITICAL FIX: Sync this.object from InputManager before first render
        // This ensures consistency with how subclass changes update this.object
        // BUT: Only sync fields that exist in the current template to avoid stale data
        if (this.inputManager && this.templateManager) {
            if (this.objectPath) {
                const existingData = this.inputManager.getValue(this.objectPath);
                if (typeof existingData === 'object' && existingData !== null && 
                    !Array.isArray(existingData) && !(existingData instanceof Date)) {
                    
                    // Filter the data to only include fields defined in the template
                    const templateFields = this.getTemplateFields();
                    const filteredData: Record<string, FormFieldValue> = {};
                    
                    for (const [key, value] of Object.entries(existingData)) {
                        // Only include fields that are in the template OR if no template fields defined (allow all)
                        if (templateFields.length === 0 || templateFields.includes(key)) {
                            filteredData[key] = value;
                        } else {
                            this.logger.warn('📥 Skipping stale field from InputManager:', {
                                objectPath: this.objectPath,
                                key,
                                reason: 'Field not in current template'
                            });
                        }
                    }
                    
                    this.object = filteredData;
                    this.logger.debug('📥 Synced this.object from InputManager on initialization:', {
                        objectPath: this.objectPath,
                        objectKeys: Object.keys(this.object),
                        isListObject: this.isListObject,
                        skippedKeys: Object.keys(existingData).filter(k => !Object.keys(filteredData).includes(k))
                    });
                }
            } else {
                // For root level, use defaultValue or empty object (don't pull all data)
                this.logger.debug('📥 Root level object - using defaultValue or empty object');
            }
        }
        
        this.createUI(options.label);
        this.render();
    }

    private createUI(label: string): void {
        this.wrapper = this.container.createDiv({ cls: "editable-object-wrapper" });
        
        // Header with label and controls (matching ImprovedEditableObject structure)
        const header = this.wrapper.createDiv({ cls: "editable-object-header" });
        
        // Create label (editable or static based on options)
        if (this.allowKeyEdit && this.onKeyChange) {
            // Create editable label
            const labelElement = createEditableDiv(
                header,
                this.label,
                "Enter object name...",
                "text",
                (newKey) => {
                    const oldKey = this.label;
                    this.label = newKey;
                    this.onKeyChange?.(oldKey, newKey);
                }
            );
            labelElement.addClass("editable-object-label", "editable-object-label-editable");
        } else {
            // Create static label
            header.createDiv({ cls: "editable-object-label", text: this.label });
        }
        
        // Controls section for add field button and remove button
        const controls = header.createDiv({ cls: "editable-object-controls" });
        
        // Add field button
        if (this.shouldShowAddButton()) {
            const addButton = controls.createDiv({ cls: "editable-object-add-button", text: "+" });
            addButton.setAttribute("title", "Add new field");
            addButton.addEventListener("click", () => this.addNewField());
        }
        
        // Remove button for removeable objects
        if (this.removeable && this.onRemove) {
            const removeButton = new ButtonComponent(controls);
            removeButton.setIcon("trash");
            removeButton.setTooltip("Remove object");
            removeButton.buttonEl.addClass("editable-object-remove-button");
            removeButton.onClick(() => {
                if (this.onRemove) {
                    this.onRemove();
                }
            });
        }
        
        // Fields container (matching ImprovedEditableObject structure)
        this.fieldsContainer = this.wrapper.createDiv({ cls: "editable-object-fields" });
    }

    private render(): void {
        // 🔍 DEBUG: Log render call with context
        this.logger.debug(`🔍 [RENDER] render() called:`, {
            objectPath: this.objectPath,
            isUpdatingTemplate: this.isUpdatingTemplate,
            objectKeys: Object.keys(this.object),
            stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n')
        });
        
        // 🔍 DEBUG: Check for suspicious template config objects in this.object
        for (const [key, value] of Object.entries(this.object)) {
            if (value && typeof value === 'object' && !Array.isArray(value) && 'inputType' in value) {
                this.logger.error(`🚨 [RENDER] TEMPLATE CONFIG FOUND IN this.object:`, {
                    objectPath: this.objectPath,
                    key,
                    value,
                    message: 'Template configs should NOT be in render data!'
                });
            }
        }
        
        this.fieldsContainer.empty();
        this.fieldComponents.clear();
        
        const analysis = this.analyzeForRendering();
        
        // Create a combined rendering queue that preserves field order
        const renderingQueue: Array<{
            type: 'field' | 'nestedObject';
            key: string;
            config: FieldRenderingConfig | { key: string; path: string; config: UniversalObjectRendererOptions };
        }> = [];
        
        // Add all items to the queue in their original field order
        for (const fieldConfig of analysis.fields) {
            renderingQueue.push({
                type: 'field',
                key: fieldConfig.key,
                config: fieldConfig
            });
        }
        
        for (const nestedConfig of analysis.nestedObjects) {
            renderingQueue.push({
                type: 'nestedObject', 
                key: nestedConfig.key,
                config: nestedConfig
            });
        }
        
        // Sort the queue by the original field order from template
        const templateFields = this.getTemplateFields();
        const dataFields = Object.keys(this.object);
        const allFieldKeys = [...templateFields];
        
        // Add any data fields that aren't in template
        for (const dataField of dataFields) {
            if (!templateFields.includes(dataField)) {
                allFieldKeys.push(dataField);
            }
        }
        
        renderingQueue.sort((a, b) => {
            const indexA = allFieldKeys.indexOf(a.key);
            const indexB = allFieldKeys.indexOf(b.key);
            return indexA - indexB;
        });
        
        // Render items in the correct order
        for (const item of renderingQueue) {
            if (item.type === 'field') {
                this.renderField(item.config as FieldRenderingConfig);
            } else {
                this.renderNestedObject(item.config as { key: string; path: string; config: UniversalObjectRendererOptions });
            }
        }
        
        // Show empty state if no fields or nested objects
        if (analysis.fields.length === 0 && analysis.nestedObjects.length === 0) {
            const emptyState = this.fieldsContainer.createDiv({ cls: "editable-object-empty" });
            emptyState.createDiv({ 
                cls: "improved-editable-object-empty-text", 
                text: "No fields added yet. Click + to add a field." 
            });
        }
        
        // Register reactive fields with InputManager on first render
        if (!this.reactiveFieldsRegistered && this.inputManager && this.templateManager) {
            this.registerReactiveFieldsWithInputManager();
            this.reactiveFieldsRegistered = true;
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
        
        // Preserve template order while adding any additional data fields
        // Start with template fields in their original order
        const allFieldKeys = [...templateFields];
        
        // Add any data fields that aren't already in the template fields
        for (const dataField of dataFields) {
            if (!templateFields.includes(dataField)) {
                allFieldKeys.push(dataField);
            }
        }
        

        
        for (const key of allFieldKeys) {
            const value = this.object[key];
            const fieldPath = this.objectPath ? `${this.objectPath}.${key}` : key;
            
            // Use the pre-calculated objectTemplatePath and append the field key
            // Handle empty objectTemplatePath for root objects
            const templatePath = this.objectTemplatePath 
                ? `${this.objectTemplatePath}.${key}`
                : key;
            const templateField = this.templateManager?.getFieldTemplate(templatePath);
            const isEditableObjectField = templateField?.inputType === "editableObject";
            const isQueryDropdownField = templateField?.inputType === "queryDropdown" || templateField?.inputType === "multiQueryDropdown";
            const isNestedByValue = this.isNestedObject(value);
            const isNestedByTemplate = this.isNestedObjectByTemplate(templatePath);
            
            // Detailed logging for field analysis - use WARN level for queryDropdown fields
            const logLevel = (templateField && (templateField.inputType === 'queryDropdown' || templateField.inputType === 'multiQueryDropdown')) 
                ? 'warn' : 'debug';
            
            const logData = {
                key,
                fieldPath,
                templatePath,
                value: typeof value === 'object' ? { type: 'object', keys: Object.keys(value || {}) } : value,
                isEditableObjectField,
                isNestedByValue,
                isNestedByTemplate,
                templateField: templateField ? { 
                    inputType: templateField.inputType,
                    query: templateField.query,
                    search: templateField.search,
                    return: templateField.return,
                    fullTemplate: JSON.stringify(templateField, null, 2)
                } : null
            };
            
            if (logLevel === 'warn') {
                this.logger.debug('🔍 Analyzing queryDropdown field for rendering:', logData);
            } else {
                this.logger.debug('🔍 Analyzing field for rendering:', logData);
            }
            
            // 🚨 DEBUG: Check for incorrect nesting of number+unit fields
            if ((isNestedByValue || isNestedByTemplate) && !isEditableObjectField) {
                // This is being treated as a nested object - check if it's actually a number+unit field
                const hasUnits = templateField && 'units' in templateField;
                const valueIsNumberUnit = value && typeof value === 'object' && !Array.isArray(value) && 
                                        ('value' in value || 'unit' in value);
                
                if (hasUnits || valueIsNumberUnit) {
                    this.logger.error(`🚨 [ANALYZE] Number+unit field treated as nested object:`, {
                        key,
                        fieldPath,
                        templatePath,
                        value,
                        valueKeys: value && typeof value === 'object' ? Object.keys(value) : null,
                        templateField,
                        isNestedByValue,
                        isNestedByTemplate,
                        message: 'This should be a primitive field, not a nested object!'
                    });
                }
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
                    removeable: false, // editableObject fields are typically not removeable
                    inputType: "editableObject",
                    isFromTemplate: true
                };
                fields.push(fieldConfig);
            } else if (isQueryDropdownField) {
                // ✅ QueryDropdown fields should be treated as regular fields, not nested objects
                // Even though their value might be an object with {name, link} structure,
                // they should render as a single dropdown field
                this.logger.debug('✅ [FIXED] QueryDropdown field correctly identified, treating as regular field:', {
                    key,
                    fieldPath,
                    inputType: templateField.inputType
                });
                
                // Process as a regular field - don't skip to nested object handling
                // For queryDropdown, we need to convert the object value to a string for display
                // The object might be {name: "...", link: "..."} but we want to show just the name
                let displayValue: FormFieldValue = value;
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    // Extract the "name" field if it exists, otherwise use the whole object
                    const objValue = value as Record<string, unknown>;
                    displayValue = objValue.name as FormFieldValue || value;
                }
                
                const fieldConfig = this.createFieldConfig(key, displayValue, fieldPath);
                if (fieldConfig) {
                    fields.push(fieldConfig);
                }
            } else if (isNestedByValue || isNestedByTemplate) {
                // This is a regular nested object - render sub-fields directly
                const nestedValue = isNestedByValue ? value as Record<string, FormFieldValue> : {};
                
                // Determine if this should allow new fields:
                // - If it's nested by template (has template definition), allow template fields but not arbitrary new ones
                // - If it's nested by value only (no template definition), it was likely user-converted, so allow new fields
                const allowNewFields = !isNestedByTemplate;
                
                // For template-defined nested objects, we need to pass the correct objectTemplatePath
                // so the nested renderer can find the template fields
                let nestedObjectTemplatePath: string | undefined = undefined;
                if (isNestedByTemplate) {
                    // The templatePath points to where this nested object is defined in the template
                    nestedObjectTemplatePath = templatePath;
                }
                
                this.logger.debug('📦 Creating nested object:', { 
                    key, 
                    isNestedByValue, 
                    isNestedByTemplate, 
                    allowNewFields,
                    hasNestedValue: !!nestedValue && Object.keys(nestedValue).length > 0,
                    nestedObjectTemplatePath
                });
                
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
                        allowNewFields: allowNewFields,
                        objectTemplatePath: nestedObjectTemplatePath // Pass the template path for nested objects
                    }
                });
            } else {
                // Regular field - check if it should be displayed (query field)
                // Use the pre-calculated objectTemplatePath and append the field key
                // Handle empty objectTemplatePath for root objects
                const templateFieldForQuery = this.objectTemplatePath 
                    ? `${this.objectTemplatePath}.${key}`
                    : key;
                const templateField = this.templateManager?.getFieldTemplate(templateFieldForQuery);
                
                // Skip rendering if query is explicitly set to false
                if (templateField && templateField.query === false) {
                    this.logger.debug('Skipping field with query=false:', {
                        key,
                        fieldPath,
                        templateField
                    });
                    
                    // For fields with query=false, use the value already in InputManager
                    // (it should have been set by the reactive system during initialization)
                    const existingValue = this.inputManager?.getValue(fieldPath);
                    if (existingValue !== undefined) {
                        this.logger.debug(`Using existing value for query=false field "${fieldPath}":`, existingValue);
                    } else if (templateField.default !== undefined) {
                        // Check if this is a function descriptor
                        const defaultValue = templateField.default;
                        const isFunction = defaultValue && 
                                         typeof defaultValue === 'object' && 
                                         defaultValue !== null &&
                                         'type' in defaultValue && 
                                         (defaultValue as Record<string, unknown>).type === 'function';
                        
                        if (isFunction) {
                            const functionDescriptor = defaultValue as { type: string; userInputs?: string[]; descriptor?: string };
                            if (functionDescriptor.userInputs && Array.isArray(functionDescriptor.userInputs)) {
                                // This is a reactive function - skip evaluation during rendering
                                this.logger.debug(`Skipping reactive function evaluation during rendering for "${fieldPath}"`);
                            } else {
                                // This is a static function - safe to evaluate
                                const evaluatedValue = this.templateManager?.getFieldDefaultValue(templateFieldForQuery);
                                if (evaluatedValue !== undefined) {
                                    this.inputManager?.setValue(fieldPath, evaluatedValue);
                                }
                            }
                        } else {
                            // Simple default value - safe to set
                            this.inputManager?.setValue(fieldPath, defaultValue);
                        }
                    }
                    continue;
                }
                
                // Skip rendering if inputType is "postprocessor"
                // These fields are evaluated after filename/path resolution in NoteCreator
                if (templateField && templateField.inputType === 'postprocessor') {
                    this.logger.debug('Skipping postprocessor field (evaluated after path resolution):', {
                        key,
                        fieldPath,
                        inputType: templateField.inputType
                    });
                    // Don't set any value here - postprocessor fields are set by NoteCreator
                    continue;
                }
                
                const fieldConfig = this.createFieldConfig(key, value, fieldPath);
                fields.push(fieldConfig);
            }
        }
        
        return { fields, nestedObjects };
    }

    private getSafeDefaultValue(templatePath: string, templateField: Record<string, unknown>): FormFieldValue | undefined {
        // First, check if the value is already in InputManager (set by reactive system)
        const existingValue = this.inputManager?.getValue(templatePath);
        
        // 🔍 DEBUG: Log InputManager check for number+unit fields
        if (templateField?.inputType === 'number' && templateField?.units) {
            this.logger.debug(`🔍 [GET DEFAULT] InputManager check for number+unit field:`, {
                templatePath,
                existingValue,
                existingValueType: typeof existingValue,
                hasInputManager: !!this.inputManager
            });
        }
        
        if (existingValue !== undefined) {
            return existingValue;
        }
        
        // If no existing value, only evaluate non-reactive defaults
        if (templateField?.default !== undefined) {
            const defaultValue = templateField.default;
            const isFunction = defaultValue && 
                             typeof defaultValue === 'object' && 
                             defaultValue !== null &&
                             'type' in defaultValue && 
                             (defaultValue as Record<string, unknown>).type === 'function';
            
            if (isFunction) {
                const functionDescriptor = defaultValue as { type: string; userInputs?: string[]; descriptor?: string };
                if (functionDescriptor.userInputs && Array.isArray(functionDescriptor.userInputs)) {
                    // This is a reactive function - don't evaluate during rendering
                    this.logger.debug(`Skipping reactive function during rendering for "${templatePath}"`);
                    return undefined;
                } else {
                    // This is a static function - safe to evaluate
                    return this.templateManager?.getFieldDefaultValue(templatePath);
                }
            } else {
                // CRITICAL FIX: For number+unit fields, convert scalar default to {value, unit} object
                if (templateField.inputType === 'number' && templateField.units) {
                    // Check if default is already in {value, unit} format
                    if (typeof defaultValue === 'object' && defaultValue !== null && 
                        'value' in defaultValue && 'unit' in defaultValue) {
                        return defaultValue as FormFieldValue;
                    }
                    // Convert scalar default to {value, unit} structure
                    const defaultUnit = templateField.defaultUnit || 
                                      (Array.isArray(templateField.units) ? templateField.units[0] : undefined);
                    return {
                        value: defaultValue,
                        unit: defaultUnit
                    } as FormFieldValue;
                }
                
                // Simple default value - safe to use
                return defaultValue as FormFieldValue;
            }
        }
    }

    private createFieldConfig(key: string, value: FormFieldValue, fieldPath: string): FieldRenderingConfig {
        // Use the pre-calculated objectTemplatePath and append the field key
        // Handle empty objectTemplatePath for root objects
        const templatePath = this.objectTemplatePath 
            ? `${this.objectTemplatePath}.${key}`
            : key;
        
        const templateField = this.templateManager?.getFieldTemplate(templatePath);
        const isFromTemplate = !!templateField;
        
        // 🔍 DEBUG: Log number+unit field configuration extraction
        if (templateField?.inputType === 'number' && templateField?.units) {
            this.logger.debug(`🔍 [CONFIG] Number+unit field configuration:`, {
                key,
                fieldPath,
                templatePath,
                objectTemplatePath: this.objectTemplatePath,
                value,
                valueType: typeof value,
                valueStructure: value && typeof value === 'object' ? { ...value } : null,
                templateField: {
                    inputType: templateField.inputType,
                    units: templateField.units,
                    defaultUnit: templateField.defaultUnit,
                    default: templateField.default
                },
                isFromTemplate,
                stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n')
            });
        }
        
        this.logger.debug('🔍 createFieldConfig:', {
            key,
            fieldPath,
            templatePath,
            objectTemplatePath: this.objectTemplatePath,
            isFromTemplate,
            templateField,
            value
        });
        
        // For list inputs, handle array values properly
        if (templateField?.inputType === "list") {
            this.logger.debug('📋 List field detected:', {
                key,
                inputType: templateField.inputType,
                listType: templateField.listType,
                hasObjectTemplate: !!templateField.objectTemplate,
                templateField
            });
            
            // Get the evaluated default value from template if no current value
            let listValue: FormFieldValue[];
            if (Array.isArray(value) && value.length > 0) {
                listValue = value;
            } else {
                // Use safe method to get default value (avoids reactive function evaluation during rendering)
                const templateDefault = this.getSafeDefaultValue(templatePath, templateField);
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
                allowKeyEdit: templateField?.editableKey ?? (!isFromTemplate && this.renderingMode !== "readonly"),
                allowTypeSwitch: templateField?.allowTypeSwitch ?? (!isFromTemplate && this.renderingMode === "editable"),
                removeable: templateField?.removeable ?? (!isFromTemplate && this.renderingMode === "editable"),
                inputType: "list", // Keep original inputType as "list"
                inputOptions: {
                    // Include options if they exist
                    ...(typeof templateField?.options === 'object' && !Array.isArray(templateField?.options) 
                        ? templateField.options as Record<string, unknown> 
                        : {}),
                    // Add units and defaultUnit from template field
                    ...(templateField?.units ? { units: templateField.units } : {}),
                    ...(templateField?.defaultUnit ? { defaultUnit: templateField.defaultUnit } : {}),
                    // Add other template properties that might be needed
                    ...(templateField?.multiline ? { multiline: templateField.multiline } : {}),
                    // Store the detailed list type in inputOptions for LabeledPrimitiveInput
                    listType: listType
                },
                isFromTemplate,
                position: (templateField?.position && typeof templateField.position === 'object') 
                    ? templateField.position as { insertAfter?: string; insertBefore?: string; }
                    : undefined,
                // Object list properties
                listType: templateField?.listType as string,
                objectTemplate: templateField?.objectTemplate as Record<string, unknown>
            };
        } else {
            // Convert value to primitive type for non-list inputs
            let primitiveValue: PrimitiveValue | null = null;
            
            // Check if this is a number with unit field - preserve object structure
            if (templateField?.inputType === 'number' && templateField?.units && 
                typeof value === 'object' && value !== null && 'value' in value && 'unit' in value) {
                // Preserve the {value, unit} object structure for number+unit fields
                primitiveValue = value as { value: number; unit: string };
            } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
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
                // Use safe method to get default value (avoids reactive function evaluation during rendering)
                const templateDefault = this.getSafeDefaultValue(templatePath, templateField);
                
                // Check if this is a number+unit default value - preserve object structure
                if (templateField.inputType === 'number' && templateField.units && 
                    typeof templateDefault === 'object' && templateDefault !== null && 
                    'value' in templateDefault && 'unit' in templateDefault) {
                    defaultValue = templateDefault as { value: number; unit: string };
                } else if (typeof templateDefault === 'string' || typeof templateDefault === 'number' || typeof templateDefault === 'boolean') {
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
                allowKeyEdit: templateField?.editableKey ?? (!isFromTemplate && this.renderingMode !== "readonly"),
                allowTypeSwitch: templateField?.allowTypeSwitch ?? (!isFromTemplate && this.renderingMode === "editable"),
                removeable: templateField?.removeable ?? (!isFromTemplate && this.renderingMode === "editable"),
                inputType: templateField?.inputType || this.inferInputType(value),
                inputOptions: {
                    // Include options if they exist
                    ...(typeof templateField?.options === 'object' && !Array.isArray(templateField?.options) 
                        ? templateField.options as Record<string, unknown> 
                        : {}),
                    // Add units and defaultUnit from template field
                    ...(templateField?.units ? { units: templateField.units } : {}),
                    ...(templateField?.defaultUnit ? { defaultUnit: templateField.defaultUnit } : {}),
                    // Add icon and tooltip for actiontext fields
                    ...(templateField?.icon ? { icon: templateField.icon } : {}),
                    ...(templateField?.tooltip ? { tooltip: templateField.tooltip } : {}),
                    // Add action function for actiontext fields
                    ...(templateField?.action ? { action: templateField.action } : {}),
                    // Add other template properties that might be needed
                    ...(templateField?.multiline ? { multiline: templateField.multiline } : {})
                },
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
        this.logger.debug('🔍 determineListType called:', {
            templateField,
            listValue,
            hasListType: !!templateField.listType,
            hasLegacyType: !!templateField.type,
            listTypeValue: templateField.listType,
            legacyTypeValue: templateField.type
        });
        
        // Check if template has a 'listType' field specifying the list element type
        if (templateField.listType) {
            this.logger.debug('✅ Using listType:', templateField.listType);
            switch (templateField.listType) {
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
                    // Unknown listType, fall back to inference
                    this.logger.debug('⚠️ Unknown listType, falling back to inference');
                    break;
            }
        }
        
        // Fallback: Check legacy 'type' field for backward compatibility
        if (templateField.type) {
            this.logger.debug('🔄 Using legacy type field:', templateField.type);
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
                this.logger.debug('📊 Inferred type from value: list (number)');
                return "list (number)";
            } else if (typeof firstElement === "boolean") {
                this.logger.debug('☑️ Inferred type from value: list (boolean)');
                return "list (boolean)";
            } else if (firstElement instanceof Date) {
                this.logger.debug('📅 Inferred type from value: list (date)');
                return "list (date)";
            } else if (typeof firstElement === "object") {
                this.logger.debug('🧩 Inferred type from value: list (object)');
                return "list (object)";
            } else {
                this.logger.debug('📝 Inferred type from value: list (string)');
                return "list (string)";
            }
        }
        
        // Default to string list
        this.logger.debug('⚙️ Defaulting to: list (string)');
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
        this.logger.debug('🎨 renderEditableField:', {
            key: config.key,
            value: config.value,
            inputType: config.inputType,
            listType: config.listType,
            hasObjectTemplate: !!config.objectTemplate,
            hasUnits: !!(config.inputOptions?.units),
            config
        });
        
        // Check if this is an editableObject field
        if (config.inputType === "editableObject") {
            this.logger.debug('🔧 Routing to editableObject renderer');
            this.renderEditableObjectField(container, config);
        } else if (config.inputType === "list" && config.listType === "object" && config.objectTemplate) {
            // Handle object lists specially
            this.logger.debug('📋 Routing to object list renderer');
            this.renderObjectListField(container, config);
        } else if (config.inputType === "actiontext") {
            // Handle actiontext fields specially - text input with action button
            this.logger.debug('🎬 Routing to actiontext renderer');
            this.renderActionTextField(container, config);
        } else if (config.inputType === "filePicker") {
            // Handle filePicker fields - file selection from vault
            this.logger.debug('📁 Routing to filePicker renderer');
            this.renderFilePickerField(container, config);
        } else if (this.isDropdownType(config.inputType)) {
            this.logger.debug('🔽 Routing to dropdown renderer');
            this.renderDropdownField(container, config);
        } else {
            // Use LabeledPrimitiveInput for primitive types and primitive lists
            this.logger.debug('📝 Routing to primitive field renderer');
            this.renderPrimitiveField(container, config);
        }
    }

    private isDropdownType(inputType: string): boolean {
        return inputType === "dropdown" || 
               inputType === "multiselect" || 
               inputType === "queryDropdown" || 
               inputType === "multiQueryDropdown" ||
               inputType === "subclass";
    }

    private renderEditableObjectField(container: HTMLElement, config: FieldRenderingConfig): void {
        const fieldPath = this.objectPath ? `${this.objectPath}.${config.key}` : config.key;
        
        // For editableObject fields, the config.value should already be the correct object value
        // from the analysis phase
        let objectValue = config.value as Record<string, FormFieldValue>;
        if (!objectValue || typeof objectValue !== 'object' || Array.isArray(objectValue)) {
            objectValue = {};
        }
        
        // For nested editableObject fields, the objectTemplatePath should point to the nested objectTemplate
        const nestedObjectTemplatePath = `${this.objectTemplatePath}.${config.key}.objectTemplate`;
        
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
            objectTemplatePath: nestedObjectTemplatePath, // Pass the correct template path for nested objects
            onChangeCallback: (updatedObject) => {
                // Update the parent object with the new editable object value
                this.object[config.key] = updatedObject;
                
                // Update the specific nested object in InputManager
                if (this.inputManager) {
                    const fieldPath = this.objectPath ? `${this.objectPath}.${config.key}` : config.key;
                    this.inputManager.setValue(fieldPath, updatedObject);
                }
                
                this.onChangeCallback(this.object);
            },
            app: this.app
        });
        
        this.addChild(editableObjectRenderer);
    }

    private renderObjectListField(container: HTMLElement, config: FieldRenderingConfig): void {
        const fieldPath = this.objectPath ? `${this.objectPath}.${config.key}` : config.key;
        
        this.logger.debug('🎯 renderObjectListField:', {
            key: config.key,
            fieldPath,
            objectPath: this.objectPath,
            objectTemplatePath: this.objectTemplatePath,
            isEditableObject: this.isEditableObject,
            isListObject: this.isListObject,
            config,
            hasObjectTemplate: !!config.objectTemplate
        });
        
        // Use the pre-calculated objectTemplatePath and append the field key
        // Handle empty objectTemplatePath for root objects
        const templatePath = this.objectTemplatePath 
            ? `${this.objectTemplatePath}.${config.key}`
            : config.key;
        
        this.logger.debug('🔍 Looking for template at path:', templatePath);
        const originalTemplateField = this.templateManager?.getFieldTemplate(templatePath);
        this.logger.debug('📋 Found template field:', originalTemplateField);
        
        // Use the renderObjectList method to create the UI, passing the full template field
        const templateFieldForRender = {
            label: config.key,
            listType: config.listType,
            objectTemplate: config.objectTemplate,
            itemLabel: "Item", // Could be made configurable
            initialItems: originalTemplateField?.initialItems || 0 // Pass through initialItems
        };
        
        this.logger.debug('🎨 Template field for render:', templateFieldForRender);
        
        const objectListElement = this.renderObjectList(config.key, config.value, templateFieldForRender, fieldPath);
        
        container.appendChild(objectListElement);
        
        // Store reference for cleanup (HTML elements don't fit the component map type, but we need to track them)
        this.fieldComponents.set(config.key, objectListElement as unknown as LabeledPrimitiveInput | LabeledDropdown | QueryDropdown | UniversalObjectRenderer);
    }

    private renderDropdownField(container: HTMLElement, config: FieldRenderingConfig): void {
        // For object list items and editable objects, use objectTemplatePath; otherwise use objectPath
        const templatePath = this.objectTemplatePath 
            ? `${this.objectTemplatePath}.${config.key}`
            : (this.objectPath ? `${this.objectPath}.${config.key}` : config.key);
            
        const templateField = this.templateManager?.getFieldTemplate(templatePath);
        
        this.logger.debug('Rendering dropdown field:', {
            key: config.key,
            inputType: config.inputType,
            templatePath,
            objectPath: this.objectPath,
            objectTemplatePath: this.objectTemplatePath,
            templateField,
            options: templateField?.options,
            hasSearch: !!templateField?.search,
            searchParam: templateField?.search
        });
        
        if (config.inputType === "queryDropdown" || config.inputType === "multiQueryDropdown") {
            this.renderQueryDropdownField(container, config, templateField);
        } else if (config.inputType === "subclass") {
            this.renderSubclassDropdownField(container, config, templateField);
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
            } else if (typeof templateField.options === 'string') {
                options = [templateField.options];
            } else {
                // If it's not array or string, try to convert to array
                logger.warn('Unexpected options format for dropdown:', templateField.options);
                options = [];
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
                // Always use the current key from the component, not the original config.key
                const currentKey = dropdown.getKey();
                this.logger.debug('Type change requested:', { oldType: config.inputType, newType, key: currentKey });
                
                if (newType === 'object') {
                    // Convert primitive field to object field
                    this.convertPrimitiveToObject(currentKey, config.value);
                } else {
                    // Handle other type changes (primitive to primitive)
                    this.handlePrimitiveTypeChange(currentKey, newType, config.value);
                }
            } : undefined,
            onRemove: !config.isFromTemplate ? () => {
                this.handleFieldRemove(config.key);
            } : undefined,
            onValueChange: (value) => {
                this.handleFieldChangeWithCurrentKey(config.key, value);
            }
        });
        
        // Store component reference for internal management
        this.fieldComponents.set(config.key, dropdown);
        
        // Register component with InputManager so reactive system can access it
        if (this.inputManager) {
            this.inputManager.setInput(config.key, dropdown);
            this.logger.debug('Registered LabeledDropdown with InputManager:', config.key);
        }
    }

    private renderSubclassDropdownField(container: HTMLElement, config: FieldRenderingConfig, templateField?: Record<string, unknown>): void {
        // Get options from template
        let options: string[] = [];
        if (templateField?.options) {
            if (Array.isArray(templateField.options)) {
                options = templateField.options;
            } else if (typeof templateField.options === 'string') {
                options = [templateField.options];
            } else {
                // If it's not array or string, try to convert to array
                logger.warn('Unexpected options format for subclass dropdown:', templateField.options);
                options = [];
            }
        }
        
        this.logger.debug('Subclass dropdown options processed:', {
            key: config.key,
            originalOptions: templateField?.options,
            processedOptions: options
        });
        
        // Get current value (subclass is always single select)
        const currentValue = String(config.value || "");
        
        const subclassDropdown = new LabeledSubclassDropdown({
            container: container,
            label: config.key,
            defaultValue: currentValue,
            options: options,
            multiselect: false, // Subclass is always single select
            editableKey: config.allowKeyEdit,
            allowTypeSwitch: config.allowTypeSwitch,
            removeable: !config.isFromTemplate,
            templateManager: this.templateManager,
            onTemplateUpdate: () => {
                // When subclass template is applied, re-render this component
                this.logger.debug('Subclass template updated, triggering re-render');
                this.handleSubclassTemplateUpdate();
            },
            onKeyChange: config.allowKeyEdit ? (oldKey, newKey) => this.handleKeyChange(oldKey, newKey) : undefined,
            onTypeChange: config.allowTypeSwitch ? (newType) => {
                // Always use the current key from the component, not the original config.key
                const currentKey = subclassDropdown.getKey();
                this.logger.debug('Subclass dropdown type change requested:', { oldType: config.inputType, newType, key: currentKey });
                
                if (newType === 'object') {
                    // Convert primitive field to object field
                    this.convertPrimitiveToObject(currentKey, config.value);
                } else {
                    // Handle other type changes (primitive to primitive)
                    this.handlePrimitiveTypeChange(currentKey, newType, config.value);
                }
            } : undefined,
            onRemove: !config.isFromTemplate ? () => {
                this.handleFieldRemove(config.key);
            } : undefined,
            onValueChange: (value) => {
                this.handleFieldChangeWithCurrentKey(config.key, value);
            }
        });
        
        // Enable user interaction detection after initial setup - DELAYED to prevent initialization loops
        setTimeout(() => {
            subclassDropdown.enableUserInteractionDetection();
            this.logger.debug('User interaction detection enabled for subclass dropdown with delay');
        }, 50); // Longer delay to ensure all initialization is complete
        
        // Store component reference for internal management
        this.fieldComponents.set(config.key, subclassDropdown);
        
        // Register component with InputManager so reactive system can access it
        if (this.inputManager) {
            this.inputManager.setInput(config.key, subclassDropdown);
            this.logger.debug('Registered SubclassDropdown with InputManager:', config.key);
        }
    }

    private renderQueryDropdownField(container: HTMLElement, config: FieldRenderingConfig, templateField?: Record<string, unknown>): void {
        // Check if QueryDropdown has valid configuration
        const hasSearch = templateField?.search && typeof templateField.search === 'string';
        const hasFromAndGet = templateField?.from && templateField?.get;
        const hasWhere = templateField?.where;
        
        if (!hasSearch && !hasFromAndGet && !hasWhere) {
            this.logger.error('QueryDropdown requires either a search parameter, both from and get parameters, or a where parameter:', {
                fieldKey: config.key,
                fieldPath: this.objectPath ? `${this.objectPath}.${config.key}` : config.key,
                templateField: templateField,
                hasSearch,
                hasFromAndGet,
                hasWhere
            });
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
            plugin: this.templateManager?.getPlugin() || ({} as ElnPlugin), // Fallback if plugin not available
            // Use spread operator to preserve all template field parameters
            ...templateField,
            editableKey: config.allowKeyEdit,
            allowTypeSwitch: config.allowTypeSwitch,
            removeable: !config.isFromTemplate,
            getUserData: () => this.inputManager?.getData() || {},
            onKeyChange: config.allowKeyEdit ? (oldKey, newKey) => this.handleKeyChange(oldKey, newKey) : undefined,
            onTypeChange: config.allowTypeSwitch ? (newType) => {
                // Always use the current key from the component, not the original config.key
                const currentKey = queryDropdown.getKey();
                this.logger.debug('Query dropdown type change requested:', { oldType: config.inputType, newType, key: currentKey });
                
                if (newType === 'object') {
                    // Convert primitive field to object field
                    this.convertPrimitiveToObject(currentKey, config.value);
                } else {
                    // Handle other type changes (primitive to primitive)
                    this.handlePrimitiveTypeChange(currentKey, newType, config.value);
                }
            } : undefined,
            onRemove: !config.isFromTemplate ? () => {
                this.handleFieldRemove(config.key);
            } : undefined,
            onValueChange: (value, returnValues) => {
                this.logger.debug('UniversalObjectRenderer: QueryDropdown onValueChange called:', {
                    configKey: config.key,
                    objectPath: this.objectPath,
                    value: value,
                    returnValues: returnValues,
                    returnValuesType: typeof returnValues,
                    isArray: Array.isArray(returnValues)
                });
                
                // Handle return values properly with dot notation
                if (returnValues && !Array.isArray(returnValues) && typeof returnValues === 'object') {
                    // Single select with return values - set each field individually using dot notation
                    // The keys in returnValues are now expected to be full paths from the template
                    this.logger.debug('UniversalObjectRenderer: Processing single select return values:', {
                        returnValueKeys: Object.keys(returnValues)
                    });
                    
                    for (const [fullPath, fieldValue] of Object.entries(returnValues)) {
                        if (this.inputManager) {
                            // When inside an array (objectPath includes array index), we need to inject the index
                            // into the template path. E.g., convert "sample.educts.name" to "sample.educts.0.name"
                            let actualPath = fullPath;
                            
                            if (this.objectPath) {
                                // Check if objectPath contains an array index (e.g., "sample.educts.0")
                                const pathParts = this.objectPath.split('.');
                                const lastPart = pathParts[pathParts.length - 1];
                                
                                if (!isNaN(Number(lastPart))) {
                                    // We're inside an array item, need to inject the index
                                    const arrayIndex = lastPart;
                                    const arrayPath = pathParts.slice(0, -1).join('.'); // e.g., "sample.educts"
                                    
                                    // Check if fullPath starts with the array path
                                    if (fullPath.startsWith(arrayPath + '.')) {
                                        // Extract the field name after the array path
                                        const fieldName = fullPath.substring(arrayPath.length + 1); // e.g., "name"
                                        // Reconstruct with index: "sample.educts.0.name"
                                        actualPath = `${arrayPath}.${arrayIndex}.${fieldName}`;
                                    }
                                }
                            }
                            
                            this.logger.debug('UniversalObjectRenderer: Setting return value:', {
                                configKey: config.key,
                                objectPath: this.objectPath,
                                templatePath: fullPath,
                                actualPath: actualPath,
                                value: fieldValue
                            });
                            
                            // Use InputManager to set the field with the actual indexed path
                            this.inputManager.setValue(actualPath, fieldValue as FormFieldValue);
                        }
                    }
                    // Don't overwrite return values - only store display value if no return clause
                } else if (returnValues && Array.isArray(returnValues) && returnValues.length > 0) {
                    // Multi-select with return values - strip parent path from keys
                    // Example: "sample.preparation.name" -> "name"
                    // Need to use full fieldPath, not just config.key
                    const fullFieldPath = this.objectPath ? `${this.objectPath}.${config.key}` : config.key;
                    
                    this.logger.debug('MultiQueryDropdown - Processing return values:', {
                        configKey: config.key,
                        objectPath: this.objectPath,
                        fullFieldPath: fullFieldPath,
                        returnValues: returnValues
                    });
                    
                    const strippedReturnValues = returnValues.map(item => {
                        const strippedItem: Record<string, unknown> = {};
                        for (const [fullKey, value] of Object.entries(item)) {
                            // Extract the last segment after the parent path
                            // e.g., "sample.preparation.name" -> "name"
                            // Use fullFieldPath which includes the complete path (e.g., "sample.preparation")
                            if (fullKey.startsWith(fullFieldPath + '.')) {
                                const fieldName = fullKey.substring(fullFieldPath.length + 1);
                                this.logger.debug('MultiQueryDropdown - Stripping key:', {
                                    fullKey,
                                    fullFieldPath,
                                    strippedTo: fieldName
                                });
                                strippedItem[fieldName] = value;
                            } else {
                                // If it doesn't match the expected pattern, keep the original key
                                this.logger.debug('MultiQueryDropdown - Keeping original key:', {
                                    fullKey,
                                    fullFieldPath,
                                    reason: 'Does not start with fullFieldPath'
                                });
                                strippedItem[fullKey] = value;
                            }
                        }
                        return strippedItem;
                    });
                    
                    this.logger.debug('MultiQueryDropdown - Stripped return values:', {
                        original: returnValues,
                        stripped: strippedReturnValues
                    });
                    
                    this.handleFieldChangeWithCurrentKey(config.key, strippedReturnValues as unknown as FormFieldValue);
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

        // Register QueryDropdown with reactive dependencies if it has any
        const reactiveDeps = queryDropdown.getReactiveDependencies();
        if (reactiveDeps.length > 0 && this.inputManager) {
            this.logger.debug('Registering QueryDropdown with reactive dependencies:', {
                field: config.key,
                dependencies: reactiveDeps
            });
            
            // Register a custom reactive field that updates the QueryDropdown
            // Use a prefix that will be filtered out from final data
            this.inputManager.registerReactiveField(
                `__reactive_trigger__${config.key}_query`, // Internal prefix for filtering
                reactiveDeps,
                () => {
                    this.logger.debug('Updating QueryDropdown due to reactive dependency change:', config.key);
                    queryDropdown.updateQuery();
                    return null; // This reactive field doesn't set a value, it just triggers an update
                }
            );
        }
        
        // Store component reference for internal management
        this.fieldComponents.set(config.key, queryDropdown);
        
        // Register component with InputManager so reactive system can access it
        if (this.inputManager) {
            this.inputManager.setInput(config.key, queryDropdown);
            this.logger.debug('Registered QueryDropdown with InputManager:', config.key);
        }
    }

    private renderPrimitiveField(container: HTMLElement, config: FieldRenderingConfig): void {
        // For list fields, check if we have a specific listType in inputOptions
        let primitiveType = this.mapInputTypeToPrimitive(config.inputType, !!(config.inputOptions?.units));
        if (config.inputType === "list" && config.inputOptions?.listType) {
            primitiveType = this.mapInputTypeToPrimitive(config.inputOptions.listType as string, !!(config.inputOptions?.units));
        }
        
        // 🔍 DEBUG: Log number+unit field creation with full details
        if (primitiveType === 'number with unit' || config.inputOptions?.units) {
            this.logger.debug(`🔍 [RENDER] Creating number+unit field:`, {
                key: config.key,
                inputType: config.inputType,
                primitiveType: primitiveType,
                value: config.value,
                valueType: typeof config.value,
                hasUnits: !!config.inputOptions?.units,
                units: config.inputOptions?.units,
                defaultUnit: config.inputOptions?.defaultUnit,
                stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n')  // Show where this was called from
            });
        }
        
        // Use LabeledPrimitiveInput for all primitive types and lists
        const input = new LabeledPrimitiveInput({
            container: container,
            label: config.key,
            type: primitiveType,
            defaultValue: config.value as PrimitiveValue,
            editableKey: config.allowKeyEdit,
            allowTypeSwitch: config.allowTypeSwitch,
            removeable: config.removeable,
            units: Array.isArray(config.inputOptions?.units) ? config.inputOptions.units as string[] : undefined,
            defaultUnit: typeof config.inputOptions?.defaultUnit === 'string' ? config.inputOptions.defaultUnit : undefined,
            multiline: typeof config.inputOptions?.multiline === 'boolean' ? config.inputOptions.multiline : undefined,
            app: this.app, // Pass the app instance
            onValueChange: (value) => {
                // Always use the current key from the component, not the original config.key
                const currentKey = input.getCurrentKey();
                this.handleFieldChangeWithCurrentKey(currentKey, value as FormFieldValue);
            },
            onKeyChange: config.allowKeyEdit ? (oldKey, newKey) => this.handleKeyChange(oldKey, newKey) : undefined,
            onTypeChange: config.allowTypeSwitch ? (newType) => {
                // Always use the current key from the component, not the original config.key
                const currentKey = input.getCurrentKey();
                this.logger.debug('Primitive input type change requested:', { oldType: primitiveType, newType, key: currentKey });
                
                if (newType === 'object') {
                    // Convert primitive field to object field
                    this.convertPrimitiveToObject(currentKey, config.value);
                } else {
                    // Handle other type changes (primitive to primitive)
                    this.handlePrimitiveTypeChange(currentKey, newType, config.value);
                }
            } : undefined,
            onRemove: config.removeable ? () => {
                // For removal, also use the current key
                const currentKey = input.getCurrentKey();
                this.handleFieldRemove(currentKey);
            } : undefined
        });
        
        // Store component reference for internal management
        this.fieldComponents.set(config.key, input);
        
        // Register component with InputManager so reactive system can access it
        if (this.inputManager) {
            this.inputManager.setInput(config.key, input);
            this.logger.debug('Registered LabeledPrimitiveInput with InputManager:', config.key);
        }
    }

    private renderActionTextField(container: HTMLElement, config: FieldRenderingConfig): void {
        // ActionText is a text input with an action button
        
        const input = new LabeledPrimitiveInput({
            container: container,
            label: config.key,
            type: "text",
            defaultValue: config.value as string || "",
            editableKey: config.allowKeyEdit,
            allowTypeSwitch: config.allowTypeSwitch,
            removeable: config.removeable,
            app: this.app,
            onValueChange: (value) => {
                const currentKey = input.getCurrentKey();
                this.handleFieldChangeWithCurrentKey(currentKey, value as FormFieldValue);
            },
            onKeyChange: config.allowKeyEdit ? (oldKey, newKey) => this.handleKeyChange(oldKey, newKey) : undefined,
            onTypeChange: config.allowTypeSwitch ? (newType) => {
                // Always use the current key from the component, not the original config.key
                const currentKey = input.getCurrentKey();
                this.logger.debug('ActionText input type change requested:', { oldType: "text", newType, key: currentKey });
                if (newType === 'object') {
                    this.convertPrimitiveToObject(currentKey, config.value);
                } else {
                    this.handlePrimitiveTypeChange(currentKey, newType, config.value);
                }
            } : undefined,
            onRemove: config.removeable ? () => {
                const currentKey = input.getCurrentKey();
                this.handleFieldRemove(currentKey);
            } : undefined
        });
        
        // Store component reference
        this.fieldComponents.set(config.key, input);
        
        // Register with InputManager
        if (this.inputManager) {
            this.inputManager.setInput(config.key, input);
            this.logger.debug('Registered ActionText input with InputManager:', config.key);
        }
        
        // Add action button to the value section
        const wrapper = container.querySelector('.eln-modal-enhanced-input-wrapper');
        if (wrapper) {
            const valueSection = wrapper.querySelector('.eln-modal-enhanced-input-value-section') as HTMLElement;
            if (valueSection) {
                // Create action button using Obsidian's ButtonComponent
                const actionButton = new ButtonComponent(valueSection);
                
                // Set icon if provided
                const icon = config.inputOptions?.icon;
                if (icon && typeof icon === 'string') {
                    actionButton.setIcon(icon);
                }
                
                // Set tooltip if provided
                const tooltip = config.inputOptions?.tooltip;
                if (tooltip && typeof tooltip === 'string') {
                    actionButton.setTooltip(tooltip);
                }
                
                // Add CSS class for styling
                actionButton.buttonEl.addClass('eln-modal-action-button');
                
                // Add click handler - evaluate and execute the action function
                actionButton.onClick(async () => {
                    // Get the current input value
                    const inputValue = input.getValue();
                    
                    // Get the action function descriptor from config
                    const actionDescriptor = config.inputOptions?.action;
                    
                    if (actionDescriptor && this.inputManager && this.templateManager) {
                        try {
                            // Get all current form data for context
                            const userData = this.inputManager.getData();
                            
                            // Check if it's a function descriptor with new format
                            if (typeof actionDescriptor === 'object' && 'type' in actionDescriptor && actionDescriptor.type === 'function') {
                                // Get the plugin from templateManager
                                const plugin = this.templateManager.getPlugin();
                                
                                // Create a FunctionEvaluator to evaluate the action
                                const functionEvaluator = new FunctionEvaluator(plugin);
                                
                                // Evaluate the action function with input value as context
                                const result = functionEvaluator.evaluateFunction(
                                    actionDescriptor as AnyFunctionDescriptor,
                                    userData,
                                    undefined,
                                    inputValue
                                );
                                
                                // If the result is a promise (async function), await it
                                if (result && typeof result === 'object' && 'then' in result) {
                                    await result;
                                }
                            } else if (typeof actionDescriptor === 'function') {
                                // If it's already a function, call it directly
                                await actionDescriptor(inputValue);
                            }
                        } catch (error) {
                            this.logger.error('Failed to execute action function:', error);
                            new Notice('Failed to execute action. See console for details.');
                        }
                    } else {
                        // Fallback if no action is defined
                        new Notice('No action function defined for this field.');
                    }
                });
            }
        }
    }

    private renderFilePickerField(container: HTMLElement, config: FieldRenderingConfig): void {
        // FilePicker allows selecting files from the vault
        
        this.logger.debug('📁 Rendering filePicker field:', {
            key: config.key,
            value: config.value,
            baseFolder: config.inputOptions?.baseFolder,
            placeholder: config.inputOptions?.placeholder
        });
        
        // Get options from config
        const baseFolder = config.inputOptions?.baseFolder as string | undefined;
        const placeholder = config.inputOptions?.placeholder as string | undefined;
        const allowMultiple = config.inputOptions?.allowMultiple !== false; // Default true
        const fileExtensions = config.inputOptions?.fileExtensions as string[] | undefined;
        
        // Ensure value is an array
        let defaultValue: string[] = [];
        if (Array.isArray(config.value)) {
            defaultValue = config.value as string[];
        } else if (config.value && typeof config.value === 'string') {
            defaultValue = [config.value];
        }
        
        const filePicker = new FilePicker({
            container: container,
            label: config.key,
            app: this.app,
            defaultValue: defaultValue,
            baseFolder: baseFolder,
            placeholder: placeholder,
            allowMultiple: allowMultiple,
            fileExtensions: fileExtensions,
            editableKey: config.allowKeyEdit,
            allowTypeSwitch: config.allowTypeSwitch,
            removeable: config.removeable,
            onValueChange: (filePaths) => {
                const currentKey = filePicker.getKey();
                this.handleFieldChangeWithCurrentKey(currentKey, filePaths);
            },
            onKeyChange: config.allowKeyEdit ? (oldKey, newKey) => this.handleKeyChange(oldKey, newKey) : undefined,
            onRemove: config.removeable ? () => {
                const currentKey = filePicker.getKey();
                this.handleFieldRemove(currentKey);
            } : undefined
        });
        
        // Store component reference
        this.fieldComponents.set(config.key, filePicker);
        
        // Register with InputManager
        if (this.inputManager) {
            this.inputManager.setInput(config.key, filePicker);
            this.logger.debug('Registered FilePicker with InputManager:', config.key);
        }
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
            
            // Also update InputManager mapping
            if (this.inputManager) {
                this.inputManager.removeInput(originalKey);
                this.inputManager.setInput(actualKey, component);
                this.logger.debug('Updated InputManager component mapping:', { from: originalKey, to: actualKey });
            }
            
            // Remove the old key from the object if it exists
            if (this.object.hasOwnProperty(originalKey)) {
                delete this.object[originalKey];
            }
        }
        
        this.object[actualKey] = value;
        
        // Update the specific field in InputManager
        if (this.inputManager) {
            const fieldPath = this.objectPath ? `${this.objectPath}.${actualKey}` : actualKey;
            this.inputManager.setValue(fieldPath, value);
        }
        
        this.synchronizeAndNotifyChange();
    }

    private handleFieldChangeWithCurrentKey(currentKey: string, value: FormFieldValue): void {
        this.logger.debug('📝 Field change:', {
            objectPath: this.objectPath,
            currentKey,
            valueType: typeof value
        });
        
        // Update local object state
        this.object[currentKey] = value;
        
        // Directly update the specific field in InputManager
        if (this.inputManager) {
            const fieldPath = this.objectPath ? `${this.objectPath}.${currentKey}` : currentKey;
            this.inputManager.setValue(fieldPath, value);
        }
        
        // Notify parent of the change
        this.synchronizeAndNotifyChange();
    }

    /**
     * Synchronize this.object with InputManager state before calling onChangeCallback
     * This prevents empty/partial objects from overwriting complete data when list items exist
     */
    private synchronizeAndNotifyChange(): void {
        // Before calling onChangeCallback, ensure this.object is synchronized with InputManager
        if (this.inputManager && this.objectPath) {
            const inputManagerValue = this.inputManager.getValue(this.objectPath);
            if (typeof inputManagerValue === 'object' && inputManagerValue !== null && !Array.isArray(inputManagerValue)) {
                const inputManagerObj = inputManagerValue as Record<string, FormFieldValue>;
                const inputManagerKeys = Object.keys(inputManagerObj);
                const currentObjectKeys = Object.keys(this.object);
                
                // If InputManager has more complete data, use it instead
                if (inputManagerKeys.length > currentObjectKeys.length) {
                    this.logger.debug('🔄 Synchronizing object state with InputManager');
                    
                    // Merge InputManager state with current changes to prevent data loss
                    this.object = { ...inputManagerObj, ...this.object };
                }
            }
        }
        
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
                
                // Also update InputManager mapping
                if (this.inputManager) {
                    this.inputManager.removeInput(oldKey);
                    this.inputManager.setInput(newKey, component);
                    this.logger.debug('Updated InputManager component mapping for key change:', { from: oldKey, to: newKey });
                    
                    // Update the specific fields in InputManager instead of calling updateInputManager()
                    const oldFieldPath = this.objectPath ? `${this.objectPath}.${oldKey}` : oldKey;
                    const newFieldPath = this.objectPath ? `${this.objectPath}.${newKey}` : newKey;
                    
                    // Remove old field and set new field
                    this.inputManager.removeValue(oldFieldPath);
                    this.inputManager.setValue(newFieldPath, this.object[newKey]);
                }
                
                // If it's a LabeledPrimitiveInput, update its key tracking
                if (component instanceof LabeledPrimitiveInput) {
                    component.updateKey(newKey);
                } else if (component instanceof UniversalObjectRenderer) {
                    // Update the label for nested object renderers
                    component.updateLabel(newKey);
                }
            }
            
            this.onChangeCallback(this.object);
        }
    }

    /**
     * Update the label of this object renderer
     */
    public updateLabel(newLabel: string): void {
        const oldLabel = this.label;
        this.label = newLabel;
        
        // Update the label element in the UI
        if (this.wrapper) {
            const labelElement = this.wrapper.querySelector('.editable-object-label');
            if (labelElement) {
                if (labelElement.classList.contains('editable-object-label-editable')) {
                    // For editable labels, use the proper editable div update function
                    const editableDiv = labelElement as HTMLElement;
                    // Manually update the textContent since setEditableDivValue expects input behavior
                    editableDiv.textContent = newLabel;
                } else {
                    // For static labels, just update the text content
                    labelElement.textContent = newLabel;
                }
            }
        }
        
        this.logger.debug('Updated object label:', { oldLabel, newLabel });
    }

    /**
     * Update the object path of this object renderer
     */
    public updateObjectPath(newObjectPath: string): void {
        const oldPath = this.objectPath;
        this.objectPath = newObjectPath;
        
        // Update all field components that might have references to the old path
        for (const [key, component] of this.fieldComponents.entries()) {
            if (component instanceof UniversalObjectRenderer) {
                // Update nested object renderers recursively
                const nestedPath = `${newObjectPath}.${key}`;
                component.updateObjectPath(nestedPath);
            }
        }
        
        this.logger.debug('Updated object path:', { oldPath, newObjectPath });
    }

    private handleFieldRemove(key: string): void {
        delete this.object[key];
        
        // Find and remove the component from the UI
        const component = this.fieldComponents.get(key);
        if (component) {
            // Remove the DOM element
            let elementToRemove: HTMLElement | null = null;
            
            if (component instanceof LabeledPrimitiveInput || 
                component instanceof LabeledDropdown || 
                component instanceof QueryDropdown) {
                elementToRemove = component.getWrapper();
            } else if (component instanceof UniversalObjectRenderer) {
                elementToRemove = component.container;
            } else {
                // For HTML elements (like object lists)
                elementToRemove = component as unknown as HTMLElement;
            }
            
            if (elementToRemove && elementToRemove.parentElement) {
                // Remove the field container that wraps the component
                const fieldContainer = elementToRemove.closest('.editable-object-field');
                if (fieldContainer) {
                    fieldContainer.remove();
                } else {
                    elementToRemove.remove();
                }
            }
        }
        
        this.fieldComponents.delete(key);
        
        // Remove the specific field from InputManager instead of calling updateInputManager()
        if (this.inputManager) {
            const fieldPath = this.objectPath ? `${this.objectPath}.${key}` : key;
            this.inputManager.removeValue(fieldPath);
        }
        
        this.onChangeCallback(this.object);
    }

    /**
     * Add a single field to the UI without re-rendering the entire object
     */
    private addSingleField(key: string, value: FormFieldValue): void {
        // Remove empty state message if this is the first field being added
        const emptyState = this.fieldsContainer.querySelector('.editable-object-empty');
        if (emptyState) {
            emptyState.remove();
            this.logger.debug('🗑️ Removed empty state message');
        }
        
        // Create field configuration for the new field
        const fieldPath = this.objectPath ? `${this.objectPath}.${key}` : key;
        const config = this.createFieldConfig(key, value, fieldPath);
        
        // Render the single field
        this.renderField(config);
        
        this.logger.debug('✅ Added single field without re-rendering:', { key, value, fieldPath });
    }

    private handleNestedChange(key: string, nestedObject: Record<string, FormFieldValue>): void {
        this.object[key] = nestedObject;
        
        // Update the specific nested object in InputManager instead of calling updateInputManager()
        if (this.inputManager) {
            const fieldPath = this.objectPath ? `${this.objectPath}.${key}` : key;
            this.inputManager.setValue(fieldPath, nestedObject);
        }
        
        this.onChangeCallback(this.object);
    }

    private addNewField(): void {
        const key = `field${Object.keys(this.object).length + 1}`;
        this.object[key] = "";
        
        // Add the specific new field to InputManager instead of calling updateInputManager()
        if (this.inputManager) {
            const fieldPath = this.objectPath ? `${this.objectPath}.${key}` : key;
            this.inputManager.setValue(fieldPath, "");
        }
        
        // Instead of re-rendering the entire object, just add the new field
        this.addSingleField(key, "");
        
        this.onChangeCallback(this.object);
    }

    /**
     * DEPRECATED: This method caused cascading setValue calls for all fields.
     * Use specific inputManager.setValue(fieldPath, value) calls instead.
     * Kept for potential debugging or migration purposes.
     */
    private updateInputManager(): void {
        // Add debugging to trace which renderer is calling updateInputManager
        const stack = new Error().stack;
        const caller = stack?.split('\n')[2]?.trim();
        
        this.logger.debug('🔄 DEPRECATED UniversalObjectRenderer.updateInputManager() called:', {
            objectPath: this.objectPath,
            objectTemplatePath: this.objectTemplatePath,
            objectKeys: Object.keys(this.object),
            objectValues: this.object,
            caller,
            stackDepth: stack?.split('\n').length || 0
        });
        
        if (this.inputManager) {
            const path = this.objectPath;
            if (path) {
                // Instead of overwriting the entire object, update individual fields
                // This prevents overwriting existing properties in nested objects
                for (const [key, value] of Object.entries(this.object)) {
                    const fullFieldPath = `${path}.${key}`;
                    this.inputManager.setValue(fullFieldPath, value);
                }
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
        // CRITICAL FIX: Number+unit objects ({value, unit}) are NOT nested objects
        // They are primitives that should be rendered with number+unit input
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            const keys = Object.keys(value);
            
            // Check if this is a number+unit structure (ONLY has value/unit keys)
            const isNumberUnit = keys.length <= 2 && 
                                keys.every(k => k === 'value' || k === 'unit');
            
            if (isNumberUnit) {
                return false; // NOT a nested object
            }
        }
        
        // Check for other non-nested types
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
        // This indicates that this path is a container for nested fields
        const allPaths = this.templateManager.getDefinedFieldPaths();
        const nestedPrefix = `${fieldPath}.`;
        const hasNestedFields = allPaths.some(path => path.startsWith(nestedPrefix));
        
        // Additional check: if we don't find nested paths, but this path looks like it's within
        // an objectTemplate, try to check the structure directly from the template
        if (!hasNestedFields && fieldPath.includes('.objectTemplate.')) {
            // For paths like "device.info.objectTemplate.dimensions", we need to:
            // 1. Extract the base field path (everything before ".objectTemplate.")
            // 2. Get the template for that base field
            // 3. Check if the field after ".objectTemplate." exists in the objectTemplate
            
            const objectTemplateIndex = fieldPath.indexOf('.objectTemplate.');
            if (objectTemplateIndex !== -1) {
                const baseFieldPath = fieldPath.substring(0, objectTemplateIndex);
                const objectTemplateFieldPath = fieldPath.substring(objectTemplateIndex + '.objectTemplate.'.length);
                
                // Get the template for the base field (e.g., "device.info")
                const baseTemplate = this.templateManager.getFieldTemplate(baseFieldPath);
                
                if (baseTemplate && baseTemplate.objectTemplate) {
                    // Navigate through the objectTemplate structure to find the nested field
                    const objectTemplateData = baseTemplate.objectTemplate as Record<string, unknown>;
                    const pathParts = objectTemplateFieldPath.split('.');
                    
                    let current = objectTemplateData;
                    
                    // Navigate to the parent of the target field
                    for (let i = 0; i < pathParts.length - 1; i++) {
                        if (current && typeof current === 'object' && pathParts[i] in current) {
                            current = current[pathParts[i]] as Record<string, unknown>;
                        } else {
                            return false; // Path doesn't exist
                        }
                    }
                    
                    // Check if the final field exists and is an object without inputType
                    const finalFieldKey = pathParts[pathParts.length - 1];
                    if (current && finalFieldKey in current) {
                        const nestedField = current[finalFieldKey];
                        
                        // Check if this nested field is an object without inputType (indicating a container)
                        if (nestedField && 
                            typeof nestedField === 'object' && 
                            !((nestedField as Record<string, unknown>).inputType)) {
                            return true;
                        }
                    }
                }
            }
        }
        
        return hasNestedFields;
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
        
        // Handle empty objectTemplatePath for root objects
        if (!this.objectTemplatePath) {
            // For root objects, return all top-level template fields (no dots in path)
            return allPaths.filter(path => !path.includes('.'));
        }
        
        // Use the pre-calculated objectTemplatePath as the prefix
        const prefix = `${this.objectTemplatePath}.`;
        
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

    private mapInputTypeToPrimitive(inputType: string, hasUnits: boolean = false): PrimitiveType {
        const mapping: Record<string, PrimitiveType> = {
            "text": "text",
            "number": hasUnits ? "number with unit" : "number",
            "boolean": "boolean", 
            "date": "date",
            "list": "list (string)",
            "list (string)": "list (string)",
            "list (number)": "list (number)",
            "list (boolean)": "list (boolean)",
            "list (date)": "list (date)",
            "list (mixed)": "list (string)", // Fallback to string for mixed
            "list (object)": "list (string)", // Fallback to string for objects
            "numberList": "list (number)",
            "dropdown": "text",
            "multiselect": "list (string)",
            "queryDropdown": "text",
            "multiQueryDropdown": "list (string)",
            "subclass": "text"
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
        this.logger.debug('🔧 setValue() called:', {
            objectPath: this.objectPath,
            valueKeys: Object.keys(value),
            existingKeys: Object.keys(this.object)
        });
        
        // Instead of completely replacing the object, merge the values intelligently
        // This prevents field overwriting when only specific nested fields are being updated
        if (this.objectPath && typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // For nested objects, merge the new values with existing values
            // This preserves sibling fields that aren't being updated
            const hasExistingData = Object.keys(this.object).length > 0;
            const valueKeys = Object.keys(value);
            
            // ENHANCED: Check if InputManager has more complete state for this object
            let referenceObject = this.object;
            if (this.inputManager && this.objectPath) {
                const inputManagerValue = this.inputManager.getValue(this.objectPath);
                if (typeof inputManagerValue === 'object' && inputManagerValue !== null && !Array.isArray(inputManagerValue)) {
                    const inputManagerKeys = Object.keys(inputManagerValue as Record<string, unknown>);
                    if (inputManagerKeys.length > Object.keys(this.object).length) {
                        this.logger.debug('🔄 Using InputManager state as reference (more complete data)');
                        referenceObject = inputManagerValue as Record<string, FormFieldValue>;
                    }
                }
            }
            
            const referenceKeys = Object.keys(referenceObject);
            
            if (hasExistingData && referenceKeys.length > valueKeys.length) {
                // This looks like a partial update - merge instead of replace
                this.logger.debug('🔄 Partial update detected - merging values');
                
                // Merge new values with reference object (either this.object or InputManager state)
                this.object = { ...referenceObject, ...value };
            } else {
                // Complete replacement - use the new value as-is
                this.object = { ...value };
            }
        } else {
            // For root objects or non-object values, use direct replacement
            this.object = { ...value };
        }
        
        this.render();
        this.synchronizeAndNotifyChange();
    }

    updateTemplate(templateManager: TemplateManager): void {
        this.templateManager = templateManager;
        this.render();
    }

    /**
     * Handle subclass template application and re-render
     */
    handleSubclassTemplateUpdate(): void {
        // Prevent recursive template updates
        if (this.isUpdatingTemplate) {
            this.logger.debug('Skipping template update - already in progress');
            return;
        }
        
        this.logger.debug('Handling subclass template update - updating InputManager and re-rendering');
        this.isUpdatingTemplate = true;
        
        // CRITICAL: Disable user interaction on all existing subclass dropdowns during update
        this.disableAllSubclassUserInteraction();
        
        // Debug: Check InputManager data before subclass template update
        if (this.inputManager) {
            const beforeData = this.inputManager.getData();
            this.debugFlatFields('Before handleSubclassTemplateUpdate', beforeData);
        }
        
        // Update InputManager with the new form data from TemplateManager
        if (this.inputManager && this.templateManager) {
            try {
                // Use the specialized method for subclass changes to get clean data
                this.templateManager.getFormDataForSubclassChange().then(updatedData => {
                    this.logger.debug('Updating InputManager with clean subclass template data:', updatedData);
                    
                    // 🔍 DEBUG: Check for template configs in the data from TemplateManager
                    for (const [key, value] of Object.entries(updatedData)) {
                        if (value && typeof value === 'object' && !Array.isArray(value) && 'inputType' in value) {
                            this.logger.error(`🚨 [SUBCLASS UPDATE] TEMPLATE CONFIG from TemplateManager:`, {
                                key,
                                value,
                                message: 'TemplateManager.getFormDataForSubclassChange returned template config!'
                            });
                        }
                        // Check nested objects too
                        if (value && typeof value === 'object' && !Array.isArray(value)) {
                            for (const [nestedKey, nestedValue] of Object.entries(value as Record<string, unknown>)) {
                                if (nestedValue && typeof nestedValue === 'object' && !Array.isArray(nestedValue) && 'inputType' in nestedValue) {
                                    this.logger.error(`🚨 [SUBCLASS UPDATE] TEMPLATE CONFIG in nested object:`, {
                                        parentKey: key,
                                        nestedKey,
                                        nestedValue,
                                        message: 'Template config found in nested object!'
                                    });
                                }
                            }
                        }
                    }
                    
                    // Debug: Check template manager data for flat fields
                    this.debugFlatFields('TemplateManager getFormDataForSubclassChange result', updatedData);
                    
                    // CRITICAL: Disable change callbacks during data update to prevent loops
                    const originalChangeCallback = this.onChangeCallback;
                    this.onChangeCallback = () => {}; // No-op function to prevent loops
                    
                    // Set InputManager to initialization mode to prevent reactive updates during data replacement
                    this.inputManager!.setInitializing(true);
                    
                    // Clear and re-register reactive fields for the new template
                    this.inputManager!.clearReactiveFields();
                    this.registerReactiveFieldsWithInputManager();
                    
                    // Update InputManager with clean data
                    this.inputManager!.updateData(updatedData);
                    
                    // Debug: Check InputManager data after updateData
                    const afterUpdateData = this.inputManager!.getData();
                    this.debugFlatFields('After InputManager.updateData in handleSubclassTemplateUpdate', afterUpdateData);
                    
                    // Re-enable reactive system
                    this.inputManager!.setInitializing(false);
                    
                    // Evaluate all reactive fields with the new template and data
                    this.inputManager!.evaluateAllReactiveFields();
                    
                    // Debug: Check InputManager data after reactive evaluation
                    const afterReactiveData = this.inputManager!.getData();
                    this.debugFlatFields('After reactive evaluation in handleSubclassTemplateUpdate', afterReactiveData);
                    
                    // CRITICAL: Update this.object with clean data from InputManager before re-rendering
                    // This ensures that UI components created during render() use clean data
                    if (this.objectPath) {
                        const cleanObject = this.inputManager!.getValue(this.objectPath);
                        if (typeof cleanObject === 'object' && cleanObject !== null && !Array.isArray(cleanObject) && !(cleanObject instanceof Date)) {
                            this.object = cleanObject as Record<string, FormFieldValue>;
                        } else {
                            this.object = {};
                        }
                        this.logger.debug('Updated object from InputManager:', { path: this.objectPath, object: this.object });
                    } else {
                        // For root level objects, extract the relevant portion
                        const allData = this.inputManager!.getData();
                        this.object = { ...allData };
                        this.logger.debug('Updated root object from InputManager:', { object: this.object });
                    }
                    
                    // Re-render with the updated data (this will recreate UI components)
                    this.render();
                    
                    // Debug: Check InputManager data after render
                    const afterRenderData = this.inputManager!.getData();
                    this.debugFlatFields('After render in handleSubclassTemplateUpdate', afterRenderData);
                    
                    // CRITICAL: Re-enable change callbacks after rendering is complete
                    this.onChangeCallback = originalChangeCallback;
                    
                    // Reset the flag after a delay to allow new components to initialize
                    setTimeout(() => {
                        this.isUpdatingTemplate = false;
                        this.logger.debug('Template update cycle complete');
                    }, 100);
                    
                }).catch(error => {
                    this.logger.error('Failed to get updated form data for subclass change:', error);
                    // Re-enable InputManager in case of error
                    this.inputManager!.setInitializing(false);
                    // Fall back to re-rendering with current data
                    this.render();
                    this.isUpdatingTemplate = false;
                });
            } catch (error) {
                this.logger.error('Error updating InputManager data after template change:', error);
                // Re-enable InputManager in case of error
                this.inputManager!.setInitializing(false);
                // Fall back to re-rendering with current data
                this.render();
                this.isUpdatingTemplate = false;
            }
        } else {
            // No InputManager available, just re-render
            this.render();
            this.isUpdatingTemplate = false;
        }
    }

    /**
     * Disable user interaction detection on all subclass dropdowns to prevent loops during updates
     */
    private disableAllSubclassUserInteraction(): void {
        this.fieldComponents.forEach((component, key) => {
            if (component instanceof LabeledSubclassDropdown) {
                // Temporarily disable user interaction detection
                const ref = (component as unknown as { isUserInteractionRef: { value: boolean } }).isUserInteractionRef;
                if (ref) {
                    ref.value = false;
                    this.logger.debug(`Disabled user interaction for subclass dropdown: ${key}`);
                }
            }
        });
    }

    /**
     * Register reactive fields with the InputManager
     */
    private registerReactiveFieldsWithInputManager(): void {
        if (!this.inputManager || !this.templateManager) {
            this.logger.debug('Cannot register reactive fields - missing InputManager or TemplateManager');
            return;
        }
        
        this.logger.debug('🔗 Registering reactive fields with InputManager');
        
        const template = this.templateManager.getCurrentTemplate();
        this.scanTemplateForReactiveFields(template);
        
        this.logger.debug('✅ Reactive fields registered');
    }

    /**
     * Scan template recursively for reactive fields and register them
     */
    private scanTemplateForReactiveFields(template: Record<string, unknown>, parentPath: string = ''): void {
        if (!template || typeof template !== 'object') {
            return;
        }

        for (const [key, value] of Object.entries(template)) {
            const currentPath = parentPath ? `${parentPath}.${key}` : key;
            
            if (value && typeof value === 'object') {
                // Check if this is a function descriptor with userInputs (reactive field)
                if ('type' in value && value.type === 'function' && 
                    'descriptor' in value && 'userInputs' in value && Array.isArray(value.userInputs)) {
                    
                    const dependencies = value.userInputs as string[];
                    this.logger.debug(`📋 Found reactive field: "${currentPath}" depends on:`, dependencies);
                    
                    // Create evaluation function from the descriptor
                    const functionDescriptor: FunctionDescriptor = {
                        type: "function",
                        value: value.descriptor as string,
                        userInputs: value.userInputs as string[]
                    };
                    const evaluateFunction = (userInputs: Record<string, unknown>, plugin: unknown) => {
                        // Create context with both userInputs and plugin
                        const context = { ...userInputs, plugin };
                        return TemplateEvaluator.evaluateFunctionDescriptor(functionDescriptor, context);
                    };
                    
                    // Register this reactive field with the InputManager
                    this.inputManager!.registerReactiveField(currentPath, dependencies, evaluateFunction);
                } else {
                    // Recursively scan nested objects
                    this.scanTemplateForReactiveFields(value as Record<string, unknown>, currentPath);
                }
            }
        }
    }

    private debugFlatFields(context: string, data: Record<string, unknown>): void {
        if (!data || typeof data !== 'object') return;
        
        const flatFields = Object.keys(data).filter(key => key.includes('.'));
        if (flatFields.length > 0) {
            this.logger.error(`🚨 FLAT FIELDS DETECTED [${context}]:`, flatFields);
            this.logger.error(`🔍 Full data [${context}]:`, data);
            
            // Log stack trace to see where this was called from
            this.logger.error(`📍 Stack trace [${context}]:`, new Error().stack);
        } else {
            this.logger.debug(`✅ No flat fields found [${context}]`);
        }
    }

    setRenderingMode(mode: ObjectRenderingMode): void {
        this.renderingMode = mode;
        this.render();
    }

    private renderObjectList(key: string, value: unknown, templateField: Record<string, unknown>, templatePath: string): HTMLElement {
        const container = document.createElement("div");
        container.className = "object-list-wrapper";
        container.setAttribute("data-object-key", key);
        container.setAttribute("data-template-path", templatePath);
        container.setAttribute("data-is-list-object", "true");

        // Create header with label and add button (using object-list specific classes)
        const header = document.createElement("div");
        header.className = "object-list-header";
        
        const label = document.createElement("div");
        label.className = "object-list-label";
        label.textContent = templateField.label as string || key;
        header.appendChild(label);
        
        const addButton = document.createElement("div");
        addButton.className = "object-list-add-button";
        addButton.textContent = "+";
        addButton.setAttribute("title", `Add new ${templateField.itemLabel || "item"}`);
        addButton.addEventListener("click", () => this.addObjectListItem(templateField.objectTemplate as Record<string, unknown>, listContainer, templatePath));
        header.appendChild(addButton);
        
        container.appendChild(header);

        // Create list container
        const listContainer = document.createElement("div");
        listContainer.className = "object-list-container";

        // Ensure we have an array to work with, respecting initialItems
        let arrayValue = Array.isArray(value) ? value : [];
        
        // Handle initialItems if the array is empty and initialItems is specified
        if (arrayValue.length === 0 && typeof templateField.initialItems === 'number' && templateField.initialItems > 0) {
            this.logger.debug(`📋 Creating ${templateField.initialItems} initial items for ${key}`);
            const objectTemplate = templateField.objectTemplate as Record<string, unknown>;
            arrayValue = Array.from({ length: templateField.initialItems }, () => 
                this.createDefaultObjectFromTemplate(objectTemplate)
            );
            
            // Update the input manager with the initial items
            if (this.inputManager) {
                this.inputManager.setValue(templatePath, arrayValue as FormFieldValue);
            }
        }

        // Create list item containers
        arrayValue.forEach((itemValue, index) => {
            const itemContainer = this.createObjectListItem(itemValue, templateField.objectTemplate as Record<string, unknown>, `${templatePath}.${index}`, index);
            listContainer.appendChild(itemContainer);
        });

        container.appendChild(listContainer);

        return container;
    }

    private createObjectListItem(itemValue: unknown, objectTemplate: Record<string, unknown>, itemPath: string, index: number): HTMLElement {
        this.logger.debug('🏗️ createObjectListItem:', {
            itemValue,
            objectTemplate,
            itemPath,
            index,
            objectTemplatePath: itemPath.replace(/\.\d+$/, '.objectTemplate')
        });
        
        // Create a container for the entire object item (this will be styled as an object list item)
        const itemContainer = document.createElement("div");
        itemContainer.className = "object-list-item";
        itemContainer.setAttribute("data-item-index", index.toString());

        // Create a new UniversalObjectRenderer instance for this object item
        // The renderer will create its own wrapper and header structure
        const listTemplatePath = itemPath.replace(/\.\d+$/, '.objectTemplate');
        const objectRenderer = new UniversalObjectRenderer({
            container: itemContainer,
            label: `Item ${index + 1}`,
            objectPath: itemPath, // This is where the data gets stored (e.g., "instrument.methods.0")
            defaultValue: (itemValue && typeof itemValue === 'object' && !Array.isArray(itemValue)) 
                ? itemValue as Record<string, FormFieldValue> 
                : {},
            templateManager: this.templateManager,
            inputManager: this.inputManager,
            renderingMode: this.renderingMode,
            allowNewFields: false,
            isListObject: true, // Mark as list object to use objectTemplate for template reading
            objectTemplatePath: listTemplatePath, // Tell it where to find the objectTemplate
            onChangeCallback: (updatedObject) => {
                // 🔍 DEBUG: Log what the nested renderer is passing back
                this.logger.debug(`🔍 [LIST ITEM CALLBACK] Object list item callback:`, {
                    itemPath,
                    updatedObject,
                    updatedObjectKeys: typeof updatedObject === 'object' && updatedObject ? Object.keys(updatedObject) : null,
                    expectedItemIndex: parseInt(itemPath.split('.').pop() || '0')
                });
                
                // Update the array item in the input manager
                if (this.inputManager) {
                    const pathParts = itemPath.split('.');
                    const arrayPath = pathParts.slice(0, -1).join('.');
                    const itemIndex = parseInt(pathParts[pathParts.length - 1]);
                    
                    const currentArray = this.inputManager.getValue(arrayPath) as FormFieldValue[];
                    if (Array.isArray(currentArray)) {
                        currentArray[itemIndex] = updatedObject;
                        this.inputManager.setValue(arrayPath, currentArray as FormFieldValue);
                        
                        this.logger.debug(`🔍 [LIST ITEM CALLBACK] Updated array:`, {
                            arrayPath,
                            itemIndex,
                            arrayLength: currentArray.length,
                            updatedItem: currentArray[itemIndex]
                        });
                    }
                }
            },
            app: this.app
        });

        this.addChild(objectRenderer);

        // After the renderer creates its structure, add the remove button to its header
        // Wait for the next tick to ensure the renderer has created its DOM structure
        setTimeout(() => {
            const objectHeader = itemContainer.querySelector('.editable-object-header');
            if (objectHeader) {
                const removeButton = document.createElement("div");
                removeButton.className = "object-list-remove-button";
                removeButton.innerHTML = "×";
                removeButton.setAttribute("title", "Remove item");
                removeButton.addEventListener("click", () => this.removeObjectListItem(itemContainer));
                objectHeader.appendChild(removeButton);
            }
        }, 0);

        return itemContainer;
    }

    private addObjectListItem(objectTemplate: Record<string, unknown>, listContainer: HTMLElement, templatePath: string): void {
        const items = listContainer.querySelectorAll(".object-list-item");
        const newIndex = items.length;
        const newItemPath = `${templatePath}.${newIndex}`;

        // Create default object based on template structure
        const defaultItem = this.createDefaultObjectFromTemplate(objectTemplate);
        
        this.logger.debug('➕ Adding new object list item:', {
            templatePath,
            newIndex,
            newItemPath,
            defaultItem
        });

        // Update the array in InputManager FIRST before creating the UI
        if (this.inputManager) {
            const currentArray = this.inputManager.getValue(templatePath) as FormFieldValue[];
            const updatedArray = Array.isArray(currentArray) ? [...currentArray] : [];
            updatedArray.push(defaultItem);
            this.inputManager.setValue(templatePath, updatedArray as FormFieldValue);
        }

        // Create the new item element (this will create nested renderers that read from InputManager)
        const newItemElement = this.createObjectListItem(defaultItem, objectTemplate, newItemPath, newIndex);
        listContainer.appendChild(newItemElement);
    }

    private removeObjectListItem(itemElement: HTMLElement): void {
        const listContainer = itemElement.parentElement as HTMLElement;
        const itemIndex = parseInt(itemElement.getAttribute("data-item-index") || "0");
        
        // Remove from DOM
        itemElement.remove();

        // Update indices and labels for remaining items
        const remainingItems = listContainer.querySelectorAll(".object-list-item");
        remainingItems.forEach((item, newIndex) => {
            item.setAttribute("data-item-index", newIndex.toString());
            // Update the label in the editable-object-label
            const label = item.querySelector(".editable-object-label");
            if (label) {
                label.textContent = `Item ${newIndex + 1}`;
            }
        });

        // Update the data value in the input manager
        const container = listContainer.closest("[data-template-path]") as HTMLElement;
        const templatePath = container?.getAttribute("data-template-path");
        if (templatePath && this.inputManager) {
            const currentArray = this.inputManager.getValue(templatePath) as FormFieldValue[];
            if (Array.isArray(currentArray)) {
                const updatedArray = [...currentArray];
                updatedArray.splice(itemIndex, 1);
                this.inputManager.setValue(templatePath, updatedArray as FormFieldValue);
            }
        }
    }

    private createDefaultObjectFromTemplate(objectTemplate: Record<string, unknown>): Record<string, FormFieldValue> {
        const defaultObject: Record<string, FormFieldValue> = {};

        for (const [fieldKey, fieldTemplate] of Object.entries(objectTemplate)) {
            const field = fieldTemplate as Record<string, unknown>;
            
            // Use defaultValue or default for primitive fields
            if (field.defaultValue !== undefined) {
                defaultObject[fieldKey] = field.defaultValue as FormFieldValue;
            } else if (field.default !== undefined) {
                // Check if default is a function descriptor that needs evaluation
                if (this.isFunctionDescriptor(field.default)) {
                    // Evaluate the function descriptor
                    try {
                        const plugin = this.templateManager?.getPlugin();
                        if (plugin) {
                            const evaluator = new FunctionEvaluator(plugin);
                            const evaluatedValue = evaluator.evaluateFunction(field.default, defaultObject);
                            defaultObject[fieldKey] = evaluatedValue as FormFieldValue;
                        } else {
                            this.logger.warn(`No plugin available to evaluate function default for ${fieldKey}`);
                            defaultObject[fieldKey] = "";
                        }
                    } catch (error) {
                        this.logger.warn(`Failed to evaluate function default for ${fieldKey}:`, error);
                        defaultObject[fieldKey] = "";
                    }
                } else {
                    // For number fields with units, create structured value
                    if (field.inputType === "number" && field.units) {
                        const unit = field.defaultUnit || (Array.isArray(field.units) ? field.units[0] : field.units);
                        defaultObject[fieldKey] = { 
                            value: field.default as number, 
                            unit: unit as string
                        } as FormFieldValue;
                    } else {
                        defaultObject[fieldKey] = field.default as FormFieldValue;
                    }
                }
            } else {
                // Set appropriate default based on input type
                switch (field.inputType) {
                    case "text":
                    case "textarea":
                        defaultObject[fieldKey] = "";
                        break;
                    case "number":
                        // For number fields with units, create structured default
                        if (field.units) {
                            const unit = field.defaultUnit || (Array.isArray(field.units) ? field.units[0] : field.units);
                            defaultObject[fieldKey] = { 
                                value: 0, 
                                unit: unit as string 
                            } as FormFieldValue;
                        } else {
                            defaultObject[fieldKey] = 0;
                        }
                        break;
                    case "boolean":
                    case "checkbox":
                        defaultObject[fieldKey] = false;
                        break;
                    case "list":
                        defaultObject[fieldKey] = [];
                        break;
                    case "editableObject":
                    case "object":
                        // For editableObject/object fields, create empty object
                        // The objectTemplate defines the structure but we start with empty data
                        defaultObject[fieldKey] = {};
                        break;
                    default:
                        defaultObject[fieldKey] = "";
                }
            }
        }

        return defaultObject;
    }

    /**
     * Type guard to check if a value is a function descriptor
     */
    private isFunctionDescriptor(value: unknown): value is AnyFunctionDescriptor {
        return typeof value === 'object' && 
               value !== null && 
               'type' in value && 
               (value as { type: unknown }).type === 'function';
    }

    /**
     * Convert a primitive field to an object field
     */
    private convertPrimitiveToObject(key: string, currentValue: PrimitiveValue): void {
        this.logger.debug('🔄 Converting primitive to object:', { key, currentValue });
        
        // Update the object data to be an empty object (or preserve if it's already an object)
        const newObjectValue = (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) 
            ? currentValue as Record<string, FormFieldValue>
            : {} as Record<string, FormFieldValue>;
        
        this.object[key] = newObjectValue;
        this.logger.debug('✅ Updated object data:', { key, newValue: this.object[key] });
        
        // Get the existing component and its DOM position
        const existingComponent = this.fieldComponents.get(key);
        let insertAfterElement: HTMLElement | null = null;
        
        if (existingComponent) {
            // Find the wrapper element of the existing component
            let existingWrapper: HTMLElement;
            
            if (existingComponent instanceof LabeledPrimitiveInput || 
                existingComponent instanceof LabeledDropdown || 
                existingComponent instanceof QueryDropdown ||
                existingComponent instanceof FilePicker) {
                existingWrapper = existingComponent.getWrapper();
            } else {
                // For UniversalObjectRenderer, get the container
                existingWrapper = existingComponent.container;
            }
            
            insertAfterElement = existingWrapper.previousElementSibling as HTMLElement;
            
            // Remove the old primitive component
            this.fieldComponents.delete(key);
            existingWrapper.remove();
            this.logger.debug('🗑️ Removed old component and preserved position:', { key });
        }
        
        // Create the new nested object renderer at the same position
        const fieldPath = this.objectPath ? `${this.objectPath}.${key}` : key;
        
        // Create a container for the new object at the right position
        let objectContainer: HTMLElement;
        if (insertAfterElement) {
            objectContainer = insertAfterElement.insertAdjacentElement('afterend', document.createElement('div')) as HTMLElement;
        } else {
            // If no previous element, insert at the beginning
            objectContainer = this.fieldsContainer.insertAdjacentElement('afterbegin', document.createElement('div')) as HTMLElement;
        }
        
        // Create the nested object renderer
        const nestedRenderer = new UniversalObjectRenderer({
            container: objectContainer,
            label: key,
            objectPath: fieldPath,
            defaultValue: newObjectValue,
            templateManager: this.templateManager,
            inputManager: this.inputManager,
            renderingMode: this.determineNestedObjectMode(fieldPath),
            onChangeCallback: (nestedObj) => {
                // Dynamically find the current key for this nested renderer
                let currentKey = key; // fallback to original key
                for (const [k, component] of this.fieldComponents.entries()) {
                    if (component === nestedRenderer) {
                        currentKey = k;
                        break;
                    }
                }
                this.handleNestedChange(currentKey, nestedObj);
            },
            app: this.app,
            allowNewFields: true, // Converted objects should allow new fields
            isEditableObject: false, // This is a nested object, not an editableObject field
            allowKeyEdit: true, // Allow editing the object key
            onKeyChange: (oldKey, newKey) => {
                // The nested object handles its own internal key change,
                // now we need to update the parent's data structure
                this.logger.debug('🔄 Nested object key changed:', { oldKey, newKey, parentObject: this.object });
                
                // Move the object data from oldKey to newKey in parent
                const objectValue = this.object[oldKey];
                if (objectValue !== undefined) {
                    this.object[newKey] = objectValue;
                    delete this.object[oldKey];
                    
                    // Update the field components map
                    this.fieldComponents.delete(oldKey);
                    this.fieldComponents.set(newKey, nestedRenderer);
                    
                    // CRITICAL: Update the nested renderer's objectPath to reflect the new key
                    const parentPath = this.objectPath ? `${this.objectPath}` : '';
                    const newObjectPath = parentPath ? `${parentPath}.${newKey}` : newKey;
                    nestedRenderer.updateObjectPath(newObjectPath);
                    
                    // Update InputManager mapping if needed
                    if (this.inputManager) {
                        const oldFieldPath = this.objectPath ? `${this.objectPath}.${oldKey}` : oldKey;
                        const newFieldPath = this.objectPath ? `${this.objectPath}.${newKey}` : newKey;
                        
                        this.inputManager.removeValue(oldFieldPath);
                        this.inputManager.setValue(newFieldPath, objectValue);
                        this.logger.debug('Updated InputManager for nested object key change:', { from: oldFieldPath, to: newFieldPath });
                    }
                    
                    // Notify parent of the change
                    this.onChangeCallback(this.object);
                    this.logger.debug('✅ Successfully renamed nested object key:', { oldKey, newKey, newObject: this.object });
                } else {
                    this.logger.warn('Failed to find object value for key:', { oldKey, availableKeys: Object.keys(this.object) });
                }
            },
            removeable: true, // Allow removing the entire object
            onRemove: () => {
                // Handle removal of the entire object
                this.logger.debug('🗑️ Removing converted object:', { key });
                delete this.object[key];
                this.fieldComponents.delete(key);
                objectContainer.remove();
                this.onChangeCallback(this.object);
            }
        });
        
        this.addChild(nestedRenderer);
        this.fieldComponents.set(key, nestedRenderer);
        
        this.logger.debug('📦 Created positioned nested object:', { 
            key, 
            allowNewFields: true,
            hasNestedValue: !!newObjectValue && Object.keys(newObjectValue).length > 0
        });
        
        // Notify parent of the change
        this.onChangeCallback(this.object);
        this.logger.debug('📢 Notified parent of object conversion change');
    }

    /**
     * Handle primitive type changes (non-object types)
     */
    private handlePrimitiveTypeChange(key: string, newType: string, currentValue: PrimitiveValue): void {
        this.logger.debug('Handling primitive type change:', { key, newType, currentValue });
        
        // Convert the current value to the appropriate default for the new type
        let newValue: FormFieldValue;
        
        switch (newType) {
            case 'text':
                newValue = typeof currentValue === 'string' ? currentValue : String(currentValue || '');
                break;
            case 'number':
                newValue = typeof currentValue === 'number' ? currentValue : 
                          (typeof currentValue === 'string' && !isNaN(Number(currentValue))) ? Number(currentValue) : 0;
                break;
            case 'boolean':
                newValue = typeof currentValue === 'boolean' ? currentValue : Boolean(currentValue);
                break;
            case 'date':
                newValue = currentValue instanceof Date ? currentValue : new Date();
                break;
            case 'list (string)':
                newValue = Array.isArray(currentValue) ? currentValue.map(String) : [];
                break;
            case 'list (number)':
                newValue = Array.isArray(currentValue) ? currentValue.map(Number).filter(n => !isNaN(n)) : [];
                break;
            case 'list (boolean)':
                newValue = Array.isArray(currentValue) ? currentValue.map(Boolean) : [];
                break;
            case 'list (date)':
                newValue = Array.isArray(currentValue) ? currentValue.map(v => v instanceof Date ? v : new Date()) : [];
                break;
            case 'number with unit':
                if (typeof currentValue === 'object' && currentValue && 'value' in currentValue && 'unit' in currentValue) {
                    newValue = currentValue as { value: number; unit: string };
                } else {
                    newValue = { value: typeof currentValue === 'number' ? currentValue : 0, unit: '' };
                }
                break;
            default:
                newValue = String(currentValue || '');
        }
        
        // Update the object data
        this.object[key] = newValue;
        
        // Get the existing component and update its type
        const existingComponent = this.fieldComponents.get(key);
        
        if (existingComponent && existingComponent instanceof LabeledPrimitiveInput) {
            // Get units from template for "number with unit" fields
            let units: string[] | undefined;
            if (newType === 'number with unit') {
                const templatePath = this.objectTemplatePath 
                    ? `${this.objectTemplatePath}.${key}`
                    : key;
                const templateField = this.templateManager?.getFieldTemplate(templatePath);
                units = Array.isArray(templateField?.units) ? templateField.units as string[] : undefined;
            }
            
            // Update the primitive input's type with units
            existingComponent.setType(newType as PrimitiveType, units);
        } else {
            // Re-render if we can't update in place
            this.render();
        }
        
        // Notify parent of the change
        this.onChangeCallback(this.object);
    }
}
