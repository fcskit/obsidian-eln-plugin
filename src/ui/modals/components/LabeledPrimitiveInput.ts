import { LabeledInputBase, LabeledInputBaseOptions } from "./LabeledInputBase";
import { ToggleComponent, DropdownComponent, App } from "obsidian";
import { DropdownResizer } from "../../../utils/dropdown-resizer";
import { createEditableDiv, getEditableDivValue } from "../../renderer/npe/elements/createEditableDiv";
import { createLogger } from "../../../utils/Logger";
import { NumberWithUnitInputModal } from "../dialogs/NumberWithUnitInputModal";

const logger = createLogger('ui');

// Supported primitive types
export type PrimitiveType = "text" | "number" | "number with unit" | "boolean" | "date" | "object" | "list (string)" | "list (number)" | "list (boolean)" | "list (date)";

export type PrimitiveValue = string | number | boolean | Date | string[] | number[] | boolean[] | Date[] | { value: number; unit: string } | Record<string, unknown>;

export interface LabeledPrimitiveInputOptions extends LabeledInputBaseOptions<PrimitiveValue> {
    type: PrimitiveType;
    units?: string[]; // For "number with unit"
    defaultUnit?: string; // Default unit to select from units array
    onValueChange?: (value: PrimitiveValue) => void;
    multiline?: boolean; // For text type, render textarea if true
    app?: App; // App instance for modals
}

export class LabeledPrimitiveInput extends LabeledInputBase<PrimitiveValue> {
    private type: PrimitiveType;
    private value: PrimitiveValue;
    private units?: string[];
    private defaultUnit?: string;
    private onValueChange?: (value: PrimitiveValue) => void;
    private _onRemove?: (() => void);
    private currentKey: string; // Track the current key to handle key changes
    private app?: App; // App instance for modals

    constructor(options: LabeledPrimitiveInputOptions) {
        super(options);
        this.type = options.type;
        this.value = options.defaultValue ?? this.getDefaultValueForType(this.type);
        this.units = options.units;
        this.defaultUnit = options.defaultUnit;
        this.onValueChange = options.onValueChange;
        this._onRemove = options.onRemove;
        this.currentKey = options.label; // Initialize with the original label
        this.app = options.app;

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
                            const selectedUnit = unitDropdown?.getValue() ?? this.getDefaultUnit();
                            this.value = { value: numericValue, unit: selectedUnit };
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
                        unitDropdown.setValue((typeof this.value === "object" && this.value && "unit" in this.value && typeof this.value.unit === "string" ? this.value.unit : null) || this.getDefaultUnit());
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
                        logger.error(`Error in onValueChange for boolean input:`, error);
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
                        logger.error(`Error in onValueChange for date input:`, error);
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
                            logger.error(`Error in onValueChange for list (string) input:`, error);
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
                            logger.error(`Error in onValueChange for list (number) input:`, error);
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
                            logger.error(`Error in onValueChange for list (boolean) input:`, error);
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
                            logger.error(`Error in onValueChange for list (date) input:`, error);
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
        // Special handling for "number with unit" type - always show dialog
        // This allows users to change units even when the type is already "number with unit"
        if (newType === "number with unit") {
            this.showNumberWithUnitDialog(newType, units);
            return;
        }

        // Object type should be handled by the parent UniversalObjectRenderer
        // If we get here with object type, it means the parent didn't handle it
        if (newType === "object") {
            logger.warn("Object type should be handled by parent UniversalObjectRenderer, not by LabeledPrimitiveInput");
            return;
        }

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
            case "number with unit": return { value: 0, unit: this.getDefaultUnit() };
            case "boolean": return false;
            case "date": return new Date();
            case "object": return {};
            case "list (string)": return [];
            case "list (number)": return [];
            case "list (boolean)": return [];
            case "list (date)": return [];
        }
    }

    private getDefaultUnit(): string {
        // Use defaultUnit if specified and it exists in units array
        if (this.defaultUnit && this.units?.includes(this.defaultUnit)) {
            return this.defaultUnit;
        }
        // Fall back to first unit in array
        return this.units?.[0] ?? "";
    }

    private getBaseOptions(): LabeledPrimitiveInputOptions {
        return {
            container: this.wrapper.parentElement!,
            label: this.label,
            defaultValue: this.value,
            placeholder: undefined,
            editableKey: !!this.keyElement,
            allowTypeSwitch: !!this.getTypeDropdown(),
            onTypeChange: (type) => this.setType(type as PrimitiveType, this.units),
            removeable: !!this.getRemoveButton(),
            onRemove: this._onRemove,
            type: this.type,
            units: this.units,
            onValueChange: this.onValueChange,
            app: this.app,
        };
    }

    private showNumberWithUnitDialog(newType: PrimitiveType, units?: string[]): void {
        // Check if app instance is available
        if (!this.app) {
            logger.error("App instance not available for NumberWithUnitInputModal");
            // Fallback: set default units and continue
            this.units = ["unit"];
            this.defaultUnit = "unit";
            this.type = newType;
            this.value = { value: 0, unit: "unit" };
            this.createValueEditor({ ...this.getBaseOptions(), type: newType, units: this.units });
            this.onValueChange?.(this.value);
            return;
        }

        // Get current value for conversion if available
        let currentValue = 0;
        if (typeof this.value === "number") {
            currentValue = this.value;
        } else if (typeof this.value === "object" && this.value && "value" in this.value && typeof this.value.value === "number") {
            currentValue = this.value.value;
        }

        // Get current unit if available
        let currentUnit = "";
        if (typeof this.value === "object" && this.value && "unit" in this.value && typeof this.value.unit === "string") {
            currentUnit = this.value.unit;
        }

        const modal = new NumberWithUnitInputModal(this.app, {
            title: "Enter Number with Unit",
            label: `Value for "${this.label}"`,
            initialValue: currentValue,
            initialUnit: currentUnit,
            placeholder: "Enter numeric value...",
            onSubmit: (result) => {
                // Set the units to include the new unit
                this.units = [result.unit];
                this.defaultUnit = result.unit;
                this.type = newType;
                this.value = result;
                
                // Recreate the value editor with the new unit
                this.createValueEditor({ ...this.getBaseOptions(), type: newType, units: this.units });
                
                // Trigger the value change callback
                this.onValueChange?.(this.value);
                
                logger.debug(`Set number with unit: ${result.value} ${result.unit}`);
            }
        });

        modal.open();
    }
}
