# Guides - Testing, Release, and Development Workflows

This folder contains practical guides for developers working on the plugin, focusing on testing, debugging, and release processes.

## Guide Index

### Testing Guides

#### [manual-testing-guide.md](manual-testing-guide.md)
**Comprehensive manual testing procedures**

Essential for validating changes before release. Covers:
- All note types and template combinations
- UI component testing (modals, nested properties editor, etc.)
- Edge cases and error handling
- Integration testing scenarios
- Performance verification

**When to use**: Before every release, after significant changes, when automated tests aren't sufficient.

#### [test-suite-readme.md](test-suite-readme.md)
**Automated test suite documentation**

Explains the automated testing setup:
- Test file locations and organization
- Running tests locally
- Writing new tests
- Test coverage goals
- CI/CD integration

**When to use**: When adding new features, fixing bugs, setting up development environment.

#### [QUICK-TEST-COMMANDS.md](QUICK-TEST-COMMANDS.md)
**Fast reference for common test operations**

Quick commands for:
- Running specific test suites
- Testing individual components
- Debugging test failures
- Performance benchmarking
- Memory profiling

**When to use**: During active development, quick validation of changes.

### Release Guides

#### [BETA-RELEASE-GUIDE.md](BETA-RELEASE-GUIDE.md)
**Complete beta release process**

Step-by-step instructions for beta releases:
- Pre-release checklist
- Version numbering for betas
- Creating GitHub releases
- Beta testing coordination
- Feedback collection process

**When to use**: Preparing for beta releases (v0.7.0-beta.1, etc.).

#### [beta-release-checklist.md](beta-release-checklist.md)
**Detailed checklist format**

Itemized checklist covering:
- Code freeze requirements
- Testing completion
- Documentation updates
- Version number updates
- Release notes preparation
- Announcement templates

**When to use**: As a checklist during beta release preparation.

### Debugging Guides

#### [debug-log-analysis-guide.md](debug-log-analysis-guide.md)
**Using the plugin's logging system**

How to work with the centralized Logger:
- Enabling different log levels
- Component-based filtering
- File logging to `debug-log.txt`
- Common log patterns and what they mean
- Debugging workflows

**When to use**: Investigating bugs, understanding execution flow, troubleshooting user issues.

## Testing Workflow

### Development Testing

**Quick iteration cycle:**
1. Make code changes
2. Run `npm run build-fast` (quick build without full TypeScript check)
3. Reload Obsidian plugin
4. Test specific feature manually
5. Check console for errors/warnings

**Full validation:**
1. Run `npm run build` (full TypeScript compilation)
2. Fix any errors
3. Run automated test suite (see [test-suite-readme.md](test-suite-readme.md))
4. Perform manual testing (see [manual-testing-guide.md](manual-testing-guide.md))
5. Check debug logs (see [debug-log-analysis-guide.md](debug-log-analysis-guide.md))

### Pre-Release Testing

Follow the complete workflow in [BETA-RELEASE-GUIDE.md](BETA-RELEASE-GUIDE.md):

1. **Code Quality**
   - Run full build with TypeScript checks
   - Review ESLint warnings
   - Run all automated tests

2. **Manual Validation**
   - Complete manual testing guide
   - Test all note types
   - Verify UI components
   - Check edge cases

3. **Documentation**
   - Update CHANGELOG
   - Review user documentation
   - Update developer docs if needed

4. **Release Preparation**
   - Use beta-release-checklist.md
   - Version number updates
   - Create release notes
   - Tag and publish

## Debugging Workflow

### Using Debug Logs

**Enable logging:**
1. See [debug-log-analysis-guide.md](debug-log-analysis-guide.md) for setup
2. Configure component-based log levels
3. Optional: Enable file logging

**Common debugging scenarios:**
- **Template processing**: Enable `template` component logs
- **Note creation**: Enable `note` and `path` logs
- **UI issues**: Enable `modal`, `npe`, or `ui` logs
- **API calls**: Enable `api` logs

**Finding issues:**
1. Reproduce the problem
2. Check console output (filtered by component)
3. Review `debug-log.txt` if file logging enabled
4. Look for error patterns in log messages
5. Use timestamps to trace execution flow

### Performance Profiling

Use [QUICK-TEST-COMMANDS.md](QUICK-TEST-COMMANDS.md) for:
- Memory usage tracking
- Execution time measurement
- Bundle size analysis
- Render performance profiling

## Release Workflow

### Beta Release Process

**Step-by-step** (see [BETA-RELEASE-GUIDE.md](BETA-RELEASE-GUIDE.md)):

1. **Preparation Phase**
   - Complete all planned features
   - Fix critical bugs
   - Update documentation

2. **Testing Phase**
   - Run full test suite
   - Complete manual testing
   - Performance validation

3. **Pre-Release Phase**
   - Update version numbers (0.7.0-beta.1)
   - Create CHANGELOG entries
   - Update manifest.json
   - Review all documentation

4. **Release Phase**
   - Create GitHub release
   - Upload artifacts
   - Write release notes
   - Announce to beta testers

5. **Post-Release Phase**
   - Monitor feedback
   - Track issues
   - Plan fixes for next iteration

### Using the Checklist

The [beta-release-checklist.md](beta-release-checklist.md) provides a detailed checklist:
- Check off items as completed
- Don't skip items (they're all important)
- Document any deviations
- Review with team before releasing

## Quick Reference

### Common Commands

```bash
# Build plugin (fast, development)
npm run build-fast

# Build plugin (full, with type checking)
npm run build

# Build CSS from modular sources
npm run build-css

# Watch CSS for changes
npm run watch-css

# Run health check
npm run health-check

# Create backup
npm run backup
```

See [QUICK-TEST-COMMANDS.md](QUICK-TEST-COMMANDS.md) for comprehensive command reference.

### File Locations

- **Test vault**: `/test-vault/` - Obsidian vault for manual testing
- **Test files**: `/tests/` - Automated test suite
- **Debug logs**: `test-vault/debug-log.txt` (when file logging enabled)
- **Build output**: `/release/` - Compiled plugin files

## Cross-References

### Related Documentation

- **[../todos/active/](../todos/active/)** - Current work requiring testing
- **[../ROADMAP.md](../ROADMAP.md)** - Upcoming features to plan tests for
- **[../KNOWN-ISSUES.md](../KNOWN-ISSUES.md)** - Known bugs and limitations
- **[../core/testing.md](../core/testing.md)** - Testing architecture and philosophy

### For Contributors

- **[../contributing/contributing.md](../contributing/contributing.md)** - How to contribute
- **[../core/development-setup.md](../core/development-setup.md)** - Setting up dev environment
- **[../core/architecture.md](../core/architecture.md)** - Understanding the codebase

## Getting Started

**New to testing the plugin?**
1. Read [manual-testing-guide.md](manual-testing-guide.md) - Learn the testing approach
2. Review [QUICK-TEST-COMMANDS.md](QUICK-TEST-COMMANDS.md) - Get familiar with commands
3. Try testing a simple feature - Practice the workflow

**Preparing for a release?**
1. Start with [BETA-RELEASE-GUIDE.md](BETA-RELEASE-GUIDE.md) - Understand the process
2. Use [beta-release-checklist.md](beta-release-checklist.md) - Track progress
3. Follow each step carefully - Don't skip items

**Debugging an issue?**
1. Check [debug-log-analysis-guide.md](debug-log-analysis-guide.md) - Enable appropriate logging
2. Reproduce the problem with logging enabled
3. Analyze log output to identify root cause

---

**Last Updated**: February 2, 2026  
**Guide Status**: Current and maintained  
**Coverage**: Testing, debugging, release workflows
