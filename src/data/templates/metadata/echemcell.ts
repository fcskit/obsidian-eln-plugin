import { MetaDataTemplate } from "../../../types";

const echemCellMetadataTemplate: MetaDataTemplate = {
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
        "default": ["echemcell"],
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
        "default": "electrochemical cell",
    },
    "tags": {
        "query": false,
        "inputType": "list",
        "default": {
            type: "function",
            context: ["userInput"],
            reactiveDeps: ["cell.type"],
            expression: "[`echemcell/${userInput.cell.type.replace(/\\s/g, '_')}`]",
            fallback: ["echemcell/unknown"]
        },
    },
    "cell": {
        "name": {
            "query": true,
            "inputType": "text",
            "default": "",
            "placeholder": "Enter cell name"
        },
        "type": {
            "query": true,
            "inputType": "subclass",
            "options": {
                type: "function",
                context: ["settings"],
                expression: "settings.note?.echemCell?.type?.map((item) => item.name) || []"
            },
        },
    }
};

export default echemCellMetadataTemplate