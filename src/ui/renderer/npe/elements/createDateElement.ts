import { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import { updateProperties } from "../utils/updateProperties";

/**
 * Creates a flexible date element that supports both date picker functionality 
 * and text editing for type conversion in array contexts.
 * @param view - The NPE view instance
 * @param value - The date value (YYYY-MM-DD format)
 * @param container - The container element to append to
 * @param dataKey - The data key for updates
 * @param onUpdate - Optional callback for array contexts (enables type conversion)
 */
export function createDateElement(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    value: string,
    container: HTMLElement,
    dataKey: string,
    onUpdate?: (newValue: string) => void
): void {
    // Detect context from dataKey structure: array items have numeric indices (e.g., "key.0", "nested.key.1")
    const isArrayContext = /\.\d+$/.test(dataKey) || Boolean(onUpdate);
    
    // Create wrapper div for the date element
    const dateWrapper = container.createDiv({ cls: 'npe-date-element' });
    
    // Create the date input element
    const dateInput = dateWrapper.createEl('input', {
        type: 'date',
        value: value,
        attr: { 'data-key': dataKey, 'data-type': 'date' }
    });
    
    // Declare clickableOverlay in function scope for array context
    let clickableOverlay: HTMLElement | null = null;
    
    // Function to switch to text editing mode
    function switchToTextMode() {
        // Hide the date input and overlay
        dateInput.style.display = 'none';
        if (clickableOverlay) {
            clickableOverlay.style.display = 'none';
        }
        
        // Create an editable text input
        const textInput = dateWrapper.createEl('input', {
            type: 'text',
            value: dateInput.value,
            cls: 'npe-date-text-edit'
        });
        
        // Focus and select the text
        textInput.focus();
        textInput.select();
        
        // Handle losing focus (save and potentially convert type)
        const handleBlur = () => {
            const userInput = textInput.value.trim();
            
            if (onUpdate) {
                // Array context - use callback with intelligent type conversion
                onUpdate(userInput);
            } else {
                // Primitive context (shouldn't happen in array context, but safety)
                if (view.currentFile) {
                    if (view instanceof NestedPropertiesEditorView) {
                        view.setInternalChangeFlag();
                    }
                    updateProperties(view.app, view.currentFile, dataKey, userInput, 'date');
                }
            }
            
            // Remove the text input
            textInput.remove();
            
            // Show the date input again (will be re-rendered if type changed)
            dateInput.style.display = '';
            if (clickableOverlay) {
                clickableOverlay.style.display = '';
            }
            
            // Update the date input value if it's still a valid date
            if (/^\d{4}-\d{2}-\d{2}$/.test(userInput)) {
                dateInput.value = userInput;
            }
        };
        
        view.registerDomEvent(textInput, 'blur', handleBlur);
        view.registerDomEvent(textInput, 'keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                textInput.blur();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                // Cancel editing - restore original value
                textInput.value = dateInput.value;
                textInput.blur();
            }
        });
    }
    
    // For array context, add click-to-edit functionality
    if (isArrayContext) {
        // Add a clickable overlay div that covers the date text but not the picker icon
        clickableOverlay = dateWrapper.createDiv({ 
            cls: 'npe-date-text-overlay',
            attr: { title: 'Click to edit as text (allows type conversion)' }
        });
        
        // Position the overlay to cover only the date text, not the picker icon
        clickableOverlay.style.position = 'absolute';
        clickableOverlay.style.left = '25px';
        clickableOverlay.style.top = '0';
        clickableOverlay.style.right = '0'; // Leave space for the date picker icon
        clickableOverlay.style.bottom = '0';
        clickableOverlay.style.cursor = 'text';
        clickableOverlay.style.zIndex = '1';
        clickableOverlay.style.backgroundColor = 'transparent';
        
        // Make the wrapper relatively positioned for the overlay
        dateWrapper.style.position = 'relative';
        dateWrapper.style.display = 'inline-block';
        
        // Handle clicking on the date text (not the picker)
        view.registerDomEvent(clickableOverlay, 'click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Switch to text editing mode
            switchToTextMode();
        });
    }
    
    // Handle date picker changes (normal date editing)
    view.registerDomEvent(dateInput, 'input', () => {
        const newValue = dateInput.value;
        
        if (onUpdate) {
            // Array context - use callback
            onUpdate(newValue);
        } else {
            // Primitive context - direct update
            if (view.currentFile) {
                if (view instanceof NestedPropertiesEditorView) {
                    view.setInternalChangeFlag();
                }
                updateProperties(view.app, view.currentFile, dataKey, newValue, 'date');
            }
        }
    });
}