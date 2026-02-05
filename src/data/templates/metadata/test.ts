import type { MetaDataTemplate } from "../../../types";

export const testNoteTemplate: MetaDataTemplate = {
    title: {
        inputType: "text",
        default: "",
        placeholder: "Enter note title...",
        editable: true,
        required: true,
        query: true
    },
    description: {
        inputType: "text", 
        default: "Default description for test note",
        placeholder: "Enter description...",
        editable: true,
        multiline: true,
        query: true
    },
    priority: {
        inputType: "dropdown",
        default: "medium",
        options: ["low", "medium", "high"],
        editable: true,
        query: true
    },
    status: {
        inputType: "multiselect",
        default: "open",
        options: ["open", "in-progress", "closed"],
        editable: true,
        query: true
    },
    tags: {
        inputType: "list",
        type: "string",
        default: ["test-note", "refactored-modal"],
        editable: true,
        query: true
    },
    keywords: {
        inputType: "list",
        type: "string", 
        default: ["keyword1", "keyword2", "keyword3"],
        placeholder: "Enter comma-separated keywords...",
        editable: true,
        query: true
    },
    measurements: {
        inputType: "list",
        type: "number",
        default: [1.5, 2.0, 3.5, 4.2],
        placeholder: "Enter comma-separated numbers...",
        editable: true,
        query: true
    },
    temperatures: {
        inputType: "list", 
        type: "number",
        default: [25, 50, 75, 100],
        editable: true,
        query: true
    },
    conditions: {
        inputType: "list",
        type: "boolean",
        default: [true, false, true, false],
        placeholder: "Enter comma-separated true/false values...",
        editable: true,
        query: true
    },
    experimentalFlags: {
        inputType: "list",
        type: "boolean",
        default: [true, true, false],
        editable: true,
        query: true  
    },
    importantDates: {
        inputType: "list",
        type: "date",
        default: ["2025-01-15", "2025-02-20", "2025-03-10"],
        placeholder: "Enter comma-separated dates (YYYY-MM-DD)...",
        editable: true,
        query: true
    },
    deadlines: {
        inputType: "list",
        type: "date", 
        default: ["2025-08-15", "2025-09-01"],
        editable: true,
        query: true
    },
    emptyStringList: {
        inputType: "list",
        type: "string",
        default: [],
        placeholder: "Start with an empty string list...",
        editable: true,
        query: true
    },
    emptyNumberList: {
        inputType: "list", 
        type: "number",
        default: [],
        placeholder: "Start with an empty number list...",
        editable: true,
        query: true
    },
    date: {
        inputType: "date",
        default: { type: "function", context: ["date"], expression: "date.today" },
        editable: true,
        query: true
    },
    metadata: {
        created: {
            inputType: "date",
            default: { type: "function", context: ["date"], expression: "date.today" },
            editable: false, // Readonly field to test mixed mode
            query: false
        },
        author: {
            inputType: "text",
            default: "Test User",
            editable: true,
            query: true
        },
        category: {
            inputType: "text",
            default: "General",
            editable: true,
            query: true
        }
    }
};
