# Phase 2 Migration Plan Refinement

**Date:** January 20, 2025  
**Status:** Plan Updated - Ready to Begin

## Summary

Refined the Phase 2 migration plan to better separate legacy code from new code before migrating TemplateEvaluator. This will make the migration cleaner and eventual cleanup much easier.

## Key Changes to Phase 2 Plan

### Original Plan
**2.1** Modify TemplateEvaluator to use FunctionEvaluator directly

**Problems with original approach:**
- Mixed legacy and new code in same file
- Difficult to track what's old vs new
- Harder to test legacy code independently
- Cleanup would require careful code surgery
- Maintainability suffers from mixing concerns

### Refined Plan

#### 2.1 Extract Legacy Code (NEW - Added as prerequisite)
Before migrating TemplateEvaluator, first extract legacy code into dedicated modules:

**2.1a - Create FunctionEvaluatorLegacy.ts**
- Extract `evaluateFunctionDescriptor()` static method (~50 lines)
- Extract `evaluateEnhancedFunction()` method (~100 lines)
- Add format detection helpers
- Add deprecation warnings
- Isolate ALL unsafe legacy evaluation logic

**2.1b - Create QueryEvaluator.ts**
- Extract query evaluation logic (~150 lines)
- Separate WHERE/RETURN clause processing
- Independent module for query-specific concerns
- Cleaner separation from function evaluation

#### 2.2 Refactor TemplateEvaluator (Modified)
After extraction, TemplateEvaluator becomes a thin coordinator:
- Routes legacy formats → FunctionEvaluatorLegacy
- Routes new formats → FunctionEvaluator
- Delegates queries → QueryEvaluator
- Becomes ~100 lines instead of ~650 lines

#### 2.3 Migrate Metadata Templates (Unchanged)
- Create migration scripts
- Convert function descriptors
- Test thoroughly

#### 2.4 Remove Legacy Code (Enhanced)
- Simply delete FunctionEvaluatorLegacy.ts
- Remove legacy routing
- Clean, surgical removal

## Benefits of Refined Approach

### 1. Clear Code Separation
```
Before:
TemplateEvaluator.ts (650 lines)
├── New function evaluation (mixed)
├── Legacy function evaluation (mixed)
├── Query evaluation (mixed)
└── Template processing

After:
TemplateEvaluator.ts (100 lines) - Thin coordinator
FunctionEvaluator.ts (300 lines) - NEW, clean
FunctionEvaluatorLegacy.ts (200 lines) - OLD, isolated
QueryEvaluator.ts (150 lines) - Specialized
```

### 2. Easier Testing
- Test legacy code independently
- Test new code independently
- Test coordinator routing logic
- No mixed concerns in tests

### 3. Better Code Review
- Legacy extraction PR: Review moved code
- Refactoring PR: Review routing logic
- Migration PR: Review template changes
- Cleanup PR: Review deletions

Each PR has a single, clear purpose.

### 4. Simplified Cleanup
```typescript
// Phase 2.4 - Remove legacy code

// Step 1: Delete file
rm src/core/templates/FunctionEvaluatorLegacy.ts

// Step 2: Remove import and routing
// In TemplateEvaluator.ts:
- import { FunctionEvaluatorLegacy } from "./FunctionEvaluatorLegacy";  // DELETE
- if (FunctionEvaluatorLegacy.isLegacyFormat(descriptor)) {             // DELETE
-     return FunctionEvaluatorLegacy.evaluateFunctionDescriptor(...);   // DELETE
- }                                                                      // DELETE

// Done! Clean removal.
```

### 5. Explicit Deprecation
All legacy code clearly marked:
```typescript
/**
 * @deprecated Legacy function evaluator - DO NOT USE FOR NEW CODE
 * 
 * This will be REMOVED after all metadata templates are migrated.
 */
export class FunctionEvaluatorLegacy {
    // ...
}
```

Developers immediately know:
- This is old code
- Do not reference it in new code
- It will be deleted soon

### 6. Better Maintainability
Future developers can:
- See clear boundaries between old and new
- Understand migration state at a glance
- Not accidentally use legacy code
- Easily find code to update

## Module Responsibilities

### FunctionEvaluator.ts (NEW - Phase 1) ✅
**Status:** Already implemented and working  
**Purpose:** Evaluate new format function descriptors with safe contexts  
**Used by:** PathEvaluator (Phase 1), TemplateEvaluator (Phase 2.2+)

```typescript
export class FunctionEvaluator {
    // Simple expressions: { context: [...], expression: "..." }
    // Complex functions: { function: "({ ctx }) => ..." }
    // Safe context interfaces only
    // Rejects legacy formats
}
```

### FunctionEvaluatorLegacy.ts (NEW - Phase 2.1a) ⏸️
**Status:** To be created  
**Purpose:** Isolate legacy evaluation logic during migration  
**Used by:** TemplateEvaluator (Phase 2.2 only)  
**Lifetime:** Temporary - deleted in Phase 2.4

```typescript
/**
 * @deprecated DO NOT USE FOR NEW CODE
 */
export class FunctionEvaluatorLegacy {
    // Legacy format: { type: "function", value: "this.settings..." }
    // Enhanced format: { type: "function", function: "...", context: [...] }
    // UNSAFE - exposes full plugin context
    // TEMPORARY - for migration only
}
```

### QueryEvaluator.ts (NEW - Phase 2.1b) ⏸️
**Status:** To be created  
**Purpose:** Handle query evaluation separately from functions  
**Used by:** TemplateEvaluator (Phase 2.2+)  
**Lifetime:** Permanent

```typescript
export class QueryEvaluator {
    // WHERE clause processing
    // RETURN clause processing
    // Search query building
    // Result processing
}
```

### TemplateEvaluator.ts (REFACTORED - Phase 2.2) ⏸️
**Status:** To be refactored  
**Purpose:** Coordinate template evaluation (thin coordinator)  
**Used by:** Metadata template processing throughout plugin

```typescript
export class TemplateEvaluator {
    // Routes function evaluation to appropriate handler
    // Delegates query evaluation to QueryEvaluator
    // Handles template processing workflow
    // ~100 lines (down from ~650)
}
```

## Migration Path

### Phase 1 (COMPLETED) ✅
- FunctionEvaluator created
- PathEvaluator using FunctionEvaluator
- All path generation working

### Phase 2.1a (NEXT)
- Create FunctionEvaluatorLegacy.ts
- Extract legacy evaluation code
- Add deprecation warnings
- Test legacy code still works

### Phase 2.1b (NEXT)
- Create QueryEvaluator.ts
- Extract query evaluation code
- Test query evaluation still works

### Phase 2.2
- Refactor TemplateEvaluator
- Add routing logic
- Test backward compatibility
- Verify all templates work

### Phase 2.3
- Migrate metadata templates
- Update function descriptors
- Test new format templates

### Phase 2.4
- Delete FunctionEvaluatorLegacy.ts
- Remove legacy routing
- Clean up deprecated code

## File Size Estimates

### Before Extraction (Current)
- TemplateEvaluator.ts: ~650 lines (mixed concerns)

### After Extraction (Phase 2.2)
- TemplateEvaluator.ts: ~100 lines (coordinator)
- FunctionEvaluatorLegacy.ts: ~200 lines (isolated)
- QueryEvaluator.ts: ~150 lines (specialized)
- **Total:** ~450 lines (cleaner separation)

### After Cleanup (Phase 2.4)
- TemplateEvaluator.ts: ~100 lines
- QueryEvaluator.ts: ~150 lines
- **Total:** ~250 lines (legacy removed)

**Net reduction:** 650 → 250 lines (~60% reduction)

## Testing Strategy

### Phase 2.1a Tests
- Legacy function evaluation works
- Enhanced function evaluation works
- Format detection works
- Deprecation warnings show

### Phase 2.1b Tests
- Query evaluation works
- WHERE clause processing works
- RETURN clause processing works
- Search integration works

### Phase 2.2 Tests
- Routing logic works
- Legacy templates still work
- New templates work
- Backward compatibility maintained

### Phase 2.3 Tests
- Converted templates work
- All note types functional
- Production scenarios tested

### Phase 2.4 Tests
- All tests still pass
- No legacy references remain
- Build succeeds

## Documentation Updates

### Phase 2.1
- Add FunctionEvaluatorLegacy.ts JSDoc
- Add QueryEvaluator.ts JSDoc
- Mark legacy methods as deprecated

### Phase 2.2
- Update TemplateEvaluator.ts documentation
- Add migration guide

### Phase 2.3
- Document new function descriptor format
- Add migration examples
- Update template documentation

### Phase 2.4
- Remove legacy documentation
- Add "Migration Complete" notes
- Update architecture docs

## Risk Mitigation

### Extraction Phase (2.1)
**Risk:** Break existing functionality  
**Mitigation:** 
- Move code, don't change logic
- Comprehensive tests
- Test with existing templates

### Refactoring Phase (2.2)
**Risk:** Routing logic errors  
**Mitigation:**
- Simple routing (just delegate)
- Test both paths
- Backward compatibility tests

### Migration Phase (2.3)
**Risk:** Template conversion errors  
**Mitigation:**
- Automated migration script
- Manual review
- Gradual rollout (one template at a time)

### Cleanup Phase (2.4)
**Risk:** Accidentally break something  
**Mitigation:**
- All templates already migrated
- Comprehensive test suite
- Easy rollback (git revert)

## Success Criteria

### Phase 2.1 Complete When:
- [ ] FunctionEvaluatorLegacy.ts created
- [ ] QueryEvaluator.ts created
- [ ] All tests passing
- [ ] Existing templates still work

### Phase 2.2 Complete When:
- [ ] TemplateEvaluator refactored
- [ ] Routing logic tested
- [ ] Backward compatibility verified
- [ ] Code review approved

### Phase 2.3 Complete When:
- [ ] All metadata templates migrated
- [ ] All templates tested
- [ ] Production use verified
- [ ] Documentation updated

### Phase 2.4 Complete When:
- [ ] Legacy code deleted
- [ ] All tests passing
- [ ] Documentation updated
- [ ] No deprecation warnings

## Conclusion

This refined approach to Phase 2 provides:
- ✅ Clearer code organization
- ✅ Easier migration path
- ✅ Better testability
- ✅ Simpler cleanup
- ✅ Improved maintainability

By extracting legacy code first, we create clear boundaries between old and new, making the migration safer and the eventual cleanup trivial.

**Status:** Ready to begin Phase 2.1a - Create FunctionEvaluatorLegacy.ts

---

*Last Updated: January 20, 2025*  
*Next Step: Create FunctionEvaluatorLegacy.ts*
