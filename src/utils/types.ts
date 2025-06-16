import { App, TFile, MarkdownPostProcessorContext } from "obsidian";
/**
 * Utility type to extract keys of an object whose values are of type `string`.
 */
export type StringKeys<T> = {
    [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];


export type PathTemplate = Array<{
    type: string; // The type of the field (e.g., "dateField", "userInput", "string", "index")
    field: string; // The field to include in the title (e.g., "currentDate", "this.userInput.author")
    separator?: string; // Optional separator to append after the field
}>;

export type MetaDataTemplateField = {
    query: boolean; // Indicates if the field is included in the input modal
    inputType: string; // The type of input (e.g., "text", "number", "dropdown")
    info?: string; // Information about the field
    default?: string | string[] | number | number[] | null | object | ((input: JSONObject) => JSONValue); // Default values
    options?: string | string[] | ((input: JSONObject) => string[]); // Options for dropdowns
    callback?: string | ((...args: unknown[]) => unknown); // Callback function for the field
    action?: string | ((...args: unknown[]) => unknown); // If inputType is actiontext, this defines the callback function that is called when the action button is clicked
    icon?: string; // Icon for the action button, valid values are icon name from lucide-icons
    tooltip?: string; // Tooltip for the action button
    units?: string[]; // Optional list of units for the field, if inputType is number
    defaultUnit?: string; // Default unit for the field, if inputType is number
}

export type MetaDataTemplate = {
    [key: string]: MetaDataTemplateField | MetaDataTemplate; // The key is the field name, and the value is the field properties
};

export interface CodeBlockView {
    app: App;
    contentEl: HTMLElement;
    currentFile: TFile | null;
    ctx: MarkdownPostProcessorContext;
}

/* Type defenition for JSON object, for obsidian frontmatter and other JSON objects */
export type JSONValue = string | number | boolean | null | JSONObject | Array<JSONValue>;
export interface JSONObject {
    [x: string]: JSONValue;
}
export type JSON = JSONObject | Array<JSONValue>;