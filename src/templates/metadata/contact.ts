import { MetaDataTemplate } from "utils/types";

const contactMetadataTemplate : MetaDataTemplate= {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": "",
    "callback": "(value) => value.trim()"
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["contact"],
    "callback": "(value) => value.trim()"
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
    "default": "contact",
    "callback": "(value) => value.trim()"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": ["contact"],
    "callback": "(value) => value.trim()"
  },
  "name": {
    "title": {
      "query": true,
      "inputType": "text",
      "default": "",
      "callback": "(value) => value.trim()"
    },
    "given name": {
      "query": true,
      "inputType": "text",
      "default": "",
      "callback": "(value) => value.trim()"
    },
    "family name": {
      "query": true,
      "inputType": "text",
      "default": "",
      "callback": "(value) => value.trim()"
    }
  },
  "contact": {
    "work": {
      "email": {
        "query": true,
        "inputType": "text",
        "default": "name@domain.edu",
        "callback": "(value) => value.trim()"
      },
      "phone": {
        "query": true,
        "inputType": "text",
        "default": "+49 xxx xxx xxxx",
        "callback": "(value) => value.trim()"
      },
      "mobile": {
        "query": true,
        "inputType": "text",
        "default": "+49 xxx xxx xxxx",
        "callback": "(value) => value.trim()"
      },
      "fax": {
        "query": true,
        "inputType": "text",
        "default": "+49 xxx xxx xxxx",
        "callback": "(value) => value.trim()"
      }
    }
  },
  "address": {
    "work": {
      "affiliation": {
        "query": true,
        "inputType": "text",
        "default": "",
        "callback": "(value) => value.trim()"
      },
      "division": {
        "query": true,
        "inputType": "text",
        "default": "",
        "callback": "(value) => value.trim()"
      },
      "street": {
        "query": true,
        "inputType": "text",
        "default": "",
        "callback": "(value) => value.trim()"
      },
      "building": {
        "query": true,
        "inputType": "text",
        "default": "",
        "callback": "(value) => value.trim()"
      },
      "room": {
        "query": true,
        "inputType": "text",
        "default": "",
        "callback": "(value) => value.trim()"
      },
      "city": {
        "query": true,
        "inputType": "text",
        "default": "",
        "callback": "(value) => value.trim()"
      },
      "zip code": {
        "query": true,
        "inputType": "text",
        "default": "",
        "callback": "(value) => value.trim()"
      },
      "country": {
        "query": true,
        "inputType": "text",
        "default": "",
        "callback": "(value) => value.trim()"
      }
    }
  },
  "job position": {
    "query": true,
    "inputType": "text",
    "default": "",
    "callback": "(value) => value.trim()"
  },
  "group": {
    "query": true,
    "inputType": "text",
    "default": "",
    "callback": "(value) => value.trim()"
  }
};

export default contactMetadataTemplate;