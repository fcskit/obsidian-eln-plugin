import { MetaDataTemplate } from "../../../types";

const meetingMetadataTemplate : MetaDataTemplate = {
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
    "default": ["meeting"],
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
    "default": "meeting",
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": { 
      type: "function",
      context: ["userInput"],
      reactiveDeps: ["meeting.type"],
      expression: "[`meeting/${userInput.meeting.type.replace(/\\s/g, '_')}`]",
      fallback: ["meeting/unknown"]
    },
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
      "default": {
        type: "function",
        context: ["date"],
        expression: "date.today"
      },
    },
    "time": {
      "query": true,
      "inputType": "text",
      "default": {
        type: "function",
        context: [],
        function: "() => { const now = new Date(); const minutes = now.getMinutes(); const roundedMinutes = Math.ceil(minutes / 15) * 15; const roundedTime = new Date(now); roundedTime.setMinutes(roundedMinutes, 0, 0); return roundedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }"
      },
    },
    "location": {
      "query": true,
      "inputType": "text",
      "default": "",
    },
    "participants": {
      "query": true,
      "inputType": "list",
      "listType": "text",
      "placeholder": "Enter participant names...",
      "default": [],
    },
    "topics": {
      "query": true,
      "inputType": "list",
      "listType": "object",
      "initialItems": 1,
      "objectTemplate": {
        "time": {
          "query": true,
          "inputType": "text",
          "default": {
            type: "function",
            context: [],
            function: "() => { const now = new Date(); const minutes = now.getMinutes(); const roundedMinutes = Math.ceil(minutes / 15) * 15; const roundedTime = new Date(now); roundedTime.setMinutes(roundedMinutes, 0, 0); return roundedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }"
          }
        },
        "title": {
          "query": true,
          "inputType": "text",
          "default": "1st Topic"
        },
        "contributor": {
          "query": true,
          "inputType": "text",
          "default": ""
        }
      },
    }
  },
  "project": {
    "name": {
      "query": true,
      "inputType": "queryDropdown",
      "search": "project",
    }
  }
};

export default meetingMetadataTemplate;