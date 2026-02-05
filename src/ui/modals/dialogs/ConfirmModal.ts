import { App, Modal, Setting } from "obsidian";

export class ConfirmModal extends Modal {
    private message: string;
    private onConfirm: () => void;
    private onCancel?: () => void;

    constructor(app: App, message: string, onConfirm: () => void, onCancel?: () => void) {
        super(app);
        this.message = message;
        this.onConfirm = onConfirm;
        this.onCancel = onCancel;
        this.setTitle("Confirm");
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl("p", { text: this.message });

        const buttonContainer = contentEl.createEl("div", { cls: "modal-button-container" });
        new Setting(buttonContainer)
            .addButton((button) =>
                button
                    .setButtonText("OK")
                    .setCta()
                    .onClick(() => {
                        this.onConfirm();
                        this.close();
                    })
            )
            .addButton((button) =>
                button
                    .setButtonText("Cancel")
                    .onClick(() => {
                        if (this.onCancel) this.onCancel();
                        this.close();
                    })
            );
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}
