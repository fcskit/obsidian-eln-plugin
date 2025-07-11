export const electrodeSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "sample.active material.name",
            "input": {
                "query": true,
                "inputType": "queryDropdown",
                "search": "chemical",
                "where": [
                    {
                        "field": "chemical.type",
                        "is": "active material"
                    },
                    {
                        "field": "chemical.field of use",
                        "contains": "electrode"
                    }
                ],
            }
        },
        {
            "fullKey": "sample.active material.mass",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "defaultUnit": "mg",
                "units": ["mg", "g", "kg"]
            }
        },
        {
            "fullKey": "sample.active material.loading",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "defaultUnit": "mg/cm2",
                "units": ["mg/cm2", "g/cm2"]
            }
        },
        {
            "fullKey": "sample.binder.name",
            "input": {
                "query": true,
                "inputType": "queryDropdown",
                "search": "chemical",
                "where": [
                    {
                        "field": "chemical.type",
                        "is": "binder"
                    },
                    {
                        "field": "chemical.field of use",
                        "contains": "electrode"
                    }
                ],
            }
        },
        {
            "fullKey": "sample.binder.mass",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "defaultUnit": "mg",
                "units": ["mg", "g", "kg"]
            }
        },
        {
            "fullKey": "sample.conductive additive.name",
            "input": {
                "query": true,
                "inputType": "queryDropdown",
                "search": "chemical",
                "where": [
                    {
                        "field": "chemical.type",
                        "is": "conductive additive"
                    },
                    {
                        "field": "chemical.field of use",
                        "contains": "electrode"
                    }
                ],
            }
        },
        {
            "fullKey": "sample.conductive additive.mass",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "defaultUnit": "mg",
                "units": ["mg", "g", "kg"]
            }
        },
        {
            "fullKey": "sample.solvent.name",
            "input": {
                "query": true,
                "inputType": "queryDropdown",
                "search": "chemical",
                "where": [
                    {
                        "field": "chemical.type",
                        "is": "solvent"
                    },
                    {
                        "field": "chemical.field of use",
                        "contains": "electrode"
                    }
                ],
            }
        },
        {
            "fullKey": "sample.solvent.volume",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "defaultUnit": "ml",
                "units": ["ml", "l", "µl"]
            }
        },
        {
            "fullKey": "sample.current collector.name",
            "input": {
                "query": true,
                "inputType": "queryDropdown",
                "search": "chemical",
                "where": [
                    {
                        "field": "chemical.type",
                        "is": "current collector"
                    },
                    {
                        "field": "chemical.field of use",
                        "contains": "electrode"
                    }
                ],
            }
        },
        {
            "fullKey": "sample.current collector.thickness",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "defaultUnit": "µm",
                "units": ["µm", "mm", "cm"]
            }
        },
        {
            "fullKey": "sample.current collector.width",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "defaultUnit": "cm",
                "units": ["cm", "mm", "m"]
            }
        },
        {
            "fullKey": "sample.current collector.length",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "defaultUnit": "cm",
                "units": ["cm", "mm", "m"]
            }
        },
        {
            "fullKey": "sample.dry thickness",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "defaultUnit": "µm",
                "units": ["µm", "mm", "cm"]
            }
        },
        {
            "fullKey": "sample.porosity",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "defaultUnit": "%",
                "units": ["%"]
            }
        }
    ],
}