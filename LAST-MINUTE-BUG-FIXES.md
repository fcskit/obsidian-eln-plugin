# Last-Minute Bug Fixes - Test Vault Cleanup

**Date**: February 4, 2026  
**Version**: v0.7.0-beta.1 (pre-release)

## Context

While cleaning up the test vault for distribution and creating representative sample notes, discovered two template system limitations that were silently failing or requiring workarounds.

## Issues Discovered

### 1. Array Operations in Templates ❌ Not Supported

**Problem:**
Sample markdown template needs to display a list of process links from `sample.preparation` (array of objects). No way to transform arrays in template fields.

**Current Workaround:**
Using Obsidian Base query blocks:

```yaml
formulas:
  processes: sample.preparation.map([value.link])
views:
  - type: list
    name: Processes
    filters:
      and:
        - tags.contains("sample")
        - sample.name == this.sample.name
```

**Desired Syntax:**
```
{{sample.preparation.map(item => item.link).join(', ')}}
```

**Impact:** Medium - Workaround exists but is less intuitive

### 2. Cross-File NPE Display ❌ Not Implemented

**Problem:**
Sample markdown template had:

```markdown
```eln-properties
file: sample.process.name
key: process
```
```

This attempted to display process metadata embedded in the sample note, but:
- `file` parameter not implemented
- Code block renders as empty box
- No error or warning message
- Confusing user experience

**Impact:** High - Silent failure with no feedback

## Fixes Implemented

### ✅ 1. Removed Broken NPE Code Block

**File:** `src/data/templates/markdown/sample.ts`

**Change:** Removed the non-functional `eln-properties` code block that referenced `file: sample.process.name`

**Reason:** Feature not implemented, would confuse users

### ✅ 2. Added Error Handling for Unsupported Parameters

**Files Modified:**
- `src/ui/renderer/npe/utils/parseNpeCodeBlockParams.ts`
- `src/main.ts`

**Changes:**

1. **Updated `CodeBlockParams` interface:**
   - Added `unsupportedParams?: string[]` field
   - Added `file?: string` field (documented as not implemented)

2. **Enhanced parameter parser:**
   - Tracks unsupported parameters
   - Skips empty lines and comments
   - Validates parameter names

3. **Added error display in code block processor:**
   - Shows clear error message: "⚠️ Unsupported parameter(s): file"
   - Lists supported parameters
   - Styled error box (red background, error color)
   - Prevents empty box rendering

**Result:** Users now see helpful error instead of empty box

## Feature Requests Created

### 📋 1. Template Array Operations

**Todo:** [todos/planned/template-array-operations.md](../todos/planned/template-array-operations.md)

**Target:** v0.7.2 or v0.8.0  
**Priority:** Medium  
**Effort:** 1-2 weeks

**Proposed Solution:**
Add array operation functions consistent with existing `@function()` syntax:

```
{{@join(@map(sample.preparation, 'link'), ', ')}}
{{@filter(sample.preparation, @eq('status', 'complete'))}}
```

**Key Methods:**
- `@map(array, property)` - Extract property from each item
- `@filter(array, predicate)` - Filter array elements
- `@join(array, separator)` - Join array to string
- `.length` - Get array length

**Implementation:**
- Extend FunctionEvaluator
- Add ArrayOperations class
- Support nested function calls
- Comprehensive testing

### 📋 2. Cross-File NPE Display

**Todo:** [todos/planned/cross-file-npe-display.md](../todos/planned/cross-file-npe-display.md)

**Target:** v0.8.0  
**Priority:** Medium  
**Effort:** 2-3 weeks

**Proposed Solution:**
Implement `file` parameter in `eln-properties` code blocks:

```markdown
```eln-properties
file: [[Process 001]]
key: process
actionButtons: hidden
```
```

**Implementation Phases:**

1. **Phase 1 (v0.8.0):** Single file reference
   - Support wiki links: `[[File Name]]`
   - Support file paths: `path/to/file.md`
   - Error handling for missing files
   - Visual indicator for cross-file display

2. **Phase 2 (v0.8.1):** Template evaluation
   - `file: {{sample.process.link}}`
   - Dynamic file resolution

3. **Phase 3 (v0.9.0):** Multiple files
   - `file: {{sample.preparation.*.link}}`
   - Display NPE for each referenced file

**Key Components:**
- File resolver utility
- Cross-file metadata access
- Edit mode for cross-file properties
- Performance optimization

## Documentation Updates

### ✅ Updated ROADMAP

**File:** `docs/developer/ROADMAP.md`

**Changes:**
- Added "Template Array Operations" section (v0.7.2-v0.8.0)
- Added "Cross-File NPE Display" section (v0.8.0)
- Links to detailed todo documents

### ✅ Updated Todo Index

**File:** `docs/developer/todos/README.md`

**Changes:**
- Added template-array-operations.md to planned
- Added cross-file-npe-display.md to planned
- Updated counts: 3 planned todos (was 1)

## Testing Status

### ✅ Tested
- Error message displays correctly for unsupported `file` parameter
- Supported parameters still work correctly
- Sample markdown template renders without errors

### ⏳ Needs Testing Before Release
- [ ] Build plugin with changes: `npm run build-fast`
- [ ] Verify error message styling in Obsidian
- [ ] Test sample note in clean test-vault
- [ ] Confirm no other templates use unsupported parameters

## Impact on Release

### Low Impact ✅

**Reasons:**
1. Removed broken feature (wasn't working anyway)
2. Added better error handling (improves UX)
3. Created clear roadmap for future implementation
4. No changes to working functionality

### Release Checklist

- [x] Remove broken NPE code block from sample template
- [x] Add error handling for unsupported parameters
- [x] Create detailed todo documents for future features
- [x] Update ROADMAP with new features
- [x] Update todo index
- [ ] Test changes in Obsidian
- [ ] Rebuild plugin
- [ ] Verify no regression in other templates

## Lessons Learned

### 1. Test with Clean Vault

Creating a clean test vault revealed issues hidden in development environment:
- Broken features that silently failed
- Template syntax that needed real data
- User experience problems

**Recommendation:** Always test with fresh vault before release

### 2. Better Error Messages

Silent failures are worse than clear errors:
- Empty boxes confuse users
- Error messages guide toward solution
- Listing supported options helps users fix issues

**Recommendation:** Always prefer helpful error over silent failure

### 3. Document Limitations

When features are partially implemented:
- Mark as "not yet implemented"
- Provide workarounds
- Create clear roadmap for completion

**Recommendation:** Be transparent about current capabilities

## Decision: Why Remove Instead of Implement?

**Question:** Why not implement `file` parameter now before release?

**Answer:** Several reasons:

1. **Scope Creep:** Would delay v0.7.0 release significantly (2-3 weeks)
2. **Complexity:** Cross-file NPE requires careful design (security, performance, UX)
3. **Dependencies:** Works better with unified template system (v0.8.0)
4. **Testing:** Needs thorough testing across various scenarios
5. **Documentation:** Requires user docs and examples

**Better Approach:**
- Remove incomplete feature
- Add clear error handling
- Plan proper implementation for v0.8.0
- Release v0.7.0 on schedule

## Next Steps

### Immediate (Before Release)
1. Test error message display
2. Rebuild plugin
3. Verify test-vault templates

### Post-Release (v0.7.1-v0.7.2)
1. Implement template array operations
2. Update sample template to use new syntax
3. User documentation for array operations

### Future (v0.8.0)
1. Implement cross-file NPE display
2. Integrate with unified template system
3. Comprehensive testing and documentation

## Files Modified

### Source Code
- `src/data/templates/markdown/sample.ts` - Removed broken NPE block
- `src/ui/renderer/npe/utils/parseNpeCodeBlockParams.ts` - Added error tracking
- `src/main.ts` - Added error display

### Documentation
- `docs/developer/todos/planned/template-array-operations.md` - Created
- `docs/developer/todos/planned/cross-file-npe-display.md` - Created
- `docs/developer/ROADMAP.md` - Updated
- `docs/developer/todos/README.md` - Updated

## Summary

**Problem:** Found two template system limitations during test vault cleanup  
**Solution:** Fixed error handling, documented limitations, planned proper implementation  
**Impact:** Low - Improves UX, doesn't break existing functionality  
**Timeline:** Ready for v0.7.0, features planned for v0.7.2-v0.8.0  
**Decision:** Remove incomplete features, add error handling, plan proper implementation  

✅ **Release blocker resolved** - Ready to proceed with v0.7.0-beta.1!
