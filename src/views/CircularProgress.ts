import { MarkdownRenderChild, App } from "obsidian";
import { parseCircularProgressOptions } from "../utils/parseCircularProgressOptions";
import { renderCircularProgress, updateCircularProgressValue } from "../renderer/components/renderCircularProgress";
import type { CircularProgressOptions } from "../utils/parseCircularProgressOptions";

export class CircularProgress extends MarkdownRenderChild {
    private opts: CircularProgressOptions;
    public app: App;
    private percentEl: HTMLElement | null = null;
    private h2El: HTMLElement | null = null;

    constructor(
        app: App,
        containerEl: HTMLElement,
        source: string = "",
    ) {
        super(containerEl);
        this.app = app;
        this.opts = parseCircularProgressOptions(source);
    }
    onload() {
        // Render and keep references to percent/h2 elements
        const { percent, h2 } = renderCircularProgress(this, this.opts);
        this.percentEl = percent;
        this.h2El = h2;

        // Listen for metadata cache changes (task check/uncheck)
        this.registerEvent(
            this.app.metadataCache.on('changed', (file) => {
                if (file.path === this.app.workspace.getActiveFile()?.path) {
                    updateCircularProgressValue(this, this.opts, this.percentEl, this.h2El);
                }
            })
        );
    }
}