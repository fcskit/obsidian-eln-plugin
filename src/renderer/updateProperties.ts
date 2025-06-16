import type { NestedPropertiesEditorView } from "views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "views/NestedPropertiesEditor";
/**
 * Updates the frontmatter of the current file.
 * @param view - The NestedPropertiesEditorView instance.
 * @param key - The key of the frontmatter property, in dot notation.
 * @param value - The new value to set for the frontmatter property.
 * @param dataType - The data type of the new value.
 */
export async function updateProperties(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    key: string,
    value: any,
    dataType: string = "string"
): Promise<void> {
    const app = view.app;
    const currentFile = view.currentFile;
    if (!currentFile) return;

    // console.log("Updating frontmatter property:", key, "with value:", value, "and dataType:", dataType);
    // Convert value based on data type
    switch (dataType) {
        case "string":
            value = value.toString();
            break;
        case "link":
            value = `[[${value}]]`;
            break;
        case "external-link":
            value = value.toString();
            break;
        case "number":
            value = Number(value);
            break;
        case "boolean":
            break;
        case "latex":
            value = `$${value}$`;
            break;
        default:
            break;
    }
    // console.log("Converted value:", value);
    // Set value to undefined if it is NaN (and a number), null, or an empty object
    if ((typeof value === "number" && isNaN(value)) || value === null || JSON.stringify(value) === "{}") {
        value = undefined;
    }
    // console.log("Final value to set:", value);

    // Update or remove the property in the frontmatter
    await app.fileManager.processFrontMatter(currentFile, (frontmatter) => {
        const keys = key.split(".");
        let obj = frontmatter;

        // Traverse the keys to reach the target property
        for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) {
                obj[keys[i]] = {};
            }
            obj = obj[keys[i]];
        }

        if (value === undefined) {
            if (Array.isArray(obj)) {
                // Remove the item from the array
                // console.log('Removing the item from the array');
                obj.splice(Number(keys[keys.length - 1]), 1);
            } else {
                // Remove the property if value is undefined
                // console.log('Removing the property from the object');
                delete obj[keys[keys.length - 1]];
            }
        } else {
            // Update the property
            // console.log('Updating the property in the object');
            obj[keys[keys.length - 1]] = value;
        }
    });
}