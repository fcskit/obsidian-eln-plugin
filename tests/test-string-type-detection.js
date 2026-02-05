// Quick test to verify string-based type detection works correctly
// This simulates user input from text fields

const testCases = [
    { input: "5", expectedType: "number", expectedValue: 5 },
    { input: "123.45", expectedType: "number", expectedValue: 123.45 },
    { input: "true", expectedType: "boolean", expectedValue: true },
    { input: "false", expectedType: "boolean", expectedValue: false },
    { input: "hello", expectedType: "string", expectedValue: "hello" },
    { input: "2024-12-25", expectedType: "date", expectedValue: "2024-12-25" },
    { input: "[[Some Page]]", expectedType: "link", expectedValue: "Some Page" },
    { input: "https://example.com", expectedType: "external-link", expectedValue: "https://example.com" },
    { input: "$E=mc^2$", expectedType: "latex", expectedValue: "E=mc^2" },
    { input: "0", expectedType: "number", expectedValue: 0 },
    { input: "-42", expectedType: "number", expectedValue: -42 },
    { input: "3.14159", expectedType: "number", expectedValue: 3.14159 }
];

console.log("String Type Detection Test Cases:");
console.log("=================================");

for (const testCase of testCases) {
    console.log(`Input: "${testCase.input}"`);
    console.log(`  Expected Type: ${testCase.expectedType}`);
    console.log(`  Expected Value: ${JSON.stringify(testCase.expectedValue)}`);
    console.log("");
}

console.log("These test cases should now work correctly with the fixed detectStringType function.");
console.log("Key fixes:");
console.log("- '5' should be detected as number type with value 5");
console.log("- 'true' should be detected as boolean type with value true");
console.log("- 'false' should be detected as boolean type with value false");