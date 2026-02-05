export const conductiveAdditiveSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.particle size",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "units": ["µm", "nm"],
                "defaultUnit": "µm",
            }
        },
        {
            "fullKey": "chemical.properties.BET surface area",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "units": ["m²/g", "cm²/g"],
                "defaultUnit": "m²/g",
            }
        },
        {
            "fullKey": "chemical.properties.coductivity",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "units": ["S/m"],
                "defaultUnit": "S/m",
            }
        },
    ],
    "remove": [
        "chemical.properties.solubility in water"
    ],
}