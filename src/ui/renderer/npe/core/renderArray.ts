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
    const arrayType = array.some(item => typeof item === 'object' && item !== null) ? 'object' : 'primitive';

    if (arrayType === 'primitive') {
        renderPrimitiveArray(view, key, array, container, level, fullKey, filterKeys, update);
    } else {
        // Object array
        const arrayContainer = update ? container : container.createDiv({
            cls: 'npe-array-container npe-object-array',
            attr: { 'data-key': fullKey, 'data-level': level }
        });
        renderObjectArray(view, key, array, arrayContainer, level, fullKey, filterKeys);
    }
}
