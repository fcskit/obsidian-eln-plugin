import { MetaDataTemplate } from "../../../types";

const analysisMetadataTemplate : MetaDataTemplate = {
    "ELN version": {
        "query": false,
        "inputType": "text",
        "default": { type: "function", value: "this.manifest.version" },
    },
    "cssclasses": {
        "query": false,
        "inputType": "list",
        "default": ["analysis"],
    },
    "date created": {
        "query": false,
        "inputType": "date",
        "default": { type: "function", value: "new Date().toISOString().split('T')[0]" },
    },
    "author": {
        "query": true,
        "inputType": "dropdown",
        "options": { type: "function", value: "this.settings.authors.map((item) => item.name)" },
    },
    "note type": {
        "query": false,
        "inputType": "text",
        "default": "analysis",
    },
    "tags": {
        "query": false,
        "inputType": "list",
        "default": { 
          type: "function", 
          userInputs: ["analysis.technique"],
          value: "analysis.technique ? [`analysis/${analysis.technique.replace(/\\s/g, '_')}`] : ['analysis/unknown']"
        },
    },
    "project": {
        "query": true,
        "inputType": "queryDropdown",
        "search": "project",
        "where": [
            {
                "field": "note type", 
                "is": "project"
            }
        ],
    },
    "analysis": {
        "title": {
            "query": true,
            "inputType": "text",
            "default": "",
        },
        "technique": {
            "query": true,
            "inputType": "dropdown",
            "options": ["XRD", "SEM", "TEM", "XPS", "FTIR", "NMR", "UV-Vis", "CV", "EIS", "galvanostatic", "potentiostatic", "other"],
            "default": "",
        },
        "description": {
            "query": true,
            "inputType": "text",
            "default": "",
        },
        "samples": {
            "query": true,
            "inputType": "objectList",
            "object": {
                "sample": {
                    "query": true,
                    "inputType": "queryDropdown",
                    "search": "sample",
                    "where": [
                        {
                            "field": "note type",
                            "is": "sample"
                        }
                    ],
                },
                "preparation": {
                    "query": true,
                    "inputType": "text",
                    "default": "",
                },
                "note": {
                    "query": true,
                    "inputType": "text",
                    "default": "",
                }
            },
            "editableKey": false,
            "removeable": true,
            "initialItems": 1,
        },
        "instrument": {
            "query": true,
            "inputType": "queryDropdown",
            "search": "device",
            "where": [
                {
                    "field": "note type",
                    "is": "device"
                }
            ],
        },
        "parameters": {
            "query": true,
            "inputType": "editableObject",
            "default": {},
            "editableKey": true,
            "editableUnit": true,
            "allowTypeSwitch": true,
            "removeable": true,
        },
        "results": {
            "query": true,
            "inputType": "objectList",
            "object": {
                "metric": {
                    "query": true,
                    "inputType": "text",
                    "default": "",
                },
                "value": {
                    "query": true,
                    "inputType": "number",
                    "default": "",
                    "defaultUnit": "",
                    "units": [],
                    "editableUnit": true,
                },
                "uncertainty": {
                    "query": true,
                    "inputType": "number",
                    "default": "",
                },
                "note": {
                    "query": true,
                    "inputType": "text",
                    "default": "",
                }
            },
            "editableKey": false,
            "removeable": true,
            "initialItems": 1,
        },
        "data": {
            "query": true,
            "inputType": "editableObject",
            "default": {},
            "editableKey": true,
            "allowTypeSwitch": true,
            "removeable": true,
        }
    }
    // Add the rest of the JSON content here...
};

export default analysisMetadataTemplate;