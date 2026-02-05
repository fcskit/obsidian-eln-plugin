# Template System Architecture Diagram

## Overview Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Creates Note                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NewNoteModal                                │
│  - Shows metadata fields (showInModal: true)                     │
│  - Collects user input                                           │
│  - Live preview of fileName/folderPath                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ userInput (FormData)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NoteCreator                                 │
│  - Receives note template + user input                           │
│  - Calls PathEvaluator for fileName & folderPath                │
│  - Creates file with metadata & markdown                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PathEvaluator                               │
│  - Evaluates PathTemplate.segments in order                      │
│  - Calls ContextFactory for safe context objects                │
│  - Evaluates each segment type                                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
┌──────────────────┐            ┌──────────────────┐
│ Literal Segment  │            │  Field Segment   │
│ - Returns value  │            │ - Extract value  │
└──────────────────┘            │ - Apply transform│
                                └──────────────────┘
          │                               │
          └───────────────┬───────────────┘
                          │
                          ▼
                ┌──────────────────┐
                │ Function Segment │
                │ - Get contexts   │
                │ - Evaluate expr  │
                └─────────┬────────┘
                          │
                          ▼
                ┌──────────────────┐
                │ ContextFactory   │
                └──────────────────┘
```

## Context Provider Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      ContextFactory                             │
│                                                                 │
│  Creates safe, read-only interfaces for function evaluation    │
└────────────────────┬───────────────────────────────────────────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Plugin   │  │ Settings │  │    FS    │
│ Context  │  │ Context  │  │ Context  │
└──────────┘  └──────────┘  └──────────┘
      │              │              │
      │              │              │
      ▼              ▼              ▼
┌──────────────────────────────────────┐
│ version: string                      │
│ manifest: { ... }                    │
│                                      │
│ ❌ No access to:                     │
│    - plugin.app                      │
│    - plugin.vault                    │
│    - plugin.settings (writable)     │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ authors: Array<{ ... }>              │
│ operators: Array<{ ... }>            │
│ get(path: string): unknown           │
│                                      │
│ ❌ No direct modification            │
│ ✅ Safe nested access                │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ listFiles(filter): ReadonlyArray     │
│ getNextCounter(prefix, width): str   │
│ fileExists(path): boolean            │
│                                      │
│ ❌ No write operations               │
│ ❌ No delete operations              │
│ ✅ Read-only queries                 │
└──────────────────────────────────────┘
```

## Segment Evaluation Flow

```
Input: PathTemplate = {
    segments: [
        { kind: "literal", value: "Experiments/Samples", separator: "/" },
        { kind: "field", path: "userInput.project.name", separator: "/" },
        { kind: "function", context: ["settings", "userInput"], 
          expression: "settings.operators[userInput.operator].initials", separator: "-" },
        { kind: "counter", width: 3, separator: "" }
    ]
}

Step 1: Literal Segment
├─ Returns: "Experiments/Samples"
└─ Appends separator: "/"
   Result: "Experiments/Samples/"

Step 2: Field Segment
├─ Extract: userInput.project.name → "MyProject"
└─ Appends separator: "/"
   Result: "Experiments/Samples/MyProject/"

Step 3: Function Segment
├─ Check dependencies: ✅ (if reactiveDeps specified)
├─ Get contexts:
│  ├─ settings → SettingsContext { operators: [...] }
│  └─ userInput → { operator: 0, ... }
├─ Evaluate: settings.operators[userInput.operator].initials
│  └─ Returns: "AA"
└─ Appends separator: "-"
   Result: "Experiments/Samples/MyProject/AA-"

Step 4: Counter Segment
├─ Get FileSystemContext
├─ Call: fs.getNextCounter("MyProject/AA-", 3)
│  └─ Returns: "001"
└─ No separator
   Result: "Experiments/Samples/MyProject/AA-001"

Final Output: "Experiments/Samples/MyProject/AA-001"
```

## Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                        Function Evaluation                       │
│                                                                  │
│  User writes:                                                    │
│    expression: "settings.operators[userInput.operator].initials" │
│                                                                  │
│  Runtime execution:                                              │
│    const func = new Function(                                    │
│        'settings',                                               │
│        'userInput',                                              │
│        'return settings.operators[userInput.operator].initials'  │
│    );                                                            │
│                                                                  │
│    const result = func(                                          │
│        settingsContext,  // ← Safe interface                     │
│        userInput         // ← Read-only                          │
│    );                                                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    What User CAN Access                          │
│                                                                  │
│  ✅ settings.operators[0].initials                               │
│  ✅ settings.get("general.authors")                              │
│  ✅ userInput.project.name                                       │
│  ✅ fs.listFiles({ startsWith: "prefix" })                       │
│  ✅ fs.getNextCounter("prefix", 3)                               │
│  ✅ plugin.version                                               │
│  ✅ noteMetadata.get("SomeNote.md")                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   What User CANNOT Access                        │
│                                                                  │
│  ❌ plugin.app.vault.delete(...)                                 │
│  ❌ plugin.settings.general.authors = [...]                      │
│  ❌ fs.writeFile(...)                                            │
│  ❌ settings.modifyOperators(...)                                │
│  ❌ userInput.project = null  (read-only at runtime)             │
└─────────────────────────────────────────────────────────────────┘
```

## Comparison: Old vs New

### Old System (Broken)

```
titleTemplate: [
    { 
        type: 'userInput',
        field: "sample.name",    // ❌ Ambiguous path
        separator: "-"
    }
]

Evaluation:
├─ Parser doesn't know what "userInput" means
├─ "field" contains partial path without context
└─ No type safety, no validation
   Result: ❌ Broken
```

### New System (Working)

```
fileName: {
    segments: [
        { 
            kind: "field",             // ✅ Clear segment type
            path: "userInput.sample.name",  // ✅ Full qualified path
            separator: "-"
        }
    ]
}

Evaluation:
├─ PathEvaluator knows this is a field segment
├─ Extracts value from userInput.sample.name
├─ Type-safe, validated
└─ Clear semantics
   Result: ✅ Works correctly
```

## Data Flow Example

```
User Input (Modal):
┌─────────────────────────────┐
│ Project: MyProject          │
│ Sample Type: compound       │
│ Operator: Anne Anybody (0)  │
└─────────────────────────────┘
                │
                ▼
FormData:
{
    project: { name: "MyProject" },
    sample: { type: "compound" },
    operator: 0
}
                │
                ▼
Template:
fileName: {
    segments: [
        {
            kind: "function",
            context: ["settings", "userInput"],
            expression: "settings.operators[userInput.operator].initials",
            separator: "-"
        },
        {
            kind: "field",
            path: "userInput.project.name",
            transform: "lowercase",
            separator: "-"
        },
        {
            kind: "field",
            path: "userInput.sample.type",
            separator: ""
        },
        {
            kind: "counter",
            width: 3
        }
    ]
}
                │
                ▼
PathEvaluator processes:
├─ Function → "AA"
├─ Field → "myproject"
├─ Field → "compound"
└─ Counter → "001"
                │
                ▼
Result: "AA-myproject-compound001"
                │
                ▼
NoteCreator:
Creates file: "Experiments/Samples/AA-myproject-compound001.md"
```

## Template Inheritance (Phase 3)

```
Base Template: sample
┌──────────────────────────────────────┐
│ fileName: { segments: [...] }        │
│ folderPath: { segments: [...] }      │
│ metadata: {                          │
│   sample.name: { ... }               │
│   sample.type: { ... }               │
│ }                                    │
└──────────────────────────────────────┘
                │
                ▼ User selects subclass: "compound"
                │
Subclass Template: compound
┌──────────────────────────────────────┐
│ metadata: {                          │
│   extend: [                          │
│     { path: "sample.formula", ... }, │
│     { path: "sample.molar_mass", ...}│
│   ],                                 │
│   override: {                        │
│     "sample.type": { options: [...] }│
│   }                                  │
│ }                                    │
└──────────────────────────────────────┘
                │
                ▼ Merge
                │
Final Template
┌──────────────────────────────────────┐
│ fileName: { segments: [...] }        │ ← from base
│ folderPath: { segments: [...] }      │ ← from base
│ metadata: {                          │
│   sample.name: { ... }               │ ← from base
│   sample.type: { options: [...] }    │ ← overridden
│   sample.formula: { ... }            │ ← extended
│   sample.molar_mass: { ... }         │ ← extended
│ }                                    │
└──────────────────────────────────────┘
```

## Migration Strategy

```
Phase 1: Foundation (2-3 weeks)
├─ ContextProviders (week 1)
├─ PathEvaluator (week 1)
├─ Key renames (week 2)
└─ Integration & testing (week 3)

Phase 2: Templates (1-2 weeks)
├─ Convert all templates
├─ Update settings
└─ Documentation

Phase 3: Advanced (2-3 weeks)
├─ Subclass system
├─ Import/export
└─ Validation

Total: 5-8 weeks for complete migration
```
