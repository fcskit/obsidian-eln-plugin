# Template System Documentation

This folder contains comprehensive documentation for the template system redesign - one of the core architectural improvements in the Obsidian ELN Plugin.

## Overview

The template system is the heart of the ELN plugin, enabling dynamic note creation with metadata templates, markdown templates, and path templates. This documentation covers the redesign efforts to create a unified, maintainable, and powerful template system.

## Documentation Index

### Core Design Documents

#### [template-redesign-index.md](template-redesign-index.md)
**Start here** - Master index for the entire template redesign project. Provides navigation to all related documents with brief summaries of each.

#### [template-syntax-analysis.md](template-syntax-analysis.md)
Detailed analysis of template syntax design decisions, including:
- PathTemplate structure and consistency
- Function descriptor format (FunctionDescriptor vs string-based)
- Template literal syntax in functions
- Subclass template structure
- Field configuration patterns

Includes recommendations and examples for improving consistency.

#### [template-architecture-diagram.md](template-architecture-diagram.md)
Visual representation of the template system architecture:
- Data flow through the system
- Component relationships
- Processing pipeline
- Integration points

Essential for understanding how all pieces fit together.

#### [template-improvements-summary.md](template-improvements-summary.md)
Quick reference guide summarizing:
- What changed in the redesign
- Benefits of the new approach
- Migration path from old to new
- Key differences at a glance

### Specific Feature Documentation

#### [context-api-reference.md](context-api-reference.md)
**Complete reference for template function context**

Comprehensive documentation of all context objects available in template functions:
- Settings context (read-only plugin settings)
- User input context (form data)
- Note metadata context (frontmatter)
- Date context (current date/time)
- File system context (paths, folders)
- Vault context (vault operations)
- Plugin context (plugin instance)
- Subclasses context (template hierarchy)

Essential for writing template functions safely and effectively.

#### [function-syntax-clarification.md](function-syntax-clarification.md)
Deep dive into template function syntax:
- FunctionDescriptor structure
- Function evaluation context
- Safe vs unsafe context access
- Parameter passing and binding
- Examples of common function patterns

#### [query-mapping-syntax-proposal.md](query-mapping-syntax-proposal.md)
Proposal for enhanced query field mapping:
- Current limitations
- Proposed syntax improvements
- Use cases and examples
- Implementation considerations

#### [implementation-plan-new-query-syntax.md](implementation-plan-new-query-syntax.md)
Detailed implementation roadmap for query syntax improvements:
- Phase-by-phase approach
- Code changes required
- Testing strategy
- Backward compatibility

#### [sample-filename-template-explained.md](sample-filename-template-explained.md)
Walkthrough of path template examples:
- Filename generation patterns
- Folder path construction
- Dynamic path evaluation
- Context variable usage

### Design Discussions

#### [template-concerns-response.md](template-concerns-response.md)
Addresses specific concerns and questions about the template redesign:
- Why certain design decisions were made
- Trade-offs considered
- Alternative approaches evaluated
- Future extensibility

## Key Concepts

### Unified Template System

The redesign aims to unify three types of templates into a cohesive system:

1. **Metadata Templates** - Define frontmatter structure and field types
2. **Markdown Templates** - Define note body content and layout
3. **Path Templates** - Define filename and folder path generation

**Goal**: Seamless editing, migration, and validation across all template types.

### Function Descriptors

Templates use `FunctionDescriptor` objects instead of raw strings:

```typescript
{
  func: "(data) => data.field.toUpperCase()",
  params: ["data"],
  display: "uppercase transformation"
}
```

**Benefits**: Type safety, better error messages, IDE support, clearer intent.

### Reactive Dependencies

Fields can depend on other fields through functions:

```typescript
{
  fieldA: { inputType: "text" },
  fieldB: {
    inputType: "computed",
    func: { func: "(data) => data.fieldA + '-suffix'", params: ["data"] }
  }
}
```

**Benefits**: Automatic updates, reduced duplication, consistent derived values.

### Subclass Templates

Templates can be organized hierarchically with subclasses:

```typescript
{
  id: "sample",
  label: "Sample",
  metadata: { /* base fields */ },
  subclasses: [
    {
      id: "liquid",
      label: "Liquid Sample",
      add: [{ fullKey: "physical.viscosity", config: { /* ... */ } }]
    }
  ]
}
```

**Benefits**: Code reuse, consistent base structure, easy specialization.

## Template System Architecture

```
User Input (NewNoteModal)
    ↓
InputManager (form state)
    ↓
TemplateEvaluator (function execution)
    ↓
PathEvaluator (filename/folder)
    ↓
NoteCreator (file creation)
```

See [template-architecture-diagram.md](template-architecture-diagram.md) for detailed diagrams.

## Cross-References

### Related Documentation

- **[../note-creation-architecture/](../note-creation-architecture/)** - Note creation system that uses templates
- **[../core/api-reference.md](../core/api-reference.md)** - TypeScript interfaces and types
- **[../components/template-system/](../components/template-system/)** - Component-level implementation docs

### Implementation Status

- **Completed**: Most template system redesign work (see [../todos/completed/](../todos/completed/))
- **Active**: Type safety improvements (see [../todos/active/type-safety-improvements.md](../todos/active/type-safety-improvements.md))
- **Planned**: Unified template editor UI (see [../ROADMAP.md](../ROADMAP.md) v0.8.0)

### User-Facing Documentation

The template system enables user-facing features documented in:
- `docs/user/templates/` - Template creation and editing guides (to be created)
- `docs/user/features/` - Feature documentation for template capabilities (to be created)

## Development Workflow

### Understanding the System
1. Start with [template-redesign-index.md](template-redesign-index.md)
2. Read [template-architecture-diagram.md](template-architecture-diagram.md)
3. Review [template-syntax-analysis.md](template-syntax-analysis.md)

### Making Changes
1. Review relevant documents for context
2. Consider impact on all three template types
3. Update affected documentation
4. Add tests for new behavior
5. Update examples in user docs

### Adding Features
1. Check if feature is in [query-mapping-syntax-proposal.md](query-mapping-syntax-proposal.md) or similar
2. Create implementation plan (follow [implementation-plan-new-query-syntax.md](implementation-plan-new-query-syntax.md) pattern)
3. Update architecture diagrams
4. Implement with tests
5. Document for users

## Future Directions

See [../ROADMAP.md](../ROADMAP.md) for planned template system improvements:

- **v0.8.0**: Unified template editor UI for seamless editing
- **v0.8.1**: Advanced query operators and filtering
- **v0.8.2**: Template validation and migration tools
- **v0.9.0+**: Template sharing and collaboration

## Quick Links

**Essential Reading**:
- [Template Redesign Index](template-redesign-index.md) - Start here
- [Architecture Diagram](template-architecture-diagram.md) - Visual overview
- [Syntax Analysis](template-syntax-analysis.md) - Design decisions

**Implementation Details**:
- [Function Syntax](function-syntax-clarification.md) - How functions work
- [Query Syntax Proposal](query-mapping-syntax-proposal.md) - Future improvements
- [Implementation Plan](implementation-plan-new-query-syntax.md) - Roadmap for queries

**Examples**:
- [Sample Filename Template](sample-filename-template-explained.md) - Path template walkthrough

---

**Last Updated**: February 2, 2026  
**Template System Status**: Stable, actively maintained  
**Documentation Coverage**: Comprehensive design docs, implementation details needed
