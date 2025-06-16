import { setIcon } from "obsidian";
import type { NestedPropertiesEditorView } from "views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "views/NestedPropertiesEditor";
import { getPropertyIcon } from "./getPropertyIcon";
import { addToggleEvent } from "./addToggleEvent";
import { changeKeyName } from "./changeKeyName";
import { updateProperties } from "./updateProperties";
import { renderObject } from "./renderObject";
import { addKeyWrapperResizeHandle } from "./addKeyWrapperResizeHandle";


export function renderObjectContainer(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    key: string,
    value: Record<string, any>,
    parent: HTMLElement,
    level: number,
    fullKey: string,
    filterKeys: string[],
    isArrayItem: boolean = false
): void {
    const app = view.app;
    const icon = getPropertyIcon(key, "object");

    const container = parent.createDiv({
        cls: "npe-object-container",
        attr: { "data-level": level, "data-key": fullKey }
    });

    // --- Key Container ---
    const keyContainer = container.createDiv({
        cls: "npe-object-key-container",
        attr: { "style": `--npe-data-level: ${level};` }
    });
    const keyWrapper = keyContainer.createDiv({ cls: "npe-key-wrapper npe-object" });
    keyWrapper.style.setProperty("--npe-data-level", level.toString());
    const keyDiv = keyWrapper.createDiv({ cls: "npe-object-key" });
    const iconContainer = keyDiv.createDiv({ cls: "npe-icon-container" });
    setIcon(iconContainer, icon);

    const keyLabelDiv = keyDiv.createDiv({ cls: "npe-object-key-label", text: key });
    const editableDiv = keyDiv.createDiv({ cls: "npe-make-editable" });

    // --- Editable Key Event ---
    view.registerDomEvent(editableDiv, "click", (evt: MouseEvent) => {
        keyLabelDiv.contentEditable = "true";
        keyLabelDiv.focus();

        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(keyLabelDiv);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
    });
    view.registerDomEvent(keyLabelDiv, "blur", async () => {
        const newKey = keyLabelDiv.textContent?.trim();
        if (newKey && newKey !== key) {
            // If the key of the parent object has been renamed the fullKey variable may
            // longer point to the correct object in the frontmatter.
            // Therefore we need to update the fullKey from the data-key attribute of the container
            const oldFullKey = container.getAttribute("data-key") || fullKey;
            fullKey = oldFullKey.split('.').slice(0, -1).concat(newKey).join('.');
            await changeKeyName(app, oldFullKey, newKey);
            // Update the key and fullKey variables and the data-key attribute
            key = newKey;
            container.setAttribute("data-key", fullKey);
            // Update the data-key attributes of all child elements
            const childElements = container.querySelectorAll("[data-key]");
            childElements.forEach((el) => {
                const childKey = (el as HTMLElement).getAttribute("data-key");
                if (childKey) {
                    const newChildKey = childKey.replace(oldFullKey, fullKey);
                    (el as HTMLElement).setAttribute("data-key", newChildKey);
                }
            });
        }
        keyLabelDiv.contentEditable = "false";
    });

    // --- Add Property Button ---
    const addButton = keyWrapper.createDiv({ cls: "npe-button npe-button--add", text: "+" });
    view.registerDomEvent(addButton, "click", () => {
        const newKey = "new key";
        const newValue = "new value";
        value[newKey] = newValue;
        propertiesContainer.empty();
        renderObject(view, value, propertiesContainer, filterKeys, level + 1, fullKey);
        updateProperties(view, fullKey, value, "object");
    });

    // --- Value Spacer ---
    keyContainer.createDiv({ cls: "npe-object-value-spacer" });

    // --- add resize handle ---
    const npeViewContainer = container.closest(".npe-view-container");
    if (npeViewContainer) {
        addKeyWrapperResizeHandle(view, keyWrapper, npeViewContainer as HTMLElement);
    }

    // --- Remove Button ---
    const removeButton = keyContainer.createDiv({ cls: "npe-button npe-button--remove", text: "×" });
    view.registerDomEvent(removeButton, "click", () => {
        updateProperties(view, fullKey, undefined, "undefined");
        container.remove();
    });

    // --- Properties Container ---
    const propertiesContainer = container.createDiv({ cls: "npe-object-properties-container" });
    if (level > 0) {
        propertiesContainer.addClass("hidden");
    }

    // --- Toggle Fold/Unfold ---
    addToggleEvent(view, iconContainer, keyLabelDiv, propertiesContainer);

    // --- Render Properties ---
    renderObject(view, value, propertiesContainer, filterKeys, level + 1, fullKey, isArrayItem);
}