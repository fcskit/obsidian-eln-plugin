import { LabeledInputBase, LabeledInputBaseOptions } from "./LabeledInputBase";
import { ToggleComponent, ButtonComponent, DropdownComponent } from "obsidian";
import { DropdownResizer } from "../../../utils/dropdown-resizer";
import { createEditableDiv, getEditableDivValue } from "../../renderer/npe/elements/createEditableDiv";

// Supported primitive types
export type PrimitiveType = "text" | "number" | "number with unit" | "boolean" | "date" | "list (string)" | "list (number)" | "list (boolean)" | "list (date)";

export type PrimitiveValue = string | number | boolean | Date | string[] | number[] | boolean[] | Date[] | { value: number; unit: string };

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
    private currentKey: string; // Track the current key to handle key changes

    constructor(options: LabeledPrimitiveInputOptions) {
        super(options);
        this.type = options.type;
        this.value = options.defaultValue ?? this.getDefaultValueForType(this.type);
        this.units = options.units;
        this.onValueChange = options.onValueChange;
        this._onRemove = options.onRemove;
        this.currentKey = options.label; // Initialize with the original label

        // Add type switch button if allowed
        if (options.allowTypeSwitch) {
            const controlsSection = this.controlsSection ?? this.wrapper.createDiv({ cls: "eln-modal-enhanced-input-controls" });
            const typeButton = new ButtonComponent(controlsSection);
            typeButton.setIcon("type");
            typeButton.setTooltip("Change input type");
            typeButton.buttonEl.addClass("eln-modal-enhanced-input-type-button");
            typeButton.onClick(() => {
                this.showTypeMenu(typeButton.buttonEl, (type) => this.setType(type as PrimitiveType, this.units));
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
                createEditableDiv(
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
                // Use this.value (which has the proper default) instead of options.defaultValue
                toggle.setValue(typeof this.value === "boolean" ? this.value : false);
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
                // Use this.value if it's a Date, otherwise use current date as default
                if (this.value instanceof Date) {
                    input.value = this.value.toISOString().slice(0, 10);
                } else if (typeof this.value === "string" && this.value) {
                    input.value = this.value;
                } else {
                    // For new date type switches, use today's date
                    input.value = new Date().toISOString().slice(0, 10);
                }
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
                    "text",
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
            case "list (boolean)": {
                const multiline = options.multiline ?? false;
                const input = createEditableDiv(
                    this.valueSection,
                    Array.isArray(this.value) ? this.value.map(v => String(v)).join(", ") : "",
                    options.placeholder ?? "Comma-separated true/false values",
                    "text",
                    (value) => {
                        try {
                            const arr = value.split(",").map(s => {
                                const trimmed = s.trim().toLowerCase();
                                return trimmed === "true" || trimmed === "1" || trimmed === "yes";
                            });
                            this.value = arr;
                            this.onValueChange?.(arr);
                        } catch (error) {
                            console.error(`Error in onValueChange for list (boolean) input:`, error);
                            const arr = value.split(",").map(s => {
                                const trimmed = s.trim().toLowerCase();
                                return trimmed === "true" || trimmed === "1" || trimmed === "yes";
                            });
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
            case "list (date)": {
                const multiline = options.multiline ?? false;
                const input = createEditableDiv(
                    this.valueSection,
                    Array.isArray(this.value) ? this.value.map(v => v instanceof Date ? v.toISOString().split('T')[0] : String(v)).join(", ") : "",
                    options.placeholder ?? "Comma-separated dates (YYYY-MM-DD)",
                    "text",
                    (value) => {
                        try {
                            const arr = value.split(",").map(s => {
                                const trimmed = s.trim();
                                const date = new Date(trimmed);
                                return isNaN(date.getTime()) ? new Date() : date;
                            });
                            this.value = arr;
                            this.onValueChange?.(arr);
                        } catch (error) {
                            console.error(`Error in onValueChange for list (date) input:`, error);
                            const arr = value.split(",").map(s => {
                                const trimmed = s.trim();
                                const date = new Date(trimmed);
                                return isNaN(date.getTime()) ? new Date() : date;
                            });
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
        
        // Trigger the value change callback with the new default value
        // This ensures the parent object gets updated with the proper default
        this.onValueChange?.(this.value);
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

    /**
     * Update the current key when it changes externally
     */
    updateKey(newKey: string): void {
        this.currentKey = newKey;
        this.label = newKey;
    }

    /**
     * Get the current key (which may have been changed)
     */
    getCurrentKey(): string {
        return this.currentKey;
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
            case "list (boolean)": return [];
            case "list (date)": return [];
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
}
