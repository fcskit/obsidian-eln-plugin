# Obsidian ELN Plugin - Development Roadmap

> **Last Updated:** February 6, 2026  
> **Current Version:** 0.8.0-beta.1 (Released)

This document serves as the public roadmap for the Obsidian ELN Plugin development. It tracks major milestones, current priorities, and future plans.

## 📚 Quick Navigation

**Public Documentation:**
- **[User Guide](../../user/README.md)** - Complete guide for users
- **[Installation](../../user/installation.md)** - Installation instructions
- **[Features](../../user/features.md)** - All plugin capabilities
- **[KNOWN-ISSUES.md](KNOWN-ISSUES.md)** - Known bugs and limitations

**Developer Resources:**
- **[Contributing](index.md)** - How to contribute to the project
- **[GitHub Repository](https://github.com/fcskit/obsidian-eln-plugin)** - Source code and issues
- **[GitHub Releases](https://github.com/fcskit/obsidian-eln-plugin/releases)** - Download releases

---

## 📍 Current Status: v0.8.0-beta.1 Released

✅ **v0.8.0-beta.1 Released** - Major NPE refactoring and bug fixes  
✅ **GitHub Pages Live** - Comprehensive documentation site  
✅ **Test vault available** - Complete demo environment  
🎯 **Next:** Gather feedback, plan stable v0.8.0 release

---

## 🎉 v0.8.0-beta.1 (February 6, 2026) - Released

### Major Changes

#### NPE (Nested Properties Editor) Refactoring
- ✅ **Modular Architecture** - Split into 30+ focused files
- ✅ **Improved Organization** - Separated buttons, elements, helpers, core rendering
- ✅ **Better Maintainability** - Clear separation of concerns
- ✅ **Performance Improvements** - Optimized rendering logic

#### Critical Bug Fixes
- ✅ **QueryDropdown Array Bug** - Fixed 3 interconnected issues with array handling
- ✅ **File.link Enhancement** - Strips .md extension for markdown files
- ✅ **NPE Error Styling** - Fixed error message display

#### Infrastructure Improvements
- ✅ **Logger System** - Comprehensive logging with component-based filtering
- ✅ **Memory Leak Prevention** - Improved cleanup and disposal
- ✅ **Documentation Site** - GitHub Pages with comprehensive guides
- ✅ **Test Vault Distribution** - Complete demo environment for testing

### New Components & Views
- ChemLinks - Chemical database integration
- CircularProgress - Progress indicators
- DailyNoteNav - Daily note navigation
- ImageViewer - Enhanced image viewing
- PeriodicTableView - Interactive periodic table

**Release Date:** February 6, 2026  
**Downloads:** [GitHub Releases](https://github.com/fcskit/obsidian-eln-plugin/releases/tag/v0.8.0-beta.1)

---

## 🚀 Current Sprint: Post-Beta Feedback & Improvements  
**Target:** This week

---

## 📋 Short-Term Goals (v0.8.x - Post-Beta)

### Type Safety Improvements
**Priority:** High | **Effort:** Medium | **Risk:** Low

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
**Target:** v0.8.1

### User Documentation for New Features
**Priority:** High | **Effort:** Medium | **Risk:** Low

Create comprehensive user-facing documentation for all features implemented in v0.8.0:
- Counter inheritance
- Postprocessor fields
- Dynamic query fields
- File picker markdown links
- Filesystem context enhancement
- Dynamic structure mapping

**Target:** v0.8.1-0.8.2

### User Experience Enhancements
**Priority:** Medium | **Effort:** Low | **Risk:** Low

- [ ] Improve error messages for template syntax errors
- [ ] Add loading indicators for slow operations
- [ ] Better validation feedback in forms
- [ ] Improved dropdown search/filtering
- [ ] Keyboard shortcuts for common actions

**Target:** v0.8.2-0.8.3

### Template Array Operations
**Priority:** Medium | **Effort:** Medium | **Risk:** Low

Add support for array operations in template fields (`.map()`, `.filter()`, `.join()`) to enable data transformations without Base query workarounds.

**Example:**
```
{{@join(@map(sample.preparation, 'link'), ', ')}}
```

**Benefits:**
- Simplified template syntax
- Better integration with template system
- More intuitive for users

**Target:** v0.8.2-v0.9.0

---

## 🎯 Medium-Term Goals (v0.9.x)

### Unified Template System (v0.9.0)
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

### Cross-File NPE Display (v0.9.0)
**Priority:** Medium | **Effort:** High | **Risk:** Medium

**📄 Detailed Plan:** Available in git repository under `docs/developer/todos/planned/`

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

**Target:** v0.9.0

**Benefits:**
- Single file per note type (no more splitting metadata/markdown)
- Easier template management and distribution
- Better subclass definition structure
- Simplified template loading

**Challenges:**
- Migration path for existing templates
- Backward compatibility
- User custom template updates

**Target:** v0.9.0 (2-3 months)

### Note Creation Architecture Redesign (v0.9.0 or v1.0.0)
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
- Template syntax still evolving (v0.8.0-v0.9.1)
- Would have delayed beta release significantly
- Current system works well enough for v0.8.x
- Lower risk once template system stabilizes

**Timing:**
- **Earliest start:** After v0.9.0 unified templates complete
- **Target:** v0.9.0 (optimistic) or v1.0.0 (realistic)
- **Duration:** 4-6 weeks implementation + 1-2 weeks stabilization

**Dependencies:**
- ✅ Template syntax stabilization (v0.8.0) - COMPLETE
- 🔄 Unified template system (v0.9.0) - PLANNED
- ⏳ Query syntax improvements (v0.9.1) - PLANNED

**Target:** v0.9.0 or v1.0.0 (4-6 months)

### Advanced Query System (v0.9.1)
**Priority:** Medium | **Effort:** Medium | **Risk:** Medium

- [ ] Complex query operators (AND, OR, NOT combinations)
- [ ] Aggregation queries (count, sum, average)
- [ ] Query result caching
- [ ] Query performance optimization
- [ ] Saved query templates

**Target:** v0.9.1

### Plugin API for Extensions (v0.9.2)
**Priority:** Medium | **Effort:** High | **Risk:** Medium

- [ ] Public API for other plugins to integrate
- [ ] Template extension system
- [ ] Custom field type registration
- [ ] Event hooks for note creation
- [ ] Documentation for plugin developers

**Target:** v0.9.2

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

The following features have been fully implemented and are available in v0.8.0-beta.1. Detailed implementation documentation is available in the git repository under `docs/developer/todos/completed/`.

### v0.8.0-beta.1 Release (February 6, 2026)

Major release with significant template system improvements and enhanced functionality.

### v0.7.0 Completed Features (Historical)

- **[Counter Inheritance](todos/completed/counter-inheritance-feature.md)** - Automatic counter incrementation across note hierarchies
- **[Postprocessor Fields](todos/completed/postprocessor-fields.md)** - Field transformations after user input evaluation
- **[Dynamic Query Field Updates](todos/completed/dynamic-query-field-updates.md)** - Reactive fields that update based on vault queries
- **[Dynamic Structure Mapping](todos/completed/dynamic-structure-mapping.md)** - Advanced template structure manipulation
- **[Field Overwrite Fix](todos/completed/field-overwrite-fix.md)** - Prevention of data loss in specific scenarios
- **[File Picker Markdown Links](todos/completed/filepicker-markdown-links.md)** - Enhanced file linking in templates
- **[Filesystem Context Enhancement](todos/completed/filesystem-context-enhancement.md)** - Advanced context variables for templates

**User Documentation Status:** Completed for v0.8.1-0.8.2 (see internal documentation for details)

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
