/**
 * Test script for array item type conversion functionality
 * Tests various scenarios where user input doesn't match expected array item type
 */

import { convertArrayItemInput } from "../src/ui/renderer/npe/helpers/getDataType";

interface TestCase {
    description: string;
    userInput: string;
    expectedType: string;
    currentValue: string | number | boolean | null | undefined;
    expectedOutput: {
        detectedType: string;
        typeChanged: boolean;
        convertedValue: string | number | boolean | null;
    };
}

const testCases: TestCase[] = [
    // String to Number conversion
    {
        description: "String array item with numeric input",
        userInput: "123",
        expectedType: "string",
        currentValue: "hello",
        expectedOutput: {
            detectedType: "number",
            typeChanged: true,
            convertedValue: 123
        }
    },
    {
        description: "String array item with decimal input",
        userInput: "45.67",
        expectedType: "string", 
        currentValue: "text",
        expectedOutput: {
            detectedType: "number",
            typeChanged: true,
            convertedValue: 45.67
        }
    },

    // Number to String conversion
    {
        description: "Number array item with text input",
        userInput: "hello world",
        expectedType: "number",
        currentValue: 42,
        expectedOutput: {
            detectedType: "string",
            typeChanged: true,
            convertedValue: "hello world"
        }
    },

    // Boolean conversion
    {
        description: "String array item with boolean input",
        userInput: "true",
        expectedType: "string",
        currentValue: "text",
        expectedOutput: {
            detectedType: "boolean",
            typeChanged: true,
            convertedValue: true
        }
    },
    {
        description: "Number array item with boolean input",
        userInput: "false",
        expectedType: "number",
        currentValue: 123,
        expectedOutput: {
            detectedType: "boolean",
            typeChanged: true,
            convertedValue: false
        }
    },

    // Date conversion
    {
        description: "String array item with date input",
        userInput: "2024-12-25",
        expectedType: "string",
        currentValue: "text",
        expectedOutput: {
            detectedType: "date",
            typeChanged: true,
            convertedValue: "2024-12-25"
        }
    },

    // Link conversion
    {
        description: "String array item with wikilink input",
        userInput: "[[Some Page]]",
        expectedType: "string",
        currentValue: "text",
        expectedOutput: {
            detectedType: "link",
            typeChanged: true,
            convertedValue: "[[Some Page]]"
        }
    },

    // External link conversion
    {
        description: "String array item with URL input",
        userInput: "https://example.com",
        expectedType: "string",
        currentValue: "text",
        expectedOutput: {
            detectedType: "external-link",
            typeChanged: true,
            convertedValue: "https://example.com"
        }
    },

    // LaTeX conversion
    {
        description: "String array item with LaTeX input",
        userInput: "$E = mc^2$",
        expectedType: "string",
        currentValue: "text",
        expectedOutput: {
            detectedType: "latex",
            typeChanged: true,
            convertedValue: "$E = mc^2$"
        }
    },

    // Same type (no conversion)
    {
        description: "String array item with string input (no conversion)",
        userInput: "just text",
        expectedType: "string",
        currentValue: "old text",
        expectedOutput: {
            detectedType: "string",
            typeChanged: false,
            convertedValue: "just text"
        }
    },
    {
        description: "Number array item with numeric input (no conversion)",
        userInput: "789",
        expectedType: "number",
        currentValue: 456,
        expectedOutput: {
            detectedType: "number",
            typeChanged: false,
            convertedValue: 789
        }
    }
];

function runTests() {
    console.log("🧪 Running Array Type Conversion Tests...\n");
    
    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
        try {
            const result = convertArrayItemInput(
                testCase.userInput,
                testCase.expectedType,
                testCase.currentValue
            );

            // Check all expected properties
            const detectedTypeMatch = result.detectedType === testCase.expectedOutput.detectedType;
            const typeChangedMatch = result.typeChanged === testCase.expectedOutput.typeChanged;
            const convertedValueMatch = result.convertedValue === testCase.expectedOutput.convertedValue;

            if (detectedTypeMatch && typeChangedMatch && convertedValueMatch) {
                console.log(`✅ PASS: ${testCase.description}`);
                console.log(`   Input: "${testCase.userInput}" (expected: ${testCase.expectedType})`);
                console.log(`   Result: ${result.detectedType} = ${JSON.stringify(result.convertedValue)} (changed: ${result.typeChanged})\n`);
                passed++;
            } else {
                console.log(`❌ FAIL: ${testCase.description}`);
                console.log(`   Input: "${testCase.userInput}" (expected: ${testCase.expectedType})`);
                console.log(`   Expected: ${testCase.expectedOutput.detectedType} = ${JSON.stringify(testCase.expectedOutput.convertedValue)} (changed: ${testCase.expectedOutput.typeChanged})`);
                console.log(`   Got:      ${result.detectedType} = ${JSON.stringify(result.convertedValue)} (changed: ${result.typeChanged})\n`);
                failed++;
            }
        } catch (error) {
            console.log(`💥 ERROR: ${testCase.description}`);
            console.log(`   Error: ${error}\n`);
            failed++;
        }
    }

    console.log(`📊 Test Results: ${passed} passed, ${failed} failed, ${testCases.length} total`);
    
    if (failed === 0) {
        console.log("🎉 All tests passed! Array type conversion is working correctly.");
    } else {
        console.log("⚠️  Some tests failed. Please review the implementation.");
    }
}

// Run tests if called directly
if (require.main === module) {
    runTests();
}

export { runTests, testCases };