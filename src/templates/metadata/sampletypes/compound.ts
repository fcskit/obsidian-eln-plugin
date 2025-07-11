export const compoundSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "sample.chemical formula",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
            },
        },
        {
            "fullKey": "sample.smiles",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
            },
        },
        {
            "fullKey": "sample.molar mass",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "defaultUnit": "g/mol",
                "units": ["g/mol"],
            },
        },
        {
            "fullKey": "sample.educts",
            "input": {
                "query": true,
                "inputType": "objectList",
                "object": [
                    {
                        "query": true,
                        "key": "name",
                        "inputType": "queryDropdown",
                        "search": [
                            {
                                "tag": "chemical",
                                "where": [
                                    {
                                        "field": "chemical.field of use",
                                        "is": "synthesis",
                                    },
                                ],
                            },
                            {
                                "tag": "sample",
                                "where": [
                                    {
                                        "field": "project.name",
                                        "is": "this.project.name",
                                    },
                                ],
                            },
                        ]   
                    },
                    {
                        "query": true,
                        "key": "mass",
                        "inputType": "number",
                        "default": "0",
                        "defaultUnit": "mg",
                        "units": ["mg", "g", "kg"],
                    },
                ]
            }
        },
        {
            "fullKey": "sample.side products",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
            },
        },
    ],
}