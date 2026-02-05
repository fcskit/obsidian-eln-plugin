const contactMarkdownTemplate = `
\`\`\`daily-note-nav
\`\`\`

# Daily Note - {{title}}

  - ### Tasks
    - [ ] Today 1
    - [ ] Today 2
    - [ ] Today 3


- ### 
  \`\`\`image-viewer
  folder: assets/images/Motivation/
  size: 300
  shuffle: auto
  shuffleOrder: random
  interval: 60
  \`\`\`

- ### Progress
  \`\`\`circular-progress
  color:rgb(152, 115, 247)
  taskLabel: completed;
  \`\`\`

# Notes


`;

export default contactMarkdownTemplate;