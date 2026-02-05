export const acidSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.concentration",
            "insertAfter": "chemical.properties.density",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["mol/L", "g/L", "mg/mL"],
                "defaultUnit": "mol/L"
            }
        },
        {
            "fullKey": "chemical.properties.pH",
            "insertAfter": "chemical.properties.concentration",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
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
                "default": 0
            }
        }
    ]
}