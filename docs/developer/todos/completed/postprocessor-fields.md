# Postprocessor Fields Implementation

## Overview

Postprocessor fields are a special type of template field that are evaluated **after** the filename and folder path have been resolved, but **before** the note file is created. This allows fields to access the final filename (including counter) that will be used for the note.

## Use Case: Sample Name

The primary use case is the `sample.name` field in the sample template. We need the sample name to:
1. Match the actual filename (which includes a counter like `XX-PRJ-SMP-001`)
2. Be stored in the note's frontmatter
3. Be available for analysis notes to reference via queryDropdown

Without postprocessor fields, we would have a chicken-and-egg problem:
- The filename template needs sample.operator, project.name, and sample.type from form data
- The filename includes a counter (001, 002, etc.) determined during file creation
- The sample.name field needs to match the complete filename including counter

## Implementation

### 1. Type Definitions

**File:** `src/types/templates.ts`

Added two new types:

```typescript
// New inputType for postprocessor fields
inputType?: "text" | "number" | ... | "postprocessor" | "filePicker"

// New context type for postprocessor evaluation
ContextType = 
    | "userInput"
    | "settings"
    | ...
    | "postprocessor"  // NEW: Access to filename, folderPath after resolution
```

### 2. Context Interface

**File:** `src/core/templates/ContextProviders.ts`

Added `PostprocessorContext` interface:

```typescript
export interface PostprocessorContext {
    /**
     * The resolved filename (without extension) for the note being created
     */
    filename: string;
    
    /**
     * The resolved folder path where the note will be created
     */
    folderPath: string;
    
    /**
     * The full file path (folderPath/filename)
     */
    fullPath: string;
}
```

### 3. FunctionEvaluator Updates

**File:** `src/core/templates/FunctionEvaluator.ts`

Extended `evaluateFunction()` and `buildContexts()` to accept and handle `postprocessorContext`:

```typescript
evaluateFunction(
    descriptor: EnhancedFunctionDescriptor,
    userInput: FormData,
    noteType?: string,
    inputValue?: unknown,
    queryDropdownContext?: QueryDropdownContext,
    postprocessorContext?: PostprocessorContext  // NEW
): unknown
```

Added postprocessor case to `buildContexts()`:

```typescript
case 'postprocessor':
    if (!postprocessorContext) {
        logger.warn('Postprocessor context requested but not provided');
        contexts.postprocessor = {
            filename: '',
            folderPath: '',
            fullPath: ''
        };
    } else {
        contexts.postprocessor = postprocessorContext;
    }
    break;
```

### 4. NoteCreator Integration

**File:** `src/core/notes/NoteCreator.ts`

Added several new methods to handle postprocessor fields:

#### a) Added FunctionEvaluator instance

```typescript
export class NoteCreator {
    private functionEvaluator: FunctionEvaluator;
    
    constructor(plugin: ElnPlugin) {
        this.functionEvaluator = new FunctionEvaluator(plugin);
    }
}
```

#### b) Process postprocessor fields after path resolution

In `createNote()` method, after resolving filename and folder path:

```typescript
// Resolve note title (with counter)
const uniqueNoteTitle = await this.generateUniqueNoteTitle(folderPath, noteTitle);

// Process metadata using user input
const processedMetadata = await this.metadataPostProcessor.processMetadata(...);

// Process postprocessor fields (NEW)
const postprocessorUpdates = await this.processPostprocessorFields(
    options.metadataTemplate,
    sanitizedFormData,
    uniqueNoteTitle,  // filename with counter
    folderPath,
    options.noteType
);

// Merge postprocessor updates into processed metadata
this.mergeMetadata(processedMetadata, postprocessorUpdates);
```

#### c) New helper methods

- `processPostprocessorFields()` - Main entry point, creates postprocessor context
- `collectPostprocessorFields()` - Recursively finds fields with `inputType: "postprocessor"`
- `evaluatePostprocessorDefault()` - Evaluates function descriptors with postprocessor context
- `setNestedValue()` - Utility to set values in nested objects
- `mergeMetadata()` - Deep merge postprocessor updates into frontmatter

### 5. Sample Template Update

**File:** `src/data/templates/metadata/sample.ts`

Updated `sample.name` field to use postprocessor:

```typescript
"sample": {
    "name": {
        "query": false,
        "inputType": "postprocessor",
        "default": {
            type: "function",
            context: ["postprocessor"],
            expression: "postprocessor.filename"
        }
    },
    // ... other fields
}
```

### 6. Settings Update

**File:** `src/settings/settings.ts`

Simplified sample filename template to just use `sample.name` + counter:

```typescript
fileName: {
    segments: [
        { kind: "field", path: "sample.name", separator: "-" },
        { kind: "counter", prefix: "", separator: "", width: 3 }
    ]
}
```

Note: The original complex filename template with operator initials, project abbreviation, and type abbreviation is no longer needed because `sample.name` is now auto-generated to match the filename.

## Data Flow

1. **User fills form** - enters operator, project, sample type
2. **Path resolution** - NoteCreator evaluates fileName template:
   - Uses form data to build base name: `XX-PRJ-SMP`
   - Adds counter: `XX-PRJ-SMP-001`
3. **Postprocessor evaluation** - NoteCreator processes postprocessor fields:
   - Creates context: `{ filename: "XX-PRJ-SMP-001", folderPath: "Experiments/Samples/..." }`
   - Evaluates `sample.name` default: `postprocessor.filename` → `"XX-PRJ-SMP-001"`
4. **Metadata merge** - Postprocessor values merged into frontmatter
5. **File creation** - Note created with:
   - Filename: `XX-PRJ-SMP-001.md`
   - Frontmatter includes: `sample.name: XX-PRJ-SMP-001`

## Benefits

✅ **Consistency** - sample.name always matches filename
✅ **No empty values** - sample.name is always populated
✅ **Analysis notes work** - Can query `sample.name` reliably
✅ **Counter included** - Full unique name with counter
✅ **Clean architecture** - Separation of concerns (path resolution → postprocessing → file creation)

## UI Considerations

Fields with `inputType: "postprocessor"` should:
- Not be rendered in the modal (similar to `query: false`)
- Not be editable by users
- Be automatically populated after note creation

**TODO:** Update `UniversalObjectRenderer` to skip rendering postprocessor fields.

## Testing

To test the implementation:

1. Create a sample note in Obsidian
2. Fill in operator, project, and sample type
3. Create the note
4. Verify:
   - Filename matches pattern `XX-PRJ-SMP-001`
   - Frontmatter contains `sample.name: XX-PRJ-SMP-001`
   - sample.name matches filename exactly
5. Create an analysis note
6. Select the sample in the queryDropdown
7. Verify:
   - sample.name is populated from the sample note
   - Analysis note paths use sample.name correctly

## Future Enhancements

Potential uses for postprocessor fields:

- `note.path` - Full path to the created note
- `note.folder` - Folder where note was created
- `note.created_at` - Timestamp when note was created
- `note.filename` - Alias for current filename usage
- Auto-generated IDs or slugs based on final filename

## Related Files

- `src/types/templates.ts` - Type definitions
- `src/core/templates/ContextProviders.ts` - PostprocessorContext interface
- `src/core/templates/FunctionEvaluator.ts` - Context handling
- `src/core/notes/NoteCreator.ts` - Postprocessor evaluation logic
- `src/data/templates/metadata/sample.ts` - Sample template using postprocessor
- `src/settings/settings.ts` - Simplified fileName template
