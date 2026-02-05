# GitHub Release Instructions for v0.8.0-beta.1

## 📦 Release Files Ready

All release files are now organized in the `release/` directory:

```
release/
├── obsidian-eln-0.8.0-beta.1.zip       (134 KB) - Main plugin
├── obsidian-eln-assets.zip              (1.7 MB) - Image assets
└── obsidian-eln-test-vault.zip          (2.7 MB) - Complete test vault
```

## 🚀 Creating the GitHub Release

### 1. Navigate to GitHub Releases
Go to: https://github.com/fcskit/obsidian-eln-plugin/releases/new

### 2. Fill in Release Details

**Tag version**: `v0.8.0-beta.1` (already created and pushed)

**Release title**: `v0.8.0-beta.1 - Beta Release`

**Description**: Copy from `RELEASE-NOTES-0.8.0-beta.1.md` and add download instructions below:

---

## 📥 Downloads

### Option 1: Plugin Only (Recommended for existing users)
**File**: `obsidian-eln-0.8.0-beta.1.zip` (134 KB)

For users who already have the plugin or want a clean installation:
1. Download `obsidian-eln-0.8.0-beta.1.zip`
2. Extract to `.obsidian/plugins/obsidian-eln/` in your vault
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

### Option 2: Complete Test Vault (Best for new users)
**File**: `obsidian-eln-test-vault.zip` (2.7 MB)

Includes pre-configured plugin + example notes + all assets:
1. Download `obsidian-eln-test-vault.zip`
2. Extract the zip file
3. Open Obsidian → "Open folder as vault"
4. Navigate to the extracted `test-vault` folder
5. ⚠️ **IMPORTANT**: Open the folder that CONTAINS the `.obsidian` folder!

**What's included:**
- Plugin pre-installed and configured
- Sample chemicals, devices, instruments
- Example experiments and analyses
- Project templates and sample notes
- All image assets pre-configured
- Ready to use immediately!

### Option 3: Assets Only (Optional)
**File**: `obsidian-eln-assets.zip` (1.7 MB)

If you want to add image assets to your existing vault:
1. Download `obsidian-eln-assets.zip`
2. Extract to your vault root
3. Creates an `assets/` folder with images for:
   - Project banners
   - Device/instrument photos
   - Contact photos  
   - Motivational daily note images

**Note**: This is already included in Option 2 (test vault).

---

### 3. Set Release Options

- ✅ **Check** "This is a pre-release" (important for beta!)
- Set as pre-release to indicate this is a beta version

### 4. Attach Files

Drag and drop all three files from the `release/` directory:
1. `obsidian-eln-0.8.0-beta.1.zip`
2. `obsidian-eln-assets.zip`
3. `obsidian-eln-test-vault.zip`

### 5. Publish

Click "Publish release"

## 📝 Additional Sections for Release Notes

### System Requirements
- Obsidian v0.15.0 or higher
- Works on desktop and mobile

### Upgrade Notes
Users upgrading from v0.7.0 should:
1. Backup your vault before upgrading
2. Replace the plugin files with the new version
3. Reload Obsidian
4. Existing notes and templates remain compatible

### Known Limitations
- This is a beta release for testing
- Please report any issues on GitHub

### Feedback & Support
- 🐛 Report issues: https://github.com/fcskit/obsidian-eln-plugin/issues
- 💬 Discussions: https://github.com/fcskit/obsidian-eln-plugin/discussions
- 📖 Documentation: See `docs/` folder in repository

## 🎯 Post-Release Checklist

After publishing the release:
- [ ] Announce in community channels (if applicable)
- [ ] Monitor GitHub issues for bug reports
- [ ] Update any relevant documentation links
- [ ] Consider updating README.md with latest release info

## 📊 Release Statistics

- **Version**: 0.8.0-beta.1
- **Release Date**: February 5, 2026
- **Commit**: 5786eb3
- **Files Changed**: 202
- **Insertions**: 39,091
- **Tag**: v0.8.0-beta.1

## 🔗 Useful Links

- Repository: https://github.com/fcskit/obsidian-eln-plugin
- Issues: https://github.com/fcskit/obsidian-eln-plugin/issues
- Previous Releases: https://github.com/fcskit/obsidian-eln-plugin/releases
