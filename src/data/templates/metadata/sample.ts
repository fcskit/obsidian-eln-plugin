import { MetaDataTemplate } from "../../../types";

const sampleMetadataTemplate: MetaDataTemplate = {
  "ELN version": {
      "query": false,
      "inputType": "text",
      "default": { type: "function", value: "this.manifest.version" },
    },
    "cssclasses": {
      "query": false,
      "inputType": "list",
      "default": ["sample"],
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
      "placeholder": "Select the sample author...",
    },
    "note type": {
      "query": false,
      "inputType": "text",
      "default": "sample",
    },
    "tags": {
      "query": false,
      "inputType": "list",
      "default": { 
        type: "function", 
        userInputs: ["sample.type"],
        value: "sample.type ? [`sample/${sample.type.replace(/\\s/g, '_')}`] : ['sample/unknown']"
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
        "placeholder": "Link to project this sample belongs to...",
    },      
    "sample": {
        "name": {
            "query": true,
            "inputType": "text",
            "default": "",
            "placeholder": "Enter a descriptive name for your sample...",
        },
        "type": {
            "query": true,
            "inputType": "subclass",
            "options": { type: "function", value: "this.settings.note.sample.type.map((item) => item.name)" },
            "placeholder": "Select the type of sample (electrode, compound, etc.)...",
        },
        "description": {
            "query": true,
            "inputType": "text",
            "default": "",
            "placeholder": "Describe the sample composition, purpose, or key characteristics...",
        },
        "properties": {
            "query": true,
            "inputType": "editableObject",
            "default": {},
            "editableKey": true,
            "editableUnit": true,
            "allowTypeSwitch": true,
            "removeable": true,
        },
        "preparation": {
            "query": true,
            "inputType": "multiQueryDropdown",
            "search": "process",
            "where": [
                {
                    "field": "note type",
                    "is": "process"
                }
            ],
            "return": {
                "sample.preparation.name": "process.name",
                "sample.preparation.type": "process.type",
                "sample.preparation.devices": "process.devices",
                "sample.preparation.parameters": "process.parameters"
            }
        }
    },
};

export default sampleMetadataTemplate;