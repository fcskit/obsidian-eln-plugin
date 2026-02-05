import { TFile } from "obsidian";
import type ElnPlugin from "../../../main";
import type { FormData, PathTemplate, MetaDataTemplateProcessed } from "../../../types";
import { parsePathTemplate } from "../../../core/notes/PathTemplateParser";
import { processMarkdownTemplate } from "../../../data/templates/processMarkdownTemplate";
import { MetadataProcessor } from "../../../core/notes/MetadataProcessor";

export interface NoteCreationOptionsRefactored {
    noteType?: string;
    noteTitle?: string;
    noteTitleTemplate?: PathTemplate;
    folderPath?: string;
    formData: FormData;
    metadataTemplate: MetaDataTemplateProcessed;
    openNote?: boolean;
    openInNewLeaf?: boolean;
}

/**
 * Refactored version of NoteCreator that integrates with the new components_new architecture
 * while preserving all the robust functionality from the original NoteCreator
 */
export class NoteCreatorRefactored {
    private plugin: ElnPlugin;
    private metadataProcessor: MetadataProcessor;

    constructor(plugin: ElnPlugin) {
        this.plugin = plugin;
        this.metadataProcessor = new MetadataProcessor(plugin);
    }

    /**
     * Creates a new note file with the given options
     * @param options The note creation options
     * @returns The created TFile or null if creation failed
     */
    async createNote(options: NoteCreationOptionsRefactored): Promise<TFile | null> {
        try {
            console.log('[NoteCreatorRefactored] Creating note with options:', options);
            
            // Sanitize form data to ensure all fields have proper values
            const sanitizedFormData = this.sanitizeFormData(options.formData, options.noteType);
            console.log('[NoteCreatorRefactored] Sanitized form data:', sanitizedFormData);

            // Resolve note title
            const noteTitle = await this.resolveNoteTitle({
                ...options,
                formData: sanitizedFormData
            });
            console.log('[NoteCreatorRefactored] Resolved note title:', noteTitle);

            // Resolve folder path
            const folderPath = await this.resolveFolderPath({
                ...options,
                formData: sanitizedFormData
            });

            // Check if note already exists and generate unique name if needed
            const uniqueNoteTitle = await this.generateUniqueNoteTitle(folderPath, noteTitle);

            // Process metadata using user input
            const processedMetadata = await this.metadataProcessor.processMetadata(
                options.metadataTemplate, 
                sanitizedFormData
            );

            // Process markdown content
            const markdownContent = await this.processMarkdownContent({
                ...options,
                formData: sanitizedFormData,
                noteTitle: uniqueNoteTitle
            });

            // Create the note file using Obsidian's built-in functionality
            const noteFile = await this.createNoteFile(folderPath, uniqueNoteTitle, processedMetadata, markdownContent);

            // Open the note if requested
            if (options.openNote && noteFile) {
                if (options.openInNewLeaf) {
                    this.plugin.app.workspace.openLinkText(`${folderPath}/${uniqueNoteTitle}.md`, `${folderPath}/${uniqueNoteTitle}.md`, false);
                } else {
                    this.plugin.app.workspace.getLeaf(false).openFile(noteFile);
                }
            }

            return noteFile;

        } catch (error) {
            console.error("Error in NoteCreatorRefactored.createNote:", error);
            throw error;
        }
    }

    /**
     * Sanitize form data to ensure all expected fields have default values
     * This addresses the issue where undefined values get filtered out of frontmatter
     * IMPORTANT: This method should NOT add template-specific defaults as those are handled by MetadataProcessor
     */
    private sanitizeFormData(formData: FormData, noteType?: string): FormData {
        const sanitized: FormData = { ...formData };
        
        // Only ensure that essential top-level fields exist if they're completely missing
        // Do NOT add fields that might conflict with template structure
        if (!sanitized.title) {
            sanitized.title = noteType ? `Untitled ${noteType} Note` : 'Untitled Note';
        }
        
        return sanitized;
    }

    /**
     * Generate a unique note title to avoid conflicts
     */
    private async generateUniqueNoteTitle(folderPath: string, baseTitle: string): Promise<string> {
        let uniqueTitle = baseTitle;
        let counter = 1;
        
        while (this.plugin.app.vault.getAbstractFileByPath(`${folderPath}/${uniqueTitle}.md`)) {
            uniqueTitle = `${baseTitle}_${counter}`;
            counter++;
        }
        
        return uniqueTitle;
    }

    /**
     * Resolves the note title from options or template
     */
    private async resolveNoteTitle(options: NoteCreationOptionsRefactored): Promise<string> {
        console.log('[NoteCreatorRefactored] Resolving title with options:', {
            noteTitle: options.noteTitle,
            noteType: options.noteType,
            formDataKeys: Object.keys(options.formData)
        });
        
        if (options.noteTitle) {
            console.log('[NoteCreatorRefactored] Using provided noteTitle:', options.noteTitle);
            return options.noteTitle;
        }

        let titleTemplate = options.noteTitleTemplate;

        // Get title template from settings if not provided
        if (!titleTemplate && options.noteType) {
            try {
                if (options.noteType in this.plugin.settings.note) {
                    titleTemplate = this.plugin.settings.note[options.noteType as keyof typeof this.plugin.settings.note].titleTemplate;
                    console.log('[NoteCreatorRefactored] Got title template from noteType settings:', titleTemplate);
                } else {
                    titleTemplate = this.plugin.settings.note.default.titleTemplate;
                    console.log('[NoteCreatorRefactored] Got title template from default settings:', titleTemplate);
                }
            } catch (error) {
                console.warn('Failed to get title template from settings:', error);
            }
        }

        if (titleTemplate) {
            try {
                const result = await parsePathTemplate(this.plugin.app, 'file', titleTemplate, options.formData);
                if (result) {
                    console.log('[NoteCreatorRefactored] Parsed title from template:', result);
                    return result;
                }
            } catch (error) {
                console.warn('Failed to parse title template:', error, titleTemplate);
            }
        }

        // Fallback to title from form data or default (same as original NoteCreator)
        const fallbackTitle = String(options.formData.title || "New Note");
        console.log('[NoteCreatorRefactored] Using fallback title:', fallbackTitle);
        return fallbackTitle;
    }

    /**
     * Resolves the folder path from options or template
     */
    private async resolveFolderPath(options: NoteCreationOptionsRefactored): Promise<string> {
        if (options.folderPath) {
            return options.folderPath;
        }

        // Get folder template from settings
        let folderTemplate;
        if (options.noteType && options.noteType in this.plugin.settings.note) {
            const noteSettings = this.plugin.settings.note[options.noteType as keyof typeof this.plugin.settings.note];
            folderTemplate = noteSettings.folderTemplate;
        } else {
            folderTemplate = this.plugin.settings.note.default.folderTemplate;
        }

        if (folderTemplate) {
            const resolved = await parsePathTemplate(this.plugin.app, 'folder', folderTemplate, options.formData);
            return resolved || "";
        }

        // Fallback based on note type
        if (options.noteType === 'test') {
            return "Test Notes";
        }

        return "";
    }

    /**
     * Processes the markdown content template
     */
    private async processMarkdownContent(options: NoteCreationOptionsRefactored): Promise<string> {
        let markdownTemplate: string;

        // Get markdown template from settings
        if (options.noteType && options.noteType in this.plugin.settings.note) {
            const noteSettings = this.plugin.settings.note[options.noteType as keyof typeof this.plugin.settings.note];
            markdownTemplate = noteSettings.markdownTemplate;
        } else {
            markdownTemplate = this.plugin.settings.note.default.markdownTemplate;
        }

        const noteTitle = options.noteTitle || await this.resolveNoteTitle(options);
        return processMarkdownTemplate(markdownTemplate, noteTitle || "New Note", options.formData);
    }

    /**
     * Creates the actual note file using Obsidian's built-in processFrontMatter
     * This is much more robust than custom YAML generation
     */
    private async createNoteFile(
        folderPath: string,
        noteTitle: string,
        metadata: Record<string, unknown>,
        content: string
    ): Promise<TFile> {
        // Ensure folder exists
        const cleanFolderPath = folderPath.endsWith("/") ? folderPath.slice(0, -1) : folderPath;
        if (cleanFolderPath) {
            const folder = this.plugin.app.vault.getFolderByPath(cleanFolderPath);
            if (!folder) {
                console.debug(`Folder "${cleanFolderPath}" does not exist. Creating it.`);
                await this.plugin.app.vault.createFolder(cleanFolderPath);
            }
        }

        // Create note path
        const notePath = cleanFolderPath ? `${cleanFolderPath}/${noteTitle}.md` : `${noteTitle}.md`;
        
        // Create empty note file first
        const noteFile = await this.plugin.app.vault.create(notePath, "");
        
        if (noteFile) {
            // Use Obsidian's processFrontMatter to write metadata properly
            await this.plugin.app.fileManager.processFrontMatter(noteFile, (frontmatter) => {
                // Clear existing frontmatter and assign new metadata
                Object.keys(frontmatter).forEach(key => delete frontmatter[key]);
                Object.assign(frontmatter, metadata);
            });
            
            // Append markdown content
            if (content) {
                await this.plugin.app.vault.append(noteFile, content);
            }
        }

        return noteFile;
    }
}
