export const electrodeSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "sample.active material",
            "input": {
                "query": true,
                "inputType": "objectList",
                "object": {
                    "name": {
                        "query": true,
                        "inputType": "queryDropdown",
                        "search": "chemical",
                        "where": [
                            {
                                "field": "chemical.field of use",
                                "contains": "active material"
                            }
                        ],
                    },
                    "mass": {
                        "query": true,
                        "inputType": "number",
                        "default": "",
                        "defaultUnit": "mg",
                        "units": ["mg", "g", "kg"],
                    },
                    "loading": {
                        "query": true,
                        "inputType": "number",
                        "default": "",
                        "defaultUnit": "mg/cm2",
                        "units": ["mg/cm2", "g/m2"],
                    }
                },
                "editableKey": false,
                "removeable": true,
                "initialItems": 1,
            }
        },
        {
            "fullKey": "sample.binder",
            "input": {
                "query": true,
                "inputType": "objectList",
                "object": {
                    "name": {
                        "query": true,
                        "inputType": "queryDropdown",
                        "search": "chemical",
                        "where": [
                            {
                                "field": "chemical.field of use",
                                "contains": "binder"
                            }
                        ],
                    },
                    "mass": {
                        "query": true,
                        "inputType": "number",
                        "default": "",
                        "defaultUnit": "mg",
                        "units": ["mg", "g", "kg"],
                    }
                },
                "editableKey": false,
                "removeable": true,
                "initialItems": 1,
            }
        },
        {
            "fullKey": "sample.conductive additive",
            "input": {
                "query": true,
                "inputType": "objectList",
                "object": {
                    "name": {
                        "query": true,
                        "inputType": "queryDropdown",
                        "search": "chemical",
                        "where": [
                            {
                                "field": "chemical.field of use",
                                "contains": "conductive additive"
                            }
                        ],
                    },
                    "mass": {
                        "query": true,
                        "inputType": "number",
                        "default": "",
                        "defaultUnit": "mg",
                        "units": ["mg", "g", "kg"],
                    }
                },
                "editableKey": false,
                "removeable": true,
                "initialItems": 1,
            }
        },
        {
            "fullKey": "sample.solvent",
            "input": {
                "query": true,
                "inputType": "objectList",
                "object": {
                    "name": {
                        "query": true,
                        "inputType": "queryDropdown",
                        "search": "chemical",
                        "where": [
                            {
                                "field": "chemical.field of use",
                                "contains": "solvent"
                            }
                        ],
                    },
                    "volume": {
                        "query": true,
                        "inputType": "number",
                        "default": "",
                        "defaultUnit": "ml",
                        "units": ["ml", "l"],
                    }
                },
                "editableKey": false,
                "removeable": true,
                "initialItems": 1,
            }
        },
        {
            "fullKey": "sample.current collector",
            "input": {
                "query": true,
                "inputType": "objectList",
                "object": {
                    "name": {
                        "query": true,
                        "inputType": "queryDropdown",
                        "search": "chemical",
                        "where": [
                            {
                                "field": "chemical.field of use",
                                "contains": "current collector"
                            }
                        ],
                    },
                    "thickness": {
                        "query": true,
                        "inputType": "number",
                        "default": "",
                        "defaultUnit": "µm",
                        "units": ["µm", "mm"],
                    },
                    "width": {
                        "query": true,
                        "inputType": "number",
                        "default": "",
                        "defaultUnit": "cm",
                        "units": ["mm", "cm"],
                    },
                    "length": {
                        "query": true,
                        "inputType": "number",
                        "default": "",
                        "defaultUnit": "cm",
                        "units": ["mm", "cm"],
                    }
                },
                "editableKey": false,
                "removeable": true,
                "initialItems": 1,
            }
        },
        {
            "fullKey": "sample.dry thickness",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "defaultUnit": "µm",
                "units": ["µm", "mm"],
            }
        },
        {
            "fullKey": "sample.porosity",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "defaultUnit": "%",
                "units": ["%"],
            }
        }
    ],
}