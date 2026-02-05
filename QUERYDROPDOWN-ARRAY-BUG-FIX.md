# QueryDropdown in Object Arrays - Bug Fix

**Date**: February 5, 2026  
**Issue**: QueryDropdowns inside object arrays were not properly updating the name field when dropdown values changed  
**Status**: ✅ Fixed

## Problem Description

### The Bug

QueryDropdowns defined within object list templates (e.g., `sample.educts` in compound subclass, active materials/solvents in electrode subclass) had two critical issues:

1. **Changing dropdown value didn't update the field** - The dropdown change callback wasn't properly resolving array indices
2. **Initial default value not populated** - Even the first array item (created via `initialItems: 1`) had empty name fields

### Example Affected Templates

**Compound Subclass** (`src/data/templates/metadata/sampletypes/compound.ts`):
```typescript
{
    "fullKey": "sample.educts",
    "input": {
        "inputType": "list",
        "listType": "object",
        "initialItems": 1,
        "objectTemplate": {
            "name": {
                "inputType": "queryDropdown",
                "search": "chemical",
                "return": {
                    "sample.educts.name": "chemical.name",
                    "sample.educts.link": "file.link"
                }
            },
            "amount": { ... }
        }
    }
}
```

**Electrode Subclass** (`src/data/templates/metadata/sampletypes/electrode.ts`):
- Similar structure for `sample.active materials`, `sample.solvents`, `sample.salts`, etc.
- These don't define return clauses, relying on automatic file name storage

### Root Cause

**Issue 1: Array Index Not Injected into Return Paths**

When a queryDropdown inside an array changes value, the return clause specifies template paths like:
- `"sample.educts.name"` 
- `"sample.educts.link"`

But the actual data structure uses indexed paths:
- `"sample.educts.0.name"` (first item)
- `"sample.educts.1.name"` (second item)
- etc.

The `onValueChange` callback in `UniversalObjectRenderer.ts` was using the template path directly without injecting the array index, causing the update to go to the wrong location (or nowhere).

**Issue 2: Initial Return Values Not Processed**

When a queryDropdown is first rendered with a default value or first available option, the return values weren't being processed. This meant:
- First array item (via `initialItems: 1`) had empty name field even though dropdown showed a selection
- Adding new array items always resulted in empty name fields
- Return clauses never populated on initial render

## Solution

### Fix 1: Inject Array Index into Return Paths

**File**: `src/ui/modals/components/UniversalObjectRenderer.ts`  
**Location**: Line ~1345, `onValueChange` callback for QueryDropdown

**Before**:
```typescript
// Use InputManager to set the field with the full path from template
this.inputManager.setValue(fullPath, fieldValue as FormFieldValue);
```

**After**:
```typescript
// When inside an array (objectPath includes array index), we need to inject the index
// into the template path. E.g., convert "sample.educts.name" to "sample.educts.0.name"
let actualPath = fullPath;

if (this.objectPath) {
    // Check if objectPath contains an array index (e.g., "sample.educts.0")
    const pathParts = this.objectPath.split('.');
    const lastPart = pathParts[pathParts.length - 1];
    
    if (!isNaN(Number(lastPart))) {
        // We're inside an array item, need to inject the index
        const arrayIndex = lastPart;
        const arrayPath = pathParts.slice(0, -1).join('.'); // e.g., "sample.educts"
        
        // Check if fullPath starts with the array path
        if (fullPath.startsWith(arrayPath + '.')) {
            // Extract the field name after the array path
            const fieldName = fullPath.substring(arrayPath.length + 1); // e.g., "name"
            // Reconstruct with index: "sample.educts.0.name"
            actualPath = `${arrayPath}.${arrayIndex}.${fieldName}`;
        }
    }
}

this.logger.debug('QueryDropdown - Setting return value:', {
    configKey: config.key,
    objectPath: this.objectPath,
    templatePath: fullPath,
    actualPath: actualPath,
    value: fieldValue
});

// Use InputManager to set the field with the actual indexed path
this.inputManager.setValue(actualPath, fieldValue as FormFieldValue);
```

**How it works**:
1. Checks if `this.objectPath` contains an array index (last segment is a number)
2. Extracts the array path and index: `"sample.educts.0"` → `arrayPath: "sample.educts"`, `arrayIndex: "0"`
3. If return path starts with array path, injects the index: `"sample.educts.name"` → `"sample.educts.0.name"`
4. Uses the corrected path to set the value

### Fix 2: Process Return Values on Initial Render

**File**: `src/ui/modals/components/QueryDropdown.ts`  
**Location**: Line ~473, `createSingleSelectUI` method

**Added**:
```typescript
// Determine which value to process for return values
let valueToProcess: string | undefined = defaultValue;

// If no default value but options are available, use first option
// This handles the case of queryDropdowns in array items
if (!valueToProcess && options.length > 0) {
    valueToProcess = options[0];
}

// If we have a value and return clause, process return values immediately
// This ensures that when the dropdown is first rendered (especially in array items),
// the return values get populated correctly
if (valueToProcess && this.returnClause && options.includes(valueToProcess)) {
    this.logger.debug('🔹 Processing return values for initial value:', {
        label: this.label,
        value: valueToProcess,
        hadDefaultValue: !!defaultValue
    });
    this.handleValueChange(valueToProcess);
}
```

**How it works**:
1. Determines which value to process (default value or first option)
2. If a return clause is defined, immediately calls `handleValueChange`
3. This triggers the return value processing just like when user changes the dropdown
4. Combined with Fix 1, this properly populates indexed array fields

## Testing Scenarios

### Test 1: Compound Subclass - Educts with Return Clause
1. Create new Sample note, select Compound subclass
2. Observe first educt has populated name field (from first chemical in search)
3. Change dropdown selection → name and link fields update correctly
4. Click "+" to add second educt → dropdown shows first option
5. Select different chemical → second educt's name and link update correctly
6. Verify `sample.educts[0].name` and `sample.educts[1].name` both populated

### Test 2: Electrode Subclass - Active Materials without Return Clause
1. Create new Sample note, select Electrode subclass
2. Observe first active material has populated name field
3. Change dropdown → name updates correctly (using file name, no return clause)
4. Add second active material → name populates from dropdown selection
5. Verify both items store file names correctly

### Test 3: Multiple Array Items
1. Add 5+ items to educts list
2. Change dropdown on items 0, 2, and 4
3. Verify only those items update, others unchanged
4. Verify correct array indices used (no cross-contamination)

### Test 4: Return Clause Edge Cases
1. Test return clause with:
   - Single field: `"sample.educts.name": "chemical.name"`
   - Multiple fields: `name` + `link`
   - Deep nested fields
2. Verify all return paths correctly inject array index

## Impact Analysis

### Before Fix
- ❌ QueryDropdowns in arrays unusable for data entry
- ❌ All array items had empty name fields
- ❌ Changing dropdown had no effect
- ❌ Return clauses completely non-functional in arrays
- ❌ Templates like compound.ts and electrode.ts severely limited

### After Fix
- ✅ QueryDropdowns in arrays fully functional
- ✅ Initial array items correctly populated
- ✅ Dropdown changes update correct array indices
- ✅ Return clauses work properly with array indexing
- ✅ All sample subclass templates now usable as designed

## Related Code

### Key Files Modified
1. **`src/ui/modals/components/UniversalObjectRenderer.ts`**
   - Lines ~1345-1384: QueryDropdown onValueChange callback with array index injection

2. **`src/ui/modals/components/QueryDropdown.ts`**
   - Lines ~473-507: createSingleSelectUI with initial return value processing

### Affected Templates
All templates with queryDropdowns inside object arrays:
- `src/data/templates/metadata/sampletypes/compound.ts` - educts, side products
- `src/data/templates/metadata/sampletypes/electrode.ts` - active materials, solvents, salts, binders, additives
- `src/data/templates/metadata/sampletypes/electrochemCell.ts` - similar structure

### InputManager Integration
The fix leverages `InputManager.setValue()` which correctly handles:
- Nested object paths with dot notation
- Array indices as path segments
- Reactive updates to dependent fields

### ObjectPath Context
`UniversalObjectRenderer` maintains `this.objectPath` containing the full indexed path:
- Root level: `""` (empty)
- Object property: `"sample.educts"`
- Array item: `"sample.educts.0"` (note the numeric index)
- Nested property: `"sample.educts.0.name"`

## Lessons Learned

### Array Template Paths vs. Runtime Paths

**Template Definition** (what you write):
```typescript
"sample.educts.name"  // Generic path without index
```

**Runtime Path** (what actually exists):
```typescript
"sample.educts.0.name"  // Indexed path for first item
"sample.educts.1.name"  // Indexed path for second item
```

**The Fix**: Bridge the gap by injecting array indices from `objectPath` into template paths

### Return Clause Challenges in Arrays

Return clauses specify full paths from root:
```typescript
"return": {
    "sample.educts.name": "chemical.name",  // Template path
    "sample.educts.link": "file.link"
}
```

But when rendered in array item 0, these must become:
```typescript
{
    "sample.educts.0.name": "Benzene",  // Actual indexed path
    "sample.educts.0.link": "[[Benzene]]"
}
```

### Initial Value Processing Critical

Components must process their initial values, not just changes:
- Dropdowns show selected value visually
- But return values need explicit processing via callback
- Can't assume UI state = data state without trigger

### ObjectPath as Source of Truth

`UniversalObjectRenderer.objectPath` contains the complete runtime context:
- Includes all parent paths
- Includes array indices
- Updated as you navigate nested structures
- Essential for resolving template paths to actual data paths

## Future Improvements

### Potential Enhancements
1. **Path Resolution Utility**: Create shared utility for template→runtime path conversion
2. **Array Path Validation**: Validate that return paths match array context
3. **Debug Visualization**: Log array path transformations for troubleshooting
4. **Unit Tests**: Add tests for array index injection logic

### Known Limitations
- Only handles single-level array indexing (no nested arrays yet)
- Assumes array indices are numeric strings
- No validation that return paths actually exist in data structure

## Version History

- **v0.7.0-beta.1**: Bug discovered during test vault cleanup
- **v0.7.0-beta.2**: Bug fixed (this document)
- **Target**: Include fix in beta.2 release

## Related Issues

- **Last-Minute Bug #1**: Array operations in templates (separate issue, planned for v0.7.2)
- **Last-Minute Bug #2**: Cross-file NPE display (separate issue, planned for v0.8.0)

This fix addresses the fundamental data flow issue, ensuring queryDropdowns in arrays work as originally designed.
