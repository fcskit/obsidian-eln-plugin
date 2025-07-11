export const electrolyteSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.composition.solvents",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
            }
        },
        {
            "fullKey": "chemical.properties.composition.salts",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
            }
        },
        {
            "fullKey": "chemical.properties.composition.additives",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
            }
        },
        {
            "fullKey": "chemical.properties.composition.molarity",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "units": ["mol/L", "mmol/L"],
                "defaultUnit": "mol/L",
            }
        },
        {
            "fullKey": "chemical.properties.conductivity",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "units": ["S/m", "mS/m"],
                "defaultUnit": "S/m",
            }
        },
        {
            "fullKey": "chemical.properties.viscosity",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "units": ["mPa·s", "cP"],
                "defaultUnit": "mPa·s",
            }
        },
    ],
    "remove": [
        "chemical.properties.solubility in water"
    ],
}