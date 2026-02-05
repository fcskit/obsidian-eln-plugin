# Number with Units Fix

## Problem Identified

Number fields with `units` and `defaultUnit` specified in templates (like in `chemical.ts`) were being rendered as simple number inputs without unit dropdowns.

### Example from `chemical.ts`:
```typescript
"molar mass": {
  "query": true,
  "inputType": "number",
  "default": "",
  "units": ["g/mol"],
  "defaultUnit": "g/mol",
},
"density": {
  "query": true,
  "inputType": "number", 
  "default": "",
  "units": ["g/cm³", "g/mL"],
  "defaultUnit": "g/cm³",
}
```

**Expected**: Number input with unit dropdown showing "g/mol", "g/cm³", etc.  
**Actual**: Plain number input with no units ❌

## Root Cause Analysis

Multiple issues in the pipeline:

1. **Missing Template Field Properties**: `UniversalObjectRenderer` was only extracting `options` from template fields, ignoring `units` and `defaultUnit`
2. **Incorrect Type Mapping**: `mapInputTypeToPrimitive()` always mapped `"number"` → `"number"` instead of `"number with unit"` when units exist
3. **No defaultUnit Support**: `LabeledPrimitiveInput` didn't accept or use `defaultUnit` from templates

## Solution Implemented

### 1. Enhanced Template Field Extraction
**Fixed `UniversalObjectRenderer.createFieldRenderingConfig()`** to extract all relevant template properties:

```typescript
// ✅ AFTER: Extract all template properties
inputOptions: {
    // Include options if they exist
    ...(typeof templateField?.options === 'object' && !Array.isArray(templateField?.options) 
        ? templateField.options as Record<string, unknown> 
        : {}),
    // Add units and defaultUnit from template field
    ...(templateField?.units ? { units: templateField.units } : {}),
    ...(templateField?.defaultUnit ? { defaultUnit: templateField.defaultUnit } : {}),
    // Add other template properties that might be needed
    ...(templateField?.multiline ? { multiline: templateField.multiline } : {})
}
```

### 2. Smart Type Mapping
**Enhanced `mapInputTypeToPrimitive()`** to detect units and map correctly:

```typescript
// ✅ AFTER: Detect units and map to correct type
private mapInputTypeToPrimitive(inputType: string, hasUnits: boolean = false): PrimitiveType {
    const mapping: Record<string, PrimitiveType> = {
        "number": hasUnits ? "number with unit" : "number",  // 🎯 Key fix
        // ... other mappings
    };
    return mapping[inputType] || "text";
}

// Usage with units detection:
type: this.mapInputTypeToPrimitive(config.inputType, !!(config.inputOptions?.units))
```

### 3. Default Unit Support
**Enhanced `LabeledPrimitiveInput`** to accept and use `defaultUnit`:

```typescript
// ✅ Added to interface
export interface LabeledPrimitiveInputOptions extends LabeledInputBaseOptions<PrimitiveValue> {
    type: PrimitiveType;
    units?: string[];
    defaultUnit?: string; // 🎯 New property
    onValueChange?: (value: PrimitiveValue) => void;
    multiline?: boolean;
}

// ✅ Added helper method
private getDefaultUnit(): string {
    // Use defaultUnit if specified and it exists in units array
    if (this.defaultUnit && this.units?.includes(this.defaultUnit)) {
        return this.defaultUnit;
    }
    // Fall back to first unit in array
    return this.units?.[0] ?? "";
}
```

### 4. Proper Unit Handling
**Updated unit dropdown initialization** to use template's `defaultUnit`:

```typescript
// ✅ AFTER: Use template's defaultUnit
unitDropdown.setValue(
    (typeof this.value === "object" && this.value && "unit" in this.value && this.value.unit) 
    || this.getDefaultUnit()  // Uses defaultUnit from template
);
```

## Result

✅ **Number with Units**: Fields like "molar mass" now render with proper unit dropdowns  
✅ **Correct Defaults**: Template's `defaultUnit` is respected (e.g., "g/mol" pre-selected)  
✅ **Multiple Units**: Fields with multiple units show dropdown (e.g., "g/cm³", "g/mL")  
✅ **Backward Compatibility**: Simple number fields without units still work  
✅ **Enhanced Debugging**: Better logging shows units detection and type mapping  

## Test Cases Covered

All fields in `chemical.ts` with `inputType: "number"` and `units`:
- ✅ **molar mass**: `["g/mol"]` with `defaultUnit: "g/mol"`
- ✅ **density**: `["g/cm³", "g/mL"]` with `defaultUnit: "g/cm³"`  
- ✅ **melting point**: `["°C", "K"]` with `defaultUnit: "K"`
- ✅ **boiling point**: `["°C", "K"]` with `defaultUnit: "K"`
- ✅ **solubility**: `["g/L", "mg/L", "mol/L"]` with `defaultUnit: "g/L"`
- ✅ **quantity**: `["mg", "g", "kg", "mL", "L"]` with `defaultUnit: "g"`
- ✅ **And many more...**

## Files Modified

1. **`UniversalObjectRenderer.ts`**: Enhanced template field extraction and type mapping
2. **`LabeledPrimitiveInput.ts`**: Added defaultUnit support and helper methods

The fix ensures that number fields with units in templates are properly rendered with unit dropdowns and correct default selections, providing the intended user experience for scientific data entry! 🧪⚗️
