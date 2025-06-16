import { App, MarkdownView, WorkspaceLeaf, TFile } from "obsidian";

export class Footer {
    private app: App;
    private leaf: WorkspaceLeaf;
    private containerEl: HTMLElement | null = null;

    constructor(app: App, leaf: WorkspaceLeaf) {
        this.app = app;
        this.leaf = leaf;
    }

    init() {
        this.addFooter();
        this.registerLayoutChangeHandler();
    }

    private addFooter() {
        const markdownView = this.leaf.view as MarkdownView;
        if (!(markdownView instanceof MarkdownView)) {
            console.warn("Footer: Not a MarkdownView.");
            return;
        }

        const noteTFile = markdownView.file;
        if (!noteTFile) {
            console.warn("Footer: No file associated with the view.");
            return;
        }

        // Remove any existing footer to avoid duplicates
        this.destroyFooter();

        // Determine the correct container based on the current mode
        let parentContainer: HTMLElement | null = null;
        if (markdownView.getMode() === "source") {
            parentContainer = markdownView.contentEl.querySelector(".cm-sizer");
        } else if (markdownView.getMode() === "preview") {
            parentContainer = markdownView.contentEl.querySelector(".markdown-preview-section");
        }

        if (!parentContainer) {
            console.warn("Footer: Could not find a valid parent container for the footer.");
            return;
        }

        // Create the footer container
        this.containerEl = parentContainer.querySelector(".note-footer");
        if (!this.containerEl) {
            this.containerEl = parentContainer.createDiv({
                cls: "note-footer",
                attr: { id: "footer-container" },
            });
        }

        // Add footer content
        this.populateFooter(noteTFile);
    }

    private populateFooter(noteTFile: TFile) {
        if (!this.containerEl) return;

        const fileCache = this.app.metadataCache.getFileCache(noteTFile);
        const mtime = noteTFile.stat.mtime;

        // Format the last modified date
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };
        const dateTime = new Date(mtime).toLocaleDateString("en-US", options);

        // Clear existing content
        this.containerEl.empty();

        // Add last modified information
        const modifiedP = this.containerEl.createEl("p");
        modifiedP.innerHTML = `<strong>Last modified:</strong> ${dateTime}`;

        // Add author information if available
        const author = fileCache?.frontmatter?.author;
        if (author) {
            const authorP = this.containerEl.createEl("p");
            authorP.innerHTML = `<strong>Author:</strong> ${author}`;
        }
    }

    private destroyFooter() {
        if (this.containerEl) {
            this.containerEl.remove();
            this.containerEl = null;
        }
    }

    private registerLayoutChangeHandler() {
        this.app.workspace.on("layout-change", () => {
            const activeLeaf = this.app.workspace.getLeaf();
            if (activeLeaf === this.leaf) {
                this.addFooter();
            } else {
                this.destroyFooter();
            }
        });
    }
}