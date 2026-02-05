# Component Architecture (Template-First Design)

## Overview

The template-first component architecture eliminates complex template navigation and parameter extraction by passing processed template data directly to components. This design simplifies component creation, improves performance, and provides clear separation of concerns.

## Current Architecture Issues

### Complex Template Navigation
```typescript
// CURRENT: Each component navigates template paths
class UniversalObjectRenderer {
    private templateManager: TemplateManager;
    private objectTemplatePath: string;
    
    render() {
        // For each field, calculate template path and query TemplateManager
        const templatePath = this.objectTemplatePath 
            ? `${this.objectTemplatePath}.${key}`
            : key;
        const templateField = this.templateManager?.getFieldTemplate(templatePath);
        
        // Extract parameters from template field for component creation
        const inputType = templateField?.inputType || this.inferInputType(value);
        const options = templateField?.options;
        const units = templateField?.units;
        // ... many more extractions
        
        // Create component with extracted parameters
        const input = new LabeledPrimitiveInput({
            type: this.mapInputTypeToPrimitive(inputType, !!units),
            units: Array.isArray(units) ? units : undefined,
            defaultUnit: templateField?.defaultUnit,
            // ... many more parameter mappings
        });
    }
}
```

### Problems Eliminated
1. **Complex Path Calculation**: Each component calculates `objectTemplatePath` vs `objectPath`
2. **Repeated Template Queries**: Multiple `getFieldTemplate()` calls for same data
3. **Parameter Extraction**: Manual extraction and mapping of template properties
4. **Template Manager Dependency**: Every component needs TemplateManager reference
5. **Function Evaluation**: Components still need to evaluate template functions

## Template-First Design

### Core Concept
Instead of components querying templates, **pass processed template data directly** to each component.

### Key Benefits
1. **No Template Queries**: Components receive ready-to-use template data
2. **No Function Evaluation**: All functions already evaluated by TemplateManager
3. **Simplified Component Creation**: Template field maps directly to component constructor
4. **Self-Contained Components**: Each component has its own template definition
5. **Clear Data Flow**: Template → Component, no reverse lookups

## Enhanced Interface Design

### ProcessedTemplateField

```typescript
// NEW: Enhanced template field with processed values
export interface ProcessedTemplateField extends MetaDataTemplateFieldProcessed {
    // All function defaults already evaluated
    default?: string | number | boolean | null; // No functions, only values
    
    // All function options already evaluated  
    options?: string[]; // No functions, only final option arrays
    
    // Additional processed data
    fieldPath: string; // Full path for InputManager operations
    isDisplayed: boolean; // Pre-calculated from display/query properties
    isEditable: boolean; // Pre-calculated editability
    
    // For nested objects and lists
    nestedObjectTemplate?: ProcessedObjectTemplate; // For editableObject fields
    itemTemplate?: ProcessedObjectTemplate; // For object list fields
}
```

### ProcessedObjectTemplate

```typescript
// NEW: Template data for objects
export interface ProcessedObjectTemplate {
    fields: Record<string, ProcessedTemplateField>; // All field definitions ready-to-use
    allowsNewFields: boolean; // Pre-calculated capability
    renderingMode: ObjectRenderingMode; // Pre-calculated mode
}
```

### Simplified Component Options

```typescript
// NEW: Simplified UniversalObjectRenderer options
export interface UniversalObjectRendererOptions {
    container: HTMLElement;
    label: string;
    objectPath: string; // Path for InputManager operations only
    defaultValue?: Record<string, FormFieldValue>;
    inputManager: InputManager; // Required, no optional
    template: ProcessedObjectTemplate; // Pre-processed template data
    onChangeCallback?: (object: Record<string, FormFieldValue>) => void;
    app: App;
}
```

## Streamlined Component Creation

### UniversalObjectRenderer Simplification

```typescript
// NEW: Streamlined component creation
class UniversalObjectRenderer {
    constructor(options: UniversalObjectRendererOptions) {
        // No TemplateManager dependency needed
        this.inputManager = options.inputManager; // Required parameter
        this.template = options.template; // Pre-processed template
        this.objectPath = options.objectPath; // For data operations only
    }
    
    render() {
        // Direct iteration over processed template fields
        for (const [fieldName, templateField] of Object.entries(this.template.fields)) {
            if (!templateField.isDisplayed) continue;
            
            // Create component directly from processed template field
            this.createFieldComponent(fieldName, templateField);
        }
    }
    
    private createFieldComponent(fieldName: string, templateField: ProcessedTemplateField) {
        const fieldPath = `${this.objectPath}.${fieldName}`;
        
        // Direct component creation - no parameter extraction needed
        switch (templateField.inputType) {
            case 'primitive':
                return new LabeledPrimitiveInput(fieldPath, templateField, this.inputManager);
            case 'dropdown':
                return new LabeledDropdown(fieldPath, templateField, this.inputManager);
            case 'editableObject':
                return new UniversalObjectRenderer({
                    objectPath: fieldPath,
                    template: templateField.nestedObjectTemplate, // Pre-processed
                    inputManager: this.inputManager,
                    // ... other options
                });
            case 'objectList':
                return new ObjectListRenderer(fieldPath, templateField, this.inputManager);
        }
    }
}
```

### Field Component Simplification

```typescript
// NEW: Simplified field components that receive complete template data
class LabeledPrimitiveInput {
    constructor(
        private fieldPath: string,
        private templateField: ProcessedTemplateField,
        private inputManager: InputManager
    ) {
        // All template data available directly
        this.inputType = templateField.inputType;
        this.options = templateField.options; // Already evaluated
        this.defaultValue = templateField.default; // Already evaluated
        this.units = templateField.units;
        this.validation = templateField.validation;
        // ... all properties directly accessible
    }
    
    onValueChange(newValue: any) {
        // Direct update - no template queries or parameter extraction
        this.inputManager.setValue(this.fieldPath, newValue);
    }
}
```

## Component Constructor Patterns

### Primitive Input Components

```typescript
// Pattern: Receive fieldPath + templateField + inputManager
class LabeledPrimitiveInput {
    constructor(
        private fieldPath: string,
        private templateField: ProcessedTemplateField,
        private inputManager: InputManager
    ) {
        // Extract everything needed from templateField
        this.initialize();
    }
}

class LabeledDropdown {
    constructor(
        private fieldPath: string,
        private templateField: ProcessedTemplateField,
        private inputManager: InputManager
    ) {
        // templateField.options already contains evaluated option list
        this.options = templateField.options;
    }
}
```

### Object Renderer Components

```typescript
// Pattern: Receive options object with processed template
class UniversalObjectRenderer {
    constructor(options: UniversalObjectRendererOptions) {
        // options.template contains ProcessedObjectTemplate
        this.template = options.template;
        this.inputManager = options.inputManager;
        this.objectPath = options.objectPath;
    }
}

class ObjectListRenderer {
    constructor(
        private listPath: string,
        private templateField: ProcessedTemplateField,
        private inputManager: InputManager
    ) {
        // templateField.itemTemplate contains ProcessedObjectTemplate for list items
        this.itemTemplate = templateField.itemTemplate;
    }
}
```

## Nested Object Handling

### Pre-Processed Nested Templates

```typescript
// TemplateManager processes nested objects during initialization
class TemplateManager {
    processTemplate(template: any): ProcessedObjectTemplate {
        const processedFields: Record<string, ProcessedTemplateField> = {};
        
        for (const [fieldName, fieldDef] of Object.entries(template.fields)) {
            const processedField = this.processTemplateField(fieldDef, fieldName);
            
            // For nested objects, pre-process the nested template
            if (fieldDef.inputType === 'editableObject' && fieldDef.objectTemplate) {
                processedField.nestedObjectTemplate = this.processTemplate(fieldDef.objectTemplate);
            }
            
            // For object lists, pre-process the item template
            if (fieldDef.inputType === 'objectList' && fieldDef.objectTemplate) {
                processedField.itemTemplate = this.processTemplate(fieldDef.objectTemplate);
            }
            
            processedFields[fieldName] = processedField;
        }
        
        return {
            fields: processedFields,
            allowsNewFields: template.allowsNewFields ?? false,
            renderingMode: this.calculateRenderingMode(template)
        };
    }
}
```

### Nested Component Creation

```typescript
// Components create nested components with pre-processed templates
class UniversalObjectRenderer {
    private createNestedObjectComponent(fieldName: string, templateField: ProcessedTemplateField) {
        const nestedObjectPath = `${this.objectPath}.${fieldName}`;
        
        // Create nested renderer with pre-processed template
        return new UniversalObjectRenderer({
            container: this.createFieldContainer(fieldName),
            label: templateField.label || fieldName,
            objectPath: nestedObjectPath,
            inputManager: this.inputManager, // Pass through
            template: templateField.nestedObjectTemplate, // Pre-processed
            onChangeCallback: this.options.onChangeCallback,
            app: this.options.app
        });
    }
    
    private createObjectListComponent(fieldName: string, templateField: ProcessedTemplateField) {
        const listPath = `${this.objectPath}.${fieldName}`;
        
        // Create list renderer with pre-processed item template
        return new ObjectListRenderer(
            listPath,
            templateField, // Contains itemTemplate
            this.inputManager
        );
    }
}
```

## Migration Benefits

### Before: Complex Parameter Extraction
```typescript
// OLD: Manual parameter extraction and mapping
render() {
    const templateField = this.templateManager.getFieldTemplate(templatePath);
    const inputType = templateField?.inputType || this.inferInputType(value);
    const options = this.evaluateOptions(templateField?.options);
    const defaultValue = this.evaluateDefault(templateField?.default);
    // ... many more extractions and evaluations
    
    const input = new LabeledPrimitiveInput({
        type: this.mapInputTypeToPrimitive(inputType),
        options: Array.isArray(options) ? options : undefined,
        defaultValue: defaultValue,
        // ... complex parameter mapping
    });
}
```

### After: Direct Template Field Usage
```typescript
// NEW: Direct usage of processed template data
render() {
    for (const [fieldName, templateField] of Object.entries(this.template.fields)) {
        if (templateField.isDisplayed) {
            const fieldPath = `${this.objectPath}.${fieldName}`;
            const input = new LabeledPrimitiveInput(fieldPath, templateField, this.inputManager);
        }
    }
}
```

## Performance Benefits

1. **No Template Queries**: Template data passed once, no repeated queries
2. **No Function Evaluation**: All functions evaluated once during template processing  
3. **No Parameter Mapping**: Direct usage of processed template properties
4. **No Path Calculation**: Field paths calculated once during template processing
5. **Cached Processing**: Template processing done once, reused for all components

## Architectural Benefits

1. **Clear Separation**: TemplateManager processes, Components use processed data
2. **Self-Contained Components**: Each component has complete template definition
3. **No Reverse Dependencies**: Components don't need TemplateManager references
4. **Extensible**: Adding template properties doesn't require parent component changes
5. **Testable**: Components testable with mock ProcessedTemplateField objects

## Component Responsibility Clarification

### TemplateManager
- **Process raw templates** into ProcessedTemplateField objects
- **Evaluate all functions** (defaults, options, validation, etc.)
- **Build nested templates** for objects and lists
- **Calculate field properties** (isDisplayed, isEditable, fieldPath)

### Components (UniversalObjectRenderer, LabeledPrimitiveInput, etc.)
- **Render UI elements** based on ProcessedTemplateField properties
- **Handle user interactions** and validation
- **Update InputManager** with field changes
- **Manage component lifecycle** and DOM updates

### InputManager
- **Store form data** as single source of truth
- **Handle reactive field evaluation** when dependencies change
- **Provide data access API** for components
- **Manage complex operations** (rename, add/remove keys/items)

## Related Documentation

- **[Data Flow Architecture](./data-flow.md)** - How data flows between components with template-first design
- **[Template Processing](./template-processing.md)** - How raw templates become ProcessedTemplateField objects
- **[API Reference](./api-reference.md)** - Complete component interfaces and constructor patterns