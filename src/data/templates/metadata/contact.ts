import { MetaDataTemplate } from "../../../types";

const contactMetadataTemplate : MetaDataTemplate= {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", context: ["plugin"], expression: "plugin.manifest.version" },
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["contact"],
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": { type: "function", context: ["date"], expression: "date.today" },
  },
  "author": {
    "query": true,
    "inputType": "dropdown",
    "options": { type: "function", context: ["settings"], expression: "settings.authors?.map((item) => item.name) || []" },
  },
  "note type": {
    "query": false,
    "inputType": "text",
    "default": "contact",
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": { 
      type: "function", 
      context: ["userInput"],
      reactiveDeps: ["address.work.affiliation"],
      expression: "[`contact/${userInput.address.work.affiliation.replace(/\\s/g, '_').toLowerCase()}`]",
      fallback: ["contact/unknown"]
    },
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
        "default": "",
        "placeholder": "Enter work email"
      },
      "phone": {
        "query": true,
        "inputType": "text",
        "default": "+49 xxx xxx xxxx",
        "placeholder": "Enter work phone number"
      },
      "mobile": {
        "query": true,
        "inputType": "text",
        "default": "+49 xxx xxx xxxx",
        "placeholder": "Enter work mobile number"
      },
      "fax": {
        "query": true,
        "inputType": "text",
        "default": "+49 xxx xxx xxxx",
        "placeholder": "Enter work fax number"
      }
    }
  },
  "address": {
    "work": {
      "affiliation": {
        "query": true,
        "inputType": "text",
        "default": "",
        "placeholder": "Enter work affiliation"
      },
      "division": {
        "query": true,
        "inputType": "text",
        "default": "",
        "placeholder": "Enter work division"
      },
      "street": {
        "query": true,
        "inputType": "text",
        "default": "",
        "placeholder": "Enter work street"
      },
      "building": {
        "query": true,
        "inputType": "text",
        "default": "",
        "placeholder": "Enter work building"
      },
      "room": {
        "query": true,
        "inputType": "text",
        "default": "",
        "placeholder": "Enter work room"
      },
      "city": {
        "query": true,
        "inputType": "text",
        "default": "",
        "placeholder": "Enter work city"
      },
      "zip code": {
        "query": true,
        "inputType": "text",
        "default": "",
        "placeholder": "Enter work zip code"
      },
      "country": {
        "query": true,
        "inputType": "text",
        "default": "",
        "placeholder": "Enter work country"
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