# Beta Release Checklist - v0.7.0-beta.1

## Pre-Release Preparation

### 1. Documentation ✅
- [x] CHANGELOG.md created with complete change history
- [ ] README.md updated with beta installation instructions
- [ ] Known limitations documented
- [ ] Issue reporting guidelines included
- [ ] Screenshots updated (if needed)

### 2. Version Updates
- [ ] Update `manifest.json` version to `0.7.0-beta.1`
- [ ] Update `package.json` version to `0.7.0-beta.1`
- [ ] Update `versions.json` with compatibility info
- [ ] Verify `minAppVersion` in manifest.json

### 3. Code Quality
- [ ] Run final build: `npm run build`
- [ ] No TypeScript errors
- [ ] No console errors in test environment
- [ ] All recent bug fixes included
- [ ] Code comments cleaned up (remove debug logging if excessive)

### 4. Testing Pass

#### Critical Features
- [ ] Create note of each type:
  - [ ] Chemical note
  - [ ] Sample note (base)
  - [ ] Sample → Compound subclass
  - [ ] Sample → Electrode subclass
  - [ ] Sample → ElectrochemCell subclass
  - [ ] Experiment note
  - [ ] Process note
  - [ ] Analysis note
  - [ ] Meeting note
  - [ ] Project note

#### Template Features
- [ ] Subclass dropdown selection
- [ ] Subclass switching (multiple times)
- [ ] QueryDropdown fields render correctly
- [ ] Number + unit fields work
- [ ] Object lists don't nest incorrectly
- [ ] Text inputs work
- [ ] Date inputs work
- [ ] Regular dropdowns work
- [ ] Nested objects work

#### NPE Editor
- [ ] Can open existing notes
- [ ] Can edit metadata
- [ ] Tree rendering works
- [ ] Save changes work

#### UI
- [ ] Modal renders properly
- [ ] Navigation works
- [ ] Footer renders
- [ ] Styles applied correctly
- [ ] No visual glitches

#### Edge Cases
- [ ] Empty templates work
- [ ] Long field names don't break layout
- [ ] Special characters in field names
- [ ] Very nested structures (test depth limit)
- [ ] Large number of fields

### 5. Build Release Package
```bash
# Clean build
npm run build

# Create release package
npm run release

# Verify release/ directory contains:
# - manifest.json
# - main.js
# - styles.css

# Verify zip file created:
# - obsidian-eln-0.7.0-beta.1.zip
```

### 6. Test Installation in Clean Vault

- [ ] Create fresh test vault
- [ ] Extract release zip to `.obsidian/plugins/obsidian-eln/`
- [ ] Enable plugin
- [ ] Verify plugin loads without errors
- [ ] Test basic functionality
- [ ] Check console for errors

## Release Process

### 1. Commit and Tag
```bash
# Commit version changes
git add manifest.json package.json versions.json CHANGELOG.md
git commit -m "chore: prepare v0.7.0-beta.1 release"

# Create tag
git tag -a v0.7.0-beta.1 -m "Beta Release v0.7.0-beta.1

First public beta release of Obsidian ELN Plugin.

See CHANGELOG.md for full details."

# Push
git push origin main
git push origin v0.7.0-beta.1
```

### 2. Create GitHub Release

1. Go to https://github.com/fcskit/obsidian-eln-plugin/releases/new
2. Click "Choose a tag" → Select `v0.7.0-beta.1`
3. Release title: `v0.7.0-beta.1 - First Public Beta`
4. Check **"Set as a pre-release"** ✅ (important!)
5. Add release notes (see template below)
6. Attach files:
   - Upload `obsidian-eln-0.7.0-beta.1.zip`
   - Upload `manifest.json`
   - Upload `main.js`
   - Upload `styles.css`
7. Click "Publish release"

### 3. Release Notes Template

```markdown
# 🎉 First Public Beta Release!

We're excited to share the first public beta of the Obsidian ELN Plugin! This plugin transforms Obsidian into a powerful Electronic Lab Notebook with dynamic templates, metadata management, and specialized research tools.

## ⚠️ Beta Release Notice

This is a **beta release** for testing and feedback. While the core functionality is stable, please:
- **Backup your vault** before installation
- Report any issues on GitHub
- Expect some rough edges and missing features

## 🚀 Installation

**Manual Installation (Beta)**
1. Download `obsidian-eln-0.7.0-beta.1.zip` below
2. Extract to your vault's `.obsidian/plugins/obsidian-eln/` folder
3. Enable in Settings → Community plugins → Enable "Electronic Lab Notebook"
4. Use Ctrl/Cmd+P → "ELN: Create Note" to get started

**Requirements**
- Obsidian 0.15.0 or higher
- Desktop recommended (mobile may have issues)

## ✨ What's Included

- 🔬 Dynamic note creation with structured templates
- 🧪 Chemical integration and periodic table
- 📊 Rich metadata management
- 🎨 Modern, Obsidian-themed UI
- 🔄 Subclass templates for specialized notes
- 📋 Query-based dropdowns (search your vault)
- 📈 Sample, experiment, and process tracking

## 🐛 Recent Bug Fixes

This release includes fixes for:
- Number + unit field rendering
- Object list nesting issues
- Subclass switching bugs
- QueryDropdown field display
- Template default value preservation
- And 15+ other template system improvements

See [CHANGELOG.md](./CHANGELOG.md) for complete details.

## ⚠️ Known Limitations

- Query/mapping syntax will be improved in future releases
- Chemical API integration not fully implemented
- Mobile support is experimental
- Templates require manual JSON editing

## 🐛 Reporting Issues

Found a bug? Please open an issue with:
- Plugin version (0.7.0-beta.1)
- Obsidian version
- OS and steps to reproduce
- Screenshots if helpful

[→ Report Issue](https://github.com/fcskit/obsidian-eln-plugin/issues/new)

## 📚 Documentation

- [README](./README.md) - Quick start guide
- [CHANGELOG](./CHANGELOG.md) - Complete change history
- [User Docs](./docs/user/) - Features and templates
- [Developer Docs](./docs/developer/) - Architecture and API

## 🙏 Thank You!

Your feedback and testing is invaluable. Let us know what works, what doesn't, and what features you'd like to see next!

---

**Full Changelog**: https://github.com/fcskit/obsidian-eln-plugin/blob/main/CHANGELOG.md
```

## Post-Release

### 1. Announcement
- [ ] Post in Obsidian Discord #plugin-dev
- [ ] Post in Obsidian Forum
- [ ] Share with any beta testers

### 2. Monitor
- [ ] Watch for GitHub issues
- [ ] Monitor Discord for feedback
- [ ] Track common problems
- [ ] Document workarounds

### 3. Quick Fixes
- [ ] If critical bugs found, prepare hotfix release
- [ ] Minor issues → document for next release

## Next Steps After Beta

1. **Gather Feedback** (2-4 weeks)
   - Monitor issue reports
   - Collect feature requests
   - Identify common pain points

2. **Prioritize Improvements**
   - Fix critical bugs first
   - Address common complaints
   - Implement most-requested features

3. **Plan v0.8.0**
   - Query/mapping syntax redesign
   - Dynamic field rendering
   - Chemical API integration
   - Performance improvements

4. **Move to Stable**
   - After sufficient testing and fixes
   - Remove beta designation
   - Submit to Obsidian community plugins

## Commands Summary

```bash
# Update versions (manual edit)
# - manifest.json
# - package.json  
# - versions.json

# Build and test
npm run build
# Test in clean vault

# Create release
npm run release

# Git workflow
git add manifest.json package.json versions.json CHANGELOG.md
git commit -m "chore: prepare v0.7.0-beta.1 release"
git tag -a v0.7.0-beta.1 -m "Beta Release v0.7.0-beta.1"
git push origin main
git push origin v0.7.0-beta.1

# Then create GitHub release with:
# - Pre-release checkbox enabled
# - Release notes from template
# - Attached files: zip, manifest.json, main.js, styles.css
```

## Checklist Status

- [ ] All pre-release tasks complete
- [ ] All tests passed
- [ ] Release package built and verified
- [ ] Git tagged and pushed
- [ ] GitHub release created
- [ ] Announcement posted
- [ ] Ready to gather feedback! 🎉
