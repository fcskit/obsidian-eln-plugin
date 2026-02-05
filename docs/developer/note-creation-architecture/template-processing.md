# Template Processing System

## Overview

The template processing system converts raw template definitions into processed templates with evaluated functions, resolved dependencies, and complete field configurations. This document details how TemplateManager processes templates from initial loading through reactive field evaluation.

## Template Processing Workflow

### 1. Template Loading

```typescript
// Step 1: Load base template from plugin settings (not filesystem)
async loadBaseTemplate(templatePath: string): Promise<void> {
    // Templates are TypeScript exports stored in plugin settings
    this.originalBaseTemplate = this.plugin.settings.templates[templatePath];
    this.currentProcessedTemplate = this.deepClone(this.originalBaseTemplate);
    
    this.logger.debug('Base template loaded:', {
        templatePath,
        fieldCount: Object.keys(this.originalBaseTemplate).length
    });
}
```

### 2. Subclass Template Application

```typescript
// Step 2: Apply subclass template using "add" array format
async applySubclassTemplate(subclassName: string): Promise<void> {
    // Load subclass template from plugin settings
    const subclassTemplate = this.plugin.settings.templates.chemtypes[subclassName];
    
    // Start with clean base template copy
    this.currentProcessedTemplate = this.deepClone(this.originalBaseTemplate);
    
    // Apply subclass additions using "fullKey" paths
    for (const addition of subclassTemplate.add) {
        this.setNestedValue(
            this.currentProcessedTemplate, 
            addition.fullKey, 
            addition.input
        );
    }
    
    this.logger.debug('Subclass template applied:', {
        subclassName,
        additionsCount: subclassTemplate.add.length,
        templatePath: this.templatePath
    });
}
```

### 3. Non-Reactive Function Processing

```typescript
// Step 3: Process and evaluate all non-reactive functions
private async processNonReactiveFunctions(
    template: Record<string, unknown>
): Promise<Record<string, unknown>> {
    
    const processedTemplate = this.deepClone(template);
    
    await this.traverseTemplate(processedTemplate, async (value, path) => {
        if (this.isFunction(value) && !this.isReactiveFunction(value)) {
            try {
                const evaluatedValue = await this.evaluateFunction(value);
                this.setNestedValue(processedTemplate, path, evaluatedValue);
                
                this.logger.debug('Non-reactive function evaluated:', {
                    path,
                    function: value.value,
                    result: evaluatedValue
                });
            } catch (error) {
                this.logger.error('Function evaluation failed:', {
                    path,
                    function: value.value,
                    error: error.message
                });
                
                // Use fallback value
                this.setNestedValue(processedTemplate, path, null);
            }
        }
    });
    
    return processedTemplate;
}
```

### 4. Initial Metadata Generation

```typescript
// Step 4: Create structured metadata with proper defaults
private createInitialMetadata(template: Record<string, unknown>): Record<string, FormFieldValue> {
    const initialMetadata: Record<string, FormFieldValue> = {};
    
    this.traverseTemplate(template, (value, path) => {
        if (this.isFieldDefinition(value)) {
            let defaultValue = value.default ?? null;
            
            // Ensure no null/undefined values for processFrontmatter compatibility
            if (defaultValue === null || defaultValue === undefined) {
                defaultValue = this.getTypeAppropriateDefault(value.inputType);
            }
            
            // Handle initial items for lists
            if (value.inputType === 'list' && value.initialItems > 0) {
                defaultValue = this.createInitialListItems(value);
            }
            
            this.setNestedValue(initialMetadata, path, defaultValue);
        }
    });
    
    this.logger.debug('Initial metadata created:', {
        fieldCount: this.countFields(initialMetadata),
        structure: Object.keys(initialMetadata)
    });
    
    return initialMetadata;
}
```

### 5. Reactive Field Identification

```typescript
// Step 5: Build reactive field dependency map
private identifyReactiveFields(template: Record<string, unknown>): void {
    this.reactiveFieldMap.clear();
    
    this.traverseTemplate(template, (value, path) => {
        if (this.isFunction(value) && this.isReactiveFunction(value)) {
            const dependencies = this.extractDependencies(value.value);
            const compiledFunction = this.compileFunction(value.value);
            
            this.reactiveFieldMap.set(path, {
                fieldPath: path,
                evaluationFunction: compiledFunction,
                dependencies,
                fallbackValue: null
            });
            
            this.logger.debug('Reactive field identified:', {
                path,
                dependencies,
                function: value.value
            });
        }
    });
    
    this.logger.info('Reactive field processing complete:', {
        reactiveFieldCount: this.reactiveFieldMap.size,
        totalDependencies: this.countUniqueDependencies()
    });
}
```

### 6. Reactive Field Evaluation

```typescript
// Step 6: Evaluate reactive fields with context
private async evaluateReactiveFields(
    context: Record<string, FormFieldValue>
): Promise<void> {
    
    const evaluationOrder = this.calculateEvaluationOrder();
    
    for (const fieldPath of evaluationOrder) {
        const reactiveConfig = this.reactiveFieldMap.get(fieldPath);
        if (!reactiveConfig) continue;
        
        try {
            // Check dependency availability
            const dependenciesAvailable = reactiveConfig.dependencies.every(
                dep => this.getNestedValue(context, dep) !== undefined
            );
            
            if (dependenciesAvailable) {
                const result = await reactiveConfig.evaluationFunction(context, this.plugin);
                this.setNestedValue(context, fieldPath, result);
                
                this.logger.debug('Reactive field evaluated:', {
                    fieldPath,
                    dependencies: reactiveConfig.dependencies,
                    result
                });
            } else {
                this.setNestedValue(context, fieldPath, reactiveConfig.fallbackValue);
                
                this.logger.debug('Using fallback for reactive field:', {
                    fieldPath,
                    missingDependencies: this.getMissingDependencies(reactiveConfig.dependencies, context)
                });
            }
        } catch (error) {
            this.logger.error('Reactive field evaluation failed:', {
                fieldPath,
                error: error.message
            });
            
            this.setNestedValue(context, fieldPath, reactiveConfig.fallbackValue);
        }
    }
}
```

### 7. Template Processing States

```typescript
// Complete processing states after each step
class TemplateManager {
    // State after Step 2: Base + Subclass Applied
    private currentProcessedTemplate = {
        "author": {
            "display": true,
            "inputType": "dropdown",
            "options": {
                "type": "function",
                "value": "this.settings.authors.map(author => author.name)"
            }
        },
        "chemical": {
            "name": { "display": true, "inputType": "text", "default": "" },
            "properties": {
                "composition": {
                    "solvents": {
                        "display": true,
                        "inputType": "list",
                        "listType": "object",
                        "initialItems": 1,
                        "objectTemplate": {
                            "name": { "inputType": "text", "default": "" },
                            "volume fraction": { "inputType": "text", "default": "" }
                        }
                    }
                }
            }
        }
    };
    
    // State after Step 3: Non-Reactive Functions Evaluated
    private currentProcessedTemplate = {
        "author": {
            "display": true,
            "inputType": "dropdown",
            "options": ["Dr. Smith", "Dr. Johnson"] // Function evaluated
        },
        "chemical": {
            "name": { "display": true, "inputType": "text", "default": "" },
            "properties": {
                "composition": {
                    "solvents": {
                        "display": true,
                        "inputType": "list",
                        "listType": "object",
                        "initialItems": 1,
                        "objectTemplate": {
                            "name": { "inputType": "text", "default": "" },
                            "volume fraction": { "inputType": "text", "default": "" }
                        }
                    }
                }
            }
        }
    };
    
    // State after Step 4: Initial Metadata Created
    private initialMetadata = {
        "author": "", // String default for dropdown
        "chemical": {
            "name": "",
            "properties": {
                "composition": {
                    "solvents": [
                        { "name": "", "volume fraction": "" } // Initial item created
                    ]
                }
            }
        }
    };
}
```

## Template Types and Structures

### Base Template Structure

```typescript
// Base template loaded from plugin settings
interface BaseTemplate {
    [fieldName: string]: {
        display: boolean;           // Show in form UI
        inputType: string;         // Component type
        default?: any;             // Default value or function
        options?: any;             // Options array or function
        units?: string[];          // Available units
        validation?: object;       // Validation rules
        [key: string]: any;       // Additional properties
    } | BaseTemplate;             // Nested objects
}
```

### Subclass Template Structure

```typescript
// Subclass template with "add" array format
interface SubclassTemplate {
    add: Array<{
        fullKey: string;          // Dot-notation path for field placement
        input: {                  // Field definition to add
            display: boolean;
            inputType: string;
            [key: string]: any;
        };
    }>;
}
```

### Processed Template Field

```typescript
// Final processed field with all functions evaluated
interface ProcessedTemplateField {
    display: boolean;             // Pre-calculated
    inputType: string;           // Component type
    default: any;                // Evaluated default value
    options?: string[];          // Evaluated options array
    units?: string[];            // Available units
    fieldPath: string;           // Full path for InputManager
    isDisplayed: boolean;        // UI visibility flag
    isEditable: boolean;         // User input allowed
    nestedObjectTemplate?: ProcessedObjectTemplate; // For objects
    itemTemplate?: ProcessedObjectTemplate;        // For lists
}
```

## Function Types and Processing

### Non-Reactive Functions
```typescript
// Evaluated once during template processing
{
    "type": "function",
    "value": "this.settings.authors.map(author => author.name)"
}
// Becomes: ["Dr. Smith", "Dr. Johnson"]
```

### Reactive Functions
```typescript
// Evaluated whenever dependencies change
{
    "type": "reactive",
    "value": "(formData) => calculateMolecularWeight(formData.chemical.formula)",
    "dependencies": ["chemical.formula"]
}
// Stored in ReactiveFieldMap for later evaluation
```

## Dependency Management

### Dependency Extraction

```typescript
private extractDependencies(functionString: string): string[] {
    // Parse function to identify formData property accesses
    const dependencyRegex = /formData\.([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)/g;
    const dependencies: string[] = [];
    let match;
    
    while ((match = dependencyRegex.exec(functionString)) !== null) {
        dependencies.push(match[1]);
    }
    
    return Array.from(new Set(dependencies)); // Remove duplicates
}
```

### Evaluation Order Calculation

```typescript
private calculateEvaluationOrder(): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    
    const visit = (fieldPath: string) => {
        if (visited.has(fieldPath)) return;
        if (visiting.has(fieldPath)) {
            this.logger.warn('Circular dependency detected:', fieldPath);
            return;
        }
        
        visiting.add(fieldPath);
        
        const config = this.reactiveFieldMap.get(fieldPath);
        if (config) {
            // Visit dependencies first
            for (const dep of config.dependencies) {
                if (this.reactiveFieldMap.has(dep)) {
                    visit(dep);
                }
            }
        }
        
        visiting.delete(fieldPath);
        visited.add(fieldPath);
        sorted.push(fieldPath);
    };
    
    Array.from(this.reactiveFieldMap.keys()).forEach(visit);
    return sorted;
}
```

## Error Handling and Validation

### Function Evaluation Errors

```typescript
private async evaluateFunction(functionDef: any): Promise<any> {
    try {
        const compiledFunction = new Function('return ' + functionDef.value);
        const result = await compiledFunction.call(this);
        
        return result;
    } catch (error) {
        this.logger.error('Function evaluation failed:', {
            function: functionDef.value,
            error: error.message
        });
        
        // Return type-appropriate fallback
        return this.getFallbackValue(functionDef);
    }
}
```

### Template Validation

```typescript
private validateTemplate(template: Record<string, unknown>): boolean {
    const errors: string[] = [];
    
    this.traverseTemplate(template, (value, path) => {
        if (this.isFieldDefinition(value)) {
            if (!value.inputType) {
                errors.push(`Missing inputType at ${path}`);
            }
            if (value.inputType === 'dropdown' && !value.options) {
                errors.push(`Dropdown missing options at ${path}`);
            }
        }
    });
    
    if (errors.length > 0) {
        this.logger.error('Template validation failed:', errors);
        return false;
    }
    
    return true;
}
```

## Integration with InputManager

### Reactive Field Map Provision

```typescript
// TemplateManager provides reactive field definitions to InputManager
getReactiveFieldMap(): Map<string, ReactiveFieldInfo> {
    return this.reactiveFieldMap;
}

// Called by NewNoteModal during initialization
initializeFormSystem(inputManager: InputManager): void {
    inputManager.setReactiveFieldDefinitions(this.reactiveFieldMap);
    inputManager.setInitialData(this.initialMetadata);
}
```

## Key Benefits

### Performance Benefits
1. **Single Processing Pass**: All non-reactive functions evaluated once
2. **Efficient Reactive Lookup**: Pre-built dependency maps
3. **No Redundant Evaluation**: Cached processed templates
4. **Optimal Evaluation Order**: Dependency-sorted reactive fields

### Reliability Benefits
1. **Error Isolation**: Function failures don't break entire template
2. **Fallback Values**: Always provide usable defaults
3. **Validation**: Template structure validated before processing
4. **Dependency Detection**: Circular dependencies handled gracefully

### Maintainability Benefits
1. **Clear Separation**: Template processing separate from UI rendering
2. **Structured Processing**: Step-by-step workflow with clear states
3. **Comprehensive Logging**: Detailed processing information
4. **Type Safety**: Strong typing for all template structures

## Related Documentation

- **[Component Architecture](./component-architecture.md)** - How processed templates are used by components
- **[Reactive Fields](./reactive-fields.md)** - Detailed reactive field evaluation system
- **[Data Flow Architecture](./data-flow.md)** - Overall system data flow patterns