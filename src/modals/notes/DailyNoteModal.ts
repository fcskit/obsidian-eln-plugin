import { NewNoteModal, NewNoteModalOptions } from "./NewNoteModal"
import ElnPlugin from "../../main";
    
export class DailyNoteModal extends NewNoteModal {

    constructor(plugin: ElnPlugin, options?: Partial<NewNoteModalOptions>) {

        super(plugin, {
            ...options,
            modalTitle: options?.modalTitle || "New Daily Note",
            noteType: options?.noteType || "dailyNote",
            resolve: options?.resolve || (() => { }),
        });
    }
}