import { MetaDataTemplate } from "../../../types";

const defaultMetadataTemplate : MetaDataTemplate = {
    "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", value: "this.manifest.version" },
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["note"],
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
    "default": "contact",
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": ["note"],
  }
};

export default defaultMetadataTemplate;