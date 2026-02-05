# Quick Test Commands for Obsidian Console

**Copy-paste these commands directly into Obsidian Developer Console** (Cmd+Option+I / Ctrl+Shift+I)

---

## 🚀 Quick Start (Run This First)

```javascript
// Get plugin and create evaluator
const plugin = app.plugins.plugins['obsidian-eln'];
const evaluator = new plugin.PathEvaluator(plugin);
console.log("✅ Ready to test! PathEvaluator created.");
```

---

## 📋 Individual Tests (Copy one at a time)

### Test 1: Simple Field

```javascript
const result = await evaluator.evaluatePath(
    { segments: [{ kind: "field", path: "chemical.name", separator: "" }] },
    { plugin, userInput: { chemical: { name: "Sodium Chloride" } }, targetFolder: "" }
);
console.log("Expected: Sodium Chloride");
console.log("Actual:  ", result);
console.log(result === "Sodium Chloride" ? "✅ PASS" : "❌ FAIL");
```

### Test 2: Uppercase Transform

```javascript
const result = await evaluator.evaluatePath(
    { segments: [{ kind: "field", path: "code", transform: "uppercase", separator: "" }] },
    { plugin, userInput: { code: "abc-123" }, targetFolder: "" }
);
console.log("Expected: ABC-123");
console.log("Actual:  ", result);
console.log(result === "ABC-123" ? "✅ PASS" : "❌ FAIL");
```

### Test 3: Kebab-case Transform

```javascript
const result = await evaluator.evaluatePath(
    { segments: [{ kind: "field", path: "name", transform: "kebab-case", separator: "" }] },
    { plugin, userInput: { name: "My Cool Project!" }, targetFolder: "" }
);
console.log("Expected: my-cool-project");
console.log("Actual:  ", result);
console.log(result === "my-cool-project" ? "✅ PASS" : "❌ FAIL");
```

### Test 4: Date Function (Year)

```javascript
const result = await evaluator.evaluatePath(
    { segments: [{ kind: "function", context: ["date"], expression: "date.year()", separator: "" }] },
    { plugin, userInput: {}, targetFolder: "" }
);
console.log("Expected: 2026");
console.log("Actual:  ", result);
console.log(result === "2026" ? "✅ PASS" : "❌ FAIL");
```

### Test 5: Date Format

```javascript
const result = await evaluator.evaluatePath(
    { segments: [{ kind: "function", context: ["date"], expression: "date.format('YYYY-MM-DD')", separator: "" }] },
    { plugin, userInput: {}, targetFolder: "" }
);
console.log("Expected: 2026-01-20 (today's date)");
console.log("Actual:  ", result);
console.log(/^\d{4}-\d{2}-\d{2}$/.test(result) ? "✅ PASS (valid format)" : "❌ FAIL");
```

### Test 6: Multiple Segments (Path)

```javascript
const result = await evaluator.evaluatePath(
    { segments: [
        { kind: "literal", value: "Resources", separator: "/" },
        { kind: "literal", value: "Chemicals", separator: "/" },
        { kind: "field", path: "type", separator: "" }
    ]},
    { plugin, userInput: { type: "Salt" }, targetFolder: "" }
);
console.log("Expected: Resources/Chemicals/Salt");
console.log("Actual:  ", result);
console.log(result === "Resources/Chemicals/Salt" ? "✅ PASS" : "❌ FAIL");
```

### Test 7: Nested Fields

```javascript
const result = await evaluator.evaluatePath(
    { segments: [
        { kind: "field", path: "experiment.setup.instrument", separator: "_" },
        { kind: "field", path: "experiment.setup.method", separator: "" }
    ]},
    { plugin, userInput: { experiment: { setup: { instrument: "XRD", method: "Powder" } } }, targetFolder: "" }
);
console.log("Expected: XRD_Powder");
console.log("Actual:  ", result);
console.log(result === "XRD_Powder" ? "✅ PASS" : "❌ FAIL");
```

### Test 8: Daily Note Path

```javascript
const result = await evaluator.evaluatePath(
    { segments: [
        { kind: "literal", value: "Daily Notes", separator: "/" },
        { kind: "function", context: ["date"], expression: "date.year()", separator: "/" },
        { kind: "function", context: ["date"], expression: "date.month()", separator: " " },
        { kind: "function", context: ["date"], expression: "date.monthName()", separator: "" }
    ]},
    { plugin, userInput: {}, targetFolder: "" }
);
console.log("Expected: Daily Notes/2026/01 January");
console.log("Actual:  ", result);
console.log(result.startsWith("Daily Notes/2026/") ? "✅ PASS" : "❌ FAIL");
```

### Test 9: Analysis Note (Full Example)

```javascript
const result = await evaluator.evaluatePath(
    { segments: [
        { kind: "literal", value: "Experiments", separator: "/" },
        { kind: "field", path: "project", separator: "/" },
        { kind: "field", path: "sample", separator: "/" },
        { kind: "field", path: "method", separator: "" }
    ]},
    { plugin, userInput: { project: "Quantum", sample: "Sample-A", method: "XRD" }, targetFolder: "" }
);
console.log("Expected: Experiments/Quantum/Sample-A/XRD");
console.log("Actual:  ", result);
console.log(result === "Experiments/Quantum/Sample-A/XRD" ? "✅ PASS" : "❌ FAIL");
```

### Test 10: Complex Arrow Function

```javascript
const result = await evaluator.evaluatePath(
    { segments: [
        { kind: "function", function: "({ userInput }) => userInput.type === 'powder' ? 'PWD' : 'LIQ'", separator: "-" },
        { kind: "field", path: "id", separator: "" }
    ]},
    { plugin, userInput: { type: "powder", id: "123" }, targetFolder: "" }
);
console.log("Expected: PWD-123");
console.log("Actual:  ", result);
console.log(result === "PWD-123" ? "✅ PASS" : "❌ FAIL");
```

---

## 🏃 Run All Tests at Once

```javascript
async function runAllTests() {
    const plugin = app.plugins.plugins['obsidian-eln'];
    const evaluator = new plugin.PathEvaluator(plugin);
    let passed = 0, failed = 0;
    
    const tests = [
        {
            name: "Simple field",
            template: { segments: [{ kind: "field", path: "name", separator: "" }] },
            input: { name: "Test" },
            expected: "Test"
        },
        {
            name: "Uppercase",
            template: { segments: [{ kind: "field", path: "code", transform: "uppercase", separator: "" }] },
            input: { code: "abc" },
            expected: "ABC"
        },
        {
            name: "Kebab-case",
            template: { segments: [{ kind: "field", path: "name", transform: "kebab-case", separator: "" }] },
            input: { name: "My Project!" },
            expected: "my-project"
        },
        {
            name: "Date year",
            template: { segments: [{ kind: "function", context: ["date"], expression: "date.year()", separator: "" }] },
            input: {},
            expected: "2026"
        },
        {
            name: "Path combination",
            template: { segments: [
                { kind: "literal", value: "A", separator: "/" },
                { kind: "field", path: "b", separator: "" }
            ]},
            input: { b: "B" },
            expected: "A/B"
        }
    ];
    
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║    PATHEV ALUATOR TEST SUITE          ║");
    console.log("╚════════════════════════════════════════╝\n");
    
    for (const test of tests) {
        try {
            const result = await evaluator.evaluatePath(test.template, {
                plugin, userInput: test.input, targetFolder: ""
            });
            if (result === test.expected) {
                console.log(`✅ ${test.name}: PASS`);
                passed++;
            } else {
                console.log(`❌ ${test.name}: FAIL`);
                console.log(`   Expected: ${test.expected}`);
                console.log(`   Got:      ${result}`);
                failed++;
            }
        } catch (e) {
            console.log(`❌ ${test.name}: ERROR - ${e.message}`);
            failed++;
        }
    }
    
    console.log("\n" + "=".repeat(42));
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log("=".repeat(42) + "\n");
}

runAllTests();
```

---

## 🔍 Debugging Commands

### Check if plugin loaded:
```javascript
const plugin = app.plugins.plugins['obsidian-eln'];
console.log("Plugin:", !!plugin);
console.log("PathEvaluator:", !!plugin?.PathEvaluator);
```

### Check settings:
```javascript
console.log("Operators:", plugin.settings.general.operators);
console.log("Chemical config:", plugin.settings.note.chemical);
```

### Check date functions:
```javascript
console.log("moment available:", typeof window.moment);
console.log("Current date:", window.moment().format('YYYY-MM-DD'));
```

### Enable debug logging:
```javascript
// Run the command to enable file logging
app.commands.executeCommandById('obsidian-eln:flush-debug-logs');
```

---

## ✅ Success Criteria

All tests should show **✅ PASS**. If you see **❌ FAIL**:
1. Check the expected vs actual values
2. Verify input data structure
3. Check console for error messages
4. Review the PathEvaluator logs

---

## 📝 Next Steps After Testing

1. ✅ All tests pass → Proceed to Phase 1.6 (NoteCreator integration)
2. ❌ Some tests fail → Debug and fix issues in PathEvaluator
3. 🐛 Errors occur → Check FunctionEvaluator and ContextProviders

---

**Reload Plugin After Changes**: Press Ctrl+R (or Cmd+R on Mac) to reload Obsidian after rebuilding.
