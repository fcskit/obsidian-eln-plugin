const sampleMarkdownTemplate = `
> [!Example] TOC
> - [[#Properties]]
> - [[#Processing]]
> - [[#My Notes]]
> - [[#Characterization]]
> - [[#Electrochemical Characterization]]

## Properties

\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/sample", { obsidian: obsidian });
\`\`\`

## Processing

**Open process description**
- [[\${process.name}]]

\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/process", { obsidian: obsidian });
\`\`\`


## My Notes

> [!Info]
> Add your notes for this sample here.

## Characterization

\`\`\`dataview
TABLE WITHOUT ID
    file.link as Analysis,
    analysis["method"] as Method,
    analysis["operator"] as Operator,
    analysis["date"] as Date,
    analysis["status"] as Status
FROM #analysis 
WHERE sample.name = this.sample.name
\`\`\`

## Electrochemical Characterization

\`\`\`dataview
TABLE WITHOUT ID
    file.link as Analysis,
    sample["working electrode"]["name"] as "WE Electrode",
    sample["electrolyte"]["name"] as Electrolyte,
    analysis["method"] as Method,
    analysis["parameters"]["cycles"] as Cycles,
    analysis["parameters"]["Ewe min"] as Ewe_min,
    analysis["parameters"]["Ewe max"] as Ewe_max,
    analysis["date"] as Date,
    analysis["status"] as Status
FROM #analysis
WHERE sample.name = this.sample.name AND analysis.method = "GCPL"
\`\`\`

`;

export default sampleMarkdownTemplate;