# InputManager System

## Overview

The `InputManager` class provides centralized state management for form inputs and data in the Obsidian ELN plugin. It was created to solve issues with the `ImprovedEditableObject` component needing access to shared state from `NewNoteModal`, and to support advanced features like editable keys and type switching.

## Problem Solved

**Before:** 
- `ImprovedEditableObject` couldn't access `NewNoteModal`'s `this.data` and `this.inputs`
- No support for editable keys or type switching in template-driven inputs
- Complex nested object handling was difficult
- Data synchronization between components was manual and error-prone

**After:**
- `InputManager` centralizes all data and input state management
- Clean separation of concerns between UI and data
- Automatic support for key renaming and type switching
- Easy nested object handling with key paths

## Architecture

### Core Classes

1. **`InputManager`** - Central state management
   - Manages form data and input component references
   - Supports nested key paths (e.g., `"parent.child.key"`)
   - Provides key renaming with order preservation
   - Triggers change callbacks

2. **`renderModularInputs`** - Template-driven input rendering
   - Uses `InputManager` for state management
   - Supports all input types from metadata templates
   - Handles editable keys and type switching
   - Works with nested object structures

3. **`ImprovedEditableObject`** - Enhanced object editing
   - Now accepts full metadata templates
   - Uses shared `InputManager` for state
   - Supports complex nested structures
   - Maintains CSS class names for styling

## Key Features

### 1. Centralized State Management
```typescript
const inputManager = new InputManager(initialData, onChange);
```

### 2. Key Path Support
```typescript
inputManager.setValue("device.specs.cpu", "Intel i7");
inputManager.getValue("device.specs.cpu"); // "Intel i7"
```

### 3. Key Renaming with Order Preservation
```typescript
// Original: { name: "John", age: 30, email: "john@example.com" }
inputManager.renameKey("age", "years");
// Result: { name: "John", years: 30, email: "john@example.com" }
// Key order is preserved!
```

### 4. Template-Driven Rendering
```typescript
renderModularInputs(container, template, {
    app,
    inputManager,
    editableKeys: true,
    allowTypeSwitch: true
});
```

## Usage Examples

### NewNoteModal Integration
```typescript
class NewNoteModal {
    private inputManager: InputManager;
    
    constructor() {
        this.inputManager = new InputManager({}, (data) => {
            this.onDataChange(data);
        });
    }
    
    renderInputs() {
        createInputsWithManager(
            container, 
            this.template, 
            this.app, 
            {}, 
            (data) => this.updatePreview(data)
        );
    }
}
```

### ImprovedEditableObject Usage
```typescript
new ImprovedEditableObject({
    container,
    label: "Device Settings",
    template: deviceMetadataTemplate,
    inputManager: sharedInputManager,
    onChangeCallback: (data) => console.log(data),
    app
});
```

## Migration Guide

### From Old System
```typescript
// OLD WAY:
// this.data = {};
// this.inputs = {};
// this.renderInputs(container, template);

// NEW WAY:
const inputManager = new InputManager({}, (data) => {
    // Handle changes
});
createInputsWithManager(container, template, app, {}, onChange);
```

### Benefits
- ✅ **Modularity**: InputManager can be passed between components
- ✅ **DRY**: No more duplicated data/input state management  
- ✅ **Type Safety**: Centralized type handling and validation
- ✅ **Flexibility**: Support for editable keys and type switching
- ✅ **Nested Support**: Easy handling of complex nested structures
- ✅ **Debugging**: Centralized change tracking and logging

## API Reference

### InputManager Methods

#### Data Management
- `setValue(keyPath: string, value: FormFieldValue): void`
- `getValue(keyPath: string): FormFieldValue | undefined`
- `removeValue(keyPath: string): void`
- `renameKey(keyPath: string, newKey: string): void`

#### Input Component Management  
- `setInput(keyPath: string, input: any): void`
- `getInput(keyPath: string): any`
- `removeInput(keyPath: string): void`
- `renameInputKey(keyPath: string, newKey: string): void`

#### Nested Access
- `getNestedData(keyPath: string): FormData`
- `getNestedInputs(keyPath: string): InputComponents`

#### Overall State
- `getData(): FormData`
- `updateData(newData: FormData): void`
- `clear(): void`

## Implementation Notes

### Key Order Preservation
The `renameKey()` and `renameInputKey()` methods preserve the original order of keys in objects by:
1. Creating a new object with the same key order
2. Iterating through original keys in order
3. Replacing the target key name in the same position
4. Replacing object content while maintaining references

### Change Tracking
All data modifications trigger the change callback, enabling reactive UI updates and validation.

### Nested Path Handling
Key paths use dot notation (`"parent.child.key"`) and automatically create intermediate objects as needed.
