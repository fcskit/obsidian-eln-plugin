# System Components

This folder contains detailed documentation for all major system components of the Obsidian ELN Plugin.

## 📁 Component Categories

### [Template System](template-system/)
Core template processing and evaluation components:
- [Template Manager](template-system/template-manager.md) - Unified template processing
- [Template Evaluator](template-system/template-evaluator.md) - Function descriptor evaluation
- [Reactive System](template-system/reactive-system.md) - Field dependency management

### [UI Components](ui-components/)
User interface components and rendering systems:
- [Component Architecture](ui-components/component-architecture.md) - UI design patterns
- [Universal Renderer](ui-components/universal-renderer.md) - Main rendering engine
- [Input Manager](ui-components/input-manager.md) - Form state management
- [Modal System](ui-components/modal-system.md) - Dialog and modal implementations

### [Data Management](data-management/)
Data persistence, validation, and management systems:
- *Documentation files will be added as the system evolves*

## 🏗️ Architecture Overview

The plugin follows a modular component-based architecture:

```
┌─────────────────────────────────────────────────────┐
│                Plugin Architecture                  │
├─────────────────────────────────────────────────────┤
│  Template System    │    UI Components              │
│  ┌─────────────────┐│  ┌─────────────────────────────┐│
│  │ Template Manager││  │ Component Architecture      ││
│  │ Template Eval.  ││  │ Universal Renderer          ││
│  │ Reactive System ││  │ Input Manager               ││
│  └─────────────────┘│  │ Modal System                ││
│                     │  └─────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│              Data Management System                 │
│  ┌─────────────────────────────────────────────────┐│
│  │ Data Models │ Storage │ Validation │ Migration  ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

1. **Template System**: Start with [Template Manager](template-system/template-manager.md)
2. **UI Development**: Begin with [Component Architecture](ui-components/component-architecture.md)
3. **Form Handling**: Review [Input Manager](ui-components/input-manager.md)

## 🔗 Related Documentation

- [Core Documentation](../core/)
- [Infrastructure](../infrastructure/)
- [Contributing Guidelines](../contributing/)

---

*This documentation covers the major system components of the Obsidian ELN Plugin.*
