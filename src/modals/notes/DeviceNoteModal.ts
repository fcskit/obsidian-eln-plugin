import { NewNoteModal, NewNoteModalOptions } from "./NewNoteModal"
import ElnPlugin from "../../main";

export class DeviceNoteModal extends NewNoteModal {
    constructor(plugin: ElnPlugin, options?: Partial<NewNoteModalOptions>) {

        super(plugin, {
            ...options,
            modalTitle: options?.modalTitle || "New Device",
            noteType: options?.noteType || "device",
            resolve: options?.resolve || (() => {}),
        });
    }
}