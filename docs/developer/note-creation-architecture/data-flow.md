# Data Flow Architecture

## Overview

The unified architecture establishes a clear, unidirectional data flow that eliminates dual data storage and simplifies component interactions. This document describes how data flows through the note creation system.

## Core Data Flow Pattern

```
User Input → Field Component → InputManager → Reactive Evaluation → UI Updates
```

### Key Principles

1. **Single Source of Truth**: InputManager is the authoritative data store
2. **Unidirectional Data Flow**: Data flows from input components to InputManager, then triggers updates
3. **Specific Field Updates**: Only changed fields are updated, never entire objects
4. **Reactive Evaluation**: Template changes and reactive fields are evaluated after data updates
5. **UI Synchronization**: Components render based on InputManager state

## Elimination of Dual Data Storage

### Before: Complex Dual-Storage Architecture
```typescript
// Field value change
User Input → LabeledPrimitiveInput 
          → handleFieldChangeWithCurrentKey()
          → this.object[key] = value
          → inputManager.setValue(fieldPath, value)
          → onChangeCallback(this.object)
          → Parent handles object change
          → Reactive field evaluation
          → UI updates
```

### After: Streamlined Single-Source Architecture
```typescript
// Field value change
User Input → LabeledPrimitiveInput
          → inputManager.setValue(this.fullFieldPath, value)
          → Automatic reactive updates
          → Field-specific UI callbacks
          → Done
```

## Input Management Patterns

### 1. Field Value Updates (Simplified)

```typescript
// SIMPLIFIED WORKFLOW for basic field value changes
1. User modifies field in UI component (e.g., LabeledPrimitiveInput)
2. Component validates input locally
3. Component calls: inputManager.setValue(this.fullFieldPath, value)
4. InputManager stores value in flat structure
5. InputManager automatically detects reactive dependencies
6. InputManager evaluates reactive functions and updates dependent fields
7. InputManager triggers field-specific UI updates via callbacks
8. Process complete - no object reconstruction or callback chains needed

// KEY SIMPLIFICATIONS:
// - No this.object updates in UniversalObjectRenderer
// - No onChangeCallback(this.object) calls
// - No object reconstruction or batched updates
// - Each component knows its own fullFieldPath
```

### 2. Component Architecture (Simplified)

```typescript
// Each input component stores its complete field path
class LabeledPrimitiveInput {
    private fullFieldPath: string; // e.g., "chemical.properties.molecular_weight"
    private inputManager: InputManager;
    
    onValueChange(newValue: any) {
        // Validate input
        if (!this.isValidInput(newValue)) return;
        
        // Direct update to InputManager - no intermediate steps
        this.inputManager.setValue(this.fullFieldPath, newValue);
        
        // InputManager handles all reactive updates and UI notifications
        // Component's job is done
    }
}
```

### 3. Complex Operations (Simplified)

#### Object Key Management

```typescript
// A. Key Renaming
1. User renames key in editable object field
2. Component calls: inputManager.renameField(oldPath, newPath, value)
3. InputManager updates field path and preserves value
4. Component updates its own fullFieldPath property
5. UI reflects new field name - no object reconstruction needed

// B. Key Addition
1. User adds new key to editable object
2. Component calls: inputManager.setValue(newFieldPath, defaultValue)
3. UniversalObjectRenderer creates new input component for the field
4. New component gets appropriate fullFieldPath
5. UI adds new input field to parent container - no full re-render

// C. Key Removal  
1. User removes key from editable object
2. Component calls: inputManager.removeField(fieldPath)
3. UniversalObjectRenderer removes component from parent container
4. UI updates by removing specific input field - no object reconstruction
```

#### Object List Management

```typescript
// A. Adding List Item
1. User clicks "+" button on object list
2. UniversalObjectRenderer determines next index (e.g., "solvents.2")  
3. Component calls: inputManager.addListItem(listPath, index, defaultItemObject)
4. InputManager creates fields for new item: "solvents.2.name", "solvents.2.volume_fraction"
5. UniversalObjectRenderer creates new field components with proper fullFieldPaths
6. UI adds new item container with input fields - no list reconstruction

// B. Removing List Item
1. User clicks "−" button on list item
2. Component calls: inputManager.removeListItem(listPath, index)
3. InputManager removes all fields for that item and renumbers subsequent items
4. UniversalObjectRenderer removes item container from list
5. UI updates field paths for renumbered items - no full list re-render
```

## Enhanced InputManager API

### Core Operations
```typescript
class InputManager {
    // Basic field operations
    setValue(fieldPath: string, value: any): void
    getValue(fieldPath: string): any
    removeField(fieldPath: string): void
    
    // Complex field operations
    renameField(oldPath: string, newPath: string): void
    addListItem(listPath: string, index: number, itemObject: Record<string, any>): void
    removeListItem(listPath: string, index: number): void
    changeFieldType(fieldPath: string, newType: string, defaultValue?: any): void
    
    // Data retrieval (replaces this.object)
    getData(objectPath?: string): any
    
    // Notification system for UI updates
    registerFieldCallback(fieldPath: string, callback: (value: any) => void): void
    registerStructuralCallback(objectPath: string, callback: () => void): void
}
```

### Field Ordering Preservation

**Critical Implementation Detail**: Field renaming operations must preserve the original field order within metadata objects.

```typescript
private renameKeyPreservingOrder(parentPath: string, oldKey: string, newKey: string): void {
    // Implementation similar to existing renameKey() in InputManager
    // Recreates parent object with same field order but renamed key
    // Critical for maintaining consistent metadata structure
}
```

**Reference Implementation**: See `src/ui/modals/utils/InputManager.ts` lines 565-600 for the correct order-preserving rename implementation.

## UniversalObjectRenderer Without Dual Storage

```typescript
// PROPOSED: UniversalObjectRenderer without redundant object storage
class UniversalObjectRenderer {
    private fullFieldPath: string; // Path to the object this renderer manages
    private inputManager: InputManager;
    // NO MORE: private object: Record<string, any>; 
    
    // Get current object state when needed from InputManager
    getCurrentObject(): Record<string, any> {
        return this.inputManager.getData(this.fullFieldPath);
    }
    
    // Key management operations
    renameKey(oldKey: string, newKey: string, value: any) {
        const oldPath = `${this.fullFieldPath}.${oldKey}`;
        const newPath = `${this.fullFieldPath}.${newKey}`;
        this.inputManager.renameField(oldPath, newPath, value);
        
        // Update component's field path
        this.updateComponentFieldPath(oldKey, newKey);
    }
    
    addKey(newKey: string, inputType: string) {
        const newPath = `${this.fullFieldPath}.${newKey}`;
        const defaultValue = this.getDefaultValueForType(inputType);
        this.inputManager.setValue(newPath, defaultValue);
        
        // Create and add new input component
        this.createAndAddInputComponent(newKey, inputType, newPath);
    }
    
    removeKey(key: string) {
        const fieldPath = `${this.fullFieldPath}.${key}`;
        this.inputManager.removeField(fieldPath);
        
        // Remove component from UI
        this.removeInputComponent(key);
    }
}
```

## Benefits of Streamlined Data Flow

### Performance Benefits
- **50% fewer steps** for basic field updates
- **No dual data storage** anywhere in the system
- **No object reconstruction** for any operation type
- **Targeted UI updates** instead of full re-renders
- **Single source of truth** for all data operations

### Maintainability Benefits
- **UniversalObjectRenderer becomes pure UI orchestrator**
- **Field components become pure input handlers with known paths**
- **InputManager becomes comprehensive data management layer**
- **Clean abstraction**: UI components don't need to understand data structure
- **Easier testing**: all data operations testable through InputManager API

### Architectural Benefits
- **Single Source of Truth**: InputManager for ALL data operations and component communication
- **Clear Separation**: TemplateManager processes, InputManager manages, Components render
- **Unidirectional Data Flow**: Template → Component → InputManager, no reverse dependencies
- **Consistent Architecture**: Same patterns for all input types (basic fields, lists, nested objects)

## Related Documentation

- **[Component Architecture](./component-architecture.md)** - Template-first component design patterns
- **[Reactive Fields](./reactive-fields.md)** - Detailed reactive field evaluation system
- **[API Reference](./api-reference.md)** - Complete InputManager API documentation