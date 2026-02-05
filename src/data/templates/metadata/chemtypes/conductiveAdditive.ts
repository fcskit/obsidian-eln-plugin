export const conductiveAdditiveSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.particle size",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["µm", "nm"],
                "defaultUnit": "µm",
            }
        },
        {
            "fullKey": "chemical.properties.BET surface area",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["m²/g", "cm²/g"],
                "defaultUnit": "m²/g",
            }
        },
        {
            "fullKey": "chemical.properties.coductivity",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["S/m"],
                "defaultUnit": "S/m",
            }
        },
    ],
    "remove": [
        "chemical.properties.solubility in water",
        "chemical.properties.boiling point",
        "chemical.properties.melting point",
    ],
}