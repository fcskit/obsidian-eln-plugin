import { DropdownComponent, ButtonComponent } from "obsidian";

export interface MultiSelectInputOptions {
    container: HTMLElement;
    label: string;
    options: string[];
    onChangeCallback?: (selectedValues: string[]) => void; // Made optional
}

export class MultiSelectInput {
    private wrapper: HTMLElement;
    private selectedValues: Map<HTMLElement, string>;
    private options: string[];
    private onChangeCallback: (selectedValues: string[]) => void;

    constructor(options: MultiSelectInputOptions) {
        const {
            container,
            label,
            options: dropdownOptions,
            onChangeCallback = (selectedValues) => selectedValues, // Default callback
        } = options;

        // Ensure dropdownOptions is an array
        if (!Array.isArray(dropdownOptions)) {
            this.options = [dropdownOptions];
        } else {
            this.options = dropdownOptions;
        }
        this.onChangeCallback = onChangeCallback;
        this.selectedValues = new Map();

        // Create the wrapper div
        this.wrapper = container.createDiv({ cls: "eln-modal-multiselect-wrapper" });

        // Create the label
        this.wrapper.createEl("label", { text: label });

        // Add the first dropdown
        this.addDropdown();

        // Add the "Add" button
        const addButton = new ButtonComponent(this.wrapper);
        addButton.setIcon("plus");
        addButton.onClick(() => {
            this.addDropdown();
            if (this.wrapper.lastChild) {
                this.wrapper.insertBefore(this.wrapper.lastChild, addButton.buttonEl);
            }
        });
    }

    // Add a dropdown to the multi-select input
    private addDropdown(initialValue: string | null = null) {
        const dropdownWrapper = this.wrapper.createDiv({ cls: "eln-modal-multiselect-dropdown-wrapper" });

        // Filter available options to exclude already selected values
        const availableOptions = this.options.filter(
            (option) => !Array.from(this.selectedValues.values()).includes(option)
        );

        const dropdown = new DropdownComponent(dropdownWrapper);
        dropdown.addOptions(Object.fromEntries(availableOptions.map((option) => [option, option])));

        const defaultValue = initialValue || availableOptions[0];
        dropdown.setValue(defaultValue);
        this.selectedValues.set(dropdownWrapper, defaultValue);
        this.triggerOnChangeCallback();

        dropdown.onChange((value) => {
            this.selectedValues.set(dropdownWrapper, value);
            this.updateDropdownOptions();
            this.triggerOnChangeCallback();
        });

        // Add a "Remove" button if there are multiple dropdowns
        if (this.selectedValues.size > 1) {
            const removeButton = new ButtonComponent(dropdownWrapper);
            removeButton.setIcon("cross");
            removeButton.onClick(() => {
                this.selectedValues.delete(dropdownWrapper);
                dropdownWrapper.remove();
                this.updateDropdownOptions();
                this.triggerOnChangeCallback();
            });
        }
    }

    // Update the options for all dropdowns to reflect the current selections
    private updateDropdownOptions() {
        this.selectedValues.forEach((selectedValue, dropdownWrapper) => {
            const availableOptions = this.options.filter(
                (option) => !Array.from(this.selectedValues.values()).includes(option) || option === selectedValue
            );

            dropdownWrapper.empty();

            const dropdown = new DropdownComponent(dropdownWrapper);
            dropdown.addOptions(Object.fromEntries(availableOptions.map((option) => [option, option])));
            dropdown.setValue(selectedValue);
            dropdown.onChange((value) => {
                this.selectedValues.set(dropdownWrapper, value);
                this.updateDropdownOptions();
                this.triggerOnChangeCallback();
            });

            this.selectedValues.set(dropdownWrapper, selectedValue);
        });
    }

    // Trigger the onChangeCallback safely
    private triggerOnChangeCallback() {
        try {
            this.onChangeCallback(Array.from(this.selectedValues.values()));
        } catch (error) {
            console.error("Error in onChangeCallback for MultiSelectInput:", error);
            this.onChangeCallback(Array.from(this.selectedValues.values())); // Fallback to default behavior
        }
    }

    // Get the wrapper element
    getWrapper(): HTMLElement {
        return this.wrapper;
    }
}