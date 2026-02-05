import { App, Notice } from "obsidian";
import { ELNSettings } from "../../../settings/settings";
import { NewNoteModalRefactored } from "../notes/NewNoteModalRefactored";
import { TemplateManager } from "./TemplateManager";
import { NoteCreatorRefactored, NoteCreationOptionsRefactored } from "./NoteCreatorRefactored";
import type ElnPlugin from "../../../main";
import type { FormData } from "../../../types";

export interface NewNoteOptions {
    noteType: string;
    initialData?: Record<string, unknown>;
    skipModal?: boolean;
}

export class NewNote {
    private app: App;
    private settings: ELNSettings;
    private plugin: ElnPlugin;
    private noteCreator: NoteCreatorRefactored;

    constructor(plugin: ElnPlugin) {
        this.plugin = plugin;
        this.app = plugin.app;
        this.settings = plugin.settings;
        this.noteCreator = new NoteCreatorRefactored(plugin);
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
            console.error(`Failed to create ${noteType} note:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            new Notice(`Failed to create note: ${errorMessage}`);
        }
    }

    /**
     * Create note directly without modal (for programmatic creation)
     */
    private async createNoteDirectly(noteType: string, data: Record<string, unknown>): Promise<void> {
        try {
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
            const options: NoteCreationOptionsRefactored = {
                noteType: noteType,
                noteTitle: noteTitle, // Explicitly provide the title
                formData: formData,
                metadataTemplate: templateManager.getCurrentTemplate(),
                openNote: true,
                openInNewLeaf: false
            };

            const file = await this.noteCreator.createNote(options);
            
            if (!file) {
                throw new Error('Failed to create note file');
            }
            
        } catch (error) {
            console.error('Failed to create note directly:', error);
            throw error;
        }
    }

    /**
     * Open the refactored modal for note creation
     */
    private async openNewNoteModal(noteType: string, initialData: Record<string, unknown>): Promise<void> {
        return new Promise((resolve) => {
            // Create a TemplateManager to get the processed template
            const templateManager = new TemplateManager({
                plugin: this.plugin,
                noteType: noteType,
                initialData: initialData as FormData
            });

            const modal = new NewNoteModalRefactored(this.plugin, {
                modalTitle: `Create ${noteType} Note`,
                noteType: noteType,
                metadataTemplate: templateManager.getCurrentTemplate(),
                initialData: initialData as FormData,
                onSubmit: async (result) => {
                    if (result) {
                        console.log('✅ Form submitted, creating note with refactored system...');
                        // For now, we'll create a simple note
                        await this.createNoteFromModalData(noteType, result.formData);
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
    private async createNoteFromModalData(noteType: string, formData: FormData): Promise<void> {
        try {
            // Debug: Log the form data to see what we're working with
            console.log('[NewNote] Form data received:', formData);
            
            // Use NoteCreatorRefactored which properly handles metadata processing
            // Create a TemplateManager to get the processed template
            const templateManager = new TemplateManager({
                plugin: this.plugin,
                noteType: noteType,
                initialData: formData
            });

            // Extract title from form data or provide a fallback
            const noteTitle = String(formData.title || 'Untitled Note');
            console.log('[NewNote] Resolved note title:', noteTitle);

            // Create note creation options using the same structure as original NoteCreator
            const options: NoteCreationOptionsRefactored = {
                noteType: noteType,
                noteTitle: noteTitle, // Explicitly provide the title
                formData: formData,
                metadataTemplate: templateManager.getCurrentTemplate(),
                openNote: true,
                openInNewLeaf: false
            };

            const file = await this.noteCreator.createNote(options);
            
            if (!file) {
                throw new Error('Failed to create note file');
            }
            
        } catch (error) {
            console.error('Failed to create note from modal data:', error);
            throw error;
        }
    }

}
