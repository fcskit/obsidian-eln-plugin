import { App, Modal, Setting } from "obsidian";

export class NumberInputModal extends Modal {
    private label: string;
    private initialValue: number;
    private onSubmit: (value: number) => void;
    private placeholder?: string;

    constructor(app: App, label: string, onSubmit: (value: number) => void, initialValue: number = 0, placeholder?: string) {
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
            type: "number",
            value: String(this.initialValue),
            placeholder: this.placeholder || ""
        });
        input.addEventListener("input", (e) => {
            value = parseFloat((e.target as HTMLInputElement).value);
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
