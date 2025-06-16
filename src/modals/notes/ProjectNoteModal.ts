import { NewNoteModal, NewNoteModalOptions } from "./NewNoteModal";
import ElnPlugin from "main";
import { SampleListNoteModal } from "./SampleListNoteModal";

export class ProjectNoteModal extends NewNoteModal {
    constructor(plugin: ElnPlugin, options?: Partial<NewNoteModalOptions>) {
        const pluginRoot = `${plugin.app.vault.configDir}/plugins/obsidian-eln`;

        super(plugin, {
            ...options,
            modalTitle: options?.modalTitle || "New Project",
            noteType: options?.noteType || "project",
            metadataTemplatePath: options?.metadataTemplatePath || `${pluginRoot}/templates/metadata/project.json`,
            markdownTemplatePath: options?.markdownTemplatePath || `${pluginRoot}/templates/markdown/project.md`,
            resolve: async (result) => {
                if (result) {
                    console.log("Project note created successfully:", result);

                    // Check if the project type is "research" or "development"
                    const projectType = result["project.type"];
                    if (projectType === "research" || projectType === "development") {
                        console.log(`Project type is "${projectType}". Launching SampleListNoteModal...`);

                        // Launch the SampleListNoteModal to create a sample list note
                        const sampleListModal = new SampleListNoteModal(plugin, {
                            modalTitle: "New Sample List",
                            noteType: "sample-list",
                            metadataTemplatePath: `${pluginRoot}/templates/metadata/sample_list.json`,
                            markdownTemplatePath: `${pluginRoot}/templates/markdown/sample_list.md`,
                            folderPath: plugin.settings.note.sample.folder || "Experiment/Samples",
                            resolve: (sampleListResult) => {
                                if (sampleListResult) {
                                    console.log("Sample list note created successfully:", sampleListResult);
                                } else {
                                    console.warn("Sample list note creation was canceled.");
                                }
                            },
                        });

                        sampleListModal.open();
                    }
                } else {
                    console.warn("Project note creation was canceled.");
                }
            },
        });
    }
}