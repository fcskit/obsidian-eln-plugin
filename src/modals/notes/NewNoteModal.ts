import { Modal, ButtonComponent, TFile, Notice } from "obsidian";
import { LabeledTextInput } from "../components/LabeledTextInput";
import { LabeledNumericInput } from "../../modals/components/LabeledNumericInput";
import { LabeledDateInput } from "../components/LabeledDateInput";
import { LabeledDropdown } from "../components/LabeledDropdown";
import { MultiSelectInput } from "../components/MultiSelectInput";
import { DynamicInputSection } from "../components/DynamicInputSection";
import { QueryDropDown } from "../components/QueryDropDown";
import { SubClassSelection } from "../components/SubClassSelection";
import { PathTemplate } from "../../utils/types";
import { parsePathTemplate } from "../../utils/template";
import { processMarkdownTemplate } from "src/templates/processMarkdownTemplate";
import ElnPlugin from "../../main";
import { ELNSettings } from "../../settings/settings";
import type { MetaDataTemplate } from "../../utils/types";
import type { SubclassMetadataTemplate } from "../../templates/metadataTemplates";

export interface NewNoteModalOptions {
    modalTitle?: string; // Optional title for the modal
    noteTitle?: string; // Title of the note to create
    noteTitleTemplate?: PathTemplate; // Template for the note title
    noteType?: string; // Type of note to create (e.g., "chemical", "device", etc.)
    folderPath?: string; // Folder where the note will be created
    resolve: (result: Record<string, any> | null) => void;
}

export class NewNoteModal extends Modal {
    private plugin: ElnPlugin;
    private modalTitle: string;
    private noteTitle: string | null;
    private noteTitleTemplate: PathTemplate | null;
    private noteType: string | null;
    private settings: ELNSettings;
    private folderPath: string;
    private resolve: (result: Record<string, any> | null) => void;
    private submitted: boolean;
    protected data: Record<string, any>;
    protected inputs: Record<string, any>;
    private originalMetadataTemplate: MetaDataTemplate;
    private metadataTemplate: MetaDataTemplate;
    private openNote: boolean;
    private openInNewLeaf: boolean;
    private noteTFile: TFile | null;

    constructor(plugin: ElnPlugin, options: NewNoteModalOptions) {
        super(plugin.app);
        this.plugin = plugin;
        this.settings = plugin.settings;
        this.modalTitle = options.modalTitle || "New Note";
        this.noteTitle = options.noteTitle || null;
        this.noteTitleTemplate = options.noteTitleTemplate || null;
        this.noteType = options.noteType || null;
        this.folderPath = options.folderPath || "";
        this.resolve = options.resolve;
        this.submitted = false;
        this.openNote = true;
        this.openInNewLeaf = false;
        this.data = {};
        this.inputs = {};
        this.metadataTemplate = {};
        this.noteTFile = null;
    }

    async onOpen() {
        const { modalEl, contentEl, titleEl } = this;

        // Set the modal title
        titleEl.setText(this.modalTitle);

        // Add a custom class to the modal for styling
        modalEl.addClass("eln-modal");

        // Load the metadata template from settings if not using a custom template
        if (this.noteType && this.noteType in this.settings.note) {
            const noteSettings = this.settings.note[this.noteType as keyof typeof this.settings.note];
            this.originalMetadataTemplate = noteSettings.metadataTemplate;
            this.metadataTemplate = JSON.parse(JSON.stringify(noteSettings.metadataTemplate));
        } else {
            // fallback to default
            this.originalMetadataTemplate = this.settings.note.default.metadataTemplate;
            this.metadataTemplate = JSON.parse(JSON.stringify(this.settings.note.default.metadataTemplate));
        }
        if (!this.metadataTemplate) {
            console.error("Failed to load metadata template.");
            return;
        }

        this.processDynamicFields(this.metadataTemplate);

        // --------- Preprocess the metadata template
        if (this.plugin.settings.includeVersion) {
            this.metadataTemplate["ELN version"].default = this.plugin.manifest.version;
        }
        if (this.plugin.settings.includeAuthor) {
            const authorList = this.plugin.settings.authors.map((author) => (author.name));
            if (authorList.length > 1) {
                this.metadataTemplate.author.query = true;
                this.metadataTemplate.author.inputType = "dropdown";
                this.metadataTemplate.author.default = authorList[0];
                this.metadataTemplate.author.options = authorList;
            } else {
                this.metadataTemplate.author.default = authorList[0];
            }
        }
        // Check if the metadata template has a key with inputType "subclass"
        const subclassInput = this.findSubclassInputField(this.metadataTemplate);
        console.debug("subclassInput:", subclassInput);
        if (subclassInput) {
            // If it does, we need to apply the subclass template
            console.debug("Applying subclass template to metadata template.");
            // Check if the noteType is defined and exists in the settings
            if (this.noteType && this.noteType in this.settings.note) {
                // Get the default value for the subclass input if defined in the metadata template
                const defaultSubclass = subclassInput.default || subclassInput.options?.[0] || null;
                // Get the subclass metadata template
                const typeArray = this.settings.note[this.noteType as keyof typeof this.settings.note].type;
                const typeObj = Array.isArray(typeArray)
                    ? typeArray.find((type) => type.name === defaultSubclass)
                    : undefined;
                console.debug("Selected subclass type object:", typeObj);
                const subclassTemplate = typeObj?.subClassMetadataTemplate;
                if (subclassTemplate) {
                    // Apply the subclass template to the metadata template
                    this.metadataTemplate = this.applySubclassTemplate(subclassTemplate);
                } else {
                    console.warn(`No subclass metadata template found for note type "${this.noteType}".`);
                }
            } else {
                console.warn(`Note type "${this.noteType}" is not defined in settings.`);
            }
        }

        // Create a container for the input fields so that it can be updated
        // without erasing the entire modal content (e.g. the submit button)
        const inputContainer = contentEl.createDiv({ cls: "eln-inputs" });
        // Render input fields based on the metadata template
        this.renderInputs(inputContainer, this.metadataTemplate);

        // Add a confirm button to the modal
        const confirmButton = new ButtonComponent(contentEl);
        confirmButton.setButtonText("Submit");
        confirmButton.setCta();
        confirmButton.onClick(async () => {
            this.submitted = true; // Mark the modal as submitted
            const success = await this.handleSubmit(); // Handle submission logic
            if (success) {
                new Notice("Note created successfully!");
                this.close(); // Close the modal
            } else {
                new Notice("Failed to create note.");
            }
        });
    }

    onClose() {
        if (this.resolve) {
            // Resolve with the collected data if submitted, otherwise resolve with null
            this.resolve(this.submitted ? this.data : null);
        }
    }

    private async handleSubmit(): Promise<boolean> {

        // Load the markdown template from settings if not using a custom template
        let markdownContent: string;
        if (this.noteType && this.noteType in this.settings.note) {
            const noteSettings = this.settings.note[this.noteType as keyof typeof this.settings.note];
            markdownContent = noteSettings.markdownTemplate;
        } else {
            markdownContent = this.settings.note.default.markdownTemplate;
        }

        // Create the note

        // Set note title of the note
        if (!this.noteTitle) {
            if (!this.noteTitleTemplate && this.noteType) {
                // Check if this.noteType is a key of the settings.note object
                if (this.noteType in this.settings.note) {
                    // Get the note title template from settings
                    if (this.noteType in this.settings.note) {
                        this.noteTitleTemplate = this.settings.note[this.noteType as keyof typeof this.settings.note].titleTemplate;
                    }
                    console.debug("Note title template:", this.noteTitleTemplate);
                } else {
                    // If this.noteType is not a key in settings.note, use the default note title
                    this.noteTitleTemplate = this.settings.note.default.titleTemplate;
                    console.debug("Default note title template:", this.noteTitleTemplate);
                }
                if (this.noteTitleTemplate) {
                    this.noteTitle = await parsePathTemplate(this.app, 'file', this.noteTitleTemplate, this.data);
                } else {
                    console.warn("Note title template is null. Using default title.");
                    this.noteTitle = "Default Note Title";
                }
            } else if (this.noteTitleTemplate) {
                // Use the provided note title template
                this.noteTitle = await parsePathTemplate(this.app, 'file', this.noteTitleTemplate, this.data);
            } else {
                // Fallback to a default note title if no template is provided
                this.noteTitle = "New Note";
            }
        }
        if (!this.noteTitle) {
            new Notice("Note title could not be generated. Please check the template.");
            return false; // Note title generation failed
        }
        // Set output folder for note
        if (!this.folderPath) {
            if (this.noteType && this.noteType in this.settings.note) {
                const noteSettings = this.settings.note[this.noteType as keyof typeof this.settings.note];
                if (noteSettings.folderTemplate) {
                    this.folderPath = await parsePathTemplate(this.app, 'folder', noteSettings.folderTemplate, this.data);
                }
            } else {
                // If this.noteType is not a key in settings.note, use the default folder path
                this.folderPath =  await parsePathTemplate(this.app, 'folder', this.settings.note.default.folderTemplate, this.data);
            }
            if (!this.folderPath) {
                // Fallback folder path if parsePathTemplate fails
                this.folderPath = "";
            }
        }

        console.debug(`Processing user input: `, this.data);
        // Process metadata using user input
        const processedMetadata = await this.processMetadata(this.metadataTemplate, this.data);
        console.debug("Processing markdown template with user input:", this.data);
        // Process markdown content with user input
        markdownContent = processMarkdownTemplate(markdownContent, this.noteTitle, this.data);

        // Ensure the folder path is valid
        // Check if note already exists
        const existingNote = this.app.vault.getAbstractFileByPath(`${this.folderPath}/${this.noteTitle}.md`);
        if (existingNote) {
            new Notice(`Note "${this.noteTitle}" already exists in "${this.folderPath}".`);
            return false; // Note already exists, do not create a new one
        } else {
            try {
                // Create the note with metadata and content
                console.debug("Creating note with folder path:", this.folderPath + "and note title:", this.noteTitle);
                await this.createNote(this.folderPath, this.noteTitle, processedMetadata, markdownContent);
                return true; // Note created successfully
            } catch (error) {
                console.error("Error creating note:", error);
                new Notice("Error creating note. Check the console for details.");
                return false; // Note creation failed
            }
        }
    }

    private findSubclassInputField(obj: Record<string, any>): any | undefined {
        for (const value of Object.values(obj)) {
            if (value && typeof value === "object") {
                if (value.inputType === "subclass") {
                    return value;
                }
                // Recursively search nested objects (but not arrays)
                const nested = this.findSubclassInputField(value);
                if (nested) return nested;
            }
        }
        return undefined;
    }

    private async processMetadata(
        template: Record<string, any>,
        userInput: Record<string, any>,
        parentKey = ""
    ): Promise<Record<string, any>> {
        const result: Record<string, any> = {};
        for (const [key, config] of Object.entries(template)) {
            const fullKey = parentKey ? `${parentKey}.${key}` : key;

            if (
                typeof config === "object" &&
                !config.inputType &&
                !config.query &&
                !config.default &&
                !config.callback
            ) {
                // Recursively process nested objects
                result[key] = await this.processMetadata(config, userInput[key] || {}, fullKey);
            } else {
                // Use the value directly from userInput or fallback to default
                const inputValue = userInput[key];
                const defaultValue =
                    typeof config.default === "function"
                        ? await config.default(userInput)
                        : config.default;

                if (config.inputType === "number" && config.units) {
                    // Handle numeric input with units
                    const unit = config.defaultUnit || (Array.isArray(config.units) ? config.units[0] : config.units);
                    if (inputValue && typeof inputValue === "object" && "value" in inputValue && "unit" in inputValue) {
                        // If the user provided a value with a unit, use it directly
                        result[key] = inputValue;
                    } else if (inputValue !== undefined) {
                        // If the user provided only a value, include the default unit
                        result[key] = { value: inputValue, unit };
                    } else if (defaultValue !== undefined) {
                        // If no user input, use the default value and unit
                        result[key] = { value: defaultValue, unit };
                    } else {
                        // If no default value, set to null
                        result[key] = { value: null, unit };
                    }
                } else {
                    // Handle other input types
                    result[key] = inputValue !== undefined ? inputValue : defaultValue;
                }
            }
        }
        return result;
    }

    /**
     * Processes dynamic fields (e.g., `callback`, `default`, `options`) in the metadata template.
     * @param template The metadata template to process.
     */
    private processDynamicFields(template: Record<string, any>): void {
        for (const key in template) {
            const field = template[key];
            if (typeof field === "object" && field !== null) {
                // Process `callback`, `action`, `default`, and `options` fields
                if (typeof field.callback === "string") {
                    console.log(`Processing callback for key "${key}":`, field.callback);
                    field.callback = this.evaluateDynamicField(field.callback);
                    if (typeof field.callback !== "function") {
                        console.warn(`Callback for key "${key}" is not a valid function.`, field.callback);
                    }
                }
                if (typeof field.action === "string") {
                    console.log(`Processing action for key "${key}":`, field.action);
                    field.action = this.evaluateDynamicField(field.action);
                    if (typeof field.action !== "function") {
                        console.warn(`Action for key "${key}" is not a valid function.`, field.action);
                    }
                }
                if (typeof field.default === "string") {
                    field.default = this.evaluateDynamicField(field.default);
                }
                if (typeof field.options === "string") {
                    field.options = this.evaluateDynamicField(field.options);
                }

                // Recursively process nested objects
                this.processDynamicFields(field);
            }
        }
    }

private evaluateDynamicField(field: string): any {
    console.log("Evaluating dynamic field:", field);
    try {
        if (field.startsWith("this.")) {
            // Handle expressions that reference `this`
            const expression = field.replace(/this\./g, "this."); // Ensure `this` is properly scoped
            return new Function("return " + expression).call(this);
        } else if (field.startsWith("new ")) {
            // Handle `new SomeObject()` or `new SomeObject().someFunction()`
            return new Function("return " + field)();
        } else if (this.isInlineFunction(field)) {
            // Handle inline functions (e.g., "(value) => value.trim()" or "value => value")
            console.log(`Converting inline function: ${field}`);
            return eval(field); // Directly evaluate the inline function
        } else if (field.startsWith("function")) {
            // Handle full function definitions (e.g., "function(value) { return value.trim(); }")
            return new Function("return " + field)();
        } else {
            // Handle static values (e.g., "some string" or "123")
            return field;
        }
    } catch (error) {
        console.error(`Failed to evaluate dynamic field: ${field}`, error);
        return undefined; // Return undefined if evaluation fails
    }
}

    /**
     * Checks if a string represents an inline function.
     * @param field The string to check.
     * @returns True if the string is an inline function, false otherwise.
     */
    private isInlineFunction(field: string): boolean {
        // Match common inline function patterns like "(value) => ..." or "value => ..."
        const inlineFunctionPattern = /^\(?\w+\)?\s*=>/;
        return inlineFunctionPattern.test(field);
    }

    /**
     * Safely retrieves the value of a nested property from an object.
     * @param obj The object to traverse.
     * @param path The dot-separated path to the nested property.
     * @returns The value of the nested property, or undefined if it does not exist.
     */
    private getNestedProperty(obj: Record<string, any>, path: string): any {
        const keys = path.split(".");
        let current = obj;

        for (const key of keys) {
            if (current && typeof current === "object" && key in current) {
                current = current[key];
            } else {
                console.error(`Property "${key}" does not exist in the path "${path}".`);
                return undefined; // Return undefined if the property does not exist
            }
        }

        return current; // Return the final value
    }
    
    
    private async loadMarkdownTemplate(templatePath: string): Promise<string> {
        try {
            const response = await this.app.vault.adapter.read(templatePath);
            return response;
        } catch (error) {
            console.error(`Failed to load markdown template from ${templatePath}:`, error);
            throw error;
        }
    }

    private async createNote(
        folderPath: string,
        noteTitle: string,
        metadata: Record<string, any>,
        content: string
    ) {
        console.log("Creating note with metadata:", metadata);
        // Ensure folder exists
        folderPath = folderPath.endsWith("/") ? folderPath.slice(0, -1) : folderPath; // Remove trailing slash if present
        const folder = this.app.vault.getFolderByPath(folderPath);
        if (!folder) {
            console.debug(`Folder "${folderPath}" does not exist. Creating it.`);
            await this.app.vault.createFolder(folderPath);
        }

        // Create note
        const notePath = `${folderPath}/${noteTitle}.md`;
        this.noteTFile = await this.app.vault.create(notePath, "");
        
        if (this.noteTFile) {
            // Write metadata and content
            await this.app.fileManager.processFrontMatter(this.noteTFile, (frontmatter) => {
                Object.assign(frontmatter, metadata);
            });
            await this.app.vault.append(this.noteTFile, content);
            if (this.openNote) {
                // Open the note in a new leaf if specified
                if (this.openInNewLeaf) {
                    this.app.workspace.openLinkText(notePath, notePath, false);
                } else {
                    this.app.workspace.getLeaf(false).openFile(this.noteTFile);
                }
            }
        }
    }

    private renderInputs(container: HTMLElement, template: Record<string, any>, fullKey: string | null = null) {
        for (const [key, config] of Object.entries(template)) {
            const currentKey = fullKey ? `${fullKey}.${key}` : key;

            if (typeof config === "object" && !config.inputType && !config.query) {
                // Render nested sections
                container.createEl("h3", { text: key.charAt(0).toUpperCase() + key.slice(1) });

                // Safely retrieve nested structures
                // const targetData = this.getNestedValue(this.data, fullKey) || {};
                // const targetInputs = this.getNestedValue(this.inputs, fullKey) || {};

                this.renderInputs(container, config, currentKey);
            } else if (config.inputType && config.query) {
                // Render input fields
                const defaultValue = typeof config.default === "function" ? config.default(this.data) : config.default;

                // Ensure nested structure in data and inputs
                let targetData = this.data;
                let targetInputs = this.inputs;
                if (fullKey) {
                    const keys = fullKey.split(".");
                    for (const k of keys) {
                        if (!targetData[k]) {
                            targetData[k] = {};
                        }
                        if (!targetInputs[k]) {
                            targetInputs[k] = {};
                        }
                        targetData = targetData[k];
                        targetInputs = targetInputs[k];
                    }
                }

                switch (config.inputType) {
                    case "text": {
                        const textInput = new LabeledTextInput({
                            container,
                            label: key,
                            defaultValue: defaultValue || "",
                            onChangeCallback: (value) => {
                                console.log(`Text input changed for key "${key}":`, value);
                                console.log('Callback called with callback function:', config.callback);
                                targetData[key] = config.callback ? config.callback(value) : value;
                                console.log(`Updated data for key "${key}":`, targetData[key]);
                            },
                        });
                        targetInputs[key] = textInput; // Store reference
                        break;
                    }
                        
                    case "number": {
                        const numberInput = new LabeledNumericInput({
                            container,
                            label: key,
                            defaultValue: defaultValue || 0,
                            units: config.units || [],
                            defaultUnit: config.defaultUnit || (config.units ? config.units[0] : undefined),
                            onChangeCallback: (value) => {
                                targetData[key] = config.callback ? config.callback(value) : value;
                            },
                        });
                        targetInputs[key] = numberInput; // Store reference
                        break;
                    }
                        
                    case 'actiontext': {
                        // Resolve the default value for the input
                        const defaultActionText = typeof config.default === 'function' ? config.default(this.data) : config.default;

                        // Resolve the action callback
                        let actionCallback;
                        if (typeof config.action === 'string' && config.action.startsWith("this.")) {
                            const functionName = config.action.slice(5) as keyof NewNoteModal; // Remove "this." and type as keyof NewNoteModal
                            const potentialFunction = this[functionName];
                            if (typeof potentialFunction === "function") {
                                actionCallback = potentialFunction.bind(this); // Bind the member function
                            } else {
                                console.error(`Function ${functionName} is not defined or is not callable on this instance.`);
                            }
                            if (!actionCallback) {
                                console.error(`Function ${functionName} is not defined on this instance.`);
                            }
                        } else if (typeof config.action === 'function') {
                            actionCallback = config.action; // Use the function directly
                        }

                        // Create the labeled text input with an action button
                        const actionTextInput = new LabeledTextInput({
                            container,
                            label: key,
                            defaultValue: defaultActionText || "",
                            onChangeCallback: (value) => {
                                targetData[key] = config.callback ? config.callback(value) : value;
                            },
                            actionButton: true, // Enable the action button
                            actionCallback: actionCallback, // Pass the resolved action callback
                            actionButtonIcon: config.icon || "gear", // Default icon if none is provided
                            actionButtonTooltip: config.tooltip || "Perform action", // Default tooltip if none is provided
                            fieldKey: currentKey, // Pass the full key path as the fieldKey
                        });

                        // Store the input reference for later updates
                        targetInputs[key] = actionTextInput;
                        break;
                    }

                    case "dropdown": {
                        console.log("Creating dropdown for key:", key);
                        const dropdownOptions =
                            typeof config.options === "function" ? config.options() : config.options;

                        const dropdownInput = new LabeledDropdown({
                            container,
                            label: key,
                            options: dropdownOptions,
                            onChangeCallback: (value) => {
                                if (typeof config.callback === "function") {
                                    targetData[key] = config.callback ? config.callback(value) : value;
                                } else {
                                    console.warn(`Callback for key "${key}" is not a function. Using raw value.`);
                                    targetData[key] = value; // Fallback to raw value
                                }
                            },
                        });
                        targetInputs[key] = dropdownInput; // Store reference
                        break;
                    }

                    case "multiselect": {
                        const dropdownOptions =
                            typeof config.options === "function" ? config.options() : config.options;
                        const multiSelectInput = new MultiSelectInput({
                            container,
                            label: key,
                            options: dropdownOptions,
                            onChangeCallback: (values) => {
                                if (typeof config.callback === "function") {
                                    targetData[key] = config.callback ? config.callback(values) : values;
                                } else {
                                    console.warn(`Callback for key "${key}" is not a function. Using raw value.`);
                                    targetData[key] = values; // Fallback to raw value
                                }
                            },
                        });
                        targetInputs[key] = multiSelectInput; // Store reference
                        break;
                    }

                    case "date": {
                        const dateInput = new LabeledDateInput({
                            container,
                            label: key,
                            defaultValue: defaultValue || "",
                            onChangeCallback: (value) => {
                                targetData[key] = config.callback ? config.callback(value) : value;
                            },
                        });
                        targetInputs[key] = dateInput; // Store reference
                        break;
                    }
                        
                    case "dynamic": {
                        const dynamicSection = new DynamicInputSection(this.app, {
                            container,
                            label: key,
                            data: config.data || {},
                            onChangeCallback: (updatedData) => {
                                targetData[key] = updatedData; // Update the data object
                            },
                        });
                        targetInputs[key] = dynamicSection; // Store reference
                        break;
                    }
                        
                    case "queryDropdown": {
                        const queryDropDown = new QueryDropDown(this.app, {
                            container,
                            label: key,
                            search: config.search || "",
                            where: config.where || undefined,
                            onChangeCallback: (value) => {
                                targetData[key] = config.callback ? config.callback(value) : value;
                            },
                        });
                        targetInputs[key] = queryDropDown; // Store reference
                        break;
                    }
                        
                    case "subclass": {
                        const subclassOptions = config.options || [];
                        const defaultValue = config.default || subclassOptions[0] || "";

                        const subClassSelection = new SubClassSelection({
                            app: this.app,
                            container,
                            label: key,
                            options: subclassOptions,
                            defaultValue: defaultValue,
                            onChangeCallback: async (selectedType: string) => {
                                targetData[key] = selectedType;
                                try {
                                    const typeArray = this.settings.note[this.noteType as keyof typeof this.settings.note].type;
                                    const typeObj = Array.isArray(typeArray)
                                        ? typeArray.find((type) => type.name === selectedType)
                                        : undefined;
                                    console.debug("Selected subclass type object:", typeObj);
                                    const subclassTemplate = typeObj?.subClassMetadataTemplate;
                                    // Apply subclass modifications to the metadataTemplate
                                    const newMetadataTemplate = this.applySubclassTemplate(
                                        subclassTemplate
                                    );
                                    this.metadataTemplate = newMetadataTemplate; // Update the metadata template
                                    // Re-render modal fields
                                    container.empty();
                                    this.renderInputs(container, this.metadataTemplate);

                                } catch (e) {
                                    console.error(`Could not load subclass template for ${selectedType}:`, e);
                                }
                            }
                        });
                        targetData[key] = defaultValue; // Set initial value
                        targetInputs[key] = subClassSelection; // Store reference
                        break;
                    }

                    default:
                        console.warn(`Unsupported input type: ${config.inputType}`);
                }
            }
        }
    }

    /**
     * Safely retrieves the value of a nested key in an object without modifying the object.
     * @param obj The object to traverse.
     * @param path The dot-separated path to the nested key.
     * @returns The value of the nested key, or undefined if the key does not exist.
     */
    private getNestedValue(obj: Record<string, any>, path: string | null): any {
        if (!path) {
            return JSON.parse(JSON.stringify(obj)); // Return a deep copy of the entire object
        }

        const keys = path.split(".");
        let current = JSON.parse(JSON.stringify(obj)); // Create a deep copy of the object

        for (const key of keys) {
            if (!current || typeof current !== "object" || !(key in current)) {
                return undefined; // Return undefined if the key does not exist
            }
            current = current[key]; // Move to the next level
        }

        return current; // Return the final value
    }


    protected updateInputField(fullKey: string, value: any): void {
        const keys = fullKey.split(".");
        let target = this.data;
        let inputField = this.inputs;

        // Traverse the nested structure to find the target field
        for (let i = 0; i < keys.length; i++) {
            if (!target[keys[i]]) {
                console.warn(`Data key "${keys[i]}" does not exist in this.data at level ${i}.`);
                return; // Exit if the data structure is invalid
            }
            if (!inputField[keys[i]]) {
                console.warn(`Input field key "${keys[i]}" does not exist in this.inputs at level ${i}.`);
                return; // Exit if the input structure is invalid
            }
            target = target[keys[i]];
            inputField = inputField[keys[i]];
        }

        target = value; // Update the data object

        // Update the input field directly using the stored reference
        if (inputField.setValue) {
            // For Obsidian components like TextComponent or DropdownComponent
            inputField.setValue(value);
        } else if (inputField instanceof HTMLInputElement) {
            // For native HTML input elements
            inputField.value = value;
        } else {
            console.warn(`Unsupported input field type for "${fullKey}".`);
        }
    }

    private applySubclassTemplate(
        subclassTemplate: SubclassMetadataTemplate
    ): Record<string, any> {
        const baseTemplate = this.originalMetadataTemplate
        if (!baseTemplate) {
            console.error("Base template is not defined. Cannot apply subclass template.");
            return {};
        }
        console.debug("applySubclassTemplate: Subclass Template", subclassTemplate);
        // Create a deep copy of the base template to avoid modifying the original
        const newTemplate = JSON.parse(JSON.stringify(baseTemplate));
        // Remove fields
        if (Array.isArray(subclassTemplate.remove)) {
            for (const fullKey of subclassTemplate.remove) {
                const keys = fullKey.split(".");
                let obj = newTemplate;
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!obj[keys[i]]) break;
                    obj = obj[keys[i]];
                }
                delete obj[keys[keys.length - 1]];
            }
        }
        // Replace fields
        if (subclassTemplate.replace && Array.isArray(subclassTemplate.replace)) {
            for (const { fullKey, newKey, input } of subclassTemplate.replace) {
                // Remove old key
                const keys = fullKey.split(".");
                let obj = newTemplate;
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!obj[keys[i]]) break;
                    obj = obj[keys[i]];
                }
                delete obj[keys[keys.length - 1]];
                // Add new key
                obj[newKey] = input;
            }
        }
        // Add fields
        if (Array.isArray(subclassTemplate.add)) {
            for (const { fullKey, input } of subclassTemplate.add) {
                const keys = fullKey.split(".");
                let obj = newTemplate;
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!obj[keys[i]]) obj[keys[i]] = {};
                    obj = obj[keys[i]];
                }
                obj[keys[keys.length - 1]] = input;
            }
        }
        // Process dynamic fields
        this.processDynamicFields(newTemplate);
    // --- Recursively restore user input values ---
    function restoreUserInput(template: any, data: any) {
        if (!template || typeof template !== "object" || !data || typeof data !== "object") return;
        for (const key of Object.keys(template)) {
            if (template[key] && typeof template[key] === "object" && "inputType" in template[key]) {
                if (data[key] !== undefined) {
                    template[key].default = data[key];
                }
            }
            // Recurse into nested objects (but not arrays or fields with inputType)
            if (
                template[key] &&
                typeof template[key] === "object" &&
                !Array.isArray(template[key]) &&
                !template[key].inputType
            ) {
                restoreUserInput(template[key], data[key] || {});
            }
        }
    }
    restoreUserInput(newTemplate, this.data);
    // --------------------------------------------
        console.debug("applySubclassTemplate: New Template", newTemplate);
        return newTemplate;
    }
}