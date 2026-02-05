/**
 * Test suite for PathEvaluator and FunctionEvaluator
 * 
 * Tests real-world scenarios based on note type configurations from settings.ts.
 * Each test converts the legacy format to new PathTemplate syntax and validates output.
 * 
 * Run this file with: npm run build-fast && node -e "require('./tests/test-path-evaluator.ts')"
 */

import type { PathTemplate } from '../src/types/templates';
import type { FormData } from '../src/types/forms';

// Mock plugin for testing
interface MockPlugin {
    app: {
        vault: {
            getAbstractFileByPath: (path: string) => MockFolder | null;
        };
    };
    settings: {
        operators: Array<{ name: string; initials: string }>;
        authors: Array<{ name: string; initials: string }>;
    };
}

interface MockFolder {
    children: Array<{ name: string }>;
}

/**
 * Test Case Structure
 */
interface TestCase {
    name: string;
    description: string;
    template: PathTemplate;
    userInput: FormData;
    mockFolder?: MockFolder;
    expected: string;
    noteType: string;
}

/**
 * Test Results
 */
interface TestResult {
    testName: string;
    passed: boolean;
    expected: string;
    actual: string;
    error?: string;
}

// ============================================================================
// Test Cases based on real note types from settings.ts
// ============================================================================

/**
 * Test 1: Analysis Note - fileName
 * Legacy: [
 *   { type: 'userInput', field: "sample.name", separator: " - " },
 *   { type: 'userInput', field: "analysis.method", separator: "_" },
 *   { type: 'index', field: "02", separator: "" }
 * ]
 * New syntax with field segments and counter
 */
const analysisFileNameTest: TestCase = {
    name: "Analysis - fileName",
    description: "File name with sample name, method, and counter",
    template: {
        segments: [
            { kind: "field", path: "sample.name", separator: " - " },
            { kind: "field", path: "analysis.method", separator: "_" },
            { kind: "counter", width: 2, separator: "" }
        ]
    },
    userInput: {
        sample: { name: "Sample-A" },
        analysis: { method: "XRD" }
    },
    mockFolder: {
        children: [
            { name: "Sample-A - XRD_01" },
            { name: "Sample-A - XRD_02" }
        ]
    },
    expected: "Sample-A - XRD_03",
    noteType: "analysis"
};

/**
 * Test 2: Analysis Note - folderPath
 * Legacy: [
 *   { type: 'string', field: "Experiments/Analyses", separator: "/" },
 *   { type: 'userInput', field: "project.name", separator: "/" },
 *   { type: 'userInput', field: "sample.name", separator: "/" },
 *   { type: 'userInput', field: "analysis.method", separator: "_" },
 *   { type: 'index', field: "02", separator: "" }
 * ]
 */
const analysisFolderPathTest: TestCase = {
    name: "Analysis - folderPath",
    description: "Folder path with literals, fields, and counter",
    template: {
        segments: [
            { kind: "literal", value: "Experiments", separator: "/" },
            { kind: "literal", value: "Analyses", separator: "/" },
            { kind: "field", path: "project.name", separator: "/" },
            { kind: "field", path: "sample.name", separator: "/" },
            { kind: "field", path: "analysis.method", separator: "_" },
            { kind: "counter", width: 2, separator: "" }
        ]
    },
    userInput: {
        project: { name: "Quantum-Study" },
        sample: { name: "Sample-A" },
        analysis: { method: "XRD" }
    },
    mockFolder: {
        children: [
            { name: "XRD_01" },
            { name: "XRD_02" }
        ]
    },
    expected: "Experiments/Analyses/Quantum-Study/Sample-A/XRD_03",
    noteType: "analysis"
};

/**
 * Test 3: Chemical Note - fileName (simple field)
 * Legacy: [
 *   { type: 'userInput', field: "chemical.name", separator: "" }
 * ]
 */
const chemicalFileNameTest: TestCase = {
    name: "Chemical - fileName",
    description: "Simple file name from single field",
    template: {
        segments: [
            { kind: "field", path: "chemical.name", separator: "" }
        ]
    },
    userInput: {
        chemical: { name: "Sodium Chloride" }
    },
    expected: "Sodium Chloride",
    noteType: "chemical"
};

/**
 * Test 4: Chemical Note - folderPath with literal and field
 * Legacy: [
 *   { type: 'string', field: "Resources/Chemicals", separator: "/" },
 *   { type: 'userInput', field: "chemical.type", separator: "" }
 * ]
 */
const chemicalFolderPathTest: TestCase = {
    name: "Chemical - folderPath",
    description: "Folder path with literal prefix and type field",
    template: {
        segments: [
            { kind: "literal", value: "Resources", separator: "/" },
            { kind: "literal", value: "Chemicals", separator: "/" },
            { kind: "field", path: "chemical.type", separator: "" }
        ]
    },
    userInput: {
        chemical: { type: "Salt" }
    },
    expected: "Resources/Chemicals/Salt",
    noteType: "chemical"
};

/**
 * Test 5: Daily Note - fileName with date context (using function segment)
 * Legacy: [
 *   { type: 'dateField', field: "currentDate", separator: " - " },
 *   { type: 'dateField', field: "weekday", separator: ", " },
 *   { type: 'dateField', field: "dayOfMonth", separator: ". " },
 *   { type: 'dateField', field: "monthName", separator: "" }
 * ]
 * New: Using date context functions
 */
const dailyNoteFileNameTest: TestCase = {
    name: "DailyNote - fileName (date functions)",
    description: "File name with date formatting using DateContext",
    template: {
        segments: [
            { 
                kind: "function",
                context: ["date"],
                expression: "date.format('YYYY-MM-DD')",
                separator: " - "
            },
            {
                kind: "function",
                context: ["date"],
                expression: "date.weekday()",
                separator: ", "
            },
            {
                kind: "function",
                context: ["date"],
                expression: "date.day()",
                separator: ". "
            },
            {
                kind: "function",
                context: ["date"],
                expression: "date.monthName()",
                separator: ""
            }
        ]
    },
    userInput: {},
    expected: "2026-01-19 - Sunday, 19. January",
    noteType: "dailyNote"
};

/**
 * Test 6: Daily Note - folderPath with date context
 * Legacy: [
 *   { type: 'string', field: "Daily Notes", separator: "/" },
 *   { type: 'dateField', field: "year", separator: "/" },
 *   { type: 'dateField', field: "month", separator: " " },
 *   { type: 'dateField', field: "monthName", separator: "" }
 * ]
 */
const dailyNoteFolderPathTest: TestCase = {
    name: "DailyNote - folderPath (date functions)",
    description: "Folder path with year/month organization",
    template: {
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
    },
    userInput: {},
    expected: "Daily Notes/2026/01 January",
    noteType: "dailyNote"
};

/**
 * Test 7: Field transformation - uppercase
 */
const transformUppercaseTest: TestCase = {
    name: "Transform - uppercase",
    description: "Field with uppercase transformation",
    template: {
        segments: [
            { kind: "field", path: "project.code", transform: "uppercase", separator: "-" },
            { kind: "counter", width: 3, separator: "" }
        ]
    },
    userInput: {
        project: { code: "abc" }
    },
    mockFolder: {
        children: []
    },
    expected: "ABC-001",
    noteType: "project"
};

/**
 * Test 8: Field transformation - slugify
 */
const transformSlugifyTest: TestCase = {
    name: "Transform - slugify",
    description: "Field with slugify transformation for URL-safe names",
    template: {
        segments: [
            { kind: "literal", value: "Projects", separator: "/" },
            { kind: "field", path: "project.name", transform: "kebab-case", separator: "" }
        ]
    },
    userInput: {
        project: { name: "My Cool Project 2026!" }
    },
    expected: "Projects/my-cool-project-2026",
    noteType: "project"
};

/**
 * Test 9: Complex function - operator initials from settings
 * Tests settings context integration
 */
const functionOperatorInitialsTest: TestCase = {
    name: "Function - operator initials",
    description: "Extract operator initials using settings context",
    template: {
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
    },
    userInput: {
        operator: "John Doe"
    },
    mockFolder: {
        children: []
    },
    expected: "EXP-JD-001",
    noteType: "experiment"
};

/**
 * Test 10: Complex arrow function
 * Tests the complex function descriptor format
 */
const complexFunctionTest: TestCase = {
    name: "Function - complex arrow",
    description: "Complex arrow function with conditional logic",
    template: {
        segments: [
            {
                kind: "function",
                function: "({ userInput }) => userInput.sample?.type === 'powder' ? 'PWD' : 'LIQ'",
                separator: "-"
            },
            { kind: "field", path: "sample.id", separator: "" }
        ]
    },
    userInput: {
        sample: { type: "powder", id: "123" }
    },
    expected: "PWD-123",
    noteType: "sample"
};

/**
 * Test 11: Nested field access
 */
const nestedFieldTest: TestCase = {
    name: "Field - nested access",
    description: "Access deeply nested fields",
    template: {
        segments: [
            { kind: "field", path: "experiment.setup.instrument.name", separator: "_" },
            { kind: "field", path: "experiment.setup.method", separator: "" }
        ]
    },
    userInput: {
        experiment: {
            setup: {
                instrument: { name: "XRD-500" },
                method: "Powder"
            }
        }
    },
    expected: "XRD-500_Powder",
    noteType: "experiment"
};

/**
 * Test 12: Counter with prefix
 */
const counterWithPrefixTest: TestCase = {
    name: "Counter - with prefix",
    description: "Counter that only counts files with specific prefix",
    template: {
        segments: [
            { kind: "literal", value: "EXP-2026-", separator: "" },
            { kind: "counter", prefix: "EXP-2026-", width: 4, separator: "" }
        ]
    },
    userInput: {},
    mockFolder: {
        children: [
            { name: "EXP-2026-0001" },
            { name: "EXP-2026-0002" },
            { name: "OTHER-001" },  // Should not count this
        ]
    },
    expected: "EXP-2026-0003",
    noteType: "experiment"
};

// ============================================================================
// Test Suite
// ============================================================================

const allTests: TestCase[] = [
    analysisFileNameTest,
    analysisFolderPathTest,
    chemicalFileNameTest,
    chemicalFolderPathTest,
    dailyNoteFileNameTest,
    dailyNoteFolderPathTest,
    transformUppercaseTest,
    transformSlugifyTest,
    functionOperatorInitialsTest,
    complexFunctionTest,
    nestedFieldTest,
    counterWithPrefixTest
];

/**
 * Mock implementation helpers
 */
function createMockPlugin(): MockPlugin {
    return {
        app: {
            vault: {
                getAbstractFileByPath: (path: string) => null
            }
        },
        settings: {
            operators: [
                { name: "John Doe", initials: "JD" },
                { name: "Jane Smith", initials: "JS" }
            ],
            authors: [
                { name: "Dr. Alice", initials: "DA" },
                { name: "Dr. Bob", initials: "DB" }
            ]
        }
    };
}

/**
 * Print test results in a readable format
 */
function printTestResults(results: TestResult[]): void {
    console.log("\n" + "=".repeat(80));
    console.log("PATH EVALUATOR TEST RESULTS");
    console.log("=".repeat(80) + "\n");

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    results.forEach((result, index) => {
        const status = result.passed ? "✅ PASS" : "❌ FAIL";
        console.log(`${index + 1}. ${status} - ${result.testName}`);
        
        if (!result.passed) {
            console.log(`   Expected: "${result.expected}"`);
            console.log(`   Actual:   "${result.actual}"`);
            if (result.error) {
                console.log(`   Error:    ${result.error}`);
            }
        }
        console.log();
    });

    console.log("=".repeat(80));
    console.log(`Summary: ${passed} passed, ${failed} failed, ${results.length} total`);
    console.log("=".repeat(80) + "\n");
}

/**
 * Export test cases and utilities for actual test implementation
 */
export {
    TestCase,
    TestResult,
    allTests,
    createMockPlugin,
    printTestResults
};

// ============================================================================
// Instructions for running tests
// ============================================================================

console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                     PATH EVALUATOR TEST SUITE                              ║
╚════════════════════════════════════════════════════════════════════════════╝

This file defines ${allTests.length} test cases for PathEvaluator and FunctionEvaluator.

Test Categories:
  1. Field Segments (simple extraction)
  2. Literal Segments (static text)
  3. Counter Segments (auto-increment)
  4. Function Segments (DateContext, settings context)
  5. Transformations (uppercase, lowercase, slugify)
  6. Complex Functions (arrow functions with logic)
  7. Nested Field Access (deep object paths)

Real-world scenarios covered:
  - Analysis notes (sample + method + counter)
  - Chemical notes (simple field-based names)
  - Daily notes (date formatting)
  - Experiment notes (operator initials, prefixed counters)
  - Project notes (transformations, slugification)

To run these tests:
  1. Create test-runner.ts that imports this file
  2. Instantiate PathEvaluator with mock plugin
  3. Run each test case and compare actual vs expected
  4. Use printTestResults() to display results

Example test runner structure:
  import { PathEvaluator } from '../src/core/templates/PathEvaluator';
  import { allTests, createMockPlugin, printTestResults } from './test-path-evaluator';
  
  const plugin = createMockPlugin();
  const evaluator = new PathEvaluator(plugin);
  
  for (const test of allTests) {
    const result = await evaluator.evaluatePath(test.template, {
      plugin,
      userInput: test.userInput,
      targetFolder: ...
    });
    // Compare result with test.expected
  }
`);
