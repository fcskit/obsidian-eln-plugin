# Debug Guide: Subclass Rendering Issue (Jan 23, 2026)

## Issue Summary
Number+unit fields render correctly on initial modal open (with default "compound" subclass), but render incorrectly after subclass changes (showing raw template object instead of proper input fields).

## Hypothesis
The issue is in how fields are re-rendered after subclass change, not in template application or data merging. The rendering code path differs between:
- **Initial render**: Modal opens with default subclass already applied
- **Re-render**: User changes subclass, triggering `handleSubclassTemplateUpdate()`

## Enhanced Debug Logging

### Logging Configuration
Debug logging is now enabled for:
- `modal`: debug level - NewNoteModal operations
- `ui`: debug level - UniversalObjectRenderer field rendering
- `inputManager`: debug level - Data updates and field registration

### Key Debug Markers to Search For

#### 1. Render Calls
Look for: `🔍 [RENDER] render() called:`
- Shows when render() is triggered
- Includes context: `objectPath`, `isUpdatingTemplate`, stack trace
- Compare initial render vs. re-render after subclass change

#### 2. Field Configuration Extraction
Look for: `🔍 [CONFIG] Number+unit field configuration:`
- Shows how template configuration is read for number+unit fields
- **Key data to compare**:
  - `value`: Should be `{value: X, unit: "mg"}` structure
  - `valueType`: Should be "object"
  - `templateField.inputType`: Should be "number"
  - `templateField.units`: Should be array like `["mg", "g", "kg"]`
  - `templatePath`: Shows where template config is read from

#### 3. Field Creation
Look for: `🔍 [RENDER] Creating number+unit field:`
- Shows when LabeledPrimitiveInput is created
- **Key data to compare**:
  - `primitiveType`: Should be "number with unit"
  - `value`: Should be structured object `{value: X, unit: "Y"}`
  - `hasUnits`: Should be `true`
  - `units`: Should be array
  - Stack trace shows the call path

## Testing Procedure

### Test 1: Initial Render (Baseline - WORKS)
1. Delete `debug-log.txt` from vault root
2. Open Create New Sample modal
3. Default subclass is "compound"
4. **Observe**: Number+unit fields (e.g., `amount` in educts) render correctly
5. Close modal **without saving**

### Test 2: Subclass Change (BROKEN)
1. Delete `debug-log.txt` from vault root
2. Open Create New Sample modal
3. Change subclass from "compound" to "electrode"
4. **Observe**: Number+unit fields (e.g., `mass`, `loading` in active material) may render incorrectly
5. Close modal **without saving**

### Test 3: Double Subclass Change (ALSO BROKEN)
1. Delete `debug-log.txt` from vault root
2. Open Create New Sample modal (compound default)
3. Change to "electrode"
4. Change back to "compound"
5. **Observe**: Number+unit fields in compound (e.g., `amount` in educts) now render incorrectly
6. Close modal **without saving**

## What to Look For in Logs

### For Working Initial Render (Test 1)
Search for field key (e.g., "amount"):
```
🔍 [CONFIG] Number+unit field configuration: { key: "amount", ... }
  value: { value: 0, unit: "mg" }
  valueType: "object"
  templateField.inputType: "number"
  templateField.units: ["mg", "g", "kg"]
  
🔍 [RENDER] Creating number+unit field: { key: "amount", ... }
  primitiveType: "number with unit"
  value: { value: 0, unit: "mg" }
  hasUnits: true
  units: ["mg", "g", "kg"]
```

### For Broken Re-render (Test 2 & 3)
Search for field key (e.g., "mass" or "amount"):
```
🔍 [CONFIG] Number+unit field configuration: { key: "mass", ... }
  value: ??? <-- What is the value here?
  valueType: ??? <-- Is it still "object" or something else?
  templateField.inputType: ???
  templateField.units: ???
  
🔍 [RENDER] Creating number+unit field: { key: "mass", ... }
  primitiveType: ??? <-- Is it "number with unit" or something else?
  value: ??? <-- What structure is passed to component?
  hasUnits: ???
  units: ???
```

## Key Questions to Answer

1. **Value Structure**: 
   - Initial render: Is `value` a structured object `{value: X, unit: "Y"}`?
   - Re-render: Is `value` still a structured object, or has it been flattened/corrupted?

2. **Template Reading**:
   - Initial render: Is `templateField.units` correctly read as an array?
   - Re-render: Is `templateField` found? Are `units` still present?

3. **Path Calculation**:
   - Initial render: What is `templatePath`? Does it point to the right template field?
   - Re-render: Has `templatePath` changed? Is `objectTemplatePath` correct?

4. **Stack Trace**:
   - Compare the call stacks for initial render vs. re-render
   - Are they going through the same code path?

## Expected Root Causes

Based on the symptoms, likely causes:
1. **Value corruption**: Data gets flattened or converted during subclass change
2. **Template path mismatch**: Re-render reads from wrong template location
3. **Missing template merge**: Subclass template fields don't merge properly with base template
4. **Render order**: Fields rendered before template configuration is available

## Next Steps

1. Run all three tests
2. Collect debug logs
3. Compare the marked sections (🔍 [CONFIG] and 🔍 [RENDER])
4. Identify where the divergence happens
5. Report findings with specific log excerpts showing the difference

## Notes
- Log file location: `<vault-root>/debug-log.txt`
- Each test should start with a fresh log (delete old one)
- Focus on the marked debug lines (🔍) - they have all the critical info
- Include stack traces if the call paths differ
