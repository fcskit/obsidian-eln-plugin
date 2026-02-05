import { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import { updateProperties } from "../utils/updateProperties";

/**
 * Creates an editable internal link element.
 * @param fullLink - The full internal link text with brackets (e.g., "[[linkname]]").
 * @param parent - The parent element to append the link to.
 * @param fullKey - The full key of the link in dot notation (used to detect context: primitive vs array).
 * @param onUpdate - Optional callback for custom update handling (used in arrays).
 */
export function createInternalLinkElement(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    fullLink: string,
    parent: HTMLElement,
    fullKey: string,
    onUpdate?: (newValue: string) => void
): void {
    const app = view.app;
    const file = view.currentFile;
    
    // Detect context from dataKey structure: array items have numeric indices (e.g., "key.0", "nested.key.1")
    const isArrayContext = /\.\d+$/.test(fullKey) || Boolean(onUpdate);
    
    const linkDiv = parent.createDiv({ cls: "npe-editable-link" });

    // Extract link name from full syntax for display and href
    const linkName = fullLink.startsWith('[[') && fullLink.endsWith(']]') 
        ? fullLink.slice(2, -2) 
        : fullLink;

    // Store the current full link for editing (will be updated)
    let currentFullLink = fullLink;

    const link = linkDiv.createEl("a", {
        attr: {
            "data-href": linkName,
            target: "_blank",
            rel: "noopener nofollow",
        },
        href: linkName,
        cls: "internal-link",
        text: linkName, // Display only the link name (no brackets)
    });

    const editableDiv = linkDiv.createDiv({ cls: "npe-make-editable" });

    // Make the link editable with context-aware syntax display
    view.registerDomEvent(editableDiv, "click", () => {
        if (isArrayContext) {
            // Array context: show full bracket syntax to allow type conversion
            // Ensure brackets are present for editing
            if (currentFullLink && !currentFullLink.startsWith('[[') && !currentFullLink.endsWith(']]')) {
                currentFullLink = `[[${currentFullLink}]]`;
            }
            link.textContent = currentFullLink;
        } else {
            // Primitive context: show raw content without brackets (type preserved automatically)
            const rawContent = currentFullLink.startsWith('[[') && currentFullLink.endsWith(']]') 
                ? currentFullLink.slice(2, -2) 
                : currentFullLink;
            link.textContent = rawContent;
        }
        
        link.contentEditable = "true";
        link.focus();

        // Set the cursor to the end of the text
        const range = document.createRange();
        range.selectNodeContents(link);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    });

    // Update the frontmatter and link attributes on blur with context-aware bracket handling
    view.registerDomEvent(link, "blur", () => {
        const userInput = link.textContent || "";
        
        if (onUpdate) {
            // Array context - use callback with user input as-is (allows type conversion)
            onUpdate(userInput);
            
            // Update stored value for future edits in array context
            currentFullLink = userInput;
        } else {
            // Primitive context - add brackets if not present to preserve link type
            let valueToStore = userInput;
            if (!userInput.startsWith('[[') && !userInput.endsWith(']]')) {
                valueToStore = `[[${userInput}]]`;
            }
            
            if (view.currentFile) {
                // Set internal change flag BEFORE calling updateProperties
                if (view instanceof NestedPropertiesEditorView) {
                    view.setInternalChangeFlag();
                }
                // Store the value with brackets for primitive context
                updateProperties(app, file!, fullKey, valueToStore, 'link');
            }
            
            // Update stored value for future edits
            currentFullLink = valueToStore;
        }
        
        // Always restore the display after editing
        // For display, use the appropriate content
        const displayValue = isArrayContext ? userInput : (currentFullLink || userInput);
        const displayName = displayValue.startsWith('[[') && displayValue.endsWith(']]') 
            ? displayValue.slice(2, -2) 
            : displayValue;
        
        // Update the link display and attributes
        link.textContent = displayName; // Show only the link name (no brackets)
        link.setAttribute("href", displayName);
        link.setAttribute("data-href", displayName);
        link.contentEditable = "false";
    });
}