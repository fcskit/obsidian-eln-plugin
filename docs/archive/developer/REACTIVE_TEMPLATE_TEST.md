# Reactive Template System Test

This document outlines the changes made to support reactive function descriptors and tests for the chemical template.

## Changes Made

1. **Function Descriptor Structure**: Updated to include `userInputs` inside the descriptor:
   ```typescript
   {
     type: "function",
     userInputs: ["chemical.type"],
     value: "chemical.type ? chemical.type.map(item => `chemical/${(item || 'unknown').replace(/\\s/g, '_')}`) : ['chemical/unknown']"
   }
   ```

2. **ProcessMetadata Function**: Updated to handle function descriptors properly in the metadata processing:
   - Added `isFunctionDescriptor` check for default values
   - Evaluates function descriptors with current user data

3. **ProcessDynamicFields Function**: Modified to preserve reactive function descriptors:
   - Non-reactive function descriptors (without `userInputs`) are evaluated at initialization
   - Reactive function descriptors (with `userInputs`) are kept as-is for later evaluation

4. **Reactive Update System**: The existing system should now work properly:
   - When a field changes, `updateDependentFields` is called
   - Fields with matching `userInputs` dependencies are re-evaluated
   - UI is updated with new values

## Test Case: Chemical Template Tags Field

The `tags` field in the chemical template is configured as:
```typescript
"tags": {
  "query": false,
  "inputType": "list",
  "default": { 
    type: "function", 
    userInputs: ["chemical.type"],
    value: "chemical.type ? chemical.type.map(item => `chemical/${(item || 'unknown').replace(/\\s/g, '_')}`) : ['chemical/unknown']" 
  },
}
```

### Expected Behavior

1. **Initial State**: Tags field should show default value `['chemical/unknown']`
2. **When chemical.type changes**: Tags field should update automatically
   - If `chemical.type = ["organic"]` → tags should become `["chemical/organic"]`
   - If `chemical.type = ["polymer", "binder"]` → tags should become `["chemical/polymer", "chemical/binder"]`
3. **Generated Metadata**: The tags field should always be present in the final note metadata

## Issues Resolved

1. **Missing tags in metadata**: Fixed by updating `processMetadata` to handle function descriptors
2. **Proper reactive structure**: `userInputs` is now correctly part of the function descriptor object
3. **Initialization vs. Reactive evaluation**: Function descriptors with `userInputs` are no longer evaluated at initialization, preserving their reactive nature

## Next Steps

- Test the chemical template to ensure tags field appears in generated metadata
- Verify that changing chemical.type updates the tags field reactively
- Test other reactive fields if any
