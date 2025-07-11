export const currentCollectorSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.thickness",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "units": "µm",
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
        "chemical.properties.solubility in water"
    ],
}