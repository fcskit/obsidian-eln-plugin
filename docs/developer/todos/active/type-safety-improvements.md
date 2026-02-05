# Type Safety Improvements

> **Status:** Planned for v0.7.1 (Post-Beta)  
> **Priority:** High  
> **Estimated Effort:** 2-3 weeks  
> **Last Updated:** February 2, 2026

## 📋 Overview

This document outlines a comprehensive plan to improve type safety throughout the Obsidian ELN Plugin codebase by replacing generic `Record<string, any>` and `Record<string, unknown>` types with specific, well-defined TypeScript interfaces.

### Motivation

**Current State:** The codebase uses generic `Record` types extensively (~150+ occurrences):
- `Record<string, any>` - ESLint warning: "Unexpected any"
- `Record<string, unknown>` - Too permissive, loses type information

**Problems:**
1. **Loss of Type Safety** - No compile-time guarantees about object structure
2. **Poor IDE Support** - No autocomplete or IntelliSense for nested properties
3. **Runtime Errors** - Typos and invalid property access not caught until runtime
4. **Code Maintainability** - Unclear what structure objects should have
5. **Refactoring Risk** - Breaking changes not caught by type checker

**Benefits of This Work:**
- ✅ **Compile-Time Safety** - Catch errors before they reach users
- ✅ **Better Developer Experience** - Full IDE autocomplete and hints
- ✅ **Self-Documenting Code** - Types serve as inline documentation
- ✅ **Easier Refactoring** - TypeScript catches all affected code
- ✅ **Reduced Bugs** - Many common errors prevented at compile time

---

## 🎯 Implementation Plan

### Priority Levels

**🔴 High Priority** - User-facing data, frequently used  
**🟡 Medium Priority** - Internal structures, moderate usage  
**🟢 Low Priority** - Utilities, infrequent usage

---

## 1️⃣ Replace Generic Records with FormData Type
**Priority:** 🔴 High | **Effort:** Low | **Risk:** Low

### Current State

```typescript
// processMarkdownTemplate.ts
export function processMarkdownTemplate(
    template: string,
    noteTitle: string,
    userData: Record<string, any>,  // ❌ Generic, no type safety
    folderPath?: string
): string
```

### Target State

```typescript
import { FormData } from "../../types/forms";

export function processMarkdownTemplate(
    template: string,
    noteTitle: string,
    userData: FormData,  // ✅ Specific type
    folderPath?: string
): string
```

### Existing Type Definition

We already have a proper `FormData` type in `src/types/forms.ts`:

```typescript
export type FormFieldValue = 
    | string 
    | number 
    | boolean 
    | null 
    | Date 
    | string[] 
    | number[] 
    | boolean[]
    | Date[]
    | { [key: string]: FormFieldValue };

export type FormData = {
    [key: string]: FormFieldValue;
};
```

### Files to Update

**High Priority:**
- ✅ `src/data/templates/processMarkdownTemplate.ts` - userData parameter
- ✅ `src/ui/modals/notes/NewNoteModal.ts` - userInputs, data properties
- ✅ `src/ui/modals/components/UniversalObjectRenderer.ts` - evaluateFunction callbacks
- ✅ `src/core/notes/NewNote.ts` - initialData parameter

**Medium Priority:**
- `src/core/templates/TemplateEvaluator.ts` - userData parameters
- `src/core/templates/FunctionEvaluator.ts` - userData in context
- `src/core/notes/NoteCreator.ts` - userData handling

### Implementation Steps

1. Import `FormData` type in each file
2. Replace `Record<string, any>` → `FormData` for user input parameters
3. Replace `Record<string, unknown>` → `FormData` where appropriate
4. Run `npm run build` to check for type errors
5. Fix any newly discovered type issues
6. Test all note creation workflows

### Validation

- [ ] All note types can be created successfully
- [ ] User input properly typed throughout flow
- [ ] No TypeScript errors
- [ ] IDE autocomplete works for userData properties

---

## 2️⃣ Create MetadataStructure Type for Frontmatter
**Priority:** 🔴 High | **Effort:** Medium | **Risk:** Medium

### Current State

```typescript
// ContextProviders.ts
get(noteNameOrPath: string): Record<string, unknown> | null  // ❌ No structure
```

### Target State

```typescript
export type MetadataStructure = {
    // Standard fields
    "ELN version"?: string;
    cssclasses?: string[];
    "date created"?: string;
    author?: string;
    "note type"?: string;
    tags?: string[];
    
    // Note-specific fields (dynamic)
    [key: string]: FormFieldValue;
};

// Usage
get(noteNameOrPath: string): MetadataStructure | null  // ✅ Structured
```

### Design Considerations

**Challenge:** Metadata structure varies by note type.

**Solution:** Use intersection types for note-specific metadata:

```typescript
// Base metadata (common to all notes)
export interface BaseMetadata {
    "ELN version": string;
    cssclasses: string[];
    "date created": string;
    author: string;
    "note type": string;
    tags: string[];
}

// Sample-specific
export interface SampleMetadata extends BaseMetadata {
    "note type": "sample";
    project: {
        name: string;
        type: string;
        link: string;
    };
    sample: {
        name: string;
        operator: string;
        type: string;
        description: string;
        // ... more fields
    };
}

// Analysis-specific
export interface AnalysisMetadata extends BaseMetadata {
    "note type": "analysis";
    analysis: {
        method: string;
        operator: string;
        status: string;
        // ... more fields
    };
}

// Union type for all possible metadata structures
export type AnyNoteMetadata = 
    | SampleMetadata 
    | AnalysisMetadata 
    | ProjectMetadata
    // ... other types

// Generic metadata (when type unknown)
export type MetadataStructure = BaseMetadata & {
    [key: string]: FormFieldValue;
};
```

### Files to Update

**Core:**
- `src/core/templates/ContextProviders.ts` - noteMetadata.get() return type
- `src/core/notes/NoteCreator.ts` - metadata parameters
- `src/core/templates/TemplateManager.ts` - metadata handling
- `src/search/QueryEngine.ts` - frontmatter parameter

**Secondary:**
- Any file using `Record<string, unknown>` for frontmatter

### Implementation Steps

1. Create `src/types/metadata.ts` with type definitions
2. Define `BaseMetadata` interface with common fields
3. Create note-specific metadata interfaces (Sample, Analysis, etc.)
4. Export union type `AnyNoteMetadata`
5. Update `ContextProviders.ts` to return `MetadataStructure | null`
6. Update other files incrementally
7. Add JSDoc comments with examples

### Validation

- [ ] noteMetadata.get() properly typed
- [ ] Autocomplete works for common metadata fields
- [ ] Query operations work with typed metadata
- [ ] No regression in note creation

---

## 3️⃣ Create TemplateFieldConfig Type
**Priority:** 🔴 High | **Effort:** Medium | **Risk:** Low

### Current State

```typescript
// UniversalObjectRenderer.ts
private renderField(
    container: HTMLElement,
    config: FieldRenderingConfig,
    templateField?: Record<string, unknown>  // ❌ No structure
): void
```

### Target State

```typescript
export interface TemplateFieldConfig {
    query: boolean;
    inputType: string;
    default?: FormFieldValue | FunctionDescriptor;
    options?: string[] | FunctionDescriptor;
    placeholder?: string;
    multiline?: boolean;
    
    // Query-specific
    search?: string;
    where?: QueryWhereClause;
    return?: QueryReturnClause;
    
    // List-specific
    listType?: "string" | "number" | "object";
    initialItems?: number;
    objectTemplate?: Record<string, TemplateFieldConfig>;
    
    // Number-specific
    units?: string[];
    defaultUnit?: string;
    
    // Callbacks
    callback?: string | FunctionDescriptor;
    action?: string | FunctionDescriptor;
    
    // Reactive
    reactiveDeps?: string[];
    
    // EditableObject-specific
    editableKey?: boolean;
    editableUnit?: boolean;
    allowTypeSwitch?: boolean;
    removeable?: boolean;
}

// Usage
templateField?: TemplateFieldConfig  // ✅ Fully typed
```

### Files to Update

- `src/ui/modals/components/UniversalObjectRenderer.ts` - Primary user
- `src/core/templates/TemplateManager.ts` - Template processing
- `src/core/templates/TemplateEvaluator.ts` - Field evaluation

### Implementation Steps

1. Create `src/types/template-fields.ts`
2. Define `TemplateFieldConfig` interface with all possible properties
3. Create sub-interfaces for specific field types if needed
4. Update UniversalObjectRenderer method signatures
5. Update template processing code
6. Add comprehensive JSDoc documentation

### Validation

- [ ] All inputType values properly handled
- [ ] Autocomplete works for templateField properties
- [ ] No TypeScript errors in template processing
- [ ] All field types render correctly

---

## 4️⃣ Improve Subclass Template Type Definitions
**Priority:** 🟡 Medium | **Effort:** Low | **Risk:** Low

### Current State

```typescript
// sampletypes/sampletypes.ts
export const sampleTypesMetadataTemplates: Record<string, any> = {
    "compound": compoundSubclassMetadataTemplate,
    "electrode": electrodeSubclassMetadataTemplate,
    // ...
};
```

### Target State

```typescript
import { SubclassMetadataTemplate } from "../metadataTemplates";

export const sampleTypesMetadataTemplates: Record<string, SubclassMetadataTemplate> = {
    "compound": compoundSubclassMetadataTemplate,
    "electrode": electrodeSubclassMetadataTemplate,
    // ...
};
```

### Existing Type

We already have `SubclassMetadataTemplate` defined in `src/data/templates/metadataTemplates.ts`:

```typescript
export interface SubclassMetadataTemplate {
    add?: SubclassAddField[];
    remove?: string[];
    replace?: SubclassReplaceField[];
}
```

### Files to Update

- `src/data/templates/metadata/projecttypes/projecttypes.ts`
- `src/data/templates/metadata/sampletypes/sampletypes.ts`
- `src/data/templates/metadata/chemtypes/chemtypes.ts`

### Implementation Steps

1. Import `SubclassMetadataTemplate` in each file
2. Update export type annotation
3. Verify all exported templates match the interface
4. Run build to check for compliance

### Validation

- [ ] No TypeScript errors
- [ ] All subclass templates properly typed
- [ ] Subclass selection and rendering works

---

## 5️⃣ Type Context Provider Methods
**Priority:** 🟡 Medium | **Effort:** Medium | **Risk:** Low

### Current State

```typescript
query(filter): Array<Record<string, unknown>>  // ❌ Generic array
```

### Target State

```typescript
export interface NoteQueryResult {
    file: {
        name: string;
        path: string;
        link: string;
    };
    frontmatter: MetadataStructure;
}

query(filter): Array<NoteQueryResult>  // ✅ Specific type
```

### Additional Types Needed

```typescript
export interface NoteFrontmatter extends MetadataStructure {
    // Extends MetadataStructure with any additional properties
}

export interface FileInfo {
    name: string;
    path: string;
    link: string;
    basename: string;
    extension: string;
}

export interface NoteContext {
    file: FileInfo;
    frontmatter: NoteFrontmatter;
}
```

### Files to Update

- `src/core/templates/ContextProviders.ts` - All context provider methods
- `src/core/templates/FunctionEvaluator.ts` - Context handling
- `src/search/QueryEngine.ts` - Query results

### Implementation Steps

1. Create types in `src/types/context.ts`
2. Update ContextProviders interface
3. Update NoteMetadataProvider implementation
4. Update FunctionEvaluator to use typed contexts
5. Update QueryEngine

### Validation

- [ ] Context providers properly typed
- [ ] Function evaluation works with typed contexts
- [ ] Query results properly typed

---

## 6️⃣ Fix PathTemplateParser.ts Any Types
**Priority:** 🟡 Medium | **Effort:** Low | **Risk:** Low

### Current State

```typescript
context?: Record<string, any>  // ❌ Uses 'any'
function getFieldValue(field: string, context: Record<string, any>): any
```

### Target State

```typescript
context?: FormData  // ✅ Proper type
function getFieldValue(field: string, context: FormData): FormFieldValue
```

### Note

PathTemplateParser.ts may be legacy code that should be reviewed for deprecation. If still in use, update types. If deprecated, document and consider removal.

### Files to Update

- `src/core/templates/PathTemplateParser.ts`

### Implementation Steps

1. Check if file is still in use
2. If yes: Replace `any` with `FormData` and `FormFieldValue`
3. If no: Add deprecation notice and plan removal
4. Update tests if needed

---

## 7️⃣ Create SettingsItem Type for ENLSettingTab
**Priority:** 🟢 Low | **Effort:** Low | **Risk:** Low

### Current State

```typescript
private createEditableList<T extends Record<string, unknown>>(
    // Generic type, no structure
)
```

### Target State

```typescript
export interface AuthorItem {
    name: string;
    initials: string;
}

export interface OperatorItem {
    name: string;
    initials: string;
}

export interface NoteTypeItem {
    name: string;
    abbreviation?: string;
    subClassMetadataTemplate?: SubclassMetadataTemplate;
}

// Usage
private createEditableList<AuthorItem>(
    // Properly typed
)
```

### Files to Update

- `src/settings/ENLSettingTab.ts`
- `src/settings/settings.ts` - Settings interface definitions

### Implementation Steps

1. Create interfaces in `src/types/settings.ts`
2. Update GeneralConfig interface to use specific types
3. Update ENLSettingTab method signatures
4. Update settings UI rendering code

---

## 8️⃣ Type Nested Value Manipulation Utilities
**Priority:** 🟢 Low | **Effort:** Medium | **Risk:** Low

### Current State

```typescript
private getNestedValue(obj: Record<string, unknown>, path: string): unknown
private setNestedValue(obj: Record<string, unknown>, path: string[], value: unknown): void
```

### Target State

```typescript
// Generic utility with type preservation
function getNestedValue<T = unknown>(obj: Record<string, unknown>, path: string): T | undefined

// Type-safe setter
function setNestedValue<T>(obj: Record<string, T>, path: string[], value: T): void

// Specialized versions
function getNestedFormValue(data: FormData, path: string): FormFieldValue | undefined
function getNestedMetadata(metadata: MetadataStructure, path: string): FormFieldValue | undefined
```

### Implementation Strategy

Create a utility module with type-safe versions:

```typescript
// src/utils/object-utils.ts
export class ObjectUtils {
    static getNestedValue<T = unknown>(
        obj: Record<string, unknown>, 
        path: string
    ): T | undefined {
        // Implementation
    }
    
    static setNestedValue(
        obj: Record<string, unknown>, 
        path: string[], 
        value: unknown
    ): void {
        // Implementation
    }
    
    // Form-specific utilities
    static getFormValue(
        data: FormData, 
        path: string
    ): FormFieldValue | undefined {
        return this.getNestedValue<FormFieldValue>(data, path);
    }
}
```

### Files to Update

Multiple files use these utilities. Consider:
1. Creating centralized utility module
2. Migrating all usage to centralized version
3. Deprecating local implementations

---

## 9️⃣ Review and Type Experimental Features
**Priority:** 🟢 Low | **Effort:** Low | **Risk:** Low

### Experimental Files

- `src/data/templates/notes/sample.ts` - Unified note template
- `src/data/templates/notes/sample_sclasses.ts` - Unified subclass templates

### Current Status

These files intentionally use `Record<string, unknown>` as they're exploratory work for future unified template system (v0.8.0).

### Action Items

1. **Document Intent:**
   - Add clear comments explaining experimental nature
   - Link to ROADMAP.md section on unified templates
   - Note that types may change in v0.8.0

2. **Consider Improvements:**
   - Create draft interfaces for unified template structure
   - Document expected structure in comments
   - Add examples in JSDoc

3. **Future Work:**
   - When implementing unified templates (v0.8.0), create proper types
   - Migrate existing templates to new structure
   - Remove experimental files

### Example Documentation

```typescript
/**
 * EXPERIMENTAL: Unified Note Template Structure
 * 
 * This is an experimental structure for v0.8.0 that combines
 * settings, metadata, and markdown templates in a single file.
 * 
 * Current Status: Exploratory/Reference Implementation
 * Target: v0.8.0
 * Tracking: See ROADMAP.md "Unified Template System"
 * 
 * NOTE: Types are intentionally flexible as structure is still being
 * refined. Proper type definitions will be created in v0.8.0.
 * 
 * @see docs/developer/ROADMAP.md#unified-template-system-v080
 */
interface NoteTemplate {
    // ...
}
```

---

## 🔟 Enable Stricter TypeScript Linting Rules
**Priority:** 🟢 Low | **Effort:** Low | **Risk:** Low

### Current ESLint Configuration

After completing items 1-9, enable stricter rules to prevent regression.

### Proposed Rule Updates

```jsonc
// .eslintrc.json
{
    "rules": {
        // Error on explicit 'any' usage
        "@typescript-eslint/no-explicit-any": "error",
        
        // Warn on unsafe assignments
        "@typescript-eslint/no-unsafe-assignment": "warn",
        
        // Warn on unsafe member access
        "@typescript-eslint/no-unsafe-member-access": "warn",
        
        // Warn on unsafe function calls
        "@typescript-eslint/no-unsafe-call": "warn",
        
        // Warn on unsafe return values
        "@typescript-eslint/no-unsafe-return": "warn",
        
        // Require explicit return types on exported functions
        "@typescript-eslint/explicit-module-boundary-types": "warn"
    }
}
```

### Gradual Enforcement

1. **Phase 1:** Enable rules with "warn" level
2. **Phase 2:** Fix all warnings
3. **Phase 3:** Promote to "error" level
4. **Phase 4:** Enable additional strict checks

### Exceptions

Some cases may require `// eslint-disable-next-line` with justification:
- External library interfaces that use `any`
- Complex type transformations
- Temporary compatibility code

---

## 📊 Progress Tracking

### Completion Checklist

- [ ] **Item 1:** FormData type replacement
- [ ] **Item 2:** MetadataStructure type creation
- [ ] **Item 3:** TemplateFieldConfig type creation
- [ ] **Item 4:** Subclass template types
- [ ] **Item 5:** Context provider types
- [ ] **Item 6:** PathTemplateParser fixes
- [ ] **Item 7:** SettingsItem types
- [ ] **Item 8:** Nested value utilities
- [ ] **Item 9:** Experimental feature documentation
- [ ] **Item 10:** Stricter linting rules

### Success Metrics

- ✅ Zero `Record<string, any>` in codebase
- ✅ Less than 10 `Record<string, unknown>` (only where truly dynamic)
- ✅ No TypeScript errors with strict checks enabled
- ✅ No ESLint warnings for type safety rules
- ✅ 100% of public APIs have explicit types
- ✅ IDE autocomplete works throughout codebase

---

## 🛠️ Development Workflow

### For Each Item

1. **Create Feature Branch**
   ```bash
   git checkout -b type-safety/item-X-description
   ```

2. **Implement Changes**
   - Create/update type definitions
   - Update affected files
   - Add JSDoc documentation

3. **Validate**
   ```bash
   npm run build          # Check TypeScript compilation
   npm run lint           # Check ESLint compliance
   npm run test           # Run test suite (when available)
   ```

4. **Test Manually**
   - Test affected features in test vault
   - Verify IDE autocomplete
   - Check for regressions

5. **Commit & PR**
   - Clear commit message
   - Reference this document
   - Request code review

### Testing Strategy

Each item should include:
- [ ] TypeScript compilation passes
- [ ] No new ESLint warnings
- [ ] Manual testing of affected features
- [ ] Documentation updated
- [ ] Examples added (if applicable)

---

## 📚 Resources

### TypeScript Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Advanced Types](https://www.typescriptlang.org/docs/handbook/advanced-types.html)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

### ESLint TypeScript
- [typescript-eslint Rules](https://typescript-eslint.io/rules/)
- [Type-Aware Linting](https://typescript-eslint.io/linting/typed-linting)

### Project Resources
- [FormData Type Definition](../../src/types/forms.ts)
- [Template Types](../../src/types/templates.ts)
- [Settings Types](../../src/settings/settings.ts)

---

## 🤝 Questions & Discussion

If you have questions about this plan:
- Open a GitHub Discussion
- Tag with `type-safety` label
- Reference specific item number

**Maintainer:** Review and update this document as work progresses.

---

**Last Updated:** February 2, 2026  
**Next Review:** After v0.7.0-beta.1 release
