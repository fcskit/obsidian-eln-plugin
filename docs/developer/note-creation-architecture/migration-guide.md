# Migration Guide

## Overview

This guide provides step-by-step instructions for implementing the unified template-first architecture with single-source-of-truth data management. The migration eliminates dual data storage, simplifies component creation, and provides reactive field automation.

## Migration Priority Order

### Phase 1: Core Infrastructure (High Priority)
1. **Enhance InputManager API** - Add complex field operations
2. **Update TemplateManager** - Add ProcessedTemplateField generation
3. **Create ProcessedTemplateField interfaces** - Type definitions for template-first design

### Phase 2: Component Architecture (High Priority) 
4. **Update UniversalObjectRenderer constructor** - Accept template parameter
5. **Eliminate this.object storage** - Remove dual data storage throughout
6. **Update field component constructors** - Accept ProcessedTemplateField

### Phase 3: Integration (Medium Priority)
7. **Update NewNoteModal initialization** - Pass processed templates to components
8. **Update reactive field integration** - Connect TemplateManager to InputManager
9. **Update all setValue calls** - Use direct field paths, not batched updates

### Phase 4: Testing and Optimization (Low Priority)
10. **Comprehensive testing** - Validate all field operations work correctly
11. **Performance optimization** - Fine-tune reactive evaluation and UI updates
12. **Documentation updates** - Update inline documentation and examples

## Detailed Migration Steps

### Step 1: Enhance InputManager API

#### Add Complex Field Operations
```typescript
// Add to src/ui/modals/utils/InputManager.ts

class InputManager {
    // NEW: Complex field operations
    renameField(oldPath: string, newPath: string): void {
        const value = this.getValue(oldPath);
        if (value === undefined) return;
        
        // Preserve field ordering (similar to existing renameKey implementation)
        const pathParts = oldPath.split('.');
        const oldKey = pathParts[pathParts.length - 1];
        const newKey = newPath.split('.')[newPath.split('.').length - 1];
        const parentPath = pathParts.slice(0, -1).join('.');
        
        this.renameKeyPreservingOrder(parentPath, oldKey, newKey);
        this.notifyFieldRenamed(oldPath, newPath);
    }
    
    addListItem(listPath: string, index: number, itemObject: Record<string, any>): void {
        Object.entries(itemObject).forEach(([key, value]) => {
            const itemFieldPath = `${listPath}.${index}.${key}`;
            this.setValue(itemFieldPath, value);
        });
        this.notifyListItemAdded(listPath, index);
    }
    
    removeListItem(listPath: string, index: number): void {
        // Remove all fields for this item
        const itemPrefix = `${listPath}.${index}.`;
        this.removeFieldsWithPrefix(itemPrefix);
        
        // Renumber subsequent items  
        this.renumberListItems(listPath, index);
        this.notifyListItemRemoved(listPath, index);
    }
    
    changeFieldType(fieldPath: string, newType: string, defaultValue?: any): void {
        const currentValue = this.getValue(fieldPath);
        const newValue = this.convertValueToType(currentValue, newType, defaultValue);
        this.setValue(fieldPath, newValue);
        this.notifyFieldTypeChanged(fieldPath, newType);
    }
    
    // Enhanced data retrieval
    getData(objectPath?: string): any {
        if (!objectPath) return this.data;
        return this.reconstructObjectFromFields(objectPath);
    }
}
```

#### Add Reactive Field Integration
```typescript
// Add to InputManager
class InputManager {
    private reactiveFieldMap: Map<string, ReactiveFieldInfo> = new Map();
    private dependencyMap: Map<string, string[]> = new Map();
    
    setReactiveFieldDefinitions(reactiveFieldMap: Map<string, ReactiveFieldInfo>): void {
        this.reactiveFieldMap = reactiveFieldMap;
        this.dependencyMap = this.buildDependencyMap(reactiveFieldMap);
    }
    
    // Enhance setValue to trigger reactive evaluation
    setValue(fieldPath: string, value: FormFieldValue): void {
        this.setFieldValue(fieldPath, value);
        
        // Check for reactive dependencies
        const affectedReactiveFields = this.dependencyMap.get(fieldPath);
        if (affectedReactiveFields && affectedReactiveFields.length > 0) {
            this.evaluateReactiveFields(affectedReactiveFields);
        }
        
        this.notifyFieldChange(fieldPath, value);
        this.triggerChangeCallback();
    }
}
```

### Step 2: Update TemplateManager

#### Add ProcessedTemplateField Generation
```typescript
// Add to src/core/TemplateManager.ts

class TemplateManager {
    getProcessedField(fieldPath: string): ProcessedTemplateField {
        const fieldDef = this.getNestedValue(this.currentProcessedTemplate, fieldPath);
        
        return {
            display: fieldDef.display,
            inputType: fieldDef.inputType,
            label: fieldDef.label,
            default: fieldDef.default, // Already evaluated
            options: fieldDef.options, // Already evaluated
            units: fieldDef.units,
            fieldPath: fieldPath,
            isDisplayed: fieldDef.display === true,
            isEditable: fieldDef.inputType !== 'readonly',
            nestedObjectTemplate: fieldDef.objectTemplate ? 
                this.processObjectTemplate(fieldDef.objectTemplate) : undefined,
            itemTemplate: fieldDef.inputType === 'list' && fieldDef.objectTemplate ?
                this.processObjectTemplate(fieldDef.objectTemplate) : undefined
        };
    }
    
    getProcessedObjectTemplate(objectPath: string): ProcessedObjectTemplate {
        const objectDef = this.getNestedValue(this.currentProcessedTemplate, objectPath);
        const processedFields: Record<string, ProcessedTemplateField> = {};
        
        for (const [fieldName, fieldDef] of Object.entries(objectDef)) {
            if (this.isFieldDefinition(fieldDef)) {
                const fullFieldPath = objectPath ? `${objectPath}.${fieldName}` : fieldName;
                processedFields[fieldName] = this.getProcessedField(fullFieldPath);
            }
        }
        
        return {
            fields: processedFields,
            allowsNewFields: objectDef.allowsNewFields ?? false,
            renderingMode: this.calculateRenderingMode(objectDef)
        };
    }
    
    getReactiveFieldMap(): Map<string, ReactiveFieldInfo> {
        return this.reactiveFieldMap;
    }
}
```

### Step 3: Create Interface Definitions

#### Add to src/types/TemplateTypes.ts
```typescript
// Template-first interfaces
export interface ProcessedTemplateField {
    display: boolean;
    inputType: string;
    label?: string;
    placeholder?: string;
    default: any;                           // Pre-evaluated
    options?: string[];                     // Pre-evaluated
    units?: string[];
    defaultUnit?: string;
    validation?: ValidationConfig;
    fieldPath: string;                      // Full path
    isDisplayed: boolean;                   // Pre-calculated
    isEditable: boolean;                    // Pre-calculated
    nestedObjectTemplate?: ProcessedObjectTemplate;
    itemTemplate?: ProcessedObjectTemplate;
}

export interface ProcessedObjectTemplate {
    fields: Record<string, ProcessedTemplateField>;
    allowsNewFields: boolean;
    renderingMode: ObjectRenderingMode;
    label?: string;
    description?: string;
}

export interface ReactiveFieldInfo {
    fieldPath: string;
    evaluationFunction: Function;
    dependencies: string[];
    fallbackValue: any;
}
```

### Step 4: Update UniversalObjectRenderer

#### Modify Constructor and Options
```typescript
// Update src/ui/modals/UniversalObjectRenderer.ts

interface UniversalObjectRendererOptions {
    container: HTMLElement;
    label: string;
    objectPath: string;
    inputManager: InputManager;            // Required, not optional
    template: ProcessedObjectTemplate;     // NEW: Pre-processed template
    defaultValue?: Record<string, FormFieldValue>;
    onChangeCallback?: (object: Record<string, FormFieldValue>) => void;
    app: App;
    // REMOVE: templateManager?: TemplateManager;
    // REMOVE: objectTemplatePath?: string;
}

class UniversalObjectRenderer {
    private inputManager: InputManager;
    private template: ProcessedObjectTemplate;
    private objectPath: string;
    // REMOVE: private object: Record<string, any>;
    // REMOVE: private templateManager?: TemplateManager;
    
    constructor(options: UniversalObjectRendererOptions) {
        this.inputManager = options.inputManager; // Required
        this.template = options.template;         // Pre-processed
        this.objectPath = options.objectPath;
        // No TemplateManager reference needed
    }
}
```

#### Simplify Render Method
```typescript
// Update render method to use processed template
class UniversalObjectRenderer {
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
        
        switch (templateField.inputType) {
            case 'primitive':
                return new LabeledPrimitiveInput(fieldPath, templateField, this.inputManager);
            case 'dropdown':
                return new LabeledDropdown(fieldPath, templateField, this.inputManager);
            case 'editableObject':
                return new UniversalObjectRenderer({
                    container: this.createFieldContainer(fieldName),
                    label: templateField.label || fieldName,
                    objectPath: fieldPath,
                    inputManager: this.inputManager,
                    template: templateField.nestedObjectTemplate!,
                    onChangeCallback: this.options.onChangeCallback,
                    app: this.options.app
                });
            case 'objectList':
                return new ObjectListRenderer(fieldPath, templateField, this.inputManager);
        }
    }
}
```

#### Eliminate this.object Storage
```typescript
// Remove all this.object usage
class UniversalObjectRenderer {
    // REMOVE: private object: Record<string, any>;
    
    // Replace getCurrentObject() 
    getCurrentObject(): Record<string, FormFieldValue> {
        return this.inputManager.getData(this.objectPath);
    }
    
    // Update key management to use InputManager directly
    renameKey(oldKey: string, newKey: string) {
        const oldPath = `${this.objectPath}.${oldKey}`;
        const newPath = `${this.objectPath}.${newKey}`;
        const value = this.inputManager.getValue(oldPath);
        
        this.inputManager.renameField(oldPath, newPath);
        this.updateComponentFieldPath(oldKey, newKey);
        // No this.object updates needed
    }
    
    addKey(newKey: string, inputType: string) {
        const newPath = `${this.objectPath}.${newKey}`;
        const defaultValue = this.getDefaultValueForType(inputType);
        
        this.inputManager.setValue(newPath, defaultValue);
        this.createAndAddInputComponent(newKey, inputType, newPath);
        // No this.object updates needed
    }
    
    removeKey(key: string) {
        const fieldPath = `${this.objectPath}.${key}`;
        
        this.inputManager.removeField(fieldPath);
        this.removeInputComponent(key);
        // No this.object updates needed
    }
}
```

### Step 5: Update Field Components

#### Update LabeledPrimitiveInput Constructor
```typescript
// Update src/ui/modals/fields/LabeledPrimitiveInput.ts

class LabeledPrimitiveInput {
    constructor(
        private fieldPath: string,              // Full path for InputManager
        private templateField: ProcessedTemplateField, // Complete template data
        private inputManager: InputManager
    ) {
        // Extract all needed properties from templateField
        this.inputType = templateField.inputType;
        this.defaultValue = templateField.default;
        this.units = templateField.units;
        this.validation = templateField.validation;
        this.placeholder = templateField.placeholder;
        
        this.initialize();
    }
    
    onValueChange(newValue: any) {
        // Direct update - no intermediate steps
        if (!this.isValidInput(newValue)) return;
        
        this.inputManager.setValue(this.fieldPath, newValue);
        // InputManager handles reactive updates automatically
    }
}
```

#### Update Other Field Components
```typescript
// Similarly update LabeledDropdown, etc.
class LabeledDropdown {
    constructor(
        private fieldPath: string,
        private templateField: ProcessedTemplateField,
        private inputManager: InputManager
    ) {
        this.options = templateField.options; // Already evaluated
        this.defaultValue = templateField.default;
        this.initialize();
    }
    
    onValueChange(newValue: any) {
        this.inputManager.setValue(this.fieldPath, newValue);
    }
}
```

### Step 6: Update NewNoteModal Initialization

#### Pass Processed Templates to Components
```typescript
// Update src/ui/modals/NewNoteModal.ts

class NewNoteModal {
    onOpen() {
        // Initialize reactive field system
        this.initializeReactiveFields();
        
        // Create main form renderer with processed template
        const processedTemplate = this.templateManager.getProcessedObjectTemplate('');
        
        this.formRenderer = new UniversalObjectRenderer({
            container: this.contentEl,
            label: 'Note Details',
            objectPath: '',
            inputManager: this.inputManager,
            template: processedTemplate,      // Pre-processed template
            onChangeCallback: this.handleDataChange.bind(this),
            app: this.app
        });
        
        this.formRenderer.render();
    }
    
    private initializeReactiveFields(): void {
        const reactiveFieldMap = this.templateManager.getReactiveFieldMap();
        this.inputManager.setReactiveFieldDefinitions(reactiveFieldMap);
        this.inputManager.evaluateAllReactiveFields();
    }
}
```

### Step 7: Remove Deprecated Methods

#### Replace updateInputManager Calls
```typescript
// Find and replace all instances of:

// OLD: Batched updates
updateInputManager() {
    Object.entries(this.object).forEach(([key, value]) => {
        const fieldPath = this.buildFieldPath(key);
        this.inputManager.setValue(fieldPath, value);
    });
}

// NEW: Direct field updates (already implemented in previous steps)
onFieldChange(key: string, value: any) {
    const fieldPath = `${this.objectPath}.${key}`;
    this.inputManager.setValue(fieldPath, value);
}
```

#### Mark Deprecated Methods
```typescript
// Mark for removal in InputManager
class InputManager {
    /**
     * @deprecated Use direct setValue calls instead
     * This method will be removed in next version
     */
    updateInputManager() {
        this.logger.warn('updateInputManager is deprecated - use direct setValue calls');
        // Keep implementation for backward compatibility during transition
    }
}
```

## Testing Migration Steps

### Step 8: Unit Testing

#### Test Enhanced InputManager API
```typescript
// Create test: tests/test-input-manager-enhanced.ts

describe('Enhanced InputManager API', () => {
    test('renameField preserves field order', () => {
        const inputManager = new InputManager();
        inputManager.setValue('obj.field1', 'value1');
        inputManager.setValue('obj.field2', 'value2'); 
        inputManager.setValue('obj.field3', 'value3');
        
        inputManager.renameField('obj.field2', 'obj.renamed_field');
        
        const result = inputManager.getData('obj');
        const keys = Object.keys(result);
        
        expect(keys).toEqual(['field1', 'renamed_field', 'field3']);
        expect(result.renamed_field).toBe('value2');
    });
    
    test('addListItem creates proper field paths', () => {
        const inputManager = new InputManager();
        const itemObject = { name: 'test', value: 123 };
        
        inputManager.addListItem('list', 0, itemObject);
        
        expect(inputManager.getValue('list.0.name')).toBe('test');
        expect(inputManager.getValue('list.0.value')).toBe(123);
    });
});
```

#### Test Component Creation with ProcessedTemplateField
```typescript
// Create test: tests/test-component-creation.ts

describe('Component Creation with ProcessedTemplateField', () => {
    test('LabeledPrimitiveInput receives complete template data', () => {
        const templateField: ProcessedTemplateField = {
            display: true,
            inputType: 'text',
            default: 'test value',
            options: ['option1', 'option2'], // Already evaluated
            fieldPath: 'test.field',
            isDisplayed: true,
            isEditable: true
        };
        
        const inputManager = new InputManager();
        const component = new LabeledPrimitiveInput('test.field', templateField, inputManager);
        
        expect(component.inputType).toBe('text');
        expect(component.defaultValue).toBe('test value');
        expect(component.options).toEqual(['option1', 'option2']);
    });
});
```

### Step 9: Integration Testing

#### Test Complete Note Creation Workflow
```typescript
// Create test: tests/test-note-creation-workflow.ts

describe('Complete Note Creation Workflow', () => {
    test('form creation with reactive fields', async () => {
        const templateManager = new TemplateManager();
        await templateManager.loadBaseTemplate('test-template');
        
        const inputManager = new InputManager();
        const reactiveFieldMap = templateManager.getReactiveFieldMap();
        inputManager.setReactiveFieldDefinitions(reactiveFieldMap);
        
        // Simulate user input that triggers reactive evaluation
        inputManager.setValue('chemical.formula', 'H2O');
        
        // Verify reactive field was updated
        const molecularWeight = inputManager.getValue('chemical.molecular_weight');
        expect(molecularWeight).toBe(18.015); // Calculated from H2O
    });
});
```

### Step 10: Performance Validation

#### Benchmark Template Processing
```typescript
// Create test: tests/benchmark-template-processing.ts

describe('Template Processing Performance', () => {
    test('template processing completes within acceptable time', async () => {
        const startTime = performance.now();
        
        const templateManager = new TemplateManager();
        await templateManager.loadBaseTemplate('complex-template');
        await templateManager.applySubclassTemplate('electrolyte');
        
        const processedTemplate = templateManager.getProcessedObjectTemplate('');
        
        const endTime = performance.now();
        const processingTime = endTime - startTime;
        
        expect(processingTime).toBeLessThan(100); // Should complete in < 100ms
        expect(Object.keys(processedTemplate.fields).length).toBeGreaterThan(0);
    });
});
```

## Migration Checklist

### Phase 1: Core Infrastructure ✓
- [ ] Add complex field operations to InputManager (renameField, addListItem, etc.)
- [ ] Add reactive field integration to InputManager (setReactiveFieldDefinitions, evaluateReactiveFields)
- [ ] Add ProcessedTemplateField generation to TemplateManager
- [ ] Create ProcessedTemplateField and ProcessedObjectTemplate interfaces

### Phase 2: Component Architecture ✓
- [ ] Update UniversalObjectRenderer constructor to accept template parameter
- [ ] Remove this.object storage from UniversalObjectRenderer
- [ ] Update all field component constructors to accept ProcessedTemplateField
- [ ] Update component creation to use processed template data directly

### Phase 3: Integration ✓  
- [ ] Update NewNoteModal to pass processed templates to components
- [ ] Connect TemplateManager reactive field map to InputManager
- [ ] Replace all updateInputManager calls with direct setValue calls
- [ ] Mark deprecated methods and add migration warnings

### Phase 4: Testing and Optimization ✓
- [ ] Write unit tests for enhanced InputManager API
- [ ] Write integration tests for complete note creation workflow  
- [ ] Write performance benchmarks for template processing
- [ ] Update inline documentation and README files

### Validation Steps ✓
- [ ] Test electrolyte composition fields (solvents, salts, additives) work without data overwrites
- [ ] Test field renaming preserves order
- [ ] Test object list add/remove operations
- [ ] Test reactive fields evaluate correctly on dependency changes  
- [ ] Test form submission produces correct metadata structure
- [ ] Test all input types (primitive, dropdown, editableObject, objectList) work with new architecture

## Expected Results

After completing this migration:

1. **50% fewer steps** for basic field updates
2. **No dual data storage** anywhere in the system  
3. **No object reconstruction** for any operation type
4. **Targeted UI updates** instead of full re-renders
5. **Single source of truth** for all data operations
6. **Template-first component creation** with no template queries
7. **Automatic reactive field evaluation** on every field change
8. **Clear separation of concerns** between template processing, data management, and UI rendering

## Rollback Plan

If issues arise during migration:

1. **Keep deprecated methods** functional during transition period
2. **Feature flags** to toggle between old and new architectures
3. **Comprehensive backup** of working implementation before changes
4. **Step-by-step rollback** capability for each migration phase
5. **Automated testing** to validate functionality at each step

## Related Documentation

- **[API Reference](./api-reference.md)** - Complete API documentation for new interfaces
- **[Component Architecture](./component-architecture.md)** - Template-first design patterns
- **[Data Flow Architecture](./data-flow.md)** - Unified data flow patterns
- **[Reactive Fields](./reactive-fields.md)** - Reactive field evaluation system