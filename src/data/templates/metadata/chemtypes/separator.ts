export const separatorSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.separator type",
            "input": {
                "query": true,
                "inputType": "dropdown",
                "options": [
                    "polymer separator",
                    "ceramic separator",
                    "composite separator",
                    "glass separator",
                    "other",
                ],
            }
        },
        {
            "fullKey": "chemical.properties.materials",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
            },
        },
        {
            "fullKey": "chemical.properties.layers",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 1,
            },
        },
        {
            "fullKey": "chemical.properties.permeability",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["gurley (s)", "L/m²·s"],
                "defaultUnit": "gurley (s)",
            },
        },
        {
            "fullKey": "chemical.properties.thickness",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["µm", "mm"],
                "defaultUnit": "µm",
            },
        },
        {
            "fullKey": "chemical.properties.porosity",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["%"],
                "defaultUnit": "%",
            },
        },
        {
            "fullKey": "chemical.properties.tensile strength",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["MPa", "psi"],
                "defaultUnit": "MPa",
            },
        },
        {
            "fullKey": "chemical.properties.thermal stability",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["°C", "K"],
                "defaultUnit": "°C",
            },
        },
        {
            "fullKey": "chemical.properties.shutdown temperature",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["°C", "K"],
                "defaultUnit": "°C",
            },
        },
        {
            "fullKey": "chemical.properties.wetting angle",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["°"],
                "defaultUnit": "°",
            },
        }
    ],
    "remove": [
        "chemical.properties.solubility in water"
    ],
}