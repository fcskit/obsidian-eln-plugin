import { setIcon } from "obsidian";
import type { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import { renderObject } from "./renderObject";
import { addToggleEvent } from "../helpers/addToggleEvent";
import { updateProperties } from "../legacy/updateProperties";
import { getPropertyIcon } from "../helpers/getPropertyIcon";
import { renderPrimitive } from "./renderPrimitive";
import { addKeyWrapperResizeHandle } from "../helpers/addKeyWrapperResizeHandle";

export function renderObjectOfArray(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    key: string,
    item: Record<string, any>,
    index: number,
    parent: HTMLElement,
    level: number,
    fullKey: string,
    filterKeys: string[]
): void {
    // --- Array Item Container ---
    const itemContainer = parent.createDiv({
        cls: "npe-array npe-object-container",
        attr: { "data-key": fullKey }
    });

    // --- Key Container ---
    const keyContainer = itemContainer.createDiv({
        cls: "npe-object-key-container",
        attr: { style: `--npe-data-level: ${level + 1};` }
    });

    const keyWrapper = keyContainer.createDiv({
        cls: "npe-key-wrapper npe-object",
        attr: { "style": `--npe-data-level: ${level + 1};` }
    });
    const keyDiv = keyWrapper.createDiv({ cls: "npe-key npe-object" });
    // --- Icon ---
    const icon = getPropertyIcon(key, "object");
    const iconDiv = keyDiv.createDiv({ cls: "npe-key-icon" });
    setIcon(iconDiv, icon);

    // --- Key Label ---
    const keyLabelDiv = keyDiv.createDiv({ cls: "npe-key-label npe-object", text: key });
    keyLabelDiv.createSpan({ text: ` #${index + 1}`, cls: 'npe-array-index' });

    // --- Add Property Button ---
    const addPropertyButton = keyWrapper.createDiv({ cls: "npe-button npe-button--add", text: "+" });
    view.registerDomEvent(addPropertyButton, "click", () => {
        // Add a new property to this object
        const newKey = `new key`;
        const newValue = "new value";
        const newFullKey = `${fullKey}.${newKey}`;
        // Update the parent object with the new property
        updateProperties(view, newFullKey, newValue, "string");
        // Re-render the object to include the new property
        renderPrimitive(view, newKey, newValue, propertiesContainer, level + 2, newFullKey, true);
    });

    // --- Add resize handle for key wrapper ---
    const npeViewContainer = parent.closest(".npe-view-container");
    if (npeViewContainer) {
        addKeyWrapperResizeHandle(view, keyWrapper, npeViewContainer as HTMLElement);
    }

    // --- Remove Button ---
    const removeButton = keyContainer.createDiv({ cls: "npe-button npe-button--remove", text: "×" });
    view.registerDomEvent(removeButton, "click", () => {
        // Remove this item from the array in the parent object
        const arr = parent.parentElement ? Array.from(parent.parentElement.children).filter(child => child !== itemContainer) : [];
        itemContainer.remove();
        // You may want to update the parent array in your data model here as well
        updateProperties(view, fullKey, undefined, "undefined");
    });

    // --- Properties Container (foldable) ---
    const propertiesContainer = itemContainer.createDiv({ cls: "npe-object-properties-container hidden" });

    // --- Toggle Fold/Unfold ---
    addToggleEvent(view, iconDiv, keyLabelDiv, propertiesContainer);

    // --- Render the object properties ---
    renderObject(view, item, propertiesContainer, filterKeys, level + 2, fullKey);
}