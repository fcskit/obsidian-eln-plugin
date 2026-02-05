// Test list default value extraction
const testTemplate = {
    tags: {
        inputType: "list",
        type: "string",
        default: ["test-note", "refactored-modal"],
        editable: true,
        query: true
    }
};

console.log("🧪 Testing list default value extraction...");
console.log("✅ Template default:", testTemplate.tags.default);
console.log("✅ Is array:", Array.isArray(testTemplate.tags.default));
console.log("✅ Array values:", testTemplate.tags.default);
console.log("✅ Type field:", testTemplate.tags.type);
console.log("🎯 Test completed!");
