# Input Manager

The Input Manager serves as the centralized state management system for form inputs, coordinating value storage, validation, field ordering, and reactive updates across all UI components.

## 🏗️ Architecture

The Input Manager acts as the single source of truth for form state, managing complex interactions between multiple input components.

```typescript
┌─────────────────────────────────────────────────────┐
│                 Input Manager                      │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │    Value        │  │      Field Ordering         ││
│  │    Store        │  │       Manager               ││
│  └─────────────────┘  └─────────────────────────────┘│
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │   Validation    │  │     Change Listener         ││
│  │  Coordinator    │  │       System                ││
│  └─────────────────┘  └─────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## 📍 Location

```
src/ui/modals/utils/InputManager.ts
```

## 🔧 Core Functionality

### Value Management

The Input Manager maintains a centralized store of all field values:

```typescript
export class InputManager {
    private values: Map<string, any>;
    private validators: Map<string, ValidationRule[]>;
    private changeListeners: Map<string, ChangeCallback[]>;
    private fieldOrder: string[];
    private reactiveSystem: ReactiveSystem;
    
    constructor(reactiveSystem?: ReactiveSystem) {
        this.values = new Map();
        this.validators = new Map();
        this.changeListeners = new Map();
        this.fieldOrder = [];
        this.reactiveSystem = reactiveSystem;
    }
    
    /**
     * Sets a field value and triggers appropriate updates
     */
    public setValue(fieldPath: string, value: any): void {
        const oldValue = this.values.get(fieldPath);
        
        // Update the value
        this.values.set(fieldPath, value);
        
        // Add to field order if new
        if (!this.fieldOrder.includes(fieldPath)) {
            this.fieldOrder.push(fieldPath);
        }
        
        // Trigger change notifications
        this.notifyFieldChange(fieldPath, value, oldValue);
        
        // Notify reactive system
        if (this.reactiveSystem) {
            this.reactiveSystem.notifyFieldChange(fieldPath, value, oldValue);
        }
    }
}
```

### Nested Value Access

The manager handles complex nested object paths for hierarchical data:

```typescript
/**
 * Gets a value using dot notation path (e.g., "chemical.formula.name")
 */
public getValue(fieldPath: string): any {
    if (this.values.has(fieldPath)) {
        return this.values.get(fieldPath);
    }
    
    // Handle nested paths
    if (fieldPath.includes('.')) {
        return this.getNestedValue(fieldPath);
    }
    
    return undefined;
}

private getNestedValue(fieldPath: string): any {
    const pathParts = fieldPath.split('.');
    let current = this.getAllValues();
    
    for (const part of pathParts) {
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
        } else {
            return undefined;
        }
    }
    
    return current;
}

/**
 * Sets nested values and creates intermediate objects as needed
 */
public setNestedValue(fieldPath: string, value: any): void {
    const pathParts = fieldPath.split('.');
    
    if (pathParts.length === 1) {
        this.setValue(fieldPath, value);
        return;
    }
    
    // Build nested structure
    const allValues = this.getAllValues();
    let current = allValues;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part] || typeof current[part] !== 'object') {
            current[part] = {};
        }
        current = current[part];
    }
    
    // Set final value
    current[pathParts[pathParts.length - 1]] = value;
    
    // Store the nested structure
    this.rebuildFromNestedStructure(allValues);
}
```

## 🎯 Field Management

### Field Registration

Fields are registered with the Input Manager to establish ordering and metadata:

```typescript
/**
 * Registers a field with the manager
 */
public registerField(fieldPath: string, config: FieldConfig): void {
    // Add to field order if not present
    if (!this.fieldOrder.includes(fieldPath)) {
        const insertPosition = this.calculateInsertPosition(fieldPath, config);
        this.fieldOrder.splice(insertPosition, 0, fieldPath);
    }
    
    // Set up validation if provided
    if (config.validation) {
        this.validators.set(fieldPath, config.validation);
    }
    
    // Set default value if provided
    if (config.defaultValue !== undefined && !this.values.has(fieldPath)) {
        this.setValue(fieldPath, config.defaultValue);
    }
}

private calculateInsertPosition(fieldPath: string, config: FieldConfig): number {
    // If explicit order is specified
    if (config.order !== undefined) {
        return Math.min(config.order, this.fieldOrder.length);
    }
    
    // Group related fields together (e.g., chemical.* fields)
    const pathPrefix = fieldPath.split('.')[0];
    const relatedFieldIndex = this.fieldOrder.findIndex(path => 
        path.startsWith(pathPrefix + '.')
    );
    
    if (relatedFieldIndex !== -1) {
        // Find the last field in the same group
        let lastRelatedIndex = relatedFieldIndex;
        while (lastRelatedIndex < this.fieldOrder.length - 1 && 
               this.fieldOrder[lastRelatedIndex + 1].startsWith(pathPrefix + '.')) {
            lastRelatedIndex++;
        }
        return lastRelatedIndex + 1;
    }
    
    // Default to end
    return this.fieldOrder.length;
}
```

### Field Ordering

The manager maintains logical field ordering for UI rendering:

```typescript
/**
 * Gets fields in their logical order for rendering
 */
public getFieldsInOrder(): string[] {
    return [...this.fieldOrder];
}

/**
 * Reorders a field to a new position
 */
public reorderField(fieldPath: string, newPosition: number): void {
    const currentIndex = this.fieldOrder.indexOf(fieldPath);
    if (currentIndex === -1) return;
    
    // Remove from current position
    this.fieldOrder.splice(currentIndex, 1);
    
    // Insert at new position
    const insertPosition = Math.min(newPosition, this.fieldOrder.length);
    this.fieldOrder.splice(insertPosition, 0, fieldPath);
    
    // Notify listeners of order change
    this.notifyOrderChange();
}
```

## 🔄 Change Management

### Change Listeners

Components can register to be notified of value changes:

```typescript
/**
 * Registers a callback for field value changes
 */
public onFieldChange(fieldPath: string, callback: ChangeCallback): void {
    if (!this.changeListeners.has(fieldPath)) {
        this.changeListeners.set(fieldPath, []);
    }
    this.changeListeners.get(fieldPath)!.push(callback);
}

/**
 * Removes a change listener
 */
public removeFieldChangeListener(fieldPath: string, callback: ChangeCallback): void {
    const listeners = this.changeListeners.get(fieldPath);
    if (listeners) {
        const index = listeners.indexOf(callback);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }
}

private notifyFieldChange(fieldPath: string, newValue: any, oldValue?: any): void {
    // Notify specific field listeners
    const listeners = this.changeListeners.get(fieldPath) || [];
    for (const callback of listeners) {
        try {
            callback(newValue, oldValue, fieldPath);
        } catch (error) {
            console.error(`Change listener error for ${fieldPath}:`, error);
        }
    }
    
    // Notify global listeners
    const globalListeners = this.changeListeners.get('*') || [];
    for (const callback of globalListeners) {
        try {
            callback(newValue, oldValue, fieldPath);
        } catch (error) {
            console.error(`Global change listener error:`, error);
        }
    }
}
```

### Batch Operations

Multiple changes can be batched to optimize performance:

```typescript
/**
 * Performs multiple value updates in a batch
 */
public batchUpdate(updates: Record<string, any>): void {
    // Disable change notifications during batch
    const originalNotifyEnabled = this.notificationsEnabled;
    this.notificationsEnabled = false;
    
    try {
        // Apply all updates
        for (const [fieldPath, value] of Object.entries(updates)) {
            this.setValue(fieldPath, value);
        }
    } finally {
        // Re-enable notifications
        this.notificationsEnabled = originalNotifyEnabled;
        
        // Send batch notification
        this.notifyBatchUpdate(updates);
    }
}

private notifyBatchUpdate(updates: Record<string, any>): void {
    // Notify reactive system of all changes
    if (this.reactiveSystem) {
        for (const [fieldPath, value] of Object.entries(updates)) {
            this.reactiveSystem.notifyFieldChange(fieldPath, value);
        }
    }
    
    // Notify batch listeners
    const batchListeners = this.changeListeners.get('batch') || [];
    for (const callback of batchListeners) {
        try {
            callback(updates);
        } catch (error) {
            console.error('Batch update listener error:', error);
        }
    }
}
```

## ✅ Validation Integration

### Field Validation

The Input Manager coordinates validation across all fields:

```typescript
/**
 * Validates a specific field
 */
public validateField(fieldPath: string): ValidationResult {
    const value = this.getValue(fieldPath);
    const validators = this.validators.get(fieldPath) || [];
    
    const errors: string[] = [];
    
    for (const validator of validators) {
        const result = this.executeValidator(validator, value, fieldPath);
        if (!result.isValid) {
            errors.push(result.message);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        fieldPath
    };
}

/**
 * Validates all fields
 */
public validateAll(): ValidationSummary {
    const results: ValidationResult[] = [];
    const allFields = this.getFieldsInOrder();
    
    for (const fieldPath of allFields) {
        const result = this.validateField(fieldPath);
        if (!result.isValid) {
            results.push(result);
        }
    }
    
    return {
        isValid: results.length === 0,
        results,
        totalFields: allFields.length,
        validFields: allFields.length - results.length
    };
}

private executeValidator(validator: ValidationRule, value: any, fieldPath: string): ValidationResult {
    try {
        switch (validator.type) {
            case 'required':
                return this.validateRequired(value);
            case 'min-length':
                return this.validateMinLength(value, validator.value);
            case 'max-length':
                return this.validateMaxLength(value, validator.value);
            case 'pattern':
                return this.validatePattern(value, validator.value);
            case 'custom':
                return validator.validate(value, fieldPath);
            default:
                return { isValid: true, message: '' };
        }
    } catch (error) {
        return {
            isValid: false,
            message: `Validation error: ${error.message}`
        };
    }
}
```

### Real-time Validation

Validation occurs automatically as users type:

```typescript
public setValue(fieldPath: string, value: any): void {
    const oldValue = this.values.get(fieldPath);
    this.values.set(fieldPath, value);
    
    // Perform real-time validation if enabled
    if (this.realTimeValidation) {
        const validationResult = this.validateField(fieldPath);
        this.notifyValidationResult(fieldPath, validationResult);
    }
    
    // Continue with other change notifications...
    this.notifyFieldChange(fieldPath, value, oldValue);
}

private notifyValidationResult(fieldPath: string, result: ValidationResult): void {
    // Notify validation listeners
    const validationListeners = this.changeListeners.get(`validation:${fieldPath}`) || [];
    for (const callback of validationListeners) {
        callback(result);
    }
}
```

## 🚀 Performance Optimizations

### Value Caching

Frequently accessed values are cached for performance:

```typescript
private valueCache: Map<string, CachedValue> = new Map();

public getValue(fieldPath: string): any {
    // Check cache first
    const cached = this.valueCache.get(fieldPath);
    if (cached && !cached.isExpired()) {
        return cached.value;
    }
    
    // Compute value
    const value = this.computeValue(fieldPath);
    
    // Cache the result
    this.valueCache.set(fieldPath, new CachedValue(value));
    
    return value;
}

class CachedValue {
    constructor(
        public value: any,
        private cacheTimeout: number = 1000
    ) {
        this.timestamp = Date.now();
    }
    
    public isExpired(): boolean {
        return Date.now() - this.timestamp > this.cacheTimeout;
    }
}
```

### Debounced Updates

Rapid value changes are debounced to prevent excessive processing:

```typescript
private debouncedUpdates: Map<string, NodeJS.Timeout> = new Map();

public setValueDebounced(fieldPath: string, value: any, delay: number = 300): void {
    // Clear existing debounce timer
    if (this.debouncedUpdates.has(fieldPath)) {
        clearTimeout(this.debouncedUpdates.get(fieldPath)!);
    }
    
    // Set new debounce timer
    const timer = setTimeout(() => {
        this.setValue(fieldPath, value);
        this.debouncedUpdates.delete(fieldPath);
    }, delay);
    
    this.debouncedUpdates.set(fieldPath, timer);
}
```

## 🧩 Integration Points

### With UI Components

UI components register with the Input Manager to manage their state:

```typescript
// Example: Text input component integration
export class LabeledTextInput extends LabeledInputBase {
    constructor(config: TextInputConfig) {
        super(config);
        
        // Register with input manager
        this.inputManager.registerField(this.fieldPath, {
            defaultValue: config.defaultValue,
            validation: config.validation
        });
        
        // Listen for external value changes
        this.inputManager.onFieldChange(this.fieldPath, (newValue) => {
            this.updateDisplayValue(newValue);
        });
        
        // Notify manager of user input
        this.inputElement.addEventListener('input', () => {
            this.inputManager.setValue(this.fieldPath, this.inputElement.value);
        });
    }
}
```

### With Reactive System

The Input Manager coordinates with the reactive system for dependency management:

```typescript
constructor(reactiveSystem?: ReactiveSystem) {
    this.reactiveSystem = reactiveSystem;
    
    if (reactiveSystem) {
        // Register for reactive updates
        reactiveSystem.onReactiveUpdate((fieldPath, newValue) => {
            this.setValue(fieldPath, newValue);
        });
    }
}

public updateReactiveFields(changedField: string): void {
    if (this.reactiveSystem) {
        const userInput = this.getAllValues();
        const updates = this.reactiveSystem.updateReactiveFields(
            this.currentTemplate,
            changedField,
            userInput
        );
        
        // Apply updates
        this.batchUpdate(updates);
    }
}
```

### With Template Manager

The Input Manager works with templates to initialize form state:

```typescript
public initializeFromTemplate(template: MetaDataTemplateProcessed): void {
    // Clear existing values
    this.clear();
    
    // Process template fields
    for (const [fieldPath, fieldConfig] of Object.entries(template)) {
        // Register field
        this.registerField(fieldPath, {
            validation: fieldConfig.validation,
            order: fieldConfig.order
        });
        
        // Set default value if provided
        if (fieldConfig.default !== undefined) {
            this.setValue(fieldPath, fieldConfig.default);
        }
    }
}
```

## 🧪 Testing

### Unit Tests

```typescript
describe('InputManager', () => {
    let inputManager: InputManager;
    
    beforeEach(() => {
        inputManager = new InputManager();
    });
    
    describe('value management', () => {
        it('should store and retrieve values', () => {
            inputManager.setValue('test.field', 'test value');
            expect(inputManager.getValue('test.field')).toBe('test value');
        });
        
        it('should handle nested paths', () => {
            inputManager.setValue('chemical.formula.name', 'Water');
            expect(inputManager.getValue('chemical.formula.name')).toBe('Water');
            
            const allValues = inputManager.getAllValues();
            expect(allValues.chemical.formula.name).toBe('Water');
        });
        
        it('should maintain field order', () => {
            inputManager.setValue('field2', 'value2');
            inputManager.setValue('field1', 'value1');
            inputManager.setValue('field3', 'value3');
            
            const order = inputManager.getFieldsInOrder();
            expect(order).toEqual(['field2', 'field1', 'field3']);
        });
    });
    
    describe('change listeners', () => {
        it('should notify listeners of changes', () => {
            const callback = jest.fn();
            inputManager.onFieldChange('test.field', callback);
            
            inputManager.setValue('test.field', 'new value');
            
            expect(callback).toHaveBeenCalledWith('new value', undefined, 'test.field');
        });
        
        it('should handle multiple listeners', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            
            inputManager.onFieldChange('test.field', callback1);
            inputManager.onFieldChange('test.field', callback2);
            
            inputManager.setValue('test.field', 'value');
            
            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });
    });
    
    describe('validation', () => {
        it('should validate required fields', () => {
            inputManager.registerField('required.field', {
                validation: [{ type: 'required' }]
            });
            
            const result = inputManager.validateField('required.field');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Field is required');
        });
        
        it('should validate all fields', () => {
            inputManager.setValue('valid.field', 'value');
            inputManager.registerField('invalid.field', {
                validation: [{ type: 'required' }]
            });
            
            const summary = inputManager.validateAll();
            expect(summary.isValid).toBe(false);
            expect(summary.validFields).toBe(1);
            expect(summary.results).toHaveLength(1);
        });
    });
});
```

### Integration Tests

```typescript
describe('InputManager Integration', () => {
    it('should work with reactive system', () => {
        const reactiveSystem = new ReactiveSystem();
        const inputManager = new InputManager(reactiveSystem);
        
        // Set up reactive dependency
        reactiveSystem.addDependency('derived', 'source');
        
        // Mock reactive callback
        const mockUpdate = jest.fn();
        reactiveSystem.onReactiveUpdate(mockUpdate);
        
        // Change source value
        inputManager.setValue('source', 'test value');
        
        // Verify reactive system was notified
        expect(mockUpdate).toHaveBeenCalledWith('derived', expect.any(String));
    });
});
```

## 🐛 Error Handling

### Value Access Errors

```typescript
public getValue(fieldPath: string): any {
    try {
        return this.getValueInternal(fieldPath);
    } catch (error) {
        console.error(`Error accessing field ${fieldPath}:`, error);
        return undefined;
    }
}
```

### Validation Errors

```typescript
private executeValidator(validator: ValidationRule, value: any, fieldPath: string): ValidationResult {
    try {
        return this.performValidation(validator, value);
    } catch (error) {
        console.error(`Validation error for ${fieldPath}:`, error);
        return {
            isValid: false,
            message: `Validation failed: ${error.message}`,
            fieldPath
        };
    }
}
```

## 🔗 Related Documentation

- [Universal Object Renderer](universal-renderer.md) - Main form rendering engine
- [Reactive System](reactive-system.md) - Field dependency management
- [Component Architecture](component-architecture.md) - UI component design patterns
- [Modal System](modal-system.md) - Dialog and modal implementations

## 📚 Examples

### Complex Form State Management

```typescript
// Initialize input manager with reactive system
const reactiveSystem = new ReactiveSystem();
const inputManager = new InputManager(reactiveSystem);

// Register complex nested fields
inputManager.registerField('experiment.chemical.name', {
    validation: [{ type: 'required' }],
    order: 1
});

inputManager.registerField('experiment.chemical.formula', {
    validation: [
        { type: 'required' },
        { type: 'pattern', value: /^[A-Z][a-z]?(\d+[A-Z][a-z]?\d*)*$/ }
    ],
    order: 2
});

// Set up reactive tags based on chemical properties
inputManager.registerField('tags', {
    validation: [{ type: 'min-length', value: 1 }],
    order: 10
});

// Listen for chemical changes to update tags
inputManager.onFieldChange('experiment.chemical.name', (name) => {
    const currentTags = inputManager.getValue('tags') || [];
    const newTags = [...currentTags, `chemical/${name.toLowerCase()}`];
    inputManager.setValue('tags', newTags);
});

// Batch update from template
const templateData = {
    'experiment.chemical.name': 'Benzene',
    'experiment.chemical.formula': 'C6H6',
    'experiment.conditions.temperature': 25,
    'experiment.conditions.pressure': 1
};

inputManager.batchUpdate(templateData);
```

### Custom Validation Rules

```typescript
// Register custom validator
inputManager.registerField('chemical.molecular_weight', {
    validation: [
        { type: 'required' },
        {
            type: 'custom',
            validate: (value: number, fieldPath: string): ValidationResult => {
                if (typeof value !== 'number' || value <= 0) {
                    return {
                        isValid: false,
                        message: 'Molecular weight must be a positive number',
                        fieldPath
                    };
                }
                
                if (value > 10000) {
                    return {
                        isValid: false,
                        message: 'Molecular weight seems unusually high (>10,000)',
                        fieldPath
                    };
                }
                
                return { isValid: true, message: '', fieldPath };
            }
        }
    ]
});
```
