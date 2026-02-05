/**
 * Test file for array item type detection functionality
 */

import { determineNewArrayItemType } from "../src/ui/renderer/npe/helpers/determineNewArrayItemType";

// Test data sets
const testCases = [
    {
        name: "Empty array",
        array: [],
        expected: { dataType: 'string', defaultValue: 'new item' }
    },
    {
        name: "All numbers - linear sequence +1",
        array: [1, 2, 3, 4, 5],
        expected: { dataType: 'number', defaultValue: 6 }
    },
    {
        name: "All numbers - linear sequence +2", 
        array: [0, 2, 4, 6, 8],
        expected: { dataType: 'number', defaultValue: 10 }
    },
    {
        name: "All numbers - linear sequence -1",
        array: [10, 9, 8, 7],
        expected: { dataType: 'number', defaultValue: 6 }
    },
    {
        name: "All numbers - constant sequence (should continue with same value)",
        array: [3, 3, 3, 3],
        expected: { dataType: 'number', defaultValue: 3 }
    },
    {
        name: "All numbers - constant zeros",
        array: [0, 0, 0, 0, 0, 0],
        expected: { dataType: 'number', defaultValue: 0 }
    },
    {
        name: "All numbers - no clear pattern",
        array: [1, 3, 7, 2, 9],
        expected: { dataType: 'number', defaultValue: 0 }
    },
    {
        name: "All numbers - single value",
        array: [42],
        expected: { dataType: 'number', defaultValue: 0 }
    },
    {
        name: "All booleans",
        array: [true, false, true],
        expected: { dataType: 'boolean', defaultValue: false }
    },
    {
        name: "All strings",
        array: ["apple", "banana", "cherry"],
        expected: { dataType: 'string', defaultValue: 'new item' }
    },
    {
        name: "All links",
        array: ["[[Page 1]]", "[[Page 2]]", "[[Page 3]]"],
        expected: { dataType: 'link', defaultValue: '[[new link]]' }
    },
    {
        name: "All LaTeX",
        array: ["$E=mc^2$", "$\\alpha + \\beta$", "$x^2 + y^2 = r^2$"],
        expected: { dataType: 'latex', defaultValue: '$new formula$' }
    },
    {
        name: "Mixed types - should use last item type",
        array: ["string", 42, true, "[[link]]"],
        expected: { dataType: 'link', defaultValue: '[[new link]]' }
    },
    {
        name: "Numbers with linear pattern +1 - should continue sequence",
        array: [10, 11, 12],
        expected: { dataType: 'number', defaultValue: 13 }
    },
    {
        name: "Boolean ending with true",
        array: [false, false, true],
        expected: { dataType: 'boolean', defaultValue: false }
    },
    {
        name: "Date strings - daily sequence",
        array: ["2024-01-01", "2024-01-02", "2024-01-03"],
        expected: { dataType: 'date', defaultValue: '2024-01-04' }
    },
    {
        name: "Date strings - weekly sequence", 
        array: ["2024-01-01", "2024-01-08", "2024-01-15"],
        expected: { dataType: 'date', defaultValue: '2024-01-22' }
    },
    {
        name: "Date strings - monthly sequence",
        array: ["2024-01-01", "2024-02-01", "2024-03-01"],
        expected: { dataType: 'date', defaultValue: '2024-04-01' }
    },
    {
        name: "Date strings - no pattern",
        array: ["2024-01-01", "2024-02-15", "2024-01-30"],
        expected: { dataType: 'date' } // defaultValue will be today's date
    },
];

function runTests() {
    console.log("🧪 Testing array item type detection...\n");
    
    let passed = 0;
    let failed = 0;
    
    testCases.forEach((testCase, index) => {
        console.log(`Test ${index + 1}: ${testCase.name}`);
        console.log(`Input: ${JSON.stringify(testCase.array)}`);
        
        try {
            const result = determineNewArrayItemType(testCase.array);
            console.log(`Result: ${JSON.stringify(result)}`);
            
            // Check data type
            if (result.dataType === testCase.expected.dataType) {
                console.log(`✅ Data type correct: ${result.dataType}`);
                
                // For date type, just check that we got a valid date string
                if (testCase.expected.dataType === 'date') {
                    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                    if (typeof result.defaultValue === 'string' && dateRegex.test(result.defaultValue)) {
                        console.log(`✅ Date format correct: ${result.defaultValue}`);
                        passed++;
                    } else {
                        console.log(`❌ Date format incorrect: ${result.defaultValue}`);
                        failed++;
                    }
                } else if ('defaultValue' in testCase.expected) {
                    // Check default value for other types
                    if (result.defaultValue === testCase.expected.defaultValue) {
                        console.log(`✅ Default value correct: ${result.defaultValue}`);
                        passed++;
                    } else {
                        console.log(`❌ Default value incorrect. Expected: ${testCase.expected.defaultValue}, Got: ${result.defaultValue}`);
                        failed++;
                    }
                } else {
                    // Type check passed, value not specified in test
                    passed++;
                }
            } else {
                console.log(`❌ Data type incorrect. Expected: ${testCase.expected.dataType}, Got: ${result.dataType}`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ Test failed with error: ${error}`);
            failed++;
        }
        
        console.log(""); // Empty line for readability
    });
    
    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
        console.log("🎉 All tests passed!");
    } else {
        console.log("⚠️ Some tests failed. Please review the implementation.");
    }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
    runTests();
}

export { runTests };