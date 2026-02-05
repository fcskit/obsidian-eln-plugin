# Manual Testing Guide for PathEvaluator in Obsidian Console

**Date**: January 20, 2026  
**Purpose**: Test PathEvaluator and FunctionEvaluator directly in Obsidian Developer Console  
**Estimated Time**: 15-20 minutes

## Prerequisites

1. ✅ Plugin built with: `npm run build-fast`
2. ✅ Plugin loaded in Obsidian test-vault
3. ✅ Developer Console open (Cmd+Option+I on Mac, Ctrl+Shift+I on Windows/Linux)

---

## Step 1: Get Plugin Instance and Import Classes

First, we need to get the plugin instance and import the required classes.

```javascript
// Get the plugin instance
const plugin = app.plugins.plugins['obsidian-eln'];
console.log("Plugin loaded:", !!plugin);
console.log("Plugin version:", plugin.manifest.version);
```

**Expected Output**: Should show `Plugin loaded: true` and version number.

---

## Step 2: Import PathEvaluator (Temporary - for testing)

Since PathEvaluator isn't exported yet, we need to temporarily add it. For now, let's test using the compiled code structure.

```javascript
// Check if we can access the plugin's internals
console.log("Plugin methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(plugin)));
console.log("Plugin properties:", Object.keys(plugin));
```

**Note**: PathEvaluator needs to be exported for direct testing. Let's proceed with the integration approach instead.

---

## Alternative: Test via Note Creation (Recommended)

Since PathEvaluator will be used internally by NoteCreator, let's test the note creation flow:

### Test 1: Create a Chemical Note

```javascript
// Open the command palette and run "Create Chemical Note"
// Or use the navbar button for Chemical

// Check the generated file name and path
const activeFile = app.workspace.getActiveFile();
if (activeFile) {
    console.log("Created file:", activeFile.path);
    console.log("File name:", activeFile.name);
    console.log("Parent folder:", activeFile.parent.path);
}
```

### Test 2: Check Legacy PathTemplateParser (Current System)

```javascript
// Get a note config
const chemicalConfig = plugin.settings.note.chemical;
console.log("Chemical fileName template:", chemicalConfig.fileName);
console.log("Chemical folderPath template:", chemicalConfig.folderPath);

// This shows the LEGACY format we're replacing
```

---

## Step 3: Export PathEvaluator for Testing

To enable direct testing, we need to export PathEvaluator from main.ts.

### Add to src/main.ts:

Add these imports at the top:
```typescript
import { PathEvaluator } from "./core/templates/PathEvaluator";
import { FunctionEvaluator } from "./core/templates/FunctionEvaluator";
```

Add public properties to ElnPlugin class:
```typescript
export default class ElnPlugin extends Plugin {
    public app!: App;
    public settings!: ELNSettings;
    public lastActiveFile: TFile | null = null;
    
    // Add these for testing
    public PathEvaluator = PathEvaluator;
    public FunctionEvaluator = FunctionEvaluator;
    
    // ... rest of class
}
```

Then rebuild:
```bash
npm run build-fast
```

And reload Obsidian (Ctrl+R or Cmd+R).

---

## Step 4: Direct PathEvaluator Tests (After Export)

Once PathEvaluator is exported, run these tests in console:

### Test A: Simple Field Extraction

```javascript
// Get plugin
const plugin = app.plugins.plugins['obsidian-eln'];

// Create evaluator instance
const evaluator = new plugin.PathEvaluator(plugin);

// Test 1: Simple chemical name
const template1 = {
    segments: [
        { kind: "field", path: "chemical.name", separator: "" }
    ]
};

const userInput1 = {
    chemical: { name: "Sodium Chloride" }
};

const result1 = await evaluator.evaluatePath(template1, {
    plugin: plugin,
    userInput: userInput1,
    targetFolder: ""
});

console.log("Test 1 - Simple field extraction");
console.log("Expected: 'Sodium Chloride'");
console.log("Actual:  ", result1);
console.log("✅ PASS" + (result1 === "Sodium Chloride" ? " ✓" : " ✗"));
```

### Test B: Literal + Field Combination

```javascript
const template2 = {
    segments: [
        { kind: "literal", value: "Resources", separator: "/" },
        { kind: "literal", value: "Chemicals", separator: "/" },
        { kind: "field", path: "chemical.type", separator: "" }
    ]
};

const userInput2 = {
    chemical: { type: "Salt" }
};

const result2 = await evaluator.evaluatePath(template2, {
    plugin: plugin,
    userInput: userInput2,
    targetFolder: ""
});

console.log("\nTest 2 - Literal + Field");
console.log("Expected: 'Resources/Chemicals/Salt'");
console.log("Actual:  ", result2);
console.log("✅ PASS" + (result2 === "Resources/Chemicals/Salt" ? " ✓" : " ✗"));
```

### Test C: Field Transformation (Uppercase)

```javascript
const template3 = {
    segments: [
        { kind: "field", path: "project.code", transform: "uppercase", separator: "" }
    ]
};

const userInput3 = {
    project: { code: "abc-123" }
};

const result3 = await evaluator.evaluatePath(template3, {
    plugin: plugin,
    userInput: userInput3,
    targetFolder: ""
});

console.log("\nTest 3 - Uppercase transformation");
console.log("Expected: 'ABC-123'");
console.log("Actual:  ", result3);
console.log("✅ PASS" + (result3 === "ABC-123" ? " ✓" : " ✗"));
```

### Test D: Kebab-case Transformation

```javascript
const template4 = {
    segments: [
        { kind: "field", path: "project.name", transform: "kebab-case", separator: "" }
    ]
};

const userInput4 = {
    project: { name: "My Cool Project 2026!" }
};

const result4 = await evaluator.evaluatePath(template4, {
    plugin: plugin,
    userInput: userInput4,
    targetFolder: ""
});

console.log("\nTest 4 - Kebab-case transformation");
console.log("Expected: 'my-cool-project-2026'");
console.log("Actual:  ", result4);
console.log("✅ PASS" + (result4 === "my-cool-project-2026" ? " ✓" : " ✗"));
```

### Test E: Date Context Function

```javascript
const template5 = {
    segments: [
        {
            kind: "function",
            context: ["date"],
            expression: "date.format('YYYY-MM-DD')",
            separator: ""
        }
    ]
};

const userInput5 = {};

const result5 = await evaluator.evaluatePath(template5, {
    plugin: plugin,
    userInput: userInput5,
    targetFolder: ""
});

console.log("\nTest 5 - Date context function");
console.log("Expected: (today's date in YYYY-MM-DD format)");
console.log("Actual:  ", result5);
console.log("Format valid:", /^\d{4}-\d{2}-\d{2}$/.test(result5) ? " ✓" : " ✗");
```

### Test F: Multiple Date Functions

```javascript
const template6 = {
    segments: [
        { kind: "literal", value: "Daily Notes", separator: "/" },
        {
            kind: "function",
            context: ["date"],
            expression: "date.year()",
            separator: "/"
        },
        {
            kind: "function",
            context: ["date"],
            expression: "date.month()",
            separator: " "
        },
        {
            kind: "function",
            context: ["date"],
            expression: "date.monthName()",
            separator: ""
        }
    ]
};

const result6 = await evaluator.evaluatePath(template6, {
    plugin: plugin,
    userInput: {},
    targetFolder: ""
});

console.log("\nTest 6 - Daily note folder path");
console.log("Expected: 'Daily Notes/2026/01 January' (for Jan 2026)");
console.log("Actual:  ", result6);
console.log("Contains 'Daily Notes':", result6.includes("Daily Notes") ? " ✓" : " ✗");
```

### Test G: Nested Field Access

```javascript
const template7 = {
    segments: [
        { kind: "field", path: "experiment.setup.instrument.name", separator: "_" },
        { kind: "field", path: "experiment.setup.method", separator: "" }
    ]
};

const userInput7 = {
    experiment: {
        setup: {
            instrument: { name: "XRD-500" },
            method: "Powder"
        }
    }
};

const result7 = await evaluator.evaluatePath(template7, {
    plugin: plugin,
    userInput: userInput7,
    targetFolder: ""
});

console.log("\nTest 7 - Nested field access");
console.log("Expected: 'XRD-500_Powder'");
console.log("Actual:  ", result7);
console.log("✅ PASS" + (result7 === "XRD-500_Powder" ? " ✓" : " ✗"));
```

### Test H: Counter Segment (requires folder)

```javascript
// First create a test folder
await app.vault.createFolder("TestFolder").catch(() => {});

// Create some test files
await app.vault.create("TestFolder/TEST-001.md", "").catch(() => {});
await app.vault.create("TestFolder/TEST-002.md", "").catch(() => {});

const template8 = {
    segments: [
        { kind: "literal", value: "TEST-", separator: "" },
        { kind: "counter", prefix: "TEST-", width: 3, separator: "" }
    ]
};

const result8 = await evaluator.evaluatePath(template8, {
    plugin: plugin,
    userInput: {},
    targetFolder: "TestFolder"
});

console.log("\nTest 8 - Counter with prefix");
console.log("Expected: 'TEST-003' (if TEST-001 and TEST-002 exist)");
console.log("Actual:  ", result8);
console.log("Format valid:", /^TEST-\d{3}$/.test(result8) ? " ✓" : " ✗");

// Cleanup
await app.vault.delete(app.vault.getAbstractFileByPath("TestFolder/TEST-001.md"));
await app.vault.delete(app.vault.getAbstractFileByPath("TestFolder/TEST-002.md"));
```

### Test I: Settings Context (Operator Initials)

```javascript
const template9 = {
    segments: [
        { kind: "literal", value: "EXP-", separator: "" },
        {
            kind: "function",
            context: ["settings", "userInput"],
            expression: "settings.operators.find(op => op.name === userInput.operator)?.initials || 'XX'",
            separator: ""
        }
    ]
};

// Check available operators
console.log("Available operators:", plugin.settings.general.operators);

const userInput9 = {
    operator: plugin.settings.general.operators[0]?.name || "Unknown"
};

const result9 = await evaluator.evaluatePath(template9, {
    plugin: plugin,
    userInput: userInput9,
    targetFolder: ""
});

console.log("\nTest 9 - Settings context (operator initials)");
console.log("Expected: 'EXP-' + (operator initials)");
console.log("Actual:  ", result9);
console.log("Format valid:", /^EXP-[A-Z]{2}$/.test(result9) ? " ✓" : " ✗");
```

### Test J: Complex Arrow Function

```javascript
const template10 = {
    segments: [
        {
            kind: "function",
            function: "({ userInput }) => userInput.sample?.type === 'powder' ? 'PWD' : 'LIQ'",
            separator: "-"
        },
        { kind: "field", path: "sample.id", separator: "" }
    ]
};

const userInput10a = {
    sample: { type: "powder", id: "123" }
};

const result10a = await evaluator.evaluatePath(template10, {
    plugin: plugin,
    userInput: userInput10a,
    targetFolder: ""
});

console.log("\nTest 10a - Complex arrow function (powder)");
console.log("Expected: 'PWD-123'");
console.log("Actual:  ", result10a);
console.log("✅ PASS" + (result10a === "PWD-123" ? " ✓" : " ✗"));

// Test liquid
const userInput10b = {
    sample: { type: "liquid", id: "456" }
};

const result10b = await evaluator.evaluatePath(template10, {
    plugin: plugin,
    userInput: userInput10b,
    targetFolder: ""
});

console.log("\nTest 10b - Complex arrow function (liquid)");
console.log("Expected: 'LIQ-456'");
console.log("Actual:  ", result10b);
console.log("✅ PASS" + (result10b === "LIQ-456" ? " ✓" : " ✗"));
```

---

## Step 5: Run All Tests at Once

Copy and paste this complete test suite:

```javascript
// Complete Test Suite
async function runAllTests() {
    const plugin = app.plugins.plugins['obsidian-eln'];
    if (!plugin) {
        console.error("❌ Plugin not found!");
        return;
    }
    
    const evaluator = new plugin.PathEvaluator(plugin);
    let passed = 0;
    let failed = 0;
    
    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║          PATH EVALUATOR MANUAL TEST SUITE                      ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");
    
    // Test 1: Simple field
    try {
        const result = await evaluator.evaluatePath(
            { segments: [{ kind: "field", path: "chemical.name", separator: "" }] },
            { plugin, userInput: { chemical: { name: "Sodium Chloride" } }, targetFolder: "" }
        );
        if (result === "Sodium Chloride") {
            console.log("✅ Test 1: Simple field - PASS");
            passed++;
        } else {
            console.log(`❌ Test 1: Simple field - FAIL (got: ${result})`);
            failed++;
        }
    } catch (e) {
        console.log(`❌ Test 1: Simple field - ERROR: ${e.message}`);
        failed++;
    }
    
    // Test 2: Transformation
    try {
        const result = await evaluator.evaluatePath(
            { segments: [{ kind: "field", path: "project.code", transform: "uppercase", separator: "" }] },
            { plugin, userInput: { project: { code: "abc" } }, targetFolder: "" }
        );
        if (result === "ABC") {
            console.log("✅ Test 2: Uppercase transform - PASS");
            passed++;
        } else {
            console.log(`❌ Test 2: Uppercase transform - FAIL (got: ${result})`);
            failed++;
        }
    } catch (e) {
        console.log(`❌ Test 2: Uppercase transform - ERROR: ${e.message}`);
        failed++;
    }
    
    // Test 3: Kebab-case
    try {
        const result = await evaluator.evaluatePath(
            { segments: [{ kind: "field", path: "name", transform: "kebab-case", separator: "" }] },
            { plugin, userInput: { name: "My Cool Project!" }, targetFolder: "" }
        );
        if (result === "my-cool-project") {
            console.log("✅ Test 3: Kebab-case - PASS");
            passed++;
        } else {
            console.log(`❌ Test 3: Kebab-case - FAIL (got: ${result})`);
            failed++;
        }
    } catch (e) {
        console.log(`❌ Test 3: Kebab-case - ERROR: ${e.message}`);
        failed++;
    }
    
    // Test 4: Date function
    try {
        const result = await evaluator.evaluatePath(
            { segments: [{ kind: "function", context: ["date"], expression: "date.year()", separator: "" }] },
            { plugin, userInput: {}, targetFolder: "" }
        );
        if (result === "2026") {
            console.log("✅ Test 4: Date function - PASS");
            passed++;
        } else {
            console.log(`❌ Test 4: Date function - FAIL (got: ${result})`);
            failed++;
        }
    } catch (e) {
        console.log(`❌ Test 4: Date function - ERROR: ${e.message}`);
        failed++;
    }
    
    // Test 5: Nested fields
    try {
        const result = await evaluator.evaluatePath(
            { segments: [
                { kind: "field", path: "a.b.c", separator: "_" },
                { kind: "field", path: "a.b.d", separator: "" }
            ]},
            { plugin, userInput: { a: { b: { c: "X", d: "Y" } } }, targetFolder: "" }
        );
        if (result === "X_Y") {
            console.log("✅ Test 5: Nested fields - PASS");
            passed++;
        } else {
            console.log(`❌ Test 5: Nested fields - FAIL (got: ${result})`);
            failed++;
        }
    } catch (e) {
        console.log(`❌ Test 5: Nested fields - ERROR: ${e.message}`);
        failed++;
    }
    
    console.log("\n" + "=".repeat(66));
    console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
    console.log("=".repeat(66));
}

// Run the tests
runAllTests();
```

---

## Expected Results

All tests should pass with ✅. If any fail:
1. Check the error message
2. Verify the input data matches expected format
3. Check if PathEvaluator was exported correctly
4. Review the FunctionEvaluator logs (should appear in console)

---

## Troubleshooting

### "Plugin not found"
- Reload Obsidian (Ctrl+R / Cmd+R)
- Check plugin is enabled in Settings → Community Plugins

### "PathEvaluator is not a constructor"
- PathEvaluator not exported from main.ts yet
- Follow Step 3 to export it

### "Cannot read property 'chemical' of undefined"
- userInput structure doesn't match expected format
- Check the path in the field segment

### Date functions return empty string
- DateContext may not be initialized
- Check if moment.js is available: `typeof window.moment`

---

## Next Step After Testing

Once manual tests pass, proceed to **Phase 1.6**: Integrate PathEvaluator into NoteCreator.ts and NewNoteModal.ts to replace legacy PathTemplateParser.
