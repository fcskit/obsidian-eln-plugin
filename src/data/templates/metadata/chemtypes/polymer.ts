export const polymerSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.polymer type",
            "insertAfter": "chemical.properties.density",
            "input": {
                "query": true,
                "inputType": "dropdown",
                "options": [
                    "homo polymer",
                    "block copolymer",
                    "alternating copolymer",
                    "periodic copolymer",
                    "statistical copolymer",
                    "stereoblock copolymer",
                    "gradient copolymer"
                ]
            }
        },
    ],
    "replace": [
        {
            "fullKey": "chemical.properties.molar mass",
            "newKey": "chemical.properties.mean molecular weight",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["g/mol"],
                "defaultUnit": "g/mol",
            }
        },
        {
            "fullKey": "chemical.properties.boiling point",
            "newKey": "chemical.properties.glass temperature",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["°C", "K"],
                "defaultUnit": "K",
            }
        },
        {
            "fullKey": "chemical.properties.solubility in water",
            "newKey": "chemical.properties.soluble in",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
            }
        }
    ]
}