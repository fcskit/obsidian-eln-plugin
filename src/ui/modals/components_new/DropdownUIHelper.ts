import { DropdownComponent } from "obsidian";
import { DropdownResizer } from "../../../utils/dropdown-resizer";
import { createLogger } from "../../../utils/Logger";

const logger = createLogger('ui');

export interface DropdownUIConfig {
    container: HTMLElement;
    options: string[];
    defaultValue?: string;
    multiselect?: boolean;
    onValueChange?: (value: string) => void;
}

export interface MultiDropdownUIConfig {
    container: HTMLElement;
    options: string[];
    defaultValues?: string[];
    onValueChange?: () => void;
    onAddDropdown?: () => void;
}

/**
 * Shared helper for creating dropdown UI components
 * Used by both LabeledDropdown and QueryDropdown to avoid code duplication
 */
export class DropdownUIHelper {
    
    /**
     * Creates a single dropdown component with options
     */
    static createSingleDropdown(config: DropdownUIConfig): DropdownComponent {
        const dropdown = new DropdownComponent(config.container);
        dropdown.selectEl.addClass("resizing-dropdown");
        
        // Handle empty options array
        if (config.options.length === 0) {
            dropdown.addOption("", ""); // Add empty option
            dropdown.setValue("");
            dropdown.selectEl.disabled = true; // Disable if no options
            logger.debug('Created single dropdown with no options (disabled)');
        } else {
            // Add options to dropdown
            this.addOptionsToDropdown(dropdown, config.options);
            
            // Set default value
            if (config.defaultValue && config.options.includes(config.defaultValue)) {
                dropdown.setValue(config.defaultValue);
            } else {
                dropdown.setValue(config.options[0]);
            }
        }
        
        // Setup resizing
        DropdownResizer.setupDropdown(dropdown.selectEl, false);
        
        // Handle changes
        if (config.onValueChange) {
            dropdown.onChange(config.onValueChange);
        }
        
        logger.debug('Created single dropdown:', {
            options: config.options,
            defaultValue: config.defaultValue,
            selectedValue: dropdown.getValue(),
            disabled: config.options.length === 0
        });
        
        return dropdown;
    }
    
    /**
     * Creates a multi-dropdown setup with add button
     */
    static createMultiDropdownSetup(config: MultiDropdownUIConfig): {
        dropdowns: DropdownComponent[];
        addButton: HTMLElement;
        addDropdown: (value?: string) => DropdownComponent;
        removeDropdown: (dropdown: DropdownComponent) => void;
        getSelectedValues: () => string[];
        updateAllDropdownOptions: () => void;
    } {
        const dropdowns: DropdownComponent[] = [];
        
        // Function to get currently selected values
        const getSelectedValues = (): string[] => {
            return dropdowns.map(d => d.getValue()).filter(v => v);
        };
        
        // Function to update all dropdown options (exclude already selected)
        const updateAllDropdownOptions = (): void => {
            const selectedValues = getSelectedValues();
            
            dropdowns.forEach(dropdown => {
                const currentValue = dropdown.getValue();
                const availableOptions = config.options.filter(
                    option => option === currentValue || !selectedValues.includes(option)
                );
                
                // Clear and rebuild options
                dropdown.selectEl.empty();
                this.addOptionsToDropdown(dropdown, availableOptions);
                
                // Restore current value if still available
                if (currentValue && availableOptions.includes(currentValue)) {
                    dropdown.setValue(currentValue);
                }
            });
        };
        
        // Function to add a new dropdown
        const addDropdown = (initialValue?: string): DropdownComponent => {
            const dropdownWrapper = config.container.createDiv({ 
                cls: "eln-modal-multiselect-dropdown-wrapper" 
            });
            
            // Filter available options to exclude already selected values
            const selectedValues = getSelectedValues();
            const availableOptions = config.options.filter(
                option => !selectedValues.includes(option)
            );
            
            // Create dropdown
            const dropdown = new DropdownComponent(dropdownWrapper);
            
            // Handle empty options
            if (availableOptions.length === 0 && config.options.length === 0) {
                // No options available at all
                dropdown.addOption("", "");
                dropdown.setValue("");
                dropdown.selectEl.disabled = true;
            } else {
                this.addOptionsToDropdown(dropdown, availableOptions);
                
                // Set initial value
                const defaultValue = initialValue && availableOptions.includes(initialValue) 
                    ? initialValue 
                    : (availableOptions.length > 0 ? availableOptions[0] : "");
                dropdown.setValue(defaultValue);
            }
            
            // Setup resizing
            DropdownResizer.setupDropdown(dropdown.selectEl, false);
            
            // Handle changes
            dropdown.onChange(() => {
                if (config.onValueChange) {
                    config.onValueChange();
                }
                updateAllDropdownOptions();
            });
            
            dropdowns.push(dropdown);
            
            // Add remove button if there are multiple dropdowns
            if (dropdowns.length > 1) {
                createRemoveButton(dropdownWrapper, dropdown);
            }
            
            // Update options for all dropdowns to exclude new selection
            updateAllDropdownOptions();
            
            logger.debug('Added dropdown to multi-select:', {
                totalDropdowns: dropdowns.length,
                initialValue,
                availableOptions: availableOptions.length
            });
            
            return dropdown;
        };
        
        // Function to remove a dropdown
        const removeDropdown = (dropdown: DropdownComponent): void => {
            const index = dropdowns.indexOf(dropdown);
            if (index > -1) {
                dropdowns.splice(index, 1);
                dropdown.selectEl.parentElement?.remove();
                updateAllDropdownOptions();
                if (config.onValueChange) {
                    config.onValueChange();
                }
            }
        };
        
        // Function to create remove button
        const createRemoveButton = (wrapper: HTMLElement, dropdown: DropdownComponent): void => {
            const removeButton = wrapper.createDiv({ 
                cls: "eln-modal-multiselect-remove-btn clickable-icon" 
            });
            removeButton.setAttr("aria-label", "Remove selection");
            removeButton.innerHTML = `<svg viewBox="0 0 100 100" width="16" height="16">
                <line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" stroke-width="10"/>
                <line x1="80" y1="20" x2="20" y2="80" stroke="currentColor" stroke-width="10"/>
            </svg>`;
            
            removeButton.onclick = () => removeDropdown(dropdown);
        };
        
        // Create initial dropdowns with default values
        if (config.defaultValues && config.defaultValues.length > 0) {
            config.defaultValues.forEach(value => addDropdown(value));
        } else if (config.options.length > 0) {
            addDropdown(config.options[0]);
        }
        
        // Create add button
        const addButton = config.container.createDiv({ 
            cls: "eln-modal-multiselect-add-btn clickable-icon" 
        });
        addButton.setAttr("aria-label", "Add selection");
        addButton.innerHTML = `<svg viewBox="0 0 100 100" width="16" height="16">
            <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" stroke-width="10"/>
            <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" stroke-width="10"/>
        </svg>`;
        
        addButton.onclick = () => {
            addDropdown();
            // Move add button to the end
            if (config.container.lastChild !== addButton) {
                config.container.appendChild(addButton);
            }
            if (config.onAddDropdown) {
                config.onAddDropdown();
            }
        };
        
        return {
            dropdowns,
            addButton,
            addDropdown,
            removeDropdown,
            getSelectedValues,
            updateAllDropdownOptions
        };
    }
    
    /**
     * Helper to add options to an Obsidian DropdownComponent
     */
    static addOptionsToDropdown(dropdown: DropdownComponent, options: string[]): void {
        options.forEach(option => {
            dropdown.addOption(option, option);
        });
    }
}
