import { MetaDataTemplate } from "../../utils/types";

const chemicalMetadataTemplate : MetaDataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": "",
    "callback": "(value) => value.trim()"
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["chemical"],
    "callback": "(value) => value.trim()"
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": "new Date().toISOString().split('T')[0]",
    "callback": "(value) => value"
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
    "default": "chemical",
    "callback": "(value) => value.trim()"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": "(userInput) => [`#chemical/${(userInput['chemical.type'] || 'unknown').replace(/\\s/g, '_')}`]",
    "callback": "(value) => value.trim()"
  },
  "chemical": {
    "type": {
      "query": true,
      "inputType": "dropdown",
      "options": "this.settings.chemicalType",
      "callback": "(value) => value"
    },
    "field of use": {
      "query": true,
      "inputType": "multiselect",
      "options": "this.settings.chemicalFieldOfUse",
      "callback": "(value) => value"
    },
    "name": {
      "query": true,
      "inputType": "actiontext",
      "default": "",
      "callback": "(value) => value.trim()",
      "action": "(value) => this.resolveChemicalIdentifier(value)",
      "icon": "search-check",
      "tooltip": "Lookup name in database"
    },
    "IUPAC name": {
      "query": true,
      "inputType": "text",
      "default": "",
      "callback": "(value) => value.trim()"
    },
    "CAS": {
      "query": true,
      "inputType": "actiontext",
      "default": "",
      "callback": "(value) => value.trim()",
      "action": "(value) => this.resolveChemicalIdentifier(value)",
      "icon": "search-check",
      "tooltip": "Lookup CAS in database"
    },
    "formula": {
      "query": true,
      "inputType": "text",
      "default": "",
      "callback": "(value) => `$${value.trim()}$`"
    },
    "smiles": {
      "query": true,
      "inputType": "text",
      "default": null,
      "callback": "(value) => value.trim() === '' ? null : value.trim()"
    },
    "properties": {
      "molar mass": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["g/mol"],
        "defaultUnit": "g/mol",
        "callback": "(value) => value.trim()"
      },
      "density": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["g/cm³", "g/mL"],
        "defaultUnit": "g/cm³",
        "callback": "(value) => value"
      },
      "melting point": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["°C", "K"],
        "defaultUnit": "K",
        "callback": "(value) => value"
      },
      "boiling point": {
        "query": true,
        "inputType": "text",
        "default": "",
        "units": ["°C", "K"],
        "defaultUnit": "K",
        "callback": "(value) => value"
      },
      "solubility in water": {
        "query": true,
        "inputType": "text",
        "default": "",
        "units": ["g/L", "mg/L", "mol/L"],
        "defaultUnit": "g/L",
        "callback": "(value) => value"
      }
    },
    "batch": {
      "grade": {
        "query": true,
        "inputType": "text",
        "default": "",
        "callback": "(value) => value.trim()"
      },
      "supplier": {
        "query": true,
        "inputType": "dropdown",
        "options": "this.settings.chemicalSupplier.map((item) => item.name)",
        "callback": "(value) => value.trim()"
      },
      "manufacturer": {
        "query": true,
        "inputType": "dropdown",
        "options": "this.settings.chemicalManufacturer.map((item) => item.name)",
        "callback": "(value) => value.trim()"
      },
      "product name": {
        "query": true,
        "inputType": "text",
        "default": "",
        "callback": "(value) => value.trim()"
      },
      "delivery date": {
        "query": true,
        "inputType": "date",
        "default": "new Date().toISOString().split('T')[0]",
        "callback": "(value) => value"
      },
      "batch number": {
        "query": true,
        "inputType": "number",
        "default": "1",
        "callback": "(value) => value"
      },
      "quantity": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["mg", "g", "kg", "mL", "L"],
        "defaultUnit": "g",
        "callback": "(value) => value.trim()"
      },
      "url": {
        "query": true,
        "inputType": "text",
        "default": "https://",
        "callback": "(value) => `[link to product](${value.trim()})`"
      }
    },
    "safety": {
      "safety data sheet": {
        "query": false,
        "inputType": "text",
        "default": "msds-dummy.pdf",
        "callback": "(value) => `[[${value.trim()}|MSDS]]`"
      },
      "h-statements": {
        "query": true,
        "inputType": "text",
        "default": "Hxxx, Hyyy",
        "callback": "(value) => (value ? value.replace(/\\s*\\+\\s*/, '+').split(/\\s*,\\s*|\\s*-\\s*/).map((item) => `[[${item}]]`) : [])"
      },
      "p-statements": {
        "query": true,
        "inputType": "text",
        "default": "Pxxx, Pyyy",
        "callback": "(value) => (value ? value.replace(/\\s*\\+\\s*/, '+').split(/\\s*,\\s*|\\s*-\\s*/).map((item) => `[[${item}]]`) : [])"
      },
      "threshold limit value": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["mg/m³", "ppm"],
        "defaultUnit": "mg/m³",
        "callback": "(value) => value"
      },
      "toxicity": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["mg/kg", "g/kg", "mg·kg−1", "g·kg−1"],
        "defaultUnit": "mg·kg−1",
        "callback": "(value) => value"
      }
    }
  }
};

export default chemicalMetadataTemplate;