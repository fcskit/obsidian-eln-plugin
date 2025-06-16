import { MetaDataTemplate } from "utils/types";

const dailyNoteMetadataTemplate : MetaDataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": ""
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
    "default": "new Date().toISOString().split('T')[0]"
  },
  "author": {
    "query": false,
    "inputType": "text",
    "default": ""
  },
  "note type": {
    "query": false,
    "inputType": "text",
    "default": "daily-note"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": ["#daily-note"]
  },
  "dailynote date": {
    "query": true,
    "inputType": "date",
    "info": "Select the date for this daily note.",
    "default": "new Date().toISOString().split('T')[0]"
  }
};

export default dailyNoteMetadataTemplate;