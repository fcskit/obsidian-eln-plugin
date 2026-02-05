export const inorganicCompoundSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.shape",
            "insertAfter": "chemical.properties.density",
            "input": {
                "query": true,
                "inputType": "dropdown",
                "options": ["powder", "rod", "sheet", "mesh", "granule", "other"],
            }
        },
        {
            "fullKey": "chemical.properties.particle size",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["mm","µm", "nm"],
                "defaultUnit": "µm",
            }
        },
        {
            "fullKey": "chemical.properties.crystal structure",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
            }
        },
    ],
}