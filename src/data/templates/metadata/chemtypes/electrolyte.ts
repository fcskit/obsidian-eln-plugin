export const electrolyteSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.composition.solvents",
            "input": {
                "query": true,
                "inputType": "list",
                "listType": "object",
                "initialItems": 1,
                "objectTemplate": {
                    "name": {
                        "query": true,
                        "inputType": "text",
                        "placeholder": "Enter solvent name...",
                        "default": "",
                    },
                    "volume fraction": {
                        "query": true,
                        "inputType": "text",
                        "placeholder": "Enter solvent volume fraction...",
                        "default": "",
                    }
                }
            }
        },
        {
            "fullKey": "chemical.properties.composition.salts",
            "input": {
                "query": true,
                "inputType": "list",
                "listType": "object",
                "initialItems": 1,
                "objectTemplate": {
                    "name": {
                        "query": true,
                        "inputType": "text",
                        "placeholder": "Enter salt name...",
                        "default": "",
                    },
                    "concentration": {
                        "query": true,
                        "inputType": "number",
                        "placeholder": "Enter salt concentration...",
                        "default": 0,
                        "units": ["mol/L", "mmol/L"],
                        "defaultUnit": "mol/L",
                    }
                }
            }
        },
        {
            "fullKey": "chemical.properties.composition.additives",
            "input": {
                "query": true,
                "inputType": "list",
                "listType": "object",
                "initialItems": 1,
                "objectTemplate": {
                    "name": {
                        "query": true,
                        "inputType": "text",
                        "placeholder": "Enter additive name...",
                        "default": "",
                    },
                    "concentration": {
                        "query": true,
                        "inputType": "number",
                        "placeholder": "Enter additive concentration...",
                        "default": 0,
                        "units": ["mol/L", "mmol/L"],
                        "defaultUnit": "mmol/L",
                    }
                }
            }
        },
        {
            "fullKey": "chemical.properties.composition.molarity",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["mol/L", "mmol/L"],
                "defaultUnit": "mol/L",
            }
        },
        {
            "fullKey": "chemical.properties.conductivity",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["S/m", "mS/m"],
                "defaultUnit": "S/m",
            }
        },
        {
            "fullKey": "chemical.properties.viscosity",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["mPa·s", "cP"],
                "defaultUnit": "mPa·s",
            }
        },
    ],
    "remove": [
        "chemical.properties.molar mass",
        "chemical.properties.solubility in water"
    ],
}