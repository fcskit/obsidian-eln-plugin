import { MetaDataTemplate } from "utils/types";

const sampleListMetadataTemplate : MetaDataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": "",
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["wide-page", "sample-list"],
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
    "default": "sample-list",
    "callback": "(value) => value.trim()"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": ["#list/samples"],
    "callback": "(value) => value.trim()"
  },
  "project": {
    "name": {
      "query": true,
      "inputType": "dropdown",
      "options": "app.plugins.plugins.dataview.api.pages('#project AND !\"assets\"').map(p => p.file.name).sort()",
      "callback": "(value) => value.trim()"
    }
  }
};

export default sampleListMetadataTemplate;