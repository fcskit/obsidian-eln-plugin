# Obsidian ELN Plugin - Development Roadmap

> **Last Updated:** February 2, 2026  
> **Current Version:** 0.7.0-beta.1 (Ready for Release)

This document serves as the central roadmap for the Obsidian ELN Plugin development. It tracks completed work, current priorities, and future plans.

## 📚 Quick Navigation

**Essential Documentation:**
- **[todos/](todos/)** - All project tasks organized by status (active/completed/planned)
- **[template-system/](template-system/)** - Complete template system redesign documentation
- **[guides/](guides/)** - Testing, debugging, and release guides
- **[KNOWN-ISSUES.md](KNOWN-ISSUES.md)** - Known bugs, limitations, and troubleshooting

**Current Priorities:**
- [Type Safety Improvements](todos/active/type-safety-improvements.md) - Eliminate `Record<string, any>` (v0.7.1)
- [User Documentation](todos/active/user-documentation.md) - Document new features (v0.7.1-0.7.2)

**Completed Work:**
- [Completed Features](todos/completed/) - 7 major features implemented in v0.7.0

---

## 📍 Current Status: Ready for Beta Release

✅ **All TypeScript errors fixed** - Build passes with 0 errors  
✅ **Template system modernized** - Phase 1 & 2 complete  
✅ **Core features implemented** - Note creation, templates, reactive fields  
🎯 **Next:** Release v0.7.0-beta.1 and gather user feedback

---

## 🎉 Recently Completed (v0.7.0-alpha → beta.1)

### Major Features & Improvements

#### Template System Overhaul (Phases 1 & 2)
- ✅ **New Function Descriptor Format** - Migrated from `{type, value}` to `{type, context, expression}`
- ✅ **PathTemplate Unification** - Unified fileName and folderPath templates with segment-based structure
- ✅ **FunctionEvaluator Refactoring** - New evaluator with proper context isolation
- ✅ **PathEvaluator Implementation** - Handles all path template evaluation
- ✅ **16 Template Migrations** - Updated all metadata and markdown templates to new syntax

#### Dynamic Features
- ✅ **Postprocessor Fields** - Fields that derive values from evaluated paths (e.g., `sample.name` from fileName)
- ✅ **Dynamic Subfolder Creation** - `createSubfolder` array for automatic folder generation
- ✅ **Counter Inheritance** - Counters can inherit values from folderPath evaluation
- ✅ **{{folderPath}} Variable** - Available in markdown templates for dynamic content
- ✅ **Reactive Field Dependencies** - Fields automatically update when dependencies change

#### Bug Fixes & Refinements
- ✅ **Object List Storage** - Fixed array storage bug for nested object lists
- ✅ **EditableObject Type Switching** - Fixed type switch behavior after field renames
- ✅ **Daily Note Formatting** - Zero-padded months, simplified fileName template
- ✅ **Settings Tab Updates** - Fixed `titleTemplate`/`folderTemplate` → `fileName`/`folderPath` naming
- ✅ **Type Definition Updates** - Support for new FunctionDescriptor in MetaDataTemplateTransform

#### Code Quality
- ✅ **TypeScript Error Resolution** - Fixed 13 errors across 6 files (sample.ts, ENLSettingTab.ts, etc.)
- ✅ **Unified Template Experiments** - Created experimental unified note template structure
- ✅ **Logger System** - Centralized logging with component-based filtering
- ✅ **Copilot Instructions** - Comprehensive development guidelines for AI assistance

**Completion Date:** February 2, 2026

---

## 🚀 Current Sprint: Beta Release Preparation

### High Priority (Pre-Release)

#### 1. Documentation Organization 🔄 IN PROGRESS
- Create comprehensive ROADMAP.md (this file)
- Create TYPE-SAFETY-IMPROVEMENTS.md with detailed plan
- Create KNOWN-ISSUES.md for transparency
- Archive completed phase reports and outdated debugging docs
- Update beta release checklist and guide

**Status:** In progress  
**Target:** Complete before beta release

#### 2. Final Testing & Validation
- [ ] Test all note types systematically
- [ ] Verify template function evaluation
- [ ] Test reactive field updates
- [ ] Validate subfolder creation
- [ ] Check counter inheritance behavior
- [ ] Test postprocessor fields

**Status:** Not started  
**Target:** Before beta release

#### 3. Release v0.7.0-beta.1
- [ ] Update version numbers
- [ ] Create GitHub release with changelog
- [ ] Update README.md with beta status
- [ ] Announce to beta testers

**Status:** Ready to execute  
**Target:** This week

---

## 📋 Short-Term Goals (v0.7.x - Post-Beta)

### Type Safety Improvements
**Priority:** High | **Effort:** Medium | **Risk:** Low

**📄 Detailed Plan:** [todos/active/type-safety-improvements.md](todos/active/type-safety-improvements.md)

Comprehensive type safety refactoring to eliminate ~150+ `Record<string, any>` instances and improve code quality.

**Key Items:**
1. Replace generic Records with `FormData` type (userData, userInputs)
2. Create `MetadataStructure` type for frontmatter
3. Create `TemplateFieldConfig` type for template fields
4. Improve subclass template type definitions
5. Type context provider methods
6. Fix remaining `any` types in PathTemplateParser
7. Create `SettingsItem` types for ENLSettingTab
8. Type nested value manipulation utilities
9. Review experimental unified template types
10. Enable stricter ESLint rules

**Dependencies:** None - can start immediately after beta release  
**Estimated Effort:** 2-3 weeks  
**Target:** v0.7.1

### User Documentation for New Features
**Priority:** High | **Effort:** Medium | **Risk:** Low

**📄 Detailed Plan:** [todos/active/user-documentation.md](todos/active/user-documentation.md)

Create comprehensive user-facing documentation for all features implemented in v0.7.0:
- Counter inheritance
- Postprocessor fields
- Dynamic query fields
- File picker markdown links
- Filesystem context enhancement
- Dynamic structure mapping

**Target:** v0.7.1-0.7.2

### User Experience Enhancements
**Priority:** Medium | **Effort:** Low | **Risk:** Low

- [ ] Improve error messages for template syntax errors
- [ ] Add loading indicators for slow operations
- [ ] Better validation feedback in forms
- [ ] Improved dropdown search/filtering
- [ ] Keyboard shortcuts for common actions

**Target:** v0.7.2-0.7.3

### Template Array Operations
**Priority:** Medium | **Effort:** Medium | **Risk:** Low

**📄 Detailed Plan:** [todos/planned/template-array-operations.md](todos/planned/template-array-operations.md)

Add support for array operations in template fields (`.map()`, `.filter()`, `.join()`) to enable data transformations without Base query workarounds.

**Example:**
```
{{@join(@map(sample.preparation, 'link'), ', ')}}
```

**Benefits:**
- Simplified template syntax
- Better integration with template system
- More intuitive for users

**Target:** v0.7.2-v0.8.0

---

## 🎯 Medium-Term Goals (v0.8.x)

### Unified Template System (v0.8.0)
**Priority:** High | **Effort:** High | **Risk:** Medium

**📄 Design Documentation:** [template-system/](template-system/)  
**📋 Related**: [template-system/template-redesign-index.md](template-system/template-redesign-index.md)

Implement the unified template structure explored in `src/data/templates/notes/`:

```typescript
interface NoteTemplate {
  settings: {
    class: string;
    fileName: PathTemplate;
    folderPath: PathTemplate;
    subclasses?: { /* ... */ };
  };
  metadata: MetaDataTemplate;
  markdown: string;
}
```

### Cross-File NPE Display (v0.8.0)
**Priority:** Medium | **Effort:** High | **Risk:** Medium

**📄 Detailed Plan:** [todos/planned/cross-file-npe-display.md](todos/planned/cross-file-npe-display.md)

Enable NPE code blocks to display metadata from other files, allowing embedded property views from related notes.

**Example:**
```markdown
```eln-properties
file: [[Process 001]]
key: process
actionButtons: hidden
```
```

**Benefits:**
- Display related note properties inline
- Maintain context while viewing multiple notes
- Edit cross-referenced metadata directly

**Target:** v0.8.0

**Benefits:**
- Single file per note type (no more splitting metadata/markdown)
- Easier template management and distribution
- Better subclass definition structure
- Simplified template loading

**Challenges:**
- Migration path for existing templates
- Backward compatibility
- User custom template updates

**Target:** v0.8.0 (2-3 months)

### Note Creation Architecture Redesign (v0.8.0 or v0.9.0)
**Priority:** High | **Effort:** Very High | **Risk:** High

**📄 Detailed Plan:** [todos/planned/note-creation-architecture-redesign.md](todos/planned/note-creation-architecture-redesign.md)  
**📋 Design Docs:** [note-creation-architecture/](note-creation-architecture/)

Complete architectural redesign of the note creation system for better performance and maintainability:

**Key Changes:**
- Single source of truth (InputManager is authoritative data store)
- Template-first component design (eliminate template queries)
- Unidirectional data flow
- Reactive field automation
- Targeted UI updates (no full re-renders)

**Benefits:**
- 50% faster field updates
- No object reconstruction
- Clearer separation of concerns
- Easier debugging and maintenance

**Why Postponed:**
- Template syntax still evolving (v0.7.0-v0.8.1)
- Would have delayed beta release significantly
- Current system works well enough for v0.7.x
- Lower risk once template system stabilizes

**Timing:**
- **Earliest start:** After v0.8.0 unified templates complete
- **Target:** v0.8.0 (optimistic) or v0.9.0 (realistic)
- **Duration:** 4-6 weeks implementation + 1-2 weeks stabilization

**Dependencies:**
- ✅ Template syntax stabilization (v0.7.0) - COMPLETE
- 🔄 Unified template system (v0.8.0) - IN PROGRESS
- ⏳ Query syntax improvements (v0.8.1) - PLANNED

**Target:** v0.8.0 or v0.9.0 (4-6 months)

### Advanced Query System (v0.8.1)
**Priority:** Medium | **Effort:** Medium | **Risk:** Medium

- [ ] Complex query operators (AND, OR, NOT combinations)
- [ ] Aggregation queries (count, sum, average)
- [ ] Query result caching
- [ ] Query performance optimization
- [ ] Saved query templates

**Target:** v0.8.1

### Plugin API for Extensions (v0.8.2)
**Priority:** Medium | **Effort:** High | **Risk:** Medium

- [ ] Public API for other plugins to integrate
- [ ] Template extension system
- [ ] Custom field type registration
- [ ] Event hooks for note creation
- [ ] Documentation for plugin developers

**Target:** v0.8.2

---

## 🌟 Long-Term Vision (v0.9.x - v1.0)

### Collaboration Features (v0.9.0)
**Priority:** Medium | **Effort:** Very High | **Risk:** High

- [ ] Multi-user workflows
- [ ] Review/approval processes
- [ ] Version control integration
- [ ] Shared template repositories
- [ ] Team settings synchronization

**Target:** v0.9.0 (6+ months)

### Data Analysis & Visualization (v0.9.x)
**Priority:** Medium | **Effort:** High | **Risk:** Medium

- [ ] Built-in charts and graphs
- [ ] Statistical analysis tools
- [ ] Export to analysis software (R, Python, Excel)
- [ ] Automated report generation
- [ ] Data dashboards

**Target:** v0.9.x

### Mobile Support (v0.9.x - v1.0)
**Priority:** Low | **Effort:** Very High | **Risk:** High

- [ ] Mobile-optimized UI components
- [ ] Touch-friendly input controls
- [ ] Offline-first data sync
- [ ] Camera integration for images
- [ ] Mobile-specific templates

**Target:** v1.0

### v1.0 Stable Release
**Priority:** High | **Effort:** Medium | **Risk:** Low

- [ ] Complete documentation
- [ ] Comprehensive test coverage
- [ ] Performance benchmarks
- [ ] Security audit
- [ ] Migration guides from all previous versions
- [ ] User testimonials and case studies

**Target:** v1.0 (12-18 months)

---

## ✅ Completed Features & Improvements

The following features have been fully implemented and are available in v0.7.0-beta.1. Detailed implementation documentation is available in [todos/completed/](todos/completed/).

### v0.7.0 Completed Features

- **[Counter Inheritance](todos/completed/counter-inheritance-feature.md)** - Automatic counter incrementation across note hierarchies
- **[Postprocessor Fields](todos/completed/postprocessor-fields.md)** - Field transformations after user input evaluation
- **[Dynamic Query Field Updates](todos/completed/dynamic-query-field-updates.md)** - Reactive fields that update based on vault queries
- **[Dynamic Structure Mapping](todos/completed/dynamic-structure-mapping.md)** - Advanced template structure manipulation
- **[Field Overwrite Fix](todos/completed/field-overwrite-fix.md)** - Prevention of data loss in specific scenarios
- **[File Picker Markdown Links](todos/completed/filepicker-markdown-links.md)** - Enhanced file linking in templates
- **[Filesystem Context Enhancement](todos/completed/filesystem-context-enhancement.md)** - Advanced context variables for templates

**User Documentation Status:** Planned for v0.7.1-0.7.2 (see [todos/active/user-documentation.md](todos/active/user-documentation.md))

---

## 📊 Technical Debt & Maintenance

### Ongoing Tasks

#### Code Quality
- Regular TypeScript strict mode improvements
- ESLint rule compliance
- Code review and refactoring
- Dependency updates
- Security patches

#### Documentation
- Keep developer docs current
- Update user guides
- Maintain API reference
- Add more examples
- Create video tutorials

#### Testing
- Expand test coverage
- Add integration tests
- Performance regression tests
- User acceptance testing
- Automated testing pipeline

#### Community
- Respond to issues and PRs
- Community support on forums
- Feature request triage
- Beta tester coordination
- Release announcements

---

## 🗂️ Archive & Historical Context

Completed work and historical documentation has been moved to `/archive`:

- **Phase Completion Reports** - Phase 1.1-1.5, Phase 2.1a-2.2 complete
- **Migration Completion** - Path evaluator migration, sample migration
- **Debugging Sessions** - Jan 2025 debugging documentation
- **Implementation Details** - Specific feature implementation records

These documents remain available for reference but are no longer actively maintained.

---

## 📝 Contributing to This Roadmap

This roadmap is a living document. To propose changes:

1. **For Bug Fixes:** Create an issue with the `bug` label
2. **For Features:** Create an issue with the `enhancement` label and discuss priority
3. **For Documentation:** Submit a PR with updates to this file
4. **For Questions:** Use GitHub Discussions

**Maintainers:** Review and update this roadmap monthly.

---

## 📚 Related Documentation

- **[Type Safety Improvements](TYPE-SAFETY-IMPROVEMENTS.md)** - Detailed plan for code quality improvements
- **[Known Issues](KNOWN-ISSUES.md)** - Current limitations and known bugs
- **[Beta Release Guide](BETA-RELEASE-GUIDE.md)** - How to prepare and execute releases
- **[Contributing Guide](contributing/contributing.md)** - How to contribute to the project
- **[Architecture Overview](core/architecture.md)** - System design and structure

---

**Questions?** Open a GitHub Discussion or contact the maintainers.
