import { ButtonComponent, DropdownComponent } from "obsidian";
import { DropdownResizer } from "../../../../utils/dropdown-resizer";
import type { App } from "obsidian";
import { createEditableDiv, getEditableDivValue, setEditableDivValue } from "./createEditableDiv";
import type { MetaDataTemplateFieldProcessed } from "../../../../types/templates";

export interface EnhancedInputOptions {
    container: HTMLElement;
    field: MetaDataTemplateFieldProcessed;
    initialValue: string;
    initialKey?: string; // For editable keys
    onValueChange?: (value: string) => void;
    onKeyChange?: (oldKey: string, newKey: string) => void;
    onRemove?: () => void;
    onTypeChange?: (newType: string) => void;
    app?: App; // For type switching functionality
    showKeyEditor?: boolean; // Whether to show the key editor (default: uses field.editableKey)
}

/**
 * Creates an enhanced input component that supports editable keys, units, type switching, and removal
 * This component can be used both for simple inputs and as building blocks for object lists
 */
export function createEnhancedInput(options: EnhancedInputOptions): HTMLElement {
    const {
        container,
        field,
        initialValue,
        initialKey = "",
        onValueChange,
        onKeyChange,
        onRemove,
        onTypeChange,
        app,
        showKeyEditor = field.editableKey
    } = options;

    // Create main wrapper
    const wrapper = container.createDiv({ cls: "npe-enhanced-input-wrapper" });

    // Create key section (if editable)
    let keyElement: HTMLElement | null = null;
    if (showKeyEditor && initialKey) {
        const keySection = wrapper.createDiv({ cls: "npe-enhanced-input-key-section" });
        
        if (field.editableKey) {
            keyElement = createEditableDiv(
                keySection,
                initialKey,
                "Enter key name...",
                "text",
                (newKey) => {
                    if (onKeyChange && newKey !== initialKey) {
                        onKeyChange(initialKey, newKey);
                    }
                }
            );
            keyElement.addClass("npe-enhanced-input-key-editable");
        } else {
            keyElement = keySection.createDiv({ 
                cls: "npe-enhanced-input-key-static",
                text: initialKey 
            });
        }
    }

    // Create value section
    const valueSection = wrapper.createDiv({ cls: "npe-enhanced-input-value-section" });

    // Create the input element based on type
    let inputElement: HTMLElement;
    const inputType = field.inputType || "text";

    if (inputType === "text" || inputType === "number") {
        inputElement = createEditableDiv(
            valueSection,
            initialValue,
            `Enter ${inputType}...`,
            inputType,
            onValueChange
        );
    } else if (inputType === "date") {
        inputElement = valueSection.createEl("input", {
            type: "date",
            value: initialValue
        });
        inputElement.addEventListener("change", () => {
            if (onValueChange) {
                onValueChange((inputElement as HTMLInputElement).value);
            }
        });
    } else if (inputType === "dropdown" && field.options) {
        inputElement = valueSection.createDiv();
        const dropdown = new DropdownComponent(inputElement);
        
        // Set up options
        const options = Array.isArray(field.options) ? field.options : [field.options];
        const optionsMap = Object.fromEntries(options.map(opt => [opt, opt]));
        dropdown.addOptions(optionsMap);
        dropdown.setValue(initialValue);
        dropdown.onChange(onValueChange || (() => {}));
        
        // Set up dynamic resizing directly on the dropdown
        DropdownResizer.setupDropdown(dropdown.selectEl, false);
    } else {
        // Fallback to simple editable div
        inputElement = createEditableDiv(
            valueSection,
            initialValue,
            "Enter value...",
            "text",
            onValueChange
        );
    }

    // Create unit section (if applicable)
    if (field.units) {
        const unitSection = wrapper.createDiv({ cls: "npe-enhanced-input-unit-section" });
        
        if (field.editableUnit && Array.isArray(field.units)) {
            // Editable unit dropdown
            const unitDropdown = new DropdownComponent(unitSection);
            
            // Add resizing classes for dynamic width - this is a unit dropdown
            unitDropdown.selectEl.addClass("resizing-dropdown", "unit-dropdown");
            
            const unitOptions = Object.fromEntries(field.units.map(unit => [unit, unit]));
            unitDropdown.addOptions(unitOptions);
            unitDropdown.setValue(field.defaultUnit || field.units[0]);
            unitDropdown.onChange((value) => {
                // Handle unit change if needed
                wrapper.setAttribute("data-unit", value);
            });
            
            // Set up dynamic resizing directly on the unit dropdown (with unit flag = true)
            DropdownResizer.setupDropdown(unitDropdown.selectEl, true);
        } else {
            // Static unit display
            unitSection.createDiv({ 
                cls: "npe-enhanced-input-unit-static",
                text: field.defaultUnit || (Array.isArray(field.units) ? field.units[0] : field.units)
            });
        }
    }

    // Create controls section
    const controlsSection = wrapper.createDiv({ cls: "npe-enhanced-input-controls" });

    // Type switch button (if allowed)
    if (field.allowTypeSwitch && app) {
        const typeButton = new ButtonComponent(controlsSection);
        typeButton.setIcon("type");
        typeButton.setTooltip("Change input type");
        typeButton.onClick(() => {
            showTypeMenu(typeButton.buttonEl, field, onTypeChange);
        });
    }

    // Remove button (if allowed)
    if (field.removeable) {
        const removeButton = new ButtonComponent(controlsSection);
        removeButton.setIcon("trash");
        removeButton.setTooltip("Remove this field");
        removeButton.onClick(() => {
            if (onRemove) {
                onRemove();
            }
        });
    }

    return wrapper;
}

/**
 * Shows a type switching menu
 */
function showTypeMenu(
    buttonEl: HTMLElement, 
    field: MetaDataTemplateFieldProcessed, 
    onTypeChange?: (newType: string) => void
) {
    // This would open a context menu with type options
    // For now, let's implement a simple approach
    const availableTypes = ["text", "number", "date", "dropdown"];
    
    // Create a simple menu
    const menu = document.createElement("div");
    menu.className = "npe-enhanced-input-type-menu";
    menu.style.cssText = `
        position: absolute;
        background: var(--background-primary);
        border: 1px solid var(--background-modifier-border);
        border-radius: var(--radius-s);
        padding: 4px;
        z-index: 1000;
        box-shadow: var(--shadow-s);
    `;

    availableTypes.forEach(type => {
        const item = menu.createDiv({
            cls: "npe-enhanced-input-type-menu-item",
            text: type.charAt(0).toUpperCase() + type.slice(1)
        });
        item.style.cssText = `
            padding: 4px 8px;
            cursor: pointer;
            border-radius: var(--radius-s);
        `;
        item.addEventListener("click", () => {
            if (onTypeChange) {
                onTypeChange(type);
            }
            menu.remove();
        });
        item.addEventListener("mouseenter", () => {
            item.style.backgroundColor = "var(--background-modifier-hover)";
        });
        item.addEventListener("mouseleave", () => {
            item.style.backgroundColor = "transparent";
        });
    });

    // Position the menu
    const rect = buttonEl.getBoundingClientRect();
    menu.style.left = rect.left + "px";
    menu.style.top = (rect.bottom + 2) + "px";

    document.body.appendChild(menu);

    // Remove menu when clicking outside
    const removeMenu = (e: MouseEvent) => {
        if (!menu.contains(e.target as Node)) {
            menu.remove();
            document.removeEventListener("click", removeMenu);
        }
    };
    setTimeout(() => document.addEventListener("click", removeMenu), 0);
}

/**
 * Gets the current value from an enhanced input
 */
export function getEnhancedInputValue(wrapper: HTMLElement): string {
    const editableDiv = wrapper.querySelector(".npe-editable-div") as HTMLElement;
    const dateInput = wrapper.querySelector('input[type="date"]') as HTMLInputElement;
    const dropdown = wrapper.querySelector(".dropdown") as HTMLSelectElement;

    if (editableDiv) {
        return getEditableDivValue(editableDiv);
    } else if (dateInput) {
        return dateInput.value;
    } else if (dropdown) {
        return dropdown.value;
    }
    
    return "";
}

/**
 * Sets the value of an enhanced input
 */
export function setEnhancedInputValue(wrapper: HTMLElement, value: string): void {
    const editableDiv = wrapper.querySelector(".npe-editable-div") as HTMLElement;
    const dateInput = wrapper.querySelector('input[type="date"]') as HTMLInputElement;
    const dropdown = wrapper.querySelector(".dropdown") as HTMLSelectElement;

    if (editableDiv) {
        setEditableDivValue(editableDiv, value);
    } else if (dateInput) {
        dateInput.value = value;
    } else if (dropdown) {
        dropdown.value = value;
    }
}
