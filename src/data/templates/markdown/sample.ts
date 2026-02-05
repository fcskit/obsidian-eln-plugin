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

\`\`\`base
formulas:
  processes: sample.preparation.map([value.link])
views:
  - type: list
    name: Processes
    filters:
      and:
        - tags.contains("sample")
        - sample.name == this.sample.name
    order:
      - formula.processes

\`\`\`

## My Notes

> [!Info]
> Add your notes for this sample here.

## All Characterizations

\`\`\`base
formulas:
  analytical method: analysis.method.name
  operator: analysis.operator
  date: analysis.date
  status: analysis.status
properties:
  file.name:
    displayName: Analysis
  formula.analytical method:
    displayName: Method
  formula.operator:
    displayName: Operator
  formula.date:
    displayName: Date
  formula.status:
    displayName: Status
views:
  - type: table
    name: Analyses
    filters:
      and:
        - tags.contains("analysis")
        - sample.name == this.file.name
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

## Electrochemical Characterizations

\`\`\`base
formulas:
  analytical method: analysis.method.name
  operator: analysis.operator
  date: analysis.date
  status: analysis.status
  WE electrode: sample["working electrode"]["name"]
properties:
  file.name:
    displayName: Analysis
  formula.analytical method:
    displayName: Method
  formula.operator:
    displayName: Operator
  formula.date:
    displayName: Date
  formula.status:
    displayName: Status
views:
  - type: table
    name: Echem. Analyses
    filters:
      and:
        - tags.contains("analysis")
        - sample.name == this.file.name
        - - analysis.method.name == GCPL
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