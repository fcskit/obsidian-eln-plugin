# Template System Improvements - Summary

## Your Concerns Addressed

### 1. ✅ Phased Migration Approach
**Your concern:** Implementing everything at once risks breaking working parts.

**Solution:** Three-phase migration plan focusing on:
- **Phase 1:** Fix broken functionality (fileName/folderPath) + low-hanging fruit (key renames) + security improvements
- **Phase 2:** Template modernization
- **Phase 3:** Advanced features (subclasses, import/export)

See: `template-migration-plan.md`

---

### 2. ✅ Security & Modularity in Context Access
**Your concern:** 
> "Currently we allow 'plugin' in the context, which gives full access to the plugin object, although we just need it to get the version. This may be potentially unsafe and may allow injection of unsafe code."

**Solution:** Safe context interfaces that limit access:

```typescript
// ❌ OLD - Unsafe
context: ["plugin"]
// Gives access to: plugin.app.vault.delete(), plugin.settings (writable), etc.

// ✅ NEW - Safe
interface PluginContext {
    version: string;
    manifest: { version: string; id: string; name: string };
    // No access to dangerous methods
}

interface FileSystemContext {
    listFiles(filter?: {...}): ReadonlyArray<{...}>;
    getNextCounter(prefix: string): string;
    fileExists(path: string): boolean;
    // No write/delete operations
}
```

**Each context is a controlled interface:**
- `plugin` → `PluginContext` (metadata only)
- `settings` → `SettingsContext` (read-only safe access)
- `fs` → `FileSystemContext` (limited safe operations)
- `vault` → `VaultContext` (safe query operations)
- `noteMetadata` → `NoteMetadataContext` (read-only access to other notes)

**Future:** A separate `userFunction` context could provide unrestricted access for power users who understand the risks.

See: `template-migration-plan.md` → Phase 1.1

---

### 3. ✅ Dual Function Syntax Support
**Your concerns:**
1. Remove `${}` (template literal confusion)
2. Support both simple expressions AND complex functions (array/object construction)
3. Reduce redundancy by inferring context from arrow function parameters

**Solution:** Support TWO complementary syntaxes:

#### Syntax 1: Simple Expression (explicit context)
```typescript
// ✅ NEW - Clean for simple cases
{
    context: ["settings", "userInput"],
    expression: "settings.operators[userInput.sample.operator].initials"
}
```

**Use for:** Simple value access, calculations, method calls

#### Syntax 2: Complex Function (inferred context)
```typescript
// ✅ NEW - Powerful for complex cases
{
    function: "({ userInput }) => [`sample/${userInput.sample.type.replace(/\\s/g, '_')}`]",
    reactiveDeps: ["sample.type"],
    fallback: ["sample/unknown"]
}
```

**Use for:** Array/object construction, multiple statements, complex logic

**Context inference:** Parser extracts `["userInput"]` from `({ userInput })` parameters

**Benefits:**
- ✅ Simple cases remain simple with `expression`
- ✅ Complex cases use familiar arrow function syntax
- ✅ No redundancy - function parameters define the context
- ✅ Flexibility - use the right tool for the job

See: `function-syntax-clarification.md` for complete explanation

---

## Quick Reference: What Changes in Phase 1

### Type Definitions
```typescript
// OLD
interface PathTemplate = Array<{ type: string; field: string; separator?: string }>;
interface MetadataField {
    query: boolean;
    // ...
}

// NEW
interface PathTemplate {
    segments: PathSegment[];
}

type PathSegment = 
    | { kind: "literal"; value: string; separator?: string }
    | { kind: "field"; path: string; transform?: string; separator?: string }
    | { kind: "function"; context: string[]; expression: string; separator?: string }
    | { kind: "counter"; prefix?: string; width?: number; separator?: string };

interface MetadataField {
    showInModal: boolean;  // Renamed from 'query'
    // ...
}
```

### Settings
```typescript
// OLD
note: {
    sample: {
        titleTemplate: [...],
        folderTemplate: [...]
    }
}

// NEW
note: {
    sample: {
        fileName: { segments: [...] },
        folderPath: { segments: [...] }
    }
}
```

### Template Example
```typescript
// OLD (broken)
titleTemplate: [
    { type: 'userInput', field: "sample.name", separator: "-" }
]

// NEW (working + safe)
fileName: {
    segments: [
        { kind: "field", path: "userInput.sample.name", separator: "-" }
    ]
}
```

### Function Example
```typescript
// OLD (unsafe + redundant)
{
    type: 'function',
    field: "this.settings.operators[this.userInput.sample.operator].initials"
}

// NEW (safe + clean)
{
    kind: "function",
    context: ["settings", "userInput"],
    expression: "settings.operators[userInput.sample.operator].initials"
}
```

---

## Implementation Order

### Week 1: Foundation
1. Create `ContextProviders.ts` with safe interfaces
2. Create `PathEvaluator.ts` with segment evaluation
3. Update type definitions
4. Write unit tests

### Week 2: Integration
5. Update `NoteCreator.ts` to use new PathEvaluator
6. Create migration utilities for key renames
7. Test with real vault data

### Week 3: Template Updates
8. Update all metadata templates (query → showInModal)
9. Update default settings
10. Update documentation

### Week 4: Refinement
11. Fix any edge cases
12. Performance optimization
13. Final testing

---

## Files Changed in Phase 1

### New Files
- ✅ `src/core/templates/ContextProviders.ts`
- ✅ `src/core/templates/PathEvaluator.ts`
- ✅ `src/utils/migrations/renameTemplateKeys.ts`
- ✅ `tests/unit/PathEvaluator.test.ts`
- ✅ `tests/unit/ContextProviders.test.ts`

### Modified Files
- ✅ `src/types/templates.ts` - New path segment types
- ✅ `src/types/settings.ts` - Rename keys
- ✅ `src/settings/settings.ts` - Update defaults
- ✅ `src/core/notes/NoteCreator.ts` - Use PathEvaluator
- ✅ `src/main.ts` - Run migrations on load
- ✅ All `src/data/templates/metadata/*.ts` - Rename query → showInModal

### Documentation
- ✅ `docs/developer/template-syntax-analysis.md` - Design rationale
- ✅ `docs/developer/template-migration-plan.md` - Implementation guide
- ✅ `docs/developer/template-improvements-summary.md` - This file

---

## Benefits Summary

### Security
- ✅ Safe, controlled context access
- ✅ No direct plugin/vault manipulation
- ✅ Validated property access

### Simplicity
- ✅ Cleaner function syntax (no arrow boilerplate)
- ✅ No ambiguity in property paths
- ✅ Declarative, template-like feel

### Consistency
- ✅ Unified segment structure for both fileName and folderPath
- ✅ Clear discriminated unions
- ✅ Predictable behavior

### Maintainability
- ✅ Type-safe interfaces
- ✅ Easy to extend with new segment types
- ✅ Clear separation of concerns

### Extensibility
- ✅ Easy to add new context types
- ✅ Support for transforms
- ✅ Foundation for import/export

---

## Next Steps

1. Review and approve the design
2. Start implementing Phase 1.1 (ContextProviders)
3. Continue with Phase 1.2 (PathEvaluator)
4. Test thoroughly with existing vault data
5. Roll out gradually with user testing

Any questions or concerns? This is your chance to refine before we start coding! 🚀
