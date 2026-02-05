import { MetaDataTemplate } from "../../../types";

const analysisMetadataTemplate : MetaDataTemplate = {
    "ELN version": {
        "query": false,
        "inputType": "text",
        "default": {
            type: "function",
            context: ["plugin"],
            expression: "plugin.manifest.version"
        },
    },
    "cssclasses": {
        "query": false,
        "inputType": "list",
        "default": ["analysis"],
    },
    "date created": {
        "query": false,
        "inputType": "date",
        "default": {
            type: "function",
            context: ["date"],
            expression: "date.today"
        },
    },
    "author": {
        "query": true,
        "inputType": "dropdown",
        "options": {
            type: "function",
            context: ["settings"],
            expression: "settings.authors?.map((item) => item.name) || []"
        },
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
            context: ["userInput"],
            reactiveDeps: ["analysis.technique"],
            expression: "[`analysis/${userInput.analysis.technique.replace(/\\s/g, '_')}`]",
            fallback: ["analysis/unknown"]
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
        "return": {
            "project.name": "project.name",
            "project.link": "file.link",
        }
    },
    "sample": {
        "query": true,
        "inputType": "queryDropdown",
        "search": "sample",
        "where": [
            {
                "field": "project.name",
                "is": {
                    type: "function",
                    context: ["userInput"],
                    reactiveDeps: ["project.name"],
                    expression: "userInput.project.name",
                    fallback: ""
                }
            }
        ],
        "return": {
            "sample.name": "file.name",
            "sample.link": "file.link",
        }
    },
    "analysis": {
        "title": {
            "query": true,
            "inputType": "text",
            "default": "",
        },
        "description": {
            "query": true,
            "inputType": "text",
            "default": "",
        },
        "operator": {
            "query": true,
            "inputType": "dropdown",
            "options": {
              type: "function",
              context: ["settings"],
              expression: "settings.general?.operators?.map((item) => item.name) || []"
            },
        },
        "date": {
            "query": true,
            "inputType": "date",
            "default": {
                type: "function",
                context: ["date"],
                expression: "date.today"
            },
        },
        "status": {
            "query": true,
            "inputType": "dropdown",
            "options": ["planned", "in progress", "completed", "failed"],
            "default": "completed",
        },
        "technique": {
            "query": true,
            "inputType": "dropdown",
            "options": ["SEM", "TEM", "XRD", "NMR", "FTIR", "UV-Vis", "XPS", "AFM", "STM", "Raman", "Mass Spec", "other"],
            "default": "",
        },
        "instrument": {
            "query": true,
            "inputType": "queryDropdown",
            "search": "instrument",
            "where": [
                {
                    "field": "note type",
                    "is": "instrument"
                }
            ],
            "return": {
                "analysis.instrument.name": "file.name",
                "analysis.instrument.link": "file.link"
            }
        },
        "method": {
            "query": true,
            "inputType": "queryDropdown",
            "from": {
                type: "function",
                context: ["userInput"],
                reactiveDeps: ["analysis.instrument.name"],
                expression: "userInput.analysis.instrument.name",
                fallback: ""
            },
            "get": {
                type: "function",
                context: ["queryDropdown"],
                expression: "queryDropdown.frontmatter?.instrument?.methods?.map((item) => item.name) || []",
                fallback: []
            },
            "return": {
                "analysis.method.name": {
                    type: "function",
                    context: ["queryDropdown"],
                    expression: "queryDropdown.selection",
                    fallback: ""
                },
                "analysis.method.parameters": {
                    type: "function",
                    context: ["queryDropdown"],
                    expression: "queryDropdown.frontmatter?.instrument?.methods?.find(m => m.name === queryDropdown.selection)?.parameters || {}",
                    fallback: {}
                }
            }
        },
        "data": {
            "raw files": {
                "query": true,
                "inputType": "filePicker",
                "baseFolder": "Data/",
                "placeholder": "Select raw data files"
            },
            "processed files": {
                "query": true,
                "inputType": "filePicker",
                "baseFolder": "Data/",
                "placeholder": "Select processed files"
            }
        }
    }
};

export default analysisMetadataTemplate;