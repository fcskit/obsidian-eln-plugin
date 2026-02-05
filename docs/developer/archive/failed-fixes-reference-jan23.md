# Failed Fixes Reference - January 23, 2026

## Context
After successfully completing Fix #15 (Deep merge for subclass data preservation), we discovered a bug where template properties (query, inputType, units, defaultUnit, etc.) were appearing as form fields in the modal after changing subclass. This document records the attempted fixes that **made things worse** and should **NOT be repeated**.

## Working State (After Fix #15)
- ✅ All 17 fixes working correctly (Fixes #1-15, plus array paths and inferred defaults)
- ✅ Initial modal render with default subclass worked perfectly
- ✅ YAML frontmatter output was correct
- ❌ Modal rendering broke after user-triggered subclass change

## Bug Symptoms
- After changing subclass to "electrode" in modal
- Number+units fields (porosity, dry thickness, current collector dimensions) displayed template properties as separate text inputs
- Example: Instead of showing "porosity: [number input] [unit dropdown]", it showed:
  - `value: [text input]`
  - `unit: [text input]`
  - `query: [text input]`
  - `inputType: [text input]`
  - `defaultUnit: [text input]`
  - etc.

## FAILED FIX #16 (DO NOT REPEAT)
**Title**: Sanitize Number Field Defaults for YAML Compatibility

**Changes Made**:
- Modified `TemplateManager.extractDefaultValuesFromTemplate()` to transform empty strings to 0 for number fields
- Added sanitization logic that converted number+units defaults into `{ value: 0, unit: "..." }` structure
- Changed how number fields were stored in the data structure

**File Modified**: `src/core/templates/TemplateManager.ts`

**Why It Failed**: 
- This transformation fundamentally changed the data structure for number+units fields
- The `{ value: 0, unit: "..." }` structure was being treated as a nested object by UniversalObjectRenderer
- Root cause: UniversalObjectRenderer's `isNestedObject()` returns true for ANY plain object, including `{ value, unit }`
- This cascaded into additional problems with how data was extracted and passed to the renderer

**User Quote**: "I think Fix #16: Sanitize Number Field Defaults for YAML Compatibility has been the root cause of the issues we are facing now."

## FAILED FIX #17 (DO NOT REPEAT)
**Title**: Fix inferDefaultValueForField for number+units

**Changes Made**:
- Modified `inferDefaultValueForField()` to return 0 for number+units fields
- Changed return behavior for plain number fields to return `undefined` instead of 0

**File Modified**: `src/core/templates/TemplateManager.ts`

**Why It Failed**:
- Built on top of Failed Fix #16's problematic data structure
- Did not address the root cause of the rendering issue

## FAILED FIX #18 (DO NOT REPEAT)
**Title**: Enhanced isNestedObject Detection

**Changes Made**:
- Added checks for 'units' and 'defaultUnit' properties in `TemplateManager.extractDefaultValuesFromTemplate()`
- Attempted to prevent field configs from being treated as nested objects
- Modified lines around 1181-1193 in TemplateManager.ts

**File Modified**: `src/core/templates/TemplateManager.ts`

**Why It Failed**:
- YAML output remained correct (proving data extraction was not the issue)
- Modal rendering still broken (proving the issue was in the renderer, not data extraction)
- This fix was targeting the wrong component

## FAILED FIX #19 (DO NOT REPEAT)
**Title**: Nested Result Content Check

**Changes Made**:
- Modified `extractDefaultValuesFromTemplate()` to only set nested result if it has content
- Added check `if (Object.keys(nestedResult).length > 0)` at lines 1243-1249

**File Modified**: `src/core/templates/TemplateManager.ts`

**Why It Failed**:
- Still targeting data extraction when the issue was in rendering
- YAML remained correct, modal still broken
- Did not address the fundamental problem

## FAILED FIX #20 (DO NOT REPEAT - BROKE EVERYTHING)
**Title**: Changed Nested Object Condition in UniversalObjectRenderer

**Changes Made**:
- Changed line 346 in UniversalObjectRenderer from:
  ```typescript
  } else if (isNestedByValue || isNestedByTemplate) {
  ```
  To:
  ```typescript
  } else if (isNestedByTemplate && isNestedByValue) {
  ```

**File Modified**: `src/ui/modals/components/UniversalObjectRenderer.ts`

**Why It Failed**:
- **COMPLETELY BROKE MODAL RENDERING**
- Modal now only renders author and project fields
- Sample displayed as "[object Object]" instead of rendering fields
- This change was too aggressive - it prevented legitimate nested objects (like "sample") from rendering

**User Quote**: "Now the rendering is completely broken. The modal now only renders the author and project field and the sample is displayed as sample [object Object] in the modal."

## Root Cause Analysis (Post-Mortem)

### What We Know:
1. ✅ YAML output was ALWAYS correct (even after subclass change)
2. ✅ Initial modal render worked perfectly
3. ❌ Modal re-render after subclass change broke
4. ✅ queryDropdown fields (like current collector.name) rendered correctly
5. ❌ Only number+units fields broke

### The Real Problem:
The bug was **NOT** in data extraction (TemplateManager) but in how UniversalObjectRenderer handles number+units fields during re-render. The data structure `{ value: 0, unit: "µm" }` is correct and necessary for YAML output, but the renderer needs special handling for it.

### What Went Wrong:
- Fix #16-17: Changed data structure unnecessarily, introduced the `{ value, unit }` format
- Fix #18-19: Targeted wrong component (TemplateManager instead of UniversalObjectRenderer)
- Fix #20: Too aggressive, broke all nested object rendering

## Correct Approach (For Future Reference)

### Before Fix #16:
- Number+units fields likely had a different data structure
- Or the renderer had special handling for them
- Need to investigate what changed and why it worked before

### Key Insights:
1. **YAML is correct** = Data extraction is working
2. **Initial render works** = Renderer can handle the fields
3. **Re-render breaks** = Something different happens during subclass change re-render
4. **Only number+units affected** = Specific to that input type

### Investigation Needed:
1. Compare data structure for number+units fields BEFORE Fix #16
2. Check if UniversalObjectRenderer had special handling for inputType: "number" with units
3. Look at how `analyzeForRendering()` categorizes fields with inputType: "number"
4. Verify if `createFieldConfig()` handles number+units specially
5. Compare initial render flow vs re-render flow for the same field

## Files to Revert
After restoring checkpoint to right after Fix #15, these files should be clean:
- `src/core/templates/TemplateManager.ts` - Remove all changes from Fix #16-19
- `src/ui/modals/components/UniversalObjectRenderer.ts` - Remove changes from Fix #20

## Next Steps After Checkpoint Restore
1. ✅ Verify modal works with default subclass
2. ✅ Verify YAML output is correct
3. ❌ Test subclass change - expect bug to reappear
4. 🔍 Investigate how number+units fields were handled BEFORE Fix #16
5. 🔍 Compare `analyzeForRendering()` logic for fields with inputType: "number"
6. 🔍 Check if there's special rendering logic for number+units that we're missing

## DO NOT:
- ❌ Transform number+units data structure in TemplateManager
- ❌ Add sanitization logic for number fields
- ❌ Change isNestedObject detection in TemplateManager
- ❌ Change the OR condition to AND in analyzeForRendering (breaks everything)

## DO:
- ✅ Focus investigation on UniversalObjectRenderer's field categorization
- ✅ Look for existing handling of inputType: "number" with units
- ✅ Compare initial render vs re-render for same field
- ✅ Check if data structure was different before Fix #16
- ✅ Verify template structure for number+units fields

## Date
January 23, 2026

## Status
Checkpoint restore planned. This document serves as reference to avoid repeating failed approaches.
