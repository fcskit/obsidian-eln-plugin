# Phase 1.3 Complete: Type Definitions Updated ✅

## Summary

Successfully updated `src/types/templates.ts` with comprehensive type definitions for the new path template system and dual function syntax. All types are well-documented, organized, and maintain backward compatibility with existing code.

## What Was Added

### 1. Context Type

```typescript
export type ContextType = 
    | "userInput"      // Current form data (read-only)
    | "settings"       // Plugin settings (safe interface)
    | "plugin"         // Plugin metadata (safe interface)
    | "noteMetadata"   // Other notes' metadata (safe interface)
    | "fs"             // File system operations (safe interface)
    | "vault"          // Vault operations (safe interface)
    | "subclasses";    // Subclass definitions (safe interface)
```

### 2. Function Descriptors (New Format)

**SimpleFunctionDescriptor** - For inline expressions with explicit context:
```typescript
export interface SimpleFunctionDescriptor {
    type: "function";
    context: ContextType[];
    expression: string;
    reactiveDeps?: string[];
    fallback?: unknown;
}
```

**ComplexFunctionDescriptor** - For arrow functions with inferred context:
```typescript
export interface ComplexFunctionDescriptor {
    type: "function";
    function: string;
    reactiveDeps?: string[];
    fallback?: unknown;
}
```

**NewFunctionDescriptor** - Union type:
```typescript
export type NewFunctionDescriptor = 
    SimpleFunctionDescriptor | ComplexFunctionDescriptor;
```

### 3. Path Segment Types

**LiteralSegment** - Static text:
```typescript
export interface LiteralSegment {
    kind: "literal";
    value: string;
    separator?: string;
}
```

**FieldSegment** - Extract value from user input:
```typescript
export interface FieldSegment {
    kind: "field";
    path: string;  // Dot notation: "userInput.project.name"
    transform?: "uppercase" | "lowercase" | "capitalize" | "kebab-case" | "snake-case";
    separator?: string;
}
```

**FunctionSegment** - Dynamic value from function:
```typescript
export interface FunctionSegment {
    kind: "function";
    name?: string;
    // One of these two formats:
    context?: ContextType[];
    expression?: string;
    function?: string;
    // Common properties:
    reactiveDeps?: string[];
    fallback?: unknown;
    separator?: string;
}
```

**CounterSegment** - Auto-increment number:
```typescript
export interface CounterSegment {
    kind: "counter";
    prefix?: string;
    width?: number;
    separator?: string;
}
```

**PathSegment** - Union type:
```typescript
export type PathSegment = 
    | LiteralSegment
    | FieldSegment
    | FunctionSegment
    | CounterSegment;
```

### 4. New PathTemplate

```typescript
export interface PathTemplate {
    segments: PathSegment[];
}
```

## Backward Compatibility

### Legacy Types Preserved

All existing types are marked as `@deprecated` but remain functional:

```typescript
/**
 * @deprecated Legacy path template structure - use new PathTemplate with PathSegment[] instead
 */
export type LegacyPathTemplate = Array<{
    type: string;
    field: string;
    separator?: string;
}>;

/**
 * @deprecated Legacy function descriptor - migrate to SimpleFunctionDescriptor or ComplexFunctionDescriptor
 */
export interface FunctionDescriptor {
    type: "function";
    value: string;
    userInputs?: string[];
}

/**
 * @deprecated Use SimpleFunctionDescriptor or ComplexFunctionDescriptor instead
 */
export interface EnhancedFunctionDescriptor {
    type: "function";
    context: string[];
    reactiveDeps?: string[];
    function: string;
    fallback: unknown;
}
```

### MaybeFunction Updated

```typescript
/**
 * Helper type to check if a value is a function descriptor (any format)
 */
export type MaybeFunction<T> = T | AnyFunctionDescriptor | NewFunctionDescriptor;
```

Now supports both legacy and new function descriptor formats.

## Type Organization

The file is now organized into clear sections:

```typescript
// ============================================================================
// Legacy Path Template (Deprecated)
// ============================================================================

// ============================================================================
// Function Descriptors (Legacy formats)
// ============================================================================

// ============================================================================
// New Function Descriptors (Phase 1 - Dual Syntax Support)
// ============================================================================

// ============================================================================
// New Path Template Structure (Phase 1 - Unified Path Generation)
// ============================================================================

// ============================================================================
// Helper Types
// ============================================================================

// ============================================================================
// Metadata Template Types
// ============================================================================
```

## Documentation

All new types include:
- ✅ **JSDoc comments** explaining purpose
- ✅ **Inline comments** for each property
- ✅ **Code examples** showing usage
- ✅ **Type annotations** with clear semantics

### Example Documentation:

```typescript
/**
 * Field segment - extract value from user input
 * 
 * @example
 * {
 *   kind: "field",
 *   path: "userInput.project.name",
 *   transform: "kebab-case",
 *   separator: "_"
 * }
 * // If userInput.project.name = "My Project"
 * // Generates: "my-project_"
 */
export interface FieldSegment { ... }
```

## Integration with Existing Code

### FunctionEvaluator Updated

FunctionEvaluator now imports types from `types/templates.ts`:

```typescript
import type {
    ContextType,
    SimpleFunctionDescriptor,
    ComplexFunctionDescriptor
} from "../../types/templates";
```

This eliminates duplication and ensures single source of truth.

### No Breaking Changes

- ✅ Existing code continues to work
- ✅ Legacy types still available
- ✅ Deprecation warnings guide migration
- ✅ New code can use new types immediately

## Type Safety Benefits

### Discriminated Unions

PathSegment uses discriminated unions with `kind` property:

```typescript
function evaluateSegment(segment: PathSegment) {
    switch (segment.kind) {
        case "literal":
            return segment.value;  // ✓ TypeScript knows this is LiteralSegment
        case "field":
            return getField(segment.path);  // ✓ TypeScript knows this is FieldSegment
        case "function":
            return evaluateFunction(segment);  // ✓ TypeScript knows this is FunctionSegment
        case "counter":
            return getCounter(segment.prefix);  // ✓ TypeScript knows this is CounterSegment
    }
}
```

### Type Guards

Easy to create type guards:

```typescript
function isLiteralSegment(segment: PathSegment): segment is LiteralSegment {
    return segment.kind === "literal";
}

function isFunctionSegment(segment: PathSegment): segment is FunctionSegment {
    return segment.kind === "function";
}
```

## File Changes

### Modified Files

1. **`src/types/templates.ts`**
   - Added ~200 lines of new type definitions
   - Marked legacy types as deprecated
   - Organized into clear sections
   - Added comprehensive documentation

2. **`src/core/templates/FunctionEvaluator.ts`**
   - Removed duplicate type definitions
   - Imports types from templates.ts
   - Reduced code duplication

## Build Status

✅ **Build Successful** - No TypeScript errors  
✅ **No breaking changes** - All existing code compiles  
✅ **Type safety improved** - Discriminated unions for better inference  
✅ **Documentation complete** - All types have JSDoc comments

## Usage Examples

### Creating a Path Template

```typescript
const fileNameTemplate: PathTemplate = {
    segments: [
        {
            kind: "literal",
            value: "EXP",
            separator: "-"
        },
        {
            kind: "field",
            path: "userInput.project.code",
            transform: "uppercase",
            separator: "-"
        },
        {
            kind: "function",
            context: ["userInput", "fs"],
            expression: "fs.getNextCounter(`EXP-${userInput.project.code}`, 3)",
            reactiveDeps: ["project.code"],
            fallback: "001"
        }
    ]
};
// Generates: "EXP-ABC-001"
```

### Using Function Descriptors

```typescript
// Simple expression
const simple: SimpleFunctionDescriptor = {
    type: "function",
    context: ["userInput"],
    expression: "userInput.name.toUpperCase()",
    reactiveDeps: ["name"],
    fallback: "UNKNOWN"
};

// Complex function
const complex: ComplexFunctionDescriptor = {
    type: "function",
    function: "({ userInput, settings }) => settings.operators[userInput.operator].initials",
    reactiveDeps: ["operator"],
    fallback: "XX"
};
```

## Testing Recommendations

1. **Type Checking:**
   - ✓ Verify discriminated union type narrowing
   - ✓ Test type guards work correctly
   - ✓ Ensure MaybeFunction accepts all formats

2. **Backward Compatibility:**
   - ✓ Legacy code compiles without changes
   - ✓ Deprecation warnings appear for old types
   - ✓ Can mix legacy and new types temporarily

3. **Documentation:**
   - ✓ JSDoc comments render correctly in IDE
   - ✓ Code examples are syntactically correct
   - ✓ Type hints show helpful information

## Next Steps

Ready to proceed to **Phase 1.4: Create migration utility for key renames**

This will implement:
- `query` → `showInModal` migration
- `titleTemplate` → `fileName` migration
- `folderTemplate` → `folderPath` migration
- Migration utilities for settings and templates
- Version checking and automatic migration on plugin load

---

**Status**: ✅ Complete  
**Date**: 2026-01-19  
**Next**: Phase 1.4 - Create migration utility for key renames
