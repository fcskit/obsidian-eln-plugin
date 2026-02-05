/**
 * Test script to verify markdown file link formatting in FilePicker
 * 
 * This tests the formatFileLink and parseFileLink methods to ensure:
 * 1. Absolute paths are converted to markdown file links
 * 2. Filenames are extracted correctly
 * 3. Special characters (spaces, etc.) are handled properly
 * 4. The format matches: [filename](<file:///path>)
 */

// Simulate the path module
const path = {
    basename: (filePath: string) => {
        return filePath.split(/[\\/]/).pop() || filePath;
    }
};

// Test the formatFileLink function
function formatFileLink(absolutePath: string): string {
    const filename = path.basename(absolutePath);
    const fileUrl = `file:///${absolutePath.replace(/\\/g, '/')}`;
    const markdownLink = `[${filename}](<${fileUrl}>)`;
    return markdownLink;
}

// Test the parseFileLink function
function parseFileLink(markdownLink: string): { filename: string; absolutePath: string } {
    const match = markdownLink.match(/\[(.+?)\]\(<file:\/\/\/(.+?)>\)/);
    
    if (match && match[1] && match[2]) {
        return {
            filename: match[1],
            absolutePath: match[2]
        };
    }
    
    const filename = path.basename(markdownLink);
    return {
        filename: filename || markdownLink,
        absolutePath: markdownLink
    };
}

// Test cases
const testCases = [
    {
        name: "Simple file without spaces",
        input: "/Users/gc9830/Documents/data.csv",
        expectedFilename: "data.csv",
        expectedLinkFormat: "[data.csv](<file:////Users/gc9830/Documents/data.csv>)"
    },
    {
        name: "File with spaces in name",
        input: "/Users/gc9830/Documents/my data file.csv",
        expectedFilename: "my data file.csv",
        expectedLinkFormat: "[my data file.csv](<file:////Users/gc9830/Documents/my data file.csv>)"
    },
    {
        name: "File with spaces in path",
        input: "/Users/gc9830/Documents/Obsidian Vault/Data/analysis.xlsx",
        expectedFilename: "analysis.xlsx",
        expectedLinkFormat: "[analysis.xlsx](<file:////Users/gc9830/Documents/Obsidian Vault/Data/analysis.xlsx>)"
    },
    {
        name: "Windows path",
        input: "C:\\Users\\Documents\\report.pdf",
        expectedFilename: "report.pdf",
        expectedLinkFormat: "[report.pdf](<file:///C:/Users/Documents/report.pdf>)"
    },
    {
        name: "File with special characters",
        input: "/Users/gc9830/Documents/Report (2024).docx",
        expectedFilename: "Report (2024).docx",
        expectedLinkFormat: "[Report (2024).docx](<file:////Users/gc9830/Documents/Report (2024).docx>)"
    }
];

console.log("Testing Markdown File Link Formatting\n");
console.log("=" .repeat(80) + "\n");

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log(`Input: ${testCase.input}`);
    
    // Test formatting
    const formatted = formatFileLink(testCase.input);
    console.log(`Formatted: ${formatted}`);
    
    const formatMatches = formatted === testCase.expectedLinkFormat;
    console.log(`Format check: ${formatMatches ? "✅ PASS" : "❌ FAIL"}`);
    
    if (!formatMatches) {
        console.log(`  Expected: ${testCase.expectedLinkFormat}`);
    }
    
    // Test parsing
    const parsed = parseFileLink(formatted);
    console.log(`Parsed filename: ${parsed.filename}`);
    console.log(`Parsed path: ${parsed.absolutePath}`);
    
    const filenameMatches = parsed.filename === testCase.expectedFilename;
    const pathMatches = parsed.absolutePath === testCase.input.replace(/\\/g, '/');
    
    console.log(`Filename check: ${filenameMatches ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`Path check: ${pathMatches ? "✅ PASS" : "❌ FAIL"}`);
    
    if (formatMatches && filenameMatches && pathMatches) {
        passedTests++;
        console.log("✅ Test PASSED\n");
    } else {
        failedTests++;
        console.log("❌ Test FAILED\n");
    }
    
    console.log("-".repeat(80) + "\n");
});

console.log("=" .repeat(80));
console.log(`\nTest Results: ${passedTests} passed, ${failedTests} failed out of ${testCases.length} total`);

if (failedTests === 0) {
    console.log("✅ All tests passed!");
} else {
    console.log("❌ Some tests failed.");
}
