import { MetaDataTemplate } from "../../../types";

const processMetadataTemplate: MetaDataTemplate = {
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
    "default": ["process"],
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
    "default": "process",
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": { 
      type: "function", 
      context: ["userInput"],
      reactiveDeps: ["process.type"],
      expression: "[`process/${userInput.process.type.replace(/\\s/g, '_')}`]",
      fallback: ["process/unknown"]
    },
  },
  "process": {
    "name": {
      "query": true,
      "inputType": "text",
      "default": "",
    },
    "type": {
      "query": true,
      "inputType": "subclass",
      "options": {
        type: "function",
        context: ["settings"],
        expression: "settings.note?.process?.type || []"
      },
    },
    "description": {
      "query": true,
      "inputType": "text",
      "default": "",
    },
    "devices": {
      "query": true,
      "inputType": "multiQueryDropdown",
      "search": "device",
      "where": [
        {
          "field": "note type",
          "is": "device"
        }
      ],
      "return": {
        "process.devices.name": "file.name",
        "process.devices.link": "file.link",
        "process.devices.parameters": "device.parameters"
      },
    },
    "parameters": {
      "query": true,
      "inputType": "editableObject",
      "objectTemplate": {},
      "editableKey": true,
      "allowTypeSwitch": true,
      "removeable": true,
    }
  }
};

export default processMetadataTemplate;