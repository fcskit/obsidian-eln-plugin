/**
 * Safe context interfaces and factory for template function evaluation.
 * 
 * These interfaces limit access to only safe operations, preventing
 * direct manipulation of plugin internals or dangerous file system operations.
 * 
 * @module ContextProviders
 */

import { TFile, moment } from "obsidian";
import { createLogger } from "../../utils/Logger";
import type ElnPlugin from "../../main";
import type { SubclassMetadataTemplate } from "../../types/templates";
import type { ChemicalLookup } from "../api/ChemicalLookup";

const logger = createLogger('template');

/**
 * Safe plugin context - read-only metadata only
 */
export interface PluginContext {
    /** Plugin version */
    version: string;
    /** Manifest information */
    manifest: {
        version: string;
        id: string;
        name: string;
    };
    /** Chemical lookup service */
    chemicalLookup: ChemicalLookup;
}

/**
 * Safe settings context - read-only access mirroring ELNSettings structure
 */
export interface SettingsContext {
    /** General settings */
    general: {
        authors: Array<{ name: string; initials: string }>;
        operators: Array<{ name: string; initials: string }>;
    };
    
    /** Note type settings */
    note: {
        [noteType: string]: unknown;
    };
    
    /** Navbar settings */
    navbar: {
        enabled: boolean;
        groups: Array<{ id: string; name: string; order: number }>;
    };
    
    /** Footer settings */
    footer: {
        enabled: boolean;
        includeVersion: boolean;
        includeAuthor: boolean;
        includeMtime: boolean;
        includeCtime: boolean;
    };
    
    /**
     * Get a nested setting value by path (for convenience)
     * @param path Dot-notation path (e.g., "general.authors")
     * @returns The value at the path, or undefined if not found
     */
    get(path: string): unknown;
}

/**
 * Safe file system context - limited read-only operations
 */
export interface FileSystemContext {
    /**
     * List markdown files in the vault
     * @param filter Optional filter criteria
     * @returns Array of file metadata
     */
    listFiles(filter?: {
        startsWith?: string;
        noteType?: string;
        folder?: string;
    }): Array<{
        name: string;
        basename: string;
        path: string;
    }>;
    
    /**
     * Get the next counter number for a given prefix
     * @param prefix File name prefix to match
     * @param width Zero-padding width (default: 2)
     * @returns Formatted counter string
     */
    getNextCounter(prefix: string, width?: number): string;
    
    /**
     * Check if a file exists at the given path
     * @param path File path to check
     * @returns True if file exists
     */
    fileExists(path: string): boolean;
    
    /**
     * Check if a folder exists at the given path
     * @param path Folder path to check
     * @returns True if folder exists
     */
    folderExists(path: string): boolean;
    
    /**
     * Get files in a specific folder
     * @param folderPath Folder path to search
     * @returns Array of file metadata in that folder
     */
    getFilesInFolder(folderPath: string): Array<{
        name: string;
        basename: string;
        path: string;
    }>;
    
    /**
     * Get subfolders within a specific folder
     * @param folderPath Parent folder path to search (empty string for root)
     * @returns Array of subfolder paths
     */
    getFoldersInFolder(folderPath: string): string[];
}

/**
 * Safe vault context - read-only vault operations
 */
export interface VaultContext {
    /**
     * Get all unique tags in the vault
     * @returns Array of tag strings (without #)
     */
    getAllTags(): string[];
    
    /**
     * Get notes that have a specific tag
     * @param tag Tag to search for (without #)
     * @returns Array of file metadata
     */
    getNotesWithTag(tag: string): Array<{
        name: string;
        path: string;
    }>;
    
    /**
     * Get all folders in the vault
     * @returns Array of folder paths
     */
    getFolders(): string[];
}

/**
 * Safe note metadata context - read-only access to other notes' metadata
 */
export interface NoteMetadataContext {
    /**
     * Get metadata for a specific note
     * @param noteNameOrPath Note name or full path
     * @returns Metadata object or null if not found
     */
    get(noteNameOrPath: string): Record<string, unknown> | null;
    
    /**
     * Query notes by criteria
     * @param filter Filter criteria
     * @returns Array of metadata objects
     */
    query(filter: {
        noteType?: string;
        tag?: string;
        field?: { path: string; value: unknown };
    }): Array<Record<string, unknown>>;
}

/**
 * Safe subclass context - read-only access to subclass definitions
 */
export interface SubclassContext {
    /**
     * Get a specific subclass template
     * @param subclassName Name of the subclass
     * @returns Subclass template or null if not found
     */
    get(subclassName: string): SubclassMetadataTemplate | null;
    
    /**
     * List all available subclass names
     * @returns Array of subclass names
     */
    list(): string[];
}

/**
 * Safe date context - date formatting and manipulation
 */
export interface DateContext {
    /**
     * Format the current date or a specific date using moment.js format tokens
     * @param format Format string (e.g., "YYYY-MM-DD", "dddd, MMMM Do, YYYY")
     * @param offsetStr Optional offset (e.g., "+1d", "-2w", "+3M")
     * @returns Formatted date string
     * @see https://momentjs.com/docs/#/displaying/format/
     * 
     * @example
     * date.format("YYYY-MM-DD")  // "2026-01-19"
     * date.format("dddd, MMMM Do, YYYY")  // "Sunday, January 19th, 2026"
     * date.format("YYYY-MM-DD", "+1d")  // Tomorrow
     * date.format("YYYY", "-1y")  // Last year
     */
    format(format: string, offsetStr?: string): string;
    
    /**
     * Get current year (4-digit)
     */
    year(): number;
    
    /**
     * Get current month (1-12)
     */
    month(): number;
    
    /**
     * Get current month name (localized)
     */
    monthName(): string;
    
    /**
     * Get current day of month (1-31)
     */
    day(): number;
    
    /**
     * Get current weekday name (localized)
     */
    weekday(): string;
    
    /**
     * Get ISO week number (1-53)
     */
    week(): number;
    
    /**
     * Get current date in ISO format (YYYY-MM-DD)
     */
    iso(): string;
    
    /**
     * Get current date in ISO format (YYYY-MM-DD)
     * Alias for iso() for backwards compatibility
     */
    today: string;
}

/**
 * QueryDropdown context - provides access to referenced note and selection
 * Used in queryDropdown fields with "from" and "get" keys
 */
export interface QueryDropdownContext {
    /**
     * The currently selected value from the dropdown
     */
    selection: unknown;
    
    /**
     * Frontmatter of the note referenced by the "from" field
     */
    frontmatter: Record<string, unknown> | null;
    
    /**
     * File metadata of the referenced note
     */
    file: {
        name: string;
        link: string;
        path: string;
    } | null;
}

/**
 * Postprocessor context - provides access to resolved file paths after note creation
 */
export interface PostprocessorContext {
    /**
     * The resolved filename (without extension) for the note being created
     */
    filename: string;
    
    /**
     * The resolved folder path where the note will be created
     */
    folderPath: string;
    
    /**
     * The full file path (folderPath/filename)
     */
    fullPath: string;
}

/**
 * Factory to create safe context objects from plugin instance.
 * All contexts are read-only and limit access to safe operations only.
 */
export class ContextFactory {
    constructor(private plugin: ElnPlugin) {}
    
    /**
     * Create a safe plugin context with read-only manifest information
     */
    createPluginContext(): PluginContext {
        return {
            version: this.plugin.manifest.version,
            manifest: {
                version: this.plugin.manifest.version,
                id: this.plugin.manifest.id,
                name: this.plugin.manifest.name
            },
            chemicalLookup: this.plugin.chemicalLookup
        };
    }
    
    /**
     * Create a safe settings context with validated property access
     */
    createSettingsContext(): SettingsContext {
        const settings = this.plugin.settings;
        return {
            general: {
                authors: settings.general?.authors || [],
                operators: settings.general?.operators || [],
            },
            note: settings.note || {},
            navbar: {
                enabled: settings.navbar?.enabled ?? true,
                groups: settings.navbar?.groups || [],
            },
            footer: {
                enabled: settings.footer?.enabled ?? true,
                includeVersion: settings.footer?.includeVersion ?? true,
                includeAuthor: settings.footer?.includeAuthor ?? true,
                includeMtime: settings.footer?.includeMtime ?? true,
                includeCtime: settings.footer?.includeCtime ?? false,
            },
            get(path: string): unknown {
                return safeGet(settings, path);
            }
        };
    }
    
    /**
     * Create a safe file system context with limited read operations
     */
    createFileSystemContext(): FileSystemContext {
        const vault = this.plugin.app.vault;
        const metadataCache = this.plugin.app.metadataCache;
        
        return {
            listFiles(filter) {
                const files = vault.getMarkdownFiles();
                let filtered = files;
                
                // Filter by file name prefix
                if (filter?.startsWith) {
                    filtered = filtered.filter(f => 
                        f.basename.startsWith(filter.startsWith!)
                    );
                }
                
                // Filter by folder
                if (filter?.folder) {
                    const folderPath = filter.folder.endsWith('/') 
                        ? filter.folder 
                        : filter.folder + '/';
                    filtered = filtered.filter(f => 
                        f.path.startsWith(folderPath)
                    );
                }
                
                // Filter by note type from frontmatter
                if (filter?.noteType) {
                    filtered = filtered.filter(f => {
                        const cache = metadataCache.getFileCache(f);
                        return cache?.frontmatter?.["note type"] === filter.noteType;
                    });
                }
                
                return filtered.map(f => ({
                    name: f.name,
                    basename: f.basename,
                    path: f.path
                }));
            },
            
            getNextCounter(prefix: string, width: number = 2): string {
                const files = vault.getMarkdownFiles();
                const matchingFiles = files.filter(f => f.basename.startsWith(prefix));
                
                // Extract numbers from matching file names
                const numbers = matchingFiles
                    .map(f => {
                        const match = f.basename.match(/(\d+)$/);
                        return match ? parseInt(match[1], 10) : 0;
                    })
                    .filter(n => !isNaN(n));
                
                // Get next number
                const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
                
                // Format with zero padding
                return nextNum.toString().padStart(width, '0');
            },
            
            fileExists(path: string): boolean {
                const abstractFile = vault.getAbstractFileByPath(path);
                return abstractFile !== null && 'extension' in abstractFile;
            },
            
            folderExists(path: string): boolean {
                const abstractFile = vault.getAbstractFileByPath(path);
                return abstractFile !== null && !('extension' in abstractFile);
            },
            
            getFilesInFolder(folderPath: string): Array<{
                name: string;
                basename: string;
                path: string;
            }> {
                const files = vault.getMarkdownFiles();
                const normalizedPath = folderPath === '' 
                    ? '' 
                    : folderPath.endsWith('/') 
                        ? folderPath 
                        : folderPath + '/';
                
                const filesInFolder = files.filter(f => {
                    if (normalizedPath === '') {
                        // Root folder - files with no '/' in path
                        return !f.path.includes('/');
                    }
                    
                    const fileFolderPath = f.path.substring(0, f.path.lastIndexOf('/') + 1);
                    return fileFolderPath === normalizedPath;
                });
                
                return filesInFolder.map(f => ({
                    name: f.name,
                    basename: f.basename,
                    path: f.path
                }));
            },
            
            getFoldersInFolder(folderPath: string): string[] {
                const allFolders = new Set<string>();
                const files = vault.getMarkdownFiles();
                
                // Collect all unique folder paths
                for (const file of files) {
                    const fileFolderPath = file.path.substring(0, file.path.lastIndexOf('/'));
                    if (fileFolderPath) {
                        allFolders.add(fileFolderPath);
                    }
                }
                
                // Filter to immediate subfolders only
                const normalizedPath = folderPath === '' 
                    ? '' 
                    : folderPath.endsWith('/') 
                        ? folderPath.slice(0, -1)  // Remove trailing slash
                        : folderPath;
                
                const subfolders = Array.from(allFolders).filter(folder => {
                    if (normalizedPath === '') {
                        // Root level - folders with no '/' in them
                        return !folder.includes('/');
                    }
                    
                    // Check if this folder is a direct child
                    if (!folder.startsWith(normalizedPath + '/')) {
                        return false;
                    }
                    
                    // Remove parent path and check if there are more slashes (deeper nesting)
                    const relativePath = folder.substring(normalizedPath.length + 1);
                    return !relativePath.includes('/');
                });
                
                return subfolders.sort();
            }
        };
    }
    
    /**
     * Create a safe vault context with read-only vault operations
     */
    createVaultContext(): VaultContext {
        const vault = this.plugin.app.vault;
        const metadataCache = this.plugin.app.metadataCache;
        
        return {
            getAllTags(): string[] {
                const tags = new Set<string>();
                const files = vault.getMarkdownFiles();
                
                for (const file of files) {
                    const cache = metadataCache.getFileCache(file);
                    if (cache?.tags) {
                        for (const tag of cache.tags) {
                            tags.add(tag.tag.replace(/^#/, ''));
                        }
                    }
                    if (cache?.frontmatter?.tags) {
                        const frontmatterTags = cache.frontmatter.tags;
                        if (Array.isArray(frontmatterTags)) {
                            frontmatterTags.forEach(tag => tags.add(String(tag).replace(/^#/, '')));
                        }
                    }
                }
                
                return Array.from(tags).sort();
            },
            
            getNotesWithTag(tag: string): Array<{ name: string; path: string }> {
                const normalizedTag = tag.replace(/^#/, '');
                const files = vault.getMarkdownFiles();
                const results: Array<{ name: string; path: string }> = [];
                
                for (const file of files) {
                    const cache = metadataCache.getFileCache(file);
                    const hasCacheTag = cache?.tags?.some(t => 
                        t.tag.replace(/^#/, '') === normalizedTag
                    );
                    const hasFrontmatterTag = Array.isArray(cache?.frontmatter?.tags) &&
                        cache.frontmatter.tags.some((t: unknown) => 
                            String(t).replace(/^#/, '') === normalizedTag
                        );
                    
                    if (hasCacheTag || hasFrontmatterTag) {
                        results.push({
                            name: file.name,
                            path: file.path
                        });
                    }
                }
                
                return results;
            },
            
            getFolders(): string[] {
                const folders = new Set<string>();
                const files = vault.getMarkdownFiles();
                
                for (const file of files) {
                    const folderPath = file.path.substring(0, file.path.lastIndexOf('/'));
                    if (folderPath) {
                        folders.add(folderPath);
                    }
                }
                
                return Array.from(folders).sort();
            }
        };
    }
    
    /**
     * Create a safe note metadata context with read-only access
     */
    createNoteMetadataContext(): NoteMetadataContext {
        const vault = this.plugin.app.vault;
        const metadataCache = this.plugin.app.metadataCache;
        
        return {
            get(noteNameOrPath: string): Record<string, unknown> | null {
                // Handle invalid input
                if (!noteNameOrPath || typeof noteNameOrPath !== 'string') {
                    logger.warn(`noteMetadata.get() received invalid input:`, {
                        value: noteNameOrPath,
                        type: typeof noteNameOrPath
                    });
                    return null;
                }
                
                let file: TFile | null = null;
                
                // First, try using Obsidian's link resolution (handles basename, aliases, etc.)
                try {
                    file = metadataCache.getFirstLinkpathDest(noteNameOrPath, '');
                } catch (error) {
                    logger.warn(`Error in getFirstLinkpathDest for "${noteNameOrPath}":`, error);
                }
                
                // If not found, try as full path
                if (!file) {
                    const abstractFile = vault.getAbstractFileByPath(noteNameOrPath);
                    if (abstractFile instanceof TFile) {
                        file = abstractFile;
                    }
                }
                
                if (!file) {
                    logger.debug(`Note not found: ${noteNameOrPath}`);
                    return null;
                }
                
                const cache = metadataCache.getFileCache(file);
                return cache?.frontmatter as Record<string, unknown> || null;
            },
            
            query(filter): Array<Record<string, unknown>> {
                const files = vault.getMarkdownFiles();
                const results: Array<Record<string, unknown>> = [];
                
                for (const file of files) {
                    const cache = metadataCache.getFileCache(file);
                    const frontmatter = cache?.frontmatter;
                    if (!frontmatter) continue;
                    
                    // Filter by note type
                    if (filter.noteType && frontmatter["note type"] !== filter.noteType) {
                        continue;
                    }
                    
                    // Filter by tag
                    if (filter.tag) {
                        const normalizedTag = filter.tag.replace(/^#/, '');
                        const hasCacheTag = cache?.tags?.some(t => 
                            t.tag.replace(/^#/, '') === normalizedTag
                        );
                        const hasFrontmatterTag = Array.isArray(frontmatter.tags) &&
                            frontmatter.tags.some((t: unknown) => 
                                String(t).replace(/^#/, '') === normalizedTag
                            );
                        
                        if (!hasCacheTag && !hasFrontmatterTag) {
                            continue;
                        }
                    }
                    
                    // Filter by field value
                    if (filter.field) {
                        const fieldValue = safeGet(frontmatter, filter.field.path);
                        if (fieldValue !== filter.field.value) {
                            continue;
                        }
                    }
                    
                    results.push(frontmatter as Record<string, unknown>);
                }
                
                return results;
            }
        };
    }
    
    /**
     * Create a safe subclass context for a specific note type
     * @param noteType The note type to get subclasses for
     */
    createSubclassContext(noteType: string): SubclassContext {
        const settings = this.plugin.settings;
        
        return {
            get(subclassName: string): SubclassMetadataTemplate | null {
                const noteConfig = settings.note[noteType as keyof typeof settings.note];
                if (!noteConfig) {
                    logger.debug(`Note type not found: ${noteType}`);
                    return null;
                }
                
                // Check if subclasses exist (may not be implemented for all note types yet)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const subclassesConfig = (noteConfig as any).subclasses;
                if (!subclassesConfig || !Array.isArray(subclassesConfig.sources)) {
                    logger.debug(`No subclasses found for note type: ${noteType}`);
                    return null;
                }
                
                // Search through all subclass sources
                for (const source of subclassesConfig.sources) {
                    if (source && typeof source === 'object' && 'name' in source && source.name === subclassName) {
                        return source as SubclassMetadataTemplate;
                    }
                }
                
                return null;
            },
            
            list(): string[] {
                const noteConfig = settings.note[noteType as keyof typeof settings.note];
                if (!noteConfig) {
                    return [];
                }
                
                // Check if subclasses exist (may not be implemented for all note types yet)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const subclassesConfig = (noteConfig as any).subclasses;
                if (!subclassesConfig || !Array.isArray(subclassesConfig.sources)) {
                    return [];
                }
                
                return subclassesConfig.sources
                    .filter((s: unknown): s is { name: string } => 
                        s !== null && typeof s === 'object' && 'name' in s
                    )
                    .map((s: { name: string }) => s.name);
            }
        };
    }
    
    /**
     * Create a safe date context with moment.js formatting
     */
    createDateContext(): DateContext {
        const { moment } = window as typeof window & { moment: typeof import('moment') };
        
        const today = moment().format('YYYY-MM-DD'); // Calculate once
        
        return {
            format(formatStr: string, offsetStr?: string): string {
                let m = moment();
                
                // Apply offset if provided
                if (offsetStr) {
                    const offset = parseOffset(offsetStr);
                    if (offset) {
                        m = m.add(offset.amount, offset.unit);
                    }
                }
                
                return m.format(formatStr);
            },
            
            year(): number {
                return moment().year();
            },
            
            month(): number {
                return moment().month() + 1;  // moment.js months are 0-indexed
            },
            
            monthName(): string {
                return moment().format('MMMM');
            },
            
            day(): number {
                return moment().date();
            },
            
            weekday(): string {
                return moment().format('dddd');
            },
            
            week(): number {
                return moment().week();
            },
            
            iso(): string {
                return moment().format('YYYY-MM-DD');
            },
            
            // Property for backwards compatibility with templates
            today: today
        };
    }
}

/**
 * Safe property getter with path validation.
 * Prevents access to dangerous properties like __proto__, constructor, prototype.
 * 
 * @param obj Object to get property from
 * @param path Dot-notation path (e.g., "general.authors")
 * @returns The value at the path, or undefined if not found
 * @throws Error if attempting to access dangerous properties
 */
export function safeGet(obj: unknown, path: string): unknown {
    // Prevent access to dangerous properties
    const dangerousProps = ['__proto__', 'constructor', 'prototype'];
    const parts = path.split('.');
    
    // Check for dangerous property access
    if (parts.some(p => dangerousProps.includes(p))) {
        throw new Error(`Access to property '${path}' is not allowed for security reasons`);
    }
    
    // Navigate through the object
    let current = obj;
    for (const part of parts) {
        if (current == null) {
            return undefined;
        }
        current = (current as Record<string, unknown>)[part];
    }
    
    return current;
}

/**
 * Parse offset string for date manipulation.
 * Supports formats like: +1d, -2w, +3M, -1y
 * 
 * @param offset Offset string (e.g., "+1d", "-2w")
 * @returns Parsed offset with amount and unit, or null if invalid
 */
function parseOffset(offset: string): { amount: number; unit: moment.unitOfTime.DurationConstructor } | null {
    const match = offset.match(/^([+-]?\d+)([hdwMy])$/);
    if (!match) return null;
    
    const amount = parseInt(match[1], 10);
    
    // Map single-letter units to moment.js units
    const unitMap: Record<string, moment.unitOfTime.DurationConstructor> = {
        'h': 'hours',
        'd': 'days',
        'w': 'weeks',
        'M': 'months',
        'y': 'years'
    };
    
    const unit = unitMap[match[2]];
    if (!unit) return null;
    
    return { amount, unit };
}
