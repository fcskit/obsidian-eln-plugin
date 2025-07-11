import { Menu } from "obsidian";
import type { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import { getFrontmatterValue } from "./getFrontmatterValue";
import { renderPrimitive } from "../core/renderPrimitive";
import { renderObjectContainer } from "../core/renderObjectContainer";
import { renderArray } from "../core/renderArray";
import { updateProperties } from "../legacy/updateProperties";

export function showTypeSwitchMenu(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    container: HTMLElement,
    key: string,
    fullKey: string,
    level: number,
    isKeyOfArrayObject: boolean,
) {
    const app = view.app;
    const dataTypes = ['text', 'number', 'boolean', 'link', 'object', 'list'];
    const defaultValues: Record<string, string | number | boolean | object | string[]> = {
        'text': 'new text',
        'number': 0,
        'boolean': false,
        'link': 'new link',
        'object': { newKey: 'new value' },
        'array': ['item1', 'item2']
    };

    const menu = new Menu();

    dataTypes.forEach(newDataType => {
        menu.addItem(item => {
            item.setTitle(newDataType)
                .onClick(() => {
                    let newValue = defaultValues[newDataType];
                    let newInputValue = newValue;
                    if (newDataType !== container.getAttribute('data-type')) {
                        const value = getFrontmatterValue(app, fullKey);
                        if (newDataType === 'object') {
                            if (value) newValue = { key: value }
                            else newValue = defaultValues['object'] as Record<string, string>;
                            container.innerHTML = '';
                            container.setAttribute('data-type', newDataType);
                            container.className = 'npe-object-container';
                            renderObjectContainer(view, key, newValue, container, level, fullKey, [], isKeyOfArrayObject);
                            updateProperties(view, fullKey, newValue, newDataType);
                        } else if (newDataType === 'list') {
                            newValue = value ? [value] : defaultValues['array'];
                            container.innerHTML = '';
                            container.setAttribute('data-type', newDataType);
                            container.className = 'npe-array-container npe-primitive-array';
                            renderArray(view, key, newValue, container, level, fullKey, [], true);
                            updateProperties(view, fullKey, newValue, newDataType);
                        } else {
                            if (value) {
                                if (newDataType === 'link' && container.getAttribute('data-type') === 'text') {
                                    newValue = `[[${value}]]`;
                                    newInputValue = value;
                                } else if (newDataType === 'text' && container.getAttribute('data-type') === 'link') {
                                    newValue = value.slice(2, -2);
                                    newInputValue = newValue;
                                }
                            }
                            container.innerHTML = '';
                            container.setAttribute('data-type', newDataType);
                            const update = true; // We are updating the primitive value
                            renderPrimitive(view, key, newValue, container, level, fullKey, isKeyOfArrayObject, update);
                            updateProperties(view, fullKey, newInputValue, newDataType);
                        }
                    }
                });
        });
    });

    menu.showAtMouseEvent({ 
        // @ts-ignore
        clientX: container.getBoundingClientRect().left + 20, 
        clientY: container.getBoundingClientRect().top + 20, 
        preventDefault: () => {}, 
        stopPropagation: () => {} 
    } as MouseEvent);
}