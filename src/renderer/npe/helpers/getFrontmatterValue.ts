import { App, TFile } from "obsidian";

/**
 * Get frontmatter value by key.
 * @param app - The Obsidian app instance.
 * @param fullKey - The key of the frontmatter property, in dot notation.
 * @returns The value of the frontmatter property or undefined if not found.
 */
export function getFrontmatterValue(app: App, fullKey: string): any {
    const currentFile = app.workspace.getActiveFile();
    if (!currentFile) return undefined;

    const frontmatter = app.metadataCache.getFileCache(currentFile)?.frontmatter;
    if (!frontmatter) return undefined;

    const keys = fullKey.split(".");
    let value: any = frontmatter;

    for (const key of keys) {
        if (!value[key]) {
            return undefined;
        }
        value = value[key];
    }

    return value;
}