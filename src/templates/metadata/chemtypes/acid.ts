export const acidSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.concentration",
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
            "fullKey": "chemical.properties.pH",
            "insertAfter": "chemical.properties.concentration",
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
            "newKey": "chemical.properties.pKs",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "callback": "(value) => value.trim()"
            }
        }
    ]
}