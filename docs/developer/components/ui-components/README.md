# UI Components

This folder contains documentation for all user interface components and rendering systems in the Obsidian ELN Plugin.

## 📚 Documentation Files

### [Component Architecture](component-architecture.md)
Comprehensive UI component design patterns and architecture:
- Abstract base classes and component hierarchy
- Component factory pattern and lifecycle management
- CSS class conventions and styling architecture
- Extension patterns and custom component creation
- Testing frameworks and strategies

### [Universal Object Renderer](universal-renderer.md)
The main rendering engine for dynamic forms and templates:
- Template-driven UI generation
- Component mapping and instantiation
- Layout management and responsive design
- Event handling and user interactions
- Performance optimization techniques

### [Input Manager](input-manager.md)
Form state management and data binding system:
- Centralized form state management
- Field validation and error handling
- Data binding and synchronization
- Event system and change notifications
- Integration with reactive template system

### [Modal System](modal-system.md)
Dialog and modal management system:
- Base modal classes and lifecycle management
- Form modals and complex dialog interactions
- Modal manager and stacking
- Keyboard navigation and accessibility
- Custom modal implementations

### [Nested Properties Editor](nested-properties-editor.md)
Advanced frontmatter editing system with visual interface:
- Interactive YAML metadata editing
- Nested object and array support
- Real-time type detection and conversion
- In-place editing with property validation
- Memory-optimized component lifecycle management

### [Additional Components](additional-components.md)
Specialized UI components for enhanced functionality:
- Navbar: Dynamic navigation and note creation system
- Footer: Contextual metadata and version information display
- ImageViewer: Advanced image gallery with slideshow capabilities
- PeriodicTableView: Interactive periodic table with element data

## 🏗️ UI Architecture

```typescript
┌─────────────────────────────────────────────────────┐
│                UI Component System                  │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │Component        │  │    Universal Renderer       ││
│  │Architecture     │  │    • Template Processing    ││
│  │• Base Classes   │  │    • Component Mapping      ││
│  │• Factory Pattern│  │    • Layout Management      ││
│  │• Lifecycle Mgmt │  │    • Event Handling         ││
│  └─────────────────┘  └─────────────────────────────┘│
│           │                         │                │
│           └────────┬────────────────┘                │
│                    │                                 │
│  ┌─────────────────▼─────────────────────────────────┐│
│  │               Input Manager                      ││
│  │  • State Management  • Data Binding             ││
│  │  • Validation        • Change Notifications     ││
│  └─────────────────────────────────────────────────┘│
│                           │                          │
│  ┌─────────────────────────▼─────────────────────────┐│
│  │               Modal System                       ││
│  │  • Dialog Management  • Form Modals             ││
│  │  • Lifecycle Control  • Accessibility           ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## 🎯 Component Types

### Base Components
- `LabeledInputBase` - Abstract base for all input components
- `ComponentFactory` - Factory for creating component instances
- `BaseModal` - Foundation for all modal dialogs

### Input Components
- `LabeledTextInput` - Text input fields
- `LabeledNumberInput` - Numeric input fields
- `LabeledSelectInput` - Dropdown selections
- `LabeledCheckbox` - Boolean input fields
- `ObjectListInput` - Complex list management
- `QueryDropdown` - Dynamic search dropdowns

### Layout Components
- `UniversalObjectRenderer` - Main layout renderer
- `FormModal` - Modal form containers
- Container and wrapper components

## 🚀 Quick Start

1. **Understanding Components**: Start with [Component Architecture](component-architecture.md)
2. **Rendering System**: Learn about [Universal Renderer](universal-renderer.md)
3. **Form Management**: Explore [Input Manager](input-manager.md)
4. **Dialog Systems**: Review [Modal System](modal-system.md)

## 💡 Key Concepts

### Component Lifecycle
1. **Creation**: Factory instantiation with configuration
2. **Mounting**: DOM attachment and event binding
3. **Updates**: Data changes and re-rendering
4. **Cleanup**: Event unbinding and DOM removal

### Data Flow
```
Template → Universal Renderer → Components → Input Manager → State
    ↑                                                         ↓
    └─────────────── Reactive Updates ←─────────────────────────┘
```

### Extension Points
- Custom input components
- Template functions
- Validation rules
- Event handlers

## 🔗 Related Documentation

- [Template System](../template-system/) - Dynamic template processing
- [CSS Architecture](../../infrastructure/css-architecture.md) - Styling system
- [Development Tools](../../infrastructure/development-tools.md) - Debugging tools

---

*The UI component system provides a flexible, extensible foundation for user interfaces in the Obsidian ELN Plugin.*
