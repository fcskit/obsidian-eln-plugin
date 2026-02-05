import {
    App,
    ItemView,
    MarkdownPostProcessorContext,
    MarkdownRenderChild,
    WorkspaceLeaf,
    TFile, 
    addIcon
} from "obsidian";
import { renderFrontMatter } from "../renderer/npe/core/renderFrontMatter";
import { createLogger } from "../../utils/Logger";
import type ElnPlugin from "../../main";

const logger = createLogger('npe');

/**
 * Component wrapper that properly manages lifecycle of NPE content
 */
class NPEComponent extends MarkdownRenderChild {
    private view: NestedPropertiesEditorView;
    private componentId: string;
    private hasRendered = false;
    private isRendering = false;
    
    constructor(containerEl: HTMLElement, view: NestedPropertiesEditorView) {
        super(containerEl);
        this.view = view;
        
        // Use filename (without extension) as component ID for clearer logging
        const currentFile = view.currentFile;
        if (currentFile) {
            const filename = currentFile.basename; // Gets filename without extension
            this.componentId = filename;
        } else {
            this.componentId = 'no-file';
        }
        
        // Track component creation for debugging
        const globalWindow = window as unknown as { npeDebug?: { trackComponent: (comp: NPEComponent) => void } };
        if (globalWindow.npeDebug) {
            globalWindow.npeDebug.trackComponent(this);
        }
        logger.debug(`Component ${this.componentId} created`);
    }

    onload() {
        logger.debug(`Component ${this.componentId} loading (onload called)`);
        // Don't render automatically in onload to prevent double rendering
        // The parent view will explicitly call renderNPEContent() when ready
    }

    renderNPEContent() {
        if (this.hasRendered) {
            logger.debug(`Component ${this.componentId} already rendered, skipping duplicate render`);
            return;
        }
        
        if (this.isRendering) {
            logger.debug(`Component ${this.componentId} is already rendering, skipping concurrent render`);
            return;
        }
        
        logger.debug(`Component ${this.componentId} rendering NPE content`);
        this.isRendering = true;
        this.hasRendered = true;
        
        try {
            // Clear the container before rendering to prevent duplicate content
            this.containerEl.empty();
            
            // We need to create a proxy that routes registerDomEvent calls to this component
            const viewProxy = this.createViewProxy();
            renderFrontMatter(viewProxy);
        } finally {
            this.isRendering = false;
        }
    }

    /**
     * Refresh the NPE content without clearing the container (incremental update)
     */
    refreshContent() {
        if (this.isRendering) {
            logger.debug(`Component ${this.componentId} is currently rendering, skipping refresh`);
            return;
        }
        
        logger.debug(`Component ${this.componentId} refreshing content incrementally`);
        
        // Find the properties container to preserve button state and expand/collapse states
        const propertiesContainer = this.containerEl.querySelector('.npe-properties-container');
        
        if (propertiesContainer && this.view.currentFile) {
            // Store expand/collapse states before refresh
            const expandedStates = this.saveExpandedStates(propertiesContainer);
            
            // Clear the entire container since we're re-rendering the complete structure
            this.containerEl.empty();
            
            // Create a view proxy that renders directly into the real container
            const viewProxy = this.createViewProxy();
            viewProxy.contentEl = this.containerEl;
            
            // Re-render directly into the real container
            renderFrontMatter(viewProxy);
            
            // Find the newly created properties container and restore states
            const newPropertiesContainer = this.containerEl.querySelector('.npe-properties-container');
            if (newPropertiesContainer) {
                // Restore expand/collapse states
                this.restoreExpandedStates(newPropertiesContainer, expandedStates);
            }
        } else {
            // Fallback to full re-render if structure is not as expected
            logger.debug(`Component ${this.componentId} falling back to full re-render`);
            this.containerEl.empty();
            this.hasRendered = false; // Reset the flags for full re-render
            this.isRendering = false;
            this.renderNPEContent();
        }
    }

    /**
     * Save the expanded/collapsed states of object containers
     */
    private saveExpandedStates(container: Element): Map<string, boolean> {
        const states = new Map<string, boolean>();
        
        const objectContainers = container.querySelectorAll('.npe-object-properties-container');
        objectContainers.forEach((objContainer) => {
            const parentContainer = objContainer.closest('[data-key]');
            if (parentContainer) {
                const key = parentContainer.getAttribute('data-key');
                if (key) {
                    states.set(key, !objContainer.classList.contains('hidden'));
                }
            }
        });
        
        return states;
    }

    /**
     * Restore the expanded/collapsed states of object containers
     */
    private restoreExpandedStates(container: Element, states: Map<string, boolean>) {
        const objectContainers = container.querySelectorAll('.npe-object-properties-container');
        objectContainers.forEach((objContainer) => {
            const parentContainer = objContainer.closest('[data-key]');
            if (parentContainer) {
                const key = parentContainer.getAttribute('data-key');
                if (key && states.has(key)) {
                    const isExpanded = states.get(key);
                    if (isExpanded) {
                        objContainer.classList.remove('hidden');
                    } else {
                        objContainer.classList.add('hidden');
                    }
                }
            }
        });
    }

    private createViewProxy() {
        // Create a proxy of the view to prevent memory leaks and ensure proper cleanup:
        // - Routes registerDomEvent calls to this NPE component instead of the view
        // - When component unloads, all DOM events are automatically cleaned up
        // - Delegates setInternalChangeFlag to the actual view instance (not proxy)
        // - Without this, orphaned event handlers would remain after component destruction
        const proxy = Object.create(this.view);
        proxy.registerDomEvent = (el: HTMLElement, type: keyof HTMLElementEventMap, fn: (e: Event) => void) => {
            this.registerDomEvent(el, type, fn);
        };
        
        // Ensure setInternalChangeFlag operates on the actual view instance, not the proxy
        proxy.setInternalChangeFlag = () => {
            return this.view.setInternalChangeFlag();
        };
        
        return proxy;
    }

    onunload() {
        // This automatically cleans up all registerDomEvent calls
        logger.debug(`Component ${this.componentId} unloading, cleaning up event handlers`);
        
        // Track component destruction for debugging
        const globalWindow = window as unknown as { npeDebug?: { untrackComponent: (comp: NPEComponent) => void } };
        if (globalWindow.npeDebug) {
            globalWindow.npeDebug.untrackComponent(this);
        }
    }
}

export class NestedPropertiesEditorView extends ItemView {
    static viewType = "NPE_VIEW";
    private component!: HTMLElement;
    public currentFile: TFile | null = null;
    public plugin: ElnPlugin; // Reference to the plugin for settings access
    private activeLeafChangeRef: (() => void) | null = null;
    private metadataChangeRef: ((file: TFile) => void) | null = null;
    private isUpdating = false;
    private currentNPEComponent: NPEComponent | null = null;
    private updateTimeout: NodeJS.Timeout | null = null;
    
    // Internal frontmatter cache to avoid triggering metadata events on internal updates
    private internalFrontmatterCache: Record<string, unknown> | null = null;
    
    // Simple flag to ignore our own metadata changes - set immediately before processFrontMatter
    private isInternalChange = false;

    constructor(leaf: WorkspaceLeaf, plugin: ElnPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    /**
     * Set the internal change flag to prevent metadata change event processing.
     * This should be called before any processFrontMatter operations.
     */
    public setInternalChangeFlag(): void {
        this.isInternalChange = true;
        logger.debug('Internal change flag set');
    }

    async onOpen(): Promise<void> {
        addIcon("npe-icon", `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon list-tree-pen"><path d="M21.332 9.257h-8m8-6h-13m-5 0v4c0 1.1.9 2 2 2h3m-5-1.481v6c0 1.1.9 2 2 2h3"/><path d="M3.332 14.257v6c0 1.1.9 2 2 2h3m12.378-5.954c.398-.398.622-.939.622-1.502 0-1.165-.959-2.124-2.124-2.124-.563 0-1.104.224-1.502.622l-5.01 5.012c-.238.238-.412.531-.506.854l-.837 2.87a.51.51 0 0 0-.02.14c0 .274.226.5.5.5a.51.51 0 0 0 .14-.02l2.87-.837c.323-.094.616-.268.854-.506l5.013-5.009z"/></svg>`);
        
        // Initialize the view with current front matter
        this.debouncedUpdateView(true); // Immediate initial update 

        // Register event handlers using Obsidian's proper event system
        this.activeLeafChangeRef = () => {
            if (this.isUpdating) {
                logger.debug('Skipping update - already updating');
                return; // Prevent recursive updates
            }
            
            const activeFile = this.app.workspace.getActiveFile();
            
            // Check if file still exists
            if (this.currentFile && !this.app.vault.getAbstractFileByPath(this.currentFile.path)) {
                // Current file was deleted, clear the view
                logger.debug('Current file was deleted, clearing view');
                this.currentFile = null;
                this.clearView();
            }
            
            if (activeFile !== this.currentFile) {
                logger.debug('Active file changed, updating view');
                this.debouncedUpdateView(true); // Immediate update for active file changes
                this.currentFile = activeFile;
            }
        };

        this.metadataChangeRef = (file: TFile) => {
            logger.debug(`Metadata change event - internal flag: ${this.isInternalChange}`);
            // Simple and reliable filtering: if we set the internal change flag, ignore this event
            if (this.isInternalChange) {
                logger.debug('Ignoring internal metadata change');
                // Reset the flag immediately so external changes can be processed again
                this.isInternalChange = false;
                return;
            }
            
            // Only update if the changed file is currently displayed and still exists
            if (this.currentFile && 
                file.path === this.currentFile.path && 
                this.app.vault.getAbstractFileByPath(this.currentFile.path)) {
                
                logger.debug('Processing external metadata change');
                
                // Clear internal cache when external changes are detected
                this.internalFrontmatterCache = null;
                
                // Immediate update for external changes
                this.debouncedUpdateView(true);
            }
        };

        this.registerEvent(this.app.workspace.on("active-leaf-change", this.activeLeafChangeRef));
        this.registerEvent(this.app.metadataCache.on("changed", this.metadataChangeRef));
    }

	async onClose() {
		// Clean up event handlers - this happens automatically with registerEvent()
		// Clean up current component
		this.cleanupCurrentComponent();
		// Clean up any pending update timeout
		if (this.updateTimeout) {
			clearTimeout(this.updateTimeout);
			this.updateTimeout = null;
		}
		// Clear internal change flag
		this.isInternalChange = false;
		// Clear the current file reference
		this.currentFile = null;
		logger.debug('View closed, cleanup complete');
	}

    /* function to clear the view when no valid file is available */
    clearView() {
        // Clean up existing component first
        this.cleanupCurrentComponent();
        
        // Clear internal cache when no file is selected
        this.internalFrontmatterCache = null;
        
        // Clean up any pending update timeout
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
            this.updateTimeout = null;
        }
        
        this.contentEl.empty();
        const infoContainer = this.contentEl.createDiv({ cls: "npe-info-container" });
        const infoMessage = infoContainer.createDiv({ cls: "npe-info-message" });
        infoMessage.textContent = "No file selected or file was deleted.";
        this.currentFile = null;
    }

    /* Helper method to properly cleanup the current NPE component */
    private cleanupCurrentComponent() {
        if (this.currentNPEComponent) {
            logger.debug('Cleaning up current component');
            
            // NOTE: Don't clear internal cache here - it will be re-initialized in updateView if needed
            
            // Force cleanup of any DOM references
            const containerEl = this.currentNPEComponent.containerEl;
            if (containerEl) {
                // Clear any potential circular references
                containerEl.empty();
                // Remove any attached data
                (containerEl as HTMLElement & { _npeComponent?: unknown })._npeComponent = null;
            }
            
            this.currentNPEComponent.unload();
            this.currentNPEComponent = null;
            
            // Suggest garbage collection (for debugging)
            const globalWindow = window as unknown as { gc?: () => void };
            if (typeof globalWindow.gc === 'function') {
                logger.debug('Triggering garbage collection');
                globalWindow.gc();
            }
        }
    }

    /* Debounced update to prevent rapid successive updates during note creation */
    private debouncedUpdateView(immediate: boolean = false) {
        const activeFile = this.app.workspace.getActiveFile();
        const filePath = activeFile?.path || 'none';
        
        // Clear any existing timeout
        if (this.updateTimeout) {
            logger.debug(`Clearing existing debounced update for ${filePath}`);
            clearTimeout(this.updateTimeout);
            this.updateTimeout = null;
        }

        if (immediate) {
            // Execute immediately (for active leaf changes)
            logger.debug(`Immediate update requested for ${filePath}`);
            this.updateView();
        } else {
            // Debounce the update (for metadata changes)
            logger.debug(`Debounced update scheduled for ${filePath} (100ms delay)`);
            this.updateTimeout = setTimeout(() => {
                logger.debug(`Executing debounced update for ${filePath}`);
                // Check if file is still the same before executing
                const currentFile = this.app.workspace.getActiveFile();
                if (currentFile?.path === filePath) {
                    this.updateView();
                } else {
                    logger.debug(`File changed during debounce, skipping update. Current: ${currentFile?.path || 'none'}, Expected: ${filePath}`);
                }
                this.updateTimeout = null;
            }, 100); // 100ms delay
        }
    }

    /* function to update the view with when the front matter changes */
    updateView() {
        if (this.isUpdating) {
            logger.debug('Update already in progress, skipping');
            return; // Prevent recursive updates
        }
        
        const activeFile = this.app.workspace.getActiveFile();
        const filePath = activeFile?.path || 'none';
        
        this.isUpdating = true;

        try {
            logger.debug(`Updating view for file: ${filePath}`);
            
            // Check if file exists
            if (activeFile && !this.app.vault.getAbstractFileByPath(activeFile.path)) {
                // File was deleted
                logger.debug('Active file was deleted, clearing view');
                this.clearView();
                return;
            }
            
            if (activeFile) {
                // Check if this is the same file and we can do an incremental update
                const isSameFile = this.currentFile && this.currentFile.path === activeFile.path;
                
                this.currentFile = activeFile;
                
                if (isSameFile && this.currentNPEComponent) {
                    // Incremental update - preserve DOM state for external changes only
                    logger.debug('Performing incremental update for same file');
                    this.currentNPEComponent.refreshContent();
                } else {
                    // Full refresh for new file
                    logger.debug('Full refresh for new file');
                    this.cleanupCurrentComponent();
                    this.contentEl.empty();
                    
                    // Initialize internal cache for the new file
                    const fileCache = this.app.metadataCache.getFileCache(activeFile);
                    if (fileCache?.frontmatter) {
                        this.internalFrontmatterCache = JSON.parse(JSON.stringify(fileCache.frontmatter));
                        logger.debug('Initialized internal frontmatter cache for new file');
                    } else {
                        this.internalFrontmatterCache = {};
                        logger.debug('Initialized empty internal frontmatter cache for new file');
                    }
                    
                    // Create and register new component
                    this.currentNPEComponent = new NPEComponent(this.contentEl, this);
                    logger.debug('Adding component as child');
                    this.addChild(this.currentNPEComponent);
                    
                    // Explicitly render the content after component is loaded
                    logger.debug('Explicitly rendering NPE content');
                    this.currentNPEComponent.renderNPEContent();
                }
                
                this.component = this.contentEl;
            } else {
                logger.debug('No active file, clearing view');
                this.clearView();
            }
        } catch (error) {
            logger.error('updateView error:', error);
            this.clearView();
        } finally {
            this.isUpdating = false;
        }
    }

	/* View abstract method implementations */

	getViewType(): string {
		return "NPE_VIEW";
	}

	getDisplayText(): string {
		return "Nested Properties Editor View";
	}

	/**
	 * Get the current frontmatter, preferring internal cache over file cache
	 */
	getFrontmatter(): Record<string, unknown> | null {
		if (this.internalFrontmatterCache) {
			return this.internalFrontmatterCache;
		}
		
		if (this.currentFile) {
			const fileCache = this.app.metadataCache.getFileCache(this.currentFile);
			const frontmatter = fileCache?.frontmatter;
			
			// Initialize internal cache on first access
			if (frontmatter) {
				this.internalFrontmatterCache = JSON.parse(JSON.stringify(frontmatter));
				logger.debug('Initialized internal frontmatter cache on first access');
				return this.internalFrontmatterCache;
			}
		}
		
		return null;
	}

	getIcon(): string {
		return "npe-icon";
	}
}

export class NestedPropertiesEditorCodeBlockView extends MarkdownRenderChild {
    public app: App;
    public plugin: ElnPlugin; // Reference to the plugin for settings access
    public contentEl: HTMLElement;
    public currentFile: TFile | null;
    public key?: string;
    public excludeKeys: string[];
    public actionButtons: boolean;
    public cssclasses: string[];

    constructor(
        app: App,
        plugin: ElnPlugin,
        containerEl: HTMLElement,
        ctx: MarkdownPostProcessorContext,
        currentFile: TFile | null,
        key?: string,
        excludeKeys: string[] = [],
        actionButtons: boolean = true,
        cssclasses: string[] = []
    ) {
        super(containerEl);
        this.app = app;
        this.plugin = plugin;
        this.contentEl = containerEl;
        this.currentFile = currentFile;
        this.key = key;
        this.excludeKeys = excludeKeys;
        this.actionButtons = actionButtons;
        this.cssclasses = cssclasses;
        ctx.addChild(this); // Register as a child component
    }

    onload() {
        this.render();
    }

    render() {
        this.containerEl.empty();
        logger.debug("Rendering NestedPropertiesEditorCodeBlockView with:");
        renderFrontMatter(this, this.key ?? "", this.excludeKeys, this.actionButtons, this.cssclasses);
    }
}
