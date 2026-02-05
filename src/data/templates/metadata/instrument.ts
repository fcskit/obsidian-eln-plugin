import { MetaDataTemplate } from "../../../types";

const instrumentMetadataTemplate : MetaDataTemplate = {
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
    "default": ["instrument"],
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
    "default": "instrument",
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": { 
      type: "function", 
      context: ["userInput"],
      reactiveDeps: ["instrument.type"],
      expression: "[`instrument/${userInput.instrument.type.replace(/\\s/g, '_')}`]",
      fallback: ["instrument/unknown"]
    },
  },
  "instrument": {
    "name": {
      "query": true,
      "inputType": "text",
      "default": "",
      "placeholder": "Enter instrument name"
    },
    "type": {
      "query": true,
      "inputType": "dropdown",
      "options": {
        type: "function",
        context: ["settings"],
        expression: "settings.note?.instrument?.type?.map((item) => item.name) || []"
      },
    },
    "manufacturer": {
      "query": true,
      "inputType": "text",
      "default": "",
      "placeholder": "Enter instrument manufacturer"
    },
    "model": {
      "query": true,
      "inputType": "text",
      "default": "",
      "placeholder": "Enter instrument model"
    },
    "location": {
      "building": {
        "query": true,
        "inputType": "text",
        "default": "",
        "placeholder": "Enter instrument building"
      },
      "room": {
        "query": true,
        "inputType": "text",
        "default": "",
        "placeholder": "Enter instrument room"
      }
    },
    "contact": {
      "query": true,
      "inputType": "queryDropdown",
      "search": "contact",
       "return": {
         "instrument.contact.name": "file.name",
         "instrument.contact.link": "file.link",
       },
     },
    "info": {
      "query": true,
      "inputType": "editableObject",
      "objectTemplate": {
        "dimensions": {
          "query": true,
          "inputType": "text",
          "default": "",
          "placeholder": "Enter instrument dimensions (e.g., 10x20x30 cm)",
        },
        "weight": {
          "query": true,
          "inputType": "number",
          "default": 0,
          "units": ["kg", "g"],
          "defaultUnit": "kg",
          "placeholder": "Enter instrument weight",
        },
      }
    },
    "methods": {
      "query": true,
      "inputType": "list",
      "listType": "object",
      "initialItems": 1,
      "objectTemplate": {
        "name": {
          "query": true,
          "inputType": "text",
          "default": "",
          "placeholder": "Enter method name"
        },
        "description": {
          "query": true,
          "inputType": "text",
          "default": "",
          "placeholder": "Enter method description"
        },
        "parameters": {
          "query": true,
          "inputType": "editableObject",
          "objectTemplate": {
            "param1": {
              "query": true,
              "inputType": "number",
              "default": 0,
              "units": ["kg", "g"],
              "defaultUnit": "kg",
              "placeholder": "Enter parameter 1",
              "editableKey": true,
              "allowTypeSwitch": true
            },
            "param2": {
              "query": true,
              "inputType": "number",
              "default": 0,
              "units": ["kg", "g"],
              "defaultUnit": "kg",
              "placeholder": "Enter parameter 2",
              "editableKey": true,
              "allowTypeSwitch": true
            }
          }
        }
      }
    },
  }
};

export default instrumentMetadataTemplate;