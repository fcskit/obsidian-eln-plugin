import { MetaDataTemplate } from "utils/types";

const instrumentMetadataTemplate : MetaDataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": "",
    "callback": "(value) => value.trim()"
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["device"],
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": "new Date().toISOString().split('T')[0]",
  },
  "author": {
    "query": false,
    "inputType": "text",
    "default": "",
    "callback": "(value) => value.trim()"
  },
  "note type": {
    "query": false,
    "inputType": "text",
    "default": "device",
    "callback": "(value) => value.trim()"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": "(userInput) => [`#device/${(userInput['device.type'] || 'unknown').replace(/\\s/g, '_')}`]",
    "callback": "(value) => value.trim()"
  },
  "instrument": {
    "name": {
      "query": true,
      "inputType": "text",
      "default": "",
      "callback": "(value) => value.trim()"
    },
    "type": {
      "query": true,
      "inputType": "dropdown",
      "options": "this.settings.deviceType.map((item) => item.name)",
      "callback": "(value) => value"
    },
    "manufacturer": {
      "query": true,
      "inputType": "text",
      "default": "",
      "callback": "(value) => value.trim()"
    },
    "model": {
      "query": true,
      "inputType": "text",
      "default": "",
      "callback": "(value) => value.trim()"
    },
    "location": {
      "building": {
        "query": true,
        "inputType": "text",
        "default": "",
        "callback": "(value) => value.trim()"
      },
      "room": {
        "query": true,
        "inputType": "text",
        "default": "",
        "callback": "(value) => value.trim()"
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