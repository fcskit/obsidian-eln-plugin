import { Menu } from "obsidian";
import { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
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
    
    // IMPORTANT: Get the current fullKey from the container's data-key attribute
    // This ensures we use the updated key if the field was renamed
    const currentFullKey = container.getAttribute("data-key") || fullKey;
    
    // Also update the key variable to match the current key name
    const currentKey = currentFullKey.split(".").pop() || key;
    
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
                        const value = getFrontmatterValue(app, currentFullKey);
                        
                        if (newDataType === 'object') {
                            if (value) newValue = { key: value } as FrontmatterObject
                            else newValue = defaultValues['object'] as FrontmatterObject;
                            
                            container.empty();
                            container.setAttribute('data-type', newDataType);
                            container.className = 'npe-object-container';
                            renderObjectContainer(view, currentKey, newValue as FrontmatterObject, container, level, currentFullKey, [], isKeyOfArrayObject);
                            // Use internal update to prevent full re-render
                            updateProperties(view.app, view.currentFile!, currentFullKey, newValue as FrontmatterValue, newDataType);
                        } else if (newDataType === 'list') {
                            newValue = value ? [value] : defaultValues['array'];
                            
                            container.empty();
                            container.setAttribute('data-type', newDataType);
                            container.className = 'npe-array-container npe-primitive-array';
                            renderArray(view, currentKey, newValue as FrontmatterValue[], container, level, currentFullKey, [], true);
                            // Use internal update to prevent full re-render
                            updateProperties(view.app, view.currentFile!, currentFullKey, newValue as FrontmatterValue, newDataType);
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
                            
                            container.empty();
                            container.setAttribute('data-type', newDataType);
                            const update = true; // We are updating the primitive value
                            renderPrimitive(view, currentKey, newInputValue as FrontmatterPrimitive, container, level, currentFullKey, isKeyOfArrayObject, update);
                            // Use internal update to prevent full re-render
                            updateProperties(view.app, view.currentFile!, currentFullKey, newInputValue as FrontmatterValue, newDataType);
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