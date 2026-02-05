import { Menu } from "obsidian";
import type { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import type { FrontmatterObject, FrontmatterValue, FrontmatterPrimitive } from "../../../../types/core";
import { getFrontmatterValue } from "./getFrontmatterValue";
import { renderPrimitive } from "../core/renderPrimitive";
import { renderObjectContainer } from "../core/renderObjectContainer";
import { renderArray } from "../core/renderArray";
import { updateProperties } from "../utils/updateProperties";

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
                            if (value) newValue = { key: value } as FrontmatterObject
                            else newValue = defaultValues['object'] as FrontmatterObject;
                            container.innerHTML = '';
                            container.setAttribute('data-type', newDataType);
                            container.className = 'npe-object-container';
                            renderObjectContainer(view, key, newValue as FrontmatterObject, container, level, fullKey, [], isKeyOfArrayObject);
                            // Use internal update to prevent full re-render
                            if ('updatePropertiesInternal' in view && typeof view.updatePropertiesInternal === 'function') {
                                view.updatePropertiesInternal(fullKey, newValue as FrontmatterValue, newDataType);
                            } else {
                                updateProperties(view.app, view.currentFile!, fullKey, newValue as FrontmatterValue, newDataType);
                            }
                        } else if (newDataType === 'list') {
                            newValue = value ? [value] : defaultValues['array'];
                            container.innerHTML = '';
                            container.setAttribute('data-type', newDataType);
                            container.className = 'npe-array-container npe-primitive-array';
                            renderArray(view, key, newValue as FrontmatterValue[], container, level, fullKey, [], true);
                            // Use internal update to prevent full re-render
                            if ('updatePropertiesInternal' in view && typeof view.updatePropertiesInternal === 'function') {
                                view.updatePropertiesInternal(fullKey, newValue as FrontmatterValue, newDataType);
                            } else {
                                updateProperties(view.app, view.currentFile!, fullKey, newValue as FrontmatterValue, newDataType);
                            }
                        } else {
                            if (value) {
                                if (newDataType === 'link' && container.getAttribute('data-type') === 'text') {
                                    newValue = `[[${value}]]`;
                                    newInputValue = value;
                                } else if (newDataType === 'text' && container.getAttribute('data-type') === 'link') {
                                    const stringValue = typeof value === 'string' ? value : String(value);
                                    newValue = stringValue.slice(2, -2);
                                    newInputValue = newValue;
                                }
                            }
                            container.innerHTML = '';
                            container.setAttribute('data-type', newDataType);
                            const update = true; // We are updating the primitive value
                            renderPrimitive(view, key, newInputValue as FrontmatterPrimitive, container, level, fullKey, isKeyOfArrayObject, update);
                            // Use internal update to prevent full re-render
                            if ('updatePropertiesInternal' in view && typeof view.updatePropertiesInternal === 'function') {
                                view.updatePropertiesInternal(fullKey, newInputValue as FrontmatterValue, newDataType);
                            } else {
                                updateProperties(view.app, view.currentFile!, fullKey, newInputValue as FrontmatterValue, newDataType);
                            }
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