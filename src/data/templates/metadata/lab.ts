import { MetaDataTemplate } from "../../../types";

const labMetadataTemplate: MetaDataTemplate = {
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
    "default": ["lab"],
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
    "default": "lab",
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": {
      type: "function",
      context: ["userInput"],
      reactiveDeps: ["lab.type", "lab.building"],
      expression: "[`lab/${userInput.lab.type.replace(/\\s/g, '_')}`, `lab/building_${userInput.lab.building.replace(/\\s/g, '_')}`]",
      fallback: ["lab/unknown"]
    },
  },
  "lab": {
    "name": {
      "query": true,
      "inputType": "text",
      "default": "",
      "placeholder": "Enter lab name"
    },
    "type": {
      "query": true,
      "inputType": "dropdown",
      "options": {
        type: "function",
        context: ["settings"],
        expression: "settings.note?.lab?.type || []"
      }
    },
    "building": {
      "query": true,
      "inputType": "text",
      "default": "",
      "placeholder": "Enter building number"
    },
    "room": {
      "query": true,
      "inputType": "text",
      "default": "",
      "placeholder": "Enter room number"
    },
    "contact": {
      "query": true,
      "inputType": "queryDropdown",
      "search": "contact",
      "return": {
        "lab.contact.name": "contact.name",
        "lab.contact.link": "file.link",
      }
    }
  }
};

export default labMetadataTemplate;