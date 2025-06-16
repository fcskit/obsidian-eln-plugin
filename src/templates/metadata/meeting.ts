import { MetaDataTemplate } from "utils/types";

const meetingMetadataTemplate : MetaDataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": "",
    "callback": "(value) => value.trim()"
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["meeting"],
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": "new Date().toISOString().split('T')[0]",
    "callback": "(value) => value"
  },
  "author": {
    "query": false,
    "inputType": "text",
    "default": "",
    "callback": "(value) => value.trim()"
  },
  "note type": {
    "query": false,
    "inputType": "text",
    "default": "meeting",
    "callback": "(value) => value.trim()"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": ["#meeting"],
    "callback": "(value) => value.trim()"
  },
  "meeting": {
    "title": {
      "query": true,
      "inputType": "text",
      "default": "",
      "callback": "(value) => value.trim()"
    },
    "type": {
      "query": true,
      "inputType": "dropdown",
      "options": ["team meeting", "project meeting", "client meeting", "workshop", "conference", "other"],
      "callback": "(value) => value.trim()"
    },
    "date": {
      "query": true,
      "inputType": "date",
      "default": "new Date().toISOString().split('T')[0]",
      "callback": "(value) => value"
    },
    "time": {
      "query": true,
      "inputType": "text",
      "default": "(new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })",
      "callback": "(value) => value.trim()"
    },
    "location": {
      "query": true,
      "inputType": "text",
      "default": "",
      "callback": "(value) => value.trim()"
    },
    "participants": {
      "query": true,
      "inputType": "multiselect",
      "options": "this.settings.authors.map((author) => author.name)",
      "callback": "(value) => value"
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
      "callback": "(value) => value"
    }
  },
  "project": {
    "name": {
      "query": true,
      "inputType": "text",
      "default": "",
      "callback": "(value) => value.trim()"
    }
  }
};

export default meetingMetadataTemplate;