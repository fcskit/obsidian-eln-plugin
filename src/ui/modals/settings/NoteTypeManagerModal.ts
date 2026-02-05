import { App, Modal, Setting, Notice } from "obsidian";
import { BaseNoteConfig, ELNSettings } from "../../../settings/settings";
import { DEFAULT_SETTINGS } from "../../../settings/settings";

export class NoteTypeManagerModal extends Modal {
    private settings: ELNSettings;
    private onSave: (settings: ELNSettings) => void;

    constructor(
        app: App, 
        settings: ELNSettings,
        onSave: (settings: ELNSettings) => void
    ) {
        super(app);
        this.settings = JSON.parse(JSON.stringify(settings)); // Deep copy
        this.onSave = onSave;
        this.setTitle("Manage Note Types");
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl("p", { 
            text: "Add custom note types or remove existing ones. Built-in note types cannot be deleted but can be disabled." 
        });

        this.renderNoteTypes();

        // Add new note type section
        this.createAddNoteTypeSection(contentEl);

        // Save/Cancel buttons
        const buttonContainer = contentEl.createEl("div", { cls: "modal-button-container" });
        
        new Setting(buttonContainer)
            .addButton((button) =>
                button
                    .setButtonText("Save Changes")
                    .setCta()
                    .onClick(() => {
                        this.onSave(this.settings);
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

    private renderNoteTypes(): void {
        const existingContainer = this.contentEl.querySelector('.note-types-list');
        if (existingContainer) {
            existingContainer.remove();
        }

        const container = this.contentEl.createEl("div", { cls: "note-types-list" });
        container.createEl("h4", { text: "Existing Note Types" });

        const builtInTypes = new Set([
            "analysis", "chemical", "dailyNote", "device", "instrument", 
            "meeting", "process", "project", "sample", "sampleList", "default"
        ]);

        Object.entries(this.settings.note).forEach(([noteType, config]) => {
            const typeContainer = container.createEl("div", { cls: "note-type-item" });
            
            const header = typeContainer.createEl("div", { cls: "note-type-header" });
            header.createEl("span", { 
                text: this.capitalizeNoteTypeName(noteType),
                cls: "note-type-name"
            });

            if (builtInTypes.has(noteType)) {
                header.createEl("span", { 
                    text: "Built-in",
                    cls: "note-type-badge built-in"
                });
            } else {
                header.createEl("span", { 
                    text: "Custom",
                    cls: "note-type-badge custom"
                });

                // Delete button for custom types
                const deleteButton = header.createEl("button", { 
                    text: "Delete",
                    cls: "note-type-delete"
                });
                deleteButton.addEventListener("click", () => {
                    if (confirm(`Are you sure you want to delete the "${noteType}" note type? This action cannot be undone.`)) {
                        delete (this.settings.note as Record<string, BaseNoteConfig>)[noteType];
                        this.renderNoteTypes();
                    }
                });
            }

            // Enable/disable toggle
            const toggleContainer = typeContainer.createEl("div", { cls: "note-type-controls" });
            new Setting(toggleContainer)
                .setName("Enabled")
                .setDesc(builtInTypes.has(noteType) ? "Enable/disable this built-in note type" : "Enable/disable this custom note type")
                .addToggle((toggle) =>
                    toggle
                        .setValue(config.commands?.enabled ?? true)
                        .onChange((value) => {
                            if (config.commands) {
                                config.commands.enabled = value;
                            }
                        })
                );
        });
    }

    private createAddNoteTypeSection(containerEl: HTMLElement): void {
        containerEl.createEl("hr");
        containerEl.createEl("h4", { text: "Add New Note Type" });

        let newTypeName = "";
        let newTypeDisplayName = "";

        new Setting(containerEl)
            .setName("Note Type ID")
            .setDesc("Internal identifier (camelCase, no spaces)")
            .addText((text) =>
                text
                    .setPlaceholder("e.g., customExperiment")
                    .onChange((value) => {
                        newTypeName = value.trim();
                    })
            );

        new Setting(containerEl)
            .setName("Display Name")
            .setDesc("Human-readable name shown in the UI")
            .addText((text) =>
                text
                    .setPlaceholder("e.g., Custom Experiment")
                    .onChange((value) => {
                        newTypeDisplayName = value.trim();
                    })
            );

        new Setting(containerEl)
            .addButton((button) =>
                button
                    .setButtonText("Add Note Type")
                    .setCta()
                    .onClick(() => {
                        if (!newTypeName) {
                            new Notice("Please enter a note type ID");
                            return;
                        }

                        if (!newTypeDisplayName) {
                            newTypeDisplayName = this.capitalizeNoteTypeName(newTypeName);
                        }

                        // Check if type already exists
                        if ((this.settings.note as Record<string, BaseNoteConfig>)[newTypeName]) {
                            new Notice("A note type with this ID already exists");
                            return;
                        }

                        // Create new note type based on default config
                        const newNoteConfig: BaseNoteConfig = {
                            ...JSON.parse(JSON.stringify(DEFAULT_SETTINGS.note.default)),
                            navbar: {
                                ...DEFAULT_SETTINGS.note.default.navbar,
                                name: newTypeDisplayName
                            },
                            commands: {
                                ...DEFAULT_SETTINGS.note.default.commands,
                                id: `create-${newTypeName}`,
                                name: `Create ${newTypeDisplayName}`
                            }
                        };

                        (this.settings.note as Record<string, BaseNoteConfig>)[newTypeName] = newNoteConfig;
                        
                        new Notice(`Added new note type: ${newTypeDisplayName}`);
                        this.renderNoteTypes();

                        // Clear inputs
                        newTypeName = "";
                        newTypeDisplayName = "";
                    })
            );
    }

    private capitalizeNoteTypeName(noteType: string): string {
        // Convert camelCase to proper names
        const nameMap: Record<string, string> = {
            'dailyNote': 'Daily Note',
            'sampleList': 'Sample List'
        };
        
        return nameMap[noteType] || noteType.split(/(?=[A-Z])/).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}
