import { App, TFile } from "obsidian";

/**
 * Renames a key in a nested object.
 * @param oldObject - The parent object containing the key to rename.
 * @param oldKey - The current key name.
 * @param newKey - The new key name.
 * @returns The updated object with the key renamed.
 */
function renameObjectKey<T extends Record<string, unknown>>(oldObject: T, oldKey: string, newKey: string): T {
    const keys = Object.keys(oldObject ?? {});
    const newObject = keys.reduce((acc, currentKey) => {
        if (currentKey === oldKey) {
            acc[newKey] = oldObject[oldKey];
        } else {
            acc[currentKey] = oldObject[currentKey];
        }
        return acc;
    }, {} as Record<string, unknown>);
    return newObject as T;
}

/**
 * Changes a key name in a frontmatter cache object (in-memory operation).
 * @param cache - The frontmatter cache object to update.
 * @param key - The key of the frontmatter property, in dot notation.
 * @param newKeyName - The new key name to set for the frontmatter property.
 */
export function changeCacheKeyName(cache: Record<string, unknown>, key: string, newKeyName: string): void {
    // Parse the key path
    const keys = key.split(".");
    let obj: Record<string, unknown> = cache;
    const lastKey = keys[keys.length - 1];
    let targetObject: Record<string, unknown>;
    
    if (keys.length > 1) {
        // Traverse the keys to reach the parent object of the target property
        for (let i = 0; i < keys.length - 2; i++) {
            if (!obj[keys[i]]) {
                obj[keys[i]] = {};
            }
            obj = obj[keys[i]] as Record<string, unknown>;
        }
        const targetKey = keys[keys.length - 2];
        targetObject = obj[targetKey] as Record<string, unknown>;
    } else {
        // If there's no parent object, we are at the top level
        targetObject = obj;
    }
    
    // Rename the key in the parent object
    if (targetObject) {
        const renamed = renameObjectKey(targetObject, lastKey, newKeyName);
        // Assign the renamed object back to its parent
        if (keys.length > 1) {
            const targetKey = keys[keys.length - 2];
            obj[targetKey] = renamed;
        } else {
            // At top level, replace all properties to preserve order
            Object.keys(cache).forEach(k => delete cache[k]);
            Object.assign(cache, renamed);
        }
    }
}

/**
 * Changes a key name in the frontmatter of the given file (file operation).
 * @param app - The Obsidian app instance.
 * @param file - The TFile to update.
 * @param key - The key of the frontmatter property, in dot notation.
 * @param newKeyName - The new key name to set for the frontmatter property.
 */
export async function changeFrontmatterKeyName(app: App, file: TFile, key: string, newKeyName: string): Promise<void> {
    await app.fileManager.processFrontMatter(file, (frontmatter) => {
        changeCacheKeyName(frontmatter, key, newKeyName);
    });
}

/**
 * Unified function to change a key name in frontmatter, supporting both file and cache operations.
 * @param options - Configuration object with app, key, newKeyName, and either file or cache (or both)
 * @param options.app - The Obsidian app instance (required if file is provided)
 * @param options.key - The key of the frontmatter property, in dot notation
 * @param options.newKeyName - The new key name to set for the frontmatter property
 * @param options.file - The TFile to update (optional)
 * @param options.cache - The frontmatter cache object to update (optional)
 * @returns Promise that resolves when file operations are complete (if file is provided)
 */
export async function changeKeyName(options: {
    app?: App;
    key: string;
    newKeyName: string;
    file?: TFile;
    cache?: Record<string, unknown>;
    view?: import("../../../views/NestedPropertiesEditor").NestedPropertiesEditorView;
}): Promise<void> {
    const { app, key, newKeyName, file, cache, view } = options;
    
    // Update cache if provided
    if (cache) {
        changeCacheKeyName(cache, key, newKeyName);
    }
    
    // Update file if provided
    if (file) {
        // Set internal change flag if view instance is provided
        if (view) {
            view.setInternalChangeFlag();
        }
        if (!app) {
            throw new Error('App instance is required when updating file frontmatter');
        }
        await changeFrontmatterKeyName(app, file, key, newKeyName);
    }
    
    // At least one target must be provided
    if (!file && !cache) {
        throw new Error('Either file or cache must be provided');
    }
}

/**
 * Legacy function for backward compatibility - changes key name in file frontmatter only.
 * @param app - The Obsidian app instance.
 * @param file - The TFile to update.
 * @param key - The key of the frontmatter property, in dot notation.
 * @param newKey - The new key name to set for the frontmatter property.
 * @deprecated Use changeKeyName with options object instead
 */
export async function changeKeyNameLegacy(app: App, file: TFile, key: string, newKey: string): Promise<void> {
    await changeKeyName({ app, file, key, newKeyName: newKey });
}
