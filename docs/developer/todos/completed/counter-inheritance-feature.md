# Counter Inheritance Feature

## Overview

The `inheritFrom` feature allows a counter segment in the `fileName` template to inherit its value from a counter segment in the `folderPath` template. This solves the problem where both path and filename have counters that evaluate independently.

## Problem Statement

Consider the analysis note template:

**Without inheritance:**
- **folderPath**: `Experiments/Analyses/Project/Sample/MethodName_01/`
- **fileName**: `SampleName - MethodName_01.md`

When creating a second analysis:
- **folderPath**: `Experiments/Analyses/Project/Sample/MethodName_02/` ✅ (correct)
- **fileName**: `SampleName - MethodName_01.md` ❌ (wrong - should be `_02`)

The fileName counter always evaluates to `01` because it searches in the parent folder (`Sample/`), where it only sees the folder `MethodName_01/` but not the file inside it.

## Solution

The `inheritFrom: "folderPath"` option allows the fileName counter to use the same counter value that was computed for the folderPath:

```typescript
fileName: {
    segments: [
        { kind: "field", path: "sample.name", separator: " - " },
        { kind: "field", path: "analysis.method.name", separator: "_" },
        { kind: "counter", inheritFrom: "folderPath", separator: "" },
    ]
},
folderPath: {
    segments: [
        { kind: "literal", value: "Experiments/Analyses", separator: "/" },
        { kind: "field", path: "project.name", separator: "/" },
        { kind: "field", path: "sample.name", separator: "/" },
        { kind: "field", path: "analysis.method.name", separator: "_" },
        { kind: "counter", prefix: "", separator: "" },
    ]
}
```

**With inheritance:**
- First analysis:
  - **folderPath**: `Experiments/Analyses/Project/Sample/MethodName_01/`
  - **fileName**: `SampleName - MethodName_01.md` ✅
- Second analysis:
  - **folderPath**: `Experiments/Analyses/Project/Sample/MethodName_02/`
  - **fileName**: `SampleName - MethodName_02.md` ✅

## Type Definition

```typescript
export interface CounterSegment {
    kind: "counter";
    prefix?: string;  // Filter files by prefix for counter scope
    width?: number;   // Zero-pad width (default: 2)
    inheritFrom?: "folderPath";  // Inherit counter value from folderPath evaluation
    separator?: string;
}
```

## Implementation Details

### 1. PathEvaluator Changes

**Return Type**: `evaluatePath()` now returns `PathEvaluationResult`:
```typescript
export interface PathEvaluationResult {
    path: string;
    counterValue?: string;  // The counter value if a counter segment was evaluated
}
```

**Options Interface**: Added `inheritedCounter` parameter:
```typescript
export interface PathEvaluatorOptions {
    plugin: ElnPlugin;
    userInput: FormData;
    targetFolder?: string;
    dateOffset?: string;
    inheritedCounter?: string;  // Counter value inherited from folderPath evaluation
}
```

**Counter Evaluation Logic**:
```typescript
private async evaluateCounter(segment: CounterSegment, options, separator, accumulatedPrefix) {
    // If inheritFrom is specified and we have an inherited counter, use it
    if (segment.inheritFrom === 'folderPath' && options.inheritedCounter) {
        logger.debug("Using inherited counter from folderPath", { 
            inheritedCounter: options.inheritedCounter 
        });
        
        return {
            value: options.inheritedCounter,
            separator,
            isCounter: true
        };
    }
    
    // Otherwise, compute the counter normally...
}
```

### 2. NoteCreator Changes

**Execution Flow**:
```typescript
// 1. Resolve folder path (returns object with path and counterValue)
const folderPathResult = await this.resolveFolderPath(options);
const folderPath = folderPathResult.path;
const folderCounter = folderPathResult.counterValue;

// 2. Resolve note title (pass inherited counter)
const noteTitle = await this.resolveNoteTitle({
    ...options,
    folderPath: folderPath,
    inheritedCounter: folderCounter  // Pass counter for inheritance
});
```

**Return Type Update**: `resolveFolderPath()` now returns `PathEvaluationResult`:
```typescript
private async resolveFolderPath(options: NoteCreationOptions): Promise<PathEvaluationResult> {
    // ...
    return { path: "...", counterValue: "01" };
}
```

## Usage Examples

### Example 1: Analysis Notes (Current Implementation)

```typescript
// settings.ts - analysis note configuration
analysis: {
    fileName: {
        segments: [
            { kind: "field", path: "sample.name", separator: " - " },
            { kind: "field", path: "analysis.method.name", separator: "_" },
            { kind: "counter", inheritFrom: "folderPath", separator: "" },  // ← Inherits from folder
        ]
    },
    folderPath: {
        segments: [
            { kind: "literal", value: "Experiments/Analyses", separator: "/" },
            { kind: "field", path: "project.name", separator: "/" },
            { kind: "field", path: "sample.name", separator: "/" },
            { kind: "field", path: "analysis.method.name", separator: "_" },
            { kind: "counter", prefix: "", separator: "" },  // ← Computed counter
        ]
    }
}
```

**Result**:
- Folder: `Experiments/Analyses/MyProject/Sample1/XRD_01/`
- File: `Sample1 - XRD_01.md`
- Next: `Experiments/Analyses/MyProject/Sample1/XRD_02/` + `Sample1 - XRD_02.md`

### Example 2: Independent Counters (Sample Notes)

When counters should be independent (like sample notes), don't use `inheritFrom`:

```typescript
// settings.ts - sample note configuration
sample: {
    fileName: {
        segments: [
            { kind: "function", context: ["settings", "userInput"], 
              expression: "settings.general.operators.find(...)?.initials || 'XX'", separator: "-" },
            { kind: "function", context: ["noteMetadata", "userInput"], 
              expression: "noteMetadata.get(...)?.project?.abbreviation || 'PRJ'", separator: "-" },
            { kind: "function", context: ["settings", "userInput"], 
              expression: "settings.note.sample.type.find(...)?.abbreviation || 'SMP'", separator: "-" },
            { kind: "counter", prefix: "", separator: "", width: 3 }  // ← No inheritFrom
        ]
    },
    folderPath: {
        segments: [
            { kind: "literal", value: "Experiments/Samples", separator: "/" },
            { kind: "field", path: "project.name", separator: "/" },
            { kind: "field", path: "sample.type", separator: "" }
        ]
    }
}
```

**Result**:
- Folder: `Experiments/Samples/MyProject/compound/`
- File: `AA-PRJ-CPD-001.md` (independent counter, searches in compound/ folder)

## When to Use inheritFrom

### Use inheritFrom when:
- ✅ Both folderPath and fileName have counter segments
- ✅ The fileName counter should match the folder counter
- ✅ The folder structure includes the counter in the path
- ✅ You want synchronized numbering (e.g., `MethodName_02/` + `MethodName_02.md`)

### Don't use inheritFrom when:
- ❌ Only fileName has a counter (no folder counter to inherit from)
- ❌ Only folderPath has a counter (fileName doesn't need one)
- ❌ Counters should be independent (e.g., sample codes in flat folder structure)
- ❌ Different counter logic needed for path vs. filename

## Testing

### Test Scenario 1: Analysis Notes
1. Create first analysis for Sample1 with XRD method
   - Expected folder: `Experiments/Analyses/Project/Sample1/XRD_01/`
   - Expected file: `Sample1 - XRD_01.md`

2. Create second analysis for Sample1 with XRD method
   - Expected folder: `Experiments/Analyses/Project/Sample1/XRD_02/`
   - Expected file: `Sample1 - XRD_02.md` ← Must be `_02`, not `_01`

3. Create third analysis for Sample1 with SEM method
   - Expected folder: `Experiments/Analyses/Project/Sample1/SEM_01/`
   - Expected file: `Sample1 - SEM_01.md` ← New method, starts at `01`

### Test Scenario 2: Verify No Breaking Changes
1. Create sample notes (should still work with independent counters)
   - AA-PRJ-CPD-001, AA-PRJ-CPD-002, AA-PRJ-CPD-003

2. Create notes without counters (should still work)
   - Chemical notes, contact notes, etc.

## Debug Logging

The feature includes comprehensive debug logging:

```
[PATH] Evaluating counter segment {
  prefix: '', 
  width: undefined, 
  accumulatedPrefix: 'XRD_', 
  inheritFrom: 'folderPath',
  hasInheritedCounter: true
}
[PATH] Using inherited counter from folderPath { inheritedCounter: '02' }
[NoteCreator] Resolved folder path: { folderPath: 'Experiments/Analyses/Project/Sample1/XRD_02/', folderCounter: '02' }
[NoteCreator] Resolved note title: Sample1 - XRD_02
```

## Related Files

- `/src/types/templates.ts` - CounterSegment type definition
- `/src/core/templates/PathEvaluator.ts` - Counter inheritance logic
- `/src/core/notes/NoteCreator.ts` - Folder → Title execution flow
- `/src/settings/settings.ts` - Analysis template configuration

## Migration Notes

This feature is fully backward compatible:
- Existing templates without `inheritFrom` work unchanged
- Counter segments without the property compute normally
- No migration needed for existing vaults

## Future Enhancements

Potential improvements:
1. Support inheriting from other sources (e.g., `inheritFrom: "parentFolder"`)
2. Allow counter arithmetic (e.g., `inheritedCounter + 100`)
3. Support multiple inheritance sources for complex scenarios
4. Add validation to warn if `inheritFrom` used without matching counter in folderPath
