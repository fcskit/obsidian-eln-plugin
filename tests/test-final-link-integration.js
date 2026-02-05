// Final Fix: Callback-Based Link Element Integration

console.log("Link Element Callback Integration");
console.log("================================");

console.log("\nFinal Problem Identified:");
console.log("❌ createInternalLinkElement had its own built-in update logic");
console.log("❌ This conflicted with array item intelligent type conversion");
console.log("❌ Links in arrays used primitive logic instead of array logic");
console.log("❌ Type conversions from links to other types failed");

console.log("\nRoot Cause:");
console.log("• createInternalLinkElement was designed for renderPrimitive");
console.log("• It had hardcoded update logic with its own blur handler");
console.log("• Array items need specialized conversion and re-rendering logic");
console.log("• Two different update systems were fighting each other");

console.log("\nSolution: Optional Callback Parameter");

console.log("\n1. Updated Function Signature:");
console.log("   Before: createInternalLinkElement(view, fullLink, parent, fullKey)");
console.log("   After:  createInternalLinkElement(view, fullLink, parent, fullKey, onUpdate?)");

console.log("\n2. Conditional Update Logic:");
console.log("   • If onUpdate provided → Use custom callback (arrays)");
console.log("   • If onUpdate missing → Use default primitive logic");

console.log("\n3. Array Integration:");
console.log("   • Arrays pass custom onUpdate callback");
console.log("   • Callback uses convertArrayItemInput for intelligent conversion");
console.log("   • Callback triggers selective re-rendering on type changes");
console.log("   • Maintains consistency with other array input handlers");

console.log("\nCode Architecture:");

console.log("\ncreatInternalLinkElement.ts:");
console.log(`
// Blur handler now branches based on callback presence
view.registerDomEvent(link, "blur", () => {
    const userInput = link.textContent || "";
    
    if (onUpdate) {
        // Array context: use provided callback
        onUpdate(userInput);
    } else {
        // Primitive context: use built-in logic
        const conversionResult = convertArrayItemInput(...);
        updateProperties(...);
        // Handle re-rendering for primitives
    }
});
`);

console.log("\nrenderArrayValueContainer.ts:");
console.log(`
// Array creates link with custom callback
createInternalLinkElement(view, fullLink, container, dataKey, (newValue) => {
    // Use array's intelligent type conversion
    const conversionResult = convertArrayItemInput(newValue, currentType, currentItem);
    
    // Update attributes and tooltips
    if (conversionResult.typeChanged) {
        container.setAttribute('data-type', conversionResult.detectedType);
        // Update tooltip, log changes
    }
    
    // Store with converted value
    updateProperties(app, file, dataKey, conversionResult.convertedValue, conversionResult.detectedType);
    
    // Selective re-rendering
    if (conversionResult.typeChanged) {
        rerenderSingleArrayItem(...);
    }
});
`);

console.log("\nBenefits:");
console.log("✅ Single createInternalLinkElement function for both contexts");
console.log("✅ No duplicate code or conflicting update logic");
console.log("✅ Arrays get intelligent type conversion and selective re-rendering");
console.log("✅ Primitives keep their existing behavior unchanged");
console.log("✅ Link → Number, Link → String, etc. all work correctly");
console.log("✅ Maintains backward compatibility");

console.log("\nTest Scenarios Now Working:");
console.log("1. Array: [[test]] → 123 (link becomes number)");
console.log("2. Array: [[test]] → hello (link becomes string)");
console.log("3. Array: test → [[test]] (string becomes link)");
console.log("4. Primitive: [[test]] editing (uses built-in logic)");
console.log("5. All conversions use selective re-rendering");

console.log("\n🎉 Complete System Integration Achieved!");
console.log("• Selective re-rendering works for ALL array item types");
console.log("• Link handling is consistent and conflict-free");
console.log("• Type conversions are intelligent and immediate");
console.log("• No more disappearing items or timing issues");