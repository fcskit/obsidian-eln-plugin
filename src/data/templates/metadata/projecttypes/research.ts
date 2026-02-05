export const researchSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "project.funding agency",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
                "placeholder": "Enter funding agency",
            }
        },
        {
            "fullKey": "project.funding code",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
                "placeholder": "Enter funding code",
            },
        },
        {
            "fullKey": "project.title",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
                "placeholder": "Enter full project title",
            },
        },
        {
            "fullKey": "project.subproject",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
                "placeholder": "Enter subproject title if applicable",
            },
        },
        {
            "fullKey": "project.acronym",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
                "placeholder": "Enter project acronym",
            },
        },
        {
            "fullKey": "project.project coordinator science",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
                "placeholder": "Enter project coordinator (science)",
            },
        },
        {
            "fullKey": "project.project manager administration",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
                "placeholder": "Enter project manager (administration)",
            },
        },
        {
            "fullKey": "project.due dates",
            "input": {
                "query": true,
                "inputType": "list",
                "listType": "object",
                "initialItems": 1,
                "objectTemplate": {
                    "type": {
                        "inputType": "text",
                        "default": "",
                        "placeholder": "e.g., report, milestone, deliverable",
                    },
                    "date": {
                        "inputType": "date",
                        "default": "",
                    },
                },
            },
        },
    ],
}