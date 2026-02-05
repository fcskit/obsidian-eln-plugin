import { MetaDataTemplate } from "../../../types";

const defaultMetadataTemplate : MetaDataTemplate = {
    "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", context: ["plugin"], expression: "plugin.manifest.version" },
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["note"],
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
    "default": "contact",
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": ["note"],
  }
};

export default defaultMetadataTemplate;