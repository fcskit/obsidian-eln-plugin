import { App } from "obsidian";

/**
 * Renames a key in a nested object.
 * @param oldObject - The parent object containing the key to rename.
 * @param oldKey - The current key name.
 * @param newKey - The new key name.
 * @returns The updated object with the key renamed.
 */
function renameObjectKey<T extends Record<string, any>>(oldObject: T, oldKey: string, newKey: string): T {
    // console.log("Renaming key in object:", oldKey, "to", newKey);
    const keys = Object.keys(oldObject ?? {});
    const newObject = keys.reduce((acc, currentKey) => {
        if (currentKey === oldKey) {
            acc[newKey] = oldObject[oldKey];
        } else {
            acc[currentKey] = oldObject[currentKey];
        }
        return acc;
    }, {} as Record<string, any>);
    // console.log("Renamed object:", newObject);
    return newObject as T;
}

/**
 * Faithful port of changeKeyName from npe_fm.js.
 * Changes a key name in the frontmatter of the current file.
 * @param app - The Obsidian app instance.
 * @param key - The key of the frontmatter property, in dot notation.
 * @param newKey - The new key name to set for the frontmatter property.
 */
export async function changeKeyName(app: App, key: string, newKey: string): Promise<void> {
    // console.log("Changing key name in frontmatter:", key, "to", newKey);
    const currentFile = app.workspace.getActiveFile();
    if (!currentFile) return;

    await app.fileManager.processFrontMatter(currentFile, (frontmatter) => {
        const keys = key.split(".");
        let obj = frontmatter;
        const lastKey = keys[keys.length - 1];
        let targetObject: any;

        if (keys.length > 1) {
            // Traverse the keys to reach the parent object of the target property
            for (let i = 0; i < keys.length - 2; i++) {
                if (!obj[keys[i]]) {
                    obj[keys[i]] = {};
                }
                obj = obj[keys[i]];
            }
            const targetKey = keys[keys.length - 2];
            targetObject = obj[targetKey];
        } else {
            // If there's no parent object, we are at the top level
            targetObject = obj;
        }

        // Rename the key in the parent object
        if (targetObject) {
            const renamed = renameObjectKey(targetObject, lastKey, newKey);
            // Assign the renamed object back to its parent
            if (keys.length > 1) {
                const targetKey = keys[keys.length - 2];
                obj[targetKey] = renamed;
            } else {
                // At top level, replace all properties to preserve order
                for (const k of Object.keys(obj)) {
                    delete obj[k];
                }
                Object.assign(obj, renamed);
            }
        }
    });
}
