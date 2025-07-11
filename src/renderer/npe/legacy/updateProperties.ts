import { updateProperties as utilsUpdateProperties } from "../../../utils/updateProperties";
import type { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";

/**
 * Legacy wrapper for updateProperties that maintains the old view-based signature
 * for backward compatibility with existing renderer code.
 */
export async function updateProperties(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    key: string,
    value: any,
    dataType: string = "string"
): Promise<void> {
    const app = view.app;
    const file = view.currentFile;
    if (!file) return;
    
    await utilsUpdateProperties(app, file, key, value, dataType);
}