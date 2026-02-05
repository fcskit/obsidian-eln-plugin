# BRAT Beta Installation

## What is BRAT?

[BRAT (Beta Reviewers Auto-update Tester)](https://github.com/TfTHacker/obsidian42-brat) is an Obsidian plugin that makes it easy to install and test beta versions of plugins directly from GitHub repositories.

## Installing ELN Plugin via BRAT

### Step 1: Install BRAT

1. Open Obsidian Settings → Community plugins
2. Search for "BRAT"
3. Install and enable BRAT

### Step 2: Add ELN Plugin Beta

1. Open Obsidian command palette (`Ctrl/Cmd+P`)
2. Type "BRAT: Add a beta plugin for testing"
3. Enter this repository URL:
   ```
   fcskit/obsidian-eln-plugin
   ```
4. Click "Add Plugin"
5. BRAT will install the latest beta release

### Step 3: Enable the Plugin

1. Go to Settings → Community plugins
2. Find "Electronic Lab Notebook" in the list
3. Toggle it on
4. Start using the plugin!

## Benefits of BRAT

- ✅ **Easy Installation** - No manual file copying
- ✅ **Auto Updates** - BRAT checks for new beta releases
- ✅ **Quick Testing** - Try latest features immediately
- ✅ **Easy Uninstall** - Remove like any community plugin

## Updating to New Beta Versions

BRAT will automatically check for updates. You can also manually update:

1. Open command palette (`Ctrl/Cmd+P`)
2. Type "BRAT: Check for updates"
3. BRAT will update all beta plugins

## Switching to Stable Release (Future)

Once the plugin is in the Community Plugin Store:

1. Uninstall via BRAT
2. Install from Community Plugin Store
3. Your data and settings will be preserved

## Troubleshooting

### BRAT can't find the plugin

- Make sure you entered the repository URL correctly: `fcskit/obsidian-eln-plugin`
- Check that you have the latest version of BRAT
- Verify your internet connection

### Plugin doesn't appear after installation

- Restart Obsidian
- Check Settings → Community plugins to enable it
- Look for error messages in the console (Ctrl/Cmd+Shift+I)

### Updates not working

- Run "BRAT: Check for updates" manually
- Check BRAT settings for update frequency
- Verify the repository URL is correct in BRAT settings

## Manual Installation (Alternative)

If you prefer not to use BRAT, you can still install manually:

1. Download `obsidian-eln-X.X.X-beta.X.zip` from [GitHub Releases](https://github.com/fcskit/obsidian-eln-plugin/releases)
2. Extract to `.obsidian/plugins/obsidian-eln/`
3. Enable in Settings → Community plugins

## Support

- Report issues: [GitHub Issues](https://github.com/fcskit/obsidian-eln-plugin/issues)
- Ask questions: [GitHub Discussions](https://github.com/fcskit/obsidian-eln-plugin/discussions)
- Check docs: [README](https://github.com/fcskit/obsidian-eln-plugin/blob/main/README.md)
