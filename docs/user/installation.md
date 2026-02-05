# Installation & Setup

This guide will help you install and configure the Obsidian ELN Plugin for the first time.

## Prerequisites

- **Obsidian**: Version 1.0 or higher
- **Basic Obsidian Knowledge**: Familiarity with Obsidian's interface and basic features

## Installation

> **⚠️ Beta Status**: This plugin is currently in beta development and is not yet available through the Obsidian Community Plugin Store. Please use one of the installation methods below.

### Option 1: BRAT Plugin (Recommended for Beta Testing)

The easiest way to install and keep the plugin updated during beta is using the BRAT (Beta Reviewer's Auto-update Tool) plugin:

1. First, install the BRAT plugin:
   - Go to **Settings** → **Community plugins**
   - Click **Browse** and search for "BRAT"
   - Install and enable the "Obsidian 42 - BRAT" plugin

2. Install the ELN Plugin via BRAT:
   - Open the command palette (`Ctrl/Cmd + P`)
   - Run "BRAT: Add a beta plugin for testing"
   - Enter the repository URL: `fcskit/obsidian-eln-plugin`
   - Click **Add Plugin**
   - Enable the "ELN Plugin" in **Settings** → **Community plugins**

3. Benefits of using BRAT:
   - Automatic updates when new beta versions are released
   - Easy access to latest features and bug fixes
   - Simple uninstallation if needed

### Option 2: Manual Installation (Advanced Users)

For users who prefer manual installation or want to install a specific version:

1. Download the latest release from [GitHub Releases](https://github.com/fcskit/obsidian-eln-plugin/releases)
2. Extract the zip file to your vault's `.obsidian/plugins/` folder
3. The folder structure should be: `.obsidian/plugins/obsidian-eln-plugin/`
4. Restart Obsidian
5. Go to **Settings** → **Community plugins** and enable "ELN Plugin"

### Option 3: Community Plugin Store (Future Release)

*This option will be available once the plugin exits beta and is published to the community store.*

1. Open Obsidian
2. Go to **Settings** → **Community plugins**
3. Click **Browse** and search for "ELN" or "Electronic Lab Notebook"
4. Click **Install** on the "Obsidian ELN Plugin"
5. Click **Enable** to activate the plugin

## Initial Configuration

### 1. Basic Settings

1. Go to **Settings** → **ELN Plugin**
2. Configure the following basic settings:

#### Author Information
- **Default Author**: Your name (used in new notes)
- **Author Email**: Your email address (optional)
- **Institution**: Your organization or institution (optional)

#### Note Creation
- **Default Note Location**: Folder where new ELN notes are created
- **Note Naming Convention**: How new notes should be named
- **Auto-generate IDs**: Whether to automatically generate unique IDs for notes

### 2. Template Configuration

The plugin comes with several built-in templates. You can:

- **Use Default Templates**: Ready-to-use templates for common lab scenarios
- **Customize Templates**: Modify existing templates to match your workflow
- **Create New Templates**: Build custom templates from scratch

See the [Template System Guide](template-system.md) for detailed information.

### 3. Dashboard Setup (Optional)

Configure the dashboard to track your lab work:

1. Enable **Dashboard Feature** in settings
2. Set **Dashboard Location**: Where to create/update your dashboard
3. Choose **Tracking Options**: What metrics to display

## Verification

Test your installation by creating your first note:

1. Use the command palette (`Ctrl/Cmd + P`)
2. Search for "ELN: Create Note"
3. Select a template (try "Basic Experiment")
4. Fill in the metadata form
5. Click "Create Note"

If everything works correctly, you should have a new note with structured metadata in your specified location.

## Next Steps

Once installation is complete:

1. **Explore Templates**: Try different built-in templates
2. **Read the Template Guide**: Learn how to customize templates
3. **Check Examples**: Review template examples for ideas
4. **Join the Community**: Ask questions and share feedback

## Troubleshooting

### Plugin Not Loading
- Check that all files were extracted correctly
- Restart Obsidian completely
- Verify the plugin is enabled in Community plugins

### Templates Not Working
- Check that template files are in the correct location
- Verify JSON syntax in custom templates
- Review the browser console for error messages

### Performance Issues
- Reduce the number of active templates
- Check for conflicts with other plugins
- Review vault size and complexity

## Getting Help

- **Documentation**: Check the [User Guide](README.md)
- **GitHub Issues**: Report bugs or request features
- **Community Forum**: Ask questions and get help from other users

## Related Guides

- [Template System Guide](template-system.md) - Learn about creating and customizing templates
- [Features Overview](features.md) - Explore all plugin capabilities
- [Template Examples](template-examples/) - Ready-to-use template examples
