import { MetaDataTemplate, PathTemplate } from "../../../types";
import { SubclassMetadataTemplate } from "../metadataTemplates";

// Unified Note Template Interface
// This is an experimental structure that combines all note-related configuration
// in a single template: settings (fileName, folderPath), metadata template, and markdown template.
// This is not yet implemented in the plugin but serves as a reference for future development.
interface NoteTemplate {
  settings: {
    class: string;
    fileName: PathTemplate;
    folderPath: PathTemplate;
    subclasses?: {
      types: Array<{
        name: string;
        abbreviation: string;
        subClassMetadataTemplate: SubclassMetadataTemplate;
      }>;
    };
  };
  metadata: MetaDataTemplate;
  markdown: string;
}

const sampleTemplate: NoteTemplate = {
  settings: {
    class: "sample",
    fileName: {
      segments: [
        { kind: "function", context: ["settings", "userInput"], expression: "settings.general.operators.find(op => op.name === userInput.sample?.operator)?.initials || 'XX'", separator: "-" },
        { kind: "function", context: ["noteMetadata", "userInput"], expression: "noteMetadata.get(userInput.project?.name)?.project?.abbreviation || 'PRJ'", separator: "-" },
        { kind: "function", context: ["settings", "userInput"], expression: "settings.note.sample.type.find(t => t.name === userInput.sample?.type)?.abbreviation || 'SMP'", separator: "-" },
        { kind: "counter", prefix: "", separator: "", width: 3 }
      ]
    },
    folderPath: {
      segments: [
        { kind: "literal", value: "Experiments/Samples", separator: "/" },
        { kind: "field", path: "project.name", separator: "/" },
        { kind: "field", path: "sample.type", separator: "" }
      ]
    },
  },
  metadata: {
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
      "default": ["sample"],
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
      "default": "sample",
    },
    "tags": {
      "query": false,
      "inputType": "list",
      "default": {
        type: "function",
        context: ["userInput"],
        reactiveDeps: ["sample.type"],
        expression: "[`sample/${userInput.sample.type.replace(/\\s/g, '_')}`]",
        fallback: ["sample/unknown"]
      },
    },
    "project": {
      "query": true,
      "inputType": "queryDropdown",
      "search": "project",
      "where": [
        {
          "field": "note type",
          "is": "project"
        }
      ],
      "return": {
        "project.name": "project.name",
        "project.type": "project.type",
        "project.link": "file.link",
      }
    },
    "sample": {
      "name": {
        "query": false,
        "inputType": "postprocessor",
        "default": {
          type: "function",
          context: ["postprocessor"],
          expression: "postprocessor.filename"
        }
      },
      "operator": {
        "query": true,
        "inputType": "dropdown",
        "options": {
          type: "function",
          context: ["settings"],
          expression: "settings.general?.operators?.map((item) => item.name) || []"
        },
      },
      "type": {
        "query": true,
        "inputType": "subclass",
        "options": {
          type: "function",
          context: ["settings"],
          expression: "settings.note?.sample?.type?.map((item) => item.name) || []"
        },
      },
      "description": {
        "query": true,
        "inputType": "text",
        "multiline": true,
        "default": "",
        "placeholder": "Describe the sample composition, purpose, or key characteristics...",
      },
      "preparation": {
        "query": true,
        "inputType": "multiQueryDropdown",
        "search": "process",
        "where": [
          {
            "field": "note type",
            "is": "process"
          }
        ],
        "return": {
          "sample.preparation.name": "process.name",
          "sample.preparation.type": "process.type",
          "sample.preparation.devices": "process.devices",
          "sample.preparation.parameters": "process.parameters"
        },
      },
      "properties": {
        "query": true,
        "inputType": "editableObject",
        "objectTemplate": {},
        "editableKey": true,
        "editableUnit": true,
        "allowTypeSwitch": true,
        "removeable": true,
      },
    },
  },
  markdown: `
> [!Example] TOC
> - [[#Properties]]
> - [[#Processing]]
> - [[#My Notes]]
> - [[#Characterization]]
> - [[#Electrochemical Characterization]]

## Properties

\`\`\`eln-properties
key: sample
actionButtons: hidden
cssclasses: eln-sample
\`\`\`

## Processing

**Open process description**
- [[{{process.name}}]]

\`\`\`eln-properties
file: sample.process.name
key: process
actionButtons: hidden
cssclasses: eln-process
\`\`\`


## My Notes

> [!Info]
> Add your notes for this sample here.

## Characterization

\`\`\`base
formulas:
  analytical method: analysis.method
  operator: analysis.operator
  date: analysis.date
  status: analysis.status
views:
  - type: table
    name: Table
    filters:
      and:
        - tags.contains("analysis")
        - sample.name.contains(this.file.name)
    order:
      - file.name
      - formula.analytical method
      - formula.operator
      - formula.date
      - formula.status
    sort:
      - property: formula.analytical method
        direction: DESC

\`\`\`

## Electrochemical Characterization

\`\`\`base
formulas:
  analytical method: analysis.method
  operator: analysis.operator
  date: analysis.date
  status: analysis.status
  WE electrode: sample["working electrode"]["name"]
views:
  - type: table
    name: Table
    filters:
      and:
        - tags.contains("analysis")
        - sample.name.contains(this.file.name)
        - analysis.method.contains(GCPL)  
    order:
      - file.name
      - formula.analytical method
      - formula.operator
      - formula.date
      - formula.status
      - formula.WE electrode
    sort: []

\`\`\`

`
};

export default sampleTemplate;