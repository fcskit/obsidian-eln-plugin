/**
 * Represents a single field in the metadata template.
 */
export type MetadataField = {
    query?: boolean;
    inputType?: "text" | "number" | "date" | "dropdown" | "multiselect" | "actiontext";
    default?: string | number | boolean | null | (() => string | number | boolean | null);
    options?: string | string[] | (() => string[]);
    callback?: ((value: string | number | boolean | null) => string | number | boolean | null) | null;
    action?: ((value: string | number | boolean | null) => void) | null;
    units?: string | string[];
    defaultUnit?: string;
    icon?: string;
    tooltip?: string;
    [key: string]: MetadataField | unknown; // Allow nested fields
};

/**
 * Represents the entire metadata template.
 */
export type MetadataTemplate = Record<string, MetadataField>;

/**
 * Represents the data object that stores user input.
 * Nested fields are allowed.
 */
export interface Data {
    [key: string]: string | number | boolean | null | Data;
}

/**
 * Represents the inputs object that stores references to input elements.
 * Nested fields are allowed.
 */
export interface Inputs {
    [key: string]: HTMLElement | Inputs;
}