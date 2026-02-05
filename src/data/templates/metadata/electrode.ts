import { MetaDataTemplate } from "../../../types";

const electrodeMetadataTemplate: MetaDataTemplate = {
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
        "default": ["electrode"],
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
    "author": {
        "query": true,
        "inputType": "dropdown",
        "options": {
            type: "function",
            context: ["settings"],
            expression: "settings.authors?.map((item) => item.name) || []"
        },
    },
    "note type": {
        "query": false,
        "inputType": "text",
        "default": "electrode",
    },
    "tags": {
        "query": false,
        "inputType": "list",
        "default": {
            type: "function",
            context: ["userInput"],
            reactiveDeps: ["electrode.type"],
            expression: "[`electrode/${userInput.electrode.type.replace(/\\s/g, '_')}`]",
            fallback: ["electrode/unknown"]
        },
    },
    "electrode": {
        "name": {
            "query": true,
            "inputType": "text",
            "default": "",
            "placeholder": "Enter electrode name"
        },
        "type": {
            "query": true,
            "inputType": "subclass",
            "options": {
                type: "function",
                context: ["settings"],
                expression: "settings.note?.electrode?.type?.map((item) => item.name) || []"
            },
        },
    }
};

export default electrodeMetadataTemplate;