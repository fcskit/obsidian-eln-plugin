# Sample Note FileName Template Explanation

## Overview

The sample note `fileName` template demonstrates the most complex use case in the PathEvaluator system, combining:
1. Settings lookups
2. Note metadata lookups  
3. Optional c### 3. **noteMetadata** Context
- **Purpose:** Read frontmatter from other notes in the vault
- **Type:** `NoteMetadataContext` (see `src/core/templates/ContextProviders.ts`)
- **Methods:**
  - `noteMetadata.get(nameOrPath)` - Get frontmatter by note name or path
    - Uses Obsidian's intelligent link resolution (`getFirstLinkpathDest()`)
    - Finds notes by basename (name without .md extension)
    - Handles aliases if configured
    - Works regardless of folder structure
  - `noteMetadata.query(filter)` - Query notes by criteria
- **Example:**
  ```javascript
  // Find project note by name (no path needed!)
  const projectMeta = noteMetadata.get("Quantum Batteries");
  // Finds: "Projects/research/Quantum Batteries/Quantum Batteries.md"
  
  // Access properties with optional chaining
  const abbreviation = projectMeta?.abbreviation || 'DEFAULT';
  ```

**Important:** 
- ✅ Use note name only: `noteMetadata.get("Project Name")`
- ❌ Don't hardcode paths: `noteMetadata.get("Projects/research/Project Name")`
- The method intelligently finds notes regardless of their folder location!ty
4. Fallback values

## Template Structure

```typescript
fileName: {
    segments: [
        // Segment 1: Operator initials from settings
        { 
            kind: "function", 
            context: ["settings", "userInput"], 
            expression: "settings.general.operators.find(op => op.name === userInput.sample?.operator)?.initials || 'XX'", 
            separator: "-" 
        },
        
        // Segment 2: Project abbreviation from project note metadata
        { 
            kind: "function", 
            context: ["noteMetadata", "userInput"], 
            expression: "noteMetadata.getMetadata(`Projects/${userInput.project?.name}`)?.abbreviation || 'PRJ'", 
            separator: "-" 
        },
        
        // Segment 3: Sample type abbreviation from settings
        { 
            kind: "function", 
            context: ["settings", "userInput"], 
            expression: "settings.note.sample.type.find(t => t.name === userInput.sample?.type)?.abbreviation || 'SMP'", 
            separator: "-" 
        },
        
        // Segment 4: Auto-incrementing counter
        { 
            kind: "counter", 
            prefix: "", 
            separator: "" 
        }
    ]
}
```

## Example Output

Given:
- Operator: "Anne Anybody" (initials: "AA")
- Project: "Quantum Batteries" (abbreviation: "QB")
- Sample type: "electrode" (abbreviation: "ELE")
- Counter: Next available = 42

**Result:** `AA-QB-ELE-042`

## Segment Breakdown

### Segment 1: Operator Initials

**Expression:**
```javascript
settings.general.operators.find(op => op.name === userInput.sample?.operator)?.initials || 'XX'
```

**Purpose:** Look up operator initials from settings

**Data Flow:**
1. User selects operator name (e.g., "Anne Anybody") → stored in `userInput.sample.operator`
2. Find matching operator in `settings.general.operators` array
3. Extract `initials` property (e.g., "AA")
4. Fall back to "XX" if operator not found

**Context Requirements:**
- `settings`: To access `settings.general.operators` (SettingsContext mirrors ELNSettings structure)
- `userInput`: To access `userInput.sample.operator`

**Safety Features:**
- `userInput.sample?.operator` - optional chaining if sample doesn't exist
- `?.initials` - optional chaining if operator not found
- `|| 'XX'` - fallback if result is undefined

---

### Segment 2: Project Abbreviation

**Expression:**
```javascript
noteMetadata.get(userInput.project?.name)?.project?.abbreviation || 'PRJ'
```

**Purpose:** Get project abbreviation from the project note's frontmatter

**Data Flow:**
1. User selects project name (e.g., "Quantum Batteries") → stored in `userInput.project.name`
2. Use Obsidian's link resolution to find the note: `noteMetadata.get("Quantum Batteries")`
   - Searches by basename (note name)
   - Handles aliases if configured
   - Finds note regardless of folder location
3. Access nested frontmatter: `project.abbreviation` (e.g., "QB")
4. Fall back to "PRJ" if note or abbreviation not found

**Context Requirements:**
- `noteMetadata`: To read other notes' frontmatter (uses `getFirstLinkpathDest()` internally)
- `userInput`: To access `userInput.project.name`

**Safety Features:**
- `userInput.project?.name` - optional chaining if project doesn't exist
- `?.project?.abbreviation` - optional chaining through nested frontmatter structure
- `|| 'PRJ'` - fallback if result is undefined

**Important:** This method uses Obsidian's intelligent link resolution, so it will find the project note regardless of its folder structure. You don't need to hardcode paths like `Projects/${type}/${name}` - just use the note name!

**Note:** The project note must have `abbreviation` nested under `project` in its frontmatter:
```yaml
---
project:
  abbreviation: QB
  name: Quantum Batteries
  type: research
---
```
**Example:**
```javascript
noteMetadata.get("Quantum Batteries")?.project?.abbreviation
// Obsidian finds: "Projects/research/Quantum Batteries/Quantum Batteries.md"
// Accesses nested frontmatter: metadata.project.abbreviation
// Returns: "QB"
```

---

### Segment 3: Sample Type Abbreviation

**Expression:**
```javascript
settings.note.sample.type.find(t => t.name === userInput.sample?.type)?.abbreviation || 'SMP'
```

**Purpose:** Look up sample type abbreviation from settings

**Data Flow:**
1. User selects sample type (e.g., "electrode") → stored in `userInput.sample.type`
2. Access nested setting: `settings.note.sample.type` (array)
3. Find matching type in array
4. Extract `abbreviation` property (e.g., "ELE")
5. Fall back to "SMP" if type not found

**Context Requirements:**
- `settings`: To access nested path `settings.note.sample.type` (SettingsContext mirrors ELNSettings structure)
- `userInput`: To access `userInput.sample.type`

**Sample Type Configuration:**
```typescript
type: [
    {
        name: "compound",
        abbreviation: "CPD",
        subClassMetadataTemplate: subClassMetadataTemplates.sample.compound,
    },
    {
        name: "electrode",
        abbreviation: "ELE",
        subClassMetadataTemplate: subClassMetadataTemplates.sample.electrode,
    },
    {
        name: "electrochemical cell",
        abbreviation: "CELL",
        subClassMetadataTemplate: subClassMetadataTemplates.sample["electrochemical cell"],
    }
]
```

**Safety Features:**
- `userInput.sample?.type` - optional chaining if sample doesn't exist
- `?.abbreviation` - optional chaining if type not found
- `|| 'SMP'` - fallback if result is undefined

---

### Segment 4: Auto-incrementing Counter

**Configuration:**
```typescript
{ kind: "counter", prefix: "", separator: "", width: 3 }
```

**Purpose:** Generate sequential numbers for unique sample IDs

**Data Flow:**
1. PathEvaluator scans the target folder
2. Finds existing files matching the prefix (AA-QB-ELE-)
3. Extracts highest number from matching files
4. Increments by 1
5. Pads to 3 digits with leading zeros

**Example:**
- Existing files: `AA-QB-ELE-001`, `AA-QB-ELE-002`, `AA-QB-ELE-005`
- Next counter value: `006`

**Parameters:**
- `prefix`: "" (no additional prefix before the number)
- `separator`: "" (no separator after the counter, as it's the last segment)
- `width`: 3 (zero-pad to 3 digits: 001, 002, 003, etc.)

---

## Context Types Used

### 1. **settings** Context
- **Purpose:** Safe read-only access to plugin settings
- **Type:** `SettingsContext` (see `src/core/templates/ContextProviders.ts`)
- **Structure:** Mirrors `ELNSettings` interface from `settings.ts`
  ```typescript
  settings.general.authors    // Array of author objects
  settings.general.operators  // Array of operator objects
  settings.note.sample.type   // Sample type configurations
  settings.note.chemical.type // Chemical type configurations
  settings.navbar.enabled     // Navbar enabled state
  settings.footer.enabled     // Footer enabled state
  ```
- **Method for Dynamic Paths:**
  - `settings.get(path)` - Get nested setting by dot-notation path
  - Example: `settings.get('note.sample.type')`

**Important:** 
- ✅ Use direct property access: `settings.general.operators`, `settings.note.sample.type`
- ✅ Or use get method: `settings.get('general.operators')`
- Both work, but direct access is more type-safe and consistent with the actual settings structure!

### 2. **userInput** Context
- **Purpose:** Access form data entered by user
- **Structure:** Nested object matching metadata template structure
- **Example:**
  ```javascript
  {
    sample: {
      operator: "Anne Anybody",
      type: "electrode"
    },
    project: {
      name: "Quantum Batteries"
    }
  }
  ```

### 3. **noteMetadata** Context
- **Purpose:** Read frontmatter from other notes
- **Type:** `NoteMetadataContext` (see `src/core/templates/ContextProviders.ts`)
- **Methods:**
  - `noteMetadata.get(path)` - Get frontmatter by file path (returns object or null)
  - `noteMetadata.query(filter)` - Query notes by criteria
- **Example:**
  ```javascript
  // Get project note frontmatter
  const projectMeta = noteMetadata.get(`Projects/${projectName}`);
  
  // Access properties with optional chaining
  const abbreviation = projectMeta?.abbreviation || 'DEFAULT';
  ```

**Important:** Use `noteMetadata.get()`, not `noteMetadata.getMetadata()`

---

## Migration from Legacy Format

### Old Format (Legacy)
```typescript
fileName: [
    { type: 'operator', field: "operators[sample.operator].initials", separator: "-" },
    { type: 'project', field: "projects[project.name].abbreviation", separator: "-" },
    { type: 'setting', field: "note.sample.type[sample.type].abbreviation", separator: "" },
    { type: 'index', field: "03", separator: "" },
]
```

**Problems:**
- Special types (`operator`, `project`, `setting`) required custom parsing logic
- Bracket notation syntax was fragile and hard to extend
- No type safety or validation
- No way to add fallback values

### New Format (PathTemplate)
```typescript
fileName: {
    segments: [
        { kind: "function", context: ["settings", "userInput"], expression: "...", separator: "-" },
        { kind: "function", context: ["noteMetadata", "userInput"], expression: "...", separator: "-" },
        { kind: "function", context: ["settings", "userInput"], expression: "...", separator: "-" },
        { kind: "counter", prefix: "", separator: "" }
    ]
}
```

**Benefits:**
- ✅ Type-safe context system
- ✅ Standard JavaScript expressions
- ✅ Optional chaining and fallback values
- ✅ Clear separation of concerns
- ✅ Extensible context types
- ✅ No special parsing logic needed

---

## Testing

### Test in Obsidian Console

```javascript
// Setup
const plugin = app.plugins.plugins['obsidian-eln'];
const evaluator = new plugin.PathEvaluator(plugin);

// Mock data
const userInput = {
    sample: { operator: "Anne Anybody", type: "electrode" },
    project: { name: "Quantum Batteries" }
};

// Evaluate
const result = await evaluator.evaluatePath(
    plugin.settings.note.sample.fileName,
    { plugin, userInput, targetFolder: "Experiments/Samples/Quantum Batteries/electrode" }
);

console.log("Expected: AA-QB-ELE-01 (or next counter)");
console.log("Actual:  ", result);
```

### Expected Behaviors

**Success Case:**
- Operator "Anne Anybody" exists → "AA"
- Project note "Projects/Quantum Batteries" has `abbreviation: QB` → "QB"
- Sample type "electrode" has `abbreviation: "ELE"` → "ELE"
- Counter finds no existing samples → "01"
- **Result:** `AA-QB-ELE-01`

**Fallback Case 1: Missing Operator**
- Operator "Unknown Person" doesn't exist → "XX"
- **Result:** `XX-QB-ELE-01`

**Fallback Case 2: Missing Project Note**
- Project note doesn't exist → "PRJ"
- **Result:** `AA-PRJ-ELE-01`

**Fallback Case 3: Missing Sample Type**
- Sample type "unknown" not in settings → "SMP"
- **Result:** `AA-QB-SMP-01`

**Fallback Case 4: All Missing**
- All lookups fail → defaults used
- **Result:** `XX-PRJ-SMP-01`

---

## Adding Abbreviations to Projects

Project notes should include an `abbreviation` field in frontmatter:

```yaml
---
name: Quantum Batteries
type: research
abbreviation: QB
status: active
start date: 2026-01-15
---
```

This abbreviation is then read by the sample fileName template via `noteMetadata.getMetadata()`.

---

## Best Practices

1. **Always use optional chaining** (`?.`) when accessing nested properties
2. **Always provide fallback values** (`|| 'DEFAULT'`) for robustness
3. **Keep expressions readable** - complex logic should be documented
4. **Test with missing data** - ensure fallbacks work correctly
5. **Use descriptive fallback values** - "XX", "PRJ", "SMP" indicate what failed

---

## Related Files

- Template definition: `src/settings/settings.ts` (line ~791)
- Type definitions: `src/types/templates.ts`
- Evaluator implementation: `src/core/templates/PathEvaluator.ts`
- Context providers: `src/core/templates/ContextProviders.ts`
- Function evaluator: `src/core/templates/FunctionEvaluator.ts`
