export const solventSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.vapor pressure",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["Pa", "kPa", "atm"],
                "defaultUnit": "kPa",
            }
        },
        {
            "fullKey": "chemical.properties.dielectric constant",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
            },
        },
        {
            "fullKey": "chemical.properties.flash point",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["°C", "K"],
                "defaultUnit": "K",
            },
        }
    ],
    "remove": [
        "chemical.properties.solubility in water"
    ],
}