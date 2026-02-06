# De## 📖 Essential Documentation

**Start here for the big picture:**

- **[📋 ROADMAP](ROADMAP.md)** - Project status, version roadmap, completed work, and future plans
- **[✅ Todos](todos/)** - All project tasks organized by status (active/completed/planned)
  - [Active](todos/active/) - Current work (type safety, user documentation)
  - [Completed](todos/completed/) - Finished features (7 major features in v0.7.0)
  - [Planned](todos/planned/) - Future work (to be populated)
- **[⚠️ Known Issues](KNOWN-ISSUES.md)** - Known bugs, limitations, beta considerations, and troubleshooting

**Core System Documentation:**

- **[🏗️ Template System](template-system/)** - Complete template redesign documentation
- **[📚 Guides](guides/)** - Testing, debugging, and release workflows
- **[🏛️ Components](components/)** - Component-specific implementation docs
- **[💡 Core](core/)** - Architecture, API reference, development setup

These documents provide comprehensive context about where the project is now, where it's going, what limitations exist, and how all systems work together.ocumentation

Welcome to the developer documentation for the Obsidian ELN Plugin. This comprehensive guide covers everything you need to contribute to, extend, or understand the technical implementation of the plugin.

## � Essential Documentation

**Start here for the big picture:**

- **[📋 ROADMAP](ROADMAP.md)** - Project status, version roadmap, completed work, and future plans
- **[🔧 Type Safety Improvements](TYPE-SAFETY-IMPROVEMENTS.md)** - Detailed plan to improve code quality (10 prioritized items)
- **[⚠️ Known Issues](KNOWN-ISSUES.md)** - Known bugs, limitations, beta considerations, and troubleshooting

These three documents provide comprehensive context about where the project is now, where it's going, and what limitations exist.

## �🚀 Quick Start for Developers

### New to the Project?
1. **[Development Setup](core/development-setup.md)** - Set up your development environment
2. **[Architecture Overview](core/architecture.md)** - Understand the system design
3. **[Note Creation Architecture](note-creation-architecture/README.md)** - Master the core note creation system
4. **[API Reference](core/api-reference.md)** - Explore the TypeScript interfaces

### Contributing Workflow
1. Fork the repository and set up your development environment
2. Read the architecture documentation to understand the codebase
3. Make your changes following the coding standards
4. Test thoroughly using the provided test suite
5. Submit a pull request with clear documentation

## 📚 Core Documentation

### 🏗️ System Architecture

#### [Architecture Overview](core/architecture.md)
High-level system design and component organization:
- Overall architecture and design patterns
- Core systems (Notes, Templates, Data)
- UI component hierarchy and relationships
- Data flow and processing pipelines
- Extension points and customization options

#### [Note Creation Architecture](note-creation-architecture/README.md)
**⭐ Core System Documentation** - The heart of the ELN plugin:
- **[Overview](note-creation-architecture/README.md)** - Unified template-first architecture
- **[Data Flow](note-creation-architecture/data-flow.md)** - Single-source-of-truth data management
- **[Component Architecture](note-creation-architecture/component-architecture.md)** - Template-first component design
- **[Reactive Fields](note-creation-architecture/reactive-fields.md)** - Automatic field dependency evaluation
- **[Template Processing](note-creation-architecture/template-processing.md)** - Template loading and processing system
- **[API Reference](note-creation-architecture/api-reference.md)** - Complete component and API documentation
- **[Migration Guide](note-creation-architecture/migration-guide.md)** - Implementation guide for the unified architecture

#### [Development Setup](core/development-setup.md)
Complete development environment setup:
- Prerequisites and required tools
- Repository setup and build configuration
- Development workflow and debugging
- Testing setup and procedures
- Performance optimization and troubleshooting

### � Technical References

#### [API Reference](core/api-reference.md)
Comprehensive API documentation:
- TypeScript interfaces and types
- Core classes and methods
- Event system and handlers
- Plugin integration points
- Public APIs for extensions

#### [Testing Guide](core/testing.md)
Testing strategies and implementation:
- Unit testing approaches
- Integration testing workflows
- Template validation testing
- Performance and memory testing
- Debugging techniques and tools

### 🤝 Contribution Guidelines

#### [Contributing Guide](contributing/contributing.md)
How to contribute to the project:
- Code style and standards
- Pull request process
- Issue reporting guidelines
- Documentation standards
- Release and versioning process

## 🏛️ System Components

### Core Systems Documentation

#### Template System
- **[Template Manager](components/template-system/template-manager.md)** - Unified template processing system
- **[Template Evaluator](components/template-system/template-evaluator.md)** - Function descriptor evaluation
- **[Reactive Dependencies](components/template-system/reactive-system.md)** - Field dependency management

#### UI Components  
- **[Component Architecture](components/ui-components/component-architecture.md)** - UI component design patterns
- **[Universal Object Renderer](components/ui-components/universal-renderer.md)** - Main form rendering engine
- **[Input Manager](components/ui-components/input-manager.md)** - Form state management
- **[Modal System](components/ui-components/modal-system.md)** - Dialog and modal implementations
- **[Nested Properties Editor](components/ui-components/nested-properties-editor.md)** - Advanced frontmatter editing system
- **[Additional Components](components/ui-components/additional-components.md)** - Navbar, Footer, ImageViewer, and PeriodicTableView

#### Data Management
- **[Data Models](data-models.md)** - TypeScript type definitions
- **[Storage System](storage-system.md)** - Data persistence and retrieval
- **[Validation System](validation-system.md)** - Data integrity and validation

### Infrastructure Documentation

#### Build & Development
- **[Build System](infrastructure/build-system.md)** - esbuild configuration and scripts
- **[CSS Architecture](infrastructure/css-architecture.md)** - Modular CSS system
- **[Development Tools](infrastructure/development-tools.md)** - Debugging and profiling tools
- **[Logging System](infrastructure/LOGGING_SYSTEM.md)** - Component-based debug logging

#### Quality & Testing
- **[Code Quality](code-quality.md)** - Linting, formatting, and standards
- **[Performance](performance.md)** - Optimization strategies and monitoring
- **[Security](security.md)** - Security considerations and best practices

## 🧪 Advanced Topics

### Extension & Customization

#### Custom Components
- **[Creating Input Types](custom-input-types.md)** - Adding new field types
- **[Custom Validators](custom-validators.md)** - Implementing validation logic
- **[Template Functions](template-functions.md)** - Creating dynamic template functions

#### Plugin Integration
- **[Obsidian API Usage](obsidian-api.md)** - Working with Obsidian's APIs
- **[Plugin Compatibility](plugin-compatibility.md)** - Integration with other plugins
- **[Event System](event-system.md)** - Plugin event handling and communication

### Implementation Details

#### Legacy System Documentation
- **[Migration Strategy](migration-strategy.md)** - Transition from legacy components
- **[Compatibility Layer](compatibility-layer.md)** - Maintaining backward compatibility
- **[Deprecation Policy](deprecation-policy.md)** - Managing API changes

#### Historical Context
- **[Design Decisions](design-decisions.md)** - Architectural decision records
- **[Refactoring History](refactoring-history.md)** - Major code reorganizations
- **[Performance Evolution](performance-evolution.md)** - Performance improvement timeline

## 🔍 Development Resources

### Code Examples

#### Template Development
```typescript
// Example: Creating a custom template
export const customTemplate: MetaDataTemplate = {
  title: {
    inputType: "text",
    required: true,
    default: ""
  },
  // Additional fields...
};
```

#### Component Development
```typescript
// Example: Custom input component
export class CustomInput extends LabeledInputBase {
  constructor(/* parameters */) {
    super(/* base parameters */);
    // Custom implementation...
  }
}
```

### Debugging Resources

#### Common Issues
- **Template Loading Problems**: Check JSON syntax and file paths
- **Component Rendering Issues**: Verify DOM structure and CSS classes
- **Performance Bottlenecks**: Use profiling tools and optimization techniques
- **Memory Leaks**: Monitor memory usage and implement proper cleanup

#### Development Tools
- **Browser DevTools**: Console debugging and performance profiling
- **VS Code Integration**: TypeScript debugging and IntelliSense
- **Testing Framework**: Automated testing and validation
- **Build Analysis**: Bundle size and dependency analysis

## 📊 Project Metrics

### Code Quality Metrics
- **TypeScript Coverage**: 100% type safety
- **Test Coverage**: Comprehensive unit and integration tests
- **Documentation Coverage**: Complete API and user documentation
- **Performance Benchmarks**: Load time and memory usage metrics

### Development Statistics
- **Architecture Maturity**: Stable, well-defined component boundaries
- **API Stability**: Semantic versioning with backward compatibility
- **Community Health**: Active maintenance and responsive issue handling
- **Release Cadence**: Regular feature releases and bug fixes

## 🎯 Roadmap & Future Development

See **[ROADMAP.md](ROADMAP.md)** for comprehensive version roadmap, recently completed work, and future plans.

### Current Status (v0.7.0-beta.1)
- ✅ Template system overhaul complete (dynamic queries, reactive fields, function descriptors)
- ✅ UI components modernized (nested properties editor, universal renderer)
- ✅ Bug fixes and stability improvements
- ✅ Ready for first beta release

### Short-term (v0.7.1 - v0.7.2)
- Type safety improvements (eliminating ~150+ `Record<string, any>` instances)
- Performance optimization for large vaults
- Error message improvements

### Medium-term (v0.8.0 - v0.8.x)
- Unified template system (seamless editing/migration)
- Advanced query operators
- Public plugin API

### Long-term (v0.9.0+)
- Collaboration features
- Data analysis and visualization
- Mobile optimization
- Stable v1.0 release

See [ROADMAP.md](ROADMAP.md) for detailed breakdown and timeline.

## 📁 Documentation Structure

This `docs/developer/` directory is organized as follows:

### Root Level - Main Entry Points
- **README.md** (this file) - Main navigation and overview
- **ROADMAP.md** - Project roadmap and version planning
- **KNOWN-ISSUES.md** - Known limitations and troubleshooting
- **DOCUMENTATION_TODO.md** - Documentation improvement tracking
- **context-api-reference.md** - Template context API reference

### Organized Subfolders

#### **[todos/](todos/)** - Project Task Tracking
All project tasks organized by status with detailed implementation plans:
- `active/` - Current work (type-safety-improvements.md, user-documentation.md)
- `completed/` - Finished features (7 major features from v0.7.0)
- `planned/` - Future work (to be populated with upcoming features)

See [todos/README.md](todos/README.md) for complete index.

#### **[template-system/](template-system/)** - Template Redesign Documentation  
Comprehensive documentation for the template system architecture:
- Core design documents (syntax analysis, architecture diagrams)
- Implementation plans (query syntax, function descriptors)
- Examples and walkthroughs

See [template-system/README.md](template-system/README.md) for complete index.

#### **[guides/](guides/)** - Testing & Release Workflows
Practical guides for development workflows:
- Testing guides (manual, automated, quick commands)
- Release guides (beta checklist, release process)
- Debugging guides (log analysis, troubleshooting)

See [guides/README.md](guides/README.md) for complete index.

#### **[core/](core/)** - Core System Documentation
Foundational documentation:
- Architecture overview
- Development setup
- API reference
- Testing philosophy

#### **[components/](components/)** - Component Documentation
Component-specific implementation details:
- Template system components
- UI components
- Data management

#### **[infrastructure/](infrastructure/)** - Build & Development
Infrastructure documentation:
- Build system
- CSS architecture
- Logging system
- Development tools

#### **[note-creation-architecture/](note-creation-architecture/)** - Note Creation System
The heart of the ELN plugin:
- Unified template-first architecture
- Data flow and component design
- Reactive fields and processing

#### **[contributing/](contributing/)** - Contribution Guidelines
How to contribute to the project

#### **[archive/](archive/)** - Historical Documents
Historical documentation preserved for context:
- Phase completion reports (phase-1-1 through phase-2-2)
- Migration completion documents
- Debugging session notes from January 2025
- Pre-release improvement tracking

**Created**: January 2025 - These documents track the project's evolution but are no longer actively maintained.

### File Organization Principles

**Features and Improvements**: Tracked in `todos/` by status (active/completed/planned)
- Use descriptive names: `feature-name.md` or `improvement-name.md`
- Include status, priority, target version, and implementation details
- Link from ROADMAP.md for visibility

**System Documentation**: Organized by concern in subfolders
- Template system → `template-system/`
- Testing/release → `guides/`
- Architecture → `core/`, `components/`, `infrastructure/`

**No Duplicate Folders**: Features are NOT in separate `features/` or `proposals/` folders
- All tasks tracked in `todos/` (single source of truth)
- Design docs go in relevant system folder (e.g., template proposals in `template-system/`)


## 🎯 Roadmap & Future Development (Legacy Section - See ROADMAP.md)

**Note:** This section is maintained for backward compatibility. See **[ROADMAP.md](ROADMAP.md)** for the current, comprehensive roadmap.

### Planned Features
- **Enhanced Template System**: More flexible template configurations (see [ROADMAP.md](ROADMAP.md) v0.8.0)
- **Improved Performance**: Optimization for large vaults and complex templates (see [ROADMAP.md](ROADMAP.md) v0.7.2)
- **Extended API**: Public APIs for third-party extensions (see [ROADMAP.md](ROADMAP.md) v0.8.2)
- **Mobile Optimization**: Enhanced mobile user experience (see [ROADMAP.md](ROADMAP.md) v0.9.x+)

### Technical Debt
- **Type Safety**: ~150+ instances of `Record<string, any>` to be replaced with specific types (see [todos/active/type-safety-improvements.md](todos/active/type-safety-improvements.md))
- **Legacy Code Cleanup**: Continued modernization of older components (PathTemplateParser, etc.)
- **Test Coverage**: Expansion of automated testing
- **Documentation**: Continuous improvement of technical documentation
- **Performance**: Ongoing optimization and profiling (see [KNOWN-ISSUES.md](KNOWN-ISSUES.md) for current performance characteristics)

## 🔗 External Resources

### Learning Resources
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - TypeScript language reference
- **[Obsidian Plugin Development](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)** - Official Obsidian plugin guide
- **[esbuild Documentation](https://esbuild.github.io/)** - Build system documentation

### Community & Support
- **[GitHub Repository](https://github.com/fcskit/obsidian-eln-plugin)** - Source code and issue tracking
- **[Developer Discussions](https://github.com/fcskit/obsidian-eln-plugin/discussions)** - Technical discussions
- **[Code Review Guidelines](code-review.md)** - Standards for code review

---

**Ready to contribute?** Start with the [Development Setup](core/development-setup.md) guide, then explore the [Architecture Overview](core/architecture.md) to understand the system design.

1. **Clone the repository** and install dependencies:
   ```bash
   git clone [repository-url]
   cd obsidian-eln-plugin
   npm install
   ```

2. **Development workflow**:
   - Edit modular CSS in `src/styles/`
   - Run `npm run build-css` to bundle CSS
   - Use `npm run watch-css` for live development
   - Build plugin with `npm run build`

3. **Testing**: Use the test vault in `test-vault/` for development and testing

## 🏗️ Architecture Overview

The plugin follows a modular architecture with clear separation of concerns:

- **Core**: Main plugin logic and initialization
- **UI**: User interface components and modals
- **Data**: Note creation, templates, and metadata processing
- **Utils**: Utility functions and helpers
- **Styles**: Modular CSS system

## 📝 Code Style & Guidelines

- Use TypeScript for type safety
- Follow the existing code organization
- Write comprehensive documentation for new features
- Include examples in the `examples/` directory
- Test changes with the provided test vault

## 🔧 Key Technologies

- **TypeScript** - Type-safe JavaScript development
- **Obsidian API** - Core plugin functionality
- **CSS Modules** - Maintainable styling system
- **Node.js** - Build tooling and development workflow

## 🧪 Testing

- Use the `test-vault/` for manual testing
- Check the `tests/` directory for test files
- Validate changes across different note types and templates

## 📞 Contributing

1. **Fork the repository** and create a feature branch
2. **Make your changes** following the existing patterns
3. **Update documentation** if needed
4. **Test thoroughly** using the test vault
5. **Submit a pull request** with a clear description

## 📚 Related Documentation

- [User Documentation](../user/) - End-user guides and features
- [Examples](../examples/) - Code examples and templates
- [Main Project README](../../README.md) - Project overview

---

*For questions about development or contributions, please create an issue in the project repository.*
