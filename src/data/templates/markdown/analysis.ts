const analysisMarkdownTemplate = `

\`\`\`eln-properties
key: analysis
actionButtons: hidden
cssclasses: analysis
\`\`\`

# Analysis Results

\`\`\`image-viewer
folder: {{folderPath}}/plots
bgColor: #f5f5f5
size: 800
shuffle: manual
shuffleOrder: random
interval: 5
thumbnails: true
\`\`\`

`;

export default analysisMarkdownTemplate;