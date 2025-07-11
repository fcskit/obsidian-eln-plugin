export const programmingSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "project.language",
            "input": {
                "query": true,
                "inputType": "dropdown",
                "options": ["Python", "JavaScript", "Java", "C++", "Ruby", "Go", "Rust", "Swift", "Kotlin", "PHP"],
                "default": "Python",
                "callback": "(value) => value",
            }
        },
        {
            "fullKey": "project.framework",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
            },
        },
        // {
        //     "fullKey": "project.libraries",
        //     "input": {
        //         "query": true,
        //         "inputType": "list",
        //         "default": [],
        //         "callback": "(value) => value.map(lib => lib.trim()).filter(lib => lib !== '')",
        //     },
        // },
        {
            "fullKey": "project.version control",
            "input": {
                "query": true,
                "inputType": "dropdown",
                "options": ["Git", "SVN", "Mercurial", "None"],
                "default": "Git",
                "callback": "(value) => value",
            }
        },
        {
            "fullKey": "project.documentation",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
            },
        },
        // {
        //     "fullKey": "project.repository",
        //     "input": {
        //         "query": true,
        //         "inputType": "external-link",
        //         "default": "",
        //     },
        // },
        // {
        //     "fullKey": "project.contributors",
        //     "input": {
        //         "query": true,
        //         "inputType": "list",
        //         "default": [],
        //         "callback": "(value) => value.map(contributor => contributor.trim()).filter(contributor => contributor !== '')",
        //     },
        // },
    ],
}