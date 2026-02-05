/**
 * Test script to verify object type support in LabeledPrimitiveInput
 * This is a compile-time test to ensure type definitions work correctly.
 */

import { PrimitiveType, PrimitiveValue } from "../src/ui/modals/components/LabeledPrimitiveInput";

// Test: Verify "object" is included in PrimitiveType
const testObjectType: PrimitiveType = "object";
console.log("✓ Object type is supported in PrimitiveType union:", testObjectType);

// Test: Verify Record<string, unknown> is included in PrimitiveValue
const testObjectValue: PrimitiveValue = { 
    key1: "value1", 
    key2: 42, 
    key3: true, 
    nested: { subkey: "nested value" } 
};
console.log("✓ Record<string, unknown> is supported in PrimitiveValue union:", typeof testObjectValue);

// Test: Verify all other existing types still work
const testStringType: PrimitiveType = "text";
const testNumberType: PrimitiveType = "number";
const testBooleanType: PrimitiveType = "boolean";
const testDateType: PrimitiveType = "date";
const testNumberWithUnitType: PrimitiveType = "number with unit";
const testListStringType: PrimitiveType = "list (string)";
const testListNumberType: PrimitiveType = "list (number)";
const testListBooleanType: PrimitiveType = "list (boolean)";
const testListDateType: PrimitiveType = "list (date)";

console.log("✓ All primitive types are supported:", {
    testStringType,
    testNumberType,
    testBooleanType,
    testDateType,
    testObjectType,
    testNumberWithUnitType,
    testListStringType,
    testListNumberType,
    testListBooleanType,
    testListDateType
});

console.log("✓ All object type support tests passed at compile time");

export {};