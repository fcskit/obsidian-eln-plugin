import { App, TFile, MarkdownPostProcessorContext } from "obsidian";

/**
 * Form-related types for user input handling
 */

/**
 * Valid form field value types
 */
export type FormFieldValue = 
    | string 
    | number 
    | boolean 
    | null 
    | Date 
    | string[] 
    | number[] 
    | boolean[]
    | { [key: string]: FormFieldValue };

/**
 * Form data structure for collecting user input
 */
export type FormData = {
    [key: string]: FormFieldValue;
};

/**
 * Input component interface for form elements
 */
export type InputComponent = object; // Will store references to input components

export type InputComponents = {
    [key: string]: InputComponent;
};

/**
 * Interface for components that can be set with values
 */
export interface SettableComponent {
    setValue(value: string | number | boolean | null): void;
}

/**
 * Code block view interface for NPE rendering
 */
export interface CodeBlockView {
    containerEl: HTMLElement;
    sourcePath: string;
    app: App;
    file?: TFile;
    ctx?: MarkdownPostProcessorContext;
}
