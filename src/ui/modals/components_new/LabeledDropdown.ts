import { DropdownComponent } from "obsidian";
import { LabeledInputBase, LabeledInputBaseOptions } from "./LabeledInputBase";
import { DropdownResizer } from "../../../utils/dropdown-resizer";
import { createLogger } from "../../../utils/Logger";

export interface LabeledDropdownOptions extends LabeledInputBaseOptions<string | string[]> {
    options: string[];
    multiselect?: boolean;
    onValueChange?: (value: string | string[]) => void;
}

/**
 * Labeled dropdown input that supports both single and multi-select modes.
 * Single select returns string, multi-select returns string[].
 */
export class LabeledDropdown extends LabeledInputBase<string | string[]> {
    protected dropdowns: DropdownComponent[] = [];
    protected dropdownOptions: string[] = [];
    protected multiselect: boolean = false;
    protected onValueChange?: (value: string | string[]) => void;
    protected addButton?: HTMLElement;
    private logger = createLogger('ui');

    constructor(options: LabeledDropdownOptions) {
        super(options);
        this.logger.debug('LabeledDropdown constructor called:', {
            label: options.label,
            multiselect: options.multiselect,
            optionsCount: options.options?.length || 0
        });
        // Call createValueEditor to initialize the dropdown
        this.createValueEditor(options);
    }

    // Implement abstract method from LabeledInputBase
    protected createValueEditor(options: LabeledInputBaseOptions<string | string[]>): void {
        const dropdownOptions = options as LabeledDropdownOptions;
        
        // Initialize properties now that we have access to this
        this.dropdownOptions = [...dropdownOptions.options]; // Copy to avoid mutations
        this.multiselect = dropdownOptions.multiselect ?? false;
        this.onValueChange = dropdownOptions.onValueChange;
        
                
        this.logger.debug('Creating dropdown with options:', {
            options: this.dropdownOptions,
            multiselect: this.multiselect,
            defaultValue: dropdownOptions.defaultValue
        });
        
        this.createDropdowns(dropdownOptions);
    }

    protected createDropdowns(options: LabeledDropdownOptions): void {
        if (this.multiselect) {
            this.createMultiselect(options);
        } else {
            this.createSingleSelect(options);
        }
    }

    protected createSingleSelect(options: LabeledDropdownOptions): void {
        const dropdown = new DropdownComponent(this.valueSection);
        dropdown.selectEl.addClass("resizing-dropdown");
        
        // Add options to dropdown
        this.addOptionsToDropdown(dropdown, this.dropdownOptions);
        
        // Set default value
        const defaultValue = this.getDefaultValue(options.defaultValue);
        if (defaultValue && this.dropdownOptions.includes(defaultValue)) {
            dropdown.setValue(defaultValue);
        } else if (this.dropdownOptions.length > 0) {
            dropdown.setValue(this.dropdownOptions[0]);
        }
        
        // Setup resizing
        DropdownResizer.setupDropdown(dropdown.selectEl, false);
        
        // Handle changes
        dropdown.onChange((value) => {
            this.handleValueChange();
        });
        
        this.dropdowns = [dropdown];
        
        // Trigger initial callback if we have a value
        if (this.dropdowns[0]?.getValue()) {
            this.handleValueChange();
        }
    }

    protected createMultiselect(options: LabeledDropdownOptions): void {
        // Add multiselect class to value section for proper CSS styling
        this.valueSection.addClass("eln-modal-multiselect-container");
        
        // Create initial dropdown with default value if provided
        const defaultValues = this.getDefaultValues(options.defaultValue);
        if (defaultValues.length > 0) {
            defaultValues.forEach(value => this.addDropdown(value));
        } else if (this.dropdownOptions.length > 0) {
            this.addDropdown(this.dropdownOptions[0]);
        }
        
        // Add the "Add" button
        this.createAddButton();
        
        // Trigger initial callback
        this.handleValueChange();
    }

    protected addDropdown(initialValue?: string): void {
        if (!this.multiselect) return;
        
        const dropdownWrapper = this.valueSection.createDiv({ 
            cls: "eln-modal-multiselect-dropdown-wrapper" 
        });
        
        // Filter available options to exclude already selected values
        const selectedValues = this.getSelectedValues();
        const availableOptions = this.dropdownOptions.filter(
            option => !selectedValues.includes(option)
        );
        
        // Create dropdown
        const dropdown = new DropdownComponent(dropdownWrapper);
        this.addOptionsToDropdown(dropdown, availableOptions);
        
        // Set initial value
        const defaultValue = initialValue && availableOptions.includes(initialValue) 
            ? initialValue 
            : availableOptions[0];
        
        if (defaultValue) {
            dropdown.setValue(defaultValue);
        }
        
        // Setup resizing
        DropdownResizer.setupDropdown(dropdown.selectEl, false);
        
        // Handle changes
        dropdown.onChange(() => {
            this.handleValueChange();
            this.updateDropdownOptions();
        });
        
        this.dropdowns.push(dropdown);
        
        // Add remove button if there are multiple dropdowns
        if (this.dropdowns.length > 1) {
            this.createRemoveButton(dropdownWrapper, dropdown);
        }
        
        // Update options for all dropdowns to exclude new selection
        this.updateDropdownOptions();
        
        // Trigger value change to include the new dropdown's initial value in form data
        this.handleValueChange();
    }

    protected createAddButton(): void {
        this.addButton = this.valueSection.createDiv({ 
            cls: "eln-modal-multiselect-add-btn clickable-icon" 
        });
        this.addButton.setAttr("aria-label", "Add selection");
        this.addButton.innerHTML = `<svg viewBox="0 0 100 100" width="16" height="16">
            <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" stroke-width="10"/>
            <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" stroke-width="10"/>
        </svg>`;
        
        this.addButton.onclick = () => {
            this.addDropdown();
            // Move add button to the end
            if (this.addButton && this.valueSection.lastChild !== this.addButton) {
                this.valueSection.appendChild(this.addButton);
            }
        };
    }

    protected createRemoveButton(wrapper: HTMLElement, dropdown: DropdownComponent): void {
        const removeButton = wrapper.createDiv({ 
            cls: "eln-modal-multiselect-remove-btn clickable-icon" 
        });
        removeButton.setAttr("aria-label", "Remove selection");
        removeButton.innerHTML = `<svg viewBox="0 0 100 100" width="16" height="16">
            <line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" stroke-width="10"/>
            <line x1="80" y1="20" x2="20" y2="80" stroke="currentColor" stroke-width="10"/>
        </svg>`;
        
        removeButton.onclick = () => {
            // Remove from dropdowns array
            this.dropdowns = this.dropdowns.filter(d => d !== dropdown);
            
            // Remove wrapper from DOM
            wrapper.remove();
            
            // Update remaining dropdowns and trigger callback
            this.updateDropdownOptions();
            this.handleValueChange();
        };
    }

    protected addOptionsToDropdown(dropdown: DropdownComponent, options: string[]): void {
        const optionsObject = Object.fromEntries(options.map(option => [option, option]));
        dropdown.addOptions(optionsObject);
    }

    protected updateDropdownOptions(): void {
        if (!this.multiselect) return;
        
        const selectedValues = this.getSelectedValues();
        
        this.dropdowns.forEach(dropdown => {
            const currentValue = dropdown.getValue();
            
            // Available options = all options minus selected values, plus current value
            const availableOptions = this.dropdownOptions.filter(
                option => !selectedValues.includes(option) || option === currentValue
            );
            
            // Clear and re-add options
            dropdown.selectEl.empty();
            this.addOptionsToDropdown(dropdown, availableOptions);
            
            // Restore current value
            if (currentValue && availableOptions.includes(currentValue)) {
                dropdown.setValue(currentValue);
            }
        });
    }

    protected getSelectedValues(): string[] {
        return this.dropdowns
            .map(dropdown => dropdown.getValue())
            .filter(value => value && value.trim() !== "");
    }

    protected handleValueChange(): void {
        if (this.onValueChange) {
            const value = this.multiselect ? this.getSelectedValues() : this.getSelectedValues()[0] || "";
            this.onValueChange(value);
        }
    }

    protected getDefaultValue(defaultValue?: string | string[]): string {
        if (typeof defaultValue === "string") {
            return defaultValue;
        } else if (Array.isArray(defaultValue) && defaultValue.length > 0) {
            return defaultValue[0];
        }
        return "";
    }

    protected getDefaultValues(defaultValue?: string | string[]): string[] {
        if (Array.isArray(defaultValue)) {
            return defaultValue.filter(value => this.dropdownOptions.includes(value));
        } else if (typeof defaultValue === "string" && this.dropdownOptions.includes(defaultValue)) {
            return [defaultValue];
        }
        return [];
    }

    /**
     * Public API methods
     */

    getValue(): string | string[] {
        if (this.multiselect) {
            return this.getSelectedValues();
        } else {
            return this.dropdowns[0]?.getValue() || "";
        }
    }

    setValue(value: string | string[]): void {
        if (this.multiselect && Array.isArray(value)) {
            this.setMultipleValues(value);
        } else if (!this.multiselect && typeof value === "string") {
            this.setSingleValue(value);
        }
    }

    protected setSingleValue(value: string): void {
        if (this.dropdowns[0] && this.dropdownOptions.includes(value)) {
            this.dropdowns[0].setValue(value);
            this.handleValueChange();
        }
    }

    protected setMultipleValues(values: string[]): void {
        if (!this.multiselect) return;
        
        // Filter valid values
        const validValues = values.filter(value => this.dropdownOptions.includes(value));
        
        // Clear existing dropdowns
        this.valueSection.empty();
        this.dropdowns = [];
        
        // Recreate dropdowns for each value
        if (validValues.length > 0) {
            validValues.forEach(value => this.addDropdown(value));
        } else if (this.dropdownOptions.length > 0) {
            this.addDropdown(this.dropdownOptions[0]);
        }
        
        // Recreate add button
        this.createAddButton();
        
        this.handleValueChange();
    }

    setOptions(options: string[]): void {
        this.dropdownOptions = [...options];
        
        if (this.multiselect) {
            // For multiselect, update all dropdown options
            this.updateDropdownOptions();
        } else {
            // For single select, rebuild the dropdown
            const currentValue = this.dropdowns[0]?.getValue();
            this.dropdowns[0]?.selectEl.empty();
            this.addOptionsToDropdown(this.dropdowns[0], this.dropdownOptions);
            
            // Restore value if still valid
            if (currentValue && this.dropdownOptions.includes(currentValue)) {
                this.dropdowns[0]?.setValue(currentValue);
            } else if (this.dropdownOptions.length > 0) {
                this.dropdowns[0]?.setValue(this.dropdownOptions[0]);
                this.handleValueChange();
            }
        }
    }

    getOptions(): string[] {
        return [...this.dropdownOptions];
    }
}
