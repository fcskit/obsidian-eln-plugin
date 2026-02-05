// Quick test to verify default value extraction
const testTemplate = {
    title: {
        inputType: "text",
        default: "",
        placeholder: "Enter note title...",
        editable: true,
        required: true,
        query: true
    },
    priority: {
        inputType: "dropdown",
        default: "medium",
        options: ["low", "medium", "high"],
        editable: true,
        query: true
    },
    metadata: {
        created: {
            inputType: "date",
            default: { type: "function", value: "new Date().toISOString().split('T')[0]" },
            editable: false,
            query: false
        },
        author: {
            inputType: "text",
            default: "Test User",
            editable: true,
            query: true
        }
    }
};

console.log("🧪 Testing default value extraction...");

// Test simple default values
console.log("✅ Title default:", testTemplate.title.default);
console.log("✅ Priority default:", testTemplate.priority.default);
console.log("✅ Author default:", testTemplate.metadata.author.default);

// Test function descriptor
const functionDescriptor = testTemplate.metadata.created.default;
console.log("✅ Function descriptor:", functionDescriptor);

if (functionDescriptor && typeof functionDescriptor === 'object' && functionDescriptor.type === 'function') {
    try {
        const result = eval(functionDescriptor.value);
        console.log("✅ Function result:", result);
    } catch (error) {
        console.log("❌ Function evaluation failed:", error);
    }
}

console.log("🎯 Test completed!");
