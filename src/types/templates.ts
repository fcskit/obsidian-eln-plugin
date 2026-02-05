/**
 * Template-related types for path and metadata processing
 */

// ============================================================================
// Function Descriptors (Legacy formats for backward compatibility)
// ============================================================================

/**
 * @deprecated Legacy function descriptor - migrate to SimpleFunctionDescriptor or ComplexFunctionDescriptor
 */
export interface FunctionDescriptor {
    type: "function";
    value: string; // The function code as a string
    userInputs?: string[]; // Array of user input field paths that this function depends on
}

/**
 * @deprecated Use SimpleFunctionDescriptor or ComplexFunctionDescriptor instead
 */
export interface EnhancedFunctionDescriptor {
    type: "function";
    context: string[]; // Array of contexts needed (e.g., ["userInput", "settings"])
    reactiveDeps?: string[]; // Array of user input field paths that this function depends on (optional)
    function: string; // Function body with destructured parameters (e.g., "({ userInput, settings }) => ...")
    fallback: unknown; // Fallback value if dependencies are not met (JSON value, not expression)
}

/**
 * @deprecated Union type for legacy function descriptor formats
 */
export type AnyFunctionDescriptor = FunctionDescriptor | EnhancedFunctionDescriptor;

// ============================================================================
// New Function Descriptors (Phase 1 - Dual Syntax Support)
// ============================================================================

/**
 * Context types available in function evaluation
 */
export type ContextType = 
    | "userInput"      // Current form data (read-only)
    | "settings"       // Plugin settings (safe interface)
    | "plugin"         // Plugin metadata (safe interface)
    | "noteMetadata"   // Other notes' metadata (safe interface)
    | "fs"             // File system operations (safe interface)
    | "vault"          // Vault operations (safe interface)
    | "subclasses"     // Subclass definitions (safe interface)
    | "date"           // Date formatting and manipulation (moment.js)
    | "input"          // Input value for callbacks (field value being processed)
    | "queryDropdown"  // QueryDropdown context (selection, frontmatter, file of referenced note)
    | "postprocessor"; // Postprocessor context (filename, folderPath after note path resolution)

/**
 * Simple function descriptor for inline expressions with explicit context.
 * Use this for straightforward value access and simple operations.
 * 
 * @example
 * {
 *   type: "function",
 *   context: ["settings", "userInput"],
 *   expression: "settings.operators[userInput.sample.operator].initials",
 *   reactiveDeps: ["sample.operator"],
 *   fallback: "unknown"
 * }
 */
export interface SimpleFunctionDescriptor {
    type: "function";
    context: ContextType[];           // Explicitly specify required contexts
    expression: string;               // Expression without arrow function wrapper
    reactiveDeps?: string[];          // Optional reactive dependencies (userInput paths)
    fallback?: unknown;               // Fallback if dependencies not met
}

/**
 * Complex function descriptor for arrow functions with inferred context.
 * Use this for array/object construction, conditional logic, or complex operations.
 * 
 * @example
 * {
 *   type: "function",
 *   function: "({ userInput, fs }) => [`sample/${userInput.type}`, fs.getNextCounter('EXP', 3)]",
 *   reactiveDeps: ["type"],
 *   fallback: ["sample/unknown", "001"]
 * }
 */
export interface ComplexFunctionDescriptor {
    type: "function";
    function: string;                 // Arrow function string with inferred context from parameters
    reactiveDeps?: string[];          // Optional reactive dependencies (userInput paths)
    fallback?: unknown;               // Fallback if dependencies not met
}

/**
 * Union type for all new function descriptor formats
 */
export type NewFunctionDescriptor = SimpleFunctionDescriptor | ComplexFunctionDescriptor;

// ============================================================================
// New Path Template Structure (Phase 1 - Unified Path Generation)
// ============================================================================

/**
 * Literal segment - static text
 * 
 * @example
 * { kind: "literal", value: "Experiment", separator: "-" }
 * // Generates: "Experiment-"
 */
export interface LiteralSegment {
    kind: "literal";
    value: string;
    separator?: string;
}

/**
 * Field segment - extract value from user input
 * 
 * @example
 * {
 *   kind: "field",
 *   path: "userInput.project.name",
 *   transform: "kebab-case",
 *   separator: "_"
 * }
 * // If userInput.project.name = "My Project"
 * // Generates: "my-project_"
 */
export interface FieldSegment {
    kind: "field";
    path: string;  // Dot notation path to value (e.g., "userInput.project.name")
    transform?: "uppercase" | "lowercase" | "capitalize" | "kebab-case" | "snake-case";
    separator?: string;
}

/**
 * Function segment - dynamic value from function evaluation
 * 
 * @example Simple expression:
 * {
 *   kind: "function",
 *   name: "operator-initials",
 *   context: ["settings", "userInput"],
 *   expression: "settings.operators[userInput.sample.operator].initials",
 *   reactiveDeps: ["sample.operator"],
 *   fallback: "XX",
 *   separator: "-"
 * }
 * 
 * @example Complex function:
 * {
 *   kind: "function",
 *   function: "({ userInput }) => userInput.date.replace(/-/g, '')",
 *   reactiveDeps: ["date"],
 *   fallback: "00000000"
 * }
 */
export interface FunctionSegment {
    kind: "function";
    name?: string;  // Optional descriptive name for debugging
    // One of these two formats:
    context?: ContextType[];  // For simple expressions
    expression?: string;      // Simple expression (used with context)
    function?: string;        // Complex arrow function (context inferred)
    // Common properties:
    reactiveDeps?: string[];  // userInput paths that trigger re-evaluation
    fallback?: unknown;       // Fallback value if dependencies not met or error occurs
    separator?: string;
}

/**
 * Counter segment - auto-increment number based on existing files
 * 
 * @example
 * {
 *   kind: "counter",
 *   prefix: "EXP-2026-",
 *   width: 3,
 *   separator: ""
 * }
 * // If files exist: EXP-2026-001, EXP-2026-002
 * // Generates: "003"
 * 
 * @example With inheritFrom (for fileName inheriting from folderPath):
 * {
 *   kind: "counter",
 *   inheritFrom: "folderPath",
 *   separator: ""
 * }
 * // If folderPath evaluated to "...MethodName_02/", fileName will use "02"
 */
export interface CounterSegment {
    kind: "counter";
    prefix?: string;  // Filter files by prefix for counter scope
    width?: number;   // Zero-pad width (default: 2)
    inheritFrom?: "folderPath";  // Inherit counter value from folderPath evaluation
    separator?: string;
}

/**
 * Union type for all path segment types
 */
export type PathSegment = 
    | LiteralSegment
    | FieldSegment
    | FunctionSegment
    | CounterSegment;

/**
 * New unified path template structure using discriminated union segments
 * 
 * @example
 * {
 *   segments: [
 *     { kind: "literal", value: "EXP", separator: "-" },
 *     { kind: "field", path: "userInput.project.code", transform: "uppercase", separator: "-" },
 *     { kind: "counter", width: 3, separator: "" }
 *   ]
 * }
 * // Generates: "EXP-ABC-001"
 */
export interface PathTemplate {
    segments: PathSegment[];
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Helper type to check if a value is a function descriptor (any format)
 */
export type MaybeFunction<T> = T | AnyFunctionDescriptor | NewFunctionDescriptor;

// ============================================================================
// Metadata Template Types
// ============================================================================

/**
 * Represents a single field in the metadata template.
 */
export type MetadataField = {
    key?: string; // Field key for objectList fields
    query?: boolean;
    inputType?: "text" | "number" | "boolean" | "date" | "dropdown" | "multiselect" | "actiontext" | "dynamic" | "editableObject" | "queryDropdown" | "multiQueryDropdown" | "subclass" | "list" | "objectList" | "postprocessor" | "filePicker";
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
    multiline?: boolean; // Whether text input should support multiple lines
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
    inputType?: "text" | "number" | "boolean" | "date" | "dropdown" | "multiselect" | "actiontext" | "dynamic" | "editableObject" | "queryDropdown" | "multiQueryDropdown" | "subclass" | "list" | "objectList";
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
    inputType?: "text" | "number" | "boolean" | "date" | "dropdown" | "multiselect" | "actiontext" | "dynamic" | "editableObject" | "queryDropdown" | "multiQueryDropdown" | "subclass" | "list" | "objectList" | "postprocessor" | "filePicker";
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
    from?: AnyFunctionDescriptor | string;  // Source file for frontmatter-based queries
    get?: AnyFunctionDescriptor;  // Function to extract options from frontmatter
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
    | Record<string, string>  // Mapping object: { "source.field": "target.field" }
    | Record<string, AnyFunctionDescriptor>;  // Function-based return mapping: { "target.field": { function with selection/frontmatter context } }

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
