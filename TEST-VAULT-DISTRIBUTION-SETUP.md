# Test Vault Distribution Setup

**Date**: February 4, 2026  
**Version**: v0.7.0-beta.1

## Overview

Updated release process to include test-vault as a downloadable package, making it easier for users to try the plugin before installing it in their own vaults.

## Changes Made

### 1. Updated .gitignore ✅

**File**: `.gitignore`

**Changes:**
- Removed complex test-vault exclusion rules
- Now ignoring `test-vault-dev/` (development vault)
- test-vault remains in repository for distribution
- Added patterns to exclude debug logs from any test vault

**Rationale:**
- Simpler to maintain test-vault as part of repository
- Development testing uses separate test-vault-dev folder
- Clean test-vault ready for distribution

### 2. Created Test Vault Packaging Script ✅

**File**: `package-test-vault.mjs`

**Features:**
- Packages entire test-vault directory as zip
- Excludes .DS_Store, debug logs, test artifacts
- Creates `obsidian-eln-test-vault.zip` in release/ folder
- Includes helpful installation instructions in output
- Warns about common user error (nested folders)

**Usage:**
```bash
npm run package-test-vault
```

### 3. Updated Build Scripts ✅

**File**: `package.json`

**Changes:**
- Added `package-test-vault` script
- Updated `publish` script to include test vault packaging
- Now runs: `npm run release && node package-assets.mjs && node package-test-vault.mjs && node publish-release.mjs`

**Result:**
- Single `npm run publish` command packages everything
- Plugin, assets, and test vault all uploaded to GitHub release

### 4. Updated Release Upload Script ✅

**File**: `publish-release.mjs`

**Changes:**
- Added test vault zip detection
- Uploads three files to GitHub release:
  1. `obsidian-eln-0.7.0-beta.1.zip` (plugin)
  2. `obsidian-eln-assets.zip` (optional assets)
  3. `obsidian-eln-test-vault.zip` (test vault)
- Shows which files will be uploaded before publishing

### 5. Updated README Installation Instructions ✅

**File**: `README.md`

**New Structure:**

**Method 1: Test Vault (Easiest)**
- Download test-vault.zip
- Extract and open in Obsidian
- **IMPORTANT WARNING**: Select folder with .obsidian directory
- Explains common unzip tool issue (nested folders)
- Pre-configured and ready to use

**Method 2: BRAT (For Existing Vaults)**
- ⚠️ Strong warning about beta risks
- Only for users who:
  - Have backups
  - Understand data loss risks
  - Comfortable troubleshooting
- Clear "Backup first!" instruction

**Method 3: Manual Installation**
- Download plugin zip
- Extract to vault's plugin folder
- Enable in settings

**Method 4: Install from Source**
- For developers
- Complete build instructions
- Copy files to vault

**Additional Information:**
- Assets package (optional for methods 2-4)
- Recommended companion plugins
- Requirements

### 6. Updated Release Notes ✅

**File**: `release.config.json`

**Changes:**
- Test vault as Method 1 (recommended for testing)
- Emphasizes "try it first" approach
- Clear warning about folder selection
- BRAT moved to Method 2 with stronger warnings
- Removed "performance optimization planned" (no longer planned)
- Shortened and clarified instructions

## Installation Methods Summary

### Method 1: Test Vault 🎯 **RECOMMENDED FOR FIRST-TIME USERS**

**Pros:**
- Zero setup required
- Safe (doesn't affect existing vaults)
- Includes examples
- Pre-configured
- Full visual experience with assets

**Cons:**
- Separate vault (not integrated with existing notes)
- Larger download

**Best for:**
- Trying plugin before committing
- Learning how it works
- Testing new features
- Creating proof of concept

### Method 2: BRAT ⚠️ **FOR EXPERIENCED USERS ONLY**

**Pros:**
- Auto-updates
- Easy to add to existing vault
- Active development tracking

**Cons:**
- Beta software risks
- Potential data loss/corruption
- Requires BRAT plugin
- Not suitable for production vaults

**Best for:**
- Beta testers
- Users with backups
- Those comfortable with risks
- Development tracking

### Method 3: Manual Installation 🔧 **FOR CONTROL**

**Pros:**
- No additional tools needed
- Manual update control
- Simple process

**Cons:**
- Manual updates required
- Still beta software risks
- Requires understanding of plugin folder structure

**Best for:**
- Users wanting manual control
- Those who prefer manual updates
- Simple integration needs

### Method 4: From Source 💻 **FOR DEVELOPERS**

**Pros:**
- Latest code
- Modification possible
- Development workflow

**Cons:**
- Requires build tools
- More complex setup
- Development environment needed

**Best for:**
- Developers
- Contributors
- Custom modifications

## Important User Experience Considerations

### 🚨 The Nested Folder Problem

**Problem:**
Many unzip tools create parent folder:
```
test-vault/           ← Outer folder (created by unzip tool)
  test-vault/         ← Inner folder (actual vault)
    .obsidian/        ← This is what Obsidian needs
    Experiments/
    Daily Notes/
    ...
```

**User mistake:**
Opening the outer `test-vault` folder instead of inner folder.

**Result:**
Obsidian doesn't recognize it as a vault (no .obsidian folder).

**Solution:**
- Clear warning in all documentation
- Visual cues: "Look for .obsidian directory"
- Explain what correct folder looks like
- Mention common unzip tool behavior

### ⚠️ Beta Software Warnings

**For BRAT installation:**
- Clear warning about risks
- Bullet list of requirements (backups, understanding risks)
- "Backup first!" emphasis
- Not recommended for production vaults

**Why:**
- Protect users from data loss
- Set appropriate expectations
- Reduce support burden
- Build trust through transparency

## Files Created/Modified

### Created
- `package-test-vault.mjs` - Test vault packaging script

### Modified
- `.gitignore` - Simplified, added test-vault-dev
- `package.json` - Added package-test-vault script, updated publish
- `publish-release.mjs` - Added test vault upload support
- `README.md` - Complete installation section rewrite
- `release.config.json` - Updated release notes with test vault

## Testing Checklist

Before release:
- [ ] Build plugin: `npm run build-fast`
- [ ] Package test vault: `npm run package-test-vault`
- [ ] Verify test-vault.zip contents
- [ ] Test extracting zip (check for nested folders)
- [ ] Open test vault in Obsidian
- [ ] Verify plugin works in test vault
- [ ] Check assets display correctly
- [ ] Verify example notes render properly

## Release Process

**Single command:**
```bash
npm run publish
```

**What happens:**
1. ✓ Builds plugin (npm run release)
2. ✓ Packages assets (node package-assets.mjs)
3. ✓ Packages test vault (node package-test-vault.mjs)
4. ✓ Creates git tag
5. ✓ Uploads all three zips to GitHub release
6. ✓ Marks as prerelease (beta)

**Result:**
Three downloadable files on GitHub release:
- `obsidian-eln-0.7.0-beta.1.zip` (required)
- `obsidian-eln-assets.zip` (optional)
- `obsidian-eln-test-vault.zip` (recommended for first-time users)

## User Journey

### Scenario 1: Curious User

1. Finds plugin on GitHub
2. Wants to try before installing in main vault
3. Downloads test-vault.zip
4. Extracts, opens in Obsidian
5. Explores example notes
6. Decides to install in main vault (BRAT or manual)

### Scenario 2: Experienced User

1. Already using Obsidian extensively
2. Has proper backups
3. Wants plugin in existing vault
4. Installs via BRAT for auto-updates
5. Downloads assets separately if needed

### Scenario 3: Cautious User

1. Reads beta warnings
2. Downloads test-vault to try safely
3. Tests thoroughly
4. Waits for stable release before installing in main vault

### Scenario 4: Developer

1. Clones repository
2. Builds from source
3. Contributes fixes/improvements
4. Uses test-vault-dev for development

## Benefits of This Approach

### For Users

- **Safe Testing**: Try without risk to existing vaults
- **Lower Barrier**: No setup required
- **Full Experience**: Includes examples and assets
- **Informed Decision**: See what plugin does before installing

### For Development

- **Better Feedback**: Users more likely to test thoroughly
- **Fewer Issues**: Test vault has known-good configuration
- **Documentation**: Examples serve as documentation
- **Support**: Easier to replicate reported issues

### For Project

- **Professional**: Multiple installation options
- **Accessible**: Easier for non-technical users
- **Transparent**: Clear about risks and limitations
- **Trust Building**: Honest about beta status

## Lessons Learned

### 1. User Error is Real

The nested folder issue is common enough to warrant prominent warnings. Users will open the wrong folder and report "vault doesn't work."

**Solution**: Clear visual cues and warnings everywhere.

### 2. Test Vault Lowers Barrier

Many users hesitant to install beta plugins in main vault. Test vault gives them safe way to explore.

**Solution**: Make test vault the recommended first step.

### 3. Clear Warnings Build Trust

Being honest about beta risks and data loss potential builds more trust than hiding it.

**Solution**: Prominent warnings with clear requirements.

### 4. Multiple Paths for Different Users

Different users have different needs:
- Testers want safe exploration
- Power users want auto-updates
- Developers want source access

**Solution**: Four methods, each optimized for different use case.

## Next Steps

### Before Release
1. Test test-vault packaging
2. Verify all three zips upload correctly
3. Test installation from each method
4. Check documentation links

### Post-Release
1. Monitor for "vault doesn't work" issues (likely nested folder problem)
2. Track which installation method is most popular
3. Gather feedback on test vault usefulness
4. Update based on user feedback

## Summary

**Problem**: Users hesitant to install beta plugin in main vaults  
**Solution**: Provide ready-to-use test vault as primary installation option  
**Implementation**: Package test-vault.zip, update docs, emphasize safety  
**Result**: Lower barrier to entry, safer testing, better user experience  

✅ **Ready for release with three installation packages!**
