# Todos - Project Task Tracking

This folder tracks all project tasks, features, and improvements organized by status.

## Folder Structure

### `/active` - Current Work
Tasks currently in progress or planned for the immediate sprint.

**Current Active Items:**
- **[type-safety-improvements.md](active/type-safety-improvements.md)** - Eliminate ~150+ `Record<string, any>` instances (v0.7.1)
- **[user-documentation.md](active/user-documentation.md)** - Create user docs for completed features (v0.7.1-v0.7.2)

### `/completed` - Finished Work  
Features and improvements that have been fully implemented and tested.

**Completed Features:**
- **[counter-inheritance-feature.md](completed/counter-inheritance-feature.md)** - Automatic counter incrementation
- **[postprocessor-fields.md](completed/postprocessor-fields.md)** - Field transformation after user input
- **[dynamic-query-field-updates.md](completed/dynamic-query-field-updates.md)** - Reactive query-driven fields
- **[dynamic-structure-mapping.md](completed/dynamic-structure-mapping.md)** - Advanced template structure manipulation
- **[field-overwrite-fix.md](completed/field-overwrite-fix.md)** - Data loss prevention fix
- **[filepicker-markdown-links.md](completed/filepicker-markdown-links.md)** - Enhanced file linking
- **[filesystem-context-enhancement.md](completed/filesystem-context-enhancement.md)** - Advanced template context

### `/planned` - Future Work
Features and improvements planned for future versions.

**Coming Soon:**
- **[note-creation-architecture-redesign.md](planned/note-creation-architecture-redesign.md)** - Complete note creation system redesign (v0.8.0/v0.9.0)
- **[template-array-operations.md](planned/template-array-operations.md)** - Array operations in templates (`.map()`, `.filter()`, `.join()`) (v0.7.2-v0.8.0)
- **[cross-file-npe-display.md](planned/cross-file-npe-display.md)** - Display metadata from other files in NPE code blocks (v0.8.0)
- Unified template system with seamless editing (v0.8.0)
- Advanced query operators (v0.8.1)
- Public plugin API (v0.8.2)
- Collaboration features (v0.9.0+)

See [ROADMAP.md](../ROADMAP.md) for detailed version planning.

## Naming Convention

All todo files should follow this naming pattern:

- **Active todos**: `feature-name.md` or `improvement-name.md`
- **Completed todos**: Original name retained for historical reference
- **Planned todos**: `feature-feature-name.md` for clarity

## Todo Document Template

Each todo document should include:

```markdown
# [Feature/Improvement Name]

**Status**: Active|Completed|Planned  
**Priority**: High|Medium|Low  
**Target Version**: vX.X.X  
**Estimated Effort**: X days/weeks

## Overview
Brief description of what this accomplishes and why it's needed.

## Implementation Details
Technical approach and key changes.

## Success Criteria
- [ ] Measurable outcomes
- [ ] Testing requirements
- [ ] Documentation needs

## Dependencies
What needs to be done first or in parallel.

## Related Documentation
Links to related docs, issues, or discussions.
```

## Workflow

### Adding New Todos
1. Create file in `/planned` with `feature-` prefix
2. Fill out template with overview and requirements
3. Update ROADMAP.md with link to the todo
4. Add to appropriate version milestone

### Starting Work on a Todo
1. Move file from `/planned` to `/active`
2. Update status to "Active"
3. Update ROADMAP.md current sprint section
4. Create feature branch if appropriate

### Completing a Todo
1. Verify all success criteria are met
2. Update status to "Completed"
3. Move file from `/active` to `/completed`
4. Update ROADMAP.md to reflect completion
5. Consider if user documentation is needed

### Archiving Old Todos
- Todos remain in `/completed` indefinitely for historical reference
- Only move to `/archive` if they become completely irrelevant (rare)
- User-facing feature docs may be extracted to `docs/user/`

## Cross-References

### Related Documentation
- **[ROADMAP.md](../ROADMAP.md)** - Version planning and project timeline
- **[KNOWN-ISSUES.md](../KNOWN-ISSUES.md)** - Current limitations and bugs
- **[template-system/](../template-system/)** - Template redesign documentation
- **[guides/](../guides/)** - Testing and release guides

### User Documentation
Completed features that need user documentation are tracked in:
- **[active/user-documentation.md](active/user-documentation.md)**

## Quick Navigation

**Current Sprint (v0.7.1)**
- Type safety improvements → [active/type-safety-improvements.md](active/type-safety-improvements.md)
- User documentation → [active/user-documentation.md](active/user-documentation.md)

**Recently Completed (v0.7.0)**
- Counter inheritance → [completed/counter-inheritance-feature.md](completed/counter-inheritance-feature.md)
- Postprocessor fields → [completed/postprocessor-fields.md](completed/postprocessor-fields.md)
- Dynamic queries → [completed/dynamic-query-field-updates.md](completed/dynamic-query-field-updates.md)

**Next Up (v0.7.2-v0.9.0)**
- Performance optimization (create planned doc for v0.7.2)
- Unified template system (see template-system/ docs for v0.8.0)
- Note creation architecture redesign → [planned/note-creation-architecture-redesign.md](planned/note-creation-architecture-redesign.md) (v0.8.0 or v0.9.0)
- Advanced query operators (see template-system/ for v0.8.1)

---

**Last Updated**: February 2, 2026  
**Total Active**: 2 | **Total Completed**: 7 | **Total Planned**: 1 (+ more to be added)
