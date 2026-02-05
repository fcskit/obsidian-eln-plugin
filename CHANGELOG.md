# Changelog

All notable changes to the Obsidian ELN Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0-beta.1] - 2026-01-27

### 🎉 First Public Beta Release

This is the first public beta release of the Obsidian ELN Plugin! We're excited to share this with the community and gather feedback.

### ✨ Features

- **Dynamic Note Creation** - Create structured lab notes with intelligent forms and templates
- **Template System** - JSON-based metadata templates with support for:
  - Text, number, date, boolean inputs
  - Dropdowns and multi-select fields
  - Nested objects and lists
  - Query-based dropdowns (search your vault)
  - Subclass templates for specialized note types
- **Chemical Integration**
  - Periodic table viewer
  - Chemical structure lookup (framework in place)
  - Chemical property management
- **Nested Properties Editor (NPE)** - Edit YAML frontmatter with visual tree editor
- **Sample Management** - Track samples, experiments, processes, and analyses
- **Metadata Templates** - Pre-configured templates for:
  - Chemicals
  - Samples (with subclasses: compound, electrode, electrochemCell)
  - Experiments
  - Processes
  - Analyses
  - Meetings
  - Projects

### 🐛 Bug Fixes (Recent)

#### Template System Fixes (Jan 2026)
- **Fixed 15+ template migration bugs** from legacy system
- **Number + Unit Fields**:
  - Fixed default value preservation (changed `||` to `??` operator)
  - Fixed initial value extraction for number+unit fields
  - Fixed rendering issue where number+unit fields showed as nested objects
  - Fixed `isNestedObject()` logic to properly recognize `{value, unit}` structure
- **Object List Nesting**:
  - Fixed duplication/nesting bug when switching subclasses multiple times
  - Fixed InputManager retaining stale field data after template changes
  - Added field filtering in UniversalObjectRenderer constructor
- **QueryDropdown Fields**:
  - Fixed rendering issue where field configs displayed instead of inputs
  - Fixed `fullKey` syntax for electrochemCell template queries
  - Added proper handling of query return fields

### 🔧 Technical Improvements

- **Logging System** - Centralized logger with component-based filtering
  - **NEW**: Debug logging disabled by default for clean production experience
  - **NEW**: Unified Debug Settings modal with checkboxes for all components
  - **NEW**: Simplified from 14 commands to 3 streamlined commands
  - **NEW**: Easy debug workflow for beta testers reporting bugs
- **Template Manager** - Improved subclass template merging and data preservation
- **InputManager** - Better state management across template changes
- **Build System** - Fast build option (`npm run build-fast`) for development
- **BRAT Support** - Easy beta installation and auto-updates via BRAT plugin

### 📚 Documentation

- Comprehensive developer documentation
- Template syntax reference
- Architecture overview
- Query/mapping syntax proposal (for future implementation)

### ⚠️ Known Limitations

- **Query/Mapping System**: Current implementation is functional but syntax will be improved in future releases
- **Chemical Lookup**: API integration framework exists but not fully implemented
- **Mobile Support**: Primarily tested on desktop, mobile may have issues
- **Template Editor**: Currently requires manual JSON editing

### 🎯 Planned for Next Release

- **Improved Query Syntax** - More flexible and intuitive mapping syntax
- **Dynamic Field Rendering** - Show query result fields in modal for editing
- **Enhanced Chemical Lookup** - Complete API integration for PubChem, ChemSpider
- **Template Validation** - Better error messages and validation
- **Performance Optimizations** - Faster rendering for large templates

### 📥 Installation

**Beta Installation (Manual)**
1. Download `obsidian-eln-0.7.0-beta.1.zip` from [GitHub Releases](https://github.com/fcskit/obsidian-eln-plugin/releases)
2. Extract to your vault's `.obsidian/plugins/obsidian-eln/` folder
3. Enable in Settings → Community plugins

**Requirements**
- Obsidian 0.15.0 or higher
- Desktop or mobile device (desktop recommended for beta)

### 🐛 Reporting Issues

Found a bug? Please report it on [GitHub Issues](https://github.com/fcskit/obsidian-eln-plugin/issues) with:
- Plugin version (0.7.0-beta.1)
- Obsidian version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### 🙏 Acknowledgments

Thank you to everyone who has contributed feedback and testing during development!

---

## [0.7.0-alpha] - 2025-01-20

### Internal Alpha Release

Initial development version with core features implemented.

- Template system
- Note creation workflows
- Basic chemical integration
- Nested Properties Editor
- Sample management framework

---

## Format Legend

- 🎉 Major milestone
- ✨ New features
- 🐛 Bug fixes
- 🔧 Technical improvements
- 📚 Documentation
- ⚠️ Known limitations
- 🎯 Planned features
- 📥 Installation instructions
