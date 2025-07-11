import { MetaDataTemplate } from "../../utils/types";

const sampleMetadataTemplate: MetaDataTemplate = {
    "ELN version": {
        "query": false,
        "inputType": "text",
        "default": "",
      },
      "cssclasses": {
        "query": false,
        "inputType": "list",
        "default": ["chemical"],
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
      },
      "note type": {
        "query": false,
        "inputType": "text",
        "default": "chemical",
      },
      "tags": {
        "query": false,
        "inputType": "list",
        "default": "(userInput) => [`sample/${(userInput['sample.type'] || 'unknown').replace(/\\s/g, '_')}`]",
    },
    "project": {
        "query": true,
        "inputType": "queryDropdown",
        "search": "project",
        "return": ["project.name", "project.type"],
    },      
    "sample": {
        "name": {
            "query": true,
            "inputType": "text",
            "default": "",
        },
        "type": {
            "query": true,
            "inputType": "subclass",
            "options": "this.settings.note.sample.type.map((item) => item.name)",
        },
        "description": {
            "query": true,
            "inputType": "text",
            "default": "",
        },
    },
};

export default sampleMetadataTemplate;