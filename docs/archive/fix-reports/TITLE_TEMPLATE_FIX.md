# Title Template Fix

## Problem Identified

The new implementation was not properly processing `titleTemplate` and `folderTemplate` configurations from `settings.ts`, causing two main issues:

1. **Broken Title Generation**: Notes were created with "Untitled Note" instead of using the configured `titleTemplate`
2. **Unwanted Title Metadata**: An extra `title` field was being added to the metadata that wasn't part of the template

### Example from `settings.ts`:
```typescript
chemical: {
    titleTemplate: [
        { type: 'userInput', field: "chemical.name", separator: "" },
    ],
    folderTemplate: [
        { type: 'string', field: "Resources/Chemicals", separator: "/" },
        { type: 'userInput', field: "chemical.type", separator: "" },
    ],
    // ...
}
```

**Expected**: Note title should be the chemical name from user input  
**Actual**: Note titled "Untitled Note" with unwanted `title: Untitled chemical Note` in metadata ❌

## Root Cause Analysis

Two separate issues in the note creation pipeline:

### 1. Title Override in `NewNote.ts`
```typescript
// ❌ WRONG: Overriding title from form data
const noteTitle = String(formData.title || 'Untitled Note');

const options: NoteCreationOptionsRefactored = {
    noteType: noteType,
    noteTitle: noteTitle, // This prevents template-based title generation
    formData: formData,
    // ...
};
```

When `noteTitle` is provided to `NoteCreatorRefactored`, it skips the template-based title generation completely.

### 2. Unwanted Title Field in `sanitizeFormData`
```typescript
// ❌ WRONG: Adding title field to metadata
private sanitizeFormData(formData: FormData, noteType?: string): FormData {
    const sanitized: FormData = { ...formData };
    
    if (!sanitized.title) {
        sanitized.title = noteType ? `Untitled ${noteType} Note` : 'Untitled Note'; // This shouldn't be added
    }
    
    return sanitized;
}
```

This was adding a `title` field to the form data that ended up in the note's metadata section.

## Solution Implemented

### 1. Removed Title Override in `NewNote.ts`
**Allow `NoteCreatorRefactored` to generate titles from templates:**

```typescript
// ✅ AFTER: Let NoteCreatorRefactored generate title from template
logger.debug('[NewNote] Letting NoteCreatorRefactored generate title from template');

const options: NoteCreationOptionsRefactored = {
    noteType: noteType,
    // Don't provide noteTitle - let it be generated from titleTemplate
    formData: formData,
    metadataTemplate: template,
    // ...
};
```

### 2. Removed Unwanted Title Field Addition
**Clean up `sanitizeFormData` to not add template fields:**

```typescript
// ✅ AFTER: Don't add title field to metadata
private sanitizeFormData(formData: FormData, noteType?: string): FormData {
    const sanitized: FormData = { ...formData };
    
    // Only ensure that essential top-level fields exist if they're completely missing
    // Do NOT add fields that might conflict with template structure
    // Note: title is intentionally not added here as it should be generated from titleTemplate
    
    return sanitized;
}
```

## How Template Processing Works

The `NoteCreatorRefactored` has proper logic for template-based title generation:

```typescript
private async resolveNoteTitle(options: NoteCreationOptionsRefactored): Promise<string> {
    // Skip template processing if title is explicitly provided
    if (options.noteTitle) {
        return options.noteTitle; // ❌ This was the problem
    }

    // Get title template from settings
    let titleTemplate = options.noteTitleTemplate || 
        this.plugin.settings.note[options.noteType].titleTemplate;

    if (titleTemplate) {
        // Use PathTemplateParser to process template with form data
        const result = await parsePathTemplate(this.plugin.app, 'file', titleTemplate, options.formData);
        if (result) {
            return result; // ✅ This is what should happen
        }
    }

    // Fallback only if template processing fails
    return "New Note";
}
```

## Expected Results

✅ **Template-Based Titles**: Chemical notes named from `chemical.name` field (e.g., "Lithium Iron Phosphate")  
✅ **Clean Metadata**: No unwanted `title` field in the frontmatter  
✅ **Template Processing**: Both `titleTemplate` and `folderTemplate` work correctly  
✅ **User Input Integration**: Templates can access form data fields like `chemical.name`, `chemical.type`, etc.  

## Test Cases

For a chemical note with form data:
```typescript
formData = {
    chemical: {
        name: "Lithium Iron Phosphate",
        type: "active material"
    }
}
```

With `titleTemplate: [{ type: 'userInput', field: "chemical.name", separator: "" }]`:

- **Before**: Title = "Untitled Note", metadata includes `title: Untitled chemical Note` ❌
- **After**: Title = "Lithium Iron Phosphate", clean metadata without title field ✅

## Files Modified

1. **`NewNote.ts`**: Removed explicit `noteTitle` parameter to allow template processing
2. **`NoteCreatorRefactored.ts`**: Removed unwanted `title` field addition in `sanitizeFormData`

The fix ensures that the rich template system defined in `settings.ts` is properly utilized for note title and folder generation, providing the intended user experience for automated note organization! 📁✨
