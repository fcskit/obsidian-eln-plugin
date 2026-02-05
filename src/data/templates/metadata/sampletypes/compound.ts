export const compoundSubclassMetadataTemplate = {
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
                        "return": {
                            "sample.educts.name": "chemical.name",
                            "sample.educts.link": "file.link",
                        },
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
}