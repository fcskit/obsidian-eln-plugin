import { MetaDataTemplate } from "../../../types";

const sampleListMetadataTemplate : MetaDataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", context: ["plugin"], expression: "plugin.manifest.version" },
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["wide-page", "sample-list"],
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": { type: "function", context: ["date"], expression: "date.today" },
  },
  "author": {
    "query": true,
    "inputType": "dropdown",
    "options": { type: "function", context: ["settings"], expression: "settings.authors?.map((item) => item.name) || []" },
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