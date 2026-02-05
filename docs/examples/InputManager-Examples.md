# InputManager Usage Examples

This document provides practical examples of how to integrate the `InputManager` system with existing components like `NewNoteModal` and `ImprovedEditableObject`.

## Basic Usage

### Creating an InputManager

```typescript
import { InputManager } from "../ui/modals/components/InputManager";

// Create with initial data and change callback
const inputManager = new InputManager(
    { name: "John", age: 30 }, // initial data
    (data) => {
        console.log("Data changed:", data);
        // Handle data changes (update UI, validate, etc.)
    }
);
```

### Setting and Getting Values

```typescript
// Set values (supports nested paths)
inputManager.setValue("user.profile.name", "Jane Doe");
inputManager.setValue("user.profile.email", "jane@example.com");

// Get values
const name = inputManager.getValue("user.profile.name"); // "Jane Doe"
const profile = inputManager.getValue("user.profile"); // entire profile object

// Get all data
const allData = inputManager.getData();
```

## NewNoteModal Integration

### Before (Old System)
```typescript
class NewNoteModal {
    private data: FormData = {};
    private inputs: InputComponents = {};
    
    constructor() {
        this.renderInputs();
    }
    
    private renderInputs() {
        // Manual input creation and data management
        // Complex synchronization between data and inputs
    }
}
```

### After (With InputManager)
```typescript
import { InputManager } from "./components/InputManager";
import { createInputsWithManager } from "./components/InputManagerHelpers";

class NewNoteModal {
    private inputManager: InputManager;
    
    constructor(template: MetaDataTemplateProcessed) {
        // Initialize InputManager with change callback
        this.inputManager = new InputManager({}, (data) => {
            this.onDataChange(data);
        });
        
        this.renderInputs(template);
    }
    
    private renderInputs(template: MetaDataTemplateProcessed) {
        const formContainer = this.containerEl.createDiv({ cls: "form-container" });
        
        // Option 1: Use helper function (recommended)
        createInputsWithManager(
            formContainer,
            template,
            this.app,
            {}, // initial data
            (data) => this.onDataChange(data)
        );
        
        // Option 2: Use renderModularInputs directly
        // renderModularInputs(formContainer, template, {
        //     app: this.app,
        //     inputManager: this.inputManager,
        //     onChange: (key, value) => this.onFieldChange(key, value)
        // });
    }
    
    private onDataChange(data: FormData) {
        this.updatePreview(data);
        this.validateForm(data);
    }
    
    // Easy access to form data
    public getFormData(): FormData {
        return this.inputManager.getData();
    }
    
    public setFieldValue(key: string, value: FormFieldValue) {
        this.inputManager.setValue(key, value);
    }
}
```

## ImprovedEditableObject Usage

### Standalone Usage
```typescript
import { ImprovedEditableObject } from "./components/ImprovedEditableObject";
import { InputManager } from "./components/InputManager";

// Create a shared InputManager
const inputManager = new InputManager();

// Create editable object with template
new ImprovedEditableObject({
    container: containerEl,
    label: "Device Configuration",
    template: deviceTemplate, // Full metadata template
    inputManager: inputManager, // Shared state
    onChangeCallback: (data) => {
        console.log("Device config changed:", data);
    },
    app: this.app
});
```

### Within NewNoteModal
```typescript
class NewNoteModal {
    private inputManager: InputManager;
    
    private renderDeviceSection() {
        const deviceContainer = this.formContainer.createDiv({ cls: "device-section" });
        
        // Create ImprovedEditableObject that shares the same InputManager
        new ImprovedEditableObject({
            container: deviceContainer,
            label: "Device Specifications",
            template: this.templates.device, // From metadata template
            inputManager: this.inputManager, // Shared with modal
            onChangeCallback: (data) => {
                // Data is automatically synced through InputManager
                this.updateDevicePreview(data);
            },
            app: this.app
        });
    }
}
```

## Advanced Features

### Editable Keys and Type Switching
```typescript
import { renderModularInputs } from "./components/renderModularInputs";

// Render inputs with advanced features
renderModularInputs(container, template, {
    app: this.app,
    inputManager: this.inputManager,
    editableKeys: true,      // Allow users to rename field keys
    allowTypeSwitch: true,   // Allow users to change input types
    onChange: (key, value) => {
        console.log(`${key} changed to:`, value);
    }
});
```

### Nested Object Handling
```typescript
// Working with nested data structures
const inputManager = new InputManager({
    experiment: {
        conditions: {
            temperature: 25,
            pressure: 1.0,
            humidity: 60
        },
        results: {
            yield: 85.5,
            purity: 99.2
        }
    }
});

// Access nested values
const temperature = inputManager.getValue("experiment.conditions.temperature");

// Rename nested keys while preserving order
inputManager.renameKey("experiment.conditions.pressure", "atmosphericPressure");

// Result: experiment.conditions.atmosphericPressure exists in same position
```

### Key Renaming with Order Preservation
```typescript
// Original object
inputManager.updateData({
    firstName: "John",
    lastName: "Doe", 
    email: "john@example.com",
    phone: "123-456-7890"
});

// Rename a key - order is preserved
inputManager.renameKey("lastName", "surname");

// Result maintains order:
// {
//     firstName: "John",
//     surname: "Doe",           // Same position as lastName
//     email: "john@example.com",
//     phone: "123-456-7890"
// }
```

## Helper Functions

### createInputsWithManager
```typescript
import { createInputsWithManager } from "./components/InputManagerHelpers";

// Simple way to create inputs from a template
const inputManager = createInputsWithManager(
    container,
    template,
    app,
    initialData,
    onChange
);
```

### createEditableInputsWithManager
```typescript
import { createEditableInputsWithManager } from "./components/InputManagerHelpers";

// Create inputs with editing capabilities
createEditableInputsWithManager(
    container,
    template,
    app,
    inputManager,
    onChange
);
```

## Migration Checklist

When migrating from the old system to InputManager:

1. ✅ Replace `private data: FormData = {}` with `private inputManager: InputManager`
2. ✅ Replace `private inputs: InputComponents = {}` with InputManager usage
3. ✅ Update constructor to initialize InputManager with change callback
4. ✅ Replace manual input creation with `createInputsWithManager()` or `renderModularInputs()`
5. ✅ Update data access methods:
   - `this.data[key]` → `this.inputManager.getValue(key)`
   - `this.data[key] = value` → `this.inputManager.setValue(key, value)`
   - `{...this.data}` → `this.inputManager.getData()`
6. ✅ Update ImprovedEditableObject usage to pass `inputManager` instead of `data`/`inputs`
7. ✅ Test key renaming and order preservation
8. ✅ Verify nested object handling works correctly

## Benefits Summary

- 🎯 **Centralized State**: Single source of truth for form data and inputs
- 🔄 **Automatic Sync**: Changes propagate automatically between components
- 📝 **Editable Keys**: Users can rename field keys while preserving order
- 🔀 **Type Switching**: Dynamic input type changes with metadata templates
- 🎨 **Clean Architecture**: Separation of UI and data management concerns
- 🧪 **Easy Testing**: Centralized state makes testing simpler
- 🐛 **Better Debugging**: Single point for data tracking and logging
