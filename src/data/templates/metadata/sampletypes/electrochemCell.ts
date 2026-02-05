export const electrochemCellSubclassMetadataTemplate = {
    "add": [
        // TODO: This syntax is inconsistent - fullKey should match the primary return field
        // Consider refactoring to new query syntax where fullKey points to the object, not the field
        {
            "fullKey": "sample.cell.name",
            "input": {
                "query": true,
                "inputType": "queryDropdown",
                "search": "echemcell",
                "return": {
                    "sample.cell.name": "cell.name",
                    "sample.cell.link": "file.link",
                    "sample.cell.type": "cell.type"
                }
            }
        },
        {
            "fullKey": "sample.working electrode.name",
            "input": {
                "query": true,
                "inputType": "queryDropdown",
                "search": "sample",
                "where": [
                    {
                        "field": "sample.type",
                        "is": "electrode"
                    }
                ],
                "return": {
                    "sample.working electrode.name": "sample.name",
                    "sample.working electrode.link": "file.link"
                }
            },
        },
        {
            "fullKey": "sample.working electrode.active material mass",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "defaultUnit": "mg",
                "units": ["mg", "g", "kg"],
            },
        },
        {
            "fullKey": "sample.working electrode.total mass",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "defaultUnit": "mg",
                "units": ["mg", "g", "kg"],
            }
        },
        {
            "fullKey": "sample.working electrode.area",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "defaultUnit": "cm2",
                "units": ["cm2", "m2"],
            }
        },
        // TODO: Fix syntax - fullKey should be "sample.counter electrode.name"
        {
            "fullKey": "sample.counter electrode.name",
            "input": {
                "query": true,
                "inputType": "queryDropdown",
                "search": "sample",
                "where": [
                    {
                        "field": "sample.type",
                        "is": "electrode"
                    }
                ],
                "return": {
                    "sample.counter electrode.name": "sample.name",
                    "sample.counter electrode.link": "file.link"
                }
            },
        },
        // TODO: Fix syntax - fullKey should be "sample.reference electrode.name"
        {
            "fullKey": "sample.reference electrode.name",
            "input": {
                "query": true,
                "inputType": "queryDropdown",
                "search": "electrode/reference",
                "return": {
                    "sample.reference electrode.name": "electrode.name",
                    "sample.reference electrode.link": "file.link"
                }
            },
        },
        {
            "fullKey": "sample.electrolyte.name",
            "input": {
                "query": true,
                "inputType": "queryDropdown",
                "search": "chemical",
                "where": [
                    {
                        "field": "chemical.type",
                        "is": "electrolyte"
                    }
                ],
                "return": {
                    "sample.electrolyte.name": "chemical.name",
                    "sample.electrolyte.link": "file.link"
                }
            },
        },
        {
            "fullKey": "sample.electrolyte.volume",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "defaultUnit": "mL",
                "units": ["mL", "L", "µL"],
            }
        },
        {
            "fullKey": "sample.separator.name",
            "input": {
                "query": true,
                "inputType": "queryDropdown",
                "search": "chemical",
                "where": [
                    {
                        "field": "chemical.type",
                        "is": "separator"
                    }
                ],
                "return": {
                    "sample.separator.name": "chemical.name",
                    "sample.separator.link": "file.link"
                }
            },
        },
        {
            "fullKey": "sample.separator.layers",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
            }
        },
    ],
}