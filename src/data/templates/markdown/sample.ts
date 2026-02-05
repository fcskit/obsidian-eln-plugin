const sampleMarkdownTemplate = `
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

`;

export default sampleMarkdownTemplate;