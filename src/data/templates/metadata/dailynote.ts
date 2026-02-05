import { MetaDataTemplate } from "../../../types";

const dailyNoteMetadataTemplate : MetaDataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { 
      type: "function", 
      context: ["plugin"], 
      expression: "plugin.manifest.version" 
    }
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["daily-note"],
  },
  "banner": {
    "query": false,
    "inputType": "text",
    "default": "![[obsidian-eln-banner.png]]"
  },
  "banner_y": {
    "query": false,
    "inputType": "text",
    "default": 0.336
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": { 
      type: "function", 
      context: ["date"], 
      expression: "date.today" 
    }
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
    "default": "daily-note"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": ["daily-note"]
  },
  "dailynote date": {
    "query": true,
    "inputType": "date",
    "info": "Select the date for this daily note.",
    "default": { 
      type: "function", 
      context: ["date"], 
      expression: "date.today" 
    }
  }
};

export default dailyNoteMetadataTemplate;