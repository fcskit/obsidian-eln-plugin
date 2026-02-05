import { App, Notice } from "obsidian";
import { ELNSettings } from "../../settings/settings";
import { NewNoteModal } from "../../ui/modals/notes/NewNoteModal";
import { TemplateManager } from "../templates/TemplateManager";
import { NoteCreator, NoteCreationOptions } from "./NoteCreator";
import type ElnPlugin from "../../main";
import type { FormData, MetaDataTemplateProcessed } from "../../types";
import { createLogger } from "../../utils/Logger";

const logger = createLogger('note');

export interface NewNoteOptions {
    noteType: string;
    initialData?: Record<string, unknown>;
    skipModal?: boolean;
}

export class NewNote {
    private app: App;
    private settings: ELNSettings;
    private plugin: ElnPlugin;
    private noteCreator: NoteCreator;

    constructor(plugin: ElnPlugin) {
        this.plugin = plugin;
        this.app = plugin.app;
        this.settings = plugin.settings;
        this.noteCreator = new NoteCreator(this.plugin);
    }

    /**
     * Create a new note using the refactored modal system
     */
    async createNote(options: NewNoteOptions): Promise<void> {
        const { noteType, initialData = {}, skipModal = false } = options;

        // Validate note type exists in settings
        const noteConfig = this.settings.note[noteType as keyof typeof this.settings.note];
        if (!noteConfig) {
            new Notice(`Invalid note type: ${noteType}`);
            return;
        }

        try {
            if (skipModal) {
                // For direct creation, we'll use the existing NewNote from core for now
                // This is a temporary implementation - in a full refactor this would handle everything
                await this.createNoteDirectly(noteType, initialData);
            } else {
                // Use modal for user input
                await this.openNewNoteModal(noteType, initialData);
            }
        } catch (error) {
            logger.error(`Failed to create ${noteType} note:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            new Notice(`Failed to create note: ${errorMessage}`);
        }
    }

    /**
     * Create note directly without modal (for programmatic creation)
     */
    private async createNoteDirectly(noteType: string, data: Record<string, unknown>): Promise<void> {
        try {
            // Get note configuration
            const noteConfig = this.settings.note[noteType as keyof typeof this.settings.note];
            
            // Convert data to FormData format
            const formData = data as FormData;
            
            // Create a TemplateManager to get the processed template
            const templateManager = new TemplateManager({
                plugin: this.plugin,
                noteType: noteType,
                initialData: formData
            });

            // Extract title from data or provide a fallback
            const noteTitle = String(data.title || `${noteType} Note`);

            // Create note creation options
            const options: NoteCreationOptions = {
                noteType: noteType,
                noteTitle: noteTitle, // Explicitly provide the title
                formData: formData,
                metadataTemplate: templateManager.getCurrentTemplate(),
                openNote: true,
                openInNewLeaf: false,
                createSubfolder: noteConfig.createSubfolder
            };

            const file = await this.noteCreator.createNote(options);
            
            if (!file) {
                throw new Error('Failed to create note file');
            }
            
        } catch (error) {
            logger.error('Failed to create note directly:', error);
            throw error;
        }
    }

    /**
     * Open the refactored modal for note creation
     */
    private async openNewNoteModal(noteType: string, initialData: Record<string, unknown>): Promise<void> {
        return new Promise((resolve) => {
            // Create a single TemplateManager instance to be shared with the modal
            const templateManager = new TemplateManager({
                plugin: this.plugin,
                noteType: noteType,
                initialData: initialData as FormData
            });
            
            const modal = new NewNoteModal(this.plugin, {
                modalTitle: `Create ${noteType} Note`,
                noteType: noteType,
                templateManager: templateManager, // Pass the shared TemplateManager instance
                onSubmit: async (result) => {
                    if (result) {
                        logger.debug('✅ Form submitted, creating note with refactored system...');
                        // For now, we'll create a simple note
                        await this.createNoteFromModalData(noteType, result.formData, result.template);
                    }
                    resolve();
                }
            });
            
            modal.open();
        });
    }

    /**
     * Create note from modal form data
     */
    private async createNoteFromModalData(noteType: string, formData: FormData, template: MetaDataTemplateProcessed): Promise<void> {
        try {
            // Get note configuration
            const noteConfig = this.settings.note[noteType as keyof typeof this.settings.note];
            
            // Debug: Log the form data to see what we're working with
            logger.debug('[NewNote] Form data received:', formData);
            
            // Use NoteCreator which properly handles metadata processing
            // The modal already provided us with a processed template

            // Let NoteCreator generate the title from titleTemplate - don't provide noteTitle
            logger.debug('[NewNote] Letting NoteCreator generate title from template');

            // Create note creation options using the same structure as original NoteCreator
            const options: NoteCreationOptions = {
                noteType: noteType,
                // Don't provide noteTitle - let it be generated from titleTemplate
                formData: formData,
                metadataTemplate: template, // Use the template provided by the modal
                openNote: true,
                openInNewLeaf: false,
                createSubfolder: noteConfig.createSubfolder
            };

            const file = await this.noteCreator.createNote(options);
            
            if (!file) {
                throw new Error('Failed to create note file');
            }
            
        } catch (error) {
            logger.error('Failed to create note from modal data:', error);
            throw error;
        }
    }

}
