import { App, TFile } from "obsidian";
import { updateProperties } from "./updateProperties";
import { changeKeyName } from "./changeKeyName";

export const deprecatedToPlural: Record<string, string> = {
    tag: "tags",
    cssclass: "cssclasses",
    alias: "aliases",
    // Add more mappings as needed
};

/**
 * Helper function to convert a value to an array, handling comma-separated strings
 */
function convertToArray(value: any): string[] {
    if (Array.isArray(value)) {
        return value.map(v => typeof v === "string" ? v.trim() : v);
    } else if (typeof value === "string") {
        // Check if it's a comma-separated list
        if (value.includes(",")) {
            return value.split(",").map(v => v.trim()).filter(v => v.length > 0);
        } else {
            return [value.trim()];
        }
    }
    return [];
}

/**
 * Fixes deprecated frontmatter keys in all markdown files in the vault.
 * Iterates over all markdown files and applies fixDeprecatedKey for each deprecated key mapping.
 * @param app - The Obsidian app instance.
 */
export async function fixAllDeprecatedKeysInVault(app: App) {
    const files = app.vault.getMarkdownFiles();
    for (const file of files) {
        for (const [deprecatedKey, pluralKey] of Object.entries(deprecatedToPlural)) {
            console.debug(`Fixing deprecated key in file ${file.path}: ${deprecatedKey} -> ${pluralKey}`);
            await fixDeprecatedKey(app, file, deprecatedKey, pluralKey);
        }
    }
}

export async function fixDeprecatedKey(
    app: App,
    file: TFile,
    deprecatedKey: string,
    pluralKey: string
) {
    const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
    if (!frontmatter) return;

    const hasSingular = Object.prototype.hasOwnProperty.call(frontmatter, deprecatedKey);
    const hasPlural = Object.prototype.hasOwnProperty.call(frontmatter, pluralKey);

    let pluralValue: string[] = [];
    if (hasPlural) {
        pluralValue = convertToArray(frontmatter[pluralKey]);
    }

    let singularValue: string[] = [];
    if (hasSingular) {
        singularValue = convertToArray(frontmatter[deprecatedKey]);
    }

    // Clean tags by removing leading '#' characters
    const cleanTags = (values: string[], isTagField: boolean): string[] => {
        if (!isTagField) return values;
        return values.map(v => typeof v === "string" && v.startsWith("#") ? v.slice(1) : v);
    };

    // Merge and deduplicate if both exist
    if (hasSingular && hasPlural) {
        const merged = Array.from(new Set([...pluralValue, ...singularValue]));
        const cleaned = cleanTags(merged, deprecatedKey === "tag" || pluralKey === "tags");
        await updateProperties(app, file, pluralKey, cleaned, "array");
        await updateProperties(app, file, deprecatedKey, undefined, "undefined");
    } else if (hasSingular && !hasPlural) {
        // Rename singular to plural
        const cleaned = cleanTags(singularValue, deprecatedKey === "tag");
        await changeKeyName(app, file, deprecatedKey, pluralKey);
        await updateProperties(app, file, pluralKey, cleaned, "array");
    } else if (hasPlural && !hasSingular) {
        // Just clean the plural values
        const cleaned = cleanTags(pluralValue, pluralKey === "tags");
        await updateProperties(app, file, pluralKey, cleaned, "array");
    }
}