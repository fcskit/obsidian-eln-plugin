// Unified Note Subclass Template Interface
// This is an experimental structure for subclass templates that could be used
// with the unified NoteTemplate structure. Currently not implemented in the plugin.
// Using a flexible type definition since this is exploratory work.
interface NoteSubclassTemplate {
    name: string;
    abbreviation: string;
    template: {
        metadata: {
            add?: Array<{
                fullKey: string;
                insertAfter?: string;
                input: Record<string, unknown>; // Flexible type for experimental features
            }>;
            remove?: string[];
            replace?: Array<{
                fullKey: string;
                newKey: string;
                input: Record<string, unknown>; // Flexible type for experimental features
            }>;
        };
        markdown?: {
            default: boolean;
            content: string;
        };
    };
}

const sampleSubClassTemplates: NoteSubclassTemplate[] = [
    {
        name: "compound",
        abbreviation: "cp",
        template: {
            metadata: {
                "add": [
                        {
                        "fullKey": "sample.total mass",
                        "input": {
                            "query": true,
                            "inputType": "number",
                            "default": 0,
                            "defaultUnit": "mg",
                            "units": ["mg", "g", "kg"],
                        },
                    },
                    {
                        "fullKey": "sample.product.chemical formula",
                        "input": {
                            "query": true,
                            "inputType": "text",
                            "default": "",
                            "placeholder": "Enter the chemical formula"
                        },
                    },
                    {
                        "fullKey": "sample.product.smiles",
                        "input": {
                            "query": true,
                            "inputType": "text",
                            "default": "",
                            "placeholder": "Enter the SMILES representation"
                        },
                    },
                    {
                        "fullKey": "sample.product.molar mass",
                        "input": {
                            "query": true,
                            "inputType": "number",
                            "default": 0,
                            "defaultUnit": "g/mol",
                            "units": ["g/mol"],
                        },
                    },
                    {
                        "fullKey": "sample.product.yield",
                        "input": {
                            "query": true,
                            "inputType": "number",
                            "default": 0,
                            "defaultUnit": "%",
                            "units": ["%", "mg", "g", "kg"],
                        },
                    },
                    {
                        "fullKey": "sample.educts",
                        "input": {
                            "query": true,
                            "inputType": "list",
                            "listType": "object",
                            "initialItems": 1,
                            "objectTemplate": {
                                "name": {
                                    "query": true,
                                    "inputType": "queryDropdown",
                                    "search": "chemical",
                                    "where": [
                                        {
                                            "field": "chemical.field of use",
                                            "contains": "synthesis"
                                        }
                                    ],
                                },
                                "amount": {
                                    "query": true,
                                    "inputType": "number",
                                    "default": 0,
                                    "defaultUnit": "mg",
                                    "units": ["mg", "g", "kg", "ml", "l", "mol", "mmol"],
                                },
                            },
                        }
                    },
                    {
                        "fullKey": "sample.side products",
                        "input": {
                            "query": true,
                            "inputType": "list",
                            "listType": "object",
                            "initialItems": 1,
                            "objectTemplate": {
                                "name": {
                                    "query": true,
                                    "inputType": "text",
                                    "placeholder": "Enter side product name",
                                    "default": "",
                                },
                                "amount": {
                                    "query": true,
                                    "inputType": "number",
                                    "default": 0,
                                    "defaultUnit": "mg",
                                    "units": ["%", "mg", "g", "kg"],
                                }
                            },
                        }
                    },
                ],
            },
            markdown: {
                default: true,
                content: ``,  // Set default to false and add custom markdown content
                              //  for subclass if needed
            },
        },
    },
    {
        name: "electrode",
        abbreviation: "el",
        template: {
            metadata: {
                "add": [],
            },
            markdown: {
                default: true,
                content: ``,  // Set default to false and add custom markdown content
                              //  for subclass if needed
            },
        },
    },
    {
        name: "electrochemical cell",
        abbreviation: "ec",
        template: {
            metadata: {
                "add": [],
            },
            markdown: {
                default: true,
                content: ``,  // Set default to false and add custom markdown content
                              //  for subclass if needed
            },
        },
    },
];

export default sampleSubClassTemplates;
