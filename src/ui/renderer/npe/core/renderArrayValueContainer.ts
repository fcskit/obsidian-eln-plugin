import { getDataType } from "../helpers/getDataType";
import { getFrontmatterValue } from "../helpers/getFrontmatterValue";
import { updateProperties } from "../utils/updateProperties";
import { createInternalLinkElement } from "../elements/createInternalLinkElement";
import { createExternalLinkElement } from "../elements/createExternalLinkElement";
import { latexToHTML } from "../helpers/latexUtils";
import { createEditableDiv } from "../elements/createEditableDiv";
import type { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import type { FrontmatterValue } from "../../../../types/core";

export function renderArrayValueContainer(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    valueContainer: HTMLElement,
    array: Array<FrontmatterValue>,
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
            const linkValue = typeof item === 'string' ? item.slice(2, -2) : String(item);
            createInternalLinkElement(view, linkValue, itemContainer, `${fullKey}.${index}`);
        } else if (itemDataType === 'external-link') {
            const linkValue = typeof item === 'string' ? item : String(item);
            createExternalLinkElement(view, linkValue, itemContainer, `${fullKey}.${index}`);
        } else if (itemDataType === 'latex') {
            const latexValue = typeof item === 'string' ? item.slice(1, -1) : String(item);
            const latexDisplay = itemContainer.createDiv({ cls: 'npe-list-item-latex' });
            latexDisplay.innerHTML = latexToHTML(latexValue);
            // Add contentEditable support for latex editing
            latexDisplay.contentEditable = "true";
            view.registerDomEvent(latexDisplay, 'blur', () => {
                // Use internal update method to prevent full re-render
                if ('updatePropertiesInternal' in view && typeof view.updatePropertiesInternal === 'function') {
                    view.updatePropertiesInternal(`${fullKey}.${index}`, latexDisplay.textContent, itemDataType);
                } else {
                    updateProperties(view.app, view.currentFile!, `${fullKey}.${index}`, latexDisplay.textContent, itemDataType);
                }
            });
        } else if (itemDataType === 'string' || itemDataType === 'number') {
            const input = itemContainer.createDiv({ cls: 'npe-list-item-value', text: String(item) });
            input.contentEditable = "true";
            view.registerDomEvent(input, 'blur', () => {
                // Use internal update method to prevent full re-render for individual value changes
                if ('updatePropertiesInternal' in view && typeof view.updatePropertiesInternal === 'function') {
                    view.updatePropertiesInternal(`${fullKey}.${index}`, input.textContent, itemDataType);
                } else {
                    updateProperties(view.app, view.currentFile!, `${fullKey}.${index}`, input.textContent, itemDataType);
                }
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
            
            // Use editable divs for text/number inputs, HTML inputs for date/checkbox
            if (inputType === 'text' || inputType === 'number') {
                const editableDiv = createEditableDiv(
                    itemContainer,
                    String(item),
                    `Enter ${inputType === "number" ? "number" : "text"}...`,
                    inputType as "text" | "number",
                    (newValue) => {
                        // Use internal update method to prevent full re-render for individual value changes
                        if ('updatePropertiesInternal' in view && typeof view.updatePropertiesInternal === 'function') {
                            view.updatePropertiesInternal(`${fullKey}.${index}`, newValue, itemDataType);
                        } else {
                            updateProperties(view.app, view.currentFile!, `${fullKey}.${index}`, newValue, itemDataType);
                        }
                        // Update the current array from frontmatter (better approach than modifying passed array)
                        const currentArray = getFrontmatterValue(app, fullKey);
                        if (Array.isArray(currentArray) && currentArray[index] !== undefined) {
                            currentArray[index] = newValue;
                        }
                    }
                );
                editableDiv.setAttribute('data-key', `${fullKey}.${index}`);
                editableDiv.setAttribute('data-type', itemDataType);
            } else {
                // Use traditional HTML input for date, checkbox, and other input types
                const input = itemContainer.createEl('input', {
                    type: inputType,
                    value: typeof item === 'string' || typeof item === 'number' ? String(item) : '',
                    attr: { 'data-key': `${fullKey}.${index}`, 'data-type': itemDataType }
                });
                input.oninput = () => {
                    // Use internal update method to prevent full re-render for individual value changes
                    if ('updatePropertiesInternal' in view && typeof view.updatePropertiesInternal === 'function') {
                        view.updatePropertiesInternal(`${fullKey}.${index}`, input.value, itemDataType);
                    } else {
                        updateProperties(view.app, view.currentFile!, `${fullKey}.${index}`, input.value, itemDataType);
                    }
                    // Update the current array from frontmatter (better approach than modifying passed array)
                    const currentArray = getFrontmatterValue(app, fullKey);
                    if (Array.isArray(currentArray) && currentArray[index] !== undefined) {
                        currentArray[index] = input.value;
                    }
                };
            }
        }

        // --- Remove Button for Array Item ---
        const removeButton = itemContainer.createDiv({ cls: 'npe-button npe-button--remove', text: '×' });
        view.registerDomEvent(removeButton, 'click', () => {
            // Get current array from the frontmatter (like old JS version)
            const currentArray = getFrontmatterValue(app, fullKey);
            if (Array.isArray(currentArray)) {
                currentArray.splice(index, 1);
                // Clear content of the value container and re-render (like old JS version)
                valueContainer.innerHTML = '';
                renderArrayValueContainer(view, valueContainer, currentArray as Array<FrontmatterValue>, fullKey);
                // Use internal update to prevent full view re-render
                if ('updatePropertiesInternal' in view && typeof view.updatePropertiesInternal === 'function') {
                    view.updatePropertiesInternal(fullKey, currentArray, 'array');
                } else {
                    updateProperties(view.app, view.currentFile!, fullKey, currentArray, 'array');
                }
            }
        });
    });

    // --- Add Button ---
    const addButton = valueContainer.createDiv({ cls: 'npe-button npe-button--add', text: '+' });
    view.registerDomEvent(addButton, 'click', () => {
        // Get current array from the frontmatter (like old JS version)
        const currentArray = getFrontmatterValue(app, fullKey);
        if (Array.isArray(currentArray)) {
            const newItem = 'new item';
            currentArray.push(newItem);
            // Clear content of the value container and re-render (like old JS version)
            valueContainer.innerHTML = '';
            renderArrayValueContainer(view, valueContainer, currentArray as Array<FrontmatterValue>, fullKey);
            // Use internal update to prevent full view re-render
            if ('updatePropertiesInternal' in view && typeof view.updatePropertiesInternal === 'function') {
                view.updatePropertiesInternal(fullKey, currentArray, 'array');
            } else {
                updateProperties(view.app, view.currentFile!, fullKey, currentArray, 'array');
            }
        }
    });
}