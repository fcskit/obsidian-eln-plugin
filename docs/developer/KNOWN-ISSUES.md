# Known Issues & Limitations

> **Last Updated:** February 2, 2026  
> **Version:** 0.7.0-beta.1

This document tracks known issues, limitations, and areas for improvement in the Obsidian ELN Plugin. Issues are categorized by severity and impact.

---

## 🔴 High Priority Issues

### Type Safety Warnings (ESLint)
**Status:** Planned for v0.7.1  
**Impact:** Development experience, code quality

**Description:**  
The codebase contains ~150+ instances of `Record<string, any>` and `Record<string, unknown>` that trigger ESLint warnings:
- "Unexpected any" warnings
- Loss of type safety and IDE autocomplete
- Potential for runtime errors

**Workaround:** None - these are development-time warnings only.

**Resolution Plan:** See [TYPE-SAFETY-IMPROVEMENTS.md](TYPE-SAFETY-IMPROVEMENTS.md) for comprehensive plan.

**Tracking:** GitHub issue #XXX (create after beta release)

---

## 🟡 Medium Priority Issues

### Template Syntax Error Messages
**Status:** Improvement planned for v0.7.2  
**Impact:** User experience

**Description:**  
When users make syntax errors in template function expressions, error messages can be cryptic:
- Generic JavaScript eval errors
- No line numbers or specific syntax guidance
- Difficult to debug complex expressions

**Example:**
```typescript
// User writes:
expression: "settings.operators.find(op => op.name = userInput.operator)"
//                                                   ^ should be ===

// Error:
"Evaluation failed: Invalid assignment"
```

**Workaround:** Carefully validate template syntax using template tester.

**Future Improvement:**
- Better error parsing and user-friendly messages
- Template syntax validator in settings UI
- Suggested fixes for common errors

**Tracking:** GitHub issue #XXX

### Large Vault Performance
**Status:** Investigation needed  
**Impact:** Performance for users with 1000+ notes

**Description:**  
Users with very large vaults (1000+ notes) may experience:
- Slower note creation modal opening
- Lag in queryDropdown fields
- Increased memory usage

**Workaround:**
- Use more specific query filters (where clauses)
- Limit number of returned results
- Consider splitting large vaults into separate vaults

**Investigation Needed:**
- Profile query performance
- Implement query result caching
- Consider pagination for large result sets

**Tracking:** GitHub issue #XXX

---

## 🟢 Low Priority Issues

### Mobile UI Optimization
**Status:** Planned for v0.9.x+  
**Impact:** Mobile users

**Description:**  
The plugin is primarily designed for desktop and may have suboptimal experience on mobile:
- Small touch targets
- Complex modals difficult on small screens
- Some components not optimized for touch

**Workaround:** Use desktop version of Obsidian when possible.

**Future Work:** Mobile-specific UI improvements planned for v0.9.x+

**Tracking:** See [ROADMAP.md](ROADMAP.md#mobile-support-v09x---v10)

### PathTemplateParser Legacy Code
**Status:** Review needed  
**Impact:** Code maintainability

**Description:**  
`src/core/templates/PathTemplateParser.ts` may be legacy code that has been superseded by PathEvaluator. Needs review to determine if still in use.

**Action Items:**
- [ ] Search for usages in codebase
- [ ] Determine if can be deprecated
- [ ] Add deprecation notices or remove

**Tracking:** Part of technical debt cleanup

---

## 📋 Limitations (By Design)

### Template Function Evaluation Context
**Limitation:** Template functions execute in isolated context  
**Reason:** Security and safety

**Description:**  
Function descriptors in templates have access only to explicitly provided context (settings, userInput, noteMetadata, etc.). They cannot:
- Access global Obsidian APIs directly
- Import external modules
- Execute arbitrary code from plugins

**Rationale:** This is intentional for security and predictable behavior.

**Workaround:** Use provided context providers or request new context additions.

### Subclass Template Inheritance
**Limitation:** Subclass templates can add/remove/replace fields but not modify parent template logic  
**Reason:** Template architecture

**Description:**  
Subclass templates (e.g., compound, electrode) can:
- ✅ Add new fields
- ✅ Replace existing fields
- ✅ Remove fields

They cannot:
- ❌ Modify parent template functions
- ❌ Override callback logic
- ❌ Change template structure

**Workaround:** Define complete templates for complex customizations.

### Query Complexity
**Limitation:** Basic query operators only  
**Planned:** Advanced queries in v0.8.1

**Current Support:**
- ✅ Simple field matching (is, contains)
- ✅ Basic AND combinations

**Not Supported:**
- ❌ OR operators
- ❌ NOT operators
- ❌ Aggregations (count, sum, avg)
- ❌ Complex boolean logic

**Workaround:** Use multiple queries or filter results in JavaScript.

**Future:** See [ROADMAP.md](ROADMAP.md#advanced-query-system-v081)

---

## 🐛 Known Bugs (Tracked)

### None Currently
All known bugs from v0.7.0-alpha development have been fixed.

---

## 🧪 Beta-Specific Considerations

### Expected Beta Behaviors

Since this is a beta release (v0.7.0-beta.1), users should expect:

1. **Potential Breaking Changes**
   - Template syntax may evolve based on feedback
   - Settings structure may change
   - Migration paths will be provided

2. **Limited Backward Compatibility**
   - Custom templates may need updates
   - Settings from alpha versions should be reviewed

3. **Active Development**
   - Frequent updates and improvements
   - Feature additions based on user feedback
   - Bug fixes released promptly

### What Beta Means

✅ **Safe for Non-Production Use:**
- Personal research notes
- Non-critical lab notebooks
- Testing and evaluation
- Development and experimentation

❌ **Not Recommended For:**
- Critical regulatory submissions
- Legal documentation
- Published research data (until stable release)
- Production lab environments (without backups)

**Recommendation:** Always maintain backups of important data.

---

## 📊 Performance Characteristics

### Memory Usage

**Typical:** 50-150 MB for medium vaults (100-500 notes)

**Factors:**
- Number of notes with complex metadata
- Query result caching
- Template evaluation caching
- Number of open modals

**Optimization Tips:**
- Close unused modals
- Clear cache periodically (restart Obsidian)
- Use specific query filters

### Startup Time

**Typical:** <1 second after Obsidian loads

**Factors:**
- Number of templates to load
- Settings complexity
- Custom template files

### Note Creation Time

**Typical:** 
- Simple notes: <100ms
- Complex with queries: <500ms
- Very complex with multiple queries: <2s

**Factors:**
- Number of query fields
- Vault size (for queries)
- Template complexity
- Function evaluation count

---

## 🔒 Security Considerations

### Template Function Execution

**Risk Level:** Low

**Description:**  
Template functions are executed using JavaScript `eval()` in isolated context.

**Mitigations:**
- Functions only have access to provided context
- No access to global scope or Obsidian APIs
- Context is sanitized before evaluation
- User must explicitly define functions in templates

**Recommendation:**
- Only use templates from trusted sources
- Review custom template functions
- Do not share templates with untrusted users' data

### Data Privacy

**Risk Level:** None

**Description:**  
All data stays local:
- ✅ No cloud services
- ✅ No external API calls
- ✅ No telemetry or analytics
- ✅ Everything stored in Obsidian vault

**Note:** The plugin never sends data outside Obsidian.

---

## 🔧 Troubleshooting Common Issues

### Issue: "Cannot read property 'X' of undefined"
**Cause:** Missing or incorrect field reference in template  
**Solution:** Check field paths match template structure

### Issue: Template function not evaluating
**Cause:** Syntax error in function expression  
**Solution:** Validate JavaScript syntax, check context availability

### Issue: QueryDropdown returns no results
**Cause:** Query filter too restrictive or incorrect field names  
**Solution:** Test query with broader filter, check field names match frontmatter

### Issue: Note created in wrong folder
**Cause:** FolderPath evaluation issue  
**Solution:** Check folderPath template segments, verify field references

### Issue: Reactive field not updating
**Cause:** Missing or incorrect reactiveDeps declaration  
**Solution:** Verify reactiveDeps array includes all dependency fields

---

## 📝 Reporting New Issues

### Before Reporting

1. **Check This Document** - Issue may already be known
2. **Search Existing Issues** - May already be reported
3. **Try Latest Version** - May already be fixed
4. **Check Logs** - Look for error messages in console

### What to Include

- **Obsidian Version**
- **Plugin Version**
- **Operating System**
- **Steps to Reproduce**
- **Expected Behavior**
- **Actual Behavior**
- **Screenshots/Logs** (if applicable)
- **Template Configuration** (if relevant)

### Where to Report

- **Bugs:** GitHub Issues with `bug` label
- **Feature Requests:** GitHub Issues with `enhancement` label
- **Questions:** GitHub Discussions
- **Security:** Email maintainers directly (see README)

---

## 🔄 Issue Status Tracking

### Issue Lifecycle

1. **Reported** - Issue created by user or developer
2. **Triaged** - Reviewed and categorized
3. **Accepted** - Confirmed and added to roadmap
4. **In Progress** - Actively being worked on
5. **Fixed** - Resolved in development branch
6. **Released** - Included in published version
7. **Closed** - Verified fixed by reporter

### Priority Levels

- **P0 - Critical:** Data loss, crashes, security issues
- **P1 - High:** Major functionality broken
- **P2 - Medium:** Functionality impaired but workarounds exist
- **P3 - Low:** Minor issues, cosmetic problems

---

## 📚 Related Documentation

- **[ROADMAP.md](ROADMAP.md)** - Future improvements and features
- **[TYPE-SAFETY-IMPROVEMENTS.md](TYPE-SAFETY-IMPROVEMENTS.md)** - Planned code quality improvements
- **[BETA-RELEASE-GUIDE.md](BETA-RELEASE-GUIDE.md)** - Release process
- **[Manual Testing Guide](manual-testing-guide.md)** - How to test the plugin

---

**Questions or concerns?** Open a GitHub Discussion or contact the maintainers.

**Last Updated:** February 2, 2026  
**Next Review:** After beta release feedback
