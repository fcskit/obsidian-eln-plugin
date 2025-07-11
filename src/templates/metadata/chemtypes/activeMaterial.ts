export const activeMaterialSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.theoretical capacity",
            "insertAfter": "chemical.properties.density",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "units": "mol/L",
                "defaultUnit": "mol/L",
                "callback": "(value) => value.trim()"
            }
        },
        {
            "fullKey": "chemical.properties.storage mechanism",
            "insertAfter": "chemical.properties.theoretical capacity",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "units": "",
                "defaultUnit": "",
                "callback": "(value) => value.trim()"
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
                "default": "",
                "callback": "(value) => value.trim()"
            }
        }
    ]
}