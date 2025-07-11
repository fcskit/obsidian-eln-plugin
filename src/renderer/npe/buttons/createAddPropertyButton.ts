import { setIcon } from "obsidian";
import { addProperty } from "../helpers/addProperty";
import { renderPrimitive } from "../core/renderPrimitive";
import type { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";

export function createAddPropertyButton(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    buttonContainer: HTMLElement,
    propertiesContainer: HTMLElement
) {
    const app = view.app;
    const newPropertyKey = "new key"; // Default key for new property
    let newKey = newPropertyKey; // Variable to hold the key for the new property
    const newPropertyValue = "new item"; // Default value for new property
    const plusBtn = buttonContainer.createDiv({ cls: "clickable-icon" });
    plusBtn.setAttribute("aria-label", "Add new property");
    setIcon(plusBtn, "plus");
    view.registerDomEvent(plusBtn, "click", async (evt) => {
        const file = view.currentFile;
        if (file) {
            // Check if the frontmatter already contains the new property key
            const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
            if (frontmatter && frontmatter[newPropertyKey]) {
                // If the property already exists append a number to the key
                let i = 1;
                newKey = `${newPropertyKey} ${i}`;
                while (frontmatter[newKey]) {
                    i++;
                    newKey = `${newPropertyKey} ${i}`;
                }
            }
            // Update the frontmatter of the current file with the new property
            await addProperty(app, file, newKey, newPropertyValue, "string");
            // Render the new property in the view
            renderPrimitive(
                view,
                newKey,
                newPropertyValue,
                propertiesContainer,
                0,
                newKey,
                false,
                false
            );
        }
    });
    return plusBtn;
}