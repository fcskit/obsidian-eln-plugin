import { MarkdownRenderChild, App, TFile } from "obsidian";

export class DailyNoteNav extends MarkdownRenderChild {
    private app: App;
    private source: string;

    constructor(app: App, containerEl: HTMLElement, source: string = "") {
        super(containerEl);
        this.app = app;
        this.source = source;
    }

    onload() {
        this.renderNav();
        // Listen for file changes to update navigation
        this.registerEvent(
            this.app.workspace.on("active-leaf-change", () => {
                this.renderNav();
            })
        );
    }

    private renderNav() {
        this.containerEl.empty();
        const dailyNotes = this.getSortedDailyNotes();
        if (!dailyNotes.length) return;
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) return;
        const index = dailyNotes.findIndex(f => f.basename === activeFile.basename);
        const firstIdx = 0;
        const lastIdx = dailyNotes.length - 1;
        const prevIdx = index - 1;
        const nextIdx = index + 1;

        const nav = this.containerEl.createDiv({ cls: "daily-note-nav-container" });
        nav.appendChild(this.createNavButton(
            firstIdx !== index ? dailyNotes[firstIdx] : null,
            "«",
            "daily-note-nav-button"
        ));
        nav.appendChild(this.createNavButton(
            prevIdx >= 0 && prevIdx !== index ? dailyNotes[prevIdx] : null,
            "‹",
            "daily-note-nav-button"
        ));
        nav.appendChild(this.createNavButton(
            nextIdx <= lastIdx && nextIdx !== index ? dailyNotes[nextIdx] : null,
            "›",
            "daily-note-nav-button"
        ));
        nav.appendChild(this.createNavButton(
            lastIdx !== index ? dailyNotes[lastIdx] : null,
            "»",
            "daily-note-nav-button"
        ));
    }

    private getSortedDailyNotes(): TFile[] {
        // Find all files tagged as daily notes (by tag or folder, adjust as needed)
        const files = this.app.vault.getMarkdownFiles();
        // You may want to filter by folder or frontmatter here
        // For now, filter by #daily-note tag in frontmatter or path
        return files
            .filter(f => {
                const cache = this.app.metadataCache.getFileCache(f);
                const tags = cache?.tags?.map(t => t.tag) || [];
                return tags.includes("#daily-note") || f.path.toLowerCase().includes("daily");
            })
            .sort((a, b) => a.stat.ctime - b.stat.ctime);
    }

    private createNavButton(file: TFile | null, label: string, cls: string): HTMLElement {
        const btn = document.createElement("div");
        btn.className = cls;
        if (file) {
            const a = document.createElement("a");
            a.href = file.path;
            a.setAttr("data-href", file.path);
            a.className = "internal-link";
            a.rel = "noopener";
            a.textContent = label;
            btn.appendChild(a);
        } else {
            const span = document.createElement("span");
            span.textContent = label;
            btn.appendChild(span);
        }
        return btn;
    }
}
