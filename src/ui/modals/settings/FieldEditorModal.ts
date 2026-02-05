import { App, Modal, Setting } from "obsidian";

export class FieldEditorModal<T extends Record<string, unknown>> extends Modal {
    private item: T;
    private onSave: (item: T) => void;
    private itemTemplate: T;
    private title: string;
    private fieldDescriptions: Record<string, string>;

    constructor(
        app: App,
        item: T,
        onSave: (item: T) => void,
        itemTemplate: T,
        title: string = "Edit Fields",
        fieldDescriptions: Record<string, string> = {}
    ) {
        super(app);
        this.item = JSON.parse(JSON.stringify(item)); // Deep copy
        this.onSave = onSave;
        this.itemTemplate = itemTemplate;
        this.title = title;
        this.fieldDescriptions = fieldDescriptions;
        this.setTitle(title);
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl("p", {
            text: `Edit the fields for ${this.title.toLowerCase()}.`
        });

        this.renderFields();

        // Save/Cancel buttons
        const buttonContainer = contentEl.createEl("div", { cls: "modal-button-container" });
        new Setting(buttonContainer)
            .addButton((button) =>
                button
                    .setButtonText("Save")
                    .setCta()
                    .onClick(() => {
                        this.onSave(this.item);
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
        const container = this.contentEl.createEl("div", { cls: "field-editor" });

        Object.keys(this.itemTemplate).forEach((key) => {
            const value = this.item[key];
            const description = this.fieldDescriptions[key] || `Configure ${key}`;

            if (Array.isArray(value)) {
                // Handle array fields
                new Setting(container)
                    .setName(this.capitalizeKey(key))
                    .setDesc(`${description} (comma-separated)`)
                    .addText((text) =>
                        text
                            .setValue((value as string[]).join(", "))
                            .onChange((newValue) => {
                                (this.item as Record<string, unknown>)[key] = newValue
                                    .split(",")
                                    .map(v => v.trim())
                                    .filter(v => v);
                            })
                    );
            } else {
                // Handle string/simple fields
                new Setting(container)
                    .setName(this.capitalizeKey(key))
                    .setDesc(description)
                    .addText((text) =>
                        text
                            .setValue(String(value || ""))
                            .onChange((newValue) => {
                                (this.item as Record<string, unknown>)[key] = newValue;
                            })
                    );
            }
        });
    }

    private capitalizeKey(key: string): string {
        return key.split(/(?=[A-Z])/).map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}
