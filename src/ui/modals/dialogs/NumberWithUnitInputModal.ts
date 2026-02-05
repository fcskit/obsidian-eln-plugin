import { Modal, App, Setting, TextComponent, ButtonComponent, Menu } from "obsidian";
import { createLogger } from "../../../utils/Logger";
import { SCIENTIFIC_UNITS, ScientificProperty } from "../../../data/scientific-units";

const logger = createLogger('modal');

interface NumberWithUnitResult {
    value: number;
    unit: string;
}

interface NumberWithUnitInputModalOptions {
    title: string;
    label: string;
    initialValue?: number;
    initialUnit?: string;
    placeholder?: string;
    onSubmit: (result: NumberWithUnitResult) => void;
}

export class NumberWithUnitInputModal extends Modal {
    private options: NumberWithUnitInputModalOptions;
    private valueInput?: TextComponent;
    private unitInput?: TextComponent;
    private unitDropdown?: HTMLSelectElement;
    private unitButton?: ButtonComponent;
    private unitSetting?: Setting;
    private currentValue: number;
    private currentUnit: string;
    private currentProperty?: { key: string; property: ScientificProperty; name?: string };
    private isCustomUnit: boolean = true; // Start with custom unit mode

    constructor(app: App, options: NumberWithUnitInputModalOptions) {
        super(app);
        this.options = options;
        this.currentValue = options.initialValue ?? 0;
        this.currentUnit = options.initialUnit ?? "";
        this.setTitle(options.title);
        
        // Add CSS class for styling
        this.containerEl.addClass("number-with-unit-modal");
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();

        // Add description
        contentEl.createEl("p", { 
            text: "Enter a numeric value with its unit:",
            cls: "setting-item-description"
        });

        // Value input setting
        new Setting(contentEl)
            .setName(this.options.label)
            .addText(text => {
                this.valueInput = text;
                text.setPlaceholder(this.options.placeholder || "Enter number...");
                text.setValue(this.currentValue.toString());
                text.onChange(value => {
                    const numericValue = parseFloat(value);
                    if (!isNaN(numericValue)) {
                        this.currentValue = numericValue;
                    }
                });
                // Focus on the value input when modal opens
                setTimeout(() => text.inputEl.focus(), 50);
            });

        // Unit selection setting with button + dynamic input
        this.unitSetting = new Setting(contentEl)
            .setName("Unit")
            .setDesc("Select from scientific categories or enter custom unit");

        // Create unit button for category selection - always visible
        this.unitSetting.addButton(button => {
            this.unitButton = button;
            button.setButtonText("Browse Units"); // Keep button text unchanged
            button.setTooltip("Choose from scientific unit categories");
            button.onClick((evt) => {
                this.showUnitCategoryMenu(evt);
            });
        });

        // Initialize with custom unit input
        this.createUnitInput();

        // Button container
        const buttonContainer = contentEl.createDiv({ cls: "modal-button-container" });
        buttonContainer.style.display = "flex";
        buttonContainer.style.justifyContent = "flex-end";
        buttonContainer.style.gap = "8px";
        buttonContainer.style.marginTop = "20px";

        // Cancel button
        const cancelButton = buttonContainer.createEl("button", { text: "Cancel" });
        cancelButton.addEventListener("click", () => {
            this.close();
        });

        // OK button  
        const okButton = buttonContainer.createEl("button", { text: "OK", cls: "mod-cta" });
        okButton.addEventListener("click", () => {
            this.handleSubmit();
        });

        // Handle Enter key in inputs
        const handleEnter = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.handleSubmit();
            }
        };

        this.valueInput?.inputEl.addEventListener("keydown", handleEnter);
        this.unitInput?.inputEl.addEventListener("keydown", handleEnter);
    }

    private handleSubmit(): void {
        try {
            // Validate inputs
            if (isNaN(this.currentValue)) {
                logger.warn("Invalid numeric value entered in NumberWithUnitInputModal");
                return;
            }

            if (!this.currentUnit.trim()) {
                logger.warn("Empty unit entered in NumberWithUnitInputModal");
                return;
            }

            const result: NumberWithUnitResult = {
                value: this.currentValue,
                unit: this.currentUnit.trim()
            };

            logger.debug("NumberWithUnitInputModal submitting:", result);
            this.options.onSubmit(result);
            this.close();
        } catch (error) {
            logger.error("Error in NumberWithUnitInputModal submit:", error);
        }
    }
    
    private createUnitInput(): void {
        if (!this.unitSetting) return;
        
        if (this.isCustomUnit) {
            // Create text input for custom units
            this.unitSetting.addText(text => {
                this.unitInput = text;
                text.setPlaceholder("Enter custom unit...");
                text.setValue(this.currentUnit);
                text.onChange(value => {
                    this.currentUnit = value;
                });
            });
        } else {
            // Create dropdown for predefined units
            this.unitSetting.addDropdown(dropdown => {
                this.unitDropdown = dropdown.selectEl;
                
                // Add units from current property
                if (this.currentProperty) {
                    this.currentProperty.property.units.forEach((unit, index) => {
                        const isDefault = unit === this.currentProperty!.property.defaultUnit;
                        const label = isDefault ? `${unit} (default)` : unit;
                        dropdown.addOption(unit, label);
                        
                        // Select the current unit or default
                        if (unit === this.currentUnit || (index === 0 && !this.currentUnit)) {
                            dropdown.setValue(unit);
                            this.currentUnit = unit;
                        }
                    });
                    
                    // Add custom option
                    dropdown.addOption("__CUSTOM__", "Custom unit...");
                }
                
                dropdown.onChange(value => {
                    if (value === "__CUSTOM__") {
                        this.switchToCustomUnit();
                    } else {
                        this.currentUnit = value;
                    }
                });
            });
        }
    }
    
    private switchToCustomUnit(): void {
        this.isCustomUnit = true;
        this.currentProperty = undefined;
        
        // Clear the current unit input/dropdown
        this.clearUnitInput();
        
        // Recreate as text input
        this.createUnitInput();
    }
    
    private switchToPropertyUnits(propertyData: { key: string; property: ScientificProperty; name?: string }): void {
        this.isCustomUnit = false;
        this.currentProperty = propertyData;
        
        // Set current unit to default if not already set to one of the property's units
        if (!propertyData.property.units.includes(this.currentUnit)) {
            this.currentUnit = propertyData.property.defaultUnit;
        }
        
        // Clear the current unit input/dropdown
        this.clearUnitInput();
        
        // Recreate as dropdown
        this.createUnitInput();
    }
    
    private clearUnitInput(): void {
        if (this.unitInput) {
            this.unitInput.inputEl.remove();
            this.unitInput = undefined;
        }
        if (this.unitDropdown) {
            this.unitDropdown.remove();
            this.unitDropdown = undefined;
        }
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }

    private showUnitCategoryMenu(evt: MouseEvent): void {
        const menu = new Menu();
        
        // Add "Custom Unit" option at the top
        menu.addItem((customItem) => {
            customItem.setTitle("Custom Unit")
                .setIcon("edit")
                .onClick(() => {
                    this.switchToCustomUnit();
                });
        });
        
        menu.addSeparator();
        
        // Build hierarchical structure from properties with menuPath
        const menuStructure = this.buildMenuStructure();
        
        // Add each top-level menu item
        Object.keys(menuStructure).sort().forEach(topLevelPath => {
            menu.addItem((topItem) => {
                topItem.setTitle(topLevelPath)
                    .setIcon(this.getCategoryIcon(topLevelPath.toLowerCase()));
                
                // Use setSubmenu for nested structure
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const submenu = (topItem as any).setSubmenu();
                
                // Add second-level items
                Object.keys(menuStructure[topLevelPath]).sort().forEach(secondLevelPath => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    submenu.addItem((secondItem: any) => {
                        secondItem.setTitle(secondLevelPath)
                            .setIcon(this.getCategoryIcon(secondLevelPath.toLowerCase()));
                        
                        // Use setSubmenu for properties
                        const propertiesSubmenu = secondItem.setSubmenu();
                        
                        // Add properties at this level
                        menuStructure[topLevelPath][secondLevelPath].forEach(property => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            propertiesSubmenu.addItem((propItem: any) => {
                                propItem.setTitle(property.name || this.capitalizeFirst(property.key))
                                    .setIcon("ruler")
                                    .onClick(() => {
                                        this.showUnitsForProperty(property);
                                    });
                            });
                        });
                    });
                });
            });
        });

        // Show the menu at the button position
        menu.showAtMouseEvent(evt);
    }
    
    private buildMenuStructure(): { [topLevel: string]: { [secondLevel: string]: Array<{ key: string; property: ScientificProperty; name?: string }> } } {
        const structure: { [topLevel: string]: { [secondLevel: string]: Array<{ key: string; property: ScientificProperty; name?: string }> } } = {};
        
        Object.entries(SCIENTIFIC_UNITS).forEach(([propertyKey, property]) => {
            let topLevel: string;
            let secondLevel: string;
            
            if (property.menuPath) {
                // Use menuPath for structured organization
                const pathParts = property.menuPath.split('.');
                topLevel = pathParts[0] || 'General';
                secondLevel = pathParts[1] || 'Properties';
            } else {
                // Fallback to category-based organization
                topLevel = this.capitalizeFirst(property.category[0] || 'General');
                secondLevel = property.category[1] ? this.capitalizeFirst(property.category[1]) : 'Properties';
            }
            
            // Initialize structure
            if (!structure[topLevel]) {
                structure[topLevel] = {};
            }
            if (!structure[topLevel][secondLevel]) {
                structure[topLevel][secondLevel] = [];
            }
            
            // Add property
            structure[topLevel][secondLevel].push({
                key: propertyKey,
                property: property,
                name: property.name
            });
        });
        
        return structure;
    }
    
    private showUnitsForProperty(propertyData: { key: string; property: ScientificProperty; name?: string }): void {
        // Switch to property units mode (dropdown)
        this.switchToPropertyUnits(propertyData);
    }

    private capitalizeFirst(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    private getCategoryIcon(categoryName: string): string {
        const iconMap: Record<string, string> = {
            'physical': 'ruler',
            'chemical': 'flask',
            'thermal': 'thermometer',
            'electrical': 'zap',
            'optical': 'eye',
            'mechanical': 'cog',
            'temporal': 'clock',
            'nuclear': 'atom',
            'magnetic': 'magnet',
            'fluid': 'droplet',
            'kinetic': 'activity',
            'gravimetric': 'scale',
            'dimensional': 'maximize-2',
            'molecular': 'hexagon',
            'solution': 'beaker',
            'equilibrium': 'balance-scale',
            'counting': 'hash',
            'electromagnetic': 'radio',
            'radioactive': 'radiation',
            'acoustic': 'volume-2',
            'spectroscopy': 'spectrum',
            'material': 'cube'
        };
        return iconMap[categoryName] || 'folder';
    }
}