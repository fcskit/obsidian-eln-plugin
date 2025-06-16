import { MetaDataTemplate } from "utils/types";

const defaultMetadataTemplate : MetaDataTemplate = {
    "ELN version": {
    "query": false,
    "inputType": "text",
    "default": "",
    "callback": "(value) => value.trim()"
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["note"],
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": "new Date().toISOString().split('T')[0]",
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
    "default": "contact",
    "callback": "(value) => value.trim()"
  },
  "tag": {
    "query": false,
    "inputType": "text",
    "default": "note",
    "callback": "(value) => value.trim()"
  }
};

export default defaultMetadataTemplate;