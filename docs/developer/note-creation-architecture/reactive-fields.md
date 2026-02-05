# Reactive Field Evaluation System

## Overview

The reactive field system automatically updates dependent fields when their dependencies change. This system provides efficient dependency lookup, proper evaluation ordering, and robust error handling to maintain form stability.

## Core Concepts

### Reactive Field Definition

Reactive fields are template fields that have their values calculated based on other field values. Unlike static defaults, reactive fields re-evaluate whenever their dependencies change.

```typescript
// Example reactive field in template
{
    fieldPath: "chemical.molecular_weight",
    reactive: true,
    reactiveFunction: (formData, plugin) => {
        const formula = formData.chemical?.formula;
        if (!formula) return null;
        return calculateMolecularWeight(formula);
    },
    dependencies: ["chemical.formula"],
    fallbackValue: null
}
```

## Data Structures

### ReactiveFieldInfo Interface

```typescript
interface ReactiveFieldInfo {
    fieldPath: string;                // Full path to the reactive field
    evaluationFunction: Function;     // Compiled function ready for execution
    dependencies: string[];           // Array of field paths this field depends on
    fallbackValue: any;              // Fallback value if dependencies aren't met
}
```

### Core Data Maps

```typescript
// ReactiveFieldMap: fieldPath → ReactiveFieldInfo
// Stores all reactive field definitions for quick lookup
type ReactiveFieldMap = Map<string, ReactiveFieldInfo>;

// DependencyMap: dependencyPath → array of reactive field paths that depend on it
// Enables efficient lookup during setValue operations
type DependencyMap = Map<string, string[]>;

// Example:
// If "chemical.molecular_weight" is reactive and depends on ["chemical.formula"]
// ReactiveFieldMap: "chemical.molecular_weight" → ReactiveFieldInfo
// DependencyMap: "chemical.formula" → ["chemical.molecular_weight"]
```

## InputManager Integration

### Initialization

```typescript
class InputManager {
    private reactiveFieldMap: ReactiveFieldMap = new Map();
    private dependencyMap: DependencyMap = new Map();
    
    // Called by NewNoteModal during initialization
    setReactiveFieldDefinitions(reactiveFieldMap: ReactiveFieldMap): void {
        this.reactiveFieldMap = reactiveFieldMap;
        this.dependencyMap = this.buildDependencyMap(reactiveFieldMap);
        
        this.logger.debug('Reactive field system initialized:', {
            reactiveFieldCount: this.reactiveFieldMap.size,
            dependencyCount: this.dependencyMap.size,
            reactiveFields: Array.from(this.reactiveFieldMap.keys()),
            dependencies: Array.from(this.dependencyMap.keys())
        });
    }
    
    private buildDependencyMap(reactiveFieldMap: ReactiveFieldMap): DependencyMap {
        const dependencyMap: DependencyMap = new Map();
        
        for (const [reactiveFieldPath, reactiveInfo] of reactiveFieldMap) {
            for (const dependencyPath of reactiveInfo.dependencies) {
                if (!dependencyMap.has(dependencyPath)) {
                    dependencyMap.set(dependencyPath, []);
                }
                dependencyMap.get(dependencyPath)!.push(reactiveFieldPath);
            }
        }
        
        return dependencyMap;
    }
}
```

### Enhanced setValue with Reactive Evaluation

```typescript
class InputManager {
    setValue(fieldPath: string, value: FormFieldValue): void {
        // 1. Update the field value
        this.setFieldValue(fieldPath, value);
        
        // 2. Check if this field change affects any reactive fields
        const affectedReactiveFields = this.dependencyMap.get(fieldPath);
        
        if (affectedReactiveFields && affectedReactiveFields.length > 0) {
            this.logger.debug('Field change triggers reactive evaluation:', {
                changedField: fieldPath,
                changedValue: value,
                affectedReactiveFields
            });
            
            // 3. Evaluate affected reactive fields in dependency order
            this.evaluateReactiveFields(affectedReactiveFields);
        }
        
        // 4. Trigger UI updates for the changed field
        this.notifyFieldChange(fieldPath, value);
        
        // 5. Trigger change callback for parent components
        this.triggerChangeCallback();
    }
    
    private evaluateReactiveFields(reactiveFieldPaths: string[]): void {
        // Sort reactive fields by dependency order to ensure correct evaluation sequence
        const sortedFields = this.sortByDependencyOrder(reactiveFieldPaths);
        
        for (const reactiveFieldPath of sortedFields) {
            this.evaluateSingleReactiveField(reactiveFieldPath);
        }
    }
}
```

## Detailed Evaluation Process

### Single Reactive Field Evaluation

```typescript
private evaluateSingleReactiveField(reactiveFieldPath: string): void {
    const reactiveInfo = this.reactiveFieldMap.get(reactiveFieldPath);
    if (!reactiveInfo) {
        this.logger.warn('Reactive field not found in map:', reactiveFieldPath);
        return;
    }
    
    try {
        // Check if all dependencies are available
        const dependencyValues: Record<string, any> = {};
        let allDependenciesAvailable = true;
        
        for (const depPath of reactiveInfo.dependencies) {
            const depValue = this.getValue(depPath);
            if (depValue === undefined || depValue === null) {
                allDependenciesAvailable = false;
                this.logger.debug('Dependency not available for reactive field:', {
                    reactiveField: reactiveFieldPath,
                    missingDependency: depPath
                });
                break;
            }
            dependencyValues[depPath] = depValue;
        }
        
        let newValue: any;
        
        if (allDependenciesAvailable) {
            // Execute the reactive function with current form data
            const currentData = this.getData();
            newValue = reactiveInfo.evaluationFunction(currentData, this.plugin);
            
            this.logger.debug('Reactive field evaluated successfully:', {
                reactiveField: reactiveFieldPath,
                dependencies: dependencyValues,
                result: newValue
            });
        } else {
            // Use fallback value when dependencies aren't met
            newValue = reactiveInfo.fallbackValue;
            
            this.logger.debug('Using fallback value for reactive field:', {
                reactiveField: reactiveFieldPath,
                fallbackValue: newValue
            });
        }
        
        // Update the reactive field value (without triggering reactive cascade)
        this.setFieldValueDirect(reactiveFieldPath, newValue);
        
        // Notify UI components that this reactive field has changed
        this.notifyFieldChange(reactiveFieldPath, newValue);
        
    } catch (error) {
        this.logger.error('Error evaluating reactive field:', {
            reactiveField: reactiveFieldPath,
            error: error.message,
            fallbackValue: reactiveInfo.fallbackValue
        });
        
        // Use fallback value on error
        this.setFieldValueDirect(reactiveFieldPath, reactiveInfo.fallbackValue);
        this.notifyFieldChange(reactiveFieldPath, reactiveInfo.fallbackValue);
    }
}
```

### Dependency Order Resolution

```typescript
private sortByDependencyOrder(reactiveFieldPaths: string[]): string[] {
    // Sort reactive fields to ensure dependencies are evaluated before dependents
    // This prevents evaluation order issues when multiple reactive fields are affected
    
    const sorted: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    
    const visit = (fieldPath: string) => {
        if (visited.has(fieldPath)) return;
        if (visiting.has(fieldPath)) {
            // Circular dependency detected - use original order as fallback
            this.logger.warn('Circular dependency detected in reactive fields:', fieldPath);
            return;
        }
        
        visiting.add(fieldPath);
        
        const reactiveInfo = this.reactiveFieldMap.get(fieldPath);
        if (reactiveInfo) {
            // Visit dependencies first (that are also reactive fields)
            for (const dep of reactiveInfo.dependencies) {
                if (reactiveFieldPaths.includes(dep)) {
                    visit(dep);
                }
            }
        }
        
        visiting.delete(fieldPath);
        visited.add(fieldPath);
        sorted.push(fieldPath);
    };
    
    for (const fieldPath of reactiveFieldPaths) {
        visit(fieldPath);
    }
    
    return sorted;
}
```

### Direct Field Updates (Cascade Prevention)

```typescript
private setFieldValueDirect(fieldPath: string, value: any): void {
    // Direct field update that doesn't trigger reactive evaluation
    // (to prevent infinite loops during reactive evaluation)
    this.setFieldValue(fieldPath, value);
}
```

## Complete Reactive Field Lifecycle

```typescript
// Step-by-step reactive field evaluation workflow
1. User changes field value (e.g., "chemical.formula" = "H2O")
2. Component calls: inputManager.setValue("chemical.formula", "H2O")
3. InputManager stores the new value
4. InputManager checks dependencyMap: does "chemical.formula" affect any reactive fields?
5. If yes, get list of affected reactive fields: ["chemical.molecular_weight", "chemical.density"]
6. Sort affected fields by dependency order to prevent evaluation conflicts
7. For each affected reactive field:
   a. Get ReactiveFieldInfo from reactiveFieldMap
   b. Check if all dependencies are available in current form data
   c. If available: execute reactiveInfo.evaluationFunction(currentData, plugin)
   d. If not available: use reactiveInfo.fallbackValue
   e. Update reactive field value directly (no cascade)
   f. Notify UI components of reactive field change
8. All reactive evaluations complete
9. UI updates reflect both original change and reactive field updates
```

## TemplateManager Integration

### Reactive Field Map Provision

```typescript
// NewNoteModal initialization workflow
class NewNoteModal {
    private initializeReactiveFields(): void {
        // Get the reactive field map from TemplateManager
        const reactiveFieldMap = this.templateManager.getReactiveFieldMap();
        
        this.logger.debug('Initializing reactive fields from TemplateManager:', {
            reactiveFieldCount: reactiveFieldMap.size,
            reactiveFields: Array.from(reactiveFieldMap.keys())
        });
        
        // Pass reactive field definitions to InputManager
        this.inputManager.setReactiveFieldDefinitions(reactiveFieldMap);
        
        // Perform initial reactive evaluation with default/initial values
        this.inputManager.evaluateAllReactiveFields();
    }
}

// TemplateManager provides reactive field map
class TemplateManager {
    getReactiveFieldMap(): ReactiveFieldMap {
        // Return the reactive field map built during template processing
        return this.reactiveFieldMap;
    }
}
```

## Error Handling and Fallbacks

### Comprehensive Error Recovery

```typescript
private evaluateSingleReactiveField(reactiveFieldPath: string): void {
    const reactiveInfo = this.reactiveFieldMap.get(reactiveFieldPath);
    
    try {
        // ... evaluation logic ...
    } catch (error) {
        // Comprehensive error handling
        this.logger.error('Reactive field evaluation failed:', {
            field: reactiveFieldPath,
            error: error.message,
            stack: error.stack,
            dependencies: reactiveInfo.dependencies,
            currentData: this.getData()
        });
        
        // Always provide a fallback value to maintain form stability
        const fallbackValue = reactiveInfo.fallbackValue ?? null;
        this.setFieldValueDirect(reactiveFieldPath, fallbackValue);
        this.notifyFieldChange(reactiveFieldPath, fallbackValue);
        
        // Optionally notify user of evaluation error
        this.notifyReactiveFieldError(reactiveFieldPath, error);
    }
}
```

### Initial Evaluation

```typescript
// Initial evaluation of all reactive fields (called once during initialization)
evaluateAllReactiveFields(): void {
    const allReactiveFields = Array.from(this.reactiveFieldMap.keys());
    const sortedFields = this.sortByDependencyOrder(allReactiveFields);
    
    this.logger.debug('Initial reactive field evaluation:', {
        totalFields: sortedFields.length,
        evaluationOrder: sortedFields
    });
    
    for (const fieldPath of sortedFields) {
        this.evaluateSingleReactiveField(fieldPath);
    }
}
```

## Performance Optimizations

### Batch Updates

```typescript
// Batch reactive evaluations to avoid multiple UI updates
private batchEvaluateReactiveFields(reactiveFieldPaths: string[]): void {
    this.beginBatchUpdate(); // Suspend UI updates
    
    try {
        const sortedFields = this.sortByDependencyOrder(reactiveFieldPaths);
        
        for (const fieldPath of sortedFields) {
            this.evaluateSingleReactiveField(fieldPath);
        }
    } finally {
        this.endBatchUpdate(); // Resume UI updates and trigger batch notification
    }
}
```

### Infinite Loop Prevention

```typescript
// Prevent infinite loops in complex reactive scenarios
private preventInfiniteEvaluation(): void {
    if (this.evaluationDepth > MAX_EVALUATION_DEPTH) {
        throw new Error('Maximum reactive evaluation depth exceeded - possible circular dependency');
    }
}
```

## Key Benefits

### Performance Benefits
1. **Efficient Dependency Lookup**: DependencyMap enables O(1) lookup of affected reactive fields
2. **Proper Evaluation Order**: Dependency sorting prevents evaluation conflicts
3. **Batch Updates**: Multiple reactive changes trigger single UI update
4. **Depth Limiting**: Prevents infinite loops in complex scenarios

### Reliability Benefits
1. **Robust Error Handling**: Fallback values ensure form stability
2. **Dependency Validation**: Checks availability before evaluation
3. **Circular Dependency Detection**: Graceful handling of complex dependencies
4. **Clear Integration**: Well-defined handoff between TemplateManager and InputManager

## Related Documentation

- **[Template Processing](./template-processing.md)** - How reactive fields are identified and processed from templates
- **[Data Flow Architecture](./data-flow.md)** - Overall data flow patterns and component interactions
- **[API Reference](./api-reference.md)** - Complete InputManager reactive field API