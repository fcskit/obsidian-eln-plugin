import { NewNoteModal, NewNoteModalOptions } from "./NewNoteModal"
import ElnPlugin from "../../main";

export class ContactNoteModal extends NewNoteModal {
    constructor(plugin: ElnPlugin, options?: Partial<NewNoteModalOptions>) {

        super(plugin, {
            ...options,
            modalTitle: options?.modalTitle || "New Contact",
            noteType: options?.noteType || "contact",
            resolve: options?.resolve || (() => {}),
        });
    }
}