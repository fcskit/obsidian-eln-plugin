# Nested Properties Editor (NPE)

The Nested Properties Editor (NPE) is a sophisticated frontmatter editing system that provides a visual, form-based interface for managing YAML metadata in Obsidian notes. It transforms complex nested properties into an intuitive, interactive editing experience.

## Overview

The NPE system allows users to:

- **Visual Editing**: Edit YAML frontmatter through an interactive form interface
- **Nested Structure Support**: Handle complex nested objects and arrays seamlessly
- **Type-Safe Operations**: Automatic type detection and validation for different data types
- **Real-time Updates**: Live synchronization between the editor and file metadata
- **Extensible Framework**: Support for custom input types and validation rules

## Architecture

### Core Components

The NPE system is built around several key components:

#### View Components

1. **NestedPropertiesEditorView** (`src/ui/views/NestedPropertiesEditor.ts`)
   - Main view component that manages the NPE interface
   - Extends Obsidian's `ItemView` for workspace integration
   - Handles file changes and metadata synchronization

2. **NestedPropertiesEditorCodeBlockView** (`src/ui/views/NestedPropertiesEditor.ts`)
   - Code block processor for embedding NPE in notes
   - Supports filtering specific properties and customization

3. **NPEComponent** (`src/ui/views/NestedPropertiesEditor.ts`)
   - Lifecycle management wrapper around NPE content
   - Handles proper event cleanup and memory management

#### Rendering System

```typescript
┌─────────────────────────────────────────────────────┐
│                NPE Rendering Pipeline                │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │ renderFrontMatter│  │     Component Factory       ││
│  │ Entry Point     │  │     • renderPrimitive       ││
│  │                 │  │     • renderObjectContainer ││
│  │                 │  │     • renderArray           ││
│  └─────────────────┘  └─────────────────────────────┘│
│            │                        │                │
│            ▼                        │                │
│  ┌─────────────────────────────────▼─────────────────┐│
│  │             Type Detection                        ││
│  │  • getDataType()     • getPropertyInputType()    ││
│  │  • getFrontmatterValue()  • Property Icons       ││
│  └─────────────────────────────┬─────────────────────┘│
│                                │                     │
│  ┌─────────────────────────────▼─────────────────────┐│
│  │           Event Management                        ││
│  │  • DOM Event Registration   • Property Updates   ││
│  │  • Key Editing              • Type Switching     ││
│  │  • Add/Remove Operations    • Validation         ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### File Structure

```
src/ui/renderer/npe/
├── core/                           # Core rendering functions
│   ├── renderFrontMatter.ts       # Main entry point
│   ├── renderObject.ts            # Object property rendering
│   ├── renderObjectContainer.ts   # Object container management
│   ├── renderPrimitive.ts         # Primitive value rendering
│   ├── renderArray.ts             # Array handling
│   ├── renderPrimitiveArray.ts    # Primitive array rendering
│   └── renderObjectArray.ts       # Object array rendering
├── elements/                       # Reusable UI elements
│   ├── createEditableDiv.ts       # Editable text elements
│   ├── createInternalLinkElement.ts # Internal link creation
│   ├── createExternalLinkElement.ts # External link creation
│   └── createResizableInput.ts    # Resizable input fields
├── helpers/                        # Utility functions
│   ├── getDataType.ts             # Type detection
│   ├── getPropertyIcon.ts         # Icon selection
│   ├── getPropertyInputType.ts    # Input type detection
│   ├── getFrontmatterValue.ts     # Value extraction
│   ├── addToggleEvent.ts          # Expand/collapse logic
│   ├── addKeyWrapperResizeHandle.ts # Resizing functionality
│   ├── addProperty.ts             # Property addition
│   ├── updateDataKeys.ts          # Key updates
│   └── showTypeSwitchMenu.ts      # Type conversion menu
├── utils/                          # Core utilities
│   ├── updateProperties.ts        # Property update logic
│   └── changeKeyName.ts           # Key renaming utilities
├── buttons/                        # Action buttons
│   ├── createAddPropertyButton.ts # Add property functionality
│   ├── createToggleButton.ts      # Show/hide toggle
│   ├── createReloadButton.ts      # Refresh functionality
│   └── createFixDeprecatedButton.ts # Deprecated property fixes
└── index.ts                       # Public API exports
```

## Key Features

### 1. Property Type Support

The NPE supports a comprehensive range of data types:

#### Primitive Types
- **String**: Text input with validation
- **Number**: Numeric input with type checking
- **Boolean**: Checkbox or toggle interface
- **Date**: Date picker integration
- **URL**: Link validation and preview

#### Complex Types
- **Objects**: Nested property containers with expand/collapse
- **Arrays**: Dynamic list management with add/remove
- **Mixed Arrays**: Arrays containing different data types
- **File Links**: Internal Obsidian file references
- **External Links**: External URL management

### 2. Interactive Features

#### Dynamic Type Switching
```typescript
// Users can convert between compatible types
showTypeSwitchMenu(view, container, key, fullKey, level, isKeyOfArrayObject);
```

#### Expandable/Collapsible Objects
```typescript
// Nested objects can be expanded or collapsed
addToggleEvent(view, iconContainer, keyLabelDiv, propertiesContainer);
```

#### Resizable Key Columns
```typescript
// Key-value column widths can be adjusted
addKeyWrapperResizeHandle(view, keyWrapper, npeViewContainer);
```

#### In-place Key Editing
```typescript
// Property keys can be edited directly
changeKeyName(view, oldKey, newKey, fullKey, value, dataType);
```

### 3. Real-time Synchronization

The NPE maintains real-time synchronization with file metadata:

```typescript
// Automatic updates when properties change
updateProperties(view.app, view.currentFile!, fullKey, newValue, dataType);
```

## Usage Examples

### Basic Implementation

#### Creating an NPE View

```typescript
import { NestedPropertiesEditorView } from './ui/views/NestedPropertiesEditor';

// Register the view
this.registerView(
    NestedPropertiesEditorView.viewType,
    (leaf) => new NestedPropertiesEditorView(leaf)
);

// Activate the view
const leaf = this.app.workspace.getLeaf(false);
await leaf.setViewState({
    type: NestedPropertiesEditorView.viewType,
    active: true,
});
```

#### Code Block Integration

```markdown
```npe
key: value
filter: ["title", "tags"]
actionButtons: true
cssclasses: ["custom-npe"]
```

This creates an embedded NPE editor within a note.

### Advanced Usage

#### Custom Property Types

```typescript
// Extending primitive rendering for custom types
export function renderPrimitive(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    key: string,
    value: FrontmatterPrimitive,
    parent: HTMLElement,
    level: number,
    fullKey: string,
    isKeyOfArrayObject: boolean = false,
    isArrayItem: boolean = false
): void {
    // Custom type detection and rendering logic
    const inputType = getPropertyInputType(key, value);
    const dataType = getDataType(value);
    
    // Create appropriate input element based on type
    switch (inputType) {
        case 'custom-type':
            // Custom rendering logic
            break;
        default:
            // Standard rendering
    }
}
```

#### Property Validation

```typescript
// Adding validation to property updates
function validateProperty(key: string, value: unknown, dataType: string): boolean {
    switch (dataType) {
        case 'email':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string);
        case 'url':
            return URL.canParse(value as string);
        case 'number':
            return !isNaN(Number(value));
        default:
            return true;
    }
}
```

## Configuration Options

### View Configuration

```typescript
interface NPEConfig {
    // Property filtering
    excludeKeys?: string[];           // Keys to hide from editor
    includeKeys?: string[];           // Only show specified keys
    
    // UI customization
    actionButtons?: boolean;          // Show add/remove buttons
    cssclasses?: string[];           // Custom CSS classes
    
    // Behavior options
    autoSave?: boolean;              // Auto-save changes
    validateOnChange?: boolean;      // Real-time validation
    expandLevel?: number;            // Default expand depth
}
```

### Code Block Parameters

When using NPE in code blocks, these parameters are supported:

- **`key`**: Specific property path to edit (e.g., "experiment.materials")
- **`excludeKeys`**: Array of keys to exclude from editing
- **`actionButtons`**: Boolean to show/hide action buttons
- **`cssclasses`**: Array of CSS classes for styling

## Event Handling

### Component Lifecycle

The NPE implements proper component lifecycle management:

```typescript
class NPEComponent extends MarkdownRenderChild {
    onload() {
        // Component initialization
        logger.debug(`Component ${this.instanceId} loading`);
    }
    
    onunload() {
        // Cleanup event handlers and DOM references
        logger.debug(`Component ${this.instanceId} unloading, cleaning up event handlers`);
    }
}
```

### Event Registration

All DOM events are properly registered for cleanup:

```typescript
// Proper event registration
view.registerDomEvent(element, "click", (evt: MouseEvent) => {
    // Event handler logic
});
```

### Memory Management

The NPE includes sophisticated memory management:

```typescript
// Debounced updates prevent excessive re-rendering
private debouncedUpdateView(immediate: boolean = false) {
    if (this.updateTimeout) {
        clearTimeout(this.updateTimeout);
    }
    
    if (immediate) {
        this.updateView();
    } else {
        this.updateTimeout = setTimeout(() => {
            this.updateView();
        }, 100);
    }
}
```

## Performance Considerations

### Optimized Rendering

1. **Incremental Updates**: Only re-render changed properties
2. **Event Cleanup**: Proper cleanup prevents memory leaks
3. **Debounced Operations**: Prevent excessive updates during rapid changes
4. **Virtual Scrolling**: For large property sets (planned feature)

### Memory Management

```typescript
// Component cleanup
private cleanupCurrentComponent() {
    if (this.currentNPEComponent) {
        // Clear DOM references
        const containerEl = this.currentNPEComponent.containerEl;
        if (containerEl) {
            containerEl.innerHTML = '';
            (containerEl as any)._npeComponent = null;
        }
        
        // Unload component
        this.currentNPEComponent.unload();
        this.currentNPEComponent = null;
    }
}
```

## Debugging and Troubleshooting

### Debug Logging

The NPE uses the plugin's logging system extensively:

```typescript
import { createLogger } from '../../utils/Logger';
const logger = createLogger('npe');

// Enable NPE debug logging
logger.enableDebugFor('npe');
```

### Common Issues

#### 1. Memory Leaks
**Symptoms**: Increasing memory usage, slow performance
**Solution**: Check event handler cleanup, enable debug logging

```typescript
// Debug memory usage
window.npeDebug.getActiveComponents(); // Check active component count
logger.debug('NPE components', components);
```

#### 2. Render Loops
**Symptoms**: Excessive rendering, browser freezing
**Solution**: Check for recursive update prevention

```typescript
if (this.isUpdating) {
    logger.debug('Update already in progress, skipping');
    return;
}
```

#### 3. Type Conversion Issues
**Symptoms**: Data loss during type changes
**Solution**: Implement proper type conversion validation

```typescript
// Safe type conversion
if (newDataType === 'number' && isNaN(Number(value))) {
    new Notice('Cannot convert to number: invalid value');
    return;
}
```

### Debug Commands

The NPE includes runtime debug commands:

- **Enable NPE Debug Logging**: `eln-enable-debug-npe`
- **Quiet NPE Logging**: `eln-quiet-npe`
- **Show Logger Configuration**: `eln-show-logger-config`

## CSS Styling

### Core NPE Styles

The NPE uses a modular CSS system located in `src/styles/npe.css`:

```css
/* Core container styles */
.npe-view-container {
    display: flex;
    flex-direction: column;
    gap: var(--size-4-2);
}

/* Property container */
.npe-properties-container {
    display: flex;
    flex-direction: column;
    gap: var(--size-2-1);
}

/* Key-value pairs */
.npe-key-wrapper {
    display: flex;
    align-items: center;
    gap: var(--size-2-3);
    padding: var(--size-2-1);
}
```

### Customization

Custom styling can be applied through CSS classes:

```css
/* Custom NPE styling */
.custom-npe .npe-key-wrapper {
    background-color: var(--background-secondary);
    border-radius: var(--radius-s);
}

.custom-npe .npe-primitive-input {
    border: 1px solid var(--border-color);
}
```

## Integration with Plugin Systems

### Template System Integration

The NPE integrates with the plugin's template system:

```typescript
// NPE can render template-generated properties
const templateData = await evaluateTemplate(template, context);
renderFrontMatter(view, '', [], true, ['template-generated']);
```

### Search Integration

Properties edited in NPE are automatically indexed:

```typescript
// Properties are searchable through Obsidian's search
app.metadataCache.getFileCache(file).frontmatter;
```

### Command Integration

NPE properties can be accessed through plugin commands:

```typescript
// Access NPE data in commands
const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
const npeData = frontmatter?.experiment?.materials;
```

## Testing

### Unit Testing

```typescript
// Test property rendering
describe('renderPrimitive', () => {
    it('should render string input correctly', () => {
        const container = document.createElement('div');
        renderPrimitive(mockView, 'title', 'test value', container, 0, 'title');
        
        const input = container.querySelector('.npe-primitive-input');
        expect(input).toBeTruthy();
        expect(input.textContent).toBe('test value');
    });
});
```

### Integration Testing

```typescript
// Test full NPE workflow
describe('NPE Integration', () => {
    it('should update file metadata when property changes', async () => {
        const file = await app.vault.create('test.md', '---\ntitle: old\n---\n');
        const view = new NestedPropertiesEditorView(leaf);
        
        // Simulate property change
        await updateProperties(app, file, 'title', 'new value', 'string');
        
        const cache = app.metadataCache.getFileCache(file);
        expect(cache?.frontmatter?.title).toBe('new value');
    });
});
```

### Manual Testing

Use the test vault for manual verification:

1. Open `test-vault/` in Obsidian
2. Enable the NPE plugin
3. Open the NPE view or use NPE code blocks
4. Test various property types and operations

## Future Enhancements

### Planned Features

1. **Virtual Scrolling**: For large property sets
2. **Property Templates**: Pre-defined property structures
3. **Bulk Operations**: Multi-property editing
4. **Import/Export**: Property set management
5. **Validation Rules**: Custom property validation
6. **Property History**: Track changes over time

### API Expansion

```typescript
// Future API extensions
interface NPEExtension {
    registerPropertyType(type: string, renderer: PropertyRenderer): void;
    registerValidator(type: string, validator: PropertyValidator): void;
    registerTransform(from: string, to: string, transform: TypeTransform): void;
}
```

## Contributing to NPE

### Development Setup

1. **Enable NPE Debugging**:
   ```typescript
   logger.enableDebugFor('npe');
   ```

2. **Use Test Files**:
   - `tests/test-npe-robustness.md` - Memory leak testing
   - Test vault files for various property types

3. **Follow Architecture**:
   - Add new renderers in `core/`
   - Create reusable elements in `elements/`
   - Add utilities in `helpers/`

### Code Guidelines

1. **Memory Management**: Always use `registerDomEvent` for event cleanup
2. **Type Safety**: Use proper TypeScript types for all functions
3. **Logging**: Add appropriate debug logging for troubleshooting
4. **Testing**: Include unit tests for new functionality
5. **Documentation**: Update this guide when adding features

The Nested Properties Editor represents a sophisticated approach to metadata management in Obsidian, providing users with an intuitive interface while maintaining the flexibility and power of YAML frontmatter.
