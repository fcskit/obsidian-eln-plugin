/**
 * Example template demonstrating the "list" input type
 * 
 * The "list" input type allows users to enter comma-separated values
 * that are automatically converted to arrays based on the dataType:
 * - "text" (default): returns string[]
 * - "number": returns number[] 
 * - "boolean": returns boolean[]
 * 
 * Default values can be provided as:
 * - Arrays: ["tag1", "tag2"] (recommended for existing templates)
 * - Strings: "tag1, tag2" (comma-separated)
 */

import type { MetaDataTemplate } from "../../src/types";

export const exampleListTemplate: MetaDataTemplate = {
    // Example 1: Text list with array default (most common pattern)
    tags: {
        query: true,
        inputType: "list",
        default: ["chemistry", "analysis"], // Array default
        info: "Enter comma-separated tags for this note"
    },

    // Example 2: Text list with string default
    keywords: {
        query: true,
        inputType: "list",
        default: "research, experiment, data", // String default
        info: "Enter comma-separated keywords"
    },

    // Example 3: Number list with array default
    temperatures: {
        query: true,
        inputType: "list",
        dataType: "number",
        default: [25, 50, 75], // Array of numbers
        info: "Enter comma-separated temperature values in Celsius"
    },

    // Example 4: Number list with string default
    pressures: {
        query: true,
        inputType: "list",
        dataType: "number",
        default: "1.0, 2.5, 5.0", // String that will be parsed as numbers
        info: "Enter comma-separated pressure values in bar"
    },

    // Example 5: Boolean list
    conditions: {
        query: true,
        inputType: "list",
        dataType: "boolean", 
        default: [true, false, true], // Array of booleans
        info: "Enter comma-separated boolean values for experimental conditions"
    },

    // Example 6: List with function descriptor default
    authors: {
        query: true,
        inputType: "list",
        default: {
            type: "function",
            value: "this.app.vault.getName().split(' ')" // Will be evaluated to get vault name as array
        },
        info: "Enter comma-separated author names"
    },

    // Example 7: List with callback function for post-processing
    processedKeywords: {
        query: true,
        inputType: "list",
        default: ["Science", "Research"],
        callback: {
            type: "function",
            value: "(values) => values.map(v => v.toLowerCase().trim())" // Convert to lowercase
        },
        info: "Enter comma-separated keywords (will be converted to lowercase)"
    }
};
