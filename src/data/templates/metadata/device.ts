import { MetaDataTemplate } from "../../../types";

const deviceMetadataTemplate : MetaDataTemplate = {
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
    "default": ["device"],
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
    "default": "device",
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": { 
      type: "function",
      context: ["userInput"],
      reactiveDeps: ["device.type"],
      expression: "[`device/${userInput.device.type.replace(/\\s/g, '_')}`]",
      fallback: ["device/unknown"]
    },
  },
  "device": {
    "name": {
      "query": true,
      "inputType": "text",
      "default": "",
    },
    "type": {
      "query": true,
      "inputType": "dropdown",
      "options": {
        type: "function",
        context: ["settings"],
        expression: "settings.note?.device?.type?.map((item) => item.name) || []"
      },
    },
    "manufacturer": {
      "query": true,
      "inputType": "text",
      "default": "",
      "placeholder": "Enter device manufacturer"
    },
    "model": {
      "query": true,
      "inputType": "text",
      "default": "",
      "placeholder": "Enter device model"
    },
    "location": {
      "building": {
        "query": true,
        "inputType": "text",
        "default": "",
        "placeholder": "Enter device building"
      },
      "room": {
        "query": true,
        "inputType": "text",
        "default": "",
        "placeholder": "Enter device room"
      }
    },
    "contact": {
      "query": true,
      "inputType": "queryDropdown",
      "search": "contact",
       "return": {
         "device.contact.name": "file.name",
         "device.contact.link": "file.link",
       },
     },
    "info": {
      "query": true,
      "inputType": "editableObject",
      "objectTemplate": {
        "dimensions": {
          "length": {
            "query": true,
            "inputType": "number",
            "default": 0,
            "units": ["mm", "cm", "m"],
            "defaultUnit": "cm",
            "placeholder": "Enter device length"
          },
          "width": {
            "query": true,
            "inputType": "number",
            "default": 0,
            "units": ["mm", "cm", "m"],
            "defaultUnit": "cm",
            "placeholder": "Enter device width"
          },
          "height": {
            "query": true,
            "inputType": "number",
            "default": 0,
            "units": ["mm", "cm", "m"],
            "defaultUnit": "cm",
            "placeholder": "Enter device height"
          }
        },
        "weight": {
          "query": true,
          "inputType": "number",
          "default": 0,
          "units": ["kg", "g"],
          "defaultUnit": "kg",
          "placeholder": "Enter device weight",
        },
      }
    },
    "parameters": {
      "query": true,
      "inputType": "editableObject",
      "objectTemplate": {
        "param1": {
          "query": true,
          "inputType": "text",
          "default": "",
          "placeholder": "Enter parameter 1",
          "editableKey": true,
          "allowTypeSwitch": true,
          "removeable": true
        },
        "param2": {
          "query": true,
          "inputType": "number",
          "default": 0,
          "units": ["kg", "g"],
          "defaultUnit": "kg",
          "placeholder": "Enter parameter 2",
          "editableKey": true,
          "allowTypeSwitch": true,
          "removeable": true
        }
      }
    },
  },
};

export default deviceMetadataTemplate;