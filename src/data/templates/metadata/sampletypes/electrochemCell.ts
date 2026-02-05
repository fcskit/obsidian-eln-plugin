export const electrochemCellSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "sample.cell",
            "input": {
                "query": true,
                "inputType": "query",
                "search": "#electrochemical cell",
                "default": "",
                "return": ["electrochemical cell.name", "electrochemical cell.type"]
            }
        },
        {
            "fullKey": "sample.working electrode",
            "input": {
                "query": true,
                "inputType": "query",
                "search": "#sample",
                "where": "sample.type = 'electrode'",
                "default": "",
                "return": ["sample.name"]
            },
        },
        {
            "fullKey": "sample.working electrode.active material mass",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "defaultUnit": "mg",
                "units": ["mg", "g", "kg"],
            },
        },
        {
            "fullKey": "sample.working electrode.total mass",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "defaultUnit": "mg",
                "units": ["mg", "g", "kg"],
            }
        },
        {
            "fullKey": "sample.working electrode.area",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "defaultUnit": "cm2",
                "units": ["cm2", "m2"],
            }
        },
        {
            "fullKey": "sample.counter electrode",
            "input": {
                "query": true,
                "inputType": "query",
                "search": "#electrode/standard",
                "default": "",
                "return": ["electrode.name"]
            },
        },
        {
            "fullKey": "sample.reference electrode",
            "input": {
                "query": true,
                "inputType": "query",
                "search": "#electrode/reference",
                "default": "",
                "return": ["electrode.name"]
            },
        },
        {
            "fullKey": "sample.electrolyte",
            "input": {
                "query": true,
                "inputType": "query",
                "search": "#chemical",
                "where": "chemical.type = 'electrolyte'",
                "default": "",
                "return": ["chemical.name"]
            },
        },
        {
            "fullKey": "sample.electrolyte.volume",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "defaultUnit": "mL",
                "units": ["mL", "L", "µL"],
            }
        },
        {
            "fullKey": "sample.separator",
            "input": {
                "query": true,
                "inputType": "query",
                "search": "#chemical",
                "where": "chemical.type = 'separator'",
                "default": "",
                "return": ["chemical.name"]
            },
        },
        {
            "fullKey": "sample.separator.layers",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
            }
        },
    ],
}