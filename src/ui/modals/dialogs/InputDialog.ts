import { App, Modal, ButtonComponent, TextComponent, Notice } from "obsidian";

export interface InputDialogOptions {
    title?: string; // Title of the modal
    placeholder?: string; // Placeholder text for the input field
    buttonText?: string; // Text for the submit button
    noticeText?: string; // Text for the notice when the input is empty
    onSubmit: (fieldName: string) => void; // Callback when the field name is submitted
}

export class InputDialog extends Modal {
    private options: InputDialogOptions;

    constructor(app: App, options: InputDialogOptions) {
        super(app);
        this.options = {
            title: "Add New Field", // Default title
            placeholder: "Enter field name", // Default placeholder
            buttonText: "Add Field", // Default button text
            noticeText: "Field name cannot be empty.", // Default notice text
            ...options, // Override defaults with provided options
        };
    }

    onOpen() {
        const { contentEl } = this;

        // Add a title
        contentEl.createEl("h2", { text: this.options.title });

        // Create an input field
        const input = new TextComponent(contentEl);
        input.setPlaceholder(this.options.placeholder || ""); // Fallback to an empty string if undefined

        // Create a submit button
        const submitButton = new ButtonComponent(contentEl);
        submitButton.setButtonText(this.options.buttonText || "Submit"); // Fallback to "Submit" if undefined
        submitButton.setCta();
        submitButton.onClick(() => {
            const fieldName = input.getValue().trim();
            if (fieldName) {
                this.options.onSubmit(fieldName); // Call the onSubmit callback with the field name
                this.close(); // Close the modal
            } else {
                new Notice(this.options.noticeText || "Enter a value or press cancel to abort."); // Show a notice if the input is empty
            }
        });

        // Create a cancel button
        const cancelButton = new ButtonComponent(contentEl);
        cancelButton.setButtonText("Cancel");
        cancelButton.onClick(() => {
            this.close(); // Close the modal without doing anything
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty(); // Clear the modal content
    }
}