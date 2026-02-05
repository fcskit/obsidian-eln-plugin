# Refactored Modal Architecture

## Overview

This document describes the new refactored modal architecture that provides a clean, scalable solution for template-driven form rendering with support for complex nested objects and subclass modifications.

## Architecture Components

### 1. TemplateManager (`components_new/TemplateManager.ts`)

**Purpose**: Centralized template management and subclass processing

**Key Features**:
- Immutable base template preservation
- Template modification history
- Subclass template application with `insertAfter`/`insertBefore` support
- Field editability and permission control

**Usage**:
```typescript
const templateManager = new TemplateManager({
    baseTemplate: originalTemplate
});

// Apply subclass modifications
templateManager.applySubclassTemplate({
    add: [{
        fullKey: "chemical.properties.theoretical capacity",
        insertAfter: "chemical.properties.density",
        input: { inputType: "number", units: ["mAh/g"] }
    }]
});
```

### 2. InputManager (`components_new/InputManager.ts`)

**Purpose**: Centralized state management for form data and input components

**Key Features**:
- Unified data and input component management
- Position-based key insertion with `insertAfter`/`insertBefore`
- Key order preservation during operations
- Nested object support with dot notation paths

**Usage**:
```typescript
const inputManager = new InputManager({}, (data) => {
    console.log('Data changed:', data);
});

// Add field with positioning
inputManager.addKeyAtPosition(
    "metadata", 
    "version", 
    "1.0.0",
    { insertAfter: "author" }
);
```

### 3. UniversalObjectRenderer (`components_new/UniversalObjectRenderer.ts`)

**Purpose**: Universal object rendering supporting editable, readonly, and mixed modes

**Key Features**:
- Template-driven field rendering
- Recursive nested object support
- Multiple rendering modes (editable/readonly/mixed)
- Automatic primitive type inference
- Integration with TemplateManager and InputManager

**Usage**:
```typescript
const renderer = new UniversalObjectRenderer({
    container: containerElement,
    label: "Object Editor",
    templateManager: templateManager,
    inputManager: inputManager,
    renderingMode: "mixed", // Some fields readonly, some editable
    onChangeCallback: (data) => handleChange(data),
    app: this.app
});
```

### 4. NewNoteModalRefactored (`notes/NewNoteModalRefactored.ts`)

**Purpose**: Clean modal implementation using the new architecture

**Key Features**:
- Template-driven form generation
- Automatic recursive object rendering
- Built-in subclass support
- Comprehensive testing API
- Clean separation of concerns

## Key Improvements

### 1. **Template-Driven Everything**
- All rendering decisions come from templates
- Consistent behavior across all object types
- Easy to extend with new field types

### 2. **Recursive Object Support**
- Nested objects automatically create sub-renderers
- Infinite nesting depth supported
- Each level can have different rendering modes

### 3. **Subclass Integration**
- Direct support for `insertAfter`/`insertBefore` positioning
- Template modifications preserved separately from base template
- Easy rollback and history management

### 4. **Type Safety & Performance**
- Strong TypeScript typing throughout
- Efficient re-rendering only when needed
- Memory management with proper component lifecycle

## File Structure

```
src/ui/modals/
├── components/              # Original components (preserved for reference)
├── components_new/          # New refactored components
│   ├── TemplateManager.ts   # Template management
│   ├── InputManager.ts      # State management (copied from working version)
│   └── UniversalObjectRenderer.ts  # Universal object rendering
├── notes/
│   ├── NewNoteModal.ts      # Original modal (preserved)
│   └── NewNoteModalRefactored.ts   # New modal implementation
└── test/
    └── TestNoteCommand.ts   # Test command for validation
```

## Testing Strategy

### Test Note Command

A dedicated test note type is provided that demonstrates:

1. **Basic template rendering** - Simple fields with different types
2. **Mixed rendering modes** - Some readonly, some editable fields  
3. **Nested objects** - Metadata section with sub-fields
4. **Subclass application** - Button to apply test subclass template
5. **Template reset** - Reset to base template functionality

### Usage

1. Install the plugin
2. Run command: "Create Test Note (Refactored)"
3. Test the different features using the provided buttons
4. Verify the generated note contains correct data

## Migration Path

### Phase 1: Parallel Development ✅
- New components in `components_new/`
- New modal in `NewNoteModalRefactored.ts`
- Test command for validation

### Phase 2: Feature Parity (Next)
- Port all existing functionality to new architecture
- Test against existing note types
- Performance validation

### Phase 3: Integration (Future)
- Update existing modals to use new architecture
- Deprecate old components
- Remove obsolete code

## Benefits

### For Development
- **Cleaner code**: Clear separation of concerns
- **Easier testing**: Each component can be tested independently
- **Better maintainability**: Single universal renderer vs multiple specialized ones
- **Extensibility**: Easy to add new field types and rendering modes

### For Users
- **Consistent UX**: All object editors behave the same way
- **Better performance**: More efficient rendering and updates
- **Enhanced features**: Mixed readonly/editable modes, better subclass support

## Next Steps

1. **Test the current implementation** with the test note command
2. **Add missing primitive types** (dropdown, query, etc.) to UniversalObjectRenderer
3. **Port object list functionality** using UniversalObjectRenderer for each item
4. **Integrate with existing note types** one by one
5. **Performance optimization** and final polish

This architecture provides a solid foundation for scalable, maintainable form rendering that can handle any complexity of nested objects and template-driven customization.
