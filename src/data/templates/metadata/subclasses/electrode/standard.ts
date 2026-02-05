export const stdElectrodeSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "electrode.nominal potential",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["V", "mV"],
                "defaultUnit": "V",
            }
        },
        {
            "fullKey": "electrode.material",
            "input": {
                "query": true,
                "inputType": "queryDropdown",
                "search": "chemical",
                "where": [
                    {
                        "field": "chemical.type",
                        "is": "electrode"
                    }
                ],
            }
        }
    ],
}