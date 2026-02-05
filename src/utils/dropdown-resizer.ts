/**
 * Dynamic Dropdown Width Utility
 * Simple helper functions for dropdown width measurement and resizing
 */

// Extend HTMLSelectElement interface to include resize function
interface ExtendedHTMLSelectElement extends HTMLSelectElement {
    __resizeFunction?: () => void;
    __helperElement?: HTMLElement;
}

export class DropdownResizer {
    /**
     * Create a helper element for measuring text width within a specific container
     */
    private static createHelperElement(container: HTMLElement): HTMLElement {
        const helperElement = document.createElement('span');
        helperElement.className = 'dropdown-width-helper';
        helperElement.setAttribute('aria-hidden', 'true');
        container.appendChild(helperElement);
        return helperElement;
    }

    /**
     * Set up dynamic resizing for a dropdown component
     * This should be called directly by dropdown components during creation
     */
    public static setupDropdown(dropdown: HTMLSelectElement, isUnitDropdown: boolean = false): void {
        // Removed console.log - no longer needed for debugging
        
        // Find the modal container by traversing up the DOM
        let container = dropdown.parentElement;
        while (container && !container.classList.contains('modal-content') && !container.classList.contains('modal')) {
            container = container.parentElement;
        }
        
        // Fallback to the closest positioned container if modal not found
        // Note: Helper elements are scoped to modal container for automatic cleanup
        if (!container) {
            container = dropdown.closest('.enhanced-input-wrapper')?.parentElement || dropdown.parentElement || document.body;
        }

        // Create a helper element for this dropdown within the modal container
        const helperElement = this.createHelperElement(container);

        // Create resize function bound to this dropdown
        const resizeFunction = () => this.resizeDropdown(dropdown, isUnitDropdown, helperElement);

        // Initial resize
        setTimeout(() => {
            resizeFunction();
        }, 50);

        // Add change listener - cleanup handled by modal destruction
        dropdown.addEventListener('change', () => {
            // Removed console.log - no longer needed for debugging
            resizeFunction();
        });

        // Store resize function and helper element on the dropdown for reference
        (dropdown as ExtendedHTMLSelectElement).__resizeFunction = resizeFunction;
        (dropdown as ExtendedHTMLSelectElement).__helperElement = helperElement;
    }

    /**
     * Resize a dropdown to fit its selected content using a specific helper element
     */
    private static resizeDropdown(dropdown: HTMLSelectElement, isUnitDropdown: boolean, helperElement: HTMLElement): void {
        const selectedOption = dropdown.options[dropdown.selectedIndex];
        
        if (!selectedOption) return;

        // Copy the selected text to helper element using secure textContent
        helperElement.textContent = selectedOption.text;

        // Force a reflow to ensure styles are applied and text is rendered
        void helperElement.offsetWidth;

        // Get the computed width of just the text
        const textWidth = helperElement.offsetWidth;
        
        // Get CSS custom properties for precise padding calculation
        const rootStyles = getComputedStyle(document.documentElement);
        const horizontalPadding = parseInt(rootStyles.getPropertyValue('--resizing-dropdown-padding-horizontal')) || 12;
        const arrowWidth = parseInt(rootStyles.getPropertyValue('--resizing-dropdown-arrow-width')) || 20;
        
        // Calculate total padding: left padding + right padding + arrow width
        const totalPadding = (horizontalPadding * 2) + arrowWidth;
        
        // Apply different minimum widths based on dropdown type
        const minWidth = isUnitDropdown ? 40 : 120;
        const finalWidth = Math.max(textWidth + totalPadding, minWidth);

        // Removed console.log debug logging - no longer needed
        
        // Set width directly on this specific dropdown element
        dropdown.style.width = `${finalWidth}px`;
    }

    /**
     * Manually trigger resize for a specific dropdown (useful for programmatic value changes)
     */
    public static triggerResize(dropdown: HTMLSelectElement): void {
        const extendedDropdown = dropdown as ExtendedHTMLSelectElement;
        const resizeFunction = extendedDropdown.__resizeFunction;
        if (resizeFunction) {
            resizeFunction();
        }
    }

    /**
     * Clean up helper elements and event listeners for a dropdown
     * Should be called when a dropdown is being destroyed
     */
    public static cleanup(dropdown: HTMLSelectElement): void {
        const extendedDropdown = dropdown as ExtendedHTMLSelectElement;
        
        // Remove helper element if it exists
        if (extendedDropdown.__helperElement) {
            extendedDropdown.__helperElement.remove();
            extendedDropdown.__helperElement = undefined;
        }
        
        // Clear stored function reference
        extendedDropdown.__resizeFunction = undefined;
        
        // Removed console.log - no longer needed for debugging
    }
}
