# Obsidian ELN Plugin - Copilot Instructions

This is an Obsidian plugin that provides Electronic Lab Notebook (ELN) functionality. The plugin is written in TypeScript and uses modern build tools.

## Project Structure and File Placement Guidelines

### Source Code Organization

- **`src/`** - All TypeScript source code
  - `src/main.ts` - Plugin entry point
  - `src/commands/` - Command implementations
  - `src/core/` - Core business logic and services
  - `src/data/` - Data models and persistence
    - `src/data/templates/` - **CANONICAL SOURCE** for all template structures
      - Contains actual TypeScript template objects used by the plugin
      - Always reference these files, not documentation examples
      - Templates are stored as TypeScript exports with "display" parameter
  - `src/events/` - Event handling and system events
  - `src/search/` - Search functionality
  - `src/settings/` - Plugin settings and configuration
  - `src/styles/` - SCSS/CSS styles (compiled to styles.css)
  - `src/types/` - TypeScript type definitions and interfaces
  - `src/ui/` - User interface components and views
  - `src/utils/` - Utility functions and helpers

### Testing

- **`tests/`** - All test files go here
  - Use descriptive names like `test-[feature-name].ts`
  - Include unit tests, integration tests, and validation scripts
  - Test data and fixtures can be placed in `tests/memory/` or similar subdirectories

### Documentation

- **`docs/`** - All documentation files
  - `docs/user/` - User-facing documentation (installation, features, guides)
    - **Published on GitHub Pages** - Visible to all users
  - `docs/examples/` - Example templates and usage examples
    - **Published on GitHub Pages** - Visible to all users
  - `docs/developer/` - Developer documentation (API, architecture, setup)
    - `docs/developer/public/` - **PUBLIC DEVELOPER DOCS** (Published on GitHub Pages)
      - Contains: README.md, ROADMAP.md, KNOWN-ISSUES.md
      - Visible to users and contributors on documentation site
    - All other `docs/developer/` subfolders are **INTERNAL ONLY**
      - Available in git repository for contributors
      - Hidden from GitHub Pages (not published on documentation site)
  - `docs/archive/` - Historical documentation (internal only)
  - `docs/_layouts/` - Jekyll templates for GitHub Pages
  - `docs/assets/` - CSS and other assets for GitHub Pages

### Developer Documentation Organization (CRITICAL)

The `docs/developer/` directory has a **two-tier organizational structure**:

#### Public Developer Documentation (Published on GitHub Pages)

**`docs/developer/public/`** - **PUBLICLY VISIBLE ON DOCUMENTATION SITE**
- `public/README.md` - Developer documentation index and contributing guide
- `public/ROADMAP.md` - Project roadmap and version planning
- `public/KNOWN-ISSUES.md` - Known bugs and limitations
- `public/index.md` - Landing page for developer section

**Purpose**: Information useful for users, potential contributors, and the community
**Visibility**: Published at https://fcskit.github.io/obsidian-eln-plugin/developer/public/

#### Internal Developer Documentation (Hidden from GitHub Pages)

All other `docs/developer/` subfolders are **INTERNAL ONLY**:
- Available in the git repository for active contributors
- Hidden from GitHub Pages (excluded in `docs/_config.yml`)
- Visible to anyone who clones the repository

**`docs/developer/todos/`** - **PRIMARY TASK TRACKING SYSTEM**
- `todos/active/` - Current work in progress
- `todos/completed/` - Finished features and improvements
- `todos/planned/` - Future features and improvements

**Use this for ALL task tracking.** When working on features:
1. Check `todos/active/` for current priorities
2. Create detailed plans in `todos/planned/` for future work
3. Move completed work to `todos/completed/` with full documentation
4. **ALWAYS update public/ROADMAP.md** when adding/completing todos

**`docs/developer/template-system/`** - Template redesign documentation
- All template-related design docs, proposals, implementation guides
- Has its own README.md index

**`docs/developer/guides/`** - Testing, debugging, release workflows
- Testing guides, release checklists, debugging procedures
- Has its own README.md index

**`docs/developer/note-creation-architecture/`** - Note creation system design
- Architecture documentation for planned redesign
- **Note**: This is PLANNED work, not current implementation

**`docs/developer/core/`** - Core system documentation
- Architecture, API reference, development setup

**`docs/developer/components/`** - Component-specific docs

**`docs/developer/infrastructure/`** - Build system, logging, CSS

**`docs/developer/contributing/`** - Contribution guidelines

**`docs/developer/archive/`** - Historical documentation
- Completed phase reports, old debugging docs, outdated tracking
- Move docs here when they're no longer actively maintained

## TODO System Workflow (CRITICAL)

### Primary Reference for Work Planning

**ALWAYS check `docs/developer/todos/` and `docs/developer/public/ROADMAP.md` before starting work.**

The todo system is the single source of truth for:
- What needs to be done (`todos/planned/`)
- What's currently being worked on (`todos/active/`)
- What's been completed (`todos/completed/`)

### When Starting a New Feature or Task

1. **Check existing todos first**:
   ```bash
   # Check what's planned
   ls docs/developer/todos/planned/
   
   # Check active work (don't duplicate!)
   ls docs/developer/todos/active/
   
   # Check if already completed
   ls docs/developer/todos/completed/
   ```

2. **Review public/ROADMAP.md** to understand priority and version target

3. **If creating a new todo**, use this template and place in `todos/planned/`:
   ```markdown
   # [Feature/Improvement Name]
   
   **Status**: Planned
   **Priority**: High|Medium|Low
   **Target Version**: vX.X.X
   **Estimated Effort**: X days/weeks
   
   ## Overview
   Brief description and motivation
   
   ## Implementation Details
   Technical approach and key changes
   
   ## Success Criteria
   - [ ] Measurable outcomes
   - [ ] Testing requirements
   - [ ] Documentation needs
   
   ## Dependencies
   What must be done first or in parallel
   
   ## Related Documentation
   Links to design docs, related todos, etc.
   ```

### When Working on a Todo

1. **Move from `planned/` to `active/`** before starting work
2. **Update status** to "Active" in the file
3. **Update public/ROADMAP.md** current sprint section with link to todo
4. **Keep todo updated** as you discover new requirements or blockers

### When Completing a Todo

**CRITICAL**: Complete these steps for EVERY finished todo:

1. **Update the todo file**:
   - Change status to "Completed"
   - Add completion date
   - Document any deviations from original plan
   - Note any follow-up work needed

2. **Move file**: `todos/active/` → `todos/completed/`

3. **Update public/ROADMAP.md**:
   - Move item from current sprint to "Recently Completed"
   - Update version section
   - Add links to completed todo documentation

4. **Update todos/README.md**:
   - Update counts (active/completed/planned)
   - Update "Recently Completed" section
   - Update "Quick Navigation"

5. **Consider user documentation**:
   - If user-facing feature, add to `todos/active/user-documentation.md`
   - Or create user docs immediately

6. **Commit with clear message**:
   ```bash
   git commit -m "Complete [feature-name] (closes #XX)
   
   - Implemented X, Y, Z
   - Moved todo to completed/
   - Updated ROADMAP.md
   - Added to user-documentation.md for v0.7.2"
   ```

### When Changing Strategy or Discovering New Work

If you discover during implementation that:
- Original plan needs significant changes
- New todos are needed
- Dependencies have changed
- Timeline estimates were wrong

**IMMEDIATELY update the documentation**:

1. **Update the active todo** with new information
2. **Create new planned todos** for spin-off work
3. **Update public/ROADMAP.md** with revised timeline
4. **Add notes to public/KNOWN-ISSUES.md** if limitations discovered
5. **Communicate** major changes in commit messages

### File Naming in todos/

- Use kebab-case: `feature-name.md`, `improvement-name.md`
- Be descriptive: `note-creation-architecture-redesign.md` not `redesign.md`
- For related todos, use prefixes: `query-syntax-phase1.md`, `query-syntax-phase2.md`

### Documentation Cross-Linking

When creating or updating todos:
- Link to design docs in `template-system/`, `note-creation-architecture/`, etc.
- Link to related todos (dependencies, follow-ups)
- Link from public/ROADMAP.md to detailed todo files
- Keep todos/README.md index updated

## Keeping docs/developer/ Organized (CRITICAL)

### GitHub Pages Structure

The `docs/developer/` folder is split into **public** and **internal** documentation:

**Public (Published on GitHub Pages):**
- `docs/developer/public/` - Visible at https://fcskit.github.io/obsidian-eln-plugin/developer/public/
- Contains: README.md, ROADMAP.md, KNOWN-ISSUES.md, index.md
- For users and potential contributors

**Internal (Hidden from GitHub Pages):**
- All other `docs/developer/` subfolders
- Hidden via `_config.yml` exclude rules
- Available in git repo for contributors
- Not visible on documentation website

### The Problem We're Avoiding

Previously `docs/developer/` accumulated many unsorted files. **We reorganized this in February 2026.** The new structure keeps:
- Public docs in `public/` subfolder
- Internal docs in organized subfolders
- Everything hidden from GitHub Pages except `public/`

### Rules for New Documentation

**BEFORE creating ANY new .md file, ask yourself:**

1. **Is this a todo/task?**
   - YES → Goes in `todos/active/`, `todos/completed/`, or `todos/planned/`
   - Update public/ROADMAP.md to link to it

2. **Is this public-facing developer info?**
   - YES → Goes in `public/`
   - Update `public/index.md` to link to it
   - Will be visible on GitHub Pages

3. **Is this about the template system?**
   - YES → Goes in `template-system/`
   - Update `template-system/README.md` index
   - Internal only (hidden from GitHub Pages)

4. **Is this a testing/release guide?**
   - YES → Goes in `guides/`
   - Update `guides/README.md` index
   - Internal only (hidden from GitHub Pages)

5. **Is this about note creation architecture?**
   - YES → Goes in `note-creation-architecture/`
   - Update that folder's README.md
   - Internal only (hidden from GitHub Pages)

6. **Is this core architecture/setup/API docs?**
   - YES → Goes in `core/`, `components/`, or `infrastructure/`
   - Update relevant README files
   - Internal only (hidden from GitHub Pages)

7. **Is this historical/completed/outdated?**
   - YES → Goes in `archive/`
   - Not actively maintained
   - Internal only (hidden from GitHub Pages)

### What NOT to Do

❌ **Don't create**: `docs/developer/new-feature-idea.md`  
✅ **Instead create**: `docs/developer/todos/planned/new-feature.md`

❌ **Don't create**: `docs/developer/template-proposal.md`  
✅ **Instead create**: `docs/developer/template-system/template-proposal.md`

❌ **Don't create**: `docs/developer/bug-fix-notes.md`  
✅ **Instead create**: `docs/developer/todos/completed/bug-fix-description.md` (after fixing)

❌ **Don't create**: `docs/developer/random-doc.md`  
✅ **Instead**: Figure out which subfolder it belongs in first!

❌ **Don't create**: `docs/developer/public-facing-guide.md` in wrong location
✅ **Instead create**: `docs/developer/public/public-facing-guide.md` if it should be on GitHub Pages

### If Unsure Where a Doc Goes

1. Check existing README.md files in subfolders
2. Look at public/ROADMAP.md to see where similar work is tracked
3. Ask: "Is this describing WHAT to do (→ todos/) or HOW it works (→ system folders)?"
4. Ask: "Should this be public on GitHub Pages? (→ public/) or internal only?"
5. When in doubt, put in the most specific subfolder possible

### Build and Configuration

- **Root directory** - Build scripts and configuration files
  - `package.json`, `tsconfig.json`, `manifest.json` - Core configuration
  - `*.mjs` files - Build scripts (esbuild, CSS compilation, release management)
  - `styles.css` - Compiled CSS output (generated, don't edit directly)

### Assets and Resources

- **`images/`** - Screenshots, diagrams, and visual assets for documentation
- **`misc/`** - Design files, icons, and miscellaneous assets
- **`release/`** - Release artifacts (generated during build)

### Backup and Development

- **`backup/`** - Automated backups (managed by scripts)
- **`test-vault/`** - Test Obsidian vault for development and testing
- **`scripts/`** - Shell scripts for automation (backup, health checks, etc.)

## File Creation Guidelines

### When creating new files:

1. **TypeScript source files** → Always place in appropriate `src/` subdirectory
2. **Test files** → Always place in `tests/` directory
3. **Documentation** → Place in `docs/user/` or `docs/developer/` as appropriate
4. **Examples or templates** → Place in `docs/examples/`
5. **Configuration files** → Root directory only if they affect the entire project
6. **Asset files** → Use `images/` for screenshots, `misc/` for design files

### Naming Conventions

- Use kebab-case for files and directories
- TypeScript files use `.ts` extension
- Test files prefix with `test-` (e.g., `test-feature-name.ts`)
- Documentation files use `.md` extension
- Build scripts use `.mjs` extension

### Architecture Notes

This is an Obsidian plugin that:
- Extends Obsidian's functionality for scientific research and lab notebooks
- Uses TypeScript with strict typing
- Employs a modular architecture with separate concerns
- Has reactive UI components and dynamic template system
- Integrates with chemical databases and scientific tools

### Development Workflow

- Use the build scripts in package.json for development
- **NEVER use `npm run dev` in terminal commands** - it's a watch mode that blocks the terminal indefinitely
- Use `npm run build-fast` for quick builds during development and testing
- Use `npm run build` for full builds with TypeScript checking
- The plugin follows Obsidian's plugin development patterns
- All UI components should integrate with Obsidian's theming system
- Maintain backward compatibility with existing user templates and data

## Logging System

### Never use console.log, console.debug, console.warn, or console.error directly

This plugin uses a sophisticated centralized logging system located in `src/utils/Logger.ts`. Always use the plugin's logger instead of direct console methods.

### How to use the logger:

1. **Import the logger system:**
   ```typescript
   import { createLogger } from "../../utils/Logger";
   ```

2. **Create a component-specific logger:**
   ```typescript
   private logger = createLogger('componentName');
   ```

3. **Use the logger methods:**
   ```typescript
   this.logger.debug('Debug message', data);
   this.logger.info('Info message', data);
   this.logger.warn('Warning message', error);
   this.logger.error('Error message', error);
   ```

### Available component names:
- `main` - Plugin entry point
- `npe` - Nested Properties Editor
- `modal` - Modals (NewNoteModal, etc.)
- `api` - API calls (ChemicalLookup, etc.)
- `template` - Template processing
- `note` - Note creation and processing
- `path` - Path template parsing
- `metadata` - Metadata processing
- `settings` - Settings management
- `ui` - General UI components
- `inputManager` - InputManager component
- `events` - Event handling
- `navbar` - Navigation bar
- `view` - Views and rendering
- `general` - General/uncategorized

### Logger Features:
- **Component-based filtering** - Different log levels per component
- **File logging** - Optional logging to `debug-log.txt` in vault root
- **Structured output** - Consistent formatting with timestamps
- **Buffered writing** - Efficient file operations
- **Development-friendly** - Easy to enable/disable debug output

### Example usage in a new file:
```typescript
import { createLogger } from "../../utils/Logger";

export class MyComponent {
    private logger = createLogger('ui'); // Choose appropriate component name
    
    someMethod() {
        this.logger.debug('Method called with params', { param1, param2 });
        
        try {
            // Some operation
            this.logger.info('Operation completed successfully');
        } catch (error) {
            this.logger.error('Operation failed', error);
        }
    }
}
```

## Template Structure - ALWAYS USE ACTUAL IMPLEMENTATION

### CRITICAL: Use src/data/templates/ as the canonical source

**NEVER reference template examples from docs/ folder for implementation details.** These are examples only and may differ from actual implementation.

**ALWAYS reference the actual TypeScript template files in:**
- `src/data/templates/metadata/` - Metadata templates (chemtypes, etc.)
- `src/data/templates/` - Core template structures

### Template Structure Rules:

1. **Templates are TypeScript objects**, not JSON files
2. **Templates are stored in plugin settings**, not loaded from files
3. **Use "display" parameter** (not "required") for field visibility
4. **Subclass templates use "add" array** with "fullKey" paths for merging
5. **Templates include TypeScript functions** that are evaluated at runtime

### When documenting or referencing templates:
- Always read from `src/data/templates/` directory
- Check how templates are loaded in the settings system
- Use actual parameter names from TypeScript exports
- Verify subclass structure matches "add" array format

## Important: Never place generated files in src/

- Build outputs go to `release/`
- Compiled CSS goes to root as `styles.css`
- Backup files go to `backup/`
- Test artifacts stay in `tests/` or `test-vault/`
