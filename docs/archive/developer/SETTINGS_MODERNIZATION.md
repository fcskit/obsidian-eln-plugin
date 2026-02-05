# Settings System Modernization

This document describes the modernized settings system for the Obsidian ELN plugin, implemented as part of the refactoring effort to improve maintainability, extensibility, and type safety.

## Overview

The settings system has been completely restructured to provide:

- **Nested organization**: Settings are grouped into logical sections
- **Type safety**: Full TypeScript support with proper interfaces
- **Extensibility**: Generic components for easy addition of new features
- **User-friendly UI**: Modern modal dialogs and improved settings interface
- **Maintainability**: Clean separation of concerns and consistent patterns

## Settings Structure

### New Organization

The settings are now organized into four main sections:

```typescript
interface ELNSettings {
    general: GeneralConfig;     // Authors, operators, global settings
    navbar: NavbarConfig;       // Navigation bar configuration
    footer: FooterConfig;       // Footer display options
    note: NoteConfigs;          // Per-note-type configurations
}
```

### Migration from Old Structure

| Old Setting | New Location |
|-------------|-------------|
| `authors` | `general.authors` |
| `operators` | `general.operators` |
| `navbarEnabled` | `navbar.enabled` |
| `navbarGroups` | `navbar.groups` |
| `footerEnabled` | `footer.enabled` |
| `footerIncludeVersion` | `footer.includeVersion` |
| `footerIncludeAuthor` | `footer.includeAuthor` |
| Individual note settings | `note[noteType].*` |

### New Footer Options

Added support for additional footer information:
- `footer.includeMtime`: Show modification time
- `footer.includeCtime`: Show creation time

## Note Type Configuration

### Generic Note Settings

All note types now use a consistent `BaseNoteConfig` structure:

```typescript
interface BaseNoteConfig {
    navbar: NoteNavbarConfig;
    commands: NoteCommandConfig;
    titleTemplate: PathTemplate;
    folderTemplate: PathTemplate;
    customMetadataTemplate: boolean;
    customMarkdownTemplate: boolean;
    customMetadataTemplatePath: string;
    customMarkdownTemplatePath: string;
    metadataTemplate: MetaDataTemplate;
    markdownTemplate: string;
    [key: string]: unknown;  // For note-specific extensions
}
```

### Built-in Note Types

- `analysis`: Analysis notes with status tracking
- `chemical`: Chemical information with suppliers/manufacturers
- `dailyNote`: Daily laboratory notes
- `device`: Laboratory devices with type classification
- `instrument`: Scientific instruments
- `meeting`: Meeting notes with type categorization
- `process`: Process documentation with class/type
- `project`: Project management with type tracking
- `sample`: Sample tracking with type classification
- `sampleList`: Sample list management
- `default`: Default configuration template

### Custom Note Types

Users can now add custom note types through the settings UI:

1. Go to Settings → Note Settings
2. Click "Manage Note Types"
3. Add new note type with custom ID and display name
4. Configure all settings through the generic interface

## Modal Dialogs

### Template Editors

#### Path Template Editor (`PathTemplateEditorModal`)
- Edit title and folder templates
- Add/remove/reorder template elements
- Configure element types (string, dateField, userInput, index)
- Set field values and separators

#### Metadata Template Editor (`MetadataTemplateEditorModal`)
- Configure metadata fields
- Set input types (text, number, date, dropdown, etc.)
- Configure default values and query settings
- Add/remove fields dynamically

### Array Management

#### Array Editor (`ArrayEditorModal`)
- Generic editor for arrays of objects
- Automatically detects field types
- Supports nested properties
- Add/edit/remove items with validation

### File Selection

#### File Picker (`FilePickerModal`)
- Browse vault files by extension
- Manual path entry
- Real-time file filtering
- Template file selection

### Note Type Management

#### Note Type Manager (`NoteTypeManagerModal`)
- Add custom note types
- Enable/disable note types
- Delete custom types (built-in types protected)
- Bulk management interface

## User Interface Improvements

### Settings Tab Enhancements

- **Collapsible sections**: Each note type has its own expandable section
- **Organized layout**: Settings grouped by function (navbar, commands, templates)
- **Edit buttons**: Complex settings open in dedicated modals
- **Live updates**: Changes saved immediately with visual feedback

### CSS Styling

Added comprehensive styling for:
- Modal dialogs with proper layout and spacing
- Form controls with consistent appearance
- Collapsible sections with hover effects
- File browser with selection highlighting
- Array editors with item management

## API Usage

### Accessing Settings

```typescript
// Old way
const authors = plugin.settings.authors;
const navbarEnabled = plugin.settings.navbarEnabled;

// New way
const authors = plugin.settings.general.authors;
const navbarEnabled = plugin.settings.navbar.enabled;
```

### Working with Note Configurations

```typescript
// Get note configuration
const projectConfig = plugin.settings.note.project;

// Check if note type exists
const hasCustomType = 'customExperiment' in plugin.settings.note;

// Iterate through note types
Object.entries(plugin.settings.note).forEach(([type, config]) => {
    console.log(`Note type: ${type}`, config);
});
```

### Using Modals Programmatically

```typescript
// Open path template editor
new PathTemplateEditorModal(
    app,
    currentTemplate,
    (updatedTemplate) => {
        // Handle template update
        config.titleTemplate = updatedTemplate;
        plugin.saveSettings();
    },
    "Edit Title Template"
).open();
```

## Implementation Details

### Type Safety

- Full TypeScript interfaces for all settings
- Index signatures for dynamic note type access
- Proper generic types for reusable components
- Compile-time validation of setting paths

### Error Handling

- Graceful fallbacks for missing settings
- Validation before applying changes
- User-friendly error messages
- Rollback capabilities in modals

### Performance

- Deep cloning for modal editing (no accidental mutations)
- Efficient re-rendering only when needed
- Lazy loading of modal content
- Minimal DOM manipulation

## Future Enhancements

### Planned Features

1. **Advanced template editing**: Syntax highlighting and validation
2. **Setting import/export**: Backup and share configurations
3. **Template marketplace**: Share templates between users
4. **Advanced validation**: Real-time field validation
5. **Search and filtering**: Find settings quickly in large configurations

### Extension Points

The system is designed for easy extension:

- Add new modal types by extending base modal classes
- Create custom field editors for complex data types
- Implement setting validation rules
- Add setting migration utilities

## Troubleshooting

### Common Issues

1. **Settings not saving**: Check for TypeScript errors in console
2. **Modal not opening**: Verify proper modal instantiation
3. **Template errors**: Use template editor for syntax validation
4. **Custom note types missing**: Check if properly added through manager

### Migration Guide

If upgrading from older versions:

1. Settings will be automatically migrated on first load
2. Check that all custom configurations are preserved
3. Verify navbar and footer settings work as expected
4. Test note creation with updated templates

## Code Examples

### Adding a Custom Field Type

```typescript
// Extend MetaDataTemplateField for new input types
interface CustomField extends MetaDataTemplateField {
    inputType: "custom" | MetaDataTemplateField["inputType"];
    customConfig?: {
        validation: string;
        format: string;
    };
}
```

### Creating a Custom Modal

```typescript
export class CustomEditorModal extends Modal {
    constructor(app: App, data: CustomData, onSave: (data: CustomData) => void) {
        super(app);
        // Implementation
    }
    
    onOpen(): void {
        // Modal setup
    }
}
```

This modernized settings system provides a solid foundation for future development while maintaining backward compatibility and improving the user experience.
