import { App, ButtonComponent, TextComponent, Notice } from "obsidian";
import { InputDialog } from "../dialogs/InputDialog";

export interface DynamicInputSectionOptions {
    container: HTMLElement;
    label: string;
    data: Record<string, string>; // The dynamic section data (key-value pairs)
    onChangeCallback?: (updatedData: Record<string, string>) => void; // Made optional
}

export class DynamicInputSection {
    private wrapper: HTMLElement;
    private data: Record<string, string>;
    private onChangeCallback: (updatedData: Record<string, string>) => void;

    constructor(private app: App, options: DynamicInputSectionOptions) {
        const {
            container,
            label,
            data,
            onChangeCallback = (updatedData) => updatedData
        } = options;

        this.data = { ...data }; // Clone the data to avoid direct mutation
        this.onChangeCallback = onChangeCallback;

        // Create the wrapper div
        this.wrapper = container.createDiv({ cls: "eln-modal-dynamic-section-wrapper" });

        // Create the label
        this.wrapper.createEl("h3", { text: label });

        // Render the initial fields
        this.renderFields();

        // Add the "Add Field" button
        const addButton = new ButtonComponent(this.wrapper);
        addButton.setButtonText("Add Field");
        addButton.onClick(() => {
            new InputDialog(this.app, {
                title: "Add New Field",
                placeholder: "Enter field name",
                buttonText: "Add Field",
                noticeText: "Field name cannot be empty.",
                onSubmit: (fieldName) => {
                    if (this.data[fieldName]) {
                        new Notice("Field name already exists.");
                        return;
                    }
                    this.data[fieldName] = ""; // Initialize with an empty string
                    this.renderFields(); // Re-render the fields
                    this.triggerOnChangeCallback(); // Trigger the callback
                }
            }).open();
        });
    }

    private renderFields(): void {
        // Clear existing fields
        this.wrapper.querySelectorAll(".eln-dynamic-field").forEach((el) => el.remove());
        
        // Create a field for each key-value pair
        Object.keys(this.data).forEach((key) => {
            const fieldContainer = this.wrapper.createDiv({ cls: "eln-dynamic-field" });
            
            // Key input
            const keyInput = new TextComponent(fieldContainer);
            keyInput.setValue(key);
            keyInput.onChange((newKey) => {
                if (newKey !== key && !this.data[newKey]) {
                    // Update the key if it's different and doesn't already exist
                    this.data[newKey] = this.data[key];
                    delete this.data[key];
                    this.renderFields(); // Re-render to reflect the key change
                    this.triggerOnChangeCallback();
                }
            });
            
            // Value input
            const valueInput = new TextComponent(fieldContainer);
            valueInput.setValue(this.data[key]);
            valueInput.onChange((newValue) => {
                this.data[key] = newValue;
                this.triggerOnChangeCallback();
            });
            
            // Delete button
            const deleteButton = new ButtonComponent(fieldContainer);
            deleteButton.setButtonText("🗑");
            deleteButton.onClick(() => {
                delete this.data[key];
                this.renderFields(); // Re-render after deletion
                this.triggerOnChangeCallback();
            });
        });
    }

    private triggerOnChangeCallback() {
        this.onChangeCallback({ ...this.data });
    }
}