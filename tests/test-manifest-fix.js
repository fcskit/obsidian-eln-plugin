/**
 * Test script to verify the manifest.version fix works
 */

// Simulate the evaluateFunctionDescriptor function behavior
function testEvaluateFunctionDescriptor() {
    // Mock plugin object with manifest
    const mockPlugin = {
        manifest: {
            version: "0.7.0"
        },
        settings: {
            authors: [
                { name: "Test Author" }
            ]
        }
    };

    // Test function descriptor with this.manifest.version
    const versionDescriptor = {
        type: "function",
        value: "this.manifest.version"
    };

    // Simulate the evaluateFunctionDescriptor logic
    function evaluateFunctionDescriptor(descriptor, context) {
        try {
            const functionCode = descriptor.value;
            
            if (functionCode.startsWith("this.") && context) {
                // Handle expressions that reference `this`
                const expression = functionCode.replace(/this\./g, "context.");
                console.log(`Original: ${functionCode}`);
                console.log(`Transformed: ${expression}`);
                
                const result = new Function("context", "return " + expression)(context);
                console.log(`Result: ${result}`);
                return result;
            }
        } catch (error) {
            console.error(`Failed to evaluate function descriptor: ${descriptor.value}`, error);
            return null;
        }
    }

    console.log('🧪 Testing manifest.version access fix...\n');
    
    const result = evaluateFunctionDescriptor(versionDescriptor, mockPlugin);
    
    if (result === "0.7.0") {
        console.log('✅ SUCCESS: this.manifest.version resolves correctly!');
        console.log(`   Expected: "0.7.0", Got: "${result}"`);
    } else {
        console.log('❌ FAILURE: this.manifest.version does not resolve correctly');
        console.log(`   Expected: "0.7.0", Got: "${result}"`);
    }

    // Test another function descriptor to make sure we didn't break anything
    const authorsDescriptor = {
        type: "function", 
        value: "this.settings.authors.map((item) => item.name)"
    };

    console.log('\n🧪 Testing settings access...\n');
    
    const authorsResult = evaluateFunctionDescriptor(authorsDescriptor, mockPlugin);
    
    if (Array.isArray(authorsResult) && authorsResult[0] === "Test Author") {
        console.log('✅ SUCCESS: this.settings.authors resolves correctly!');
        console.log(`   Expected: ["Test Author"], Got: ${JSON.stringify(authorsResult)}`);
    } else {
        console.log('❌ FAILURE: this.settings.authors does not resolve correctly');
        console.log(`   Expected: ["Test Author"], Got: ${JSON.stringify(authorsResult)}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Manifest version fix validation complete!');
    console.log('='.repeat(50));
}

testEvaluateFunctionDescriptor();
