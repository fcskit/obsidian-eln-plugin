import { App, MarkdownView, TFile, debounce } from "obsidian";
import ELNPlugin from "../../main";

export class Footer {
    private app: App;
    private plugin: ELNPlugin;
    private containerEl: HTMLElement | null = null;
    private mutationObserver: MutationObserver | null = null;
    private debouncedUpdate: () => void;

    constructor(app: App, plugin: ELNPlugin) {
        this.app = app;
        this.plugin = plugin;
        
        // Create debounced update function for editing mode
        this.debouncedUpdate = debounce(() => {
            this.updateFooter();
        }, 500, true);
    }

    init() {
        this.registerEventHandlers();
        this.updateFooter();
    }

    private registerEventHandlers() {
        // Register workspace events
        this.app.workspace.on('active-leaf-change', () => {
            this.updateFooter();
        });

        this.app.workspace.on('file-open', () => {
            this.updateFooter();
        });

        this.app.workspace.on('layout-change', () => {
            this.updateFooter();
        });

        // Handle editor changes (debounced for performance)
        this.app.workspace.on('editor-change', () => {
            if (this.isEditMode()) {
                this.debouncedUpdate();
            }
        });
    }

    private updateFooter() {
        const activeLeaf = this.app.workspace.activeLeaf;
        if (!activeLeaf?.view || !(activeLeaf.view instanceof MarkdownView)) {
            this.removeFooter();
            return;
        }

        const view = activeLeaf.view;
        const file = view.file;
        
        if (!file) {
            this.removeFooter();
            return;
        }

        // Check if footer should be shown
        if (!this.shouldShowFooter(file)) {
            this.removeFooter();
            return;
        }

        this.addFooter(view, file);
    }

    private shouldShowFooter(file: TFile): boolean {
        // Check global footer setting
        if (!this.plugin.settings.footer.enabled) {
            return false;
        }

        // Check frontmatter override
        const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
        if (frontmatter?.footer !== undefined) {
            return frontmatter.footer;
        }

        return true;
    }

    private addFooter(view: MarkdownView, file: TFile) {
        try {
            // Remove existing footer first
            this.removeFooter();

            // Find the correct container based on mode
            const container = this.findContainer(view);
            if (!container) {
                console.warn('Footer: Could not find container for current mode');
                return;
            }

            // Create footer element
            this.containerEl = this.createFooterElement(file);
            if (!this.containerEl) {
                return;
            }

            // Append footer to container
            container.appendChild(this.containerEl);

            // Set up mutation observer to handle dynamic content changes
            this.observeContainer(container);

        } catch (error) {
            console.error('Error adding footer:', error);
        }
    }

    private findContainer(view: MarkdownView): HTMLElement | null {
        const content = view.contentEl;
        const mode = view.getMode();

        if (mode === 'preview') {
            // Reading mode: find the main preview section that isn't part of an embedded note
            const previewSections = content.querySelectorAll('.markdown-preview-section');
            for (let i = 0; i < previewSections.length; i++) {
                const section = previewSections[i] as HTMLElement;
                // Skip if this section is inside an embedded note
                if (!section.closest('.internal-embed')) {
                    return section;
                }
            }
        } else if (mode === 'source') {
            // Editing mode: use .cm-sizer
            return content.querySelector('.cm-sizer') as HTMLElement;
        }

        return null;
    }

    private createFooterElement(file: TFile): HTMLElement | null {
        const footerEl = createDiv({ cls: 'eln-footer eln-footer--hidden' });
        
        // Add separator line
        footerEl.createDiv({ cls: 'eln-footer--separator' });

        // Create content container
        const contentEl = footerEl.createDiv({ cls: 'eln-footer--content' });

        // Add footer content based on settings
        this.addFooterContent(contentEl, file);

        // Trigger fade in after brief delay
        setTimeout(() => {
            footerEl.removeClass('eln-footer--hidden');
        }, 10);

        return footerEl;
    }

    private addFooterContent(contentEl: HTMLElement, file: TFile) {
        const settings = this.plugin.settings.footer;
        const cache = this.app.metadataCache.getFileCache(file);
        const frontmatter = cache?.frontmatter;

        // Create info sections
        const infoSections: string[] = [];

        // Version information
        if (settings.includeVersion) {
            const version = this.plugin.manifest.version;
            infoSections.push(`ELN v${version}`);
        }

        // Author information
        if (settings.includeAuthor) {
            let author = frontmatter?.author;
            if (!author && this.plugin.settings.general.authors.length > 0) {
                author = this.plugin.settings.general.authors[0].name;
            }
            if (author) {
                infoSections.push(`Author: ${author}`);
            }
        }

        // Creation time
        if (settings.includeCtime) {
            const ctime = new Date(file.stat.ctime);
            infoSections.push(`Created: ${this.formatDate(ctime)}`);
        }

        // Modification time  
        if (settings.includeMtime) {
            const mtime = new Date(file.stat.mtime);
            infoSections.push(`Modified: ${this.formatDate(mtime)}`);
        }

        // Add all sections to footer
        if (infoSections.length > 0) {
            const infoContainer = contentEl.createDiv({ cls: 'eln-footer--info' });
            infoContainer.textContent = infoSections.join(' • ');
        }
    }

    private formatDate(date: Date): string {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }

    private observeContainer(container: HTMLElement) {
        // Disconnect existing observer
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }

        this.mutationObserver = new MutationObserver(() => {
            // Check if footer still exists
            const footer = container.querySelector('.eln-footer');
            if (!footer) {
                // Footer was removed, re-add it
                const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (activeView?.file) {
                    setTimeout(() => this.updateFooter(), 50);
                }
            }
        });

        this.mutationObserver.observe(container, { 
            childList: true, 
            subtree: true 
        });
    }

    private removeFooter() {
        // Remove existing footer
        if (this.containerEl) {
            this.containerEl.remove();
            this.containerEl = null;
        }

        // Also remove any orphaned footers
        document.querySelectorAll('.eln-footer').forEach(el => el.remove());

        // Disconnect observer
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
    }

    private isEditMode(): boolean {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) return false;
        const mode = activeView.getMode();
        return mode === 'source';
    }

    destroy() {
        this.removeFooter();
    }
}