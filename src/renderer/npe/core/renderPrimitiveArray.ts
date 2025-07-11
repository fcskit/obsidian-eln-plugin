import { setIcon } from "obsidian";
import { getPropertyIcon } from "../helpers/getPropertyIcon";
import { changeKeyName } from "../legacy/changeKeyName";
import { updateProperties } from "../legacy/updateProperties";
import { showTypeSwitchMenu } from "../helpers/showTypeSwitchMenu";
import { addKeyWrapperResizeHandle } from "../helpers/addKeyWrapperResizeHandle";
import { renderArrayValueContainer } from "./renderArrayValueContainer";
import type { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";

export function renderPrimitiveArray(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    key: string,
    array: any[],
    container: HTMLElement,
    level: number,
    parentKey: string,
    filterKeys: string[],
    update = false
): void {
    const app = view.app;
    const fullKey = parentKey;
    const icon = getPropertyIcon(key, "list");

    const arrayContainer = update ? container : container.createDiv({
        cls: 'npe-array-container npe-primitive-array',
        attr: { 'data-key': fullKey, 'data-level': level }
    });

    // --- Key Wrapper ---
    const keyWrapper = arrayContainer.createDiv({
        cls: 'npe-key-wrapper npe-array',
        attr: { 'style': `--npe-data-level: ${level};` }
    });
    const keyContainer = keyWrapper.createDiv({ cls: 'npe-key npe-array' });
    const iconContainer = keyContainer.createDiv({ cls: 'npe-key-icon' });
    setIcon(iconContainer, icon);
    const keyLabelDiv = keyContainer.createDiv({ cls: 'npe-key-label npe-array', text: key });
    keyLabelDiv.contentEditable = "true";
    view.registerDomEvent(keyLabelDiv, 'blur', async () => {
        const newKey = keyLabelDiv.textContent?.trim();
        if (newKey && newKey !== key) {
            await changeKeyName(app, fullKey, newKey);
            updateDataKeys(arrayContainer, fullKey, newKey);
        }
    });

    // --- Options Button ---
    const optionsButton = keyWrapper.createDiv({ cls: 'npe-button npe-button--options' });
    setIcon(optionsButton, 'ellipsis');
    view.registerDomEvent(optionsButton, 'click', () => {
        showTypeSwitchMenu(view, arrayContainer, key, fullKey, level, false);  
    });

    // --- Add resize handle for key wrapper ---
    const npeViewContainer = arrayContainer.closest('.npe-view-container');
    if (npeViewContainer) {
        addKeyWrapperResizeHandle(view, keyWrapper, npeViewContainer as HTMLElement);
    }

    // --- Value Container ---
    const valueContainer = arrayContainer.createDiv({ cls: 'npe-array-value-container', attr: { 'style': `--npe-data-level: ${level};` } });
    renderArrayValueContainer(view, valueContainer, array, fullKey);

    // --- Remove Button ---
    const removeButton = arrayContainer.createDiv({ cls: 'npe-button npe-button--remove', text: '×' });
    view.registerDomEvent(removeButton, 'click', () => {
        updateProperties(view, fullKey, undefined, 'undefined');
        arrayContainer.remove();
    });
}

// Helper: Recursively update data-key attributes when renaming
function updateDataKeys(element: HTMLElement, oldKey: string, newKey: string) {
    const keybase = oldKey.split('.').slice(0, -1).join('.');
    const newFullKey = `${keybase}.${newKey}`;
    element.setAttribute('data-key', newFullKey);
    const children = element.querySelectorAll('[data-key]');
    children.forEach(child => {
        const fullKey = child.getAttribute('data-key');
        if (fullKey) {
            const newFullKeyChild = fullKey.replace(oldKey, newFullKey);
            child.setAttribute('data-key', newFullKeyChild);
        }
    });
}