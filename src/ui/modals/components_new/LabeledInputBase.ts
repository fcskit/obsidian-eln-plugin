import { ButtonComponent, Menu } from "obsidian";
import { createEditableDiv, getEditableDivValue, setEditableDivValue } from "../../renderer/npe/elements/createEditableDiv";

export interface LabeledInputBaseOptions<T> {
    container: HTMLElement;
    label: string;
    defaultValue?: T;
    placeholder?: string;
    editableKey?: boolean;
    onKeyChange?: (oldKey: string, newKey: string) => void;
    allowTypeSwitch?: boolean;
    onTypeChange?: (newType: string) => void;
    removeable?: boolean;
    onRemove?: () => void;
}

export abstract class LabeledInputBase<T> {
    protected wrapper: HTMLElement;
    protected keyElement?: HTMLElement;
    protected typeDropdown?: ButtonComponent;
    protected removeButton?: ButtonComponent;
    protected controlsSection?: HTMLElement;
    protected valueSection: HTMLElement;
    protected label: string;

    constructor(options: LabeledInputBaseOptions<T>) {
        const {
            container,
            label,
            editableKey = false,
            onKeyChange,
            allowTypeSwitch = false,
            onTypeChange,
            removeable = false,
            onRemove,
        } = options;

        this.label = label;
        this.wrapper = container.createDiv({ cls: "eln-modal-enhanced-input-wrapper" });

        // Key section
        const keySection = this.wrapper.createDiv({ cls: "eln-modal-enhanced-input-key-section" });
        if (editableKey && onKeyChange) {
            this.keyElement = createEditableDiv(
                keySection,
                label,
                "Enter key name...",
                "text",
                (newKey) => {
                    try {
                        onKeyChange(label, newKey);
                    } catch (error) {
                        console.error(`Error in onKeyChange:`, error);
                    }
                }
            );
            this.keyElement.addClass("eln-modal-enhanced-input-key-editable");
        } else {
            keySection.createDiv({
                cls: "eln-modal-enhanced-input-key-static",
                text: label
            });
        }

        // Value section (to be filled by subclass)
        this.valueSection = this.wrapper.createDiv({ cls: "eln-modal-enhanced-input-value-section" });

        // Controls section
        if (allowTypeSwitch || removeable) {
            this.controlsSection = this.wrapper.createDiv({ cls: "eln-modal-enhanced-input-controls" });
        }

        // Type switch
        if (allowTypeSwitch && onTypeChange && this.controlsSection) {
            const typeButton = new ButtonComponent(this.controlsSection);
            typeButton.setIcon("type");
            typeButton.setTooltip("Change input type");
            typeButton.buttonEl.addClass("eln-modal-enhanced-input-type-button");
            typeButton.onClick(() => {
                this.showTypeMenu(typeButton.buttonEl, onTypeChange);
            });
            this.typeDropdown = typeButton;
        }

        // Remove button
        if (removeable && onRemove && this.controlsSection) {
            this.removeButton = new ButtonComponent(this.controlsSection);
            this.removeButton.setIcon("trash");
            this.removeButton.setTooltip("Remove field");
            this.removeButton.buttonEl.addClass("eln-modal-enhanced-input-remove-button");
            this.removeButton.onClick(() => {
                try {
                    onRemove();
                } catch (error) {
                    console.error(`Error in onRemove:`, error);
                }
            });
        }
    }

    // Abstract: subclasses must implement value editor
    protected abstract createValueEditor(options: LabeledInputBaseOptions<T>): void;

    // Key methods
    setKey(newKey: string): void {
        if (this.keyElement) setEditableDivValue(this.keyElement, newKey);
    }
    getKey(): string {
        if (this.keyElement) return getEditableDivValue(this.keyElement);
        const staticKeyElement = this.wrapper.querySelector(".eln-modal-enhanced-input-key-static");
        return staticKeyElement?.textContent || "";
    }

    // Wrapper getter
    getWrapper(): HTMLElement {
        return this.wrapper;
    }

    // Controls
    getTypeDropdown(): ButtonComponent | undefined {
        return this.typeDropdown;
    }
    getRemoveButton(): ButtonComponent | undefined {
        return this.removeButton;
    }

    // Type menu
    protected showTypeMenu(buttonEl: HTMLElement, onTypeChange: (newType: string) => void): void {
        const menu = new Menu();
        
        // Basic types
        menu.addItem((item) => {
            item.setTitle("Text")
                .setIcon("type")
                .onClick(() => {
                    try {
                        onTypeChange("text");
                    } catch (error) {
                        console.error(`Error in onTypeChange:`, error);
                    }
                });
        });
        
        menu.addItem((item) => {
            item.setTitle("Number")
                .setIcon("hash")
                .onClick(() => {
                    try {
                        onTypeChange("number");
                    } catch (error) {
                        console.error(`Error in onTypeChange:`, error);
                    }
                });
        });
        
        menu.addItem((item) => {
            item.setTitle("Number with unit")
                .setIcon("ruler")
                .onClick(() => {
                    try {
                        onTypeChange("number with unit");
                    } catch (error) {
                        console.error(`Error in onTypeChange:`, error);
                    }
                });
        });
        
        menu.addItem((item) => {
            item.setTitle("Boolean")
                .setIcon("toggle-right")
                .onClick(() => {
                    try {
                        onTypeChange("boolean");
                    } catch (error) {
                        console.error(`Error in onTypeChange:`, error);
                    }
                });
        });
        
        menu.addItem((item) => {
            item.setTitle("Date")
                .setIcon("calendar")
                .onClick(() => {
                    try {
                        onTypeChange("date");
                    } catch (error) {
                        console.error(`Error in onTypeChange:`, error);
                    }
                });
        });
        
        // Add list submenu item with proper submenu functionality
        menu.addItem((item) => {
            item.setTitle("List")
                .setIcon("list");
            
            // Use the undocumented setSubmenu() method for proper submenu behavior
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const listSubmenu = (item as any).setSubmenu();
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            listSubmenu.addItem((listItem: any) => {
                listItem.setTitle("String list")
                    .setIcon("type")
                    .onClick(() => {
                        try {
                            onTypeChange("list (string)");
                        } catch (error) {
                            console.error(`Error in onTypeChange:`, error);
                        }
                    });
            });
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            listSubmenu.addItem((listItem: any) => {
                listItem.setTitle("Number list")
                    .setIcon("hash")
                    .onClick(() => {
                        try {
                            onTypeChange("list (number)");
                        } catch (error) {
                            console.error(`Error in onTypeChange:`, error);
                        }
                    });
            });
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            listSubmenu.addItem((listItem: any) => {
                listItem.setTitle("Boolean list")
                    .setIcon("toggle-right")
                    .onClick(() => {
                        try {
                            onTypeChange("list (boolean)");
                        } catch (error) {
                            console.error(`Error in onTypeChange:`, error);
                        }
                    });
            });
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            listSubmenu.addItem((listItem: any) => {
                listItem.setTitle("Date list")
                    .setIcon("calendar")
                    .onClick(() => {
                        try {
                            onTypeChange("list (date)");
                        } catch (error) {
                            console.error(`Error in onTypeChange:`, error);
                        }
                    });
            });
        });
        
        // Show the main menu at the button position
        menu.showAtMouseEvent({ clientX: buttonEl.getBoundingClientRect().left, clientY: buttonEl.getBoundingClientRect().bottom + 2 } as MouseEvent);
    }
}
