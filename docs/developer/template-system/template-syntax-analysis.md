# Template Syntax Analysis & Improvement Suggestions

## Overview

This document analyzes the revised template structure in `src/data/templates/notes/sample.ts` and `sample_sclasses.ts` and provides recommendations for improving consistency, clarity, and maintainability.

## Current State Analysis

### Strengths of the New Structure

1. **Unified Template Definition** - Combining metadata, markdown, title, and folder templates in one place is excellent
2. **Context-Based Functions** - Using the same context-based function pattern for path generation is more consistent
3. **Subclass Import** - Supporting external subclass imports keeps files manageable
4. **Separation of Concerns** - The `NoteTemplate` interface cleanly separates different aspects

### Areas for Improvement

## 1. Naming Consistency Issues

### Issue: Mixed Terminology for Path Generation
**Current:**
```typescript
title: PathTemplate;  // Uses "title"
folder: PathTemplate; // Uses "folder"
```

**Problem:** The terms "title" and "folder" are ambiguous. What is "title"? Is it the note title or the file name?

**Recommendation:** Use more explicit names:
```typescript
fileName: PathTemplate;  // The actual filename (without .md extension)
folderPath: PathTemplate; // The folder path where the file will be created
```

---

## 2. PathTemplate Structure Inconsistency

### Issue: Mixed Syntax in `title` vs `folder`

**Current `title` (complex):**
```typescript
title: {
    type: "field function",
    fields: [
        {
            name: 'operator',
            context: ["settings", "userInput"],
            function: "({ settings, userInput }) => ${settings.operators[userInput.sample.operator].initials}",
            separator: "-"
        },
        // ...
    ],
}
```

**Current `folder` (simple array):**
```typescript
folder: [
    { type: 'string', field: "Experiments/Samples", separator: "/" },
    { type: 'userInput', field: "project.name", separator: "/" },
    // ...
]
```

**Problem:** 
- Two different structures for similar functionality
- The `title` uses a wrapper object with `type: "field function"`, while `folder` is a direct array
- Inconsistent between "complex functions" and "simple field references"

**Recommendation:** Unify to a single consistent structure:

```typescript
fileName: {
    segments: [
        {
            type: "function",
            name: 'operator',  // Optional descriptive name
            context: ["settings", "userInput"],
            function: "({ settings, userInput }) => settings.operators[userInput.sample.operator].initials",
            separator: "-"
        },
        {
            type: "function",
            name: 'project',
            context: ["noteMetadata", "userInput"],
            function: "({ noteMetadata, userInput }) => noteMetadata.get(userInput.project.name).project.abbreviation",
            separator: "-"
        },
        {
            type: "field",  // Simple field reference
            path: "userInput.sample.type",
            transform: "lowercase",  // Optional transformation
            separator: ""
        },
        {
            type: "counter",
            name: 'index',
            context: ["fs"],
            function: "({ fs }) => { /* ... */ }",
            width: 3,  // Zero-pad to 3 digits
            separator: ""
        }
    ]
},

folderPath: {
    segments: [
        {
            type: "literal",  // Renamed from "string" for clarity
            value: "Experiments/Samples",
            separator: "/"
        },
        {
            type: "field",
            path: "userInput.project.name",
            separator: "/"
        },
        {
            type: "field",
            path: "userInput.sample.type",
            separator: ""
        }
    ]
}
```

**Benefits:**
- Both use the same `segments` array structure
- Clear `type` discriminator: `"literal"`, `"field"`, `"function"`, `"counter"`
- `path` is more explicit than `field` for nested properties
- Removes ambiguity between simple and complex paths

---

## 3. Function Syntax Improvements

### Issue: Template Literal Syntax in Function Strings

**Current:**
```typescript
function: "({ settings, userInput }) => ${settings.operators[userInput.sample.operator].initials}"
```

**Problems:** 
1. Uses `${}` which looks like template literal interpolation but is actually inside a string
2. Confusing - the `${}` won't be evaluated as template literal
3. The actual function code should NOT use `${}`
4. **Redundancy** - context is specified twice: in `context` array AND in function parameters
5. **Ambiguity risk** - What if we have: `"({ settings, userInput }) => settings.operators[userInput.sample.operator].settings.initials"`?
   - Is the last `.settings` referring to the context or a property path? It's clear here, but could be confusing.

### Recommendation: Remove Arrow Function Boilerplate (PREFERRED)

**New approach:** Use `expression` instead of `function`, remove parameter destructuring entirely:

```typescript
{
    kind: "function",
    context: ["settings", "userInput"],
    expression: "settings.operators[userInput.sample.operator].initials",
    separator: "-"
}
```

**Benefits:**
- ✅ **No redundancy** - Context specified only once in `context` array
- ✅ **No ambiguity** - Clear that `settings` at start refers to context, not a property
- ✅ **Simpler** - Less boilerplate to write
- ✅ **Easier to parse** - Static analysis of required contexts is trivial
- ✅ **Cleaner** - More like a template expression than code

**How it works:**
```typescript
// Evaluator wraps the expression in a function at runtime:
const func = new Function(...segment.context, `return ${segment.expression}`);

// Example: becomes this at runtime:
// function(settings, userInput) {
//     return settings.operators[userInput.sample.operator].initials;
// }

const args = segment.context.map(name => contexts[name]);
const result = func(...args);
```

**For multiline/complex expressions:**
```typescript
{
    kind: "function",
    context: ["fs"],
    expression: `
        const existingFiles = fs.listFiles({ startsWith: this.file.basename });
        const numbers = existingFiles.map(f => {
            const match = f.name.match(/(\\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
        });
        const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
        return nextNum.toString().padStart(3, '0');
    `,
    separator: ""
}
```

### Alternative: Infer Context from Parameters (NOT RECOMMENDED)

**Why not:**
```typescript
{
    function: "({ settings, userInput }) => settings.operators[userInput.sample.operator].initials"
}
```

**Problems:**
- ❌ Need to parse function string to extract context names
- ❌ Still redundant - parameters are just boilerplate
- ❌ More complex validation
- ❌ Harder to statically analyze dependencies
- ❌ Doesn't solve ambiguity issue
- ❌ Feels like writing JavaScript rather than declarative config

### Addressing the Ambiguity Concern

**Your example:**
```typescript
expression: "settings.operators[userInput.sample.operator].settings.initials"
```

**Is this ambiguous?** No, because:

1. **Context names are explicit** - We know from `context: ["settings", "userInput"]` that `settings` and `userInput` are context objects
2. **Scope rules** - The first identifier in a path is always looked up in the local scope (which contains our context variables)
3. **Property access** - Everything after the first identifier is property access (`.settings.initials`)

**In JavaScript:**
```javascript
// Given contexts:
const settings = { operators: [...], /* other settings */ };
const userInput = { sample: { operator: 0 } };

// This expression:
settings.operators[userInput.sample.operator].settings.initials

// Parses as:
(settings.operators)[userInput.sample.operator].(settings.initials)
//  ^context       ^context                      ^property of the operator object

// There's no ambiguity because:
// - First 'settings' is looked up in scope -> finds the context variable
// - Second 'settings' is property access on the operator object
```

**The key insight:** JavaScript's scope resolution handles this naturally. The first reference in a path is always a variable lookup, subsequent dots are property access.

### Security Consideration

**Important:** Since we're using `new Function()`, we need to ensure contexts provide safe interfaces:

```typescript
// ❌ BAD - Exposes entire plugin
context: ["plugin"]
expression: "plugin.app.vault.delete(someFile)"  // Dangerous!

// ✅ GOOD - Safe interface
context: ["plugin"]
expression: "plugin.version"  // Only exposes safe properties

// The PluginContext interface limits what's accessible:
interface PluginContext {
    version: string;
    manifest: { version: string; id: string; name: string };
    // No access to app, vault, etc.
}
```

**See template-migration-plan.md** for full details on safe context interfaces.

---

## 4. Type Field Ambiguity

### Issue: Overloaded "type" Key

**Current:** The word "type" is used in multiple contexts:
```typescript
type: "field function"     // Path segment type
type: "function"           // Function descriptor type
type: "literal"            // Value type
inputType: "text"          // Input control type
```

**Problem:** Too many "type" fields with different meanings causes confusion.

**Recommendation:** Use more specific names:

```typescript
// For path segments
segmentType: "function" | "field" | "literal" | "counter"

// For function descriptors (keep as is - already clear in context)
type: "function"

// For metadata input fields (keep as is)
inputType: "text" | "number" | ...
```

Or use TypeScript discriminated unions properly:

```typescript
type PathSegment = 
    | { kind: "literal"; value: string; separator?: string }
    | { kind: "field"; path: string; transform?: string; separator?: string }
    | { kind: "function"; name?: string; context: string[]; function: string; separator?: string }
    | { kind: "counter"; context: string[]; function: string; width?: number; separator?: string };
```

---

## 5. Metadata Structure Improvements

### Issue: "query" Field Naming

**Current:**
```typescript
"author": {
    "query": true,  // What does this mean?
    "inputType": "dropdown",
    // ...
}
```

**Problem:** "query" is not descriptive. Does it mean:
- This field should be shown in the query modal?
- This field can be queried from other notes?
- This field requires user input?

**Recommendation:** Use more descriptive names:

```typescript
"author": {
    "showInModal": true,        // Show this field in the note creation modal
    "required": false,           // Is this field required?
    "inputType": "dropdown",
    // ...
}
```

Or if "query" means "prompt user for input":

```typescript
"author": {
    "promptUser": true,          // Ask user for this value during note creation
    "inputType": "dropdown",
    // ...
}
```

---

## 6. Subclass Template Structure

### Issue: Inconsistent Import vs Inline

**Current:**
```typescript
subclasses: {
    import: "./sample_sclasses"
}
```

**Problem:** 
- Limited to single import source
- Can't mix imports and inline definitions
- Import path is relative but not type-safe

**Recommendation:** Support both inline and import:

```typescript
subclasses: {
    sources: [
        { type: "import", path: "./sample_sclasses" },
        { type: "inline", templates: [/* inline templates */] }
    ]
}
```

Or simpler:

```typescript
subclasses: [
    { source: "import", path: "./sample_sclasses" },
    // Could also define inline subclasses here
]
```

---

### Issue: Subclass Template Structure

**Current in `sample_sclasses.ts`:**
```typescript
const sampleSubClassTemplates: NoteTemplate = [  // Wrong type annotation
    {
        name: "compound",
        abbreviation: "cp",
        template: {
            metadata: {
                "add": [/* ... */],
            },
            markdown: {
                default: true,
                content: ``,
            },
        },
    },
    // ...
]
```

**Problems:**
1. Type annotation is wrong (`NoteTemplate` vs array of subclass templates)
2. `template.metadata.add` array structure is verbose
3. `markdown.default` boolean is confusing - what does "default" mean?

**Recommendation:**

```typescript
export interface SubclassTemplate {
    name: string;
    abbreviation: string;
    displayName?: string;  // Optional human-readable name
    metadata: {
        extend: MetadataField[];  // Fields to add to base template
        override?: Record<string, MetadataField>;  // Fields to override
        remove?: string[];  // Field paths to remove
    };
    markdown?: {
        mode: "inherit" | "replace" | "append" | "prepend";
        content?: string;  // Only needed if mode is not "inherit"
    };
    fileName?: {
        segments: PathSegment[];  // Override filename generation
    };
    folderPath?: {
        segments: PathSegment[];  // Override folder path
    };
}

const sampleSubclassTemplates: SubclassTemplate[] = [
    {
        name: "compound",
        abbreviation: "cp",
        metadata: {
            extend: [
                {
                    path: "sample.total_mass",  // Use path instead of fullKey
                    showInModal: true,
                    inputType: "number",
                    default: 0,
                    unit: {
                        default: "mg",
                        options: ["mg", "g", "kg"]
                    }
                },
                {
                    path: "sample.product.chemical_formula",
                    showInModal: true,
                    inputType: "text",
                    placeholder: "Enter the chemical formula"
                },
                // ...
            ]
        },
        markdown: {
            mode: "inherit"  // Use the parent template's markdown
        }
    },
    // ...
];
```

**Benefits:**
- Correct typing
- `extend` is clearer than "add"
- Explicit `mode` for markdown inheritance
- Consistent structure with parent template
- `path` instead of `fullKey` - more standard naming

---

## 7. Default Values and Function Descriptors

### Issue: Mixed Formats for Defaults

**Current:**
```typescript
"default": {
    type: "function",
    value: "this.manifest.version"
}

// vs

"default": ["sample"]

// vs

"default": {
    type: "function",
    context: ["userInput"],
    reactiveDeps: ["sample.type"],
    function: "({ userInput }) => [`sample/${userInput.sample.type.replace(/\\s/g, '_')}`]",
    fallback: ["sample/unknown"]
}
```

**Problem:** Three different formats for default values is confusing.

**Recommendation:** Standardize on a single union type:

```typescript
type DefaultValue<T> = 
    | T                                    // Static value
    | FunctionDescriptor                   // Legacy function
    | EnhancedFunctionDescriptor;          // New enhanced function

// For metadata fields:
interface MetadataField {
    // ...
    default?: DefaultValue<unknown>;
}
```

And prefer the enhanced function format for all dynamic defaults:

```typescript
"ELN version": {
    "showInModal": false,
    "inputType": "text",
    "default": {
        type: "function",
        context: ["plugin"],
        function: "({ plugin }) => plugin.manifest.version",
        fallback: "unknown"
    }
}
```

---

## 8. Unit Handling

### Issue: Inconsistent Unit Specification

**Current:**
```typescript
"units": ["mg", "g", "kg"]
"defaultUnit": "mg"

// vs in function:
unit: {
    default: "mg",
    options: ["mg", "g", "kg"]
}
```

**Recommendation:** Standardize on one format:

```typescript
"sample.total_mass": {
    "showInModal": true,
    "inputType": "number",
    "default": 0,
    "unit": {
        "default": "mg",
        "options": ["mg", "g", "kg"],
        "allowCustom": false  // Can user enter custom units?
    }
}
```

---

## 9. Query Configuration Improvements

### Issue: Query Configuration Structure

**Current:**
```typescript
"project": {
    "query": true,
    "inputType": "queryDropdown",
    "search": "project",
    "where": [
        {
            "field": "note type",
            "is": "project"
        }
    ],
    "return": {
        "project.name": "project.name",
        "project.type": "project.type",
        "project.link": "file.link",
    }
}
```

**Problems:**
- `"query": true` plus `"inputType": "queryDropdown"` is redundant
- `"search": "project"` - unclear what this means
- `"where"` uses `"is"` but it's unclear what operators are supported
- `"return"` mapping is verbose when source and target are the same

**Recommendation:**

```typescript
"project": {
    "showInModal": true,
    "inputType": "queryDropdown",
    "query": {
        "source": "notes",  // What to search: "notes", "tags", "dataview", etc.
        "filter": {
            "field": "note type",
            "operator": "equals",  // More explicit than "is"
            "value": "project"
        },
        "return": {
            // Use shorthand when source and target are the same
            "fields": ["project.name", "project.type"],
            // Or explicit mapping when different
            "mapping": {
                "project.link": "file.link"
            }
        }
    }
}
```

Or even simpler for common cases:

```typescript
"project": {
    "showInModal": true,
    "inputType": "queryDropdown",
    "query": {
        "noteType": "project",  // Shorthand for filtering by note type
        "returnFields": ["project.name", "project.type", "project.link"]
    }
}
```

---

## 10. Overall Structure Recommendation

### Proposed Complete Structure:

```typescript
interface NoteTemplate {
    // Basic identification
    id: string;                          // Unique template ID
    name: string;                        // Display name
    description?: string;                // Template description
    version?: string;                    // Template version for compatibility
    
    // Path generation
    fileName: {
        segments: PathSegment[];
    };
    folderPath: {
        segments: PathSegment[];
    };
    
    // Content templates
    metadata: MetadataTemplate;
    markdown: string;
    
    // Subclass support
    subclasses?: {
        sources: SubclassSource[];
        field?: string;  // Which metadata field determines the subclass (e.g., "sample.type")
    };
    
    // Additional configuration
    createSubfolders?: string[];         // Subfolders to create with the note
    customActions?: CustomAction[];      // Custom actions/commands for this note type
}

type PathSegment = 
    | LiteralSegment
    | FieldSegment
    | FunctionSegment
    | CounterSegment;

interface LiteralSegment {
    kind: "literal";
    value: string;
    separator?: string;
}

interface FieldSegment {
    kind: "field";
    path: string;                        // Dot notation path (e.g., "userInput.project.name")
    transform?: "uppercase" | "lowercase" | "capitalize" | "kebab-case";
    separator?: string;
}

interface FunctionSegment {
    kind: "function";
    name?: string;                       // Optional descriptive name
    context: ContextType[];
    function: string;
    reactiveDeps?: string[];
    fallback?: string;
    separator?: string;
}

interface CounterSegment {
    kind: "counter";
    context: ["fs"];
    function: string;
    width?: number;                      // Zero-pad width
    separator?: string;
}

type ContextType = 
    | "userInput"      // Current form data
    | "settings"       // Plugin settings
    | "plugin"         // Plugin instance
    | "noteMetadata"   // Other notes' metadata
    | "fs"             // File system operations
    | "vault"          // Vault operations
    | "subclasses";    // Subclass definitions

interface MetadataField {
    // Display configuration
    showInModal: boolean;                // Show in note creation modal
    label?: string;                      // Custom label (defaults to key name)
    description?: string;                // Help text
    
    // Input configuration
    inputType: InputType;
    placeholder?: string;
    default?: DefaultValue<unknown>;
    required?: boolean;
    
    // Type-specific configuration
    options?: string[] | EnhancedFunctionDescriptor;  // For dropdown/multiselect
    unit?: UnitConfig;                              // For number fields
    query?: QueryConfig;                            // For query fields
    objectTemplate?: Record<string, MetadataField>; // For object/list fields
    
    // Validation
    validation?: ValidationRule[];
    
    // Callbacks
    onChange?: EnhancedFunctionDescriptor;  // Triggered when value changes
}

interface UnitConfig {
    default: string;
    options: string[];
    allowCustom?: boolean;
}

interface QueryConfig {
    noteType?: string;                   // Shorthand for filtering by note type
    filter?: FilterClause;               // Complex filter
    returnFields: string[];              // Fields to return
    mapping?: Record<string, string>;    // Source -> target mapping
}

interface SubclassTemplate {
    name: string;
    abbreviation: string;
    displayName?: string;
    
    metadata: {
        extend?: MetadataField[];        // Fields to add
        override?: Record<string, Partial<MetadataField>>;  // Fields to override
        remove?: string[];                // Field paths to remove
    };
    
    markdown?: {
        mode: "inherit" | "replace" | "append" | "prepend";
        content?: string;
    };
    
    fileName?: {
        segments: PathSegment[];         // Override filename
    };
    
    folderPath?: {
        segments: PathSegment[];         // Override folder path
    };
}
```

---

## Summary of Key Improvements

### Naming Clarity
1. ✅ `fileName` and `folderPath` instead of `title` and `folder`
2. ✅ `showInModal` instead of ambiguous `query`
3. ✅ `path` instead of `field` for consistency
4. ✅ `kind` for PathSegment discriminator to avoid "type" overload
5. ✅ `literal` instead of `string` for static values

### Structural Consistency
1. ✅ Both fileName and folderPath use same `segments` array structure
2. ✅ Unified `PathSegment` discriminated union with clear types
3. ✅ Consistent `EnhancedFunctionDescriptor` usage throughout
4. ✅ Standardized `DefaultValue` union type

### Improved Clarity
1. ✅ Explicit context types with proper TypeScript enum
2. ✅ Clear markdown inheritance with `mode` field
3. ✅ Better query configuration with explicit operators
4. ✅ Unified unit configuration structure
5. ✅ Explicit subclass operations: `extend`, `override`, `remove`

### Type Safety
1. ✅ Proper TypeScript discriminated unions
2. ✅ Correct type annotations for arrays
3. ✅ Type-safe context references
4. ✅ Enum-based configuration where appropriate

### Extensibility
1. ✅ Support for multiple subclass sources
2. ✅ Custom actions and commands
3. ✅ Versioning for template compatibility
4. ✅ Flexible validation rules
5. ✅ Template descriptions and metadata

---

## Migration Path

To implement these improvements:

1. **Update Type Definitions** in `src/types/templates.ts`
2. **Create New Template Examples** following the improved structure
3. **Update TemplateEvaluator** to support new structure
4. **Create Migration Utilities** to convert old templates to new format
5. **Update Documentation** with examples and best practices
6. **Add Template Validation** to catch errors early

This structure provides a solid foundation for template import/export as JSON files while maintaining type safety and consistency throughout the codebase.
