# Reactive Tags Field Fix

## Problem
The `tags` field in the chemical template has a function that depends on the `chemical.type` user input, but this creates a circular dependency problem:

1. The `tags` value depends on `chemical.type` 
2. But `chemical.type` might not be set when the form is initialized
3. The value needs to update dynamically when the user changes the chemical type

## Current Template Definition
In `chemical.ts`, the tags field is defined as:
```typescript
"tags": {
  "query": false,
  "inputType": "list",
  "default": { 
    type: "function", 
    userInputs: ["chemical.type"],
    value: "chemical.type ? [`chemical/${chemical.type.replace(/\\s/g, '_')}`] : ['chemical/unknown']"
  },
}
```

The function depends on `chemical.type` but this input might not be available when the form first loads.

## Solution Implemented

### 1. Enhanced Template Processing System
- Reactive function descriptors with `userInputs` are kept as-is during template processing
- They are not evaluated immediately but preserved for dynamic evaluation

### 2. Modal Data Change Handler
Modified `NewNoteModalRefactored.ts` to include a reactive update system:

- **`handleDataChange()`** - Triggered whenever form data changes
- **`updateReactiveFields()`** - Recursively checks all template fields for reactive dependencies
- **`updateFieldIfReactive()`** - Re-evaluates individual fields when their dependencies change
- **`checkIfFieldNeedsReactiveUpdate()`** - Checks if a field has user input dependencies that are now satisfied

### 3. Type Guard Implementation
Added proper TypeScript type guards to handle function descriptors in processed templates:

```typescript
private isFunctionDescriptor(value: unknown): value is FunctionDescriptor {
    return (
        typeof value === 'object' &&
        value !== null &&
        'type' in value &&
        'value' in value &&
        (value as FunctionDescriptor).type === 'function' &&
        typeof (value as FunctionDescriptor).value === 'string'
    );
}
```

## How It Works

1. **Initial Load**: The `tags` field starts empty or with a default value since `chemical.type` is not set
2. **User Input**: When user selects a chemical type (e.g., "solvent"), the change callback is triggered
3. **Reactive Update**: The system:
   - Detects that `tags` field depends on `chemical.type`
   - Re-evaluates the function: `chemical.type ? [`chemical/${chemical.type.replace(/\\s/g, '_')}`] : ['chemical/unknown']`
   - Updates the tags field to `["chemical/solvent"]`
   - Refreshes the UI to show the new value

## Integration Points

- **TemplateEvaluator**: Already had the infrastructure for reactive evaluation
- **TemplateManager**: Provides `updateDataContext()` and `evaluateFieldDefault()` methods
- **InputManager**: Handles setting updated values via `setValue()`
- **UniversalObjectRenderer**: Automatically re-renders when data changes through its change callback

## Benefits

1. **No Circular Dependencies**: Fields are evaluated only when their dependencies become available
2. **Dynamic Updates**: Values automatically update when user changes dependent fields
3. **Clean Architecture**: Uses existing template evaluation infrastructure
4. **Type Safe**: Proper TypeScript integration with type guards

## Testing

The fix can be tested by:
1. Opening the chemical note creation modal
2. Leaving `chemical.type` empty initially - `tags` should be empty or default
3. Selecting a chemical type (e.g., "solvent") - `tags` should automatically update to `["chemical/solvent"]`
4. Changing the chemical type - `tags` should update accordingly

## Files Modified

- `src/ui/modals/notes/NewNoteModalRefactored.ts` - Added reactive update system
- Enhanced change callback to trigger reactive field updates
- Added helper methods for dependency detection and field updates
- Added proper TypeScript types and type guards

The solution builds upon the existing template evaluation infrastructure and provides a robust system for handling dynamic field dependencies.
