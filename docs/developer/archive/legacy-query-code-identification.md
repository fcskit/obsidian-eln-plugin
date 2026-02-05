# Legacy Query Code Identification

## Files Containing Query Logic

### Core Query Execution
1. **`src/core/templates/QueryEvaluator.ts`**
   - Main query execution engine
   - `executeQuery()` - Executes queries with where/return clauses
   - `parseReturnClause()` - Parses old "return" syntax
   - `extractReturnFields()` - Extracts field mappings
   - **Action**: Keep as-is, still needed for old syntax

2. **`src/core/templates/TemplateEvaluator.ts`**
   - Wrapper around QueryEvaluator
   - Provides interface for template query execution
   - **Action**: Keep as-is, add new methods for new syntax

3. **`src/core/templates/TemplateManager.ts`**
   - `processQueryDropdownReturns()` - Processes old return syntax (lines 486-502)
   - `findQueryDropdownFields()` - Finds queryDropdown fields (lines 507+)
   - **Action**: Keep existing methods, add new ones for new syntax

### Type Definitions
4. **`src/types/templates.ts`**
   - `QueryReturnClause` type (line 351)
   - InputType unions including "queryDropdown" and "multiQueryDropdown"
   - **Action**: Keep existing, add new types for new syntax

### Template Usage
5. **Multiple template files** use old syntax:
   - `src/data/templates/metadata/sample.ts` - queryDropdown and multiQueryDropdown
   - `src/data/templates/metadata/analysis.ts` - multiple queryDropdowns
   - `src/data/templates/metadata/sampletypes/electrochemCell.ts` - 6 queryDropdowns
   - `src/data/templates/metadata/sampletypes/compound.ts` - queryDropdown
   - `src/data/templates/metadata/sampletypes/electrode.ts` - queryDropdown
   - Others...
   - **Action**: Migrate one by one to new syntax

## Migration Strategy

### Phase 1: Add New Infrastructure (Parallel)
✅ **DO NOT rename existing files** - they work and are needed

**Instead, ADD new files:**
- ✅ `src/types/QueryMapping.ts` - New type definitions
- ✅ `src/core/templates/QueryMappingParser.ts` - New syntax parser
- ✅ `src/core/templates/TypeInferenceEngine.ts` - Dynamic field inference
- ⏳ `src/core/templates/QueryExecutor.ts` - New query execution (wraps QueryEvaluator)
- ⏳ `src/core/templates/MappingApplicator.ts` - Apply mappings with transforms

### Phase 2: Extend Existing Files
**Modify these files to support BOTH syntaxes:**

**`TemplateManager.ts`:**
```typescript
// Keep existing methods:
// - processQueryDropdownReturns() [OLD SYNTAX]
// - findQueryDropdownFields() [BOTH]
// - processQueryDropdownField() [OLD SYNTAX]

// Add new methods:
// + processQueryDropdownReturnsNew() [NEW SYNTAX]
// + applyDynamicFields() [NEW SYNTAX]
// + removeDynamicFields() [NEW SYNTAX]
// + handleQuerySelectionChange() [NEW SYNTAX]
```

**`TemplateEvaluator.ts`:**
```typescript
// Keep existing:
// - executeQuery() [OLD SYNTAX]
// - extractReturnFields() [OLD SYNTAX]

// Add new:
// + executeQueryWithMapping() [NEW SYNTAX]
// + applyMapping() [NEW SYNTAX]
```

**`src/types/templates.ts`:**
```typescript
// Keep existing:
// - QueryReturnClause [OLD]
// - QueryWhereClause [OLD]

// Add imports from new types:
// + import { QueryConfig, Mapping, MappingField } from './QueryMapping';
```

### Phase 3: Router Logic
**Add syntax detection in TemplateManager:**
```typescript
private async processQueryDropdownReturns(data: FormData): Promise<FormData> {
    const queryDropdownFields = this.findQueryDropdownFields(this.currentTemplate);
    
    for (const fieldInfo of queryDropdownFields) {
        // DETECT SYNTAX VERSION
        if (QueryMappingParser.isNewSyntax(fieldInfo.fieldConfig)) {
            // Route to new handler
            await this.processQueryDropdownFieldNew(fieldInfo, resultData);
        } else if (QueryMappingParser.isLegacySyntax(fieldInfo.fieldConfig)) {
            // Route to old handler
            await this.processQueryDropdownField(fieldInfo, resultData);
        } else {
            logger.error('Unknown query syntax:', fieldInfo);
        }
    }
    
    return resultData;
}
```

### Phase 4: Template Migration
**Migrate templates one at a time:**
1. Start with `electrochemCell.ts` (already has TODOs, good test case)
2. Test thoroughly
3. Move to next template
4. Repeat

**Migration order (suggested):**
1. `sampletypes/electrochemCell.ts` - 6 queries, good complexity
2. `sampletypes/compound.ts` - 1 query
3. `sampletypes/electrode.ts` - 1 query
4. `metadata/sample.ts` - 2 queries
5. `metadata/analysis.ts` - 4 queries
6. Others...

### Phase 5: Cleanup (Future)
**Once ALL templates use new syntax:**
- Mark old methods as `@deprecated`
- Add warnings when old syntax detected
- Eventually remove old syntax support (version 1.0?)

## Summary

**DO NOT rename anything to *Legacy.ts yet!**

Instead:
1. ✅ Add new files alongside existing ones
2. ✅ Extend existing files with new methods
3. ✅ Use syntax detection to route to correct handler
4. ✅ Migrate templates gradually
5. ⏳ Deprecate old syntax later (not remove)

This way:
- ✅ Plugin continues working during development
- ✅ Can test new syntax without breaking existing
- ✅ Can roll back if needed
- ✅ Clean migration path
- ✅ Can ship partially migrated (stable)

## Next Steps

1. Create new type definitions (`QueryMapping.ts`)
2. Create parser (`QueryMappingParser.ts`)
3. Create inference engine (`TypeInferenceEngine.ts`)
4. Extend TemplateManager with new methods
5. Add syntax detection router
6. Test with electrochemCell template (convert to new syntax)
7. Continue migrating other templates

**Status: Ready to start implementation! 🚀**
