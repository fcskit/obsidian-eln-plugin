/**
 * Simple Manual Test Script for PathEvaluator
 * 
 * This is a simplified test that can be manually copied into the
 * Obsidian console for testing, or adapted for integration tests.
 * 
 * To test in Obsidian console:
 * 1. Open Developer Tools (Cmd+Option+I on Mac)
 * 2. Copy and paste this script
 * 3. Check console output for results
 */

// Test Case 1: Simple Field Extraction
console.log("\n=== Test 1: Simple Field Extraction ===");
const test1Template = {
    segments: [
        { kind: "field", path: "chemical.name", separator: "" }
    ]
};
const test1Input = {
    chemical: { name: "Sodium Chloride" }
};
console.log("Template:", JSON.stringify(test1Template, null, 2));
console.log("Input:", JSON.stringify(test1Input, null, 2));
console.log("Expected: 'Sodium Chloride'");

// Test Case 2: Multiple Segments with Literal
console.log("\n=== Test 2: Literal + Field ===");
const test2Template = {
    segments: [
        { kind: "literal", value: "Resources", separator: "/" },
        { kind: "literal", value: "Chemicals", separator: "/" },
        { kind: "field", path: "chemical.type", separator: "" }
    ]
};
const test2Input = {
    chemical: { type: "Salt" }
};
console.log("Template:", JSON.stringify(test2Template, null, 2));
console.log("Input:", JSON.stringify(test2Input, null, 2));
console.log("Expected: 'Resources/Chemicals/Salt'");

// Test Case 3: Field with Transformation
console.log("\n=== Test 3: Field Transformation (uppercase) ===");
const test3Template = {
    segments: [
        { kind: "field", path: "project.code", transform: "uppercase", separator: "-" },
        { kind: "counter", width: 3, separator: "" }
    ]
};
const test3Input = {
    project: { code: "abc" }
};
console.log("Template:", JSON.stringify(test3Template, null, 2));
console.log("Input:", JSON.stringify(test3Input, null, 2));
console.log("Expected: 'ABC-001' (assuming no existing files)");

// Test Case 4: Kebab-case transformation
console.log("\n=== Test 4: Kebab-case Transformation ===");
const test4Template = {
    segments: [
        { kind: "literal", value: "Projects", separator: "/" },
        { kind: "field", path: "project.name", transform: "kebab-case", separator: "" }
    ]
};
const test4Input = {
    project: { name: "My Cool Project 2026!" }
};
console.log("Template:", JSON.stringify(test4Template, null, 2));
console.log("Input:", JSON.stringify(test4Input, null, 2));
console.log("Expected: 'Projects/my-cool-project-2026'");

// Test Case 5: Date Context Function
console.log("\n=== Test 5: Date Context Function ===");
const test5Template = {
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
const test5Input = {};
console.log("Template:", JSON.stringify(test5Template, null, 2));
console.log("Input:", JSON.stringify(test5Input, null, 2));
console.log("Expected: 'Daily Notes/2026/01 January' (for Jan 19, 2026)");

// Test Case 6: Complex Analysis Note
console.log("\n=== Test 6: Analysis Note (Full Example) ===");
const test6Template = {
    segments: [
        { kind: "literal", value: "Experiments", separator: "/" },
        { kind: "literal", value: "Analyses", separator: "/" },
        { kind: "field", path: "project.name", separator: "/" },
        { kind: "field", path: "sample.name", separator: "/" },
        { kind: "field", path: "analysis.method", separator: "_" },
        { kind: "counter", width: 2, separator: "" }
    ]
};
const test6Input = {
    project: { name: "Quantum-Study" },
    sample: { name: "Sample-A" },
    analysis: { method: "XRD" }
};
console.log("Template:", JSON.stringify(test6Template, null, 2));
console.log("Input:", JSON.stringify(test6Input, null, 2));
console.log("Expected: 'Experiments/Analyses/Quantum-Study/Sample-A/XRD_01'");

// Test Case 7: Nested Field Access
console.log("\n=== Test 7: Deeply Nested Fields ===");
const test7Template = {
    segments: [
        { kind: "field", path: "experiment.setup.instrument.name", separator: "_" },
        { kind: "field", path: "experiment.setup.method", separator: "" }
    ]
};
const test7Input = {
    experiment: {
        setup: {
            instrument: { name: "XRD-500" },
            method: "Powder"
        }
    }
};
console.log("Template:", JSON.stringify(test7Template, null, 2));
console.log("Input:", JSON.stringify(test7Input, null, 2));
console.log("Expected: 'XRD-500_Powder'");

// Test Case 8: Settings Context Function
console.log("\n=== Test 8: Settings Context (Operator Initials) ===");
const test8Template = {
    segments: [
        { kind: "literal", value: "EXP", separator: "-" },
        {
            kind: "function",
            context: ["settings", "userInput"],
            expression: "settings.operators.find(op => op.name === userInput.operator)?.initials || 'XX'",
            separator: "-"
        },
        { kind: "counter", width: 3, separator: "" }
    ]
};
const test8Input = {
    operator: "John Doe"
};
console.log("Template:", JSON.stringify(test8Template, null, 2));
console.log("Input:", JSON.stringify(test8Input, null, 2));
console.log("Expected: 'EXP-JD-001' (if settings.operators contains John Doe with initials JD)");

// Test Case 9: Complex Arrow Function
console.log("\n=== Test 9: Complex Arrow Function ===");
const test9Template = {
    segments: [
        {
            kind: "function",
            function: "({ userInput }) => userInput.sample?.type === 'powder' ? 'PWD' : 'LIQ'",
            separator: "-"
        },
        { kind: "field", path: "sample.id", separator: "" }
    ]
};
const test9Input = {
    sample: { type: "powder", id: "123" }
};
console.log("Template:", JSON.stringify(test9Template, null, 2));
console.log("Input:", JSON.stringify(test9Input, null, 2));
console.log("Expected: 'PWD-123'");

// Test Case 10: Counter with Prefix
console.log("\n=== Test 10: Counter with Prefix ===");
const test10Template = {
    segments: [
        { kind: "literal", value: "EXP-2026-", separator: "" },
        { kind: "counter", prefix: "EXP-2026-", width: 4, separator: "" }
    ]
};
const test10Input = {};
console.log("Template:", JSON.stringify(test10Template, null, 2));
console.log("Input:", JSON.stringify(test10Input, null, 2));
console.log("Expected: 'EXP-2026-0001' (assuming no existing files)");
console.log("Note: If files EXP-2026-0001, EXP-2026-0002 exist, should generate 0003");

console.log("\n" + "=".repeat(80));
console.log("END OF TEST CASES");
console.log("=".repeat(80));
console.log("\nTo actually run these tests:");
console.log("1. Build the plugin: npm run build-fast");
console.log("2. Load plugin in Obsidian");
console.log("3. Open Developer Console");
console.log("4. Get plugin instance: const plugin = app.plugins.plugins['obsidian-eln']");
console.log("5. Create evaluator: const evaluator = new plugin.PathEvaluator(plugin)");
console.log("6. Run test: await evaluator.evaluatePath(test1Template, { plugin, userInput: test1Input })");
console.log("\n");
