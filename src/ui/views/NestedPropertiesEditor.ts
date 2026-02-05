import {
    App,
    ItemView,
    MarkdownPostProcessorContext,
    MarkdownRenderChild,
    WorkspaceLeaf,
    TFile, addIcon
} from "obsidian";
import { renderFrontMatter } from "../renderer/npe/core/renderFrontMatter";
import { createLogger } from "../../utils/Logger";

const logger = createLogger('npe');

/**
 * Component wrapper that properly manages lifecycle of NPE content
 */
class NPEComponent extends MarkdownRenderChild {
    private view: NestedPropertiesEditorView;
    private static instanceCount = 0;
    private instanceId: number;
    private hasRendered = false;
    private isRendering = false;
    
    constructor(containerEl: HTMLElement, view: NestedPropertiesEditorView) {
        super(containerEl);
        this.view = view;
        this.instanceId = ++NPEComponent.instanceCount;
        
        // Track component creation for debugging
        const globalWindow = window as unknown as { npeDebug?: { trackComponent: (comp: NPEComponent) => void } };
        if (globalWindow.npeDebug) {
            globalWindow.npeDebug.trackComponent(this);
        }
        logger.debug(`Component ${this.instanceId} created`);
    }

    onload() {
        logger.debug(`Component ${this.instanceId} loading (onload called)`);
        // Don't render automatically in onload to prevent double rendering
        // The parent view will explicitly call renderNPEContent() when ready
    }

    renderNPEContent() {
        if (this.hasRendered) {
            logger.debug(`Component ${this.instanceId} already rendered, skipping duplicate render`);
            return;
        }
        
        if (this.isRendering) {
            logger.debug(`Component ${this.instanceId} is already rendering, skipping concurrent render`);
            return;
        }
        
        logger.debug(`Component ${this.instanceId} rendering NPE content`);
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
            logger.debug(`Component ${this.instanceId} is currently rendering, skipping refresh`);
            return;
        }
        
        logger.debug(`Component ${this.instanceId} refreshing content incrementally`);
        
        // Find the properties container to preserve button state and expand/collapse states
        const propertiesContainer = this.containerEl.querySelector('.npe-properties-container');
        
        if (propertiesContainer && this.view.currentFile) {
            // Store expand/collapse states before refresh
            const expandedStates = this.saveExpandedStates(propertiesContainer);
            
            // Clear only the properties container, not the entire content
            propertiesContainer.innerHTML = '';
            
            // Create a temporary container for rendering
            const tempContainer = this.containerEl.createDiv();
            
            // Create a view proxy that uses the temp container
            const viewProxy = this.createViewProxy();
            viewProxy.contentEl = tempContainer; // Override contentEl to use temp container
            
            // Re-render into the temp container
            const newContent = renderFrontMatter(viewProxy);
            
            // Extract the new properties content
            const newPropertiesContainer = newContent.querySelector('.npe-properties-container');
            if (newPropertiesContainer) {
                propertiesContainer.innerHTML = newPropertiesContainer.innerHTML;
                
                // Restore expand/collapse states
                this.restoreExpandedStates(propertiesContainer, expandedStates);
            }
            
            // Clean up temp container
            tempContainer.remove();
        } else {
            // Fallback to full re-render if structure is not as expected
            logger.debug(`Component ${this.instanceId} falling back to full re-render`);
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
        // Create a proxy of the view that routes registerDomEvent to this component
        const proxy = Object.create(this.view);
        proxy.registerDomEvent = (el: HTMLElement, type: keyof HTMLElementEventMap, fn: (e: Event) => void) => {
            this.registerDomEvent(el, type, fn);
        };
        return proxy;
    }

    onunload() {
        // This automatically cleans up all registerDomEvent calls
        logger.debug(`Component ${this.instanceId} unloading, cleaning up event handlers`);
        
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
    private activeLeafChangeRef: (() => void) | null = null;
    private metadataChangeRef: ((file: TFile) => void) | null = null;
    private isUpdating = false;
    private currentNPEComponent: NPEComponent | null = null;
    private updateTimeout: NodeJS.Timeout | null = null;
    private lastUpdateTime = 0;
    private lastUpdateFile: string | null = null;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
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
            const now = Date.now();
            logger.debug(`Metadata changed event for ${file.path} at ${now}`);
            
            // Only update if the changed file is currently displayed and still exists
            if (this.currentFile && 
                file.path === this.currentFile.path && 
                this.app.vault.getAbstractFileByPath(this.currentFile.path)) {
                
                const timeSinceLastUpdate = now - this.lastUpdateTime;
                logger.debug(`Metadata changed for current file (${timeSinceLastUpdate}ms since last update), scheduling debounced update`);
                this.debouncedUpdateView(false); // Debounced update for metadata changes
            } else {
                logger.debug(`Metadata changed for different file or file doesn't exist, ignoring`);
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
		// Clear the current file reference
		this.currentFile = null;
		logger.debug('View closed, cleanup complete');
	}

    /* function to clear the view when no valid file is available */
    clearView() {
        // Clean up existing component first
        this.cleanupCurrentComponent();
        
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
            
            // Force cleanup of any DOM references
            const containerEl = this.currentNPEComponent.containerEl;
            if (containerEl) {
                // Clear any potential circular references
                containerEl.innerHTML = '';
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
        const now = Date.now();
        
        // Check if this is a redundant update (same file within 200ms)
        if (this.lastUpdateFile === filePath && (now - this.lastUpdateTime) < 200) {
            logger.debug(`Skipping redundant update for ${filePath} (last update ${now - this.lastUpdateTime}ms ago)`);
            return;
        }
        
        this.isUpdating = true;
        this.lastUpdateTime = now;
        this.lastUpdateFile = filePath;

        try {
            logger.debug(`Updating view for file: ${filePath} at ${now}`);
            
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
                    // Incremental update - preserve DOM state
                    logger.debug('Performing incremental update for same file');
                    this.currentNPEComponent.refreshContent();
                } else {
                    // Full refresh for new file
                    logger.debug('Full refresh for new file');
                    this.cleanupCurrentComponent();
                    this.contentEl.empty();
                    
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

	getIcon(): string {
		return "npe-icon";
	}
}

export class NestedPropertiesEditorCodeBlockView extends MarkdownRenderChild {
    public app: App;
    public contentEl: HTMLElement;
    public currentFile: TFile | null;
    public key?: string;
    public excludeKeys: string[];
    public actionButtons: boolean;
    public cssclasses: string[];

    constructor(
        app: App,
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
