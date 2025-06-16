import { MetaDataTemplate } from "utils/types";

const analysisMetadataTemplate : MetaDataTemplate = {
    "ELN version": {
        "query": false,
        "inputType": "text",
        "default": "",
        "callback": "(value) => value.trim()"
    },
    "cssclasses": {
        "query": false,
        "inputType": "list",
        "default": ["analysis"],
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
        "default": "analysis",
        "callback": "(value) => value.trim()"
    },
    "tags": {
        "query": false,
        "inputType": "list",
        "default": ['analysis'],
        "callback": "(value) => value"
    }
    // Add the rest of the JSON content here...
};

export default analysisMetadataTemplate;