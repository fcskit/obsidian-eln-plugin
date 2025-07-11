import { changeKeyName as utilsChangeKeyName } from "../../../utils/changeKeyName";
import { App } from "obsidian";

/**
 * Legacy wrapper for changeKeyName that maintains the old signature
 * for backward compatibility with existing renderer code.
 */
export async function changeKeyName(app: App, key: string, newKey: string): Promise<void> {
    const currentFile = app.workspace.getActiveFile();
    if (!currentFile) return;
    
    await utilsChangeKeyName(app, currentFile, key, newKey);
}
