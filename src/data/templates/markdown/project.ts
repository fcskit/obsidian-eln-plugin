const projectMarkdownTemplate = `
# Experiments

- ### [[Samples - {{project.name}}|Samples]]
  \`\`\`dataview
  LIST
  FROM #sample AND!"assets"
  WHERE project.name = this.project.name
  SORT file.mtime.ts DESC
  LIMIT 6
  \`\`\`

- ### [[Analyses]]
  \`\`\`dataview
  LIST
  FROM #analysis  AND!"assets"
  WHERE project.name = this.project.name
  SORT file.mtime.ts DESC
  LIMIT 6
  \`\`\`

- ### [[Processes]]
  \`\`\`dataview
  LIST
  FROM #process  AND!"assets"
  SORT file.mtime.ts DESC
  LIMIT 6
  \`\`\`

- ### Project Meetings
  \`\`\`dataview
  LIST
  FROM #meeting AND!"assets"
  WHERE project.name = this.project.name
  SORT file.mtime.ts DESC
  LIMIT 6
  \`\`\`

- ### Other Meetings
	- [[Clustertreffen 3 (2022 Nov, München)]]
 

# Important Dates

- ### General
	**Project start:** \`=this.project.start\`
	**Project end:** \`=this.project.end\`

- ### Reports
  \`\`\`dataviewjs
  var querry = Object.entries(dv.current().file.frontmatter.project.reports)
        .map(q => '- [ ] ' + q[1].type + '[due::' + q[1]['due date'] + ']')
  dv.paragraph(querry)
  \`\`\`

- ### Upcoming Meetings
	- 17.11.2022 Clustertreffen München
`;

export default projectMarkdownTemplate;