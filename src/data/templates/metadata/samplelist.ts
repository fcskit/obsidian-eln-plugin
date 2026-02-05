import { MetaDataTemplate } from "../../../types";

const sampleListMetadataTemplate : MetaDataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", value: "this.manifest.version" },
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["wide-page", "sample-list"],
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
    "default": "sample-list",
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": ["list/samples"],
  },
  "project": {
    "name": {
      "query": true,
      "inputType": "queryDropdown",
      "search": "project",
    }
  }
};

export default sampleListMetadataTemplate;