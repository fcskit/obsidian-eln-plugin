import { App } from "obsidian";
import type { FrontmatterValue } from "../../../../types/core";

/**
 * Get frontmatter value by key.
 * @param app - The Obsidian app instance.
 * @param fullKey - The key of the frontmatter property, in dot notation.
 * @returns The value of the frontmatter property or undefined if not found.
 */
export function getFrontmatterValue(app: App, fullKey: string): FrontmatterValue {
    const currentFile = app.workspace.getActiveFile();
    if (!currentFile) {
        console.warn('🔍 [GET VALUE] No active file');
        return undefined;
    }

    const frontmatter = app.metadataCache.getFileCache(currentFile)?.frontmatter;
    if (!frontmatter) {
        console.warn('🔍 [GET VALUE] No frontmatter found');
        return undefined;
    }

    console.warn('🔍 [GET VALUE] Looking up key:', {
        fullKey,
        frontmatterKeys: Object.keys(frontmatter)
    });

    const keys = fullKey.split(".");
    let value: unknown = frontmatter;

    // Traverse the keys to reach the target property - more robust approach like the old JS version
    for (let i = 0; i < keys.length; i++) {
        if (!value || typeof value !== 'object') {
            console.warn('🔍 [GET VALUE] Traversal failed - not an object:', {
                fullKey,
                currentIndex: i,
                currentKey: keys[i],
                value
            });
            return undefined;
        }
        
        const objectValue = value as Record<string, unknown>;
        
        // Check if the key exists in the current object
        if (!(keys[i] in objectValue)) {
            console.warn('🔍 [GET VALUE] Key not found:', {
                fullKey,
                currentIndex: i,
                lookingFor: keys[i],
                availableKeys: Object.keys(objectValue)
            });
            return undefined;
        }
        
        value = objectValue[keys[i]];
    }

    console.warn('🔍 [GET VALUE] Value found:', {
        fullKey,
        value,
        valueType: typeof value
    });

    return value as FrontmatterValue;
}