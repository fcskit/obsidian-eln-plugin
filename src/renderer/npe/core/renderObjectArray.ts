import { setIcon } from "obsidian";
import type { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import { getPropertyIcon } from "../helpers/getPropertyIcon";
import { addToggleEvent } from "../helpers/addToggleEvent";
import { changeKeyName } from "../legacy/changeKeyName";
import { updateProperties } from "../legacy/updateProperties";
import { getFrontmatterValue } from "../helpers/getFrontmatterValue";
import { renderPrimitive } from "./renderPrimitive";
import { renderArray } from "./renderArray";
import { renderPrimitiveArray } from "./renderPrimitiveArray";
import { renderObjectOfArray } from "./renderObjectOfArray";
import { addKeyWrapperResizeHandle } from "../helpers/addKeyWrapperResizeHandle";


const specialKeys = [
    "tags", "tag", "cssclass", "cssclasses", "author", "series",
    "project", "sample", "process", "analysis"
];

export function renderObjectArray(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    key: string,
    array: Record<string, any>[],
    container: HTMLElement,
    level: number,
    parentKey: string,
    filterKeys: string[]
): void {
    const app = view.app;
    container.className = "npe-array-container npe-object-array";
    let fullKey = parentKey;
    let icon = "boxes";
    if (specialKeys.includes(key)) {
        icon = getPropertyIcon(key, "array");
    }

    // --- Key Container ---
    const keyContainer = container.createDiv({
        cls: "npe-object-key-container",
        attr: { style: `--npe-data-level: ${level};` }
    });
    const keyWrapper = keyContainer.createDiv({
        cls: "npe-key-wrapper npe-object",
        attr: { "style": `--npe-data-level: ${level};`}
    });
    const keyDiv = keyWrapper.createDiv({ cls: "npe-object-key" });
    const iconContainer = keyDiv.createDiv({ cls: "npe-icon-container" });
    setIcon(iconContainer, icon);

    const keyLabelDiv = keyDiv.createDiv({ cls: "npe-key-label npe-object", text: key });
    const editableDiv = keyDiv.createDiv({ cls: "npe-make-editable" });
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
            keyLabelDiv.setAttribute("data-key", newKey);
            // Update the key and fullKey variables and the data-key attribute
            key = newKey;
            container.setAttribute("data-key", fullKey);
            // Update the data-key attributes of all child elements
            const childElements = container.querySelectorAll("[data-key]");
            childElements.forEach((el) => {
                const childKey = el.getAttribute("data-key");
                if (childKey) {
                    const newChildKey = childKey.replace(oldFullKey, fullKey);
                    el.setAttribute("data-key", newChildKey);
                }
            });
        }
    });


    // --- Fold/Unfold ---
    const arrayObjectsContainer = container.createDiv({ cls: "npe-array-objects-container" });
    if (level > 0) arrayObjectsContainer.classList.add("hidden");
    addToggleEvent(view, iconContainer, keyLabelDiv, arrayObjectsContainer);

    // --- Add Button ---
    const addButton = keyWrapper.createDiv({ cls: "npe-button npe-button--add", text: "+" });
    view.registerDomEvent(addButton, "click", () => {
        const arr = getFrontmatterValue(app, fullKey) as Record<string, any>[];
        if (arr.length === 0) {
            arr.push({});
        } else {
            const keys = Object.keys(arr[0]);
            const newObj: Record<string, any> = {};
            keys.forEach(k => { newObj[k] = "~~"; });
            arr.push(newObj);
        }
        renderObjectOfArray(view, key, arr[arr.length - 1], arr.length - 1, arrayObjectsContainer, level, `${fullKey}.${arr.length - 1}`, filterKeys);
        updateProperties(view, fullKey, arr, "array");
    });

    // --- Add resize handle for key wrapper ---
    const npeViewContainer = container.closest(".npe-view-container");
    if (npeViewContainer) {
        addKeyWrapperResizeHandle(view, keyWrapper, npeViewContainer as HTMLElement);
    }

    keyContainer.createDiv({ cls: "npe-object-value-spacer" });

    // --- Remove Button ---
    const removeButton = keyContainer.createDiv({ cls: "npe-button npe-button--remove", text: "×" });
    view.registerDomEvent(removeButton, "click", () => {
        updateProperties(view, fullKey, undefined, "undefined");
        container.remove();
    });

    // --- Render Each Object in Array ---
    array.forEach((item, index) => {
        if (Array.isArray(item) && item.every(value => typeof value !== "object" || value === null)) {
            console.debug(`renderObjectArray: Rendering primitive array for key: ${key}, index: ${index}`);
            // It's a nested primitive array, render with a virtual key
            renderPrimitiveArray(view, `${key} #${index + 1}`, item, arrayObjectsContainer, level + 1, `${fullKey}.${index}`, filterKeys, false);
        } else if (Array.isArray(item) && item.every(value => Array.isArray(value))) {
            console.debug(`renderObjectArray: Rendering nested array for key: ${key}, index: ${index}`);
            // Nested array of objects or mixed, call renderArray recursively
            renderArray(view, `${key} #${index + 1}`, item, arrayObjectsContainer, level + 1, `${parentKey}.${index}`, filterKeys, false);
        } else {
            // Array may contain mixed item types
            if (typeof item === "object" && item !== null) {
                console.debug(`renderObjectArray: Rendering object of array for key: ${key}, index: ${index}`);
                renderObjectOfArray(view, key, item, index, arrayObjectsContainer, level, `${fullKey}.${index}`, filterKeys);
            } else if (Array.isArray(item)) {
                console.debug(`renderObjectArray: Rendering nested array for key: ${key}, index: ${index}`);
                renderArray(view, `${key} #${index + 1}`, item, arrayObjectsContainer, level + 1, `${parentKey}.${index}`, filterKeys, false);
            } else if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
                console.debug(`renderObjectArray: Rendering primitive for key: ${key}, index: ${index}`);
                renderPrimitive(view, `${key} #${index + 1}`, item, arrayObjectsContainer, level + 1, `${fullKey}.${index}`, false);
            } else {
                console.warn(`renderObjectArray: Unsupported item type ${typeof item} for key: ${key}, index: ${index}`, item);
            }
        }
    });
}