---
layout: default
title: Developer Documentation
---

# Developer Documentation

Welcome to the public developer documentation for the Obsidian ELN Plugin. This section contains information useful for contributors and those interested in the project's development.

## 📋 Available Documentation

### [Project Roadmap](ROADMAP)
Current development status, planned features, and version timeline. See what's coming next and what we're currently working on.

### [Known Issues](KNOWN-ISSUES)
List of known bugs, limitations, and workarounds. Check here before reporting issues or if you encounter unexpected behavior.

### [README](README)
Overview of the developer documentation structure and how to get started contributing to the project.

## 🤝 Contributing

Want to contribute to the Obsidian ELN Plugin? Here's how to get started:

### For Code Contributors

1. **Fork and clone** the repository
   ```bash
   git clone https://github.com/YOUR-USERNAME/obsidian-eln-plugin.git
   cd obsidian-eln-plugin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the plugin**
   ```bash
   npm run build
   ```

4. **Run in development mode**
   ```bash
   npm run dev
   # Plugin rebuilds automatically on file changes
   ```

5. **Make your changes** and test thoroughly

6. **Submit a pull request** with:
   - Clear description of changes
   - Test results
   - Screenshots (for UI changes)

### For Documentation Contributors

Documentation improvements are always welcome! You can:

- Fix typos or unclear explanations
- Add examples and use cases
- Improve installation instructions
- Translate documentation

Simply edit the markdown files in the `docs/` folder and submit a pull request.

## 🐛 Reporting Issues

Found a bug? Please [open an issue](https://github.com/fcskit/obsidian-eln-plugin/issues/new) with:

- **Clear title** describing the problem
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Environment details** (Obsidian version, OS, plugin version)
- **Screenshots or logs** if applicable

Check the [Known Issues](KNOWN-ISSUES) page first to see if it's already documented.

## 💡 Feature Requests

Have an idea for a new feature? We'd love to hear it!

1. Check the [Roadmap](ROADMAP) to see if it's already planned
2. Search [existing issues](https://github.com/fcskit/obsidian-eln-plugin/issues) to avoid duplicates
3. [Open a feature request](https://github.com/fcskit/obsidian-eln-plugin/issues/new) with:
   - Clear description of the feature
   - Use case and benefits
   - Possible implementation approach (optional)

## 📚 Additional Resources

### For Contributors Who Clone the Repo

When you clone the repository, you'll find additional internal developer documentation in:

- `docs/developer/core/` - Architecture and API reference
- `docs/developer/components/` - Component-specific documentation
- `docs/developer/guides/` - Testing and debugging guides
- `docs/developer/todos/` - Current development tasks

These files are part of the repository for contributors but are not published on this documentation site.

### External Resources

- [Obsidian Plugin API](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [GitHub Repository](https://github.com/fcskit/obsidian-eln-plugin)

## 🔧 Development Tools

### Build Commands

```bash
npm run build       # Full build with type checking
npm run build-fast  # Quick build (no type checking)
npm run dev         # Watch mode (auto-rebuild)
npm run release     # Create release package
```

### Testing

```bash
# Manual testing in test vault
npm run build
# Then open test-vault/ in Obsidian

# Automated tests (if available)
npm test
```

### Health Checks

```bash
# Run health check script
./scripts/health-check.sh

# Create backup before major changes
./scripts/auto-backup.sh
```

## 📞 Get Help

- **Questions?** Ask in [GitHub Discussions](https://github.com/fcskit/obsidian-eln-plugin/discussions)
- **Chat?** Join the [Obsidian Discord](https://discord.gg/obsidianmd) and mention the plugin
- **Bug?** [Open an issue](https://github.com/fcskit/obsidian-eln-plugin/issues)

---

Thank you for your interest in contributing to the Obsidian ELN Plugin! 🎉
