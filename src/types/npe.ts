import { App, TFile } from "obsidian";

/**
 * Interface for components that can be used with NPE renderer functions
 */
export interface NPECompatibleComponent {
    app: App;
    currentFile: TFile | null;
    contentEl: HTMLElement;
    registerDomEvent(el: HTMLElement, type: string, fn: (e: Event) => void): void;
}
