/**
 * Test suite for InputManager key order preservation functionality
 */

import { InputManager } from "../src/ui/modals/components/InputManager";

/**
 * Test adding keys at specific positions
 */
export function testAddKeyAtPosition() {
    console.log("\nTesting addKeyAtPosition functionality...");
    
    const inputManager = new InputManager({
        firstField: "first",
        secondField: "second",
        thirdField: "third"
    });
    
    console.log("Original keys:", Object.keys(inputManager.getData()));
    
    // Add at start
    inputManager.addKeyAtPosition("", "startField", "start value", "start");
    console.log("After adding at start:", Object.keys(inputManager.getData()));
    
    // Add at end
    inputManager.addKeyAtPosition("", "endField", "end value", "end");
    console.log("After adding at end:", Object.keys(inputManager.getData()));
    
    // Add after specific key
    inputManager.addKeyAtPosition("", "afterSecond", "after second", "secondField");
    console.log("After adding after 'secondField':", Object.keys(inputManager.getData()));
    
    // Test with nested objects
    inputManager.setValue("nested.child1", "value1");
    inputManager.setValue("nested.child2", "value2");
    console.log("Nested keys before:", Object.keys(inputManager.getValue("nested") as Record<string, unknown>));
    
    inputManager.addKeyAtPosition("nested", "newChild", "new value", "child1");
    console.log("Nested keys after adding after 'child1':", Object.keys(inputManager.getValue("nested") as Record<string, unknown>));
    
    console.log("Full data:", inputManager.getData());
}

/**
 * Test convenience methods
 */
export function testConvenienceMethods() {
    console.log("\nTesting convenience methods...");
    
    const inputManager = new InputManager({
        existing1: "value1",
        existing2: "value2"
    });
    
    console.log("Original keys:", Object.keys(inputManager.getData()));
    
    // Test addField (at end)
    inputManager.addField("", "newField", "new value");
    console.log("After addField:", Object.keys(inputManager.getData()));
    
    // Test addFieldAtStart
    inputManager.addFieldAtStart("", "startField", "start value");
    console.log("After addFieldAtStart:", Object.keys(inputManager.getData()));
    
    // Test addFieldAfter
    inputManager.addFieldAfter("", "existing1", "afterExisting1", "after first");
    console.log("After addFieldAfter:", Object.keys(inputManager.getData()));
    
    // Test generateUniqueKey
    const uniqueKey1 = inputManager.generateUniqueKey("", "field");
    const uniqueKey2 = inputManager.generateUniqueKey("", "field");
    console.log("Generated unique keys:", uniqueKey1, uniqueKey2);
    
    // Test addUniqueField
    const addedKey = inputManager.addUniqueField("", "auto", "auto value", "start");
    console.log("Added unique field:", addedKey);
    console.log("Final keys:", Object.keys(inputManager.getData()));
    
    console.log("Final data:", inputManager.getData());
}

/**
 * Test getKeysAtPath
 */
export function testGetKeysAtPath() {
    console.log("\nTesting getKeysAtPath...");
    
    const inputManager = new InputManager({
        level1: {
            level2a: {
                field1: "value1",
                field2: "value2",
                field3: "value3"
            },
            level2b: "simple value"
        },
        topLevel: "top value"
    });
    
    console.log("Keys at root:", inputManager.getKeysAtPath(""));
    console.log("Keys at 'level1':", inputManager.getKeysAtPath("level1"));
    console.log("Keys at 'level1.level2a':", inputManager.getKeysAtPath("level1.level2a"));
    console.log("Keys at non-existent path:", inputManager.getKeysAtPath("nonexistent.path"));
}

/**
 * Test key order preservation
 */
export function testKeyOrderPreservation() {
    console.log("Testing InputManager key order preservation...");
    
    // Create an InputManager with some initial data
    const inputManager = new InputManager({
        firstKey: "first value",
        secondKey: "second value", 
        thirdKey: "third value",
        fourthKey: "fourth value"
    });
    
    console.log("Original data:");
    console.log("Keys:", Object.keys(inputManager.getData()));
    console.log("Data:", inputManager.getData());
    
    // Rename the second key
    inputManager.renameKey("secondKey", "renamedSecond");
    
    console.log("\nAfter renaming 'secondKey' to 'renamedSecond':");
    console.log("Keys:", Object.keys(inputManager.getData()));
    console.log("Data:", inputManager.getData());
    
    // Test with nested objects
    inputManager.setValue("nested.child1", "value1");
    inputManager.setValue("nested.child2", "value2");
    inputManager.setValue("nested.child3", "value3");
    
    console.log("\nAfter adding nested data:");
    const nestedData = inputManager.getValue("nested") as Record<string, unknown>;
    console.log("Nested keys:", Object.keys(nestedData));
    
    // Rename a nested key
    inputManager.renameKey("nested.child2", "renamedChild");
    
    console.log("\nAfter renaming 'nested.child2' to 'renamedChild':");
    const updatedNestedData = inputManager.getValue("nested") as Record<string, unknown>;
    console.log("Nested keys:", Object.keys(updatedNestedData));
    console.log("Nested data:", updatedNestedData);
    
    console.log("\nTest completed! Key order should be preserved.");
}

/**
 * Test edge cases for key renaming
 */
export function testKeyRenameEdgeCases() {
    console.log("\nTesting key rename edge cases...");
    
    const inputManager = new InputManager({
        existingKey: "value"
    });
    
    // Test renaming to same name (should be no-op)
    console.log("Before same-name rename:", Object.keys(inputManager.getData()));
    inputManager.renameKey("existingKey", "existingKey");
    console.log("After same-name rename:", Object.keys(inputManager.getData()));
    
    // Test renaming non-existent key (should be no-op)
    console.log("Before non-existent rename:", Object.keys(inputManager.getData()));
    inputManager.renameKey("nonExistentKey", "newName");
    console.log("After non-existent rename:", Object.keys(inputManager.getData()));
    
    console.log("Edge case tests completed!");
}

/**
 * Test input component key renaming
 */
export function testInputKeyRename() {
    console.log("\nTesting input key renaming...");
    
    const inputManager = new InputManager();
    
    // Mock input components
    const mockInput1 = { type: "text", value: "test1" };
    const mockInput2 = { type: "number", value: 42 };
    const mockInput3 = { type: "boolean", value: true };
    
    // Set inputs
    inputManager.setInput("input1", mockInput1);
    inputManager.setInput("input2", mockInput2);
    inputManager.setInput("input3", mockInput3);
    
    console.log("Original input keys:", Object.keys(inputManager.getInputs()));
    
    // Rename input key
    inputManager.renameInputKey("input2", "renamedInput");
    
    console.log("After renaming 'input2' to 'renamedInput':", Object.keys(inputManager.getInputs()));
    console.log("Renamed input value:", inputManager.getInput("renamedInput"));
    
    console.log("Input key rename test completed!");
}

/**
 * Test insertAfter functionality (template-style positioning)
 */
export function testInsertAfter() {
    console.log("\nTesting insertAfter functionality...");
    
    const inputManager = new InputManager({
        chemical: {
            properties: {
                "melting point": 100,
                "density": 2.5,
                "boiling point": 200
            }
        }
    });
    
    // Test insertAfter as used in activeMaterial template
    inputManager.addKeyAtPosition("chemical.properties", "theoretical capacity", "150 mAh/g", {insertAfter: "density"});
    
    const keys = inputManager.getKeysAtPath("chemical.properties");
    console.log("Keys after insertAfter:", keys);
    
    const expectedOrder = ["melting point", "density", "theoretical capacity", "boiling point"];
    const passed = JSON.stringify(keys) === JSON.stringify(expectedOrder);
    console.log("Expected order:", expectedOrder);
    console.log("Actual order:", keys);
    console.log("Test passed:", passed);
    
    if (!passed) {
        throw new Error("insertAfter functionality failed - order is incorrect");
    }
}

/**
 * Test insertBefore functionality
 */
export function testInsertBefore() {
    console.log("\nTesting insertBefore functionality...");
    
    const inputManager = new InputManager({
        chemical: {
            properties: {
                "melting point": 100,
                "density": 2.5,
                "boiling point": 200
            }
        }
    });
    
    // Test insertBefore
    inputManager.addKeyAtPosition("chemical.properties", "flash point", "50°C", {insertBefore: "boiling point"});
    
    const keys = inputManager.getKeysAtPath("chemical.properties");
    console.log("Keys after insertBefore:", keys);
    
    const expectedOrder = ["melting point", "density", "flash point", "boiling point"];
    const passed = JSON.stringify(keys) === JSON.stringify(expectedOrder);
    console.log("Expected order:", expectedOrder);
    console.log("Actual order:", keys);
    console.log("Test passed:", passed);
    
    if (!passed) {
        throw new Error("insertBefore functionality failed - order is incorrect");
    }
}

/**
 * Test template-style positioning with input components
 */
export function testTemplateStyleInputPositioning() {
    console.log("\nTesting template-style input positioning...");
    
    const inputManager = new InputManager();
    
    // Simulate setting up existing inputs
    inputManager.setInput("chemical.properties.melting point", {inputType: "number", units: ["°C"]});
    inputManager.setInput("chemical.properties.density", {inputType: "number", units: ["g/cm³"]});
    inputManager.setInput("chemical.properties.boiling point", {inputType: "number", units: ["°C"]});
    
    // Add new input with insertAfter positioning
    inputManager.addInputAtPosition("chemical.properties", "theoretical capacity", 
        {inputType: "number", units: ["mAh/g"], defaultUnit: "mAh/g"}, 
        {insertAfter: "density"});
    
    // Check that input was added correctly
    const input = inputManager.getInput("chemical.properties.theoretical capacity");
    console.log("Added input:", input);
    
    const passed = input && input.inputType === "number" && input.units.includes("mAh/g");
    console.log("Input positioning test passed:", passed);
    
    if (!passed) {
        throw new Error("Template-style input positioning failed");
    }
}

/**
 * Test convenience methods for template-style positioning
 */
export function testTemplateConvenienceMethods() {
    console.log("\nTesting template convenience methods...");
    
    const inputManager = new InputManager({
        chemical: {
            properties: {
                "density": 2.5,
                "boiling point": 200
            }
        }
    });
    
    // Test addFieldWithInsertAfter
    inputManager.addFieldWithInsertAfter("chemical.properties", "theoretical capacity", "150 mAh/g", "density");
    
    const keys = inputManager.getKeysAtPath("chemical.properties");
    console.log("Keys after addFieldWithInsertAfter:", keys);
    
    const expectedOrder = ["density", "theoretical capacity", "boiling point"];
    const passed = JSON.stringify(keys) === JSON.stringify(expectedOrder);
    console.log("Expected order:", expectedOrder);
    console.log("Actual order:", keys);
    console.log("Convenience method test passed:", passed);
    
    if (!passed) {
        throw new Error("Template convenience methods failed");
    }
}

/**
 * Run all tests including the new template-style positioning tests
 */
export function runAllTests() {
    console.log("=== Running InputManager Tests ===");
    testAddKeyAtPosition();
    testConvenienceMethods();
    testGetKeysAtPath();
    testKeyOrderPreservation();
    testKeyRenameEdgeCases();
    testInputKeyRename();
    testInsertAfter();
    testInsertBefore();
    testTemplateStyleInputPositioning();
    testTemplateConvenienceMethods();
    console.log("=== All tests completed ===");
}

/**
 * Expected behavior validation:
 * 
 * BEFORE (old implementation):
 * Original keys: ["firstKey", "secondKey", "thirdKey", "fourthKey"]
 * After rename: ["firstKey", "thirdKey", "fourthKey", "renamedSecond"] // Wrong! Order changed
 * 
 * AFTER (new implementation):
 * Original keys: ["firstKey", "secondKey", "thirdKey", "fourthKey"]
 * After rename: ["firstKey", "renamedSecond", "thirdKey", "fourthKey"] // Correct! Order preserved
 */
