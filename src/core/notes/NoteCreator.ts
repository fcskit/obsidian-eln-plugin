import { TFile } from "obsidian";
import type ElnPlugin from "../../main";
import type { FormData, PathTemplate, MetaDataTemplateProcessed } from "../../types";
import { processMarkdownTemplate } from "../../data/templates/processMarkdownTemplate";
import { MetadataPostProcessor } from "./MetadataPostProcessor";
import { PathEvaluator, PathEvaluationResult } from "../templates/PathEvaluator";
import { FunctionEvaluator } from "../templates/FunctionEvaluator";
import { createLogger } from "../../utils/Logger";

const logger = createLogger('note');

export interface NoteCreationOptions {
    noteType?: string;
    noteTitle?: string;
    noteTitleTemplate?: PathTemplate;
    folderPath?: string;
    formData: FormData;
    metadataTemplate: MetaDataTemplateProcessed;
    openNote?: boolean;
    openInNewLeaf?: boolean;
    inheritedCounter?: string;  // Counter value inherited from folderPath
    createSubfolder?: string[];  // Subfolders to create within the note's folder
}

/**
 * Refactored version of NoteCreator that integrates with the new components_new architecture
 * while preserving all the robust functionality from the original NoteCreator
 */
export class NoteCreator {
    private plugin: ElnPlugin;
    private metadataPostProcessor: MetadataPostProcessor;
    private pathEvaluator: PathEvaluator;
    private functionEvaluator: FunctionEvaluator;

    constructor(plugin: ElnPlugin) {
        this.plugin = plugin;
        this.metadataPostProcessor = new MetadataPostProcessor(plugin);
        this.pathEvaluator = new PathEvaluator(plugin);
        this.functionEvaluator = new FunctionEvaluator(plugin);
    }

    /**
     * Creates a new note file with the given options
     * @param options The note creation options
     * @returns The created TFile or null if creation failed
     */
    async createNote(options: NoteCreationOptions): Promise<TFile | null> {
        try {
            logger.debug('[NoteCreator] Creating note with options:', options);
            
            // Sanitize form data to ensure all fields have proper values
            const sanitizedFormData = this.sanitizeFormData(options.formData, options.noteType);
            logger.debug('[NoteCreator] Sanitized form data:', sanitizedFormData);

            // Resolve folder path FIRST (needed for counter in fileName)
            const folderPathResult = await this.resolveFolderPath({
                ...options,
                formData: sanitizedFormData
            });
            const folderPath = folderPathResult.path;
            const folderCounter = folderPathResult.counterValue;
            logger.debug('[NoteCreator] Resolved folder path:', { folderPath, folderCounter });

            // Resolve note title (passing folderPath and any counter from folder path for counter evaluation)
            const noteTitle = await this.resolveNoteTitle({
                ...options,
                formData: sanitizedFormData,
                folderPath: folderPath,
                inheritedCounter: folderCounter  // Pass counter for inheritance
            });
            logger.debug('[NoteCreator] Resolved note title:', noteTitle);

            // Check if note already exists and generate unique name if needed
            const uniqueNoteTitle = await this.generateUniqueNoteTitle(folderPath, noteTitle);

            // Process metadata using user input
            const processedMetadata = await this.metadataPostProcessor.processMetadata(
                options.metadataTemplate, 
                sanitizedFormData
            );

            // Process postprocessor fields (fields that need filename/folderPath)
            const postprocessorUpdates = await this.processPostprocessorFields(
                options.metadataTemplate,
                sanitizedFormData,
                uniqueNoteTitle,
                folderPath,
                options.noteType
            );
            
            // Merge postprocessor updates into processed metadata
            this.mergeMetadata(processedMetadata, postprocessorUpdates);

            // Process markdown content
            const markdownContent = await this.processMarkdownContent({
                ...options,
                formData: sanitizedFormData,
                noteTitle: uniqueNoteTitle,
                folderPath: folderPath  // Pass folderPath for markdown template variables
            });

            // Create the note file using Obsidian's built-in functionality
            const noteFile = await this.createNoteFile(folderPath, uniqueNoteTitle, processedMetadata, markdownContent);

            // Create subfolders if specified in options
            if (options.createSubfolder && options.createSubfolder.length > 0) {
                await this.createSubfolders(folderPath, options.createSubfolder);
            }

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
            logger.error("Error in NoteCreator.createNote:", error);
            throw error;
        }
    }

    /**
     * Sanitize form data to ensure all expected fields have default values
     * This addresses the issue where undefined values get filtered out of frontmatter
     * IMPORTANT: This method should NOT add template-specific defaults as those are handled by MetadataPostProcessor
     */
    private sanitizeFormData(formData: FormData, noteType?: string): FormData {
        const sanitized: FormData = { ...formData };
        
        // Only ensure that essential top-level fields exist if they're completely missing
        // Do NOT add fields that might conflict with template structure
        // Note: title is intentionally not added here as it should be generated from titleTemplate
        
        return sanitized;
    }

    /**
     * Process fields with inputType="postprocessor" that need access to resolved filename and folder path.
     * These fields are evaluated after path resolution but before note creation.
     * 
     * @param template The metadata template
     * @param formData The user form data
     * @param filename The resolved filename (without extension)
     * @param folderPath The resolved folder path
     * @param noteType The note type
     * @returns Object with postprocessor field values to merge into metadata
     */
    private async processPostprocessorFields(
        template: MetaDataTemplateProcessed,
        formData: FormData,
        filename: string,
        folderPath: string,
        noteType?: string
    ): Promise<Record<string, unknown>> {
        const postprocessorContext = {
            filename,
            folderPath,
            fullPath: `${folderPath}/${filename}`
        };
        
        logger.debug('[NoteCreator] Processing postprocessor fields with context:', postprocessorContext);
        
        const updates: Record<string, unknown> = {};
        
        // Recursively find and evaluate postprocessor fields
        this.collectPostprocessorFields(template, formData, postprocessorContext, updates, [], noteType);
        
        logger.debug('[NoteCreator] Postprocessor field updates:', updates);
        return updates;
    }

    /**
     * Recursively collect and evaluate postprocessor fields from template
     */
    private collectPostprocessorFields(
        template: Record<string, unknown>,
        formData: FormData,
        postprocessorContext: { filename: string; folderPath: string; fullPath: string },
        updates: Record<string, unknown>,
        path: string[],
        noteType?: string
    ): void {
        for (const [key, value] of Object.entries(template)) {
            const currentPath = [...path, key];
            
            if (value && typeof value === 'object') {
                const field = value as { inputType?: string; default?: unknown };
                
                // Check if this is a postprocessor field
                if (field.inputType === 'postprocessor' && field.default) {
                    logger.debug('[NoteCreator] Found postprocessor field:', currentPath.join('.'));
                    
                    // Evaluate the default value with postprocessor context
                    const evaluatedValue = this.evaluatePostprocessorDefault(
                        field.default,
                        formData,
                        postprocessorContext,
                        noteType
                    );
                    
                    // Store in updates using nested path
                    this.setNestedValue(updates, currentPath, evaluatedValue);
                } else {
                    // Recursively check nested objects
                    this.collectPostprocessorFields(
                        value as Record<string, unknown>,
                        formData,
                        postprocessorContext,
                        updates,
                        currentPath,
                        noteType
                    );
                }
            }
        }
    }

    /**
     * Evaluate a postprocessor field default value
     */
    private evaluatePostprocessorDefault(
        defaultValue: unknown,
        formData: FormData,
        postprocessorContext: { filename: string; folderPath: string; fullPath: string },
        noteType?: string
    ): unknown {
        // Check if it's a function descriptor
        if (defaultValue && typeof defaultValue === 'object' && 'type' in defaultValue) {
            const descriptor = defaultValue as { type: string };
            
            if (descriptor.type === 'function') {
                try {
                    const result = this.functionEvaluator.evaluateFunction(
                        descriptor as never,  // Type assertion needed here
                        formData,
                        noteType,
                        undefined,  // inputValue
                        undefined,  // queryDropdownContext
                        postprocessorContext
                    );
                    return result;
                } catch (error) {
                    logger.error('[NoteCreator] Error evaluating postprocessor function:', error);
                    return null;
                }
            }
        }
        
        return defaultValue;
    }

    /**
     * Set a nested value in an object using a path array
     */
    private setNestedValue(obj: Record<string, unknown>, path: string[], value: unknown): void {
        let current = obj;
        for (let i = 0; i < path.length - 1; i++) {
            const key = path[i];
            if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
                current[key] = {};
            }
            current = current[key] as Record<string, unknown>;
        }
        current[path[path.length - 1]] = value;
    }

    /**
     * Merge postprocessor updates into processed metadata
     */
    private mergeMetadata(target: Record<string, unknown>, source: Record<string, unknown>): void {
        for (const [key, value] of Object.entries(source)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                if (!(key in target) || typeof target[key] !== 'object' || target[key] === null) {
                    target[key] = {};
                }
                this.mergeMetadata(target[key] as Record<string, unknown>, value as Record<string, unknown>);
            } else {
                target[key] = value;
            }
        }
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
    private async resolveNoteTitle(options: NoteCreationOptions): Promise<string> {
        logger.debug('[NoteCreator] Resolving title with options:', {
            noteTitle: options.noteTitle,
            noteType: options.noteType,
            formDataKeys: Object.keys(options.formData)
        });
        
        if (options.noteTitle) {
            logger.debug('[NoteCreator] Using provided noteTitle:', options.noteTitle);
            return options.noteTitle;
        }

        let fileNameTemplate: PathTemplate | undefined = options.noteTitleTemplate;

        // Get fileName template from settings if not provided
        if (!fileNameTemplate && options.noteType) {
            try {
                if (options.noteType in this.plugin.settings.note) {
                    const noteSettings = this.plugin.settings.note[options.noteType as keyof typeof this.plugin.settings.note];
                    fileNameTemplate = noteSettings.fileName;
                    logger.debug('[NoteCreator] Got fileName template from noteType settings:', fileNameTemplate);
                } else {
                    fileNameTemplate = this.plugin.settings.note.default.fileName;
                    logger.debug('[NoteCreator] Got fileName template from default settings:', fileNameTemplate);
                }
            } catch (error) {
                logger.warn('Failed to get fileName template from settings:', error);
            }
        }

        if (fileNameTemplate) {
            try {
                const result = await this.pathEvaluator.evaluatePath(fileNameTemplate, {
                    plugin: this.plugin,
                    userInput: options.formData,
                    targetFolder: options.folderPath || "",
                    inheritedCounter: options.inheritedCounter  // Pass inherited counter from folderPath
                });
                if (result.path) {
                    logger.debug('[NoteCreator] Evaluated fileName from template:', result.path);
                    return result.path;  // Return the path string
                }
            } catch (error) {
                logger.warn('Failed to evaluate fileName template:', error, fileNameTemplate);
            }
        }

        // Fallback to title from form data or default (same as original NoteCreator)
        const fallbackTitle = String(options.formData.title || "New Note");
        logger.debug('[NoteCreator] Using fallback title:', fallbackTitle);
        return fallbackTitle;
    }

    /**
     * Resolves the folder path from options or template
     * Returns an object with path and optional counterValue
     */
    private async resolveFolderPath(options: NoteCreationOptions): Promise<PathEvaluationResult> {
        if (options.folderPath) {
            return { path: options.folderPath };
        }

        // Get folderPath template from settings
        let folderPathTemplate: PathTemplate | undefined;
        if (options.noteType && options.noteType in this.plugin.settings.note) {
            const noteSettings = this.plugin.settings.note[options.noteType as keyof typeof this.plugin.settings.note];
            folderPathTemplate = noteSettings.folderPath;
        } else {
            folderPathTemplate = this.plugin.settings.note.default.folderPath;
        }

        if (folderPathTemplate) {
            const resolved = await this.pathEvaluator.evaluatePath(folderPathTemplate, {
                plugin: this.plugin,
                userInput: options.formData,
                targetFolder: ""
            });
            return resolved;
        }

        // Fallback based on note type
        if (options.noteType === 'test') {
            return { path: "Test Notes" };
        }

        return { path: "" };
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

        const noteTitle = options.noteTitle || await this.resolveNoteTitle(options);
        return processMarkdownTemplate(
            markdownTemplate, 
            noteTitle || "New Note", 
            options.formData,
            options.folderPath  // Pass folderPath for {{folderPath}} variable support
        );
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
                logger.debug(`Folder "${cleanFolderPath}" does not exist. Creating it.`);
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

    /**
     * Create subfolders within the note's folder path
     * Used for organizing note-related files (data, plots, documents, etc.)
     */
    private async createSubfolders(basePath: string, subfolders: string[]): Promise<void> {
        for (const subfolder of subfolders) {
            const subfolderPath = basePath ? `${basePath}/${subfolder}` : subfolder;
            const folder = this.plugin.app.vault.getFolderByPath(subfolderPath);
            
            if (!folder) {
                try {
                    logger.debug(`Creating subfolder: ${subfolderPath}`);
                    await this.plugin.app.vault.createFolder(subfolderPath);
                } catch (error) {
                    logger.warn(`Failed to create subfolder ${subfolderPath}:`, error);
                }
            }
        }
    }
}

