import { MetaDataTemplate } from "../../../types";

const chemicalMetadataTemplate : MetaDataTemplate = {
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
    "default": ["chemical"],
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
    "default": "chemical",
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": { 
      type: "function",
      context: ["userInput"],
      reactiveDeps: ["chemical.type"],
      expression: "[`chemical/${userInput.chemical.type.replace(/\\s/g, '_')}`]",
      fallback: ["chemical/unknown"]
    },
  },
  "chemical": {
    "type": {
      "query": true,
      "inputType": "subclass",
      "options": { 
        type: "function", 
        context: ["settings"], 
        expression: "settings.note?.chemical?.type?.map((item) => item.name) || []" 
      },
    },
    "field of use": {
      "query": true,
      "inputType": "multiselect",
      "options": { 
        type: "function", 
        context: ["settings"], 
        expression: "settings.note?.chemical?.fieldOfUse || []" 
      },
    },
    "name": {
      "query": true,
      "inputType": "actiontext",
      "default": "",
      "action": { 
        type: "function", 
        context: ["input", "plugin"], 
        expression: "plugin.chemicalLookup.resolveChemicalIdentifier(input)" 
      },
      "icon": "search-check",
      "tooltip": "Lookup name in database"
    },
    "IUPAC name": {
      "query": true,
      "inputType": "text",
      "default": "",
    },
    "CAS": {
      "query": true,
      "inputType": "actiontext",
      "default": "",
      "action": { 
        type: "function", 
        context: ["input", "plugin"], 
        expression: "plugin.chemicalLookup.resolveChemicalIdentifierCAS(input)" 
      },
      "icon": "search-check",
      "tooltip": "Lookup CAS in database"
    },
    "formula": {
      "query": true,
      "inputType": "text",
      "default": "",
      "callback": { 
        type: "function", 
        context: ["input"],
        expression: "`$${input.trim()}$`"
      }
    },
    "smiles": {
      "query": true,
      "inputType": "text",
      "default": "",
    },
    "properties": {
      "molar mass": {
        "query": true,
        "inputType": "number",
        "default": 0,
        "units": ["g/mol"],
        "defaultUnit": "g/mol",
      },
      "density": {
        "query": true,
        "inputType": "number",
        "default": 0,
        "units": ["g/cm³", "g/mL"],
        "defaultUnit": "g/cm³",
      },
      "melting point": {
        "query": true,
        "inputType": "number",
        "default": 0,
        "units": ["°C", "K"],
        "defaultUnit": "K",
      },
      "boiling point": {
        "query": true,
        "inputType": "number",
        "default": 0,
        "units": ["°C", "K"],
        "defaultUnit": "K",
      },
      "solubility in water": {
        "query": true,
        "inputType": "number",
        "default": 0,
        "units": ["g/L", "mg/L", "mol/L"],
        "defaultUnit": "g/L",
      }
    },
    "batch": {
      "query": true,
      "inputType": "list",
      "listType": "object",
      "initialItems": 1,
      "objectTemplate": {
        "batch number": {
          "query": true,
          "inputType": "number",
          "default": 1,
        },
        "product name": {
          "query": true,
          "inputType": "text",
          "default": "",
        },
        "manufacturer": {
          "query": true,
          "inputType": "dropdown",
          "options": {
            type: "function",
            context: ["settings"],
            expression: "settings.note?.chemical?.manufacturer?.map((item) => item.name) || []"
          },
        },
        "supplier": {
          "query": true,
          "inputType": "dropdown",
          "options": {
            type: "function",
            context: ["settings"],
            expression: "settings.note?.chemical?.supplier?.map((item) => item.name) || []"
          },
        },
        "product url": {
          "query": true,
          "inputType": "text",
          "default": "https://",
          "callback": {
            type: "function",
            context: ["input"],
            expression: "`[link to product](${input.trim()})`"
          }
        },
        "grade": {
          "query": true,
          "inputType": "number",
          "default": 0,
          "units": ["%"],
        },
        "quantity": {
          "query": true,
          "inputType": "number",
          "default": 0,
          "units": ["mg", "g", "kg", "mL", "L"],
          "defaultUnit": "g",
        },
        "delivery date": {
          "query": true,
          "inputType": "date",
          "default": {
            type: "function",
            context: ["date"],
            expression: "date.today"
          },
        },
      }
    },
    "safety": {
      "safety data sheet": {
        "query": false,
        "inputType": "text",
        "default": "msds-dummy.pdf",
        "callback": {
          type: "function",
          context: ["input"],
          expression: "`[[${input.trim()}|MSDS]]`"
        }
      },
      "h-statements": {
        "query": true,
        "inputType": "list",
        "listType": "text",
        "placeholder": "Enter comma separated list: Hxxx, Hyyy ...",
      },
      "p-statements": {
        "query": true,
        "inputType": "list",
        "listType": "text",
        "placeholder": "Enter comma separated list: Pxxx, Pyyy ...",
      },
      "threshold limit value": {
        "query": true,
        "inputType": "number",
        "default": 0,
        "units": ["mg/m³", "ppm"],
        "defaultUnit": "mg/m³",
      },
      "toxicity": {
        "query": true,
        "inputType": "number",
        "default": 0,
        "units": ["mg/kg", "g/kg", "mg·kg⁻¹", "g·kg⁻¹"],
        "defaultUnit": "mg·kg⁻¹",
      }
    }
  }
};

export default chemicalMetadataTemplate;