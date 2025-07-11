import { App } from "obsidian";
import type { TFile } from "obsidian";

/**
 * Adds a new property to the frontmatter of the current file.
 * @param app - The Obsidian app instance.
 * @param key - The key of the frontmatter property, in dot notation.
 * @param value - The value to set for the frontmatter property.
 * @param dataType - The data type of the value.
 */
export async function addProperty(
    app: App,
    file: TFile,
    key: string,
    value: string | number | boolean | Array<string | number | boolean | object> | object,
    dataType: string = "string"
): Promise<void> {
    if (file.extension !== 'md') return;

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
        default:
            break;
    }

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

        // Add the new property
        obj[keys[keys.length - 1]] = value;
    });
}