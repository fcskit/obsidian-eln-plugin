import { MetaDataTemplate } from "../../../types";

const projectMetadataTemplate : MetaDataTemplate = {
    "ELN version": {
        "query": false,
        "inputType": "text",
        "default": {
            type: "function",
            context: ["plugin"],
            expression: "plugin.manifest.version"
        },
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
        "options": {
            type: "function",
            context: ["settings"],
            expression: "settings.authors?.map((item) => item.name) || []"
        },
    },
    "date created": {
        "query": false,
        "inputType": "date",
        "default": {
            type: "function",
            context: ["date"],
            expression: "date.today"
        },
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
            context: ["userInput"],
            reactiveDeps: ["project.type"],
            expression: "[`project/${userInput.project.type.replace(/\\s/g, '_')}`]",
            fallback: ["project/unknown"]
        },
    },
    "project": {
        "name": {
            "query": true,
            "inputType": "text",
            "default": "",
            "placeholder": "Enter project name",
        },
        "abbreviation": {
            "query": true,
            "inputType": "text",
            "default": "",
            "placeholder": "Enter project abbreviation",
        },
        "type": {
            "query": true,
            "inputType": "subclass",
            "options": {
                type: "function",
                context: ["settings"],
                expression: "settings.note?.project?.type?.map((item) => item.name) || []"
            },
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
            "multiline": true,
            "placeholder": "Enter project description",
        },
        "status": {
            "query": true,
            "inputType": "dropdown",
            "options": ["active", "completed", "on hold", "cancelled"],

        },
        "start": {
            "query": true,
            "inputType": "date",
            "default": {
                type: "function",
                context: ["date"],
                expression: "date.today"
            },
        },
        "end": {
            "query": true,
            "inputType": "date",
            "default": "",
        },
    }
};

export default projectMetadataTemplate;