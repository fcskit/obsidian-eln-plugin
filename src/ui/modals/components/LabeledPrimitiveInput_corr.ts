import { LabeledInputBase, LabeledInputBaseOptions } from "./LabeledInputBase";
import { ToggleComponent, ButtonComponent, DropdownComponent } from "obsidian";
import { DropdownResizer } from "../../../utils/dropdown-resizer";
import { createEditableDiv, getEditableDivValue } from "../../renderer/npe/elements/createEditableDiv";

// Supported primitive types
export type PrimitiveType = "text" | "number" | "number with unit" | "boolean" | "date" | "list (string)" | "list (number)";

export type PrimitiveValue = string | number | boolean | Date | string[] | number[] | { value: number; unit: string };

export interface LabeledPrimitiveInputOptions extends LabeledInputBaseOptions<PrimitiveValue> {
    type: PrimitiveType;
    units?: string[]; // For "number with unit"
    onValueChange?: (value: PrimitiveValue) => void;
    multiline?: boolean; // For text type, render textarea if true
}

export class LabeledPrimitiveInput extends LabeledInputBase<PrimitiveValue> {
    private type: PrimitiveType;
    private value: PrimitiveValue;
    private units?: string[];
    private onValueChange?: (value: PrimitiveValue) => void;
    private typeDropdownButton?: ButtonComponent;
    private _onRemove?: (() => void);

    constructor(options: LabeledPrimitiveInputOptions) {
        super(options);
        this.type = options.type;
        this.value = options.defaultValue ?? this.getDefaultValueForType(this.type);
        this.units = options.units;
        this.onValueChange = options.onValueChange;
        this._onRemove = options.onRemove;

        // Add type switch button if allowed
        if (options.allowTypeSwitch) {
            const controlsSection = this.controlsSection ?? this.wrapper.createDiv({ cls: "eln-modal-enhanced-input-controls" });
            const typeButton = new ButtonComponent(controlsSection);
            typeButton.setIcon("type");
            typeButton.setTooltip("Change input type");
            typeButton.buttonEl.addClass("eln-modal-enhanced-input-type-button");
            typeButton.onClick(() => {
                this.displayTypeMenu(typeButton.buttonEl, (type) => this.setType(type as PrimitiveType, this.units));
            });
            this.typeDropdownButton = typeButton;
        }

        this.createValueEditor(options);
    }

    protected createValueEditor(options: LabeledPrimitiveInputOptions): void {
        this.valueSection.empty();
        switch (this.type) {
            case "text": {
                const multiline = options.multiline ?? false;
                if (multiline) {
                    this.wrapper.addClass("eln-modal-enhanced-input-multiline");
                } else {
                    this.wrapper.removeClass("eln-modal-enhanced-input-multiline");
                }
                const input = createEditableDiv(
                    this.valueSection,
                    typeof this.value === "string" ? this.value : "",
                    options.placeholder || `Enter ${options.label?.toLowerCase() ?? "text"}...`,
                    "text",
                    (value) => {
                        this.value = value;
                        this.onValueChange?.(value);
                    }
                );
                if (multiline) {
                    input.addClass("eln-modal-editable-div-multiline");
                }
                break;
            }
            case "number": {
                const input = createEditableDiv(
                    this.valueSection,
                    typeof this.value === "number" ? this.value.toString() : (typeof this.value === "object" && this.value && "value" in this.value ? String(this.value.value) : ""),
                    options.placeholder || `Enter ${options.label?.toLowerCase() ?? "number"}...`,
                    "number",
                    (value) => {
                        const numericValue = parseFloat(value);
                        if (!isNaN(numericValue)) {
                            this.value = numericValue;
                            this.onValueChange?.(numericValue);
                        }
                    }
                );
                break;
            }
            case "number with unit": {
                const input = createEditableDiv(
                    this.valueSection,
                    typeof this.value === "object" && this.value && "value" in this.value ? String(this.value.value) : "",
                    options.placeholder || `Enter ${options.label?.toLowerCase() ?? "number"}...`,
                    "number",
                    (value) => {
                        const numericValue = parseFloat(value);
                        if (!isNaN(numericValue)) {
                            this.value = { value: numericValue, unit: unitDropdown?.getValue() ?? (this.units?.[0] ?? "") };
                            this.onValueChange?.(this.value);
                        }
                    }
                );
                let unitDropdown: DropdownComponent | undefined;
                if (this.units && this.units.length > 0) {
                    if (this.units.length > 1) {
                        unitDropdown = new DropdownComponent(this.valueSection);
                        unitDropdown.selectEl.addClass("resizing-dropdown", "unit-dropdown");
                        unitDropdown.addOptions(Object.fromEntries(this.units.map((unit) => [unit, unit])));
                        unitDropdown.setValue((typeof this.value === "object" && this.value && "unit" in this.value && this.value.unit) || this.units[0]);
                        unitDropdown.onChange((unit) => {
                            const numericValue = parseFloat(getEditableDivValue(input));
                            if (!isNaN(numericValue)) {
                                this.value = { value: numericValue, unit };
                                this.onValueChange?.(this.value);
                            }
                        });
                        DropdownResizer.setupDropdown(unitDropdown.selectEl, true);
                    } else {
                        this.valueSection.createEl("span", { cls: "eln-unit", text: this.units[0] });
                    }
                }
                break;
            }
            case "boolean": {
                const toggle = new ToggleComponent(this.valueSection);
                toggle.setValue(typeof options.defaultValue === "boolean" ? options.defaultValue : !!this.value);
                toggle.onChange((value: boolean) => {
                    try {
                        this.value = value;
                        this.onValueChange?.(value);
                    } catch (error) {
                        console.error(`Error in onValueChange for boolean input:`, error);
                        this.onValueChange?.(value);
                    }
                });
                break;
            }
            case "date": {
                const input = this.valueSection.createEl("input");
                input.type = "date";
                input.value = typeof options.defaultValue === "string" ? options.defaultValue : (this.value instanceof Date ? this.value.toISOString().slice(0, 10) : "");
                input.addEventListener("input", (event: Event) => {
                    const value = (event.target as HTMLInputElement).value;
                    try {
                        this.value = value;
                        this.onValueChange?.(value);
                    } catch (error) {
                        console.error(`Error in onValueChange for date input:`, error);
                        this.onValueChange?.(value);
                    }
                });
                break;
            }
            case "list (string)": {
                const multiline = options.multiline ?? false;
                const input = createEditableDiv(
                    this.valueSection,
                    Array.isArray(this.value) ? this.value.join(", ") : "",
                    options.placeholder ?? "Comma-separated",
                    "text",
                    (value) => {
                        try {
                            const arr = value.split(",").map(s => s.trim()).filter(Boolean);
                            this.value = arr;
                            this.onValueChange?.(arr);
                        } catch (error) {
                            console.error(`Error in onValueChange for list (string) input:`, error);
                            const arr = value.split(",").map(s => s.trim()).filter(Boolean);
                            this.value = arr;
                            this.onValueChange?.(arr);
                        }
                    }
                );
                if (multiline) {
                    input.addClass("eln-modal-editable-div-multiline");
                    input.addEventListener("keydown", (e) => {
                        if (e.key === "Enter") {
                            e.stopPropagation();
                        }
                    });
                }
                break;
            }
            case "list (number)": {
                const multiline = options.multiline ?? false;
                const input = createEditableDiv(
                    this.valueSection,
                    Array.isArray(this.value) ? this.value.join(", ") : "",
                    options.placeholder ?? "Comma-separated numbers",
                    "number",
                    (value) => {
                        try {
                            const arr = value.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n));
                            this.value = arr;
                            this.onValueChange?.(arr);
                        } catch (error) {
                            console.error(`Error in onValueChange for list (number) input:`, error);
                            const arr = value.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n));
                            this.value = arr;
                            this.onValueChange?.(arr);
                        }
                    }
                );
                if (multiline) {
                    input.addClass("eln-modal-editable-div-multiline");
                    input.addEventListener("keydown", (e) => {
                        if (e.key === "Enter") {
                            e.stopPropagation();
                        }
                    });
                }
                break;
            }
        }
    }

    setType(newType: PrimitiveType, units?: string[]): void {
        this.type = newType;
        this.units = units;
        this.value = this.getDefaultValueForType(newType);
        this.createValueEditor({ ...this.getBaseOptions(), type: newType, units });
    }

    getType(): PrimitiveType {
        return this.type;
    }

    getValue(): PrimitiveValue {
        return this.value;
    }

    setValue(val: PrimitiveValue): void {
        this.value = val;
        this.createValueEditor({ ...this.getBaseOptions(), type: this.type, units: this.units });
    }

    private getDefaultValueForType(type: PrimitiveType): PrimitiveValue {
        switch (type) {
            case "text": return "";
            case "number": return 0;
            case "number with unit": return { value: 0, unit: this.units?.[0] ?? "" };
            case "boolean": return false;
            case "date": return new Date();
            case "list (string)": return [];
            case "list (number)": return [];
        }
    }

    private getBaseOptions(): LabeledPrimitiveInputOptions {
        return {
            container: this.wrapper.parentElement!,
            label: this.label,
            defaultValue: this.value,
            placeholder: undefined,
            editableKey: !!this.keyElement,
            allowTypeSwitch: !!this.typeDropdownButton,
            onTypeChange: (type) => this.setType(type as PrimitiveType, this.units),
            removeable: !!this.removeButton,
            onRemove: this._onRemove,
            type: this.type,
            units: this.units,
            onValueChange: this.onValueChange,
        };
    }

    private displayTypeMenu(buttonEl: HTMLElement, onTypeChange: (newType: string) => void): void {
        const availableTypes = [
            "text", "number", "number with unit", "boolean", "date", "list (string)", "list (number)"
        ];
        const menu = document.createElement("div");
        menu.className = "eln-modal-enhanced-input-type-menu";
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
                cls: "eln-modal-enhanced-input-type-menu-item",
                text: type.charAt(0).toUpperCase() + type.slice(1)
            });
            item.style.cssText = `
                padding: 4px 8px;
                cursor: pointer;
                border-radius: var(--radius-s);
            `;
            item.addEventListener("click", () => {
                try {
                    onTypeChange(type);
                } catch (error) {
                    console.error(`Error in onTypeChange:`, error);
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
        const rect = buttonEl.getBoundingClientRect();
        menu.style.left = rect.left + "px";
        menu.style.top = (rect.bottom + 2) + "px";
        document.body.appendChild(menu);
        const removeMenu = (e: MouseEvent) => {
            if (!menu.contains(e.target as Node)) {
                menu.remove();
                document.removeEventListener("click", removeMenu);
            }
        };
        setTimeout(() => document.addEventListener("click", removeMenu), 0);
    }
}
