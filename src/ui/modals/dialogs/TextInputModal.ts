import { App, Modal, Setting } from "obsidian";

export class TextInputModal extends Modal {
    private label: string;
    private initialValue: string;
    private onSubmit: (value: string) => void;
    private placeholder?: string;

    constructor(app: App, label: string, onSubmit: (value: string) => void, initialValue: string = "", placeholder?: string) {
        super(app);
        this.label = label;
        this.initialValue = initialValue;
        this.onSubmit = onSubmit;
        this.placeholder = placeholder;
        this.setTitle(label);
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl("label", { text: this.label });
        let value = this.initialValue;
        const input = contentEl.createEl("input", {
            type: "text",
            value: this.initialValue,
            placeholder: this.placeholder || ""
        });
        input.addEventListener("input", (e) => {
            value = (e.target as HTMLInputElement).value;
        });
        // Save/Cancel buttons
        const buttonContainer = contentEl.createEl("div", { cls: "modal-button-container" });
        new Setting(buttonContainer)
            .addButton((button) =>
                button
                    .setButtonText("OK")
                    .setCta()
                    .onClick(() => {
                        this.onSubmit(value);
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

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}
