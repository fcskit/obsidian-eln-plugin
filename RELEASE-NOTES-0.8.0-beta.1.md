# Release Notes - v0.8.0-beta.1

## 🎉 Overview

This beta release includes major NPE (Nested Properties Editor) system refactoring, critical bug fixes for QueryDropdown array functionality, and several enhancements.

## 🏗️ Major Changes

### NPE System Refactoring

Complete reorganization of the Nested Properties Editor codebase into a modular, maintainable structure:

**New Directory Structure:**
- `src/ui/renderer/npe/core/` - Core rendering functions
- `src/ui/renderer/npe/buttons/` - Button components
- `src/ui/renderer/npe/elements/` - Reusable UI elements
- `src/ui/renderer/npe/helpers/` - Helper utilities
- `src/ui/renderer/npe/utils/` - Utility functions

**Benefits:**
- Improved code organization and maintainability
- Better separation of concerns
- Easier to extend and modify
- Reduced code duplication

### New Views and Components

Added several new view components:
- `ChemLinks` - Chemical database links view
- `CircularProgress` - Progress indicator component
- `DailyNoteNav` - Daily note navigation
- `ImageViewer` - Image viewing component
- `PeriodicTableView` - Periodic table display

## 🐛 Critical Bug Fixes

### QueryDropdown Array Functionality (Major Fix)

Fixed critical bug where QueryDropdowns in object arrays (e.g., `sample.educts`, `electrode.materials`) were not updating fields correctly.

**Three Interconnected Issues Fixed:**

1. **Array Index Injection**: Return paths now properly inject array indices
   - Before: `sample.educts.name` → Failed
   - After: `sample.educts.0.name` → Works correctly

2. **Initial Value Processing**: First array item now populates automatically
   - Return values processed on dropdown render
   - Default values properly applied

3. **Number Fields with Units**: Proper structure for number fields with units in arrays
   - Before: `{ amount: 0 }`
   - After: `{ amount: { value: 0, unit: "mg" } }`

**Files Modified:**
- `src/ui/modals/components/QueryDropdown.ts`
- `src/ui/modals/components/UniversalObjectRenderer.ts`
- `src/ui/modals/utils/InputManager.ts`

### NPE Error Message Styling

Fixed illegible error messages (red text on red background):
- Added professional CSS classes in `src/styles/npe.css`
- Clear error display with proper contrast
- Bold red error text on default background
- Muted gray detail text

## 🎨 Enhancements

### File.link Wiki Link Enhancement

Wiki links for markdown files now display without `.md` extension for cleaner appearance:
- Markdown files: `[[Carbon Back SuperP.md]]` → `[[Carbon Back SuperP]]`
- Other file types preserve extensions: `[[diagram.png]]` (unchanged)

**Implementation:**
- Modified `src/search/QueryEngine.ts` - `extractReturnValues` method
- Conditional logic: `file.extension === 'md' ? file.basename : file.name`

### Logger System Implementation

Introduced centralized logging system (`src/utils/Logger.ts`):
- Component-based log filtering
- Configurable log levels per component
- Cleaned up console.log statements throughout codebase
- Proper debug, info, warn, error categorization

**Components:**
- NPE, Modal, API, Template, Note, UI, Events, and more
- Easy to enable/disable debug output per component

### Memory Leak Prevention

Improved NPE component lifecycle management:
- Proper event handler cleanup
- Component-based architecture with `MarkdownRenderChild`
- Prevents memory leaks during file switching
- Better resource management

## 📦 New Files Added

**NPE Refactoring:**
- 30+ new modular files in `src/ui/renderer/npe/`
- Better organized core rendering, buttons, elements, helpers, utils

**Views:**
- `ChemLinks.ts`, `CircularProgress.ts`, `DailyNoteNav.ts`
- `ImageViewer.ts`, `PeriodicTableView.ts`
- `NestedPropertiesEditor.ts` (refactored)

**Utilities:**
- `Logger.ts` - Centralized logging
- Parsers for various options (CircularProgress, ImageViewer)

**Tests:**
- Memory debugging utilities (`tests/memory/`)
- NPE robustness testing guide
- Various test scripts and validators

## 🔧 Technical Improvements

- All debug logging converted to proper logger system
- Enhanced path navigation in `InputManager` with array/object detection
- Improved return value processing in QueryDropdown
- Better structured defaults for number fields with units
- Proper lexical scoping in QueryEngine switch cases

## 📝 Documentation

Added comprehensive documentation for the QueryDropdown fix:
- `QUERYDROPDOWN-ARRAY-BUG-FIX.md` (detailed ~600 line analysis)
- Memory analysis guides
- Testing procedures and validation scripts

## ⚠️ Breaking Changes

None. This release is backward compatible with existing templates and user data.

## 🧪 Testing Status

- ✅ All QueryDropdown array functionality tested and working
- ✅ File.link enhancement verified
- ✅ NPE error styling confirmed
- ✅ Multiple successful builds (Exit Code: 0)
- ✅ User completed comprehensive testing across multiple template types

## 📋 Files Modified Summary

**Core Functionality:**
- QueryDropdown.ts - Return value processing
- UniversalObjectRenderer.ts - Array index injection, default object creation
- InputManager.ts - Enhanced path navigation
- QueryEngine.ts - File.link enhancement

**NPE System:**
- Complete refactoring into modular structure
- 30+ new files for better organization

**Styling:**
- npe.css - Error message styling
- main.ts - Updated to use CSS classes

**Infrastructure:**
- Logger.ts - New logging system
- Various test files and utilities

## 🚀 Installation

This is a beta release for testing purposes. Install by:

1. Download the release package
2. Extract to your Obsidian vault's `.obsidian/plugins/obsidian-eln/` directory
3. Reload Obsidian
4. Enable the plugin in Community Plugins settings

## 🐞 Known Issues

None currently identified. Please report any issues on GitHub.

## 🙏 Acknowledgments

Thank you to all testers who helped identify and validate these fixes!

## 📬 Feedback

Please report any issues or feedback on the GitHub repository.

---

**Release Date:** February 2026  
**Plugin Version:** 0.8.0-beta.1  
**Min Obsidian Version:** 0.15.0
