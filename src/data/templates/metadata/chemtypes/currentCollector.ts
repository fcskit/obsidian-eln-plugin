export const currentCollectorSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.thickness",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["µm", "mm"],
                "defaultUnit": "µm",
            }
        },
        {
            "fullKey": "chemical.properties.coating",
            "input": {
                "query": true,
                "inputType": "boolean",
                "default": false,
            }
        },
    ],
    "remove": [
        "chemical.properties.solubility in water",
        "chemical.properties.boiling point",
        "chemical.properties.melting point",
    ],
}