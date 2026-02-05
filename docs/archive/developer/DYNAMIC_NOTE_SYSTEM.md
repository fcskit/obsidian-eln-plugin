# Dynamic Note Creation System

## Overview

The Obsidian ELN plugin has been refactored to use a dynamic, settings-driven approach for note creation and navbar configuration. This allows users to customize note types and their organization without code changes.

## Key Changes

### 1. Settings-Driven Configuration

- **Navbar Groups**: Defined in `settings.navbarGroups` - configure how note types are grouped in the navigation bar
- **Note Type UI Config**: Defined in `settings.noteTypeUIConfig` - controls visibility, grouping, and command configuration for each note type

### 2. Dynamic Command Registration

The `newNoteCommands.ts` now dynamically registers commands based on settings:

```typescript
// Old static approach:
plugin.addCommand({
    id: "create-chemical-note",
    name: "Create Chemical Note",
    // ...
});

// New dynamic approach:
Object.entries(plugin.settings.noteTypeUIConfig).forEach(([noteType, config]) => {
    if (config.enabled) {
        plugin.addCommand({
            id: config.commandId,
            name: config.commandName,
            // ...
        });
    }
});
```

### 3. Dynamic Navbar Generation

The navbar now generates menus dynamically based on settings:

- Groups note types by their `navbarGroup` setting
- Only shows enabled note types that have `showInNavbar: true`
- Sorts groups by their `order` property
- Uses the unified `NewNote` class for all note creation

### 4. Configuration Schema

#### Navbar Groups
```typescript
interface NavbarGroup {
    id: string;        // Unique identifier
    name: string;      // Display name in navbar
    order: number;     // Sort order
}
```

#### Note Type UI Configuration
```typescript
interface NoteTypeUIConfig {
    enabled: boolean;       // Whether the note type is active
    displayName: string;    // Human-readable name
    navbarGroup: string;    // Which navbar group to place this in
    showInNavbar: boolean;  // Whether to show in navbar menu
    commandId: string;      // Unique command ID
    commandName: string;    // Command palette display name
}
```

## Usage Examples

### Adding a New Note Type

To add a new note type, you only need to:

1. Add the note type configuration to settings:
```typescript
noteTypeUIConfig: {
    // ...existing types...
    "lab-equipment": {
        enabled: true,
        displayName: "Lab Equipment",
        navbarGroup: "resources",
        showInNavbar: true,
        commandId: "create-lab-equipment-note",
        commandName: "Create Lab Equipment Note"
    }
}
```

2. Add the corresponding note configuration in `settings.note`:
```typescript
note: {
    // ...existing note types...
    "lab-equipment": {
        titleTemplate: [...],
        folderTemplate: [...],
        metadataTemplate: labEquipmentTemplate,
        markdownTemplate: labEquipmentMarkdown,
        // ...other settings...
    }
}
```

### Creating a New Navbar Group

```typescript
navbarGroups: [
    // ...existing groups...
    { id: "administration", name: "Administration", order: 4 }
]
```

Then assign note types to this group:
```typescript
noteTypeUIConfig: {
    "admin-note": {
        enabled: true,
        displayName: "Admin Note",
        navbarGroup: "administration",
        showInNavbar: true,
        commandId: "create-admin-note",
        commandName: "Create Admin Note"
    }
}
```

## Benefits

1. **Extensibility**: Users can add new note types without modifying source code
2. **Customization**: Full control over which note types appear where
3. **Maintainability**: Centralized configuration reduces code duplication
4. **User Experience**: Dynamic generation ensures UI stays in sync with settings

## Migration Notes

- Legacy modal classes are now deprecated in favor of the unified `NewNote` class
- All note creation goes through the same pipeline: `NewNote` → `TemplateEvaluator` → `MetadataProcessor` → `NoteCreator`
- Existing note types continue to work with no user-facing changes
- Settings structure is backward compatible
