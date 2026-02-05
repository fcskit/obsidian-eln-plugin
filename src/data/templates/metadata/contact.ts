import { MetaDataTemplate } from "../../../types";

const contactMetadataTemplate : MetaDataTemplate= {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": "",
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["contact"],
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": { type: "function", value: "new Date().toISOString().split('T')[0]" },
  },
  "author": {
    "query": true,
    "inputType": "dropdown",
    "options": { type: "function", value: "this.settings.authors.map((item) => item.name)" },
  },
  "note type": {
    "query": false,
    "inputType": "text",
    "default": "contact",
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": ["contact"],
  },
  "name": {
    "title": {
      "query": true,
      "inputType": "text",
      "default": "",

    },
    "given name": {
      "query": true,
      "inputType": "text",
      "default": "",

    },
    "family name": {
      "query": true,
      "inputType": "text",
      "default": "",

    }
  },
  "contact": {
    "work": {
      "email": {
        "query": true,
        "inputType": "text",
        "default": "name@domain.edu",
  
      },
      "phone": {
        "query": true,
        "inputType": "text",
        "default": "+49 xxx xxx xxxx",
  
      },
      "mobile": {
        "query": true,
        "inputType": "text",
        "default": "+49 xxx xxx xxxx",
  
      },
      "fax": {
        "query": true,
        "inputType": "text",
        "default": "+49 xxx xxx xxxx",
  
      }
    }
  },
  "address": {
    "work": {
      "affiliation": {
        "query": true,
        "inputType": "text",
        "default": "",
  
      },
      "division": {
        "query": true,
        "inputType": "text",
        "default": "",
  
      },
      "street": {
        "query": true,
        "inputType": "text",
        "default": "",
  
      },
      "building": {
        "query": true,
        "inputType": "text",
        "default": "",
  
      },
      "room": {
        "query": true,
        "inputType": "text",
        "default": "",
  
      },
      "city": {
        "query": true,
        "inputType": "text",
        "default": "",
  
      },
      "zip code": {
        "query": true,
        "inputType": "text",
        "default": "",
  
      },
      "country": {
        "query": true,
        "inputType": "text",
        "default": "",
  
      }
    }
  },
  "job position": {
    "query": true,
    "inputType": "text",
    "default": "",
  },
  "group": {
    "query": true,
    "inputType": "text",
    "default": "",
  }
};

export default contactMetadataTemplate;