import { setIcon } from "obsidian";
import { NestedPropertiesEditorView } from "../views/NestedPropertiesEditor";
import { NestedPropertiesEditorCodeBlockView } from "../views/NestedPropertiesEditor";
import { renderObject } from "./renderObject";

export function createReloadButton(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    buttonContainer: HTMLElement,
    propertiesContainer: HTMLElement,
    parentKey: string,
    filterKeys: string[]
): HTMLElement {
    const reloadButton = buttonContainer.createDiv({ cls: "clickable-icon" });
    reloadButton.setAttribute("aria-label", "Reload Frontmatter");
    // const reloadIcon = reloadButton.createDiv({ cls: "npe-button-icon" });
    // reloadButton.createDiv({ cls: "npe-button-label", text: "Reload" });

    // Set the icon for the reload button
    setIcon(reloadButton, "refresh-cw");
    // setIcon(reloadIcon, "refresh-cw");

    view.registerDomEvent(reloadButton, "click", async () => {
        const activeFile = view.app.workspace.getActiveFile();
        if (!activeFile) return;

        const fileCache = view.app.metadataCache.getFileCache(activeFile);
        let frontmatter = fileCache?.frontmatter;

        if (parentKey) {
            parentKey.split(".").forEach((key) => {
                frontmatter = frontmatter?.[key];
            });
        }

        propertiesContainer.innerHTML = "";
        if (frontmatter) {
            renderObject(view, frontmatter, propertiesContainer, filterKeys, 0, parentKey);
        }
    });

    return reloadButton;
}