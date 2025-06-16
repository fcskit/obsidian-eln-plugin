import { DropdownComponent } from "obsidian";

export interface LabeledDropdownOptions {
    container: HTMLElement;
    label: string;
    options: string[];
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
            onChangeCallback = (value) => value
        } = options;

        console.log("Creating LabeledDropdown with options:", dropdownOptions);
        // Create the wrapper div
        this.wrapper = container.createDiv({ cls: "eln-modal-dropdown-wrapper" });

        // Create the label
        this.wrapper.createEl("label", { text: label });

        // Create the dropdown
        this.dropdown = new DropdownComponent(this.wrapper);
        // Assure dropdownOptions is an array
        let processedOptions = dropdownOptions;
        if (!Array.isArray(dropdownOptions)) {
            processedOptions = [dropdownOptions]; // Ensure options is an array
        }
        this.dropdown.addOptions(
            Object.fromEntries(processedOptions.map((option) => [option, option]))
        );

        // Set the default value if options are provided
        if (dropdownOptions.length > 0) {
            const defaultValue = dropdownOptions[0];
            this.dropdown.setValue(defaultValue); // Set the initial value of the dropdown
            try {
                onChangeCallback(defaultValue); // Trigger the callback with the default value
            } catch (error) {
                console.error(`Error in onChangeCallback for LabeledDropdown:`, error);
                onChangeCallback(defaultValue.trim()); // Fallback to default behavior
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