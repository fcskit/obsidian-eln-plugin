import { MarkdownRenderChild, App } from "obsidian";
import { renderPeriodicTable } from "../renderer/components/renderPeriodicTable";

export class PeriodicTableView extends MarkdownRenderChild {
    private app: App;

    constructor(app: App, containerEl: HTMLElement) {
        super(containerEl);
        this.app = app;
    }

    async onload() {
        renderPeriodicTable(this, this.containerEl);
    }
}