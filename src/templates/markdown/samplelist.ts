const defaultMarkdownTemplate = `
> [!Example] TOC
> - [[#Compounds]]
> - [[#Electrodes]]
> - [[#Electrochemical Cells / Batteries]]
> - [[#All Samples]]

## Compounds

\`\`\`dataview
TABLE WITHOUT ID
  file.link as Sample, 
  sample["chemical formula"] as "Formula", 
  sample.educts.name as "Educts",
  sample.educts.mass as "Mass",
  date-created
FROM #sample
WHERE project.name = this.project.name AND sample.type = "compound"
SORT sample.type, file.link asc
\`\`\`

## Electrodes

\`\`\`dataview
TABLE WITHOUT ID
  file.link as Sample, 
  sample["active material"].name as "Active material",
  sample["active material"].mass as "AM mass",
  sample.binder.mass as "Binder mass",
  sample["conductive additive"].mass as "Cond. additive mass",
  date-created
FROM #sample
WHERE project.name = this.project.name AND sample.type = "electrode"
SORT electrode["active-material"], sample.type, file.link asc
\`\`\`

## Electrochemical Cells / Batteries

\`\`\`dataview
TABLE WITHOUT ID
  file.link as Sample, 
  sample["working electrode"]["name"] as "Working",
  sample["counter electrode"]["name"] as "Counter",
  sample["reference electrode"]["name"] as "Reference",
  sample["electrolyte"]["name"] as "Electrolyte",
  date-created
FROM #sample
WHERE project.name = this.project.name AND sample.type = "electrochemical cell"
SORT sample.type, file.link asc
\`\`\`

## All Samples

\`\`\`dataview
TABLE WITHOUT ID
  file.link as Sample, 
  sample.type as Type,
  sample.description as Description, 
  date-created
FROM #sample
WHERE project.name = this.project.name
SORT sample.type, file.link asc
\`\`\`
`;

export default defaultMarkdownTemplate;