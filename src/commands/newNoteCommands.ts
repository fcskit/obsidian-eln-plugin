import type ElnPlugin from "../main";
import { NewNote } from "../core/notes/NewNote";

export function addNewNoteCommands(plugin: ElnPlugin) {
    const { note } = plugin.settings;
    
    // Dynamically register commands for all enabled note types using REFACTORED modal
    Object.entries(note).forEach(([noteType, config]) => {
        if (config.commands.enabled) {
            plugin.addCommand({
                id: config.commands.id,
                name: config.commands.name,
                callback: async () => {
                    const newNote = new NewNote(plugin);
                    await newNote.createNote({
                        noteType: noteType,
                        initialData: {},
                        skipModal: false // Always show the modal for user interaction
                    });
                },
            });
        }
    });
}