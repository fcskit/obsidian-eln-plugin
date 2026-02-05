# Note Creation Architecture Overview

> **📋 Implementation Status (February 2026)**:  
> This architecture represents a **planned redesign** of the note creation system. The redesign was **postponed** to avoid delaying v0.7.0 while template syntax was still evolving. The current system works well for beta release, and this redesign is targeted for **v0.8.0 or v0.9.0** once the template system is fully stable.
>
> See **[../../todos/planned/note-creation-architecture-redesign.md](../../todos/planned/note-creation-architecture-redesign.md)** for implementation plan, timeline, and current status.

## Introduction

The Obsidian ELN Plugin's note creation system has been **designed** for a **unified template-first architecture** that would eliminate dual data storage, simplify data flow, and provide reactive field evaluation. This architecture would provide a dynamic form interface for creating structured scientific notes with complex validation and interdependent calculations.

**Current Status**: The existing note creation system works effectively for v0.7.0. This documentation describes the **target architecture** for future implementation.

## Key Architectural Principles

### 1. Single Source of Truth
- **InputManager** is the authoritative data store for ALL form operations
- Eliminates `this.object` redundant storage throughout the system
- All components query InputManager for current state

### 2. Template-First Component Design
- Components receive **ProcessedTemplateField** directly, not paths + TemplateManager
- No template querying, path navigation, or parameter extraction needed
- Self-contained components with their own complete template definitions

### 3. Unidirectional Data Flow
```
Template Processing → Component Initialization → InputManager → Reactive Updates → UI Updates
```

### 4. Reactive Field Automation
- **TemplateManager** processes templates and builds reactive field dependencies
- **InputManager** automatically evaluates dependent fields when dependencies change
- Efficient dependency lookup using ReactiveFieldMap and DependencyMap

## Core Components

| Component | Primary Responsibility | Key Changes |
|-----------|----------------------|-------------|
| **NewNote** | Note creation orchestration | Unchanged - still entry point |
| **TemplateManager** | Template processing & reactive field mapping | Enhanced - builds ProcessedTemplateField objects |
| **InputManager** | Single data source + reactive evaluation | Enhanced - comprehensive field operation API |
| **NewNoteModal** | UI coordination | Simplified - template-first component creation |
| **UniversalObjectRenderer** | Dynamic form rendering | Redesigned - no dual storage, template-first |
| **Field Components** | Input handling | Simplified - direct InputManager setValue calls |

## Detailed Documentation

### Core Architecture
- **[Data Flow Architecture](./data-flow.md)** - Complete data flow patterns, elimination of dual storage, field-specific updates
- **[Component Architecture](./component-architecture.md)** - Template-first design, ProcessedTemplateField interfaces, component creation patterns

### Template System
- **[Template Processing](./template-processing.md)** - Template loading, subclass application, function evaluation, reactive field mapping
- **[Reactive Fields](./reactive-fields.md)** - Detailed reactive evaluation system, dependency management, performance optimization

### Implementation
- **[Migration Guide](./migration-guide.md)** - Step-by-step guide for implementing the unified architecture
- **[API Reference](./api-reference.md)** - Enhanced InputManager API, component interfaces, integration patterns

## Benefits of the Unified Architecture

### Performance Benefits
- **50% fewer steps** for basic field updates
- **No object reconstruction** for any operation type  
- **Targeted UI updates** instead of full re-renders
- **Efficient dependency lookup** during reactive evaluation

### Maintainability Benefits
- **Clear separation of concerns** - Template processing, data management, UI rendering
- **Consistent patterns** for all input types (primitives, objects, lists)
- **Self-contained components** with complete template definitions
- **Easier debugging** with single data source and clear flow

### Developer Experience Benefits
- **Eliminated template queries** from component code
- **No path calculations** or parameter extraction needed
- **Type safety** with ProcessedTemplateField interfaces
- **Predictable behavior** across all field types

## Architecture Comparison

### Before: Complex Dual-Storage
```typescript
User Input → Component → this.object update → onChangeCallback → Parent object handling → InputManager sync → Reactive evaluation → Full UI re-render
```

### After: Streamlined Single-Source
```typescript
User Input → Component → InputManager.setValue → Automatic reactive updates → Targeted UI callbacks → Done
```

## Quick Start

For developers implementing or modifying the note creation system:

1. **Read [Data Flow Architecture](./data-flow.md)** to understand the core patterns
2. **Review [Component Architecture](./component-architecture.md)** for template-first design
3. **Study [Reactive Fields](./reactive-fields.md)** for field dependency handling
4. **Follow [Migration Guide](./migration-guide.md)** for implementation steps

## Current Status

- ✅ **Architecture Design**: Complete unified design documented
- ✅ **Component Interfaces**: ProcessedTemplateField and API specifications ready
- ✅ **Reactive System**: Detailed implementation with ReactiveFieldMap and DependencyMap
- 🔄 **Implementation**: Ready to begin coding the unified architecture
- ⏳ **Testing**: Integration and validation testing planned after implementation

## Related Documentation

- **[Original Workflow](../archive/note-creation-workflow-original.md)** - Complete original documentation (archived)
- **[Template Processing Details](../archive/template-processing-detailed-original.md)** - Original template processing (archived)
- **[Template First Architecture](../archive/template-first-architecture-original.md)** - Initial template-first design (archived)

---

*This documentation reflects the unified architecture design as of September 2024. For implementation status and updates, see the [Migration Guide](./migration-guide.md).*