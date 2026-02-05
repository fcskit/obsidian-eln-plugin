# Template Context API Reference

This document provides a comprehensive reference for all context objects available in template function expressions.

**Location:** These interfaces are defined in `src/core/templates/ContextProviders.ts`

## Table of Contents
1. [Settings Context](#settings-context)
2. [User Input Context](#user-input-context)
3. [Note Metadata Context](#note-metadata-context)
4. [Date Context](#date-context)
5. [File System Context](#file-system-context)
6. [Vault Context](#vault-context)
7. [Plugin Context](#plugin-context)
8. [Subclasses Context](#subclasses-context)

---

## Settings Context

**Type:** `SettingsContext`

**Purpose:** Safe read-only access to plugin settings

**Structure:** Mirrors the `ELNSettings` interface structure from `settings.ts`

### Direct Property Access

```typescript
settings.general.authors: Array<{ name: string; initials: string }>
settings.general.operators: Array<{ name: string; initials: string }>
settings.note: { [noteType: string]: unknown }
settings.navbar.enabled: boolean
settings.navbar.groups: Array<{ id: string; name: string; order: number }>
settings.footer.enabled: boolean
settings.footer.includeVersion: boolean
settings.footer.includeAuthor: boolean
settings.footer.includeMtime: boolean
settings.footer.includeCtime: boolean
```

**Examples:**
```javascript
// Access general settings
settings.general.operators.find(op => op.name === "Anne Anybody")?.initials
// Returns: "AA"

settings.general.authors[0].name
// Returns: "Anne Anybody"

// Access note settings
settings.note.sample.type.find(t => t.name === "electrode")?.abbreviation
// Returns: "ELE"

// Access navbar settings
settings.navbar.enabled
// Returns: true or false

settings.navbar.groups.find(g => g.id === "resources")?.name
// Returns: "Resources"

// Access footer settings
settings.footer.includeVersion
// Returns: true or false
```

### Method: get()

```typescript
settings.get(path: string): unknown
```

Get any nested setting using dot-notation path (convenience method).

**Examples:**
```javascript
// Get note configuration (same as settings.note.sample.type)
settings.get('note.sample.type')
// Returns: [{ name: "compound", abbreviation: "CPD", ... }, ...]

// Get navbar groups (same as settings.navbar.groups)
settings.get('navbar.groups')
// Returns: [{ id: "resources", name: "Resources", order: 1 }, ...]

// Get footer settings (same as settings.footer.enabled)
settings.get('footer.enabled')
// Returns: true or false
```

### Best Practice

✅ **Prefer direct property access** for better type safety and code clarity:
```javascript
// Good - type-safe, clear structure
settings.general.operators.find(op => op.name === name)?.initials
settings.note.sample.type.find(t => t.name === type)?.abbreviation

// Also valid - using get() method
settings.get('general.operators').find(op => op.name === name)?.initials
```

The `SettingsContext` structure matches `ELNSettings` from `settings.ts`, making it consistent and predictable.

---

## User Input Context

**Type:** `Record<string, unknown>`

**Purpose:** Access form data entered by the user in note creation dialogs

### Structure

Nested object matching the metadata template structure.

**Example:**
```javascript
{
  sample: {
    operator: "Anne Anybody",
    type: "electrode",
    name: "Sample 1"
  },
  project: {
    name: "Quantum Batteries"
  },
  chemical: {
    name: "Lithium",
    type: "metal"
  }
}
```

### Usage with Optional Chaining

Always use optional chaining (`?.`) to safely access nested properties:

```javascript
// ✅ Safe - won't crash if sample doesn't exist
userInput.sample?.operator

// ✅ Safe - multiple levels
userInput.analysis?.sample?.name

// ❌ Unsafe - will crash if sample is undefined
userInput.sample.operator
```

---

## Note Metadata Context

**Type:** `NoteMetadataContext`

**Purpose:** Read frontmatter from other notes in the vault

### Method: get()

```typescript
noteMetadata.get(noteNameOrPath: string): Record<string, unknown> | null
```

Get frontmatter from a specific note by name or path.

**Uses Obsidian's intelligent link resolution** (`getFirstLinkpathDest()`):
- Finds notes by basename (name without .md extension)
- Handles aliases if configured in note frontmatter
- Works regardless of folder structure
- Falls back to exact path matching if link resolution fails

**Examples:**
```javascript
// Get by note name (recommended - works anywhere!)
noteMetadata.get("Quantum Batteries")?.project?.abbreviation
// Finds: "Projects/research/Quantum Batteries/Quantum Batteries.md"
// Returns: "QB" (from nested project.abbreviation in frontmatter)

// Also works with nested folders
noteMetadata.get("My Project")?.project?.name
// Finds note wherever it is in the vault

// Get by full path (also works)
noteMetadata.get("Projects/research/Quantum Batteries/Quantum Batteries")?.project?.title

// Access deeply nested properties
noteMetadata.get("Experiments/Sample-01")?.sample?.composition?.binder
```

**Returns:** Metadata object or `null` if note not found

### Method: query()

```typescript
noteMetadata.query(filter: {
  noteType?: string;
  folder?: string;
  tag?: string;
}): Array<Record<string, unknown>>
```

Query multiple notes by criteria.

**Examples:**
```javascript
// Find all project notes
noteMetadata.query({ noteType: "project" })

// Find notes in a folder
noteMetadata.query({ folder: "Experiments/Samples" })

// Find notes with a tag
noteMetadata.query({ tag: "electrochemistry" })
```

### Important Notes

✅ **Recommended:** Use note name only (no folder path)
```javascript
noteMetadata.get("Project Name")?.project?.abbreviation
```

❌ **Avoid:** Hardcoding folder paths
```javascript
noteMetadata.get("Projects/research/Project Name")?.project?.abbreviation
```

**Why?** Obsidian's link resolution is smart:
- It finds notes by name regardless of location
- It respects aliases defined in frontmatter
- It handles renamed/moved files automatically
- Your templates work even if folder structure changes!

**Important:** Remember that frontmatter properties may be nested. For example, project notes store data under `project.abbreviation`, not directly as `abbreviation`. Always use the correct path based on your metadata template structure.

---

## Date Context

**Type:** `DateContext`

**Purpose:** Date formatting and manipulation using moment.js

### Available Methods

```typescript
date.format(format: string): string
date.year(): number
date.month(): number
date.monthName(): string
date.day(): number
date.weekday(): number
date.weekdayName(): string
date.hour(): number
date.minute(): number
date.second(): number
```

### Usage Examples

```javascript
// Current date in YYYY-MM-DD format
date.format('YYYY-MM-DD')
// Returns: "2025-01-20"

// Custom format
date.format('DD.MM.YYYY HH:mm')
// Returns: "20.01.2025 14:30"

// Year and month for folder structure
`${date.year()}/${date.month()} ${date.monthName()}`
// Returns: "2025/01 January"

// Full date string
`${date.weekdayName()}, ${date.day()}. ${date.monthName()}`
// Returns: "Monday, 20. January"
```

### Moment.js Format Tokens

| Token | Output | Description |
|-------|--------|-------------|
| `YYYY` | 2025 | 4-digit year |
| `YY` | 25 | 2-digit year |
| `MM` | 01 | Month (01-12) |
| `M` | 1 | Month (1-12) |
| `DD` | 20 | Day of month (01-31) |
| `D` | 20 | Day of month (1-31) |
| `HH` | 14 | Hour (00-23) |
| `mm` | 30 | Minute (00-59) |
| `ss` | 45 | Second (00-59) |

---

## File System Context

**Type:** `FileSystemContext`

**Purpose:** Limited read-only file system operations

### Method: listFiles()

```typescript
fs.listFiles(filter?: {
  startsWith?: string;
  noteType?: string;
  folder?: string;
}): Array<{ name: string; basename: string; path: string }>
```

**Examples:**
```javascript
// List all files starting with "Sample"
fs.listFiles({ startsWith: "Sample" })

// List files in a folder
fs.listFiles({ folder: "Experiments/Samples" })

// List files of a specific note type
fs.listFiles({ noteType: "chemical" })
```

### Method: getNextCounter()

```typescript
fs.getNextCounter(prefix: string, width?: number): string
```

Get the next available counter for files with a specific prefix.

**Examples:**
```javascript
// Get next counter for "Sample-" files
fs.getNextCounter("Sample-", 2)
// If files exist: Sample-01, Sample-02, Sample-05
// Returns: "06"

// With custom width
fs.getNextCounter("EXP-", 4)
// Returns: "0001", "0002", etc.
```

### Method: fileExists()

```typescript
fs.fileExists(path: string): boolean
```

Check if a file exists.

**Example:**
```javascript
fs.fileExists("Projects/Quantum Batteries.md")
// Returns: true or false
```

### Method: folderExists()

```typescript
fs.folderExists(path: string): boolean
```

Check if a folder exists.

**Example:**
```javascript
fs.folderExists("Experiments/Samples")
// Returns: true or false
```

### Method: getFilesInFolder()

```typescript
fs.getFilesInFolder(folderPath: string): Array<{
  name: string;
  basename: string;
  path: string;
}>
```

Get all files in a specific folder.

**Example:**
```javascript
fs.getFilesInFolder("Experiments/Samples")
// Returns array of file metadata objects
```

### Method: getFoldersInFolder()

```typescript
fs.getFoldersInFolder(folderPath: string): string[]
```

Get all subfolders within a folder.

**Example:**
```javascript
fs.getFoldersInFolder("Projects")
// Returns: ["Projects/Research", "Projects/Development", ...]
```

---

## Vault Context

**Type:** `VaultContext`

**Purpose:** Read-only vault-wide operations

### Method: getAllTags()

```typescript
vault.getAllTags(): string[]
```

Get all unique tags in the vault (without # prefix).

**Example:**
```javascript
vault.getAllTags()
// Returns: ["electrochemistry", "synthesis", "analysis", ...]
```

### Method: getNotesWithTag()

```typescript
vault.getNotesWithTag(tag: string): Array<{
  name: string;
  path: string;
}>
```

Get notes that have a specific tag.

**Example:**
```javascript
vault.getNotesWithTag("electrochemistry")
// Returns array of notes with #electrochemistry tag
```

### Method: getFolders()

```typescript
vault.getFolders(): string[]
```

Get all folders in the vault.

**Example:**
```javascript
vault.getFolders()
// Returns: ["Projects", "Experiments", "Resources", ...]
```

---

## Plugin Context

**Type:** `PluginContext`

**Purpose:** Read-only plugin metadata

### Properties

```typescript
plugin.version: string
plugin.manifest: {
  version: string;
  id: string;
  name: string;
}
```

**Examples:**
```javascript
// Plugin version
plugin.version
// Returns: "0.7.0"

// Manifest info
plugin.manifest.name
// Returns: "obsidian-eln"
```

---

## Subclasses Context

**Type:** `SubclassContext`

**Purpose:** Access merged metadata from class/subclass templates

### Method: getField()

```typescript
subclasses.getField(path: string): unknown
```

Get a field value from the merged metadata template.

**Example:**
```javascript
// Get a field from merged template
subclasses.getField("chemical.type")
```

**Note:** This context is primarily used internally for metadata processing and is less commonly needed in fileName/folderPath templates.

---

## Common Patterns

### Safe Property Access

Always use optional chaining when accessing nested properties:

```javascript
// ✅ Good
userInput.sample?.operator
noteMetadata.get(path)?.abbreviation
settings.operators.find(op => op.name === name)?.initials

// ❌ Bad - will crash if undefined
userInput.sample.operator
noteMetadata.get(path).abbreviation
```

### Fallback Values

Always provide fallback values using `||`:

```javascript
// ✅ Good
noteMetadata.get(path)?.abbreviation || 'DEFAULT'
settings.get('note.sample.type').find(t => t.name === type)?.abbreviation || 'SMP'

// ❌ Bad - will use undefined if missing
noteMetadata.get(path)?.abbreviation
```

### Array Operations

Use `.find()` for lookups in arrays:

```javascript
// Find operator by name
settings.operators.find(op => op.name === userInput.sample?.operator)?.initials || 'XX'

// Find sample type by name
settings.get('note.sample.type').find(t => t.name === userInput.sample?.type)?.abbreviation || 'SMP'
```

### Complex Expressions

Break down complex logic into multiple segments:

```javascript
// ✅ Good - multiple segments
{
  segments: [
    { kind: "function", expression: "settings.operators.find(...)?.initials || 'XX'" },
    { kind: "function", expression: "noteMetadata.get(...)?.abbreviation || 'PRJ'" },
    { kind: "counter" }
  ]
}

// ❌ Bad - one giant expression
{
  segments: [
    { kind: "function", expression: "settings.operators.find(...) + '-' + noteMetadata.get(...) + ..." }
  ]
}
```

---

## Testing in Console

You can test expressions in the Obsidian Developer Console:

```javascript
// Get the plugin instance
const plugin = app.plugins.plugins['obsidian-eln'];

// Create test contexts (import ContextProviders if not in scope)
const { ContextProviders } = plugin.constructor;
const providers = new ContextProviders(plugin);
const settings = providers.createSettingsContext();
const noteMetadata = providers.createNoteMetadataContext();

// Test settings access - both methods work
settings.general.operators.find(op => op.name === "Anne Anybody")?.initials
// Should return: "AA"

settings.note.sample.type.find(t => t.name === "electrode")?.abbreviation
// Should return: "ELE"

// Test note metadata - uses intelligent link resolution
noteMetadata.get("Test Project")?.project?.abbreviation
// Finds project note by name, returns abbreviation from nested frontmatter or undefined

// Test with project name from your vault
noteMetadata.get("Quantum Batteries")?.project?.abbreviation
// Should find the project regardless of folder structure
// Accesses project.abbreviation from frontmatter
```

---

## See Also

- [Sample FileName Template Explained](./sample-filename-template-explained.md) - Detailed walkthrough of complex template
- [ContextProviders.ts](../../src/core/templates/ContextProviders.ts) - Source code for all context interfaces
- [PathEvaluator.ts](../../src/core/templates/PathEvaluator.ts) - Template evaluation engine
