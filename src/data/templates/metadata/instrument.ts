import { MetaDataTemplate } from "../../../types";

const instrumentMetadataTemplate : MetaDataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", value: "this.manifest.version" },
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["device"],
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
    "default": "device",
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": { 
      type: "function", 
      userInputs: ["instrument.type"],
      value: "instrument.type ? [`instrument/${instrument.type.replace(/\\s/g, '_')}`] : ['instrument/unknown']"
    },
  },
  "instrument": {
    "name": {
      "query": true,
      "inputType": "text",
      "default": "",
    },
    "type": {
      "query": true,
      "inputType": "dropdown",
      "options": "this.settings.deviceType.map((item) => item.name)",
    },
    "manufacturer": {
      "query": true,
      "inputType": "text",
      "default": "",
    },
    "model": {
      "query": true,
      "inputType": "text",
      "default": "",
    },
    "location": {
      "building": {
        "query": true,
        "inputType": "text",
        "default": "",
      },
      "room": {
        "query": true,
        "inputType": "text",
        "default": "",
      }
    },
    "info": {
      // "dynamic": true,
      "query": true,
      "inputType": "dynamic",
      "default": {}
    },
    "parameters": {
      // "dynamic": true,
      "query": true,
      "inputType": "dynamic",
      "default": {}
    }
  }
};

export default instrumentMetadataTemplate;