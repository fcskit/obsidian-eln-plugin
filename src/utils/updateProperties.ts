import { App, TFile } from "obsidian";

/**
 * Faithful port of updateProperties from renderer/updateProperties.ts, but for a given TFile.
 * Updates the frontmatter of the given file, supporting nested keys via dot notation and all renderer logic.
 * @param app - The Obsidian app instance.
 * @param file - The TFile to update.
 * @param key - The key of the frontmatter property, in dot notation.
 * @param value - The new value to set for the frontmatter property.
 * @param dataType - The data type of the new value.
 */
export async function updateProperties(
    app: App,
    file: TFile,
    key: string,
    value: any,
    dataType: string = "string"
): Promise<void> {
    if (!file) return;

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
    // Set value to undefined if it is NaN (and a number), null, or an empty object
    if ((typeof value === "number" && isNaN(value)) || value === null || JSON.stringify(value) === "{}") {
        value = undefined;
    }

    // Update or remove the property in the frontmatter
    await app.fileManager.processFrontMatter(file, (frontmatter) => {
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
                obj.splice(Number(keys[keys.length - 1]), 1);
            } else {
                // Remove the property if value is undefined
                delete obj[keys[keys.length - 1]];
            }
        } else {
            // Update the property
            obj[keys[keys.length - 1]] = value;
        }
    });
}
