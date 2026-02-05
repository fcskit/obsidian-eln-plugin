export const refElectrodeSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "electrode.standard potential",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["V", "mV"],
                "defaultUnit": "V",
            }
        },
        {
            "fullKey": "electrode.redox pair",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
                "placeholder": "Enter redox pair"
            }
        },
        {
            "fullKey": "electrode.material",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
                "placeholder": "Enter material"
            }
        },
        {
            "fullKey": "electrode.supporting electrolyte",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
                "placeholder": "Enter supporting electrolyte"
            }
        },
        {
            "fullKey": "electrode.manufacturer",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
                "placeholder": "Enter manufacturer"
            }
        },
        {
            "fullKey": "electrode.model",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
                "placeholder": "Enter model"
            }
        },
        {
            "fullKey": "electrode.purchase date",
            "input": {
                "query": true,
                "inputType": "date",
                "default": {
                    type: "function",
                    context: ["date"],
                    expression: "date.today"
                },
            }
        },
        {
            "fullKey": "electrode.calibration",
            "input": {
                "query": true,
                "inputType": "list",
                "listType": "object",
                "initialItems": 1,
                "objectTemplate": {
                    "date": {
                        "query": true,
                        "inputType": "date",
                        "default": {
                            type: "function",
                            context: ["date"],
                            expression: "date.today"
                        },
                    },
                    "potential": {
                        "query": true,
                        "inputType": "number",
                        "default": 0,
                        "units": ["V", "mV"],
                        "defaultUnit": "V",
                    }
                }
            }
        },
    ],
}