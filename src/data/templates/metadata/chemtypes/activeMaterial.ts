export const activeMaterialSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.theoretical capacity",
            "insertAfter": "chemical.properties.density",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "units": ["mAh/g", "Ah/kg"],
                "defaultUnit": "mAh/g",
                "callback": { type: "function", value: "(value) => value.trim()" }
            }
        },
        {
            "fullKey": "chemical.properties.storage mechanism",
            "insertAfter": "chemical.properties.theoretical capacity",
            "input": {
                "query": true,
                "inputType": "dropdown",
                "options": [
                    { label: "Intercalation", value: "intercalation" },
                    { label: "Conversion", value: "conversion" },
                    { label: "Alloying", value: "alloying" },
                    { label: "Other", value: "other" }
                ],
                "default": "intercalation",
            }
        }
    ],
    "remove": [
        "chemical.properties.solubility in water"
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