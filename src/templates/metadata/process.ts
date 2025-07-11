import { MetaDataTemplate } from "../../utils/types";

const processMetadataTemplate: MetaDataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": "",
    "callback": "(value) => value.trim()"
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["meeting"],
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
    "default": "meeting",
    "callback": "(value) => value.trim()"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": ["meeting"],
    "callback": "(value) => value.trim()"
  },
    "process": {
        "title": {
            "query": true,
            "inputType": "text",
            "default": "",
            "callback": "(value) => value.trim()"
        },
    }
};

export default processMetadataTemplate;