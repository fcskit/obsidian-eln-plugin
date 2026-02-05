# TemplateManager Architecture Fix

## Problem Identified
The original architecture had a critical flaw where both `NewNote` and `NewNoteModalRefactored` were creating separate `TemplateManager` instances, causing:

1. **Double application of default subclass templates**
2. **Field contamination** where inputs contained duplicated fields from the default subclass
3. **Inconsistent template state** between the note creator and modal

## Root Cause Analysis
```typescript
// BEFORE: Two separate TemplateManager instances
// In NewNote.createNoteDirectly():
const templateManager = new TemplateManager({...}); // Instance #1

// In NewNoteModalRefactored constructor:
this.templateManager = new TemplateManager({...}); // Instance #2 ⚠️ PROBLEM!
```

Debug logs showed:
```
[template] Applying default subclass template  // From Instance #1
[template] Applying default subclass template  // From Instance #2 ⚠️ Double application!
```

## Architectural Solution
**Modified the modal path to use a single shared TemplateManager instance:**

### Changes Made:

1. **Updated `NewNoteModalRefactoredOptions` interface** to accept an optional `TemplateManager`:
```typescript
export interface NewNoteModalRefactoredOptions {
    modalTitle?: string;
    noteType: string;
    templateManager?: TemplateManager; // ✅ NEW: Accept shared instance
    metadataTemplate?: MetaDataTemplateProcessed;
    initialData?: FormData;
    onSubmit: (result: { formData: FormData; template: MetaDataTemplateProcessed } | null) => void;
}
```

2. **Modified `NewNote.openNewNoteModal()`** to create and pass a single TemplateManager:
```typescript
// ✅ AFTER: Single TemplateManager instance shared between components
const templateManager = new TemplateManager({
    plugin: this.plugin,
    noteType: noteType,
    initialData: initialData as FormData
});

const modal = new NewNoteModalRefactored(this.plugin, {
    modalTitle: `Create ${noteType} Note`,
    noteType: noteType,
    templateManager: templateManager, // ✅ Pass shared instance
    onSubmit: async (result) => { ... }
});
```

3. **Updated `NewNoteModalRefactored` constructor** to use provided instance or fall back:
```typescript
// Use provided TemplateManager instance or create a new one
if (options.templateManager) {
    this.logger.debug('📋 Using provided TemplateManager instance');
    this.templateManager = options.templateManager; // ✅ Use shared instance
} else {
    this.logger.debug('📋 Creating new TemplateManager instance');
    // Fallback for backward compatibility
    this.templateManager = new TemplateManager({...});
}
```

4. **Fixed method signatures** to properly pass template data through the chain.

## Expected Outcomes

✅ **Single template processing**: Default subclass template applied only once  
✅ **Clean field state**: No more contaminated inputs from double application  
✅ **Consistent template state**: Modal and note creator work with same template instance  
✅ **Backward compatibility**: Old usage patterns still work via fallback  
✅ **Better debugging**: Clear logging shows which instantiation path is taken  

## Validation
- ✅ Build compilation successful
- ✅ No TypeScript errors
- ✅ Development mode running
- 🧪 **Next**: Test modal opening to verify single default subclass application in logs

## Architecture Benefits
1. **Single source of truth** for template state
2. **Eliminates race conditions** between separate TemplateManager instances
3. **Cleaner debug output** with single template processing flow
4. **More maintainable** code with clear ownership of template lifecycle
