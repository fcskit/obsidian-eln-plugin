import { TFile, Notice } from "obsidian";
import type ElnPlugin from "../../main";
import type { FormData, PathTemplate, MetaDataTemplateProcessed } from "../../types";
import { MetadataProcessor } from "./MetadataProcessor";
import { NoteCreator } from "./NoteCreator";
import { NewNoteModal, type NewNoteModalOptions } from "../../ui/modals/notes/NewNoteModal";

export interface NewNoteOptions {
    noteType?: string;
    noteTitle?: string;
    noteTitleTemplate?: PathTemplate;
    folderPath?: string;
    modalTitle?: string;
    openNote?: boolean;
    openInNewLeaf?: boolean;
    formData?: FormData; // Pre-populated form data
}

/**
 * Orchestrates the note creation process.
 * Determines whether user input is required and handles the entire workflow.
 */
export class NewNote {
    private plugin: ElnPlugin;
    private metadataProcessor: MetadataProcessor;
    private noteCreator: NoteCreator;

    constructor(plugin: ElnPlugin) {
        this.plugin = plugin;
        this.metadataProcessor = new MetadataProcessor(plugin);
        this.noteCreator = new NoteCreator(plugin);
    }

    /**
     * Creates a new note, with or without modal input depending on requirements
     * @param options Configuration options for note creation
     * @returns Promise that resolves to the created TFile or null if creation failed/was cancelled
     */
    async create(options: NewNoteOptions = {}): Promise<TFile | null> {
        try {
            // Load and preprocess the metadata template
            const template = this.metadataProcessor.loadMetadataTemplate(options.noteType);
            const processedTemplate = this.metadataProcessor.preprocessTemplate(template, options.noteType);

            // Determine if user input is required
            const requiresUserInput = this.requiresUserInput(processedTemplate);

            let formData: FormData;
            let finalTemplate: MetaDataTemplateProcessed;

            if (requiresUserInput && !options.formData) {
                // Show modal to collect user input
                const modalResult = await this.collectUserInput(processedTemplate, options);
                if (!modalResult) {
                    // User cancelled the modal
                    return null;
                }
                formData = modalResult.formData;
                finalTemplate = modalResult.template; // Use the template with subclass modifications
            } else {
                // Use provided form data or empty object if no input is required
                formData = options.formData || {};
                finalTemplate = processedTemplate; // Use the base template since no modal was shown
            }

            // Create the note using the collected data and final template
            const noteFile = await this.noteCreator.createNote({
                noteType: options.noteType,
                noteTitle: options.noteTitle,
                noteTitleTemplate: options.noteTitleTemplate,
                folderPath: options.folderPath,
                formData,
                metadataTemplate: finalTemplate, // Use the final template (with subclass modifications if any)
                openNote: options.openNote ?? true,
                openInNewLeaf: options.openInNewLeaf ?? false
            });

            if (noteFile) {
                new Notice("Note created successfully!");
            }

            return noteFile;

        } catch (error) {
            console.error("Error creating note:", error);
            new Notice("Failed to create note. Check the console for details.");
            return null;
        }
    }

    /**
     * Determines if the template requires user input
     * @param template The processed metadata template
     * @returns True if user input is required
     */
    private requiresUserInput(template: Record<string, unknown>): boolean {
        return this.hasQueryFields(template);
    }

    /**
     * Recursively checks if template has any fields with query=true
     * @param template The template to check
     * @returns True if any field requires user input
     */
    private hasQueryFields(template: Record<string, unknown>): boolean {
        if (!template || typeof template !== "object") {
            return false;
        }

        for (const value of Object.values(template)) {
            if (value && typeof value === "object") {
                if ("query" in value && value.query === true) {
                    return true;
                }
                // Recursively check nested objects (but not fields with inputType)
                if (!("inputType" in value) && this.hasQueryFields(value as Record<string, unknown>)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Shows the modal to collect user input
     * @param template The processed metadata template
     * @param options The note creation options
     * @returns Promise that resolves to the form data and template or null if cancelled
     */
    private async collectUserInput(template: Record<string, unknown>, options: NewNoteOptions): Promise<{ formData: FormData; template: MetaDataTemplateProcessed } | null> {
        return new Promise((resolve) => {
            const modalOptions: NewNoteModalOptions = {
                modalTitle: options.modalTitle || "New Note",
                noteType: options.noteType || "default",
                metadataTemplate: template as MetaDataTemplateProcessed,
                onSubmit: resolve
            };

            const modal = new NewNoteModal(this.plugin, modalOptions);
            modal.open();
        });
    }
}
