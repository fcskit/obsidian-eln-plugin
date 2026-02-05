// Test list value conversion for PrimitiveValue compatibility
const testValues = [
    ["test-note", "refactored-modal"],  // string array
    [1, 2, 3],  // number array
    ["mixed", 123, "values"]  // mixed array
];

console.log("🧪 Testing list value conversion...");

testValues.forEach((listValue, index) => {
    console.log(`\n✅ Test ${index + 1}: Original value:`, listValue);
    
    // Test string conversion
    const stringArray = listValue.map(item => String(item));
    console.log(`   String array:`, stringArray);
    
    // Test number conversion
    const numberArray = listValue.map(item => 
        typeof item === 'number' ? item : parseFloat(String(item)) || 0
    );
    console.log(`   Number array:`, numberArray);
    
    // Test comma-separated string (like LabeledPrimitiveInput would show)
    const commaString = stringArray.join(", ");
    console.log(`   Comma string:`, commaString);
});

console.log("\n🎯 Test completed!");
