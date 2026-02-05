import { MetaDataTemplate } from "../../../types";

const sampleMetadataTemplate: MetaDataTemplate = {
  "ELN version": {
      "query": false,
      "inputType": "text",
      "default": {
        type: "function",
        value: "this.manifest.version"
      },
    },
    "cssclasses": {
      "query": false,
      "inputType": "list",
      "default": ["sample"],
    },
    "date created": {
      "query": false,
      "inputType": "date",
      "default": {
        type: "function",
        value: "new Date().toISOString().split('T')[0]"
      },
    },
    "author": {
      "query": true,
      "inputType": "dropdown",
      "options": {
        type: "function",
        value: "this.settings.authors?.map((item) => item.name) || []"
      },
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
        context: ["userInput"],
        reactiveDeps: ["sample.type"],
        function: "({ userInput }) => [`sample/${userInput.sample.type.replace(/\\s/g, '_')}`]",
        fallback: ["sample/unknown"]
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
          "project.type": "project.type",
          "project.link": "file.link",
        }
    },      
    "sample": {
        "name": {
            "query": true,
            "inputType": "text",
            "default": "",
            "placeholder": "Enter a descriptive name for your sample...",
        },
        "operator": {
            "query": true,
            "inputType": "dropdown",
            "options": {
              type: "function",
              value: "this.settings.general?.operators?.map((item) => item.name) || []"
            },
        },
        "type": {
            "query": true,
            "inputType": "subclass",
            "options": {
              type: "function",
              value: "this.settings.note?.sample?.type?.map((item) => item.name) || []"
            },
        },
        "description": {
            "query": true,
            "inputType": "text",
            "multiline": true,
            "default": "",
            "placeholder": "Describe the sample composition, purpose, or key characteristics...",
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
          },
        },
        "properties": {
            "query": true,
            "inputType": "editableObject",
            "objectTemplate": {},
            "editableKey": true,
            "editableUnit": true,
            "allowTypeSwitch": true,
            "removeable": true,
        },
    },
};

export default sampleMetadataTemplate;