import type { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import { updateProperties } from "../legacy/updateProperties";

/**
 * Creates an editable external link element.
 * @param value - The external link text in markdown format (e.g., `[text](url)`).
 * @param parent - The parent element to append the link to.
 * @param fullKey - The full key of the link in dot notation.
 */
export function createExternalLinkElement(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    value: string,
    parent: HTMLElement,
    fullKey: string
): void {
    if (typeof value !== "string") {
        value = "[example link](https://example.com)";
    }

    const linkText = value.match(/\[(.*?)\]/)?.[1] || "example";
    const linkUrl = value.match(/\((.*?)\)/)?.[1] || "https://example.com";

    const linkDiv = parent.createDiv({ cls: "npe-editable-link" });

    const link = linkDiv.createEl("a", {
        attr: {
            href: linkUrl,
            target: "_blank",
            rel: "noopener nofollow",
        },
        text: linkText,
    });

    const editableDiv = linkDiv.createDiv({ cls: "npe-make-editable" });

    // Make the link editable
    editableDiv.addEventListener("click", () => {
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

    // Update the frontmatter and link attributes on blur
    link.addEventListener("blur", () => {
        const newValue = link.textContent || "";
        const newLinkText = newValue.match(/\[(.*?)\]/)?.[1] || "";
        const newLinkUrl = newValue.match(/\((.*?)\)/)?.[1] || "";

        updateProperties(app, file, fullKey, newValue, "external-link");
        link.setAttribute("href", newLinkUrl);
        link.textContent = newLinkText;
        link.contentEditable = "false";
    });
}