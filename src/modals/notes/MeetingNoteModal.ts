import { NewNoteModal, NewNoteModalOptions } from "./NewNoteModal"
import ElnPlugin from "../../main";

export class MeetingNoteModal extends NewNoteModal {
    constructor(plugin: ElnPlugin, options?: Partial<NewNoteModalOptions>) {

        super(plugin, {
            ...options,
            modalTitle: options?.modalTitle || "New Meeting Note",
            noteType: options?.noteType || "meeting",
            resolve: options?.resolve || (() => {}),
        });
    }
}