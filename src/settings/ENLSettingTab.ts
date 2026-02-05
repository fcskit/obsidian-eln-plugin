import { App, PluginSettingTab, Setting } from "obsidian";
import ELNPlugin from "../main";
import { ELNSettings, BaseNoteConfig } from "./settings";
import { PathTemplateEditorModal, MetadataTemplateEditorModal } from "../ui/modals/settings/TemplateEditorModal";
import { ArrayEditorModal } from "../ui/modals/settings/ArrayEditorModal";
import { FilePickerModal } from "../ui/modals/dialogs/FilePickerModal";
import { NoteTypeManagerModal } from "../ui/modals/settings/NoteTypeManagerModal";


export class ELNSettingTab extends PluginSettingTab {
    plugin: ELNPlugin;

    constructor(app: App, plugin: ELNPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        // General Settings
        this.createGeneralSettings(containerEl);

        // Navbar Settings  
        this.createNavbarSettings(containerEl);

        // Footer Settings
        this.createFooterSettings(containerEl);

        // NPE Settings
        this.createNPESettings(containerEl);

        // Note Settings
        this.createNoteSettings(containerEl);
    }

    private createGeneralSettings(containerEl: HTMLElement): void {
        new Setting(containerEl).setName('General').setHeading();

        // Add authors
        this.createEditableList(
            containerEl,
            "Authors",
            this.plugin.settings.general.authors,
            async (updatedList) => {
                this.plugin.settings.general.authors = updatedList;
                await this.plugin.saveSettings();
            }
        );

        // Add operators
        this.createEditableList(
            containerEl,
            "Operators",
            this.plugin.settings.general.operators,
            async (updatedList) => {
                this.plugin.settings.general.operators = updatedList;
                await this.plugin.saveSettings();
            }
        );
    }

    private createNavbarSettings(containerEl: HTMLElement): void {
        new Setting(containerEl).setName('Navbar').setHeading();

        new Setting(containerEl)
            .setName("Display Navigation Bar")
            .setDesc("Display a navigation bar at the top of all notes.")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.navbar.enabled)
                    .onChange(async (value) => {
                        this.plugin.settings.navbar.enabled = value;
                        await this.plugin.saveSettings();
                    })
            );

        // Add navbar groups configuration here if needed
    }

    private createFooterSettings(containerEl: HTMLElement): void {
        new Setting(containerEl).setName('Footer').setHeading();

        new Setting(containerEl)
            .setName("Display Footer")
            .setDesc("Display a footer at the bottom of all notes.")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.footer.enabled)
                    .onChange(async (value) => {
                        this.plugin.settings.footer.enabled = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Include Version")
            .setDesc("Include the ELN version in the footer of notes.")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.footer.includeVersion)
                    .onChange(async (value) => {
                        this.plugin.settings.footer.includeVersion = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Include Author")
            .setDesc("Include author information in the footer of notes.")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.footer.includeAuthor)
                    .onChange(async (value) => {
                        this.plugin.settings.footer.includeAuthor = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Include Modification Time")
            .setDesc("Include the last modification time in the footer of notes.")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.footer.includeMtime)
                    .onChange(async (value) => {
                        this.plugin.settings.footer.includeMtime = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Include Creation Time")
            .setDesc("Include the creation time in the footer of notes.")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.footer.includeCtime)
                    .onChange(async (value) => {
                        this.plugin.settings.footer.includeCtime = value;
                        await this.plugin.saveSettings();
                    })
            );
    }

    private createNPESettings(containerEl: HTMLElement): void {
        new Setting(containerEl).setName('Nested Properties Editor').setHeading();

        new Setting(containerEl)
            .setName("Show Data Types")
            .setDesc("Display data type labels next to property values in the NPE for better type visibility.")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.npe.showDataTypes)
                    .onChange(async (value) => {
                        this.plugin.settings.npe.showDataTypes = value;
                        await this.plugin.saveSettings();
                    })
            );
    }

    private createNoteSettings(containerEl: HTMLElement): void {
        const headerContainer = containerEl.createEl("div", { cls: "note-settings-header" });
        new Setting(headerContainer).setName('Notes').setHeading();
        
        // Add note type management button
        new Setting(headerContainer)
            .setName("Manage Note Types")
            .setDesc("Add custom note types or manage existing ones")
            .addButton((button) =>
                button
                    .setButtonText("Manage")
                    .onClick(() => {
                        new NoteTypeManagerModal(
                            this.app,
                            this.plugin.settings,
                            async (updatedSettings) => {
                                this.plugin.settings = updatedSettings;
                                await this.plugin.saveSettings();
                                this.display(); // Refresh the entire settings display
                            }
                        ).open();
                    })
            );
        
        // Iterate through all note types dynamically
        Object.entries(this.plugin.settings.note).forEach(([noteType, config]) => {
            this.createNoteTypeSection(containerEl, noteType, config);
        });
    }

    private createNoteTypeSection(containerEl: HTMLElement, noteType: string, config: BaseNoteConfig & Record<string, unknown>): void {
        // Create collapsible section
        const noteSection = containerEl.createEl("details", { cls: "note-settings-section" });
        noteSection.createEl("summary", { 
            text: this.capitalizeNoteTypeName(noteType),
            cls: "note-settings-summary"
        });

        const contentEl = noteSection.createEl("div", { cls: "note-settings-content" });

        // Navbar settings
        this.createNoteNavbarSettings(contentEl, noteType, config);

        // Command settings
        this.createNoteCommandSettings(contentEl, noteType, config);

        // Template settings
        this.createNoteTemplateSettings(contentEl, noteType, config);

        // Note-specific settings
        this.createNoteSpecificSettings(contentEl, noteType, config);
    }

    private createNoteNavbarSettings(containerEl: HTMLElement, noteType: string, config: BaseNoteConfig): void {
        new Setting(containerEl).setName('Navbar').setHeading();

        new Setting(containerEl)
            .setName("Display in Navbar")
            .setDesc("Show this note type in the navigation bar.")
            .addToggle((toggle) =>
                toggle
                    .setValue(config.navbar.display)
                    .onChange(async (value) => {
                        config.navbar.display = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Display Name")
            .setDesc("Name shown in the navbar.")
            .addText((text) =>
                text
                    .setValue(config.navbar.name)
                    .onChange(async (value) => {
                        config.navbar.name = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Navbar Group")
            .setDesc("Group this note type belongs to in the navbar.")
            .addDropdown((dropdown) => {
                this.plugin.settings.navbar.groups.forEach(group => {
                    dropdown.addOption(group.id, group.name);
                });
                dropdown
                    .setValue(config.navbar.group)
                    .onChange(async (value) => {
                        config.navbar.group = value;
                        await this.plugin.saveSettings();
                    });
            });
    }

    private createNoteCommandSettings(containerEl: HTMLElement, noteType: string, config: BaseNoteConfig): void {
        new Setting(containerEl).setName('Commands').setHeading();

        new Setting(containerEl)
            .setName("Enable Command")
            .setDesc("Enable the command to create this note type.")
            .addToggle((toggle) =>
                toggle
                    .setValue(config.commands.enabled)
                    .onChange(async (value) => {
                        config.commands.enabled = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Command ID")
            .setDesc("Unique identifier for the command.")
            .addText((text) =>
                text
                    .setValue(config.commands.id)
                    .onChange(async (value) => {
                        config.commands.id = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Command Name")
            .setDesc("Display name for the command.")
            .addText((text) =>
                text
                    .setValue(config.commands.name)
                    .onChange(async (value) => {
                        config.commands.name = value;
                        await this.plugin.saveSettings();
                    })
            );
    }

    private createNoteTemplateSettings(containerEl: HTMLElement, noteType: string, config: BaseNoteConfig): void {
        new Setting(containerEl).setName('Templates').setHeading();

        // Title Template (fileName)
        new Setting(containerEl)
            .setName("Title Template")
            .setDesc("Template for generating note titles.")
            .addButton((button) =>
                button
                    .setButtonText("Edit")
                    .onClick(() => {
                        new PathTemplateEditorModal(
                            this.app,
                            config.fileName,
                            async (updatedTemplate) => {
                                config.fileName = updatedTemplate;
                                await this.plugin.saveSettings();
                            },
                            "Edit Title Template"
                        ).open();
                    })
            );

        // Folder Template (folderPath)
        new Setting(containerEl)
            .setName("Folder Template")
            .setDesc("Template for determining note folder location.")
            .addButton((button) =>
                button
                    .setButtonText("Edit")
                    .onClick(() => {
                        new PathTemplateEditorModal(
                            this.app,
                            config.folderPath,
                            async (updatedTemplate) => {
                                config.folderPath = updatedTemplate;
                                await this.plugin.saveSettings();
                            },
                            "Edit Folder Template"
                        ).open();
                    })
            );

        // Metadata Template
        new Setting(containerEl)
            .setName("Use Custom Metadata Template")
            .setDesc("Use a custom metadata template file.")
            .addToggle((toggle) =>
                toggle
                    .setValue(config.customMetadataTemplate)
                    .onChange(async (value) => {
                        config.customMetadataTemplate = value;
                        await this.plugin.saveSettings();
                    })
            );

        if (config.customMetadataTemplate) {
            new Setting(containerEl)
                .setName("Metadata Template Path")
                .setDesc("Path to the custom metadata template file.")
                .addText((text) =>
                    text
                        .setValue(config.customMetadataTemplatePath)
                        .onChange(async (value) => {
                            config.customMetadataTemplatePath = value;
                            await this.plugin.saveSettings();
                        })
                )
                .addButton((button) =>
                    button
                        .setButtonText("Browse")
                        .onClick(() => {
                            new FilePickerModal(
                                this.app,
                                (selectedPath: string) => {
                                    config.customMetadataTemplatePath = selectedPath;
                                    this.plugin.saveSettings();
                                    this.display(); // Refresh to show new path
                                },
                                ".md",
                                "Select Metadata Template"
                            ).open();
                        })
                );
        } else {
            new Setting(containerEl)
                .setName("Metadata Template")
                .setDesc("Edit the metadata template structure.")
                .addButton((button) =>
                    button
                        .setButtonText("Edit")
                        .onClick(() => {
                            new MetadataTemplateEditorModal(
                                this.app,
                                config.metadataTemplate,
                                async (updatedTemplate) => {
                                    config.metadataTemplate = updatedTemplate;
                                    await this.plugin.saveSettings();
                                }
                            ).open();
                        })
                );
        }

        // Markdown Template
        new Setting(containerEl)
            .setName("Use Custom Markdown Template")
            .setDesc("Use a custom markdown template file.")
            .addToggle((toggle) =>
                toggle
                    .setValue(config.customMarkdownTemplate)
                    .onChange(async (value) => {
                        config.customMarkdownTemplate = value;
                        await this.plugin.saveSettings();
                    })
            );

        if (config.customMarkdownTemplate) {
            new Setting(containerEl)
                .setName("Markdown Template Path")
                .setDesc("Path to the custom markdown template file.")
                .addText((text) =>
                    text
                        .setValue(config.customMarkdownTemplatePath)
                        .onChange(async (value) => {
                            config.customMarkdownTemplatePath = value;
                            await this.plugin.saveSettings();
                        })
                )
                .addButton((button) =>
                    button
                        .setButtonText("Browse")
                        .onClick(() => {
                            new FilePickerModal(
                                this.app,
                                (selectedPath: string) => {
                                    config.customMarkdownTemplatePath = selectedPath;
                                    this.plugin.saveSettings();
                                    this.display(); // Refresh to show new path
                                },
                                ".md",
                                "Select Markdown Template"
                            ).open();
                        })
                );
        }
    }

    private createNoteSpecificSettings(containerEl: HTMLElement, noteType: string, config: BaseNoteConfig): void {
        new Setting(containerEl).setName('Note-specific options').setHeading();

        // Handle different note-specific settings dynamically
        Object.entries(config).forEach(([key, value]) => {
            // Skip BaseNoteConfig properties
            if (['navbar', 'commands', 'fileName', 'folderPath', 'createSubfolder',
                 'customMetadataTemplate', 'customMarkdownTemplate', 
                 'customMetadataTemplatePath', 'customMarkdownTemplatePath',
                 'metadataTemplate', 'markdownTemplate'].includes(key)) {
                return;
            }

            if (Array.isArray(value)) {
                this.createNoteSpecificArraySetting(containerEl, noteType, key, value);
            } else if (typeof value === 'string') {
                this.createNoteSpecificStringSetting(containerEl, noteType, key, value);
            }
        });
    }

    private createNoteSpecificArraySetting(containerEl: HTMLElement, noteType: string, key: string, value: unknown[]): void {
        const isStringArray = value.length === 0 || typeof value[0] === 'string';
        
        if (isStringArray) {
            // Handle simple string arrays
            this.createStringList(
                containerEl,
                this.capitalizeKey(key),
                value as string[],
                async (updatedList) => {
                    (this.plugin.settings.note as Record<string, BaseNoteConfig>)[noteType][key] = updatedList;
                    await this.plugin.saveSettings();
                }
            );
        } else {
            // Handle arrays of objects - show as buttons that would open edit dialogs
            const setting = new Setting(containerEl)
                .setName(this.capitalizeKey(key))
                .setDesc(`Manage ${key} configurations.`);

            value.forEach((item, index) => {
                if (item && typeof item === 'object' && item !== null && 'name' in item) {
                    setting.addButton((button) =>
                        button
                            .setButtonText(String((item as Record<string, unknown>).name))
                            .onClick(() => {
                                // Create a single-item array for editing this specific item
                                new ArrayEditorModal(
                                    this.app,
                                    [item as Record<string, unknown>],
                                    async (updatedItems) => {
                                        if (updatedItems.length > 0) {
                                            // Update the original item
                                            Object.assign(item, updatedItems[0]);
                                            await this.plugin.saveSettings();
                                        }
                                    },
                                    item as Record<string, unknown>,
                                    `Edit ${(item as Record<string, unknown>).name}`
                                ).open();
                            })
                    );
                }
            });

            setting.addButton((button) =>
                button
                    .setButtonText("Manage All")
                    .onClick(() => {
                        // Get a template from existing items or create a basic one
                        const template = value.length > 0 
                            ? value[0] as Record<string, unknown>
                            : { name: "", web: "" };
                        
                        new ArrayEditorModal(
                            this.app,
                            value as Record<string, unknown>[],
                            async (updatedItems) => {
                                (this.plugin.settings.note as Record<string, BaseNoteConfig>)[noteType][key] = updatedItems;
                                await this.plugin.saveSettings();
                                this.display(); // Refresh entire display
                            },
                            template,
                            `Manage ${this.capitalizeKey(key)}`
                        ).open();
                    })
            );
        }
    }

    private createNoteSpecificStringSetting(containerEl: HTMLElement, noteType: string, key: string, value: string): void {
        new Setting(containerEl)
            .setName(this.capitalizeKey(key))
            .addText((text) =>
                text
                    .setValue(value)
                    .onChange(async (newValue) => {
                        (this.plugin.settings.note as Record<string, BaseNoteConfig>)[noteType][key] = newValue;
                        await this.plugin.saveSettings();
                    })
            );
    }

    private capitalizeNoteTypeName(noteType: string): string {
        // Convert camelCase to proper names
        const nameMap: Record<string, string> = {
            'dailyNote': 'Daily Note',
            'sampleList': 'Sample List'
        };
        
        return nameMap[noteType] || noteType.charAt(0).toUpperCase() + noteType.slice(1);
    }

    private capitalizeKey(key: string): string {
        return key.split(/(?=[A-Z])/).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    /**
     * Create an editable list for string arrays.
     */
    private createStringList(
        containerEl: HTMLElement,
        title: string,
        items: string[],
        onSave: (updatedList: string[]) => Promise<void>
    ): void {
        const setting = new Setting(containerEl).setName(title);
        const listEl = setting.controlEl.createEl("div", { cls: "editable-list" });

        items.forEach((item, index) => {
            const itemEl = listEl.createEl("div", { cls: "editable-list-item" });
            const input = itemEl.createEl("input", {
                type: "text",
                value: item,
            });
            input.addEventListener("blur", async () => {
                items[index] = input.value.trim();
                await onSave(items);
            });

            const removeButton = itemEl.createEl("button", { text: "Remove" });
            removeButton.addEventListener("click", async () => {
                items.splice(index, 1);
                await onSave(items);
                this.display();
            });
        });

        const addButton = listEl.createEl("button", { text: "Add" });
        addButton.addEventListener("click", async () => {
            items.push("");
            await onSave(items);
            this.display();
        });
    }

    /**
     * Creates an editable list for a setting.
     */
    private createEditableList<T extends Record<string, unknown>>(
        containerEl: HTMLElement,
        title: string,
        items: T[],
        onSave: (updatedList: T[]) => Promise<void>
    ): void {
        const setting = new Setting(containerEl).setName(title);
        const listEl = setting.controlEl.createEl("div", { cls: "editable-list" });

        items.forEach((item, index) => {
            const itemEl = listEl.createEl("div", { cls: "editable-list-item" });

            // Dynamically create inputs for each key in the object
            if (typeof item === "object" && item !== null) {
                Object.keys(item).forEach((key) => {
                    const value = item[key];

                    // Handle list fields (e.g., "method" or "type")
                    if (Array.isArray(value)) {
                        const input = itemEl.createEl("input", {
                            type: "text",
                            value: value.join(", "),
                            placeholder: key.charAt(0).toUpperCase() + key.slice(1),
                        });
                        input.addEventListener("blur", async () => {
                            (item as Record<string, unknown>)[key] = input.value
                                .split(",")
                                .map((v: string) => v.trim())
                                .filter((v: string) => v);
                            await onSave(items);
                        });
                    } else {
                        const input = itemEl.createEl("input", {
                            type: "text",
                            value: (value as string) || "",
                            placeholder: key.charAt(0).toUpperCase() + key.slice(1),
                        });
                        input.addEventListener("blur", async () => {
                            (item as Record<string, unknown>)[key] = input.value.trim();
                            await onSave(items);
                        });
                    }
                });
            }

            const removeButton = itemEl.createEl("button", { text: "Remove" });
            removeButton.addEventListener("click", async () => {
                items.splice(index, 1);
                await onSave(items);
                this.display();
            });
        });

        const addButton = listEl.createEl("button", { text: "Add" });
        addButton.addEventListener("click", async () => {
            const newItem = items.length > 0 ? Object.keys(items[0]).reduce((acc, key) => {
                acc[key] = Array.isArray(items[0][key]) ? [] : "";
                return acc;
            }, {} as Record<string, unknown>) : {} as Record<string, unknown>;
            items.push(newItem as T);
            await onSave(items);
            this.display();
        });
    }
}