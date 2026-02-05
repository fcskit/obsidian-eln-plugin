# ELN Plugin User Documentation

Welcome to the comprehensive user documentation for the Obsidian ELN Plugin. This guide will help you get started, understand all features, and make the most of the plugin for your research workflow.

## 🚀 Getting Started

### New to the Plugin?
1. **[Installation & Setup](installation.md)** - Install and configure the plugin
2. **[Features Overview](features.md)** - Discover all plugin capabilities  
3. **[Template Examples](template-examples/)** - Try ready-to-use templates

### Quick Start Workflow
1. Install the plugin from Obsidian's Community Plugin store
2. Configure basic settings (author name, default note location)
3. Create your first note using `Ctrl/Cmd+P` → "ELN: Create Note"
4. Choose a template that matches your research type
5. Fill in the structured form and create your note

## 📚 Complete Documentation

### 📖 Core Guides

#### [Installation & Setup](installation.md)
Complete installation instructions and initial configuration:
- Plugin installation (Community Store and manual)
- Basic settings configuration
- Author and institutional information setup
- Verification and troubleshooting

#### [Features Overview](features.md) 
Comprehensive overview of all plugin capabilities:
- Dynamic note creation with templates
- Chemical integration and periodic table
- Dashboard and project tracking
- Advanced template features
- Data export and integration options

#### [Template System Guide](template-system.md)
Deep dive into the template system:
- Understanding template structure
- Field types and configurations
- Reactive fields and dependencies
- Function descriptors for dynamic content
- Creating custom templates
- Best practices and troubleshooting

### ⚡ Quick References

#### [UI Components Guide](ui-components.md)
Comprehensive guide to ImageViewer, PeriodicTable, and Nested Properties Editor:
- ImageViewer: Interactive slideshow with thumbnails and effects
- PeriodicTable: Interactive periodic table with element details
- Nested Properties Editor: Visual frontmatter editing (sidebar and embedded)
- Configuration options and practical examples
- Integration patterns for research workflows

#### [Template Quick Reference](quick-reference.md)
Handy cheat sheet for template creation:
- Field type reference table with all supported input types
- Function descriptor formats (legacy and enhanced)
- Query operators and return clause formats
- Common patterns and best practices
- Validation checklist and troubleshooting

### � Practical Examples

#### [Template Examples](template-examples/)
Ready-to-use templates for common scenarios:
- **[Chemical Template](template-examples/chemical-template.md)** - Chemical compound documentation
- **[Experiment Template](template-examples/experiment-template.md)** - General laboratory experiments
- **[Process Template](template-examples/process-template.md)** - Laboratory processes and protocols
- **[Sample Template](template-examples/sample-template.md)** - Sample tracking and characterization
- **[Meeting Template](template-examples/meeting-template.md)** - Research meeting documentation

## 🎯 Common Use Cases

### Academic Research
- **Experiment Documentation**: Structure your experimental procedures and results
- **Literature Review**: Organize research papers with structured metadata
- **Thesis Writing**: Track research progress and organize findings
- **Collaboration**: Share structured templates with research groups

### Industry R&D
- **Product Development**: Document development phases and testing
- **Quality Control**: Standardize QC documentation and reporting
- **Regulatory Compliance**: Maintain compliant research records
- **Knowledge Management**: Capture and organize institutional knowledge

### Educational Settings
- **Student Labs**: Provide structured templates for student reports
- **Course Management**: Organize lab exercises and assessments
- **Teaching Materials**: Create reusable content templates
- **Assessment**: Standardize grading with structured submissions

## 🛠️ Customization & Advanced Usage

### Template Customization
- **Modify Existing Templates**: Adapt built-in templates to your needs
- **Create New Templates**: Build templates from scratch
- **Share Templates**: Export and share templates with colleagues
- **Template Libraries**: Organize collections of related templates

### Integration with Other Tools
- **Obsidian Plugins**: Use with Dataview, Calendar, and other plugins
- **External Systems**: Export data to LIMS, databases, or analysis tools
- **File Formats**: Work with various attachment types and formats
- **Sync Solutions**: Compatible with Obsidian Sync and third-party solutions

## 🆘 Support & Troubleshooting

### Common Issues
- **Template Not Loading**: Check file paths and JSON syntax
- **Fields Not Displaying**: Verify template structure and field types
- **Performance Issues**: Optimize templates and vault organization
- **Integration Problems**: Review plugin compatibility and settings

### Getting Help
- **Documentation Search**: Use the search function to find specific topics
- **Community Support**: Join GitHub Discussions for community help
- **Issue Reporting**: Report bugs through GitHub Issues
- **Feature Requests**: Suggest improvements and new features

### Best Practices
- **Template Organization**: Structure your templates logically
- **Performance**: Keep templates optimized for your vault size
- **Backup**: Regular backups of templates and configurations
- **Updates**: Stay current with plugin updates and new features

## 📈 Advanced Features

### Dashboard & Analytics
- **Project Tracking**: Monitor research progress across projects
- **Productivity Metrics**: Track note creation and research activity
- **Visual Reports**: Generate charts and summaries of your work
- **Calendar Integration**: Timeline view of experiments and deadlines

### Automation
- **Auto-tagging**: Automatic tag generation based on content
- **Field Pre-population**: Smart defaults based on previous entries
- **Template Suggestions**: Context-aware template recommendations
- **Batch Operations**: Bulk operations on multiple notes

### Collaboration Features
- **Shared Templates**: Distribute templates across research teams
- **Standardization**: Ensure consistent data collection formats
- **Export Capabilities**: Generate reports for sharing and publication
- **Version Control**: Track changes to templates and configurations

## 🔄 Migration & Workflow Integration

### From Other Systems
- **Legacy ELN Migration**: Import data from other electronic notebooks
- **File Organization**: Restructure existing notes with ELN templates
- **Data Conversion**: Convert unstructured notes to structured format
- **Workflow Adaptation**: Integrate ELN into existing research workflows

### Backup & Export
- **Template Backup**: Export your custom templates
- **Data Export**: Generate reports in various formats (PDF, CSV, JSON)
- **Vault Migration**: Move ELN setups between different vaults
- **Cloud Integration**: Sync with cloud storage solutions

## 📖 Related Resources

### Developer Documentation
For those interested in extending or customizing the plugin:
- **[Developer Documentation](../developer/)** - Technical implementation details
- **[API Reference](../developer/api-reference.md)** - Programming interfaces
- **[Contributing Guide](../developer/contributing.md)** - How to contribute

### External Links
- **[GitHub Repository](https://github.com/fcskit/obsidian-eln-plugin)** - Source code and releases
- **[Community Forum](https://github.com/fcskit/obsidian-eln-plugin/discussions)** - User discussions
- **[Issue Tracker](https://github.com/fcskit/obsidian-eln-plugin/issues)** - Bug reports and feature requests

---

**Need more help?** Check the [Features Overview](features.md) for detailed explanations of all capabilities, or explore the [Template Examples](template-examples/) to see the plugin in action.
- **Analysis Template**: Analytical measurement documentation
- **Project Template**: Project management and tracking

### 🔧 [Dynamic Note System](DYNAMIC_NOTE_SYSTEM.md)
Advanced features for dynamic note creation and management

## Common Use Cases

### Creating Custom Templates

1. Start with an [example template](template-examples/)
2. Modify fields to match your needs
3. Save as JSON file in your vault
4. Load via plugin settings

### Setting Up Laboratory Workflows

1. Define your note types (chemicals, processes, analyses)
2. Create templates for each type
3. Configure settings for each note type
4. Set up folder structures and naming conventions

### Integrating with Existing Vaults

1. Review existing note structure
2. Create templates that match current metadata
3. Gradually migrate to template-based system
4. Use query features to link related notes

## Features Overview

### Template System
- **Field Types**: Text, number, date, dropdown, multiselect, lists, queries
- **Object Lists**: Complex nested data structures
- **Query Integration**: Dynamic dropdowns from vault content
- **Function Descriptors**: Dynamic values and computations

### Note Management
- **Automated Creation**: Template-based note generation
- **Metadata Management**: Structured frontmatter handling
- **Linking System**: Automatic cross-referencing
- **Folder Organization**: Configurable folder structures

### Data Integration
- **Query System**: Advanced search and filtering
- **Cross-References**: Automatic relationship detection
- **Export Options**: Multiple format support
- **Version Control**: Template and note versioning

## Support and Community

### Getting Help
- 📚 Check the documentation first
- 🐛 Report bugs on GitHub issues
- 💡 Request features on GitHub discussions
- 👥 Join the community forum

### Contributing
- 📝 Improve documentation
- 🔧 Submit template examples
- 🧪 Test new features
- 🤝 Help other users

### Resources
- [Plugin Repository](https://github.com/fcskit/obsidian-eln-plugin)
- [Example Vault](link-to-example-vault)
- [Video Tutorials](link-to-tutorials)
- [Community Templates](link-to-community-templates)

---

For technical documentation and development information, see the [developer documentation](../developer/).

**Happy documenting! 🧪📊**