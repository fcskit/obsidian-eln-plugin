# Beta Release - Quick Start Guide

## What's Ready

✅ **Documentation Complete**
- CHANGELOG.md with full release notes
- README.md updated with beta status and installation
- Beta release checklist created
- GitHub release notes template ready

✅ **Code Status**
- All recent bug fixes included
- Plugin is stable and tested
- Ready for beta release

## What You Need to Do

### 1. Update Version Numbers (5 minutes)

Edit these files to change version from `0.7.0` to `0.7.0-beta.1`:

**manifest.json** (line 3):
```json
"version": "0.7.0-beta.1",
```

**package.json** (line 3):
```json
"version": "0.7.0-beta.1",
```

**versions.json**:
```json
{
	"0.7.0-beta.1": "0.15.0",
	"1.0.0": "0.15.0"
}
```

### 2. Final Testing Pass (15-30 minutes)

Test these critical workflows:
- [ ] Create a Chemical note
- [ ] Create a Sample note and switch subclasses (compound → electrode → electrochemCell)
- [ ] Test queryDropdown fields work
- [ ] Test number+unit fields work
- [ ] Test object lists don't nest incorrectly
- [ ] Open NPE editor on an existing note
- [ ] Verify no console errors

### 3. Build Release Package (2 minutes)

```bash
# From plugin root directory
npm run build
npm run release
```

This creates:
- `release/` folder with manifest.json, main.js, styles.css
- `obsidian-eln-0.7.0-beta.1.zip` in root

### 4. Test in Clean Vault (10 minutes)

```bash
# Create test vault folder
mkdir ~/test-vault-beta
cd ~/test-vault-beta

# Open in Obsidian to initialize
# Then close Obsidian

# Install plugin
mkdir -p .obsidian/plugins/obsidian-eln
cd .obsidian/plugins/obsidian-eln
unzip ~/path/to/obsidian-eln-0.7.0-beta.1.zip

# Open Obsidian, enable plugin, test basic functionality
```

### 5. Git Commit and Tag (5 minutes)

```bash
# From plugin root
git add manifest.json package.json versions.json CHANGELOG.md README.md
git commit -m "chore: prepare v0.7.0-beta.1 release"

git tag -a v0.7.0-beta.1 -m "Beta Release v0.7.0-beta.1

First public beta release of Obsidian ELN Plugin.

See CHANGELOG.md for full details."

git push origin main
git push origin v0.7.0-beta.1
```

### 6. Create GitHub Release (10 minutes)

1. Go to: https://github.com/fcskit/obsidian-eln-plugin/releases/new

2. **Choose a tag**: Select `v0.7.0-beta.1`

3. **Release title**: `v0.7.0-beta.1 - First Public Beta`

4. **Description**: Copy from `docs/developer/beta-release-checklist.md` (Release Notes Template section)

5. **Important**: ✅ Check **"Set as a pre-release"**

6. **Attach files**:
   - Upload `obsidian-eln-0.7.0-beta.1.zip`
   - Upload `manifest.json` (from release/ folder)
   - Upload `main.js` (from release/ folder)
   - Upload `styles.css` (from release/ folder)

7. Click **"Publish release"**

### 7. Announce (Optional, 5 minutes)

Post in relevant communities:
- Obsidian Discord #plugin-dev channel
- Obsidian Forum
- Your research group/collaborators

Example announcement:
```
🎉 First public beta of Obsidian ELN Plugin is live!

Transform Obsidian into an Electronic Lab Notebook with:
- Dynamic note templates
- Chemical integration
- Metadata management
- Sample tracking

Looking for beta testers and feedback!

📦 Download: https://github.com/fcskit/obsidian-eln-plugin/releases
🐛 Report issues: https://github.com/fcskit/obsidian-eln-plugin/issues

⚠️ Beta release - backup your vault first!
```

## After Release

### Monitor for Issues
- Check GitHub issues daily (first week)
- Respond to bug reports quickly
- Document common issues and workarounds

### Prepare Hotfix if Needed
If critical bugs found:
```bash
# Fix the bug
npm run build
# Increment version: 0.7.0-beta.2
# Repeat release process
```

### Plan Next Steps
- After 2-4 weeks of beta testing
- Implement query/mapping redesign (already documented)
- Address beta feedback
- Move toward stable v0.8.0

## Quick Commands Summary

```bash
# 1. Edit versions (manual)
# - manifest.json
# - package.json
# - versions.json

# 2. Build
npm run build
npm run release

# 3. Test in clean vault
# (manual process)

# 4. Git
git add manifest.json package.json versions.json CHANGELOG.md README.md
git commit -m "chore: prepare v0.7.0-beta.1 release"
git tag -a v0.7.0-beta.1 -m "Beta Release v0.7.0-beta.1"
git push origin main
git push origin v0.7.0-beta.1

# 5. GitHub release
# (manual process via web interface)

# 6. Announce
# (manual process)
```

## Estimated Time

- Version updates: 5 min
- Testing: 20 min
- Build & verify: 5 min
- Git commit/tag: 5 min
- GitHub release: 10 min
- **Total: ~45 minutes**

## Need Help?

Refer to these docs:
- `docs/developer/beta-release-checklist.md` - Complete checklist
- `CHANGELOG.md` - What to include in release notes
- `README.md` - Updated with beta status

---

**You're ready to release! 🚀**

The plugin is stable, documentation is complete, and the process is straightforward. Good luck with the beta!
