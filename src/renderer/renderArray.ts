import { setIcon } from "obsidian";
import type { NestedPropertiesEditorView } from "../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../views/NestedPropertiesEditor";
import { getFrontmatterValue } from "./getFrontmatterValue";
import { updateProperties } from "./updateProperties";
import { changeKeyName } from "./changeKeyName";
import { getPropertyIcon } from "./getPropertyIcon";
import { renderObjectArray } from "./renderObjectArray";
import { showTypeSwitchMenu } from "./showTypeSwitchMenu";
import { addKeyWrapperResizeHandle } from "./addKeyWrapperResizeHandle";
import { renderArrayValueContainer } from "./renderArrayValueContainer";


export function renderArray(
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
    const arrayType = array.some(item => typeof item === 'object' && item !== null) ? 'object' : 'primitive';

    const icon = getPropertyIcon(key, "list");

    if (arrayType === 'primitive') {
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
    } else {
        // Object array
        const arrayContainer = update ? container : container.createDiv({
            cls: 'npe-array-container npe-object-array',
            attr: { 'data-key': fullKey, 'data-level': level }
        });
        renderObjectArray(view, key, array, arrayContainer, level, fullKey, filterKeys);
    }
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

function isArrayOfArrays(arr: any[]): boolean {
    return Array.isArray(arr) && arr.length > 0 && arr.every(item => Array.isArray(item));
}