import { App, Modal, Setting } from "obsidian";

export class FilePickerModal extends Modal {
    private onSelect: (path: string) => void;
    private fileExtension: string;
    private title: string;
    private currentPath: string;

    constructor(
        app: App, 
        onSelect: (path: string) => void,
        fileExtension: string = ".md",
        title: string = "Select File",
        currentPath: string = ""
    ) {
        super(app);
        this.onSelect = onSelect;
        this.fileExtension = fileExtension;
        this.title = title;
        this.currentPath = currentPath;
        this.setTitle(title);
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl("p", { 
            text: `Select a ${this.fileExtension} file from your vault, or enter a path manually.` 
        });

        // Manual path input
        let manualPath = this.currentPath;
        new Setting(contentEl)
            .setName("File Path")
            .setDesc("Enter the path to the template file")
            .addText((text) => {
                text
                    .setValue(this.currentPath)
                    .onChange((value) => {
                        manualPath = value;
                    });
            })
            .addButton((button) =>
                button
                    .setButtonText("Use This Path")
                    .setCta()
                    .onClick(() => {
                        this.onSelect(manualPath);
                        this.close();
                    })
            );

        contentEl.createEl("hr");
        contentEl.createEl("h4", { text: "Or browse files:" });

        // File browser
        this.renderFileBrowser(contentEl);

        // Cancel button
        new Setting(contentEl)
            .addButton((button) =>
                button
                    .setButtonText("Cancel")
                    .onClick(() => {
                        this.close();
                    })
            );
    }

    private renderFileBrowser(containerEl: HTMLElement): void {
        const browserContainer = containerEl.createEl("div", { cls: "file-browser" });
        
        const files = this.app.vault.getFiles()
            .filter(file => file.extension === this.fileExtension.replace(".", ""))
            .sort((a, b) => a.path.localeCompare(b.path));

        if (files.length === 0) {
            browserContainer.createEl("p", { 
                text: `No ${this.fileExtension} files found in the vault.`,
                cls: "empty-state"
            });
            return;
        }

        files.forEach(file => {
            const fileItem = browserContainer.createEl("div", { cls: "file-item" });
            
            fileItem.createEl("span", { 
                text: file.path,
                cls: "file-path" 
            });

            const selectButton = fileItem.createEl("button", { 
                text: "Select",
                cls: "file-select-button"
            });

            selectButton.addEventListener("click", () => {
                this.onSelect(file.path);
                this.close();
            });
        });
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}
