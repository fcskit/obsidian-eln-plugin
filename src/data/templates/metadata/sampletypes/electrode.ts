export const electrodeSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "sample.active material",
            "input": {
                "query": true,
                "inputType": "list",
                "listType": "object",
                "initialItems": 1,
                "objectTemplate": {
                    "name": {
                        "query": true,
                        "inputType": "queryDropdown",
                        "search": "chemical",
                        "where": [
                            {
                                "field": "chemical.type",
                                "is": "active material"
                            }
                        ],
                        "return": {
                            "sample.active material.name": "chemical.name",
                            "sample.active material.link": "file.link",
                        },
                    },
                    "mass": {
                        "query": true,
                        "inputType": "number",
                        "default": 0,
                        "defaultUnit": "mg",
                        "units": ["mg", "g", "kg"],
                    },
                    "loading": {
                        "query": true,
                        "inputType": "number",
                        "default": 0,
                        "defaultUnit": "mg/cm2",
                        "units": ["mg/cm2", "g/m2"],
                    }
                },
            }
        },
        {
            "fullKey": "sample.binder",
            "input": {
                "query": true,
                "inputType": "list",
                "listType": "object",
                "initialItems": 1,
                "objectTemplate": {
                    "name": {
                        "query": true,
                        "inputType": "queryDropdown",
                        "search": "chemical",
                        "where": [
                            {
                                "field": "chemical.type",
                                "is": "binder"
                            }
                        ],
                        "return": {
                            "sample.binder.name": "chemical.name",
                            "sample.binder.link": "file.link",
                        },
                    },
                    "mass": {
                        "query": true,
                        "inputType": "number",
                        "default": 0,
                        "defaultUnit": "mg",
                        "units": ["mg", "g", "kg"],
                    }
                },
            }
        },
        {
            "fullKey": "sample.conductive additive",
            "input": {
                "query": true,
                "inputType": "list",
                "listType": "object",
                "initialItems": 1,
                "editableKey": false,
                "removeable": true,
                "objectTemplate": {
                    "name": {
                        "query": true,
                        "inputType": "queryDropdown",
                        "search": "chemical",
                        "where": [
                            {
                                "field": "chemical.type",
                                "is": "conductive additive"
                            }
                        ],
                        "return": {
                            "sample.conductive additive.name": "chemical.name",
                            "sample.conductive additive.link": "file.link",
                        },
                    },
                    "mass": {
                        "query": true,
                        "inputType": "number",
                        "default": 0,
                        "defaultUnit": "mg",
                        "units": ["mg", "g", "kg"],
                    }
                },
            }
        },
        {
            "fullKey": "sample.solvent",
            "input": {
                "query": true,
                "inputType": "list",
                "listType": "object",
                "initialItems": 1,
                "editableKey": false,
                "removeable": true,
                "objectTemplate": {
                    "name": {
                        "query": true,
                        "inputType": "queryDropdown",
                        "search": "chemical",
                        "where": [
                            {
                                "field": "chemical.type",
                                "is": "solvent"
                            }
                        ],
                        "return": {
                            "sample.solvent.name": "chemical.name",
                            "sample.solvent.link": "file.link",
                        },
                    },
                    "volume": {
                        "query": true,
                        "inputType": "number",
                        "default": 0,
                        "defaultUnit": "ml",
                        "units": ["ml", "l"],
                    }
                },
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
                    }
                ],
                "return": {
                    "sample.current collector.name": "chemical.name",
                    "sample.current collector.link": "file.link",
                },
            },
        },
        {
            "fullKey": "sample.current collector.thickness",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "defaultUnit": "µm",
                "units": ["µm", "mm"],
            },
        },
        {
            "fullKey": "sample.current collector.width",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "defaultUnit": "cm",
                "units": ["mm", "cm"],
            },
        },
        {
            "fullKey": "sample.current collector.length",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "defaultUnit": "cm",
                "units": ["mm", "cm"],
            }
        },
        {
            "fullKey": "sample.dry thickness",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "defaultUnit": "µm",
                "units": ["µm", "mm"],
            }
        },
        {
            "fullKey": "sample.porosity",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "defaultUnit": "%",
                "units": ["%"],
            }
        }
    ],
}