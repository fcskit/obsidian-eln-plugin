import type { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import type { FrontmatterValue, FrontmatterObject, FrontmatterObjectArray } from "../../../../types/core";
import { renderObjectArray } from "./renderObjectArray";
import { renderPrimitiveArray } from "./renderPrimitiveArray";


export function renderArray(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    key: string,
    array: Array<FrontmatterValue>,
    container: HTMLElement,
    level: number,
    parentKey: string,
    filterKeys: string[],
    update = false
): void {
    const fullKey = parentKey;
    const arrayType = array.some(item => typeof item === 'object' && item !== null && !Array.isArray(item)) ? 'object' : 'primitive';

    if (arrayType === 'primitive') {
        // Filter to primitive types only
        const primitiveArray = array.filter((item): item is string | number | boolean | null => 
            typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean' || item === null
        );
        renderPrimitiveArray(view, key, primitiveArray, container, level, fullKey, filterKeys, update);
    } else {
        // Filter to object types only
        const objectArray = array.filter((item): item is FrontmatterObject => 
            typeof item === 'object' && item !== null && !Array.isArray(item)
        );
        const arrayContainer = update ? container : container.createDiv({
            cls: 'npe-array-container npe-object-array',
            attr: { 'data-key': fullKey, 'data-level': level }
        });
        renderObjectArray(view, key, objectArray as FrontmatterObjectArray, arrayContainer, level, fullKey, filterKeys);
    }
}
