import {
    App,
    ItemView,
    MarkdownPostProcessorContext,
    MarkdownRenderChild,
    WorkspaceLeaf,
    TFile, addIcon
} from "obsidian";
import { renderFrontMatter } from "../renderer/renderFrontMatter";

export class NestedPropertiesEditorView extends ItemView {
    static viewType = "NPE_VIEW";
    private component!: HTMLElement;
    public currentFile: TFile | null = null;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    async onOpen(): Promise<void> {
        addIcon("npe-icon", `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-archive"><path d="M16.915 15.31c.38.69.557 1.403.557 2.245a4.84 4.84 0 0 1-4.838 4.838 4.84 4.84 0 0 1-4.836-4.838 4.84 4.84 0 0 1 4.836-4.836c.498 0 .978.076 1.429.215l4.042-5.044.425-1.102 3.428 2.852-.858.461-4.185 5.21z" stroke-width="2.002"/><path d="M6.036 12.008h.756"/><path d="M2.72 12h.021"/><path d="M6.037 8.088h4.547"/><g><path d="M2.72 8.088h.021m3.296-3.911H17.41"/><path d="M2.72 4.177h.021"/></g></svg>`);
        this.updateView(); // Initialize the view with current front matter

        this.app.workspace.on("active-leaf-change", () => {
            const activeFile = this.app.workspace.getActiveFile();
            if (activeFile !== this.currentFile) {
                this.updateView();
                this.currentFile = activeFile;
            }
        });

        // this.app.metadataCache.on("changed", () => {
        //     // Only update if the file is still the same
        //     const activeFile = this.app.workspace.getActiveFile();
        //     if (activeFile?.path === this.lastActiveFilePath) {
        //         console.log("Front matter changed, updating view...");
        //         this.updateView();
        //     }
        // });
    }

	async onClose() {
		// Nothing to clean up.
	}

    /* function to update the view with when the front matter changes */
    updateView() {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
            this.currentFile = activeFile;
            this.contentEl.empty();
            this.component = renderFrontMatter(this);
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
        console.log("Rendering NestedPropertiesEditorCodeBlockView with:");
        renderFrontMatter(this, this.key ?? "", this.excludeKeys, this.actionButtons, this.cssclasses);
    }
}
