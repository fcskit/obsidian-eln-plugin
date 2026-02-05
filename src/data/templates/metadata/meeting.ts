import { MetaDataTemplate } from "../../../types";

const meetingMetadataTemplate : MetaDataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", value: "this.manifest.version" },
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["meeting"],
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": { type: "function", value: "new Date().toISOString().split('T')[0]" },
    "callback": { type: "function", value: "(value) => value" }
  },
  "author": {
    "query": true,
    "inputType": "dropdown",
    "options": { type: "function", value: "this.settings.authors.map((item) => item.name)" },
  },
  "note type": {
    "query": false,
    "inputType": "text",
    "default": "meeting",
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": ["meeting"],
  },
  "meeting": {
    "title": {
      "query": true,
      "inputType": "text",
      "default": "",

    },
    "type": {
      "query": true,
      "inputType": "dropdown",
      "options": ["team meeting", "project meeting", "client meeting", "workshop", "conference", "other"],
    },
    "date": {
      "query": true,
      "inputType": "date",
      "default": { type: "function", value: "new Date().toISOString().split('T')[0]" },
      "callback": { type: "function", value: "(value) => value" }
    },
    "time": {
      "query": true,
      "inputType": "text",
      "default": "(new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })",
    },
    "location": {
      "query": true,
      "inputType": "text",
      "default": "",
    },
    "participants": {
      "query": true,
      "inputType": "multiselect",
      "options": "this.settings.authors.map((author) => author.name)",
      "callback": { type: "function", value: "(value) => value" }
    },
    "topics": {
      "query": true,
      "inputType": "list",
      "default": [
        {
          "time": "(new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })",
          "title": "1st Topic",
          "contributor": ""
        },
        {
          "time": "(new Date(new Date().getTime() + 15 * 60000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })",
          "title": "2nd Topic",
          "contributor": ""
        },
        {
          "time": "(new Date(new Date().getTime() + 30 * 60000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })",
          "title": "3rd Topic",
          "contributor": ""
        }
      ],
      "callback": { type: "function", value: "(value) => value" }
    }
  },
  "project": {
    "name": {
      "query": true,
      "inputType": "text",
      "default": "",
    }
  }
};

export default meetingMetadataTemplate;