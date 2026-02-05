# Template System

The template system is the core of the Obsidian ELN Plugin, providing dynamic note generation, field evaluation, and reactive data binding.

## 📚 Documentation Files

### [Template Manager](template-manager.md)
The central orchestrator for template processing:
- Template loading and caching
- Template compilation and validation
- Integration with note creation workflow
- Template inheritance and composition

### [Template Evaluator](template-evaluator.md)
Advanced function descriptor evaluation system:
- Function descriptor syntax and parsing
- Dynamic field evaluation and computation
- Context-aware template processing
- Error handling and validation

### [Reactive System](reactive-system.md)
Field dependency management and reactive updates:
- Dependency graph construction and analysis
- Real-time field updates and cascading changes
- Circular dependency detection and resolution
- Performance optimization strategies

## 🏗️ System Architecture

```typescript
┌─────────────────────────────────────────────────────┐
│                Template System                      │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │ Template Manager│  │    Template Evaluator       ││
│  │ • Loading       │  │    • Function Descriptors   ││
│  │ • Caching       │  │    • Dynamic Evaluation     ││
│  │ • Validation    │  │    • Context Processing     ││
│  └─────────────────┘  └─────────────────────────────┘│
│           │                         │                │
│           └────────┬────────────────┘                │
│                    │                                 │
│  ┌─────────────────▼─────────────────────────────────┐│
│  │             Reactive System                      ││
│  │  • Dependency Graph  • Field Updates            ││
│  │  • Change Detection  • Performance Optimization ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

1. **Understanding Templates**: Start with [Template Manager](template-manager.md)
2. **Dynamic Fields**: Learn about [Template Evaluator](template-evaluator.md)
3. **Reactive Updates**: Explore [Reactive System](reactive-system.md)

## 💡 Key Concepts

### Template Processing Flow
1. **Load**: Template Manager loads and validates templates
2. **Evaluate**: Template Evaluator processes function descriptors
3. **React**: Reactive System manages field dependencies and updates

### Function Descriptors
Dynamic field definitions that enable computed fields, validations, and reactive behaviors:

```typescript
{
  "molecular_weight": {
    "inputType": "number",
    "functionDescriptor": {
      "function": "calculateMolecularWeight",
      "dependsOn": ["molecular_formula"]
    }
  }
}
```

### Reactive Dependencies
Automatic field updates based on dependency relationships:
- Field A changes → triggers evaluation of fields that depend on A
- Circular dependency detection prevents infinite loops
- Optimized update batching for performance

## 🔗 Related Documentation

- [Universal Renderer](../ui-components/universal-renderer.md) - Template rendering
- [Input Manager](../ui-components/input-manager.md) - Form data management
- [Core Architecture](../../core/architecture.md) - Overall system design

---

*The template system enables dynamic, reactive note creation in the Obsidian ELN Plugin.*
