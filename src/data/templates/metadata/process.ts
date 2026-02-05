import { MetaDataTemplate } from "../../../types";

const processMetadataTemplate: MetaDataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", value: "this.manifest.version" },
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["process"],
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
    "default": "process",
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": { 
      type: "function", 
      userInputs: ["process.type"],
      value: "process.type ? [`process/${process.type.replace(/\\s/g, '_')}`] : ['process/unknown']"
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
      "options": { type: "function", value: "this.settings.note.process.type" },
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
      "default": {},
      "editableKey": true,
      "allowTypeSwitch": true,
      "removeable": true,
    }
  }
};

export default processMetadataTemplate;