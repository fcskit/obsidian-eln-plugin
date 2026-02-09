# Settings Migration System

**Status**: Planned  
**Priority**: High (Critical for v0.8.x stability)  
**Target Version**: v0.8.1  
**Estimated Effort**: 1-2 weeks  
**Created**: February 9, 2026

## Overview

Implement a settings versioning and migration system to safely update user settings when the plugin structure changes across versions. This prevents data loss and ensures backward compatibility when settings schemas evolve.

## Problem Statement

### Current Behavior

1. **Initial State**: Plugin uses `DEFAULT_SETTINGS` from code
2. **After User Edits**: Obsidian creates `.obsidian/plugins/obsidian-eln-plugin/data.json`
3. **Settings Loading**: `Object.assign({}, DEFAULT_SETTINGS, await this.loadData())`
4. **Problem**: When plugin updates change settings structure, `data.json` retains old structure

### Critical Issues

**Issue 1: Missing New Settings**
- User has `data.json` from v0.7.0
- Plugin v0.8.0 adds new settings (e.g., `note.sample.status: string[]`)
- User's `data.json` doesn't have `note.sample.status`
- Result: New feature doesn't work, setting is `undefined`

**Issue 2: Renamed/Restructured Settings**
- v0.7.0 structure: `note.process.class: string`
- v0.8.0 structure: `note.process.classification: { primary: string; secondary: string }`
- User's `data.json` still has old `class` property
- Result: Settings panel may error, old structure used

**Issue 3: Removed Settings**
- Old settings remain in `data.json` forever
- Bloats file size
- May cause confusion or unexpected behavior

**Issue 4: Type Changes**
- v0.7.0: `general.authors: string[]`
- v0.8.0: `general.authors: { name: string; initials: string }[]`
- User's `data.json` has old array of strings
- Result: Type errors, crashes, data corruption

## Proposed Solution

### 1. Add Settings Version Tracking

Add version field to `ELNSettings` interface:

```typescript
export interface ELNSettings {
    _version: string; // Semantic version of settings schema
    _migrated?: boolean; // Flag indicating migration occurred
    general: GeneralConfig;
    navbar: NavbarConfig;
    // ... rest of settings
}
```

Update `DEFAULT_SETTINGS`:

```typescript
export const DEFAULT_SETTINGS: ELNSettings = {
    _version: "0.8.0", // Current settings schema version
    _migrated: false,
    general: {
        // ...
    },
    // ...
};
```

### 2. Implement Migration System

Create `src/settings/migration.ts`:

```typescript
import { ELNSettings } from "./settings";

export interface SettingsMigration {
    from: string;    // Source version
    to: string;      // Target version
    migrate: (settings: any) => Partial<ELNSettings>;
    description: string;
}

export const SETTINGS_MIGRATIONS: SettingsMigration[] = [
    {
        from: "0.7.0",
        to: "0.8.0",
        description: "Add sample.status field and restructure process.class",
        migrate: (oldSettings: any) => {
            const migrated: any = { ...oldSettings };
            
            // Add new sample.status field
            if (migrated.note?.sample && !migrated.note.sample.status) {
                migrated.note.sample.status = ["planned", "in-progress", "complete"];
            }
            
            // Restructure process.class -> process.classification
            if (migrated.note?.process?.class) {
                migrated.note.process.classification = {
                    primary: migrated.note.process.class,
                    secondary: ""
                };
                delete migrated.note.process.class;
            }
            
            return migrated;
        }
    },
    // Future migrations added here
];

export function migrateSettings(
    loadedSettings: any,
    currentVersion: string
): ELNSettings {
    const loadedVersion = loadedSettings._version || "0.7.0"; // Pre-versioning era
    
    if (loadedVersion === currentVersion) {
        return loadedSettings as ELNSettings;
    }
    
    let settings = { ...loadedSettings };
    
    // Apply migrations in order
    for (const migration of SETTINGS_MIGRATIONS) {
        if (shouldApplyMigration(loadedVersion, currentVersion, migration)) {
            console.log(`Applying settings migration: ${migration.from} -> ${migration.to}`);
            console.log(`  ${migration.description}`);
            settings = { ...settings, ...migration.migrate(settings) };
        }
    }
    
    // Update version and set migration flag
    settings._version = currentVersion;
    settings._migrated = loadedVersion !== currentVersion;
    
    return settings as ELNSettings;
}

function shouldApplyMigration(
    loadedVersion: string,
    currentVersion: string,
    migration: SettingsMigration
): boolean {
    // Simple version comparison (assumes semantic versioning)
    return compareVersions(loadedVersion, migration.from) <= 0 &&
           compareVersions(currentVersion, migration.to) >= 0;
}

function compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 !== p2) return p1 - p2;
    }
    return 0;
}
```

### 3. Update Settings Loading in main.ts

```typescript
import { DEFAULT_SETTINGS } from "./settings/settings";
import { migrateSettings } from "./settings/migration";

export default class ELNPlugin extends Plugin {
    settings: ELNSettings;

    async onload() {
        // Load settings with migration
        const loadedData = await this.loadData();
        
        if (loadedData) {
            // Migrate if needed
            this.settings = migrateSettings(
                loadedData,
                DEFAULT_SETTINGS._version
            );
            
            // Save migrated settings
            if (this.settings._migrated) {
                await this.saveData(this.settings);
                console.log("Settings migrated and saved");
            }
        } else {
            // First time load
            this.settings = { ...DEFAULT_SETTINGS };
        }
        
        // ... rest of onload
    }
}
```

### 4. Deep Merge Strategy

For complex nested objects, implement deep merge instead of shallow `Object.assign`:

```typescript
function deepMergeSettings(
    defaults: ELNSettings,
    loaded: Partial<ELNSettings>
): ELNSettings {
    const merged = { ...defaults };
    
    for (const key in loaded) {
        if (typeof loaded[key] === 'object' && !Array.isArray(loaded[key])) {
            merged[key] = deepMergeSettings(merged[key], loaded[key]);
        } else {
            merged[key] = loaded[key];
        }
    }
    
    return merged;
}
```

## Implementation Plan

### Phase 1: Infrastructure (Days 1-3)
- [ ] Add `_version` and `_migrated` to `ELNSettings` interface
- [ ] Update `DEFAULT_SETTINGS` with version "0.8.0"
- [ ] Create `src/settings/migration.ts` with migration framework
- [ ] Implement version comparison utilities
- [ ] Add deep merge utility for settings

### Phase 2: Migration Logic (Days 4-6)
- [ ] Create migration for 0.7.0 → 0.8.0 (add sample.status, etc.)
- [ ] Update `main.ts` to use `migrateSettings()`
- [ ] Add logging for migration events
- [ ] Test migration with various old data.json files

### Phase 3: Testing (Days 7-8)
- [ ] Create test suite for migration system
- [ ] Test with real v0.7.0 data.json
- [ ] Test with missing settings
- [ ] Test with corrupted settings
- [ ] Test with future version (should not migrate)
- [ ] Test performance with large settings files

### Phase 4: Documentation (Days 9-10)
- [ ] Document migration system in developer docs
- [ ] Create guide for adding new migrations
- [ ] Add user-facing migration notes to release notes
- [ ] Update CONTRIBUTING.md with settings change guidelines

## Migration Examples

### Example 1: Adding New Field

```typescript
{
    from: "0.8.0",
    to: "0.8.1",
    description: "Add sample.status field",
    migrate: (settings: any) => {
        if (settings.note?.sample && !settings.note.sample.status) {
            settings.note.sample.status = ["planned", "in-progress", "complete"];
        }
        return settings;
    }
}
```

### Example 2: Renaming Field

```typescript
{
    from: "0.8.0",
    to: "0.8.1",
    description: "Rename process.class to process.classification",
    migrate: (settings: any) => {
        if (settings.note?.process?.class) {
            settings.note.process.classification = {
                primary: settings.note.process.class,
                secondary: ""
            };
            delete settings.note.process.class;
        }
        return settings;
    }
}
```

### Example 3: Changing Type

```typescript
{
    from: "0.8.0",
    to: "0.8.1",
    description: "Convert authors from string[] to {name,initials}[]",
    migrate: (settings: any) => {
        if (Array.isArray(settings.general?.authors)) {
            settings.general.authors = settings.general.authors.map((name: string) => ({
                name: name,
                initials: name.split(' ').map(w => w[0]).join('')
            }));
        }
        return settings;
    }
}
```

## User Communication

### Release Notes Template

```markdown
### Settings Migration (v0.8.1)

**Automatic Migration**: This version includes automatic settings migration. Your existing settings will be preserved and updated to the new format.

**What Changed:**
- Added `sample.status` field for tracking sample progress
- Restructured `process.class` to `process.classification`
- Enhanced `general.authors` with initials support

**Action Required:** None - migration happens automatically on first load.

**Backup:** A backup of your old settings is automatically created at `.obsidian/plugins/obsidian-eln-plugin/data.json.backup`
```

## Success Criteria

- [ ] Settings version tracked in `_version` field
- [ ] Migration system handles all v0.7.0 → v0.8.0 changes
- [ ] No user data loss during migration
- [ ] Clear logging of migration events
- [ ] Comprehensive test coverage (>90%)
- [ ] Documentation for future migration additions
- [ ] Backup mechanism for safety
- [ ] Performance impact < 100ms for typical settings

## Dependencies

- None (can start immediately)
- Should be completed before any major settings restructuring

## Risks and Mitigation

**Risk 1: Migration Corrupts Settings**
- Mitigation: Always create backup before migration
- Mitigation: Validate migrated settings before saving
- Mitigation: Comprehensive testing with real user data

**Risk 2: Performance Impact**
- Mitigation: Run migrations only once per version
- Mitigation: Cache migration results
- Mitigation: Keep migrations simple and fast

**Risk 3: Complex Migration Chain**
- Mitigation: Document each migration clearly
- Mitigation: Test migration chains (0.7.0 → 0.8.0 → 0.9.0)
- Mitigation: Consider max-jump migrations for major versions

## Future Enhancements

### v0.8.2+: Advanced Features
- Settings validation schema (JSON Schema)
- Settings UI shows migration status
- Manual settings export/import
- Settings diff viewer (show what changed)
- Rollback mechanism if migration fails

### v0.9.0+: User Control
- User can trigger re-migration
- User can reset specific settings to defaults
- Settings comparison between versions
- Migration dry-run mode (preview changes)

## Related Documentation

- **[Type Safety Improvements](../public/TYPE-SAFETY-IMPROVEMENTS.md)** - Related type system work
- **[Settings API](../../core/settings-api.md)** - Settings system architecture
- **[Contributing Guide](../../contributing/contributing.md)** - How to add migrations

## Notes

- **Critical for v0.8.x**: Must implement before any breaking settings changes
- **User Impact**: High - prevents data loss and confusion
- **Complexity**: Medium - well-understood pattern from other plugins
- **Testing Priority**: High - must test with real user data
