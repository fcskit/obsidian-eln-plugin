import { App, PluginSettingTab, Setting } from "obsidian";
import ELNPlugin from "../main";
import { ELNSettings } from "./settings";
import { StringKeys } from "../utils/types";

export class ELNSettingTab extends PluginSettingTab {
    plugin: ELNPlugin;

    constructor(app: App, plugin: ELNPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();
        containerEl.createEl("h2", { text: "ELN Plugin Settings" });

        // General Settings
        this.createGeneralSettings(containerEl);

        // Chemical Settings
        this.createChemicalSettings(containerEl);

        // Device Settings
        this.createDeviceSettings(containerEl);

        // Instrument Settings
        this.createInstrumentSettings(containerEl);

        // Process Settings
        this.createProcessSettings(containerEl);

        // Sample Settings
        this.createSampleSettings(containerEl);

        // Analysis Settings
        this.createAnalysisSettings(containerEl);

        // Folder Settings
        this.createFolderSettings(containerEl);
    }

    private createGeneralSettings(containerEl: HTMLElement): void {
        containerEl.createEl("h3", { text: "General Settings" });

        new Setting(containerEl)
            .setName("Include Version")
            .setDesc("Include the ELN version in the metadata of generated notes.")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.includeVersion)
                    .onChange(async (value) => {
                        this.plugin.settings.includeVersion = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Include Author")
            .setDesc("Include author in the metadata of generated notes.")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.includeAuthor)
                    .onChange(async (value) => {
                        this.plugin.settings.includeAuthor = value;
                        await this.plugin.saveSettings();
                    })
        );
        
        new Setting(containerEl)
            .setName("Display Navigation Bar")
            .setDesc("Display a navigation bar at the top of all notes.")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.addNavbar)
                    .onChange(async (value) => {
                        this.plugin.settings.addNavbar = value;
                        await this.plugin.saveSettings();
                    })
        );
        new Setting(containerEl)
            .setName("Display Footer")
            .setDesc("Display a footer at the bottom of all notes.")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.addFooter)
                    .onChange(async (value) => {
                        this.plugin.settings.addFooter = value;
                        await this.plugin.saveSettings();
                    })
        );

        // Add authors
        this.createEditableList(
            containerEl,
            "Authors",
            this.plugin.settings.authors,
            async (updatedList) => {
                this.plugin.settings.authors = updatedList;
                await this.plugin.saveSettings();
            }
        );

        // Add operators
        this.createEditableList(
            containerEl,
            "Operators",
            this.plugin.settings.operators,
            async (updatedList) => {
                this.plugin.settings.operators = updatedList;
                await this.plugin.saveSettings();
            }
        );
    }

    private createChemicalSettings(containerEl: HTMLElement): void {
        containerEl.createEl("h3", { text: "Chemical Settings" });

        // Chemical Types
        this.createEditableList(
            containerEl,
            "Chemical Types",
            this.plugin.settings.chemicalType,
            async (updatedList) => {
                this.plugin.settings.chemicalType = updatedList;
                await this.plugin.saveSettings();
            }
        );

        // Field of Use
        this.createEditableList(
            containerEl,
            "Field of Use",
            this.plugin.settings.chemicalFieldOfUse,
            async (updatedList) => {
                this.plugin.settings.chemicalFieldOfUse = updatedList;
                await this.plugin.saveSettings();
            }
        );

        // Chemical Supplier
        this.createEditableList(
            containerEl,
            "Chemical Supplier",
            this.plugin.settings.chemicalSupplier,
            async (updatedList) => {
                this.plugin.settings.chemicalSupplier = updatedList;
                await this.plugin.saveSettings();
            }
        );

        // Chemical Manufacturer
        this.createEditableList(
            containerEl,
            "Chemical Manufacturer",
            this.plugin.settings.chemicalManufacturer,
            async (updatedList) => {
                this.plugin.settings.chemicalManufacturer = updatedList;
                await this.plugin.saveSettings();
            }
        );
    }

    private createDeviceSettings(containerEl: HTMLElement): void {
        containerEl.createEl("h3", { text: "Device Settings" });

        // Device Types
        this.createEditableList(
            containerEl,
            "Device Types",
            this.plugin.settings.deviceType,
            async (updatedList) => {
                this.plugin.settings.deviceType = updatedList;
                await this.plugin.saveSettings();
            }
        );
    }

    private createInstrumentSettings(containerEl: HTMLElement): void {
        containerEl.createEl("h3", { text: "Instrument Settings" });

        // Instrument Types
        this.createEditableList(
            containerEl,
            "Instrument Types",
            this.plugin.settings.instrumentType,
            async (updatedList) => {
                this.plugin.settings.instrumentType = updatedList;
                await this.plugin.saveSettings();
            }
        );
    }

    private createProcessSettings(containerEl: HTMLElement): void {
        containerEl.createEl("h3", { text: "Process Settings" });

        // Process Types
        this.createEditableList(
            containerEl,
            "Process Types",
            this.plugin.settings.process,
            async (updatedList) => {
                this.plugin.settings.process = updatedList;
                await this.plugin.saveSettings();
            }
        );
    }

    private createSampleSettings(containerEl: HTMLElement): void {
        containerEl.createEl("h3", { text: "Sample Settings" });

        // Sample Types
        this.createEditableList(
            containerEl,
            "Sample Types",
            this.plugin.settings.sampleType,
            async (updatedList) => {
                this.plugin.settings.sampleType = updatedList;
                await this.plugin.saveSettings();
            }
        );
    }

    private createAnalysisSettings(containerEl: HTMLElement): void {
        containerEl.createEl("h3", { text: "Analysis Settings" });

        // Analysis Status
        this.createEditableList(
            containerEl,
            "Analysis Status",
            this.plugin.settings.analysisStatus,
            async (updatedList) => {
                this.plugin.settings.analysisStatus = updatedList;
                await this.plugin.saveSettings();
            }
        );
    }

private createFolderSettings(containerEl: HTMLElement): void {
    containerEl.createEl("h3", { text: "Folder Settings" });

    const createFolderSetting = (
        name: string,
        description: string,
        settingKey: StringKeys<ELNSettings> // Only allow keys with string values
    ) => {
        new Setting(containerEl)
            .setName(name)
            .setDesc(description)
            .addText((text) =>
                text
                    .setPlaceholder("Enter folder name")
                    .setValue(this.plugin.settings[settingKey]) // Type-safe access
                    .onChange(async (value) => {
                        this.plugin.settings[settingKey] = value; // Type-safe assignment
                        await this.plugin.saveSettings();
                    })
            );
    };

    createFolderSetting("Chemical Folder", "Folder for chemicals.", "chemicalFolder");
    createFolderSetting("Device Folder", "Folder for devices.", "deviceFolder");
    createFolderSetting("Instrument Folder", "Folder for instruments.", "instrumentFolder");
    createFolderSetting("Process Folder", "Folder for processes.", "processFolder");
    createFolderSetting("Sample Folder", "Folder for samples.", "sampleFolder");
    createFolderSetting("Analysis Folder", "Folder for analysis.", "analysisFolder");
}

    /**
     * Creates an editable list for a setting.
     * @param containerEl The container element.
     * @param title The title of the setting.
     * @param items The initial list of items.
     * @param onSave A callback to save the updated list.
     * @param mapToObject Optional function to map strings back to objects.
     */
    private createEditableList(
        containerEl: HTMLElement,
        title: string,
        items: any[],
        onSave: (updatedList: any[]) => Promise<void>
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
                            value: value.join(", "), // Join the array into a comma-separated string
                            placeholder: key.charAt(0).toUpperCase() + key.slice(1),
                        });
                        input.addEventListener("blur", async () => {
                            item[key] = input.value
                                .split(",") // Split the input into an array
                                .map((v) => v.trim()) // Trim whitespace from each value
                                .filter((v) => v); // Remove empty strings
                            await onSave(items);
                        });
                    } else {
                        // Handle single-value fields (e.g., "name" or "class")
                        const input = itemEl.createEl("input", {
                            type: "text",
                            value: value || "",
                            placeholder: key.charAt(0).toUpperCase() + key.slice(1),
                        });
                        input.addEventListener("blur", async () => {
                            item[key] = input.value.trim(); // Update the value
                            await onSave(items);
                        });
                    }
                });
            } else {
                // Handle simple string items
                const input = itemEl.createEl("input", {
                    type: "text",
                    value: typeof item === "string" ? item : "",
                });
                input.addEventListener("blur", async () => {
                    items[index] = input.value.trim();
                    await onSave(items);
                });
            }

            // Add a remove button
            const removeButton = itemEl.createEl("button", { text: "Remove" });
            removeButton.addEventListener("click", async () => {
                items.splice(index, 1); // Remove the item from the list
                await onSave(items);
                this.display(); // Refresh the settings tab
            });
        });

        // Add a button to create new items
        const addButton = listEl.createEl("button", { text: "Add" });
        addButton.addEventListener("click", async () => {
            // Add a new empty object with the same keys as the first item
            const newItem = items.length > 0 ? Object.keys(items[0]).reduce((acc, key) => {
                acc[key] = Array.isArray(items[0][key]) ? [] : ""; // Default to empty array or string
                return acc;
            }, {} as Record<string, any>) : {};
            items.push(newItem);
            await onSave(items);
            this.display(); // Refresh the settings tab
        });
    }
}