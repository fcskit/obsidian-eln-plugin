import type { NestedPropertiesEditorView } from "../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../views/NestedPropertiesEditor";
import { updateProperties } from "../utils/updateProperties";

/**
 * Creates an editable internal link element.
 * @param internalLink - The internal link text.
 * @param parent - The parent element to append the link to.
 * @param fullKey - The full key of the link in dot notation.
 */
export function createInternalLinkElement(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    internalLink: string,
    parent: HTMLElement,
    fullKey: string
): void {
    const app = view.app;
    const file = view.currentFile;
    const linkDiv = parent.createDiv({ cls: "npe-editable-link" });

    const link = linkDiv.createEl("a", {
        attr: {
            "data-href": internalLink,
            target: "_blank",
            rel: "noopener nofollow",
        },
        href: internalLink,
        cls: "internal-link",
        text: internalLink,
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
        updateProperties(app, file, fullKey, link.textContent || "", "link");
        link.setAttribute("href", link.textContent || "");
        link.setAttribute("data-href", link.textContent || "");
        link.contentEditable = "false";
    });
}