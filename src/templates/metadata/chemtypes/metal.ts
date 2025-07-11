export const metalSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.shape",
            "input": {
                "query": true,
                "inputType": "dropdown",
                "options": ["powder", "rod", "foil", "sheet", "mesh", "granule", "wire", "other"],
            }
        },
        {
            "fullKey": "chemical.properties.alloy",
            "input": {
                "query": true,
                "inputType": "boolean",
                "default": false,
            }
        },
    ],
    "remove": [
        "chemical.properties.solubility in water"
    ],
}