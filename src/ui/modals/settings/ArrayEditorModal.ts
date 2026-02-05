import { App, Modal, Setting } from "obsidian";

export class ArrayEditorModal<T extends Record<string, unknown>> extends Modal {
    private items: T[];
    private onSave: (items: T[]) => void;
    private itemTemplate: T;
    private title: string;
    private fieldDescriptions: Record<string, string>;

    constructor(
        app: App, 
        items: T[], 
        onSave: (items: T[]) => void,
        itemTemplate: T,
        title: string = "Edit Items",
        fieldDescriptions: Record<string, string> = {}
    ) {
        super(app);
        this.items = JSON.parse(JSON.stringify(items)); // Deep copy
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
            text: `Manage ${this.title.toLowerCase()}. Add, edit, or remove items from the list.` 
        });

        this.renderItems();

        // Add item button
        new Setting(contentEl)
            .addButton((button) =>
                button
                    .setButtonText("Add Item")
                    .setCta()
                    .onClick(() => {
                        const newItem = JSON.parse(JSON.stringify(this.itemTemplate));
                        this.items.push(newItem);
                        this.renderItems();
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
                        this.onSave(this.items);
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

    private renderItems(): void {
        const existingContainer = this.contentEl.querySelector('.array-items');
        if (existingContainer) {
            existingContainer.remove();
        }

        const container = this.contentEl.createEl("div", { cls: "array-items" });

        this.items.forEach((item, index) => {
            const itemContainer = container.createEl("div", { cls: "array-item" });
            
            itemContainer.createEl("h4", { text: `Item ${index + 1}` });

            // Render fields for this item
            Object.keys(this.itemTemplate).forEach((key) => {
                const value = item[key];
                const description = this.fieldDescriptions[key] || `Configure ${key}`;

                if (Array.isArray(value)) {
                    // Handle array fields
                    new Setting(itemContainer)
                        .setName(this.capitalizeKey(key))
                        .setDesc(`${description} (comma-separated)`)
                        .addText((text) =>
                            text
                                .setValue((value as string[]).join(", "))
                                .onChange((newValue) => {
                                    (item as Record<string, unknown>)[key] = newValue
                                        .split(",")
                                        .map(v => v.trim())
                                        .filter(v => v);
                                })
                        );
                } else {
                    // Handle string/simple fields
                    new Setting(itemContainer)
                        .setName(this.capitalizeKey(key))
                        .setDesc(description)
                        .addText((text) =>
                            text
                                .setValue(String(value || ""))
                                .onChange((newValue) => {
                                    (item as Record<string, unknown>)[key] = newValue;
                                })
                        );
                }
            });

            // Delete button
            new Setting(itemContainer)
                .addButton((button) =>
                    button
                        .setButtonText("Delete Item")
                        .setWarning()
                        .onClick(() => {
                            this.items.splice(index, 1);
                            this.renderItems();
                        })
                );

            itemContainer.createEl("hr");
        });

        if (this.items.length === 0) {
            container.createEl("p", { 
                text: "No items configured. Click 'Add Item' to get started.",
                cls: "empty-state"
            });
        }
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
