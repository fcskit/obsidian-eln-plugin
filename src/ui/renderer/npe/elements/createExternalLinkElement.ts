import { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import { updateProperties } from "../utils/updateProperties";

export function createExternalLinkElement(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    value: string,
    parent: HTMLElement,
    fullKey: string,
    onUpdate?: (newValue: string) => void
): void {
    if (typeof value !== "string") {
        value = "[example link](https://example.com)";
    }

    const linkText = value.match(/\[(.*?)\]/)?.[1] || "example";
    const linkUrl = value.match(/\((.*?)\)/)?.[1] || "https://example.com";
    let fullMarkdown = value.match(/^\[.*?\]\(.*?\)$/) ? value : `[${linkText}](${linkUrl})`;

    const linkDiv = parent.createDiv({ cls: "npe-editable-link" });

    const link = linkDiv.createEl("a", {
        attr: {
            href: linkUrl,
            target: "_blank",
            rel: "noopener nofollow",
        },
        cls: "npe-external-link", // Add class for styling
        text: linkText, // Display only the link text
    });

    const editableDiv = linkDiv.createDiv({ cls: "npe-make-editable" });

    view.registerDomEvent(editableDiv, "click", () => {
        // When editing starts, show the full markdown syntax
        link.textContent = fullMarkdown;
        link.contentEditable = "true";
        
        // Temporarily remove href to prevent link activation during editing
        link.removeAttribute("href");
        link.classList.add("npe-editing");
        
        link.focus();
        
        // Set the cursor to the end of the text
        const range = document.createRange();
        range.selectNodeContents(link);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    });

    view.registerDomEvent(link, "blur", () => {
        const userInput = link.textContent || "";
        
        if (onUpdate) {
            // Array context - use callback
            onUpdate(userInput);
        } else {
            // Primitive context - use default update logic
            if (view.currentFile) {
                // Set internal change flag BEFORE calling updateProperties
                if (view instanceof NestedPropertiesEditorView) {
                    view.setInternalChangeFlag();
                }
                updateProperties(view.app, view.currentFile, fullKey, userInput, 'external-link');
            }
        }
        
        // Always restore the display after editing and update our stored values
        // Parse the user input to extract display text and URL
        const parsedLinkText = userInput.match(/\[(.*?)\]/)?.[1] || userInput;
        const parsedLinkUrl = userInput.match(/\((.*?)\)/)?.[1] || userInput;
        
        // Update our stored full markdown for future edits
        fullMarkdown = userInput.match(/^\[.*?\]\(.*?\)$/) ? userInput : `[${parsedLinkText}](${parsedLinkUrl})`;
        
        // Update the link display and href
        link.textContent = parsedLinkText; // Show only the display text
        link.setAttribute("href", parsedLinkUrl); // Re-enable the link
        link.classList.remove("npe-editing"); // Remove editing class
        link.contentEditable = "false";
    });
}