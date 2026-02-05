const defaultMarkdownTemplate = `
> [!Example] TOC
> - [[#Compounds]]
> - [[#Electrodes]]
> - [[#Electrochemical Cells / Batteries]]
> - [[#All Samples]]

## Compounds

\`\`\`base
formulas:
  chemical formula: sample["chemical formula"]
  educts: sample.educts.name
  mass: sample.educts.mass
  date created: date-created
views:
  - type: table
    name: Table
    filters:
      and:
        - tags.contains("sample")
        - project.name.equals(this.project.name)
        - sample.type.equals("compound")
    order:
      - file.link
      - formula.chemical formula
      - formula.educts
      - formula.mass
      - formula.date created
    sort:
      - property: file.link
        direction: ASC

\`\`\`

## Electrodes

\`\`\`base
formulas:
  active material: sample["active material"].name
  AM mass: sample["active material"].mass
  binder mass: sample.binder.mass
  cond additive mass: sample["conductive additive"].mass
  date created: date-created
views:
  - type: table
    name: Table
    filters:
      and:
        - tags.contains("sample")
        - project.name.equals(this.project.name)
        - sample.type.equals("electrode")
    order:
      - file.link
      - formula.active material
      - formula.AM mass
      - formula.binder mass
      - formula.cond additive mass
      - formula.date created
    sort:
      - property: formula.active material
        direction: ASC
      - property: file.link
        direction: ASC

\`\`\`

## Electrochemical Cells / Batteries

\`\`\`base
formulas:
  working electrode: sample["working electrode"]["name"]
  counter electrode: sample["counter electrode"]["name"]
  reference electrode: sample["reference electrode"]["name"]
  electrolyte: sample["electrolyte"]["name"]
  date created: date-created
views:
  - type: table
    name: Table
    filters:
      and:
        - tags.contains("sample")
        - project.name.equals(this.project.name)
        - sample.type.equals("electrochemical cell")
    order:
      - file.link
      - formula.working electrode
      - formula.counter electrode
      - formula.reference electrode
      - formula.electrolyte
      - formula.date created
    sort:
      - property: file.link
        direction: ASC

\`\`\`

## All Samples

\`\`\`base
formulas:
  type: sample.type
  description: sample.description
  date created: date-created
views:
  - type: table
    name: Table
    filters:
      and:
        - tags.contains("sample")
        - project.name.equals(this.project.name)
    order:
      - file.link
      - formula.type
      - formula.description
      - formula.date created
    sort:
      - property: formula.type
        direction: ASC
      - property: file.link
        direction: ASC

\`\`\`
`;

export default defaultMarkdownTemplate;