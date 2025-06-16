import { NewNoteModal, NewNoteModalOptions } from "./NewNoteModal"
import ElnPlugin from "main";

export class SampleListNoteModal extends NewNoteModal {
    constructor(plugin: ElnPlugin, options?: Partial<NewNoteModalOptions>) {
        const pluginRoot = `${plugin.app.vault.configDir}/plugins/obsidian-eln`;

        super(plugin, {
            ...options,
            modalTitle: options?.modalTitle || "New Sample List",
            noteType: options?.noteType || "sampleList",
            metadataTemplatePath: options?.metadataTemplatePath || `${pluginRoot}/templates/metadata/samplelist.json`,
            markdownTemplatePath: options?.markdownTemplatePath || `${pluginRoot}/templates/markdown/samplelist.md`,
            resolve: options?.resolve || (() => {}),
        });
    }
}