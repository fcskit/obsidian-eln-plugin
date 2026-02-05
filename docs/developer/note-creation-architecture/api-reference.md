# API Reference

## Overview

This document provides comprehensive API documentation for the unified note creation architecture, including enhanced InputManager methods, component interfaces, and integration patterns.

## InputManager Enhanced API

### Core Field Operations

```typescript
class InputManager {
    /**
     * Set a field value and trigger reactive evaluation
     * @param fieldPath Dot-notation path to field (e.g., "chemical.properties.molecular_weight")
     * @param value The value to set
     */
    setValue(fieldPath: string, value: FormFieldValue): void;

    /**
     * Get a field value
     * @param fieldPath Dot-notation path to field
     * @returns Current field value or undefined if not set
     */
    getValue(fieldPath: string): FormFieldValue | undefined;

    /**
     * Remove a field from the data structure
     * @param fieldPath Dot-notation path to field
     */
    removeField(fieldPath: string): void;
}
```

### Complex Field Operations

```typescript
class InputManager {
    /**
     * Rename a field while preserving field order
     * @param oldPath Current field path
     * @param newPath New field path
     */
    renameField(oldPath: string, newPath: string): void;

    /**
     * Add an item to an object list
     * @param listPath Path to the list field
     * @param index Index where to insert the item
     * @param itemObject Default object for the new list item
     */
    addListItem(listPath: string, index: number, itemObject: Record<string, any>): void;

    /**
     * Remove an item from an object list and renumber subsequent items
     * @param listPath Path to the list field
     * @param index Index of item to remove
     */
    removeListItem(listPath: string, index: number): void;

    /**
     * Change the input type of a field (for dynamic editable objects)
     * @param fieldPath Path to the field
     * @param newType New input type (text, number, dropdown, etc.)
     * @param defaultValue Optional default value for the new type
     */
    changeFieldType(fieldPath: string, newType: string, defaultValue?: any): void;
}
```

### Data Retrieval

```typescript
class InputManager {
    /**
     * Get structured object data for a specific path
     * @param objectPath Path to object (optional - returns all data if omitted)
     * @returns Reconstructed object from flat field structure
     */
    getData(objectPath?: string): any;

    /**
     * Get all field paths currently stored
     * @returns Array of all field paths
     */
    getAllFieldPaths(): string[];

    /**
     * Check if a field exists
     * @param fieldPath Path to check
     * @returns True if field exists
     */
    hasField(fieldPath: string): boolean;
}
```

### Reactive Field Integration

```typescript
class InputManager {
    /**
     * Initialize reactive field system with definitions from TemplateManager
     * @param reactiveFieldMap Map of reactive field configurations
     */
    setReactiveFieldDefinitions(reactiveFieldMap: ReactiveFieldMap): void;

    /**
     * Evaluate all reactive fields (called during initialization)
     */
    evaluateAllReactiveFields(): void;

    /**
     * Get reactive field dependencies for a field path
     * @param fieldPath Path to check
     * @returns Array of reactive fields that depend on this field
     */
    getReactiveDependents(fieldPath: string): string[];
}
```

### UI Update Management

```typescript
class InputManager {
    /**
     * Register callback for specific field changes
     * @param fieldPath Field to monitor
     * @param callback Function to call when field changes
     */
    registerFieldCallback(fieldPath: string, callback: (value: any) => void): void;

    /**
     * Register callback for structural changes (add/remove keys, list items)
     * @param objectPath Object to monitor
     * @param callback Function to call when structure changes
     */
    registerStructuralCallback(objectPath: string, callback: () => void): void;

    /**
     * Unregister field or structural callback
     * @param fieldPath Field path
     * @param callback Callback function to remove
     */
    unregisterCallback(fieldPath: string, callback: Function): void;
}
```

## Component Interfaces

### ProcessedTemplateField

```typescript
interface ProcessedTemplateField {
    // Core field properties
    display: boolean;                    // Whether to show in UI
    inputType: string;                  // Component type (text, dropdown, etc.)
    label?: string;                     // Display label
    placeholder?: string;               // Input placeholder text
    
    // Evaluated values (no functions)
    default: any;                       // Pre-evaluated default value
    options?: string[];                 // Pre-evaluated options array
    
    // Field configuration
    units?: string[];                   // Available units
    defaultUnit?: string;               // Default unit selection
    validation?: ValidationConfig;       // Validation rules
    
    // Calculated properties
    fieldPath: string;                  // Full path for InputManager
    isDisplayed: boolean;               // Pre-calculated visibility
    isEditable: boolean;                // User input allowed
    
    // Nested structures
    nestedObjectTemplate?: ProcessedObjectTemplate;  // For editableObject fields
    itemTemplate?: ProcessedObjectTemplate;          // For object list fields
}
```

### ProcessedObjectTemplate

```typescript
interface ProcessedObjectTemplate {
    fields: Record<string, ProcessedTemplateField>;  // All field definitions
    allowsNewFields: boolean;                        // Can user add new fields
    renderingMode: ObjectRenderingMode;              // UI rendering style
    
    // Optional metadata
    label?: string;                                  // Object display name
    description?: string;                            // Help text
}
```

### Component Constructor Patterns

#### Primitive Input Components

```typescript
// Pattern for field components
class LabeledPrimitiveInput {
    constructor(
        private fieldPath: string,
        private templateField: ProcessedTemplateField,
        private inputManager: InputManager
    ) {
        // All template data available directly
        this.label = templateField.label || this.deriveLabel(fieldPath);
        this.inputType = templateField.inputType;
        this.defaultValue = templateField.default;
        this.units = templateField.units;
        // ... initialize from templateField properties
    }
}

class LabeledDropdown {
    constructor(
        private fieldPath: string,
        private templateField: ProcessedTemplateField,
        private inputManager: InputManager
    ) {
        this.options = templateField.options; // Already evaluated array
        this.defaultValue = templateField.default;
    }
}
```

#### Object Renderer Components

```typescript
interface UniversalObjectRendererOptions {
    container: HTMLElement;
    label: string;
    objectPath: string;                        // Path for InputManager operations
    inputManager: InputManager;                // Required, not optional
    template: ProcessedObjectTemplate;         // Pre-processed template data
    defaultValue?: Record<string, FormFieldValue>;
    onChangeCallback?: (object: Record<string, FormFieldValue>) => void;
    app: App;
}

class UniversalObjectRenderer {
    constructor(options: UniversalObjectRendererOptions) {
        this.inputManager = options.inputManager;
        this.template = options.template;
        this.objectPath = options.objectPath;
        // No TemplateManager reference needed
    }
}
```

#### List Renderer Components

```typescript
class ObjectListRenderer {
    constructor(
        private listPath: string,
        private templateField: ProcessedTemplateField,
        private inputManager: InputManager
    ) {
        this.itemTemplate = templateField.itemTemplate; // Pre-processed
        this.maxItems = templateField.maxItems;
        this.minItems = templateField.minItems;
    }
}
```

## Reactive Field Types

### ReactiveFieldInfo

```typescript
interface ReactiveFieldInfo {
    fieldPath: string;                 // Full path to reactive field
    evaluationFunction: Function;      // Compiled function ready for execution
    dependencies: string[];            // Field paths this field depends on
    fallbackValue: any;               // Value to use if evaluation fails
}
```

### ReactiveFieldMap and DependencyMap

```typescript
// Maps reactive field path to its configuration
type ReactiveFieldMap = Map<string, ReactiveFieldInfo>;

// Maps dependency path to array of reactive fields that depend on it
// Enables efficient lookup during setValue operations
type DependencyMap = Map<string, string[]>;
```

## TemplateManager API

### Template Processing

```typescript
class TemplateManager {
    /**
     * Load and process a base template
     * @param templatePath Path identifier for template in plugin settings
     */
    async loadBaseTemplate(templatePath: string): Promise<void>;

    /**
     * Apply a subclass template to the base template
     * @param subclassName Name of subclass template to apply
     */
    async applySubclassTemplate(subclassName: string): Promise<void>;

    /**
     * Get the current processed template
     * @returns Fully processed template with all functions evaluated
     */
    getCurrentTemplate(): Record<string, unknown>;
}
```

### Data and Reactive Field Provision

```typescript
class TemplateManager {
    /**
     * Get initial metadata structure with all defaults populated
     * @returns Ready-to-use form data structure
     */
    getInitialMetadata(): Record<string, FormFieldValue>;

    /**
     * Get reactive field definitions for InputManager
     * @returns Map of all reactive field configurations
     */
    getReactiveFieldMap(): ReactiveFieldMap;

    /**
     * Generate ProcessedTemplateField for a specific field
     * @param fieldPath Path to field in template
     * @returns Complete processed field definition
     */
    getProcessedField(fieldPath: string): ProcessedTemplateField;

    /**
     * Generate ProcessedObjectTemplate for an object
     * @param objectPath Path to object in template
     * @returns Complete processed object template
     */
    getProcessedObjectTemplate(objectPath: string): ProcessedObjectTemplate;
}
```

## Form Field Value Types

```typescript
// Union type for all possible form field values
type FormFieldValue = string | number | boolean | null | 
                     FormFieldValue[] | 
                     Record<string, FormFieldValue>;

// Validation configuration
interface ValidationConfig {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    customValidator?: (value: any) => boolean | string;
}

// Object rendering modes
enum ObjectRenderingMode {
    GROUPED = 'grouped',        // Fields grouped in sections
    INLINE = 'inline',          // Fields in single row
    EXPANDED = 'expanded',      // All fields visible
    COLLAPSIBLE = 'collapsible' // Can be collapsed/expanded
}
```

## Error Handling

### InputManager Error Types

```typescript
class FieldNotFoundError extends Error {
    constructor(fieldPath: string) {
        super(`Field not found: ${fieldPath}`);
        this.name = 'FieldNotFoundError';
    }
}

class ReactiveFieldError extends Error {
    constructor(fieldPath: string, cause: Error) {
        super(`Reactive field evaluation failed: ${fieldPath}`);
        this.name = 'ReactiveFieldError';
        this.cause = cause;
    }
}

class FieldValidationError extends Error {
    constructor(fieldPath: string, value: any, rule: string) {
        super(`Validation failed for ${fieldPath}: ${rule}`);
        this.name = 'FieldValidationError';
    }
}
```

### Error Handling Patterns

```typescript
// InputManager operations provide error information
class InputManager {
    setValue(fieldPath: string, value: FormFieldValue): void {
        try {
            this.setFieldValue(fieldPath, value);
            this.evaluateReactiveFields(this.dependencyMap.get(fieldPath) || []);
        } catch (error) {
            this.logger.error('setValue operation failed:', {
                fieldPath,
                value,
                error: error.message
            });
            
            // Don't throw - provide graceful degradation
            this.notifyError(new FieldValidationError(fieldPath, value, error.message));
        }
    }
}
```

## Usage Examples

### Basic Field Operations

```typescript
// Initialize InputManager with reactive fields
const inputManager = new InputManager(logger);
inputManager.setReactiveFieldDefinitions(templateManager.getReactiveFieldMap());

// Set field values
inputManager.setValue('chemical.name', 'Lithium Carbonate');
inputManager.setValue('chemical.formula', 'Li2CO3');

// Get values
const name = inputManager.getValue('chemical.name');
const allData = inputManager.getData();

// Complex operations
inputManager.renameField('chemical.old_name', 'chemical.new_name');
inputManager.addListItem('composition.solvents', 1, { name: '', volume_fraction: '' });
inputManager.removeListItem('composition.solvents', 0);
```

### Component Creation

```typescript
// Create components with processed template fields
const templateField: ProcessedTemplateField = templateManager.getProcessedField('chemical.name');

const nameInput = new LabeledPrimitiveInput(
    'chemical.name',
    templateField,
    inputManager
);

const objectTemplate = templateManager.getProcessedObjectTemplate('chemical.properties');

const propertiesRenderer = new UniversalObjectRenderer({
    container: document.getElementById('properties-container'),
    label: 'Chemical Properties',
    objectPath: 'chemical.properties',
    inputManager: inputManager,
    template: objectTemplate,
    app: this.app
});
```

### Reactive Field Registration

```typescript
// Register callbacks for field changes
inputManager.registerFieldCallback('chemical.formula', (value) => {
    console.log('Formula changed:', value);
});

inputManager.registerStructuralCallback('composition.solvents', () => {
    console.log('Solvent list structure changed');
});
```

## Migration Patterns

### Converting from Old API

```typescript
// OLD: Complex template queries and parameter extraction
render() {
    const templateField = this.templateManager.getFieldTemplate(templatePath);
    const inputType = templateField?.inputType || this.inferInputType(value);
    const options = this.evaluateOptions(templateField?.options);
    // ... complex parameter mapping
}

// NEW: Direct usage of processed template
render() {
    for (const [fieldName, templateField] of Object.entries(this.template.fields)) {
        if (templateField.isDisplayed) {
            const fieldPath = `${this.objectPath}.${fieldName}`;
            this.createFieldComponent(fieldName, templateField, fieldPath);
        }
    }
}
```

### Eliminating this.object Storage

```typescript
// OLD: Dual storage with synchronization
class UniversalObjectRenderer {
    private object: Record<string, any>; // Remove this
    
    onFieldChange(key: string, value: any) {
        this.object[key] = value;
        this.inputManager.setValue(fieldPath, value);
        this.onChangeCallback(this.object);
    }
}

// NEW: Single source of truth
class UniversalObjectRenderer {
    // No more this.object storage
    
    onFieldChange(key: string, value: any) {
        const fieldPath = `${this.objectPath}.${key}`;
        this.inputManager.setValue(fieldPath, value); // Single update
        // InputManager handles reactive updates automatically
    }
}
```

## Related Documentation

- **[Data Flow Architecture](./data-flow.md)** - Overall system data flow patterns
- **[Component Architecture](./component-architecture.md)** - Template-first component design
- **[Reactive Fields](./reactive-fields.md)** - Reactive field evaluation system
- **[Migration Guide](./migration-guide.md)** - Step-by-step implementation guide