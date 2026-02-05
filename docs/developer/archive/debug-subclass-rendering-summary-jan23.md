# Subclass Rendering Debug Setup - Summary

## Date: January 23, 2026

## Problem
Number+unit fields render incorrectly after subclass changes, showing raw template objects instead of proper input fields. This happens:
- When changing from "compound" (default) to "electrode"  
- When changing back from "electrode" to "compound"
- Only for "normal" template fields, NOT objectTemplate fields (which render correctly)

Initial render with default subclass works fine.

## Debug Strategy

We've added **targeted debug logging** at the three critical points in the rendering pipeline:

### 1. Render Trigger (render() method)
- **File**: `UniversalObjectRenderer.ts`
- **Marker**: `🔍 [RENDER] render() called:`
- **Shows**: When and why render() is triggered, current state
- **Compare**: Initial render vs. re-render after subclass change

### 2. Field Configuration (createFieldConfig() method)
- **File**: `UniversalObjectRenderer.ts`
- **Marker**: `🔍 [CONFIG] Number+unit field configuration:`
- **Shows**: How template is read, what value structure is extracted
- **Compare**: Template paths, value structures, units arrays

### 3. Component Creation (renderPrimitiveField() method)
- **File**: `UniversalObjectRenderer.ts`
- **Marker**: `🔍 [RENDER] Creating number+unit field:`
- **Shows**: What gets passed to LabeledPrimitiveInput component
- **Compare**: Primitive types, value structures, units availability

## Logging Configuration

**File**: `main.ts`
```typescript
logger.setConfig({
    modal: 'debug',       // NewNoteModal operations
    ui: 'debug',          // Field rendering
    inputManager: 'debug', // Data updates
    // All others: 'warn' (reduced noise)
});
```

This configuration:
- ✅ Shows all relevant rendering operations
- ✅ Filters out template processing noise (was generating 200+ lines per operation)
- ✅ Makes logs navigable and focused

## Debug Markers Guide

All critical debug points are marked with 🔍 emoji for easy searching:

| Marker | Purpose | Location |
|--------|---------|----------|
| `🔍 [RENDER] render() called:` | Render trigger | Line ~195 |
| `🔍 [CONFIG] Number+unit field configuration:` | Template reading | Line ~520 |
| `🔍 [RENDER] Creating number+unit field:` | Component creation | Line ~1230 |

## Testing Protocol

See `debug-subclass-rendering-jan23.md` for detailed testing procedure.

**Quick version**:
1. Test 1: Open modal (compound default) - WORKS
2. Test 2: Change to electrode - MAY BE BROKEN
3. Test 3: Change back to compound - ALSO BROKEN

Each test should start with fresh `debug-log.txt`.

## What We're Looking For

### Hypothesis
The issue is NOT in:
- ✅ Template application (we verified this)
- ✅ Data merging (Fix #15 handles this)

The issue IS in:
- ❓ How fields are re-rendered after subclass change
- ❓ Different code path for initial render vs. re-render
- ❓ Template configuration reading during re-render

### Key Questions
1. Does `value` stay as structured object `{value: X, unit: "Y"}` during re-render?
2. Are `templateField.units` still found during re-render?
3. Is `templatePath` calculated correctly during re-render?
4. Does the call stack differ between initial render and re-render?

## Expected Findings

The debug logs should reveal one of these:

### Scenario A: Value Corruption
- Config shows: `value: {value: 0, unit: "mg"}` ✅
- Render shows: `value: 0` or `value: "[object Object]"` ❌
- **Cause**: Value gets flattened between config extraction and component creation

### Scenario B: Template Path Issue  
- Config shows: `templateField: undefined` or `templateField.units: undefined` ❌
- **Cause**: Wrong template path during re-render, can't find field configuration

### Scenario C: Type Detection Failure
- Config shows: `templateField.inputType: "number"` ✅
- Render shows: `primitiveType: "number"` instead of `"number with unit"` ❌
- **Cause**: mapInputTypeToPrimitive() fails to detect units during re-render

## Next Steps

1. **Run tests** with fresh logs
2. **Search logs** for 🔍 markers + field names ("amount", "mass", "loading")
3. **Compare** working vs. broken sections
4. **Identify** exact point where divergence happens
5. **Fix** the root cause (not a workaround)

## Files Modified

1. `src/main.ts` - Logging configuration
2. `src/ui/modals/components/UniversalObjectRenderer.ts` - Debug markers
3. `docs/developer/debug-subclass-rendering-jan23.md` - Testing guide
4. `docs/developer/debug-subclass-rendering-summary-jan23.md` - This file

## Notes

- Log location: `<vault-root>/debug-log.txt`
- Build: `npm run build-fast` already completed
- Plugin ready for testing
- Focus on 🔍 markers - they contain all critical info
- Stack traces included to see call paths
