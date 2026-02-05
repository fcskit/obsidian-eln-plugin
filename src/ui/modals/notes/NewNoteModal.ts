import { Modal, ButtonComponent } from "obsidian";
import { LabeledTextInput } from "../components/LabeledTextInput";
import { LabeledNumericInput } from "../components/LabeledNumericInput";
import { LabeledDateInput } from "../components/LabeledDateInput";
import { LabeledDropdown } from "../components/LabeledDropdown";
import { MultiSelectInput } from "../components/MultiSelectInput";
import { MultiQueryDropdown } from "../components/MultiQueryDropdown";
import { ListInput } from "../components/ListInput";
import { EditableObjectInput } from "../components/EditableObjectInput";
import { QueryDropDown } from "../components/QueryDropDown";
import { SubClassSelection } from "../components/SubClassSelection";
import { createEnhancedObjectListFromTemplate } from "../components/EnhancedObjectListInput";
import { SimpleTextInput } from "../components/SimpleTextInput";
import { SimpleDropdown } from "../components/SimpleDropdown";
import ElnPlugin from "../../../main";
import { TemplateEvaluator } from "../../../core/templates/TemplateEvaluator";
import { MetadataProcessor } from "../../../core/notes/MetadataProcessor";
import type { 
    MetaDataTemplateProcessed, 
    MetaDataTemplateFieldProcessed,
    JSONObject, 
    FormData, 
    FormFieldValue, 
    InputComponents, 
    SettableComponent
} from "../../../types";
import { createLogger } from "../../../utils/Logger";

export interface NewNoteModalOptions {
    modalTitle?: string; // Optional title for the modal
    noteType: string; // Type of note (required for subclass template handling)
    metadataTemplate: MetaDataTemplateProcessed; // Preprocessed metadata template
    onSubmit: (result: { formData: FormData; template: MetaDataTemplateProcessed } | null) => void; // Callback when modal is submitted
}

export class NewNoteModal extends Modal {
    private plugin: ElnPlugin;
    private modalTitle: string;
    private noteType: string;
    private baseMetadataTemplate: MetaDataTemplateProcessed; // Original template from settings (never modified)
    private metadataTemplate: MetaDataTemplateProcessed; // Current working template (with subclass modifications)
    private onSubmit: (result: { formData: FormData; template: MetaDataTemplateProcessed } | null) => void;
    private templateEvaluator: TemplateEvaluator;
    private metadataProcessor: MetadataProcessor; // Handles all subclass logic
    private submitted: boolean;
    protected data: FormData;
    protected inputs: InputComponents;
    private inputContainer!: HTMLElement; // Store reference to input container for re-rendering
    private initialTemplateApplied = false; // Prevent multiple initial applications
    private logger = createLogger('modal');

    constructor(plugin: ElnPlugin, options: NewNoteModalOptions) {
        super(plugin.app);
        this.plugin = plugin;
        this.modalTitle = options.modalTitle || "New Note";
        this.noteType = options.noteType;
        // Store the original base template and create a working copy
        this.baseMetadataTemplate = JSON.parse(JSON.stringify(options.metadataTemplate));
        this.metadataTemplate = JSON.parse(JSON.stringify(options.metadataTemplate));
        this.onSubmit = options.onSubmit;
        this.templateEvaluator = new TemplateEvaluator(plugin);
        this.metadataProcessor = new MetadataProcessor(plugin); // Initialize metadata processor
        this.submitted = false;
        this.data = {};
        this.inputs = {};
    }

    async onOpen() {
        const { modalEl, contentEl, titleEl } = this;

        // Set the modal title
        titleEl.setText(this.modalTitle);

        // Add a custom class to the modal for styling
        modalEl.addClass("eln-modal");

        // Apply initial subclass template if the template has a subclass field
        // This modifies this.metadataTemplate to include the default subclass modifications
        await this.applyInitialSubclassTemplate();

        // Create a container for the input fields and store reference for re-rendering
        this.inputContainer = contentEl.createDiv({ cls: "eln-inputs" });
        
        // Render input fields based on the provided metadata template
        this.renderInputs(this.inputContainer, this.metadataTemplate);

        // Add a confirm button to the modal
        const confirmButton = new ButtonComponent(contentEl);
        confirmButton.setButtonText("Submit");
        confirmButton.setCta();
        confirmButton.onClick(async () => {
            this.submitted = true; // Mark the modal as submitted
            this.close(); // Close the modal
        });
    }

    onClose() {
        if (this.onSubmit) {
            // Call the onSubmit callback with the collected data and final template if submitted, otherwise with null
            this.onSubmit(this.submitted ? { 
                formData: this.data, 
                template: this.metadataTemplate 
            } : null);
        }
    }

    private renderInputs(container: HTMLElement, template: MetaDataTemplateProcessed, fullKey: string | null = null, isNested: boolean = false) {
        for (const [key, config] of Object.entries(template)) {
            const currentKey = fullKey ? `${fullKey}.${key}` : key;

            // Check if this is a direct input field (has inputType and query properties)
            if (config && typeof config === "object" && "inputType" in config && "query" in config) {
                // This is a direct input field - process it as an input field
                const field = config as MetaDataTemplateFieldProcessed;
                
                // Handle different types of default values
                let defaultValue: unknown;
                if (TemplateEvaluator.isFunctionDescriptor(field.default)) {
                    // If it's a function descriptor, evaluate it with current context
                    if (field.default.userInputs && field.default.userInputs.length > 0) {
                        // For reactive functions that depend on user input, defer evaluation to postprocessing
                        // Use an appropriate placeholder value based on input type
                        if (field.inputType === "list") {
                            defaultValue = []; // Empty array as placeholder for lists
                        } else {
                            defaultValue = ""; // Empty string as placeholder for other types
                        }
                    } else {
                        // For non-reactive function descriptors, they should already be evaluated
                        defaultValue = TemplateEvaluator.evaluateFunctionDescriptor(field.default, this);
                    }
                } else if (typeof field.default === "function") {
                    // Handle legacy functions
                    defaultValue = (field.default as (data: JSONObject) => unknown)(this.data as JSONObject);
                } else {
                    // Handle static values
                    defaultValue = field.default;
                }

                // Ensure nested structure in data and inputs
                let targetData: FormData = this.data;
                let targetInputs: InputComponents = this.inputs;
                if (fullKey) {
                    const keys = fullKey.split(".");
                    for (const k of keys) {
                        if (!targetData[k]) {
                            targetData[k] = {} as FormData;
                        }
                        if (!targetInputs[k]) {
                            targetInputs[k] = {} as InputComponents;
                        }
                        targetData = targetData[k] as FormData;
                        targetInputs = targetInputs[k] as InputComponents;
                    }
                }

                this.renderInputField(container, key, field, targetData, targetInputs, currentKey, defaultValue, isNested);
            } else if (config !== null && typeof config === "object" && !("inputType" in config) && !("query" in config)) {
                // This is a nested object section (like "process": { "name": {...}, "type": {...} })
                // Create a container section only for true nested structures
                const sectionWrapper = container.createDiv({ cls: "eln-input-wrapper" });
                
                // Create header with section label
                const header = sectionWrapper.createDiv({ cls: "eln-input-header" });
                header.createDiv({ cls: "eln-input-label", text: key.charAt(0).toUpperCase() + key.slice(1) });
                
                // Create content container for nested inputs
                const content = sectionWrapper.createDiv({ cls: "eln-input-content eln-nested-content" });
                
                this.renderInputs(content, config as MetaDataTemplateProcessed, currentKey, true);
            }
        }
    }

    private renderInputField(
        container: HTMLElement, 
        key: string, 
        field: MetaDataTemplateFieldProcessed, 
        targetData: FormData, 
        targetInputs: InputComponents, 
        currentKey: string, 
        defaultValue: unknown, 
        isNested: boolean
    ) {
        switch (field.inputType) {
                    case "text": {
                        // Extract placeholder
                        let placeholder: string | undefined;
                        if (field.placeholder) {
                            if (TemplateEvaluator.isFunctionDescriptor(field.placeholder)) {
                                placeholder = String(TemplateEvaluator.evaluateFunctionDescriptor(field.placeholder, this));
                            } else {
                                placeholder = String(field.placeholder);
                            }
                        }

                        if (isNested) {
                            // Use simple input for nested contexts
                            const textInput = new SimpleTextInput({
                                container,
                                label: key,
                                defaultValue: (defaultValue as string) || "",
                                placeholder: placeholder,
                                onChangeCallback: this.createReactiveCallback(targetData, key, currentKey, field.callback),
                            });
                            targetData[key] = (defaultValue as string) || "";
                            targetInputs[key] = textInput;
                        } else {
                            // Use enhanced input for top-level contexts
                            const textInput = new LabeledTextInput({
                                container,
                                label: key,
                                defaultValue: (defaultValue as string) || "",
                                placeholder: placeholder,
                                onChangeCallback: this.createReactiveCallback(targetData, key, currentKey, field.callback),
                            });
                            targetData[key] = (defaultValue as string) || "";
                            targetInputs[key] = textInput;
                        }
                        break;
                    }
                        
                    case "number": {
                        const numberInput = new LabeledNumericInput({
                            container,
                            label: key,
                            defaultValue: (defaultValue as number) || 0,
                            units: (field.units as string[]) || [],
                            defaultUnit: field.defaultUnit || (Array.isArray(field.units) ? field.units[0] : undefined),
                            onChangeCallback: (value) => {
                                const callback = field.callback;
                                // Handle the complex return type from LabeledNumericInput
                                let processedValue: FormFieldValue;
                                if (typeof value === 'object' && value !== null) {
                                    // If it's an object with value and unit, extract just the number for the callback
                                    processedValue = callback ? callback(value.value) as FormFieldValue : value.value;
                                } else {
                                    // If it's just a number
                                    processedValue = callback ? callback(value) as FormFieldValue : value;
                                }
                                targetData[key] = processedValue;
                            },
                        });
                        targetData[key] = (defaultValue as number) || 0; // Store initial value
                        targetInputs[key] = numberInput;
                        break;
                    }
                        
                    case 'actiontext': {
                        const defaultActionText = typeof field.default === 'function' ? (field.default as (data: JSONObject) => unknown)(this.data as JSONObject) : field.default;
                        const actionCallback = field.action;

                        const actionTextInput = new LabeledTextInput({
                            container,
                            label: key,
                            defaultValue: (defaultActionText as string) || "",
                            onChangeCallback: (value) => {
                                const callback = field.callback;
                                targetData[key] = callback ? callback(value) as FormFieldValue : value;
                            },
                            actionButton: true,
                            actionCallback: actionCallback || undefined, // Convert null to undefined
                            actionButtonIcon: (field.icon as string) || "gear",
                            actionButtonTooltip: (field.tooltip as string) || "Perform action",
                            fieldKey: currentKey,
                        });

                        targetData[key] = (defaultActionText as string) || ""; // Store initial value
                        targetInputs[key] = actionTextInput;
                        break;
                    }

                    case "dropdown": {
                        this.logger.debug("Creating dropdown for key:", key);
                        const fieldOptions = field.options;
                        const dropdownOptions = Array.isArray(fieldOptions) 
                            ? fieldOptions 
                            : [];

                        // Extract placeholder
                        let placeholder: string | undefined;
                        if (field.placeholder) {
                            if (TemplateEvaluator.isFunctionDescriptor(field.placeholder)) {
                                placeholder = String(TemplateEvaluator.evaluateFunctionDescriptor(field.placeholder, this));
                            } else {
                                placeholder = String(field.placeholder);
                            }
                        }

                        if (isNested) {
                            // Use simple dropdown for nested contexts
                            const dropdownInput = new SimpleDropdown({
                                container,
                                label: key,
                                options: dropdownOptions,
                                placeholder: placeholder,
                                onChangeCallback: this.createReactiveCallback(targetData, key, currentKey, field.callback),
                            });
                            const initialValue = defaultValue || (placeholder ? "" : (dropdownOptions.length > 0 ? dropdownOptions[0] : ""));
                            targetData[key] = initialValue as FormFieldValue;
                            targetInputs[key] = dropdownInput;
                        } else {
                            // Use enhanced dropdown for top-level contexts
                            const dropdownInput = new LabeledDropdown({
                                container,
                                label: key,
                                options: dropdownOptions,
                                placeholder: placeholder,
                                onChangeCallback: this.createReactiveCallback(targetData, key, currentKey, field.callback),
                            });
                            const initialValue = defaultValue || (placeholder ? "" : (dropdownOptions.length > 0 ? dropdownOptions[0] : ""));
                            targetData[key] = initialValue as FormFieldValue;
                            targetInputs[key] = dropdownInput;
                        }
                        break;
                    }

                    case "multiselect": {
                        const fieldOptions = field.options;
                        const dropdownOptions = Array.isArray(fieldOptions) 
                            ? fieldOptions 
                            : [];
                        const multiSelectInput = new MultiSelectInput({
                            container,
                            label: key,
                            options: dropdownOptions,
                            onChangeCallback: this.createReactiveCallback(targetData, key, currentKey, field.callback),
                        });
                        targetData[key] = (defaultValue || []) as FormFieldValue; // Store initial value
                        targetInputs[key] = multiSelectInput;
                        break;
                    }

                    case "date": {
                        const dateInput = new LabeledDateInput({
                            container,
                            label: key,
                            defaultValue: (defaultValue as string) || "",
                            onChangeCallback: (value) => {
                                const callback = field.callback;
                                targetData[key] = callback ? callback(value) as FormFieldValue : value;
                            },
                        });
                        targetData[key] = (defaultValue as string) || ""; // Store initial value
                        targetInputs[key] = dateInput;
                        break;
                    }
                        
                    case "dynamic":
                    case "editableObject": {
                        const editableObject = new EditableObjectInput({
                            container,
                            label: key,
                            defaultValue: (defaultValue as Record<string, FormFieldValue>) || {},
                            onChangeCallback: (updatedData) => {
                                targetData[key] = updatedData as unknown as FormFieldValue;
                            },
                            app: this.app
                        });
                        targetData[key] = ((defaultValue as Record<string, FormFieldValue>) || {}) as unknown as FormFieldValue;
                        targetInputs[key] = editableObject;
                        break;
                    }
                        
                    case "queryDropdown": {
                        // Extract placeholder
                        let placeholder: string | undefined;
                        if (field.placeholder) {
                            if (TemplateEvaluator.isFunctionDescriptor(field.placeholder)) {
                                placeholder = String(TemplateEvaluator.evaluateFunctionDescriptor(field.placeholder, this));
                            } else {
                                placeholder = String(field.placeholder);
                            }
                        }

                        const queryDropDown = new QueryDropDown(this.app, {
                            container,
                            label: key,
                            search: field.search || "",
                            where: field.where || undefined,
                            return: field.return || undefined,
                            defaultValue: typeof defaultValue === "string" ? defaultValue : undefined,
                            placeholder: placeholder,
                            isNested: isNested,
                            onChangeCallback: (value, returnValues) => {
                                const callback = field.callback;
                                
                                // Store the selected value
                                targetData[key] = callback ? callback(value) as FormFieldValue : value;
                                
                                // If return values are specified, map them to the target data
                                if (returnValues && field.return) {
                                    console.debug("QueryDropdown return values:", returnValues);
                                    console.debug("QueryDropdown return mapping:", field.return);
                                    
                                    if (Array.isArray(field.return)) {
                                        // Simple array format - direct mapping to current level
                                        for (const returnField of field.return) {
                                            const returnValue = returnValues[returnField];
                                            if (returnValue !== undefined && returnValue !== null) {
                                                targetData[returnField] = returnValue as FormFieldValue;
                                            }
                                        }
                                    } else {
                                        // Mapping object format - support dot notation for nested keys
                                        // returnValues are already mapped by QueryDropdown, so iterate over them
                                        for (const [targetPath, returnValue] of Object.entries(returnValues)) {
                                            if (returnValue !== undefined && returnValue !== null) {
                                                // Check if targetPath uses dot notation
                                                if (targetPath.includes('.')) {
                                                    // Use setNestedValue for dot notation paths from this.data root
                                                    this.setNestedValue(this.data, targetPath, returnValue as FormFieldValue);
                                                } else {
                                                    // Direct assignment to current level (targetData)
                                                    targetData[targetPath] = returnValue as FormFieldValue;
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                        });
                        // For queryDropdown, let the component handle its own initialization
                        // Don't set a default value that would override the return values
                        targetInputs[key] = queryDropDown;
                        break;
                    }

                    case "multiQueryDropdown": {
                        const multiQueryDropdown = new MultiQueryDropdown(this.app, {
                            container,
                            label: key,
                            search: field.search || "",
                            where: field.where || undefined,
                            return: field.return || undefined,
                            defaultValues: Array.isArray(defaultValue) ? defaultValue as string[] : undefined,
                            onChangeCallback: (selectedValues, returnValuesList) => {
                                // Store the selected values array
                                // For multiQueryDropdown, we store the array directly since callbacks expect single values
                                // but multi-selection naturally produces arrays
                                targetData[key] = selectedValues as FormFieldValue;
                                
                                // If return values are specified, apply them
                                if (returnValuesList && field.return && Array.isArray(field.return) === false) {
                                    console.debug("MultiQueryDropdown return values:", returnValuesList);
                                    console.debug("MultiQueryDropdown return mapping:", field.return);
                                    
                                    // For multiple selections, create an array of device objects
                                    // Each device object contains all the mapped return values for that device
                                    const deviceObjects = returnValuesList.map((returnValues, index) => {
                                        const deviceObject: Record<string, FormFieldValue> = {};
                                        
                                        // Apply return mapping to create device object structure
                                        for (const [targetPath] of Object.entries(field.return as Record<string, string>)) {
                                            const value = returnValues[targetPath];
                                            
                                            if (value !== undefined && value !== null) {
                                                // Extract the property name from the target path
                                                // e.g., "process.devices.name" -> "name", "process.devices.parameters" -> "parameters"
                                                const pathParts = targetPath.split('.');
                                                const propertyName = pathParts[pathParts.length - 1]; // Get last part
                                                deviceObject[propertyName] = value as FormFieldValue;
                                            }
                                        }
                                        
                                        return deviceObject;
                                    });
                                    
                                    // Store the array of device objects
                                    targetData[key] = deviceObjects as unknown as FormFieldValue;
                                }
                            },
                        });
                        // For multiQueryDropdown, let the component handle its own initialization
                        targetInputs[key] = multiQueryDropdown;
                        break;
                    }
                        
                    case "subclass": {
                        const fieldOptions = field.options;
                        const subclassOptions = Array.isArray(fieldOptions) 
                            ? fieldOptions 
                            : [];
                        const defaultValue = typeof field.default === "string" 
                            ? field.default 
                            : subclassOptions[0] || "";

                        const subClassSelection = new SubClassSelection({
                            app: this.app,
                            container,
                            label: key,
                            options: subclassOptions,
                            defaultValue: defaultValue,
                            onChangeCallback: async (selectedType: string) => {
                                targetData[key] = selectedType;
                                this.updateDependentFields(currentKey);
                                // Apply subclass template when selection changes
                                this.logger.debug(`Subclass selection changed to: ${selectedType}`);
                                await this.applySubclassTemplate(selectedType, currentKey);
                            }
                        });
                        targetData[key] = defaultValue;
                        targetInputs[key] = subClassSelection;
                        break;
                    }

                    case "list": {
                        // Check if this is an object list (type: "object")
                        if (field.type === "object" && field.object) {
                            // Handle object list with object field template
                            console.debug("Creating enhanced object list input for key:", key, "with field:", field);
                            const objectListInput = createEnhancedObjectListFromTemplate(field, {
                                container,
                                label: key,
                                defaultValue: (Array.isArray(defaultValue) ? defaultValue : []) as Record<string, FormFieldValue>[],
                                onChangeCallback: (objects) => {
                                    console.debug("Object list changed:", objects);
                                    targetData[key] = objects as unknown as FormFieldValue;
                                },
                                initialItems: field.initialItems, // Pass through initialItems from template
                                app: this.app
                            });
                            
                            if (objectListInput) {
                                targetData[key] = (Array.isArray(defaultValue) ? defaultValue : []) as FormFieldValue;
                                targetInputs[key] = objectListInput;
                            } else {
                                console.warn(`Failed to create object list input for key: ${key}`);
                                console.warn("Field object:", field.object);
                                console.warn("Field inputType:", field.inputType);
                            }
                        } else {
                            // Handle regular list
                            let defaultValueString = "";
                            if (Array.isArray(defaultValue)) {
                                defaultValueString = defaultValue.join(", ");
                            } else if (typeof defaultValue === "string") {
                                defaultValueString = defaultValue;
                            }

                            const listInput = new ListInput({
                                container,
                                label: key,
                                defaultValue: defaultValueString,
                                dataType: field.dataType as string || "text",
                                onChangeCallback: (value) => {
                                    let processedValue: FormFieldValue;
                                    if (field.dataType === "number") {
                                        processedValue = value.split(",").map(item => parseFloat(item.trim())).filter(item => !isNaN(item));
                                    } else if (field.dataType === "boolean") {
                                        processedValue = value.split(",").map(item => item.trim().toLowerCase() === "true");
                                    } else {
                                        processedValue = value.split(",").map(item => item.trim()).filter(item => item.length > 0);
                                    }
                                    // For list inputs, we handle the processed array directly since callbacks expect single values
                                    targetData[key] = processedValue;
                                },
                                fieldKey: currentKey,
                            });
                            // Store initial value - process the default value as the callback would
                            let initialListValue: FormFieldValue;
                            if (field.dataType === "number") {
                                initialListValue = Array.isArray(defaultValue) ? defaultValue : [];
                            } else if (field.dataType === "boolean") {
                                initialListValue = Array.isArray(defaultValue) ? defaultValue : [];
                            } else {
                                initialListValue = Array.isArray(defaultValue) ? defaultValue : defaultValueString.split(",").map(item => item.trim()).filter(item => item.length > 0);
                            }
                            targetData[key] = initialListValue;
                            targetInputs[key] = listInput;
                        }
                        break;
                    }

                    default:
                        console.warn(`Unsupported input type: ${field.inputType}`);
                }
        }
    }

    /**
     * Updates fields that depend on user input when their dependencies change.
     * @param changedFieldPath The path of the field that was changed (e.g., "chemical.type")
     */
    private updateDependentFields(changedFieldPath: string): void {
        this.updateFieldsInTemplate(this.metadataTemplate, changedFieldPath);
    }

    /**
     * Recursively finds and updates fields that depend on the changed field.
     * @param template The metadata template to search through
     * @param changedFieldPath The path of the field that was changed
     * @param currentPath The current path in the template traversal
     */
    private updateFieldsInTemplate(template: MetaDataTemplateProcessed, changedFieldPath: string, currentPath: string = ""): void {
        for (const [key, config] of Object.entries(template)) {
            const fieldPath = currentPath ? `${currentPath}.${key}` : key;
            
            if (config !== null && typeof config === "object" && !("inputType" in config)) {
                this.updateFieldsInTemplate(config as MetaDataTemplateProcessed, changedFieldPath, fieldPath);
            } else if (config && typeof config === "object" && "inputType" in config) {
                const field = config as MetaDataTemplateFieldProcessed;
                
                const hasUserInputDependency = this.templateEvaluator.checkFieldForUserInputDependencies(field, changedFieldPath);
                if (hasUserInputDependency) {
                    this.updateFieldValue(fieldPath, field);
                }
            }
        }
    }

    /**
     * Updates the value of a field that depends on user input.
     * @param fieldPath The path to the field that needs updating
     * @param field The field configuration
     */
    private updateFieldValue(fieldPath: string, field: MetaDataTemplateFieldProcessed): void {
        let newValue: unknown;
        if (typeof field.default === "function") {
            try {
                newValue = (field.default as (data: JSONObject) => unknown)(this.data as JSONObject);
            } catch (error) {
                console.error(`Error evaluating function for field "${fieldPath}":`, error);
                return;
            }
        } else if (TemplateEvaluator.isFunctionDescriptor(field.default)) {
            try {
                newValue = this.templateEvaluator.evaluateUserInputFunction(field.default, this.data);
            } catch (error) {
                console.error(`Error evaluating function descriptor for field "${fieldPath}":`, error);
                return;
            }
        } else {
            newValue = field.default;
        }

        this.setNestedValue(this.data, fieldPath, newValue as FormFieldValue);
        this.updateInputField(fieldPath, newValue as FormFieldValue);
    }

    /**
     * Updates an input field component with a new value
     */
    protected updateInputField(fullKey: string, value: FormFieldValue): void {
        const keys = fullKey.split(".");
        let target: FormData = this.data;
        let inputField: InputComponents = this.inputs;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) {
                console.warn(`Data key "${keys[i]}" does not exist in this.data at level ${i}.`);
                return;
            }
            if (!inputField[keys[i]]) {
                console.warn(`Input field key "${keys[i]}" does not exist in this.inputs at level ${i}.`);
                return;
            }
            target = target[keys[i]] as FormData;
            inputField = inputField[keys[i]] as InputComponents;
        }

        const finalKey = keys[keys.length - 1];
        target[finalKey] = value;

        const component = inputField[finalKey];
        if (component && typeof component === 'object' && 'setValue' in component && typeof component.setValue === 'function') {
            // Convert complex values to appropriate types for setValue
            let setValue: string | number | boolean | null = null;
            if (value instanceof Date) {
                setValue = value.toISOString();
            } else if (Array.isArray(value)) {
                setValue = value.join(', ');
            } else if (typeof value === 'object' && value !== null) {
                setValue = JSON.stringify(value);
            } else {
                setValue = value as string | number | boolean | null;
            }
            (component as unknown as SettableComponent).setValue(setValue);
        } else if (component instanceof HTMLInputElement) {
            component.value = String(value || '');
        } else {
            console.warn(`Unsupported input field type for "${fullKey}".`);
        }
    }

    /**
     * Sets a nested value in an object using dot notation.
     */
    private setNestedValue(obj: FormData, path: string, value: FormFieldValue): void {
        const keys = path.split(".");
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]] || typeof current[keys[i]] !== "object") {
                current[keys[i]] = {} as FormData;
            }
            current = current[keys[i]] as FormData;
        }
        
        current[keys[keys.length - 1]] = value;
    }

    /**
     * Creates a callback function that updates the field value and triggers reactive updates.
     */
    private createReactiveCallback(
        targetData: FormData,
        key: string,
        currentKey: string,
        callback?: ((value: string | number | boolean | null) => string | number | boolean | null) | null
    ): (value: unknown) => void {
        return (value: unknown) => {
            const processedValue = callback ? callback(value as string | number | boolean | null) as FormFieldValue : value as FormFieldValue;
            targetData[key] = processedValue;
            this.updateDependentFields(currentKey);
        };
    }

    /**
     * Applies a subclass template when the user changes the subclass selection
     * @param selectedType The selected subclass type
     * @param fieldPath The path of the subclass field that changed
     */
    private async applySubclassTemplate(selectedType: string, fieldPath: string): Promise<void> {
        try {
            this.logger.debug(`NewNoteModal: Applying subclass template for type: ${selectedType}`);
            
            // Store current user input before applying new template
            const currentUserData = JSON.parse(JSON.stringify(this.data));
            this.logger.debug("Stored current user data:", currentUserData);
            
            // Use MetadataProcessor to apply the subclass template
            this.metadataTemplate = this.metadataProcessor.applySubclassTemplateByName(
                this.baseMetadataTemplate,
                this.noteType,
                selectedType
            );
            
            // Restore user input values directly to the template defaults (legacy approach)
            this.restoreUserInputValues(this.metadataTemplate, currentUserData);
            
            // Clear data and input references completely before re-rendering
            this.data = {};
            this.inputs = {};
            
            // Re-render modal fields
            this.inputContainer.empty();
            this.renderInputs(this.inputContainer, this.metadataTemplate);
            
            this.logger.debug("Subclass template applied and modal re-rendered");
        } catch (error) {
            console.error(`Could not apply subclass template for ${selectedType}:`, error);
        }
    }

    /**
     * Apply the initial subclass template if the metadata template has a subclass field
     * This should only be called once during modal initialization
     */
    private async applyInitialSubclassTemplate(): Promise<void> {
        if (this.initialTemplateApplied) {
            this.logger.debug("Initial template already applied, skipping");
            return;
        }
        
        this.logger.debug("NewNoteModal: Checking for subclass field in initial template");
        const subclassField = this.metadataProcessor.findSubclassInputField(this.baseMetadataTemplate);
        this.logger.debug("subclassField found:", subclassField);
        
        if (subclassField) {
            this.logger.debug("NewNoteModal: Applying initial subclass template");
            
            // Get the default subclass name
            const defaultSubclass = this.metadataProcessor.getDefaultSubclassName(this.baseMetadataTemplate, this.noteType);
            this.logger.debug("Default subclass:", defaultSubclass);
            
            if (defaultSubclass) {
                // Apply the default subclass template to create the initial working template
                this.logger.debug("NewNoteModal: Applying default subclass template for:", defaultSubclass);
                this.metadataTemplate = this.metadataProcessor.applySubclassTemplateByName(
                    this.baseMetadataTemplate, 
                    this.noteType, 
                    defaultSubclass
                );
                this.logger.debug("Initial subclass template applied");
            } else {
                this.logger.debug("No default subclass found, using base template");
            }
        } else {
            this.logger.debug("No subclass field found in template");
        }
        
        // Mark that initial template has been applied
        this.initialTemplateApplied = true;
    }

    /**
     * Restores user input values that were already entered before subclass template change
     * @param template The template to restore values into
     * @param data The form data containing user input values
     */
    private restoreUserInputValues(template: MetaDataTemplateProcessed, data: FormData): void {
        if (!template || typeof template !== "object" || !data || typeof data !== "object") return;
        
        for (const key of Object.keys(template)) {
            const templateField = template[key];
            if (templateField && typeof templateField === "object" && "inputType" in templateField) {
                if (data[key] !== undefined) {
                    const field = templateField as MetaDataTemplateFieldProcessed;
                    field.default = data[key] as typeof field.default;
                }
            }
            // Recurse into nested objects (but not arrays or fields with inputType)
            if (
                templateField &&
                typeof templateField === "object" &&
                !Array.isArray(templateField) &&
                !("inputType" in templateField)
            ) {
                this.restoreUserInputValues(templateField as MetaDataTemplateProcessed, (data[key] as FormData) || {});
            }
        }
    }
}