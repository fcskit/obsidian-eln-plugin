# Phase 1.2 Complete: FunctionEvaluator.ts ✅

## Summary

Successfully created `src/core/templates/FunctionEvaluator.ts` - a NEW, separate function evaluator with dual syntax support and safe context evaluation. This evaluator is isolated from the legacy TemplateEvaluator to minimize risk during migration.

## What Was Created

### FunctionEvaluator Class

A comprehensive function evaluator that:
- ✅ Supports **simple expression syntax** (explicit context)
- ✅ Supports **complex function syntax** (inferred context from parameters)
- ✅ Rejects **legacy format** with clear error messages
- ✅ Uses **safe context interfaces** from ContextFactory
- ✅ Includes **reactive dependencies** checking
- ✅ Provides **fallback values** when dependencies not met
- ✅ Full **error handling** and logging

### Type Definitions

Added comprehensive type definitions in FunctionEvaluator.ts:

```typescript
export type ContextType = 
    | "userInput" | "settings" | "plugin" 
    | "noteMetadata" | "fs" | "vault" | "subclasses";

export interface SimpleFunctionDescriptor {
    type: "function";
    context: ContextType[];
    expression: string;
    reactiveDeps?: string[];
    fallback?: unknown;
}

export interface ComplexFunctionDescriptor {
    type: "function";
    function: string;  // Arrow function with inferred context
    reactiveDeps?: string[];
    fallback?: unknown;
}

export interface LegacyFunctionDescriptor {
    type: "function";
    value: string;  // Old format - REJECTED
}

export type EnhancedFunctionDescriptor = 
    | SimpleFunctionDescriptor 
    | ComplexFunctionDescriptor 
    | LegacyFunctionDescriptor;
```

## Key Features

### 1. Dual Syntax Support

**Simple Expression Syntax (Explicit Context):**
```typescript
{
    type: "function",
    context: ["settings", "userInput"],
    expression: "settings.operators[userInput.sample.operator].initials",
    reactiveDeps: ["sample.operator"],
    fallback: "unknown"
}
```

**Complex Function Syntax (Inferred Context):**
```typescript
{
    type: "function",
    function: "({ userInput, settings }) => settings.operators[userInput.sample.operator].initials",
    reactiveDeps: ["sample.operator"],
    fallback: "unknown"
}
```

### 2. Context Inference

The evaluator can parse arrow function parameters to extract context names:

- Destructured: `({ userInput, settings }) => ...` → `["userInput", "settings"]`
- Single with parens: `(userInput) => ...` → `["userInput"]`
- Single no parens: `userInput => ...` → `["userInput"]`

### 3. Safe Context Evaluation

All contexts use the safe interfaces from ContextFactory:
- `userInput` - Direct form data (read-only)
- `settings` - SettingsContext (safe property access)
- `plugin` - PluginContext (metadata only)
- `fs` - FileSystemContext (read-only operations)
- `vault` - VaultContext (read-only queries)
- `noteMetadata` - NoteMetadataContext (read-only access)
- `subclasses` - SubclassContext (read-only definitions)

### 4. Reactive Dependencies

Functions can specify dependencies that must be satisfied:

```typescript
{
    function: "({ userInput }) => userInput.sample.name.toUpperCase()",
    reactiveDeps: ["sample.name"],  // Must exist and not be empty
    fallback: "UNKNOWN"              // Used if dependency not met
}
```

### 5. Legacy Format Rejection

Legacy format is explicitly rejected with helpful error:

```typescript
{
    type: "function",
    value: "this.settings.operators[0].initials"  // ❌ REJECTED
}
// Error: "Legacy function descriptors are not supported in FunctionEvaluator. 
//         Please migrate to new format..."
```

## Public API

### `evaluateFunction(descriptor, userInput, noteType?): unknown`

Main entry point for function evaluation.

**Parameters:**
- `descriptor` - EnhancedFunctionDescriptor (simple, complex, or legacy)
- `userInput` - FormData from user input
- `noteType` - Optional note type for subclass context

**Returns:**
- Evaluated result or fallback value

**Throws:**
- Error if legacy format detected
- Error if invalid context type
- Error if cannot parse function

## Implementation Details

### Type Guards

```typescript
private isSimpleFunctionDescriptor(descriptor): descriptor is SimpleFunctionDescriptor
private isComplexFunctionDescriptor(descriptor): descriptor is ComplexFunctionDescriptor
```

### Context Management

```typescript
private extractContextNames(functionStr: string): ContextType[]
private validateContextNames(names: string[]): ContextType[]
private buildContexts(contextNames, userInput, noteType?): Record<string, unknown>
```

### Dependency Checking

```typescript
private checkDependencies(deps: string[], userInput: FormData): boolean
private getNestedValue(obj: unknown, path: string): unknown
```

## Architecture Decisions

### ✅ Separation from TemplateEvaluator

**Why separate?**
1. **Risk mitigation** - Existing metadata evaluation continues unchanged
2. **Isolated testing** - Can test path generation independently
3. **Gradual migration** - Prove new system before migrating legacy code
4. **Easy rollback** - If issues arise, just stop using FunctionEvaluator

### ✅ Dual Syntax Support

**Why both syntaxes?**
1. **Simple cases** - Expression syntax is clearer and more explicit
2. **Complex cases** - Function syntax provides full JavaScript power
3. **No redundancy** - Function syntax infers context automatically
4. **Flexibility** - Use the right tool for the job

### ✅ Safe Contexts Only

**Why safe interfaces?**
1. **Security** - Prevents dangerous operations (file write/delete, prototype pollution)
2. **Predictability** - Limited API surface reduces complexity
3. **Testability** - Easy to mock safe interfaces
4. **Documentation** - Clear what's available in templates

## File Details

- **Location**: `src/core/templates/FunctionEvaluator.ts`
- **Lines**: ~430 lines
- **Dependencies**: 
  - `src/utils/Logger.ts` (logging)
  - `src/core/templates/ContextProviders.ts` (safe contexts)
  - `src/main.ts` (ElnPlugin type)
  - `src/types/forms.ts` (FormData type)

## Build Status

✅ **Build Successful** - No TypeScript errors
✅ **All methods implemented**
✅ **Full documentation with JSDoc comments**
✅ **Comprehensive error handling**

## Testing Recommendations

Before proceeding to Phase 1.3, consider:

1. **Unit Tests for Simple Expressions:**
   - Basic property access: `userInput.name`
   - Nested property access: `settings.operators[0].initials`
   - Method calls: `userInput.name.toUpperCase()`
   - Arithmetic: `userInput.count * 2`

2. **Unit Tests for Complex Functions:**
   - Array construction: `[userInput.type, userInput.name]`
   - Object construction: `{ type: userInput.type }`
   - Conditional logic: `userInput.count > 10 ? 'high' : 'low'`
   - Multiple statements (with parens)

3. **Unit Tests for Context Inference:**
   - Destructured parameters: `({ userInput, settings })`
   - Single parameter with parens: `(userInput)`
   - Single parameter no parens: `userInput`
   - Invalid formats (should throw)

4. **Unit Tests for Dependencies:**
   - All dependencies satisfied
   - Some dependencies missing (use fallback)
   - Empty string dependencies (use fallback)
   - Null/undefined dependencies (use fallback)

5. **Unit Tests for Legacy Rejection:**
   - Legacy format throws error
   - Error message is helpful

6. **Integration Tests:**
   - Use with all context types
   - Use with noteType for subclasses
   - Error handling with invalid contexts

## Usage Example

```typescript
const evaluator = new FunctionEvaluator(plugin);

// Simple expression
const result1 = evaluator.evaluateFunction({
    type: "function",
    context: ["userInput"],
    expression: "userInput.name.toUpperCase()"
}, userInput);

// Complex function
const result2 = evaluator.evaluateFunction({
    type: "function",
    function: "({ userInput, fs }) => `${userInput.name}-${fs.getNextCounter(userInput.name, 3)}`",
    reactiveDeps: ["name"],
    fallback: "untitled"
}, userInput);
```

## Next Steps

Ready to proceed to **Phase 1.3**: Update type definitions

This will:
- Export SimpleFunctionDescriptor and ComplexFunctionDescriptor from types/templates.ts
- Add PathSegment type definitions (literal, field, function, counter)
- Add new PathTemplate interface
- Update existing types to reference new structures

---

**Status**: ✅ Complete  
**Date**: 2026-01-19  
**Next**: Phase 1.3 - Update type definitions for dual syntax
