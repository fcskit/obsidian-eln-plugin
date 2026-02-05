import { MetaDataTemplate } from "../../../types";

const sampleMetadataTemplate: MetaDataTemplate = {
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
      "default": ["sample"],
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
      "default": "sample",
    },
    "tags": {
      "query": false,
      "inputType": "list",
      "default": { 
        type: "function",
        context: ["userInput"],
        reactiveDeps: ["sample.type"],
        expression: "[`sample/${userInput.sample.type.replace(/\\s/g, '_')}`]",
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
            "query": false,
            "inputType": "postprocessor",
            "default": {
                type: "function",
                context: ["postprocessor"],
                expression: "postprocessor.filename"
            }
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
        "type": {
            "query": true,
            "inputType": "subclass",
            "options": {
              type: "function",
              context: ["settings"],
              expression: "settings.note?.sample?.type?.map((item) => item.name) || []"
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
              "sample.preparation.link": "file.link",
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