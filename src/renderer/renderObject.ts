import { FrontMatterCache } from "obsidian";
import type { NestedPropertiesEditorView } from "../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../views/NestedPropertiesEditor";
import { renderArray } from "./renderArray";
import { renderPrimitive } from "./renderPrimitive";
import { renderObjectContainer } from "./renderObjectContainer";

export function renderObject(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    obj: FrontMatterCache,
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
            // console.debug(`renderObject: Rendering array for key: ${key}, fullKey: ${fullKey}`);
            renderArray(view, key, value, parent, level, fullKey, filterKeys);
        } else if (typeof value === "object" && value !== null) {
            // console.debug(`renderObject: Rendering object for key: ${key}, fullKey: ${fullKey}`);
            renderObjectContainer(view, key, value, parent, level, fullKey, filterKeys);
        } else {
            // console.debug(`renderObject: Rendering primitive for key: ${key}, fullKey: ${fullKey}`);
            renderPrimitive(view, key, value, parent, level, fullKey);
        }
    });
}