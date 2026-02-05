import { MarkdownRenderChild, App } from "obsidian";
import { parseImageViewerOptions } from "../../utils/parsers/parseImageViewerOptions";
import { renderImageViewer } from "../renderer/components/renderImageViewer";
import type { ImageViewerOptions } from "../../utils/parsers/parseImageViewerOptions";

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