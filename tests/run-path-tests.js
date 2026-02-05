/**
 * Test Runner for PathEvaluator and FunctionEvaluator
 * 
 * This script runs all test cases defined in test-path-evaluator.ts
 * and reports the results.
 * 
 * Usage: npm run build-fast && node tests/run-path-tests.js
 */

// Mock Obsidian types for testing
class MockTFolder {
    constructor(children = []) {
        this.children = children;
    }
}

// Create a comprehensive mock plugin
function createMockPlugin(mockFolder = null) {
    return {
        app: {
            vault: {
                getAbstractFileByPath: (folderPath) => {
                    // Return the mock folder if provided
                    return mockFolder;
                }
            }
        },
        settings: {
            operators: [
                { name: "John Doe", initials: "JD" },
                { name: "Jane Smith", initials: "JS" },
                { name: "Bob Wilson", initials: "BW" }
            ],
            authors: [
                { name: "Dr. Alice", initials: "DA" },
                { name: "Dr. Bob", initials: "DB" }
            ],
            note: {
                // Mock note settings if needed
            }
        }
    };
}

// Mock moment for date testing (Obsidian provides window.moment)
function mockMoment() {
    // Create a fixed date for consistent testing    
    const momentObj = {
        format(fmt) {
            if (!fmt) return '2026-01-19T12:00:00Z';
            return fmt
                .replace('YYYY', '2026')
                .replace('MM', '01')
                .replace('DD', '19')
                .replace('MMMM', 'January')
                .replace('dddd', 'Monday');
        },
        year: () => 2026,
        month: () => 0, // 0-indexed
        date: () => 19,
        day: () => 1 // Monday
    };
    
    return momentObj;
}

// Set up global moment mock
global.moment = function(date) {
    return mockMoment();
};

// Add localization methods
global.moment.localeData = function() {
    return {
        weekdays: () => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        months: () => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    };
};

/**
 * Run a single test case
 */
async function runTest(testCase, PathEvaluator) {
    const { name, description, template, userInput, mockFolder, expected, noteType } = testCase;
    
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   Description: ${description}`);
    console.log(`   Note Type: ${noteType}`);
    
    try {
        // Create mock plugin with test-specific folder
        const mockFolderObj = mockFolder ? new MockTFolder(mockFolder.children) : new MockTFolder();
        const plugin = createMockPlugin(mockFolderObj);
        
        // Create PathEvaluator instance
        const evaluator = new PathEvaluator(plugin);
        
        // Prepare options
        const options = {
            plugin: plugin,
            userInput: userInput,
            targetFolder: "test-folder",
            dateOffset: undefined
        };
        
        // Evaluate the path
        const actual = await evaluator.evaluatePath(template, options);
        
        // Compare result
        const passed = actual === expected;
        
        if (passed) {
            console.log(`   ✅ PASS`);
            console.log(`   Result: "${actual}"`);
        } else {
            console.log(`   ❌ FAIL`);
            console.log(`   Expected: "${expected}"`);
            console.log(`   Actual:   "${actual}"`);
        }
        
        return {
            testName: name,
            passed,
            expected,
            actual,
            error: null
        };
        
    } catch (error) {
        console.log(`   ❌ ERROR`);
        console.log(`   ${error.message}`);
        console.log(`   Stack: ${error.stack}`);
        
        return {
            testName: name,
            passed: false,
            expected,
            actual: '',
            error: error.message
        };
    }
}

/**
 * Print summary of all test results
 */
function printSummary(results) {
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;
    
    console.log("\n" + "=".repeat(80));
    console.log("TEST SUMMARY");
    console.log("=".repeat(80));
    console.log(`Total: ${total} tests`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    console.log("=".repeat(80) + "\n");
    
    if (failed > 0) {
        console.log("Failed Tests:");
        results.filter(r => !r.passed).forEach((r, i) => {
            console.log(`  ${i + 1}. ${r.testName}`);
            if (r.error) {
                console.log(`     Error: ${r.error}`);
            }
        });
        console.log();
    }
}

/**
 * Main test execution
 */
async function main() {
    console.log("╔════════════════════════════════════════════════════════════════════════════╗");
    console.log("║          PATH EVALUATOR & FUNCTION EVALUATOR TEST SUITE                    ║");
    console.log("╚════════════════════════════════════════════════════════════════════════════╝\n");
    
    try {
        // Import the compiled modules
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const PathEvaluatorModule = require('../release/main.js');
        const PathEvaluator = PathEvaluatorModule.PathEvaluator;
        
        // Import test cases
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const testCasesModule = require('./test-path-evaluator.js');
        const { allTests } = testCasesModule;
        
        if (!allTests || allTests.length === 0) {
            console.error("❌ No test cases found!");
            process.exit(1);
        }
        
        console.log(`Found ${allTests.length} test cases\n`);
        
        // Run all tests
        const results = [];
        for (const testCase of allTests) {
            const result = await runTest(testCase, PathEvaluator);
            results.push(result);
        }
        
        // Print summary
        printSummary(results);
        
        // Exit with appropriate code
        const allPassed = results.every(r => r.passed);
        process.exit(allPassed ? 0 : 1);
        
    } catch (error) {
        console.error("\n❌ Test runner failed:");
        console.error(error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main().catch(error => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
}

module.exports = { runTest, printSummary, createMockPlugin };
