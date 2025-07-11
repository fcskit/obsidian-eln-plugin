import { getDataType } from "../helpers/getDataType";
import { getFrontmatterValue } from "../helpers/getFrontmatterValue";
import { updateProperties } from "../legacy/updateProperties";
import { createInternalLinkElement } from "../elements/createInternalLinkElement";
import { createExternalLinkElement } from "../elements/createExternalLinkElement";
import type { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";

export function renderArrayValueContainer(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    valueContainer: HTMLElement,
    array: any[],
    fullKey: string
) {
    const app = view.app;
    const key = fullKey.split('.').pop();

    array.forEach((item, index) => {
        const itemDataType = getDataType(item);
        const itemContainer = valueContainer.createDiv({ cls: 'npe-list-item' });
        if (key === 'tags' || key === 'tag') {
            itemContainer.addClass('npe-tag-item');
        }

        if (itemDataType === 'link') {
            createInternalLinkElement(view, item.slice(2, -2), itemContainer, `${fullKey}.${index}`);
        } else if (itemDataType === 'external-link') {
            createExternalLinkElement(view, item, itemContainer, `${fullKey}.${index}`);
        } else if (itemDataType === 'string' || itemDataType === 'number') {
            const input = itemContainer.createDiv({ cls: 'npe-list-item-value', text: String(item) });
            input.contentEditable = "true";
            view.registerDomEvent(input, 'blur', () => {
                updateProperties(view, `${fullKey}.${index}`, input.textContent, itemDataType);
            });
        } else {
            let inputType: string;
            switch (itemDataType) {
                case 'date':
                    inputType = 'date';
                    break;
                case 'boolean':
                    inputType = 'checkbox';
                    break;
                default:
                    inputType = 'text';
            }
            const input = itemContainer.createEl('input', {
                type: inputType,
                value: item,
                attr: { 'data-key': `${fullKey}.${index}`, 'data-type': itemDataType }
            });
            input.oninput = () => {
                updateProperties(view, `${fullKey}.${index}`, input.value, itemDataType);
                array[index] = input.value;
            };
        }

        // --- Remove Button for Array Item ---
        const removeButton = itemContainer.createDiv({ cls: 'npe-button npe-button--remove', text: '×' });
        view.registerDomEvent(removeButton, 'click', () => {
            const arr = getFrontmatterValue(app, fullKey);
            arr.splice(index, 1);
            valueContainer.innerHTML = '';
            renderArrayValueContainer(view, valueContainer, arr, fullKey);
            updateProperties(view, fullKey, arr, 'array');
        });
    });

    // --- Add Button ---
    const addButton = valueContainer.createDiv({ cls: 'npe-button npe-button--add', text: '+' });
    view.registerDomEvent(addButton, 'click', () => {
        const arr = getFrontmatterValue(app, fullKey);
        arr.push('new item');
        valueContainer.innerHTML = '';
        renderArrayValueContainer(view, valueContainer, arr, fullKey);
        updateProperties(view, fullKey, arr, 'array');
    });
}