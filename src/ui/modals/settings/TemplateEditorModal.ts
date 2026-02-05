import { App, Modal, Setting } from "obsidian";
import { PathTemplate, MetaDataTemplate, MetaDataTemplateField } from "../../../types/templates";

export class PathTemplateEditorModal extends Modal {
    private template: PathTemplate;
    private onSave: (template: PathTemplate) => void;
    private originalTemplate: PathTemplate;

    constructor(
        app: App, 
        template: PathTemplate, 
        onSave: (template: PathTemplate) => void,
        title: string = "Edit Path Template"
    ) {
        super(app);
        this.template = JSON.parse(JSON.stringify(template)); // Deep copy
        this.originalTemplate = template;
        this.onSave = onSave;
        this.setTitle(title);
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl("p", { 
            text: "Configure the template elements that determine how paths/titles are generated." 
        });

        this.renderTemplateElements();

        // Add element button
        new Setting(contentEl)
            .addButton((button) =>
                button
                    .setButtonText("Add Element")
                    .setCta()
                    .onClick(() => {
                        this.template.push({
                            type: "string",
                            field: "",
                            separator: ""
                        });
                        this.renderTemplateElements();
                    })
            );

        // Save/Cancel buttons
        const buttonContainer = contentEl.createEl("div", { cls: "modal-button-container" });
        
        new Setting(buttonContainer)
            .addButton((button) =>
                button
                    .setButtonText("Save")
                    .setCta()
                    .onClick(() => {
                        this.onSave(this.template);
                        this.close();
                    })
            )
            .addButton((button) =>
                button
                    .setButtonText("Cancel")
                    .onClick(() => {
                        this.close();
                    })
            );
    }

    private renderTemplateElements(): void {
        const existingContainer = this.contentEl.querySelector('.template-elements');
        if (existingContainer) {
            existingContainer.remove();
        }

        const container = this.contentEl.createEl("div", { cls: "template-elements" });

        this.template.forEach((element, index) => {
            const elementContainer = container.createEl("div", { cls: "template-element" });
            
            elementContainer.createEl("h4", { text: `Element ${index + 1}` });

            // Type selection
            new Setting(elementContainer)
                .setName("Type")
                .addDropdown((dropdown) => {
                    dropdown
                        .addOption("string", "Static String")
                        .addOption("dateField", "Date Field")
                        .addOption("userInput", "User Input")
                        .addOption("index", "Auto Index")
                        .setValue(element.type)
                        .onChange((value) => {
                            element.type = value;
                        });
                });

            // Field input
            new Setting(elementContainer)
                .setName("Field")
                .setDesc("The field value or path (e.g., 'currentDate', 'this.userInput.author')")
                .addText((text) =>
                    text
                        .setValue(element.field)
                        .onChange((value) => {
                            element.field = value;
                        })
                );

            // Separator input
            new Setting(elementContainer)
                .setName("Separator")
                .setDesc("Optional separator to append after this element")
                .addText((text) =>
                    text
                        .setValue(element.separator || "")
                        .onChange((value) => {
                            element.separator = value;
                        })
                );

            // Delete button
            new Setting(elementContainer)
                .addButton((button) =>
                    button
                        .setButtonText("Delete Element")
                        .setWarning()
                        .onClick(() => {
                            this.template.splice(index, 1);
                            this.renderTemplateElements();
                        })
                );

            elementContainer.createEl("hr");
        });
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}

export class MetadataTemplateEditorModal extends Modal {
    private template: MetaDataTemplate;
    private onSave: (template: MetaDataTemplate) => void;
    private originalTemplate: MetaDataTemplate;

    constructor(
        app: App, 
        template: MetaDataTemplate, 
        onSave: (template: MetaDataTemplate) => void
    ) {
        super(app);
        this.template = JSON.parse(JSON.stringify(template)); // Deep copy
        this.originalTemplate = template;
        this.onSave = onSave;
        this.setTitle("Edit Metadata Template");
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl("p", { 
            text: "Configure the metadata fields for this note type. This is a simplified editor - for complex configurations, edit the template files directly." 
        });

        this.renderFields();

        // Add field button
        new Setting(contentEl)
            .addButton((button) =>
                button
                    .setButtonText("Add Field")
                    .setCta()
                    .onClick(() => {
                        const fieldName = `field_${Object.keys(this.template).length + 1}`;
                        this.template[fieldName] = {
                            inputType: "text",
                            default: ""
                        } as MetaDataTemplateField;
                        this.renderFields();
                    })
            );

        // Save/Cancel buttons
        const buttonContainer = contentEl.createEl("div", { cls: "modal-button-container" });
        
        new Setting(buttonContainer)
            .addButton((button) =>
                button
                    .setButtonText("Save")
                    .setCta()
                    .onClick(() => {
                        this.onSave(this.template);
                        this.close();
                    })
            )
            .addButton((button) =>
                button
                    .setButtonText("Cancel")
                    .onClick(() => {
                        this.close();
                    })
            );
    }

    private renderFields(): void {
        const existingContainer = this.contentEl.querySelector('.metadata-fields');
        if (existingContainer) {
            existingContainer.remove();
        }

        const container = this.contentEl.createEl("div", { cls: "metadata-fields" });

        Object.entries(this.template).forEach(([fieldName, field]) => {
            const fieldContainer = container.createEl("div", { cls: "metadata-field" });
            
            fieldContainer.createEl("h4", { text: fieldName });

            const typedField = field as MetaDataTemplateField;

            // Input type
            new Setting(fieldContainer)
                .setName("Input Type")
                .addDropdown((dropdown) => {
                    dropdown
                        .addOption("text", "Text")
                        .addOption("number", "Number")
                        .addOption("date", "Date")
                        .addOption("dropdown", "Dropdown")
                        .addOption("multiselect", "Multi-select")
                        .addOption("list", "List")
                        .setValue(typedField.inputType || "text")
                        .onChange((value) => {
                            typedField.inputType = value as MetaDataTemplateField["inputType"];
                        });
                });

            // Default value
            new Setting(fieldContainer)
                .setName("Default Value")
                .addText((text) =>
                    text
                        .setValue(String(typedField.default || ""))
                        .onChange((value) => {
                            typedField.default = value;
                        })
                );

            // Query toggle
            new Setting(fieldContainer)
                .setName("Query Field")
                .setDesc("Show this field in the note creation dialog")
                .addToggle((toggle) =>
                    toggle
                        .setValue(typedField.query || false)
                        .onChange((value) => {
                            typedField.query = value;
                        })
                );

            // Delete button
            new Setting(fieldContainer)
                .addButton((button) =>
                    button
                        .setButtonText("Delete Field")
                        .setWarning()
                        .onClick(() => {
                            delete this.template[fieldName];
                            this.renderFields();
                        })
                );

            fieldContainer.createEl("hr");
        });
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}
