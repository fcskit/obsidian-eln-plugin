export const activeMaterialSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.theoretical capacity",
            "insertAfter": "chemical.properties.density",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["mAh/g", "Ah/kg"],
                "defaultUnit": "mAh/g",
            }
        },
        {
            "fullKey": "chemical.properties.storage mechanism",
            "insertAfter": "chemical.properties.theoretical capacity",
            "input": {
                "query": true,
                "inputType": "dropdown",
                "options": [
                    "intercalation",
                    "conversion",
                    "alloying",
                    "other"
                ],
                "default": "intercalation",
            }
        }
    ],
    "remove": [
        "chemical.properties.solubility in water",
        "chemical.properties.boiling point",
    ],
    "replace": [
        {
            "fullKey": "chemical.properties.melting point",
            "newKey": "chemical.properties.voltage range",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "0-1",
                "units": ["V", "mV"],
                "defaultUnit": "V",
            }
        }
    ]
}