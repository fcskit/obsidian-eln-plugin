import { ChemicalLookup } from "./src/core/api/ChemicalLookup";
import type { FormData, FormFieldValue } from "./src/types";

// Mock plugin object
const mockPlugin = {
    manifest: { version: "0.7.0" },
    settings: {},
    app: null
};

// Mock form data and update field function
const formData: FormData = {};
const updateField = (fieldKey: string, value: FormFieldValue) => {
    console.log(`Updating field ${fieldKey} with value:`, value);
};

// Test the chemical lookup
async function testChemicalLookup() {
    console.log("Testing ChemicalLookup integration...");
    
    const chemicalLookup = new ChemicalLookup(mockPlugin as any);
    
    try {
        console.log("Testing NIST CACTUS lookup for 'water'...");
        await chemicalLookup.resolveChemicalIdentifier("water", formData, updateField);
        
        console.log("Testing CAS Common Chemistry lookup for 'caffeine'...");
        await chemicalLookup.resolveChemicalIdentifierCAS("caffeine", formData, updateField);
        
        console.log("ChemicalLookup test completed successfully!");
    } catch (error) {
        console.error("ChemicalLookup test failed:", error);
    }
}

// Run the test if this script is executed directly
if (require.main === module) {
    testChemicalLookup();
}

export { testChemicalLookup };
