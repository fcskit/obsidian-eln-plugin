import { Plugin } from "obsidian";
import { NewNoteModal } from "../modals/notes/NewNoteModal";
import { ChemicalNoteModal } from "../modals/notes/ChemicalNoteModal";
import { DailyNoteModal } from "../modals/notes/DailyNoteModal";

export function addNewNoteCommands(plugin: Plugin) {
    // Register the command to create a new chemical note
    plugin.addCommand({
        id: "create-chemical-note",
        name: "Create Chemical Note",
        callback: () => {
            const modal = new ChemicalNoteModal(plugin);
            modal.open();
        },
    });

    // Register the command to create a new device note
    plugin.addCommand({
        id: "create-daily-note",
        name: "Create Daily Note",
        callback: () => {
            const modal = new DailyNoteModal(plugin);
            modal.open();
        },
    });

    // Register the command to create a new instrument note
    plugin.addCommand({
        id: "create-new-note",
        name: "Create New Note",
        callback: () => {
            const modal = new NewNoteModal(plugin, {
                modalTitle: "New Note",
                noteTitle: "New Note",
                noteType: "default",
            });
            modal.open();
        },
    });
}