import { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import { updateProperties } from "../utils/updateProperties";
import { createLogger } from "../../../../utils/Logger";

const logger = createLogger('npe');

/**
 * Creates an editable boolean element that can be toggled or edited as text.
 * @param booleanValue - The boolean value to display.
 * @param parent - The parent element to append the boolean element to.
 * @param fullKey - The full key of the boolean in dot notation.
 * @param onUpdate - Optional callback for custom update handling (used in arrays).
 */
export function createBooleanElement(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    booleanValue: boolean,
    parent: HTMLElement,
    fullKey: string,
    onUpdate?: (newValue: string) => void
): void {
    const app = view.app;
    const file = view.currentFile;
    const booleanDiv = parent.createDiv({ cls: "npe-editable-boolean" });

    // Store the current value for editing
    let currentValue = booleanValue;

    const booleanSpan = booleanDiv.createSpan({
        cls: `npe-boolean-value npe-boolean-${currentValue}`,
        text: String(currentValue)
    });

    const editableDiv = booleanDiv.createDiv({ cls: "npe-make-editable" });

    // Toggle behavior when clicking on the boolean value itself
    view.registerDomEvent(booleanSpan, "click", (event) => {
        event.stopPropagation();
        
        // Toggle the boolean value
        currentValue = !currentValue;
        const newValueString = String(currentValue);
        
        // Update the display
        booleanSpan.textContent = newValueString;
        booleanSpan.className = `npe-boolean-value npe-boolean-${currentValue}`;
        
        logger.debug(`Boolean toggled to ${newValueString}`, { fullKey, currentValue });
        
        if (onUpdate) {
            // Array context - for toggles, we can skip the complex conversion logic
            // and directly update since the type doesn't change (boolean -> boolean)
            if (view.currentFile) {
                // Set internal change flag BEFORE calling updateProperties
                if (view instanceof NestedPropertiesEditorView) {
                    view.setInternalChangeFlag();
                }
                updateProperties(app, file!, fullKey, currentValue, 'boolean');
            }
        } else {
            // Primitive context - use default update logic
            if (view.currentFile) {
                // Set internal change flag BEFORE calling updateProperties
                if (view instanceof NestedPropertiesEditorView) {
                    view.setInternalChangeFlag();
                }
                updateProperties(app, file!, fullKey, currentValue, 'boolean');
            }
        }
    });

    // Edit mode when clicking on the editable area (behind the text)
    view.registerDomEvent(editableDiv, "click", () => {
        // When editing starts, show the current value as editable text
        booleanSpan.textContent = String(currentValue);
        booleanSpan.contentEditable = "true";
        booleanSpan.focus();

        // Set the cursor to the end of the text
        const range = document.createRange();
        range.selectNodeContents(booleanSpan);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    });

    // Update the frontmatter on blur (when editing is finished)
    view.registerDomEvent(booleanSpan, "blur", () => {
        const userInput = booleanSpan.textContent || "";
        
        logger.debug(`Boolean edit finished with input: "${userInput}"`, { fullKey });
        
        if (onUpdate) {
            // Array context - use callback (this will handle type conversion)
            onUpdate(userInput);
        } else {
            // Primitive context - use default update logic
            if (view.currentFile) {
                // Set internal change flag BEFORE calling updateProperties
                if (view instanceof NestedPropertiesEditorView) {
                    view.setInternalChangeFlag();
                }
                
                // For primitive context, we need to handle type conversion here
                // If the input is a valid boolean, keep it as boolean
                const lowerInput = userInput.toLowerCase().trim();
                if (lowerInput === 'true' || lowerInput === 'false') {
                    const newBoolValue = lowerInput === 'true';
                    updateProperties(app, file!, fullKey, newBoolValue, 'boolean');
                    currentValue = newBoolValue;
                } else {
                    // User entered something else, treat as string
                    updateProperties(app, file!, fullKey, userInput, 'string');
                    // The component will be re-rendered by the parent
                    return;
                }
            }
        }
        
        // Restore the display after editing
        booleanSpan.textContent = String(currentValue);
        booleanSpan.className = `npe-boolean-value npe-boolean-${currentValue}`;
        booleanSpan.contentEditable = "false";
    });

    // Handle Enter key to finish editing
    view.registerDomEvent(booleanSpan, "keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            booleanSpan.blur();
        }
    });
}