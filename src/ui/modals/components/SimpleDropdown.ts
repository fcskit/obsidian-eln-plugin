import { DropdownComponent } from "obsidian";

export interface SimpleDropdownOptions {
    container: HTMLElement;
    label: string;
    options: string[];
    placeholder?: string;
    onChangeCallback?: (value: string) => void;
}

/**
 * Simple dropdown for nested structures with left label, right dropdown layout
 * Used within container sections for a clean inline appearance
 */
export class SimpleDropdown {
    private wrapper: HTMLElement;
    private dropdown: DropdownComponent;

    constructor(options: SimpleDropdownOptions) {
        const {
            container,
            label,
            options: dropdownOptions,
            placeholder,
            onChangeCallback = (value) => value
        } = options;

        // Create simple inline wrapper
        this.wrapper = container.createDiv({ cls: "eln-simple-input" });

        // Create label
        this.wrapper.createEl("label", { cls: "eln-simple-label", text: label });

        // Create dropdown
        this.dropdown = new DropdownComponent(this.wrapper);
        this.dropdown.selectEl.addClass("eln-simple-field");
        
        // Add placeholder option if provided
        if (placeholder) {
            this.dropdown.addOption("", placeholder);
        }
        
        // Ensure dropdownOptions is an array
        const processedOptions = Array.isArray(dropdownOptions) ? dropdownOptions : [dropdownOptions];
        this.dropdown.addOptions(
            Object.fromEntries(processedOptions.map((option) => [option, option]))
        );

        // Set the default value
        if (processedOptions.length > 0) {
            const defaultValue = placeholder ? "" : processedOptions[0];
            this.dropdown.setValue(defaultValue);
            if (!placeholder) {
                try {
                    onChangeCallback(defaultValue);
                } catch (error) {
                    console.error(`Error in onChangeCallback for SimpleDropdown:`, error);
                    onChangeCallback(defaultValue.trim());
                }
            }
        }

        // Register the onChange callback
        this.dropdown.onChange((value) => {
            if (value !== "" || !placeholder) { // Don't trigger callback for placeholder selection
                try {
                    onChangeCallback(value);
                } catch (error) {
                    console.error(`Error in onChangeCallback for SimpleDropdown:`, error);
                    onChangeCallback(value.trim());
                }
            }
        });
    }

    getDropdown(): DropdownComponent {
        return this.dropdown;
    }

    getWrapper(): HTMLElement {
        return this.wrapper;
    }

    getValue(): string {
        return this.dropdown.getValue();
    }

    setValue(value: string): void {
        this.dropdown.setValue(value);
    }
}
