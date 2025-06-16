import { MetaDataTemplate } from "utils/types";

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
        "default": "(userInput) => [`#project/${(userInput['project.name'] || 'unknown').replace(/\\s/g, '_')}`]",
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
            "inputType": "dropdown",
            "options": "this.settings.note.project.type.map((type) => type.name)",
            "callback": "(value) => value.trim()"
        },
        "category": {
            "query": true,
            "inputType": "dropdown",
            "options": "(userInput) => this.settings.note.project.type.find((type) => type.name === userInput['project.type'])?.category || []",
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
        "duration": {
            "query": false,
            "inputType": "text",
            "default": "",
            "callback": "(value) => value.trim()"
        },
        "funding agency": {
            "query": true,
            "inputType": "text",
            "default": "",
            "callback": "(value) => value.trim()"
        },
        "funding code": {
            "query": true,
            "inputType": "text",
            "default": "",
            "callback": "(value) => value.trim()"
        },
        "title": {
            "query": true,
            "inputType": "text",
            "default": "",
            "callback": "(value) => value.trim()"
        },
        "subproject": {
            "query": true,
            "inputType": "text",
            "default": "",
            "callback": "(value) => value.trim()"
        },
        "acronym": {
            "query": true,
            "inputType": "text",
            "default": "",
            "callback": "(value) => value.trim()"
        },
        "project coordinator science": {
            "query": true,
            "inputType": "text",
            "default": "",
            "callback": "(value) => value.trim()"
        },
        "project manager administration": {
            "query": true,
            "inputType": "text",
            "default": "",
            "callback": "(value) => value.trim()"
        },
        "reports": {
            "query": true,
            "inputType": "list",
            "default": [
                {
                    "type": "interim report",
                    "due date": "YYYY-MM-DD",
                    "link": "[[Interim Report-ProjectName-YYYY-MM]]"
                },
                {
                    "type": "milestone report",
                    "due date": "YYYY-MM-DD",
                    "link": "[[Milestone Report-ProjectName-YYYY-MM]]"
                },
                {
                    "type": "final report",
                    "due date": "YYYY-MM-DD",
                    "link": "[[Final Report-ProjectName-YYYY-MM]]"
                }
            ],
            "callback": "(value) => value"
        }
    }
};

export default projectMetadataTemplate;