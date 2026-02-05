/**
 * Template-related types for path and metadata processing
 */

/**
 * Path template element structure
 */
export type PathTemplate = Array<{
    type: string; // The type of the field (e.g., "dateField", "userInput", "string", "index")
    field: string; // The field to include in the title (e.g., "currentDate", "this.userInput.author")
    separator?: string; // Optional separator to append after the field
}>;

/**
 * Function descriptor for explicit function declarations
 */
export interface FunctionDescriptor {
    type: "function";
    value: string; // The function code as a string
    userInputs?: string[]; // Array of user input field paths that this function depends on
}

/**
 * Helper type to check if a value is a function descriptor
 */
export type MaybeFunction<T> = T | FunctionDescriptor;

/**
 * Represents a single field in the metadata template.
 */
export type MetadataField = {
    key?: string; // Field key for objectList fields
    query?: boolean;
    inputType?: "text" | "number" | "date" | "dropdown" | "multiselect" | "actiontext" | "dynamic" | "editableObject" | "queryDropdown" | "multiQueryDropdown" | "subclass" | "list" | "objectList";
    default?: string | number | boolean | null | (() => string | number | boolean | null);
    placeholder?: string | MaybeFunction<string>; // Placeholder text for empty inputs
    options?: string | string[] | (() => string[]);
    callback?: ((value: string | number | boolean | null) => string | number | boolean | null) | null;
    action?: ((value: string | number | boolean | null) => void) | null;
    units?: string | string[];
    defaultUnit?: string;
    icon?: string;
    tooltip?: string;
    search?: string;
    where?: Array<{ field: string; [op: string]: string | number | boolean }>;
    object?: MetadataField[] | Record<string, MetadataField>; // For objectList type - array (legacy) or object (new format)
    // Object List specific properties
    editableKey?: boolean; // Whether the key name can be edited
    editableUnit?: boolean; // Whether the unit can be edited
    allowTypeSwitch?: boolean; // Whether the input type can be changed
    removeable?: boolean; // Whether this field can be removed from the object
    [key: string]: MetadataField | unknown; // Allow nested fields
};

/**
 * Represents the entire metadata template.
 */
export type MetadataTemplate = Record<string, MetadataField>;

/**
 * Metadata template field with processed/resolved values
 */
export type MetaDataTemplateField = {
    key?: string; // Field key for objectList fields
    query?: boolean;
    inputType?: "text" | "number" | "date" | "dropdown" | "multiselect" | "actiontext" | "dynamic" | "editableObject" | "queryDropdown" | "multiQueryDropdown" | "subclass" | "list" | "objectList";
    default?: MaybeFunction<string | number | boolean | null>;
    options?: MaybeFunction<string | string[]>;
    callback?: MaybeFunction<((value: string | number | boolean | null) => string | number | boolean | null) | null>;
    action?: MaybeFunction<((value: string | number | boolean | null) => void) | null>;
    units?: MaybeFunction<string | string[]>;
    defaultUnit?: MaybeFunction<string>;
    icon?: MaybeFunction<string>;
    tooltip?: MaybeFunction<string>;
    search?: MaybeFunction<string>;
    where?: MaybeFunction<Array<{ field: string; [op: string]: string | number | boolean }>>;
    object?: MaybeFunction<MetaDataTemplateField[] | Record<string, MetaDataTemplateField>>; // For objectList type - array (legacy) or object (new format)
    // Object List specific properties
    editableKey?: MaybeFunction<boolean>; // Whether the key name can be edited
    editableUnit?: MaybeFunction<boolean>; // Whether the unit can be edited
    allowTypeSwitch?: MaybeFunction<boolean>; // Whether the input type can be changed
    removeable?: MaybeFunction<boolean>; // Whether this field can be removed from the object
    [key: string]: MetaDataTemplateField | MaybeFunction<unknown>;
};

/**
 * Metadata template with processed fields
 */
export type MetaDataTemplate = {
    [key: string]: MetaDataTemplateField | MaybeFunction<unknown>;
};

/**
 * Fully processed metadata template field
 */
export type MetaDataTemplateFieldProcessed = {
    key?: string; // Field key for objectList fields
    query?: boolean;
    inputType?: "text" | "number" | "date" | "dropdown" | "multiselect" | "actiontext" | "dynamic" | "editableObject" | "queryDropdown" | "multiQueryDropdown" | "subclass" | "list" | "objectList";
    default?: string | number | boolean | null;
    options?: string | string[];
    callback?: ((value: string | number | boolean | null) => string | number | boolean | null) | null;
    action?: ((value: string | number | boolean | null) => void) | null;
    units?: string | string[];
    defaultUnit?: string;
    icon?: string;
    tooltip?: string;
    search?: string;
    where?: QueryWhereClause;
    return?: QueryReturnClause;
    object?: MetaDataTemplateFieldProcessed[] | Record<string, MetaDataTemplateFieldProcessed>; // For objectList type - array (legacy) or object (new format)
    // Object List specific properties
    editableKey?: boolean; // Whether the key name can be edited
    editableUnit?: boolean; // Whether the unit can be edited
    allowTypeSwitch?: boolean; // Whether the input type can be changed
    removeable?: boolean; // Whether this field can be removed from the object
    initialItems?: number; // Number of empty objects to create when list is empty
    [key: string]: MetaDataTemplateFieldProcessed | unknown;
};

// Enhanced where clause types
export type QueryWhereClause = 
    | string  // Simple string for backward compatibility
    | QueryConditionObject
    | QueryLogicObject
    | Array<{ field: string; [op: string]: string | number | boolean }>; // Legacy format

export interface QueryConditionObject {
    field: string;
    operator: 'is' | 'contains' | 'not' | 'gt' | 'lt' | 'gte' | 'lte' | 'exists' | 'regex';
    value?: string | number | boolean;
}

export interface QueryLogicObject {
    operator: 'and' | 'or' | 'not';
    conditions: (QueryConditionObject | QueryLogicObject)[];
}

// Enhanced return clause types
export type QueryReturnClause = 
    | string[]  // Simple array for backward compatibility: ["field1", "field2"]
    | Record<string, string>;  // Mapping object: { "source.field": "target.field" }

/**
 * Fully processed metadata template
 */
export type MetaDataTemplateProcessed = {
    [key: string]: MetaDataTemplateFieldProcessed | unknown;
};

/**
 * Subclass template operations for extending base templates
 */
export interface SubclassAddField {
    /**
     * The operation type for adding a field to the template.
     */
    operation: "add";
    
    /**
     * The path where the field should be added (e.g., "synthesis.method").
     */
    path: string;
    
    /**
     * The field definition to add.
     */
    field: MetaDataTemplateField;
}

export interface SubclassReplaceField {
    /**
     * The operation type for replacing a field in the template.
     */
    operation: "replace";
    
    /**
     * The path of the field to replace (e.g., "sample.type").
     */
    path: string;
    
    /**
     * The new field definition.
     */
    field: MetaDataTemplateField;
}

export interface SubclassMetadataTemplate {
    /**
     * The base template to extend.
     */
    baseTemplate: string;
    
    /**
     * An array of operations to apply to the base template.
     */
    operations: (SubclassAddField | SubclassReplaceField)[];
    
    // Legacy support for old format
    add?: Array<{ fullKey: string; input: MetaDataTemplateField }>;
    replace?: Array<{ fullKey: string; newKey?: string; input: MetaDataTemplateField }>;
    remove?: string[];
}
