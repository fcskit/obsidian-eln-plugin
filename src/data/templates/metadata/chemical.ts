import { MetaDataTemplate } from "../../../types";

const chemicalMetadataTemplate : MetaDataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", value: "this.manifest.version" },
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["chemical"],
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
    "default": "chemical",
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": { 
      type: "function", 
      userInputs: ["chemical.type"],
      value: "chemical.type ? [`chemical/${chemical.type.replace(/\\s/g, '_')}`] : ['chemical/unknown']"
    },
  },
  "chemical": {
    "type": {
      "query": true,
      "inputType": "subclass",
      "options": { type: "function", value: "this.settings.note.chemical.type.map((item) => item.name)" },
    },
    "field of use": {
      "query": true,
      "inputType": "multiselect",
      "options": { type: "function", value: "this.settings.chemicalFieldOfUse" },
    },
    "name": {
      "query": true,
      "inputType": "actiontext",
      "default": "",
      "callback": { type: "function", value: "(value) => value.trim()" },
      "action": { type: "function", value: "(value, formData, updateField) => this.chemicalLookup.resolveChemicalIdentifier(value, formData, updateField)" },
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
      "callback": { type: "function", value: "(value) => value.trim()" },
      "action": { type: "function", value: "(value, formData, updateField) => this.chemicalLookup.resolveChemicalIdentifierCAS(value, formData, updateField)" },
      "icon": "search-check",
      "tooltip": "Lookup CAS in database"
    },
    "formula": {
      "query": true,
      "inputType": "text",
      "default": "",
      "callback": { type: "function", value: "(value) => `$${value.trim()}$`" }
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
        "default": "",
        "units": ["g/mol"],
        "defaultUnit": "g/mol",
      },
      "density": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["g/cm³", "g/mL"],
        "defaultUnit": "g/cm³",
      },
      "melting point": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["°C", "K"],
        "defaultUnit": "K",
      },
      "boiling point": {
        "query": true,
        "inputType": "text",
        "default": "",
        "units": ["°C", "K"],
        "defaultUnit": "K",
      },
      "solubility in water": {
        "query": true,
        "inputType": "text",
        "default": "",
        "units": ["g/L", "mg/L", "mol/L"],
        "defaultUnit": "g/L",
      }
    },
    "batch": {
      "grade": {
        "query": true,
        "inputType": "text",
        "default": "",
      },
      "supplier": {
        "query": true,
        "inputType": "dropdown",
        "options": { type: "function", value: "this.settings.chemicalSupplier.map((item) => item.name)" },
        "callback": { type: "function", value: "(value) => value.trim()" }
      },
      "manufacturer": {
        "query": true,
        "inputType": "dropdown",
        "options": { type: "function", value: "this.settings.chemicalManufacturer.map((item) => item.name)" },
      },
      "product name": {
        "query": true,
        "inputType": "text",
        "default": "",
      },
      "delivery date": {
        "query": true,
        "inputType": "date",
        "default": { type: "function", value: "new Date().toISOString().split('T')[0]" },
      },
      "batch number": {
        "query": true,
        "inputType": "number",
        "default": 1,
      },
      "quantity": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["mg", "g", "kg", "mL", "L"],
        "defaultUnit": "g",
      },
      "url": {
        "query": true,
        "inputType": "text",
        "default": "https://",
        "callback": { type: "function", value: "(value) => `[link to product](${value.trim()})`" }
      }
    },
    "safety": {
      "safety data sheet": {
        "query": false,
        "inputType": "text",
        "default": "msds-dummy.pdf",
        "callback": { type: "function", value: "(value) => `[[${value.trim()}|MSDS]]`" }
      },
      "h-statements": {
        "query": true,
        "inputType": "text",
        "default": "Hxxx, Hyyy",
        "callback": { type: "function", value: "(value) => (value ? value.replace(/\\s*\\+\\s*/, '+').split(/\\s*,\\s*|\\s*-\\s*/).map((item) => `[[${item}]]`) : [])" }
      },
      "p-statements": {
        "query": true,
        "inputType": "text",
        "default": "Pxxx, Pyyy",
        "callback": { type: "function", value: "(value) => (value ? value.replace(/\\s*\\+\\s*/, '+').split(/\\s*,\\s*|\\s*-\\s*/).map((item) => `[[${item}]]`) : [])" }
      },
      "threshold limit value": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["mg/m³", "ppm"],
        "defaultUnit": "mg/m³",
      },
      "toxicity": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["mg/kg", "g/kg", "mg·kg⁻¹", "g·kg⁻¹"],
        "defaultUnit": "mg·kg⁻¹",
      }
    }
  }
};

export default chemicalMetadataTemplate;