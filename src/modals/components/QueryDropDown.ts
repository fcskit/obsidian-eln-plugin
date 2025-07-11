import { App, DropdownComponent, TFile } from "obsidian";
import { searchFilesByTag } from "src/search/searchFilesByTag";

export interface QueryDropDownOptions {
    container: HTMLElement;
    label: string;
    search: string;
    where?: Array<{ field: string; [op: string]: string | number | boolean }>;
    onChangeCallback?: (value: string) => void; // Made optional
}

function matchesWhere(app: App, file: TFile, where?: Array<{ field: string; [op: string]: any }>): boolean {
    if (!where || where.length === 0) return true;
    const cache = app.metadataCache.getFileCache(file);
    const frontmatter = cache?.frontmatter ?? {};
    for (const cond of where) {
        const { field, ...ops } = cond;
        // Support nested fields like "chemical.type"
        const value = field.split('.').reduce<any>(
            (obj, k) => (obj ? obj[k] : undefined),
            frontmatter
        );
        for (const op in ops) {
            const expected = ops[op];
            if (op === "is" && value !== expected) return false;
            if (op === "contains") {
                if (typeof value === "string") {
                    if (!value.includes(expected as string)) return false;
                } else if (Array.isArray(value)) {
                    if (!value.includes(expected)) return false;
                } else {
                    return false;
                }
            }
            // Add more operators as needed
        }
    }
    return true;
}

export class QueryDropDown {
    private app: App;
    private wrapper: HTMLElement;
    private dropdown: DropdownComponent;

    constructor(app: App, options: QueryDropDownOptions) {
        this.app = app;
        const { container, label, search, where, onChangeCallback = (value) => value } = options;

        console.debug("QueryDropDown: Initializing with options:", options);
        // Create the wrapper div
        this.wrapper = container.createDiv({ cls: "eln-modal-dropdown-wrapper" });
        // Create the label
        this.wrapper.createEl("label", { text: label });
        // Create the dropdown
        this.dropdown = new DropdownComponent(this.wrapper);

        // Fetch files by tag and filter by "where"
        const files = searchFilesByTag(this.app, search)
            .filter(file => matchesWhere(this.app, file, where));
        
        if (files) {
            const fileNames = files.map(file => file.basename);
            this.dropdown.addOptions(
                Object.fromEntries(fileNames.map((name) => [name, name]))
            );
            console.debug("QueryDropDown: Populated dropdown with files:", fileNames);
            // Set the default value if options are provided
            if (fileNames.length > 0) {
                const defaultValue = fileNames[0];
                this.dropdown.setValue(defaultValue);
                onChangeCallback(defaultValue);
            }
        }

        // Register the onChange callback
        this.dropdown.onChange((value) => {
            onChangeCallback(value);
        });
    }
}