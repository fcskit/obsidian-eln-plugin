import { FrontMatterCache } from "obsidian";
import type { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import type { FrontmatterArray, FrontmatterObject, FrontmatterPrimitive } from "../../../../types/core";
import { renderArray } from "./renderArray";
import { renderPrimitive } from "./renderPrimitive";
import { renderObjectContainer } from "./renderObjectContainer";

export function renderObject(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    obj: FrontMatterCache | FrontmatterObject,
    parent: HTMLElement,
    filterKeys: string[] = [],
    level: number = 0,
    parentKey: string = "",
    isArrayItem: boolean = false
): void {

    if (!obj || typeof obj !== "object") {
        return;
    }

    Object.entries(obj).forEach(([key, value]) => {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;

        // Skip keys in the filter list
        if (filterKeys.includes(fullKey)) {
            return;
        }

        if (Array.isArray(value)) {
            renderArray(view, key, value as FrontmatterArray, parent, level, fullKey, filterKeys);
        } else if (typeof value === "object" && value !== null) {
            renderObjectContainer(view, key, value as FrontmatterObject, parent, level, fullKey, filterKeys);
        } else {
            renderPrimitive(view, key, value as FrontmatterPrimitive, parent, level, fullKey);
        }
    });
}