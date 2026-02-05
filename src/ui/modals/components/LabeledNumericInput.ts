import { TextComponent, DropdownComponent } from "obsidian";

export interface LabeledNumericInputOptions {
    container: HTMLElement;
    label: string;
    defaultValue: number;
    placeholder?: string; // Add placeholder support
    units?: string[]; // Optional list of units
    defaultUnit?: string; // Default unit if units are provided
    onChangeCallback?: (result: number | { value: number; unit?: string }) => void; // Updated callback type
}

export class LabeledNumericInput {
    private wrapper: HTMLElement;
    private input: TextComponent;
    private unitDropdown?: DropdownComponent;
    private units?: string[] | null; // Store the units for later use
    private defaultUnit?: string | null; // Store the default unit for later use

    constructor(options: LabeledNumericInputOptions) {
        const {
            container,
            label,
            defaultValue,
            placeholder, // Extract placeholder option
            units = null,
            defaultUnit = null,
            onChangeCallback = (result) => result, // Default callback
        } = options;

        this.units = units;
        this.defaultUnit = defaultUnit;

        // Create the wrapper div with enhanced styling
        this.wrapper = container.createDiv({ cls: "eln-input-wrapper" });

        // Create header with label
        const header = this.wrapper.createDiv({ cls: "eln-input-header" });
        header.createEl("label", { cls: "eln-input-label", text: label });

        // Create content container
        const content = this.wrapper.createDiv({ cls: "eln-input-content" });

        // Create the numeric input field
        this.input = new TextComponent(content);
        this.input.setPlaceholder(placeholder || defaultValue.toString() || `Enter ${label.toLowerCase()}...`);
        this.input.setValue(defaultValue.toString()); // Set the initial value of the input field

        // Handle changes in the numeric input
        this.input.inputEl.setAttribute("type", "number"); // Ensure the input is numeric
        this.input.onChange((value) => {
            const numericValue = parseFloat(value);
            if (!isNaN(numericValue)) {
                try {
                    if (this.units) {
                        // Pass both value and unit if units are provided
                        onChangeCallback({
                            value: numericValue,
                            unit: this.unitDropdown?.getValue(),
                        });
                    } else {
                        // Pass only the value if no units are provided
                        onChangeCallback(numericValue);
                    }
                } catch (error) {
                    console.error(`Error in onChangeCallback for LabeledNumericInput:`, error);
                    if (this.units) {
                        onChangeCallback({
                            value: numericValue,
                            unit: this.unitDropdown?.getValue(),
                        }); // Fallback to default behavior
                    } else {
                        onChangeCallback(numericValue); // Fallback to default behavior
                    }
                }
            }
        });

        // If units are provided, create a dropdown for units
        if (this.units) {
            // Ensure units is an array
            if (!Array.isArray(this.units)) {
                this.units = [this.units];
            }
            if (this.units.length > 1) {
                this.unitDropdown = new DropdownComponent(content);
                this.unitDropdown.addOptions(Object.fromEntries(this.units.map((unit) => [unit, unit])));
                this.unitDropdown.setValue(this.defaultUnit || this.units[0]); // Set the default unit

                // Handle changes in the unit dropdown
                this.unitDropdown.onChange((unit) => {
                    const numericValue = parseFloat(this.input.getValue());
                    if (!isNaN(numericValue)) {
                        try {
                            onChangeCallback({
                                value: numericValue,
                                unit: unit,
                            });
                        } catch (error) {
                            console.error(`Error in onChangeCallback for LabeledNumericInput:`, error);
                            onChangeCallback({
                                value: numericValue,
                                unit: unit,
                            }); // Fallback to default behavior
                        }
                    }
                });
            } else {
                this.wrapper.createEl("span", { cls: "eln-unit", text: this.units[0] });
            }
        }
    }

    // Get the numeric input component for further customization if needed
    getInput(): TextComponent {
        return this.input;
    }

    // Get the unit dropdown component (if it exists)
    getUnitDropdown(): DropdownComponent | undefined {
        return this.unitDropdown;
    }

    // Get the wrapper element
    getWrapper(): HTMLElement {
        return this.wrapper;
    }

    // Set the value of the input field
    setValue(value: number | string, unit?: string): void {
        if (typeof value === "number") {
            this.input.setValue(value.toString());
        } else {
            this.input.setValue(value);
        }
        if (this.unitDropdown) {
            if (unit) {
                this.unitDropdown.setValue(unit); // Set the specified unit
            } else {
                this.unitDropdown.setValue(this.defaultUnit || this.units![0]); // Set the default unit
            }
        }
    }
}