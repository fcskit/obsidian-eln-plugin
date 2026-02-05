import type { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import { updateProperties } from "../utils/updateProperties";

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

    view.registerDomEvent(editableDiv, "click", () => {
        link.contentEditable = "true";
        link.focus();
    });

    view.registerDomEvent(link, "blur", () => {
        const newValue = link.textContent || "";
        if ('updatePropertiesInternal' in view && typeof view.updatePropertiesInternal === 'function') {
            view.updatePropertiesInternal(fullKey, newValue, "external-link");
        } else {
            updateProperties(view.app, view.currentFile!, fullKey, newValue, "external-link");
        }
        link.contentEditable = "false";
    });
}
