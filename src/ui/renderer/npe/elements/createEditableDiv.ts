/**
 * Creates an editable div that behaves like an input field but can grow dynamically
 * @param container - The parent container
 * @param initialValue - The initial value to display
 * @param placeholder - Placeholder text when empty
 * @param inputType - The type of input (text, number) for validation
 * @param onUpdate - Callback when value changes
 * @returns The created editable div element
 */
export function createEditableDiv(
    container: HTMLElement,
    initialValue: string,
    placeholder: string = "",
    inputType: "text" | "number" = "text",
    onUpdate?: (value: string) => void
): HTMLElement {
    const editableDiv = container.createDiv({
        cls: "npe-editable-div",
        attr: {
            contenteditable: "true",
            "data-input-type": inputType,
            "data-placeholder": placeholder
        }
    });

    // Set initial content
    if (initialValue) {
        editableDiv.textContent = initialValue;
    } else {
        editableDiv.setAttribute("data-empty", "true");
    }

    // Handle placeholder display
    updatePlaceholderVisibility(editableDiv, placeholder);

    // Input event for real-time updates
    editableDiv.addEventListener("input", () => {
        const value = editableDiv.textContent || "";
        updatePlaceholderVisibility(editableDiv, placeholder);
        
        // Validate number input
        if (inputType === "number" && value) {
            const numericValue = value.replace(/[^0-9.-]/g, "");
            if (numericValue !== value) {
                editableDiv.textContent = numericValue;
                // Move cursor to end
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(editableDiv);
                range.collapse(false);
                selection?.removeAllRanges();
                selection?.addRange(range);
            }
        }
    });

    // Blur event for final value processing
    editableDiv.addEventListener("blur", () => {
        const value = editableDiv.textContent?.trim() || "";
        updatePlaceholderVisibility(editableDiv, placeholder);
        
        if (onUpdate) {
            onUpdate(value);
        }
    });

    // Focus event to clear placeholder styling
    editableDiv.addEventListener("focus", () => {
        editableDiv.removeAttribute("data-empty");
    });

    // Prevent Enter key from adding new lines (single line behavior)
    editableDiv.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            editableDiv.blur();
        }
        // Tab behavior for navigation
        if (e.key === "Tab") {
            e.preventDefault();
            editableDiv.blur();
            // Find next editable element
            const nextEditable = findNextEditableElement(editableDiv, !e.shiftKey);
            if (nextEditable) {
                nextEditable.focus();
            }
        }
    });

    // Paste event to handle pasted content
    editableDiv.addEventListener("paste", (e) => {
        e.preventDefault();
        const text = e.clipboardData?.getData("text/plain") || "";
        
        // For single-line inputs, replace line breaks with spaces
        const cleanText = text.replace(/\r?\n/g, " ").trim();
        
        // Insert the cleaned text
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(cleanText));
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        
        // Trigger input event for validation
        editableDiv.dispatchEvent(new Event("input"));
    });

    return editableDiv;
}

/**
 * Updates placeholder visibility based on content
 */
function updatePlaceholderVisibility(element: HTMLElement, placeholder: string) {
    const hasContent = (element.textContent?.trim().length || 0) > 0;
    if (hasContent) {
        element.removeAttribute("data-empty");
    } else {
        element.setAttribute("data-empty", "true");
    }
}

/**
 * Finds the next editable element for tab navigation
 */
function findNextEditableElement(current: HTMLElement, forward: boolean): HTMLElement | null {
    const editableElements = Array.from(document.querySelectorAll(
        '.npe-editable-div, input[type="date"], input[type="checkbox"], select, textarea'
    )) as HTMLElement[];
    
    const currentIndex = editableElements.indexOf(current);
    if (currentIndex === -1) return null;
    
    const nextIndex = forward 
        ? (currentIndex + 1) % editableElements.length
        : (currentIndex - 1 + editableElements.length) % editableElements.length;
    
    return editableElements[nextIndex];
}

/**
 * Gets the value from an editable div (similar to input.value)
 */
export function getEditableDivValue(element: HTMLElement): string {
    return element.textContent?.trim() || "";
}

/**
 * Sets the value of an editable div (similar to input.value = ...)
 */
export function setEditableDivValue(element: HTMLElement, value: string) {
    element.textContent = value;
    const placeholder = element.getAttribute("data-placeholder") || "";
    updatePlaceholderVisibility(element, placeholder);
}
