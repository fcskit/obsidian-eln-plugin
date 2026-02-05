import { App, ButtonComponent, setIcon, Notice } from "obsidian";
import { LabeledInputBaseOptions, LabeledInputBase } from "./LabeledInputBase";
import { createLogger } from "../../../utils/Logger";
import * as path from "path";

export interface FilePickerOptions extends LabeledInputBaseOptions<string[]> {
    app: App;
    baseFolder?: string;  // Starting folder for file selection (e.g., "Data/")
    placeholder?: string;  // Placeholder text when no files selected
    allowMultiple?: boolean;  // Allow selecting multiple files (default: true)
    fileExtensions?: string[];  // Filter by file extensions (e.g., ['.csv', '.xlsx'])
    onValueChange?: (filePaths: string[]) => void;
}

/**
 * File picker component that allows selecting one or more files from the vault.
 * Files are displayed with their paths, and stored as an array of paths.
 */
export class FilePicker extends LabeledInputBase<string[]> {
    protected app: App;
    protected baseFolder?: string;
    protected placeholder: string;
    protected allowMultiple: boolean;
    protected fileExtensions?: string[];
    protected selectedFiles: string[] = [];
    protected fileListContainer!: HTMLElement;
    protected onFilePickerChange?: (filePaths: string[]) => void;
    protected logger = createLogger('ui');
    private defaultValue?: string[];

    constructor(options: FilePickerOptions) {
        const { 
            app, 
            baseFolder, 
            placeholder = "No files selected", 
            allowMultiple = true,
            fileExtensions,
            onValueChange,
            ...baseOptions 
        } = options;
        
        super(baseOptions);
        
        this.app = app;
        this.baseFolder = baseFolder;
        this.placeholder = placeholder;
        this.allowMultiple = allowMultiple;
        this.fileExtensions = fileExtensions;
        this.onFilePickerChange = onValueChange;
        this.defaultValue = baseOptions.defaultValue;
        
        // Initialize with default value if provided
        if (Array.isArray(this.defaultValue) && this.defaultValue.length > 0) {
            this.selectedFiles = [...this.defaultValue];
        }
        
        this.logger.debug('FilePicker initialized:', {
            label: this.label,
            baseFolder: this.baseFolder,
            allowMultiple: this.allowMultiple,
            fileExtensions: this.fileExtensions,
            defaultValue: this.defaultValue,
            selectedFiles: this.selectedFiles
        });
        
        // Create the value editor (required by LabeledInputBase)
        this.createValueEditor(options);
    }

    /**
     * Required by LabeledInputBase - creates the file picker UI
     */
    protected createValueEditor(options: FilePickerOptions): void {
        // Container for selected files list
        this.fileListContainer = this.valueSection.createDiv({ cls: "eln-file-picker-list" });
        
        // Render current selection
        this.renderFileList();
        
        // Add file button
        const buttonContainer = this.valueSection.createDiv({ cls: "eln-file-picker-button-container" });
        
        new ButtonComponent(buttonContainer)
            .setButtonText(this.allowMultiple ? "Add files..." : "Select file...")
            .setIcon("folder-open")
            .onClick(() => this.openFilePicker());
    }

    protected renderFileList(): void {
        // Clear existing list
        this.fileListContainer.empty();
        
        if (this.selectedFiles.length === 0) {
            // Show placeholder
            const placeholderEl = this.fileListContainer.createDiv({
                cls: "eln-file-picker-placeholder",
                text: this.placeholder
            });
            placeholderEl.style.color = "var(--text-muted)";
            placeholderEl.style.fontStyle = "italic";
            placeholderEl.style.fontSize = "0.9em";
            placeholderEl.style.marginBottom = "8px";
        } else {
            // Render each selected file
            this.selectedFiles.forEach((markdownLink, index) => {
                // Extract filename and path from markdown link
                // Format: [filename](<file:///path>)
                const { filename, absolutePath } = this.parseFileLink(markdownLink);
                
                const fileItem = this.fileListContainer.createDiv({ cls: "eln-file-picker-item" });
                
                // File icon
                const iconSpan = fileItem.createSpan({ cls: "eln-file-picker-icon" });
                setIcon(iconSpan, "file");
                
                // File name (clickable to open) - Display filename only
                const pathSpan = fileItem.createSpan({ 
                    cls: "eln-file-picker-path",
                    text: filename 
                });
                pathSpan.title = absolutePath; // Show full path on hover
                pathSpan.style.cursor = "pointer";
                pathSpan.style.flex = "1";
                pathSpan.addEventListener("click", () => this.openFile(absolutePath));
                
                // Remove button
                const removeBtn = fileItem.createSpan({ cls: "eln-file-picker-remove" });
                setIcon(removeBtn, "x");
                removeBtn.style.cursor = "pointer";
                removeBtn.style.opacity = "0.6";
                removeBtn.addEventListener("click", () => this.removeFile(index));
                removeBtn.addEventListener("mouseenter", () => removeBtn.style.opacity = "1");
                removeBtn.addEventListener("mouseleave", () => removeBtn.style.opacity = "0.6");
            });
        }
    }

    protected openFilePicker(): void {
        this.logger.debug('Opening native file picker:', {
            baseFolder: this.baseFolder,
            allowMultiple: this.allowMultiple
        });
        
        try {
            // Access Electron's remote dialog
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { remote } = require("electron");
            const dialog = remote.dialog;
            
            // Configure dialog options
            const dialogOptions: {
                properties: string[];
                filters?: Array<{ name: string; extensions: string[] }>;
                defaultPath?: string;
            } = {
                properties: this.allowMultiple 
                    ? ["openFile", "multiSelections"] 
                    : ["openFile"]
            };
            
            // Add file extension filters if specified
            if (this.fileExtensions && this.fileExtensions.length > 0) {
                dialogOptions.filters = [
                    { 
                        name: "Allowed Files", 
                        extensions: this.fileExtensions.map(ext => ext.replace('.', ''))
                    },
                    { name: "All Files", extensions: ["*"] }
                ];
            }
            
            // Set default path if baseFolder is specified
            if (this.baseFolder) {
                // Try to resolve base folder relative to vault
                const vaultAdapter = this.app.vault.adapter as { basePath?: string };
                const vaultPath = vaultAdapter.basePath;
                if (vaultPath) {
                    dialogOptions.defaultPath = path.join(vaultPath, this.baseFolder);
                }
            }
            
            // Show dialog and handle result
            dialog.showOpenDialog(dialogOptions).then((result: { canceled: boolean; filePaths: string[] }) => {
                if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
                    this.logger.debug('Files selected:', result.filePaths);
                    // Convert absolute paths to markdown file links
                    this.selectedFiles = result.filePaths.map(filePath => this.formatFileLink(filePath));
                    this.renderFileList();
                    this.notifyValueChange();
                } else {
                    this.logger.debug('File selection canceled');
                }
            }).catch((error: Error) => {
                this.logger.error('Error opening file picker:', error);
                new Notice("Error selecting files: " + error.message);
            });
            
        } catch (error) {
            this.logger.error('Failed to access Electron dialog:', error);
            new Notice("Failed to open file picker. Electron remote API not available.");
        }
    }

    /**
     * Format an absolute file path as a markdown file link.
     * Converts: /path/to/file.pdf
     * To: [file.pdf](<file:////path/to/file.pdf>)
     */
    protected formatFileLink(absolutePath: string): string {
        // Extract filename from path
        const filename = path.basename(absolutePath);
        
        // Convert to file:// URL and encode special characters
        // For markdown file links, we need file:/// (3 slashes) + absolute path
        const fileUrl = `file:///${absolutePath.replace(/\\/g, '/')}`;
        
        // Create markdown link with angle brackets to handle spaces
        const markdownLink = `[${filename}](<${fileUrl}>)`;
        
        this.logger.debug('Formatted file link:', {
            absolutePath,
            filename,
            fileUrl,
            markdownLink
        });
        
        return markdownLink;
    }

    /**
     * Parse a markdown file link to extract filename and absolute path.
     * Parses: [filename](<file:///path>)
     * Returns: { filename, absolutePath }
     */
    protected parseFileLink(markdownLink: string): { filename: string; absolutePath: string } {
        // Pattern: [filename](<file:///path>)
        const match = markdownLink.match(/\[(.+?)\]\(<file:\/\/\/(.+?)>\)/);
        
        if (match && match[1] && match[2]) {
            return {
                filename: match[1],
                absolutePath: match[2]
            };
        }
        
        // Fallback: treat as raw path if not in markdown format
        const filename = path.basename(markdownLink);
        
        return {
            filename: filename || markdownLink,
            absolutePath: markdownLink
        };
    }

    protected addFile(filePath: string): void {
        if (!this.selectedFiles.includes(filePath)) {
            this.selectedFiles.push(filePath);
            this.logger.debug('File added:', { filePath, selectedFiles: this.selectedFiles });
        }
    }

    protected removeFile(index: number): void {
        if (index >= 0 && index < this.selectedFiles.length) {
            const removed = this.selectedFiles.splice(index, 1);
            this.logger.debug('File removed:', { removed, selectedFiles: this.selectedFiles });
            this.renderFileList();
            this.notifyValueChange();
        }
    }

    protected openFile(filePath: string): void {
        // Try to open the file using Electron's shell
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { shell } = require("electron");
            shell.openPath(filePath).catch((error: Error) => {
                this.logger.error('Failed to open file:', error);
                new Notice("Failed to open file: " + filePath);
            });
        } catch (error) {
            this.logger.error('Failed to access Electron shell:', error);
            new Notice("Failed to open file. Electron shell API not available.");
        }
    }

    protected notifyValueChange(): void {
        this.logger.debug('FilePicker value changed:', {
            label: this.label,
            selectedFiles: this.selectedFiles
        });
        
        if (this.onFilePickerChange) {
            this.onFilePickerChange(this.selectedFiles);
        }
    }

    /**
     * Get currently selected file paths
     */
    getValue(): string[] {
        return [...this.selectedFiles];
    }

    /**
     * Set selected file paths programmatically
     */
    setValue(filePaths: string[]): void {
        this.selectedFiles = Array.isArray(filePaths) ? [...filePaths] : [];
        this.renderFileList();
        this.logger.debug('FilePicker value set:', {
            label: this.label,
            selectedFiles: this.selectedFiles
        });
    }

    /**
     * Get reactive dependencies (none for FilePicker)
     */
    getReactiveDependencies(): string[] {
        return [];
    }
}
