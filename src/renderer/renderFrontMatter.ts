import { setIcon, FrontMatterCache } from "obsidian";
import { renderObject } from "./renderObject";
import { createToggleButton } from "./createToggleButton";
import { createReloadButton } from "./createReloadButton";
import { createAddPropertyButton } from "./createAddPropertyButton";
import type { NestedPropertiesEditorView } from "../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../views/NestedPropertiesEditor";


export function renderFrontMatter(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    subKey: string = "",
    excludeKeys: string[] = [],
    actionButtons: boolean = true,
    cssclasses: string[] = []
): HTMLElement {
    const app = view.app;
    const container = view.contentEl.createDiv({ cls: "npe-view-container" });
    // Add custom css classes
    cssclasses.forEach(cls => container.classList.add(cls));
    // Create container for buttons if enabled
    let buttonContainer: HTMLElement | null = null;
    if (actionButtons) {
        buttonContainer = container.createDiv({ cls: "npe-button-container" });
    }
    // Create container for frontmatter
    const propertiesContainer = container.createDiv({ cls: "npe-properties-container" });

    // Create a toggle button at the top of the container
    if (view.currentFile && view.currentFile.extension === "md") {
        const frontMatter = app.metadataCache.getFileCache(view.currentFile)?.frontmatter as FrontMatterCache | object;

        let parentKey = "";
        let fm = frontMatter;
        // If a subKey is provided, navigate to that key in the frontmatter

        if (frontMatter && typeof frontMatter === "object" && subKey !== "") {
            subKey.split(".").forEach((key) => (fm = (fm as any)[key]));
            parentKey = subKey;
        }
        if (buttonContainer) {
            // Create an add property button at the top of the container
            createAddPropertyButton(view, buttonContainer, propertiesContainer);
            // Create a toggle button to show/hide the properties
            createToggleButton(view, buttonContainer, propertiesContainer);
            // Create a reload button at the top of the container
            createReloadButton(view, buttonContainer, propertiesContainer, parentKey, excludeKeys);
        }
    
        renderObject(view, fm, propertiesContainer, excludeKeys, 0, parentKey);
    } else {
        const infoContainer = propertiesContainer.createDiv({ cls: "npe-info-container" });
        const infoIcon = infoContainer.createDiv({ cls: "npe-info-icon" });
        setIcon(infoIcon, "info");
        const infoMessage = infoContainer.createDiv({ cls: "npe-info-message" });
        infoMessage.textContent = `The current file is not a valid markdown file. Please open a markdown file to view and edit its frontmatter.`;
    }
    return container;
}