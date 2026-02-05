import { TFile } from "obsidian";
import type ElnPlugin from "../../main";
import type { FormData, PathTemplate, MetaDataTemplateProcessed } from "../../types";
import { parsePathTemplate } from "./PathTemplateParser";
import { processMarkdownTemplate } from "../../data/templates/processMarkdownTemplate";
import { MetadataProcessor } from "./MetadataProcessor";

export interface NoteCreationOptions {
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
 * Handles the actual creation and saving of note files
 */
export class NoteCreator {
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
    async createNote(options: NoteCreationOptions): Promise<TFile | null> {
        try {
            // Resolve note title
            const noteTitle = await this.resolveNoteTitle(options);
            if (!noteTitle) {
                throw new Error("Note title could not be generated. Please check the template.");
            }

            // Resolve folder path
            const folderPath = await this.resolveFolderPath(options);

            // Check if note already exists
            const existingNote = this.plugin.app.vault.getAbstractFileByPath(`${folderPath}/${noteTitle}.md`);
            if (existingNote) {
                throw new Error(`Note "${noteTitle}" already exists in "${folderPath}".`);
            }

            // Process metadata using user input
            const processedMetadata = await this.metadataProcessor.processMetadata(
                options.metadataTemplate, 
                options.formData
            );

            // Process markdown content
            const markdownContent = await this.processMarkdownContent(options);

            // Create the note file
            const noteFile = await this.createNoteFile(folderPath, noteTitle, processedMetadata, markdownContent);

            // Open the note if requested
            if (options.openNote && noteFile) {
                if (options.openInNewLeaf) {
                    this.plugin.app.workspace.openLinkText(`${folderPath}/${noteTitle}.md`, `${folderPath}/${noteTitle}.md`, false);
                } else {
                    this.plugin.app.workspace.getLeaf(false).openFile(noteFile);
                }
            }

            return noteFile;

        } catch (error) {
            console.error("Error in NoteCreator.createNote:", error);
            throw error;
        }
    }

    /**
     * Resolves the note title from options or template
     */
    private async resolveNoteTitle(options: NoteCreationOptions): Promise<string | null> {
        if (options.noteTitle) {
            return options.noteTitle;
        }

        let titleTemplate = options.noteTitleTemplate;

        // Get title template from settings if not provided
        if (!titleTemplate && options.noteType) {
            if (options.noteType in this.plugin.settings.note) {
                titleTemplate = this.plugin.settings.note[options.noteType as keyof typeof this.plugin.settings.note].titleTemplate;
            } else {
                titleTemplate = this.plugin.settings.note.default.titleTemplate;
            }
        }

        if (titleTemplate) {
            return await parsePathTemplate(this.plugin.app, 'file', titleTemplate, options.formData);
        }

        // Fallback to default title
        return "New Note";
    }

    /**
     * Resolves the folder path from options or template
     */
    private async resolveFolderPath(options: NoteCreationOptions): Promise<string> {
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

        return "";
    }

    /**
     * Processes the markdown content template
     */
    private async processMarkdownContent(options: NoteCreationOptions): Promise<string> {
        let markdownTemplate: string;

        // Get markdown template from settings
        if (options.noteType && options.noteType in this.plugin.settings.note) {
            const noteSettings = this.plugin.settings.note[options.noteType as keyof typeof this.plugin.settings.note];
            markdownTemplate = noteSettings.markdownTemplate;
        } else {
            markdownTemplate = this.plugin.settings.note.default.markdownTemplate;
        }

        const noteTitle = await this.resolveNoteTitle(options);
        return processMarkdownTemplate(markdownTemplate, noteTitle || "New Note", options.formData);
    }

    /**
     * Creates the actual note file
     */
    private async createNoteFile(
        folderPath: string,
        noteTitle: string,
        metadata: Record<string, unknown>,
        content: string
    ): Promise<TFile> {
        // Ensure folder exists
        const cleanFolderPath = folderPath.endsWith("/") ? folderPath.slice(0, -1) : folderPath;
        const folder = this.plugin.app.vault.getFolderByPath(cleanFolderPath);
        if (!folder) {
            console.debug(`Folder "${cleanFolderPath}" does not exist. Creating it.`);
            await this.plugin.app.vault.createFolder(cleanFolderPath);
        }

        // Create note
        const notePath = `${cleanFolderPath}/${noteTitle}.md`;
        const noteFile = await this.plugin.app.vault.create(notePath, "");
        
        if (noteFile) {
            // Write metadata and content
            await this.plugin.app.fileManager.processFrontMatter(noteFile, (frontmatter) => {
                Object.assign(frontmatter, metadata);
            });
            await this.plugin.app.vault.append(noteFile, content);
        }

        return noteFile;
    }
}
