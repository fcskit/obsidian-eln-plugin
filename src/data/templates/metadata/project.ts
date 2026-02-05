import { MetaDataTemplate } from "../../../types";

const projectMetadataTemplate : MetaDataTemplate = {
    "ELN version": {
        "query": false,
        "inputType": "text",
        "default": { type: "function", value: "this.manifest.version" },
    },
    "cssclasses": {
        "query": false,
        "inputType": "list",
        "default": ["project", "dashboard", "wide-page"],
    },
    "banner": {
        "query": false,
        "inputType": "text",
        "default": "![[obsidian-eln-banner.png]]",
    },
    "banner_y": {
        "query": false,
        "inputType": "number",
        "default": 0.5,
    },
    "author": {
        "query": true,
        "inputType": "dropdown",
        "options": { type: "function", value: "this.settings.authors.map((item) => item.name)" },
    },
    "date created": {
        "query": false,
        "inputType": "date",
        "default": { type: "function", value: "new Date().toISOString().split('T')[0]" },
    },
    "note type": {
        "query": false,
        "inputType": "text",
        "default": "project",
    },
    "tags": {
        "query": false,
        "inputType": "list",
        "default": { 
          type: "function", 
          userInputs: ["project.type"],
          value: "project.type ? [`project/${project.name.replace(/\\s/g, '_')}`] : ['project/unknown']"
        },
      },
    "project": {
        "name": {
            "query": true,
            "inputType": "text",
            "default": "",

        },
        "abbreviation": {
            "query": true,
            "inputType": "text",
            "default": "",

        },
        "type": {
            "query": true,
            "inputType": "subclass",
            "options": "this.settings.note.project.type.map((item) => item.name)",
        },
        // "category": {
        //     "query": true,
        //     "inputType": "dropdown",
        //     "options": "(userInput) => this.settings.note.project.type.find((type) => type.name === userInput['project.type'])?.category || []",
        //  
        // },
        "description": {
            "query": true,
            "inputType": "text",
            "default": "",

        },
        "status": {
            "query": true,
            "inputType": "dropdown",
            "options": ["active", "completed", "on hold", "cancelled"],

        },
        "start": {
            "query": true,
            "inputType": "date",
            "default": { type: "function", value: "new Date().toISOString().split('T')[0]" },

        },
        "end": {
            "query": true,
            "inputType": "date",
            "default": "",

        },
    }
};

export default projectMetadataTemplate;