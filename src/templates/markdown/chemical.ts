const chemicalMarkdownTemplate = `
\`\`\`smiles
=this.chemical.smiles
\`\`\`

\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/chemical", {obsidian: obsidian});
\`\`\`

\`\`\`dataviewjs
  await dv.view("/assets/javascript/dataview/views/chem_links", {});
\`\`\`

`;

export default chemicalMarkdownTemplate;