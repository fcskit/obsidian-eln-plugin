import { MetaDataTemplate } from "../../utils/types";

const projectMetadataTemplate : MetaDataTemplate = {
    "ELN version": {
        "query": false,
        "inputType": "text",
        "default": "",
        "callback": "(value) => value.trim()"
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
        "callback": "(value) => value.trim()"
    },
    "banner_y": {
        "query": false,
        "inputType": "number",
        "default": 0.5,
        "callback": "(value) => value"
    },
    "author": {
        "query": false,
        "inputType": "text",
        "default": "",
        "callback": "(value) => value.trim()"
    },
    "date created": {
        "query": false,
        "inputType": "date",
        "default": "new Date().toISOString().split('T')[0]",
        "callback": "(value) => value"
    },
    "note type": {
        "query": false,
        "inputType": "text",
        "default": "project",
        "callback": "(value) => value.trim()"
    },
    "tags": {
        "query": false,
        "inputType": "list",
        "default": "(userInput) => [`project/${(userInput['project.name'] || 'unknown').replace(/\\s/g, '_')}`]",
        "callback": "(value) => value.trim()"
    },
    "project": {
        "name": {
            "query": true,
            "inputType": "text",
            "default": "",
            "callback": "(value) => value.trim()"
        },
        "abbreviation": {
            "query": true,
            "inputType": "text",
            "default": "",
            "callback": "(value) => value.trim()"
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
        //     "callback": "(value) => value.trim()"
        // },
        "description": {
            "query": true,
            "inputType": "text",
            "default": "",
            "callback": "(value) => value.trim()"
        },
        "status": {
            "query": true,
            "inputType": "dropdown",
            "options": ["active", "completed", "on hold", "cancelled"],
            "callback": "(value) => value.trim()"
        },
        "start": {
            "query": true,
            "inputType": "date",
            "default": "new Date().toISOString().split('T')[0]",
            "callback": "(value) => value"
        },
        "end": {
            "query": true,
            "inputType": "date",
            "default": "",
            "callback": "(value) => value"
        },
    }
};

export default projectMetadataTemplate;