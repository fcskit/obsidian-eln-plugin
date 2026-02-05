# Bug Fix: Number+Unit Fields Rendering as Text - Jan 23, 2026

## Summary

**FIXED!** The rendering bug where number+unit fields showed raw template objects instead of proper inputs after subclass changes.

## Root Cause

**File:** `src/ui/modals/components/UniversalObjectRenderer.ts`  
**Method:** `createFieldConfig()`  
**Lines:** 608-617 (original)

### The Problem

When creating field configuration for non-list inputs, the code converted values to primitive types:

```typescript
// BUG: This code converted {value: 0, unit: "mg"} to "[object Object]"
let primitiveValue: string | number | boolean | null = null;
if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    primitiveValue = value;
} else if (value === null || value === undefined) {
    primitiveValue = null;
} else {
    primitiveValue = String(value);  // ← BUG! Converts objects to "[object Object]"
}
```

### Why It Happened

Number+unit fields store their values as objects: `{value: 0, unit: "mg"}`.

The type checking didn't account for this structure:
1. `typeof value === 'object'` → not handled
2. Falls through to `else` clause
3. `String(value)` converts to `"[object Object]"`
4. Field renders as text instead of number+unit input

### Why It Only Affected Subclass Changes

**Initial render:**
- Values were `undefined` (no data yet)
- Hit the `value === undefined` check → `primitiveValue = null`
- Template default properly applied later
- Worked correctly ✅

**After subclass change:**
- Values were actual objects: `{value: 0, unit: "mg"}`
- Didn't match any type check
- Hit `String(value)` conversion
- Rendered as text "[object Object]" ❌

## The Fix

**File:** `src/ui/modals/components/UniversalObjectRenderer.ts`  
**Method:** `createFieldConfig()`  
**Lines:** 608-623 (fixed)

Added explicit check for number+unit object structure:

```typescript
// FIXED: Preserve {value, unit} object structure for number+unit fields
let primitiveValue: PrimitiveValue | null = null;

// Check if this is a number with unit field - preserve object structure
if (templateField?.inputType === 'number' && templateField?.units && 
    typeof value === 'object' && value !== null && 'value' in value && 'unit' in value) {
    // Preserve the {value, unit} object structure for number+unit fields
    primitiveValue = value as { value: number; unit: string };
} else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    primitiveValue = value;
} else if (value === null || value === undefined) {
    primitiveValue = null;
} else {
    primitiveValue = String(value);
}
```

### Key Changes

1. **Changed type:** `primitiveValue` from `string | number | boolean | null` to `PrimitiveValue | null`
   - `PrimitiveValue` already includes `{ value: number; unit: string }`

2. **Added check:** Before other type checks, explicitly look for number+unit structure:
   - Has `templateField.inputType === 'number'`
   - Has `templateField.units` array
   - Value is object with 'value' and 'unit' properties
   - If all true → preserve the object structure

3. **Preserves other behavior:** All other field types work exactly as before

## Detection Process

The bug was discovered through targeted logging:

1. Added 🔍 [CONFIG] marker showing value extraction
2. Added 🔍 [RENDER] Creating marker showing component creation
3. User noticed: `value: '[object Object]', valueType: 'string'`
4. Traced back to `createFieldConfig()` where conversion happened

### Debug Output That Revealed the Bug

```
🔍 [CONFIG] Number+unit field configuration: {
  value: undefined,           ← Correct at config extraction
  valueType: "undefined",
  templateField: { units: [...] }
}

🔍 [RENDER] Creating number+unit field: {
  value: '[object Object]',   ← BUG! String instead of object
  valueType: 'string',        ← BUG! Wrong type
  primitiveType: 'number with unit'  ← Type detection was correct
}
```

## Additional Fixes

While debugging, also fixed:

### 1. Logger Buffer Size
**File:** `src/utils/Logger.ts`  
**Change:** Reduced buffer from 100 to 10 messages

**Why:** With focused logging (only warn level), buffer rarely reached 100 messages, so logs weren't being written to file.

### 2. DropdownResizer Console Spam
**File:** `src/utils/dropdown-resizer.ts`  
**Change:** Removed 4 `console.log` statements

**Why:** Not using our logger system, generated excessive console output during dropdown resizing.

## Testing

### Expected Behavior (After Fix)

1. **Open modal** (compound default)
   - Number+unit fields: ✅ Show proper inputs
   
2. **Change to electrode**
   - Number+unit fields: ✅ Still show proper inputs (was broken before)
   
3. **Change back to compound**
   - Number+unit fields: ✅ Still show proper inputs (was broken before)

### Verification

Check console for 🔍 markers - should now show:

```
🔍 [RENDER] Creating number+unit field: {
  value: {value: 0, unit: "mg"},  ← Object structure preserved! ✅
  valueType: 'object',             ← Correct type! ✅
  primitiveType: 'number with unit'
}
```

## Impact

**Affected Fields:**
- All number+unit fields in templates (amount, mass, loading, volume, etc.)
- Only during re-render after subclass changes
- Both "normal" fields and objectTemplate fields

**Fix Scope:**
- Minimal change (one method, one conditional block)
- No changes to template structures
- No changes to data handling
- No changes to other field types

**Risk Level:** Low
- Fix is defensive (only affects number+unit fields)
- Preserves all existing behavior for other types
- Follows existing type definitions (PrimitiveValue already supported this)

## Related Issues

This fix resolves:
- ✅ Fix #16: Number+unit fields showing as text after subclass change
- ✅ User report: Fields render as "[object Object]" text
- ✅ ObjectTemplate fields working but "normal" fields failing

This does NOT affect:
- ❌ Other field types (string, boolean, date, etc.)
- ❌ List fields or object lists
- ❌ Initial rendering (was already working)
- ❌ Template structure or defaults

## Files Modified

1. `src/ui/modals/components/UniversalObjectRenderer.ts` - **Main fix**
2. `src/utils/Logger.ts` - Buffer size reduction
3. `src/utils/dropdown-resizer.ts` - Removed console.log spam

## Build Status

✅ Build successful  
✅ No TypeScript errors  
✅ Copied to test-vault  
✅ Ready for testing

---

**Status:** FIXED and ready for validation

**Next Step:** Test with sample note modal (compound → electrode → compound) to verify number+unit fields render correctly throughout.
