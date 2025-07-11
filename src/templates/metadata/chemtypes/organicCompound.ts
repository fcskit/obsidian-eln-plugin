export const organicCompoundSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.flash point",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "units": ["°C", "K"],
                "defaultUnit": "°C",
            }
        },
        {
            "fullKey": "chemical.properties.functional groups",
            "input": {
                "query": true,
                "inputType": "multiselect",
                "options": [
                    "alcohol",
                    "aldehyde",
                    "amine",
                    "carboxylic acid",
                    "ester",
                    "ether",
                    "ketone",
                    "nitrile",
                    "phenol",
                    "sulfide",
                    "thiol",
                    "other"
                ],
                "default": [],
            }
        },
    ],
    "replace": [
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