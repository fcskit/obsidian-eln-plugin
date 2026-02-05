import { DropdownComponent } from "obsidian";

export interface LabeledDropdownOptions {
    container: HTMLElement;
    label: string;
    options: string[];
    placeholder?: string; // Add placeholder support
    onChangeCallback?: (value: string) => void; // Made optional
}

export class LabeledDropdown {
    private wrapper: HTMLElement;
    private dropdown: DropdownComponent;

    constructor(options: LabeledDropdownOptions) {
        const {
            container,
            label,
            options: dropdownOptions,
            placeholder, // Extract placeholder option
            onChangeCallback = (value) => value
        } = options;

        console.log("Creating LabeledDropdown with options:", dropdownOptions);
        
        // Create the wrapper div with enhanced styling
        this.wrapper = container.createDiv({ cls: "eln-input-wrapper" });

        // Create header with label
        const header = this.wrapper.createDiv({ cls: "eln-input-header" });
        header.createEl("label", { cls: "eln-input-label", text: label });

        // Create content container
        const content = this.wrapper.createDiv({ cls: "eln-input-content" });

        // Create the dropdown
        this.dropdown = new DropdownComponent(content);
        
        // Add placeholder option if provided
        if (placeholder) {
            this.dropdown.addOption("", placeholder);
        }
        
        // Ensure dropdownOptions is an array
        const processedOptions = Array.isArray(dropdownOptions) ? dropdownOptions : [dropdownOptions];
        this.dropdown.addOptions(
            Object.fromEntries(processedOptions.map((option) => [option, option]))
        );

        // Set the default value if options are provided
        if (processedOptions.length > 0) {
            const defaultValue = placeholder ? "" : processedOptions[0];
            this.dropdown.setValue(defaultValue); // Set the initial value of the dropdown
            if (!placeholder) {
                try {
                    onChangeCallback(defaultValue); // Trigger the callback with the default value
                } catch (error) {
                    console.error(`Error in onChangeCallback for LabeledDropdown:`, error);
                    onChangeCallback(defaultValue.trim()); // Fallback to default behavior
                }
            }
        }

        // Register the onChange callback
        this.dropdown.onChange((value) => {
            try {
                onChangeCallback(value); // Pass the selected value to the callback
            } catch (error) {
                console.error(`Error in onChangeCallback for LabeledDropdown:`, error);
                onChangeCallback(value.trim()); // Fallback to default behavior
            }
        });
    }

    // Get the dropdown component for further customization if needed
    getDropdown(): DropdownComponent {
        return this.dropdown;
    }

    // Get the wrapper element
    getWrapper(): HTMLElement {
        return this.wrapper;
    }
}