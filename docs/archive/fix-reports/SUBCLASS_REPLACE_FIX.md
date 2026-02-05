# Subclass Template Replace Fix

## Problem Identified

The `replace` operation in subclass templates was incorrectly handling full dot notation paths in the `newKey` field.

### Example from `activeMaterial.ts`:
```typescript
"replace": [
    {
        "fullKey": "chemical.properties.melting point",
        "newKey": "chemical.properties.voltage range",  // ✅ Full path
        "input": { /* ... */ }
    }
]
```

### The Bug:
- **Expected**: `"chemical.properties.melting point"` → `"chemical.properties.voltage range"`
- **Actual**: `"chemical.properties.melting point"` → `"chemical.properties.chemical.properties.voltage range"`

### Root Cause:
The original code incorrectly assumed `newKey` was always just a field name:

```typescript
// ❌ WRONG: Treats newKey as just the last part of the path
const keyParts = replacement.fullKey.split('.');              // ["chemical", "properties", "melting point"]
keyParts[keyParts.length - 1] = replacement.newKey;          // ["chemical", "properties", "chemical.properties.voltage range"]
const newFullKey = keyParts.join('.');                       // "chemical.properties.chemical.properties.voltage range"
```

## Solution Implemented

### Enhanced Logic:
1. **Check if old field exists** - provides fallback behavior if field to replace doesn't exist
2. **Detect full path vs field name** - check if `newKey` contains dots
3. **Handle both cases correctly**:
   - **Full path**: Use `newKey` directly
   - **Field name only**: Combine with parent path from `fullKey`

### Updated Code:
```typescript
// ✅ FIXED: Properly handle both full paths and field names
let newFullKey: string;
if (replacement.newKey.includes('.')) {
    // newKey is already a full path, use it directly
    newFullKey = replacement.newKey;
} else {
    // newKey is just a field name, combine with parent path of old key
    const keyParts = replacement.fullKey.split('.');
    keyParts[keyParts.length - 1] = replacement.newKey;
    newFullKey = keyParts.join('.');
}
```

### Fallback Behavior:
```typescript
// Check if the old field exists before trying to replace it
const oldFieldExists = this.fieldExistsInTemplate(template, replacement.fullKey);

if (oldFieldExists) {
    // Remove the old field
    this.removeFieldFromTemplateObject(template, replacement.fullKey);
} else {
    logger.debug('Old field not found for replacement, will add new field instead');
    // Field will still be added at the correct location
}
```

## Benefits

✅ **Correct Path Handling**: Full dot notation paths in `newKey` work correctly  
✅ **Backward Compatibility**: Simple field names still work  
✅ **Fallback Support**: Adds field if old field doesn't exist  
✅ **Better Debugging**: Enhanced logging for replacement operations  

## Test Case

With the `activeMaterial.ts` template:
- **Input**: `"fullKey": "chemical.properties.melting point"`, `"newKey": "chemical.properties.voltage range"`
- **Expected Output**: Field at `"chemical.properties.voltage range"` 
- **Previous Bug**: Would create `"chemical.properties.chemical.properties.voltage range"`
- **Now Fixed**: ✅ Creates correct path `"chemical.properties.voltage range"`

## Files Modified

- `src/ui/modals/components_new/TemplateManager.ts`:
  - Enhanced `replaceFieldInTemplate()` method
  - Enhanced `replaceFieldInTemplateObject()` method  
  - Added `fieldExistsInTemplate()` helper method
  - Added comprehensive logging for debugging

The fix ensures that subclass template replacement operations work correctly for both simple field names and full dot notation paths, with proper fallback behavior when the target field doesn't exist.
