# Architecture Overview

This document provides a high-level overview of the Obsidian ELN Plugin architecture, including core components, data flow, and design patterns.

## 🏗️ High-Level Architecture

The plugin follows a modular, component-based architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Obsidian API Layer                       │
├─────────────────────────────────────────────────────────────┤
│                     Plugin Main                            │
│                   (main.ts)                                │
├─────────────────────────────────────────────────────────────┤
│  Commands  │   Settings   │   Events    │    Search        │
├─────────────────────────────────────────────────────────────┤
│                    Core Systems                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   Notes     │ │  Templates  │ │        Data             ││
│  │   System    │ │   System    │ │       System            ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                   UI Components                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   Modals    │ │  Inputs     │ │      Renderers          ││
│  │             │ │             │ │                         ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                  Utility Layer                              │
│                (Types, Utils, Helpers)                     │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure

### Source Code Organization

```
src/
├── main.ts                 # Plugin entry point
├── commands/               # Command implementations
│   ├── CreateNoteCommand.ts
│   └── ...
├── core/                   # Core business logic
│   ├── notes/             # Note creation and management
│   ├── templates/         # Template processing
│   └── data/              # Data structures and storage
├── events/                # Workspace Event handling
├── search/                # Search functionality
├── settings/              # Plugin settings
├── styles/                # Modular CSS system
├── types/                 # TypeScript type definitions
├── ui/                    # User interface components
│   └── modals/           # Modal dialogs and forms
│       ├── components/   # UI components
│       └── utils/        # UI utilities
└── utils/                 # General utilities
```

## 🔄 Core Systems

### 1. Notes System (`src/core/notes/`)

Handles the creation, modification, and management of ELN notes.

**Key Components:**
- **NoteCreator**: Orchestrates note creation process
- **MetadataPostProcessor**: Processes metadata after template evaluation
- **NewNote**: Main note creation logic

**Responsibilities:**
- Template instantiation
- Metadata validation and processing
- File creation and organization
- Integration with Obsidian's file system

### 2. Templates System (`src/core/templates/`)

Manages template definitions, processing, and evaluation.

**Key Components:**
- **TemplateManager**: Unified template management
- **TemplateEvaluator**: Evaluates dynamic template functions
- **Template types**: TypeScript definitions for template structure

**Responsibilities:**
- Template loading and caching
- Function descriptor evaluation
- Reactive field processing
- Template validation

### 3. Data System (`src/core/data/`)

Handles data structures, storage, and retrieval.

**Key Components:**
- **Data models**: Type-safe data structures
- **Storage adapters**: Interface with Obsidian's storage
- **Validation**: Data integrity and validation

## 🎨 UI Architecture

### Component Hierarchy

```
Modal (NewNoteModal)
├── InputManager (state management)
├── TemplateManager (template processing)
└── UI Components
    ├── UniversalObjectRenderer (main form renderer)
    ├── LabeledInputBase (abstract base)
    ├── LabeledPrimitiveInput (text, number, etc.)
    ├── LabeledDropdown (selection)
    ├── QueryDropdown (advanced selection)
    └── SubclassDropdown (specialized)
```

### Key Design Patterns

#### 1. Component-Based Architecture
- Self-contained UI components
- Clear interfaces and dependencies
- Reusable across different contexts

#### 2. Observer Pattern
- Event-driven updates
- Reactive field dependencies
- State synchronization

#### 3. Strategy Pattern
- Pluggable input types
- Template processing strategies
- Validation approaches

## 🔀 Data Flow

### Note Creation Flow

```
1. User Action (Command/Button)
   ↓
2. Modal Creation
   ↓
3. Template Loading (TemplateManager)
   ↓
4. Form Rendering (UniversalObjectRenderer)
   ↓
5. User Input (Various Input Components)
   ↓
6. Validation & Processing (InputManager)
   ↓
7. Note Creation (NoteCreator)
   ↓
8. File System Integration (Obsidian API)
```

### Template Processing Flow

```
1. Template Request
   ↓
2. Raw Template Loading
   ↓
3. Function Evaluation (TemplateEvaluator)
   ↓
4. Reactive Dependencies Resolution
   ↓
5. Metadata Processing
   ↓
6. Processed Template Output
```

## 🧩 Key Components Deep Dive

### TemplateManager
**Location**: `src/core/templates/TemplateManager.ts`

Unified interface for all template operations:
- Loads raw templates from configuration
- Processes function descriptors
- Handles reactive dependencies
- Manages template history and undo

**Key Methods:**
```typescript
loadRawTemplate(noteType: string): MetaDataTemplate | null
processTemplate(noteType: string): MetaDataTemplateProcessed | null
applySubclassTemplate(noteType: string, subclass: string): boolean
```

### UniversalObjectRenderer
**Location**: `src/ui/modals/components/UniversalObjectRenderer.ts`

Main form rendering engine:
- Handles nested object structures
- Manages field dependencies
- Coordinates input component lifecycle
- Provides validation feedback

### InputManager
**Location**: `src/ui/modals/utils/InputManager.ts`

Centralized state management for form inputs:
- Tracks all form field values
- Manages field ordering and positioning
- Handles reactive field updates
- Provides validation coordination

## 🔧 Extension Points

### Adding New Input Types

1. **Create Component**: Extend `LabeledInputBase`
2. **Register Type**: Add to input type registry
3. **Update Types**: Add TypeScript definitions
4. **Documentation**: Add usage examples

### Custom Template Functions

1. **Function Definition**: Create function descriptor
2. **Registration**: Add to function registry
3. **Testing**: Validate with template examples
4. **Documentation**: Document parameters and usage

### Custom Validation

1. **Validator Creation**: Implement validation interface
2. **Registration**: Add to validation system
3. **Integration**: Connect with input components
4. **Error Handling**: Provide user feedback

## 🧪 Testing Architecture

### Test Organization
```
tests/
├── unit/                  # Unit tests for individual components
├── integration/           # Integration tests for workflows
├── template-examples/     # Template validation tests
└── memory/               # Memory leak and performance tests
```

### Testing Strategies
- **Unit Testing**: Individual component testing
- **Integration Testing**: Full workflow validation
- **Template Testing**: Template processing validation
- **Performance Testing**: Memory and speed optimization

## 📊 Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Templates loaded on demand
- **Caching**: Processed templates cached
- **Debouncing**: Input validation debounced
- **Memory Management**: Proper cleanup and disposal

### Monitoring
- **Performance Metrics**: Load times and memory usage
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: Usage patterns (privacy-respecting)

## 🔒 Security & Privacy

### Data Handling
- **Local Storage**: All data stored locally in vault
- **No External Calls**: No data sent to external servers
- **Encryption**: Compatible with Obsidian's encryption
- **Access Control**: Respects Obsidian's permission model

## 🚀 Future Architecture

### Planned Enhancements
- **Plugin API**: Public API for third-party extensions
- **Micro-frontends**: Pluggable UI components
- **Worker Threads**: Background processing for large operations
- **WebAssembly**: Performance-critical operations

### Scalability Considerations
- **Large Vaults**: Optimizations for thousands of notes
- **Complex Templates**: Support for more sophisticated templates
- **Multi-user**: Preparation for collaborative features

## 📖 Related Documentation

- [Development Setup](development-setup.md) - Setting up your development environment
- [API Reference](api-reference.md) - Detailed API documentation
- [Testing Guide](testing.md) - Testing strategies and tools
- [Contributing Guide](contributing.md) - How to contribute to the project
