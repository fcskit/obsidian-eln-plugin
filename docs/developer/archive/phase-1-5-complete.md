# Phase 1.5 Complete: PathEvaluator.ts

**Status**: ✅ COMPLETE  
**Date**: January 19, 2026  
**File**: `src/core/templates/PathEvaluator.ts` (~360 lines)

## Overview

Phase 1.5 completes the creation of the new PathEvaluator class, which is the first real consumer of the FunctionEvaluator created in Phase 1.2. This evaluator handles the new PathTemplate structure with discriminated union segments.

## Implementation Details

### Core Class: PathEvaluator

```typescript
export class PathEvaluator {
    private plugin: ElnPlugin;
    private functionEvaluator: FunctionEvaluator;
    
    constructor(plugin: ElnPlugin);
    
    async evaluatePath(
        template: PathTemplate,
        options: PathEvaluatorOptions
    ): Promise<string>;
}
```

### Supported Segment Types

PathEvaluator supports all four segment types defined in Phase 1.3:

#### 1. Literal Segment
Static text that appears as-is in the path:

```typescript
{
    kind: "literal",
    value: "Experiments",
    separator: "/"
}
// Generates: "Experiments/"
```

#### 2. Field Segment
Extract values from userInput with optional transformations:

```typescript
{
    kind: "field",
    path: "userInput.project.name",
    transform: "slugify",
    separator: "_"
}
// If userInput.project.name = "My Project"
// Generates: "my-project_"
```

**Supported Transformations**:
- `uppercase` - Convert to UPPERCASE
- `lowercase` - Convert to lowercase
- `capitalize` - Capitalize First Letter
- `trim` - Remove leading/trailing whitespace
- `slugify` - Convert to URL-friendly slug (kebab-case)

#### 3. Function Segment
Dynamic computation using FunctionEvaluator:

```typescript
// Simple expression format
{
    kind: "function",
    context: ["settings", "userInput"],
    expression: "settings.operators[userInput.operator].initials",
    fallback: "XX",
    separator: "-"
}

// Complex function format
{
    kind: "function",
    function: "({ date }) => date.format('YYYY-MM-DD')",
    separator: "_"
}
```

#### 4. Counter Segment
Auto-increment numbers based on existing files:

```typescript
{
    kind: "counter",
    prefix: "EXP-2026-",
    width: 3,
    separator: ""
}
// If files exist: EXP-2026-001, EXP-2026-002
// Generates: "003"
```

### Key Features

1. **Async Evaluation**: Supports async operations for counter resolution and function evaluation
2. **Error Resilience**: Failed segment evaluation doesn't stop the entire path generation
3. **Fallback Support**: Function segments can specify fallback values for error cases
4. **Logging**: Comprehensive debug logging at 'path' component level
5. **Type Safety**: Full TypeScript typing with discriminated unions

### Internal Methods

#### evaluateSegment()
Routes segment evaluation based on `kind` property using TypeScript discriminated unions.

#### evaluateLiteral()
Returns static value with separator.

#### evaluateField()
1. Extracts value from userInput using dot notation path
2. Applies optional transformation
3. Returns stringified value

#### evaluateFunction()
1. Builds appropriate function descriptor (simple or complex)
2. Delegates to FunctionEvaluator
3. Handles errors with fallback support
4. Returns stringified result

#### evaluateCounter()
1. Resolves target folder from path
2. Scans existing files for highest counter with matching prefix
3. Returns incremented counter with zero-padding

#### Helper Methods
- `getNestedValue()` - Extract nested object properties using dot notation
- `applyTransform()` - Apply string transformations
- `escapeRegex()` - Escape special regex characters for pattern matching

## Usage Example

```typescript
import { PathEvaluator } from './core/templates/PathEvaluator';

const evaluator = new PathEvaluator(plugin);

const template: PathTemplate = {
    segments: [
        { kind: "literal", value: "Experiments", separator: "/" },
        { kind: "field", path: "project.name", transform: "slugify", separator: "/" },
        { kind: "literal", value: "EXP", separator: "-" },
        { kind: "counter", prefix: "EXP-", width: 3, separator: "" }
    ]
};

const options = {
    plugin: plugin,
    userInput: { project: { name: "Quantum Study" } },
    targetFolder: "Experiments/quantum-study"
};

const path = await evaluator.evaluatePath(template, options);
// Result: "Experiments/quantum-study/EXP-001"
```

## Integration Points

### FunctionEvaluator Integration
PathEvaluator is the first component to use FunctionEvaluator in production:

```typescript
const result = await this.functionEvaluator.evaluateFunction(
    functionDescriptor,
    options.userInput,
    options.dateOffset  // Passed to DateContext
);
```

### FormData Type
Uses the FormData type from `src/types/forms.ts` for type-safe userInput:

```typescript
export interface PathEvaluatorOptions {
    plugin: ElnPlugin;
    userInput: FormData;
    targetFolder?: string;
    dateOffset?: string;
}
```

## Error Handling

PathEvaluator implements defensive error handling at multiple levels:

1. **Segment-level**: Failed segments return empty string, don't halt evaluation
2. **Function-level**: Uses fallback values when specified
3. **Counter-level**: Returns default "01" on folder resolution errors
4. **Logging**: All errors logged with context for debugging

```typescript
try {
    const result = await this.evaluateSegment(segment, options);
    if (result.value) {
        results.push(result);
    }
} catch (error) {
    logger.error(`Failed to evaluate segment`, { segment, error });
    // Continue with other segments
}
```

## Testing Considerations

### Unit Tests (To Be Created)
- Test each segment type in isolation
- Test transformation functions
- Test counter incrementation logic
- Test error handling and fallbacks
- Test nested path extraction

### Integration Tests (To Be Created)
- Test with real FunctionEvaluator
- Test with vault file system
- Test counter behavior with existing files
- Test DateContext integration

## Performance Characteristics

- **Literal segments**: O(1) - instant
- **Field segments**: O(depth) - depends on nesting level
- **Function segments**: O(n) - depends on function complexity
- **Counter segments**: O(files) - scans folder contents

Most path evaluations should complete in < 10ms unless counter resolution involves large folders.

## Next Steps: Phase 1.6

Now that PathEvaluator is complete, the next phase will integrate it into the note creation flow:

1. Update `NoteCreator.ts` to use PathEvaluator
2. Update `NewNoteModal.ts` to use PathEvaluator
3. Replace legacy PathTemplateParser calls
4. Maintain backward compatibility with legacy LegacyPathTemplate format
5. Test with existing user templates

## Files Modified

1. ✅ Created `src/core/templates/PathEvaluator.ts` (~360 lines)
2. ✅ Build successful - no TypeScript errors
3. ✅ All imports resolved correctly
4. ✅ Logger integration working

## Build Status

```
✅ CSS bundled successfully
✅ No TypeScript errors
✅ Assets copied to test-vault
```

## Migration Status

| Phase | Status | Description |
|-------|--------|-------------|
| 1.1 | ✅ Complete | ContextProviders.ts with 8 safe contexts |
| 1.2 | ✅ Complete | FunctionEvaluator.ts with dual syntax |
| 1.3 | ✅ Complete | Type definitions with PathSegment union |
| 1.4 | ✅ Complete | DateContext + settings key renames |
| 1.5 | ✅ Complete | **PathEvaluator.ts** (current) |
| 1.6 | 🔄 Next | Integration with NoteCreator |

Phase 1 is nearly complete! Only integration step remains.
