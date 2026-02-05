/**
 * Example template demonstrating reactive user input dependencies
 * 
 * This example shows how to use the `userInputs` field to create fields
 * that automatically update when other user input fields change.
 */

import type { MetaDataTemplate } from "../../src/types";

export const exampleReactiveTemplate: MetaDataTemplate = {
    // Base input field that other fields will depend on
    chemical: {
        type: {
            query: true,
            inputType: "dropdown",
            options: ["polymer", "metal", "ceramic", "composite"],
            default: "polymer"
        },
        
        name: {
            query: true,
            inputType: "text",
            default: "",
            info: "Enter the chemical name"
        }
    },

    // Field that reacts to chemical.type changes
    tags: {
        query: false,
        inputType: "list",
        default: {
            type: "function",
            value: "chemical.type ? [`chemical/${chemical.type}`, 'chemistry'] : ['chemistry']"
        },
        userInputs: ["chemical.type"], // Automatically updates when chemical.type changes
        info: "Tags are automatically generated based on chemical type"
    },

    // Field that reacts to both chemical.type and chemical.name
    filename: {
        query: false,
        inputType: "text",
        default: {
            type: "function",
            value: "`${chemical.name || 'unnamed'}_${chemical.type || 'unknown'}_${new Date().toISOString().split('T')[0]}`"
        },
        userInputs: ["chemical.type", "chemical.name"], // Updates when either field changes
        info: "Filename is automatically generated from name and type"
    },

    // Complex reactive options based on chemical type
    relatedProperties: {
        query: true,
        inputType: "multiselect",
        options: {
            type: "function",
            value: `
                if (chemical.type === 'polymer') {
                    return ['molecular weight', 'glass transition temperature', 'melting point'];
                } else if (chemical.type === 'metal') {
                    return ['density', 'melting point', 'electrical conductivity'];
                } else if (chemical.type === 'ceramic') {
                    return ['hardness', 'thermal conductivity', 'dielectric constant'];
                } else {
                    return ['density', 'melting point'];
                }
            `
        },
        userInputs: ["chemical.type"], // Options change based on chemical type
        info: "Available properties depend on the chemical type selected"
    },

    // Conditional visibility based on user input
    polymerSpecific: {
        molecularWeight: {
            query: true,
            inputType: "number",
            default: {
                type: "function",
                value: "chemical.type === 'polymer' ? 1000 : null"
            },
            userInputs: ["chemical.type"],
            units: ["g/mol"],
            defaultUnit: "g/mol",
            info: "Only relevant for polymers"
        }
    },

    // Reactive default based on multiple fields with callback
    computedDescription: {
        query: false,
        inputType: "text", 
        default: {
            type: "function",
            value: "`This is a ${chemical.type || 'unknown'} chemical named ${chemical.name || 'unnamed'}`"
        },
        userInputs: ["chemical.type", "chemical.name"],
        callback: {
            type: "function",
            value: "(value) => value.toLowerCase()"
        },
        info: "Automatically generated description in lowercase"
    },

    // Example with nested dependencies
    analysis: {
        requiredMethods: {
            query: true,
            inputType: "list",
            default: {
                type: "function",
                value: `
                    const methods = [];
                    if (chemical.type === 'polymer') {
                        methods.push('DSC', 'TGA', 'GPC');
                    }
                    if (chemical.type === 'metal') {
                        methods.push('XRD', 'SEM', 'EDS');
                    }
                    if (chemical.name && chemical.name.includes('nano')) {
                        methods.push('DLS', 'TEM');
                    }
                    return methods.length > 0 ? methods : ['basic characterization'];
                `
            },
            userInputs: ["chemical.type", "chemical.name"],
            info: "Analysis methods are suggested based on chemical type and name"
        }
    }
};
