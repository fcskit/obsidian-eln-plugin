import { MarkdownRenderChild, App } from "obsidian";
import { parseImageViewerOptions } from "../utils/parseImageViewerOptions";
import { renderImageViewer } from "../renderer/renderImageViewer";
import type { ImageViewerOptions } from "../utils/parseImageViewerOptions";

export class ImageViewer extends MarkdownRenderChild {
    private opts: ImageViewerOptions;
    private app: App;

    constructor(app: App, containerEl: HTMLElement, source: string) {
        super(containerEl);
        this.app = app;
        this.opts = parseImageViewerOptions(source);
    }

    async onload() {
        await renderImageViewer(this.app, this.containerEl, this.opts);
    }
}