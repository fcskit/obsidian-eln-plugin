# CSS Modularization Guide
# CSS Modularization for Obsidian ELN Plugin

This document describes the modular CSS system used in the Obsidian ELN plugin. The CSS is split into logical modules for maintainability and scalability.

## Structure

All CSS files are located in `src/styles/`:

- `base.css` – Core resets, typography, and shared variables
- `navbar.css` – Navigation bar styles
- `modals.css` – Modal dialog styles
- `progress.css` – Progress bars and loaders
- `dashboard.css` – Dashboard and overview widgets
- `npe.css` – Note Property Editor (NPE) styles
- `settings.css` – Plugin settings UI
- `footer.css` – Footer and status bar
- `index.css` – Main entry point, imports all modules

## Build System

Use `build-css.mjs` to bundle all modular CSS files into a single `styles.css` for plugin distribution. Use `watch-css.mjs` for live development.

## Usage

Edit the appropriate module file for your changes. Do not add styles directly to `index.css` or the bundled `styles.css`.
This document explains the new CSS modularization system for the Obsidian ELN plugin.

## Overview

The plugin's CSS has been split into smaller, maintainable files organized by component/feature. This improves:

- **Maintainability**: Easier to find and edit styles for specific components
- **Organization**: Logical separation of concerns
- **Collaboration**: Multiple developers can work on different CSS files simultaneously
- **Performance**: Build-time bundling ensures no runtime performance impact

## File Structure

```
src/styles/
├── index.css       # Main import file (not used in build)
├── base.css        # Variables and base layout
├── navbar.css      # Navigation bar styles
├── modals.css      # Input modals and dialogs
├── progress.css    # Circular progress indicators
├── dashboard.css   # Dashboard and daily note layouts
├── npe.css         # Nested Properties Editor (largest component)
├── settings.css    # Settings panels and dialogs
└── footer.css      # Global footer component
```

## CSS File Descriptions

### `base.css`
- CSS custom properties (variables) for themes
- Page layout classes (`.wide-page`, `.pse-table`)
- Root variables for dashboard and daily note styling

### `navbar.css`
- Navigation bar container and dropdown styles
- Hover effects and animations
- Responsive behavior and column layouts

### `modals.css`
- Input modal styling (`.eln-modal-*`)
- Form components and dropdown wrappers
- Unit labels and section titles

### `progress.css`
- Circular progress bar components
- SVG animations and transitions
- Dark/light theme compatibility

### `dashboard.css`
- Dashboard and daily note page layouts
- Card-based responsive grid system
- Image viewer and thumbnail components
- Editing mode styles for live preview

### `npe.css`
- Nested Properties Editor (NPE) component
- Complex property editing interface
- Buttons, containers, and interactive elements
- Periodic table of elements styling

### `settings.css`
- Settings panels and modal dialogs
- Template and metadata field editors
- File picker and note type managers
- Editable list components

### `footer.css`
- Global HTML footer component
- Reading/editing mode compatibility
- Responsive design and theme compatibility

## Build System

### Scripts

- `npm run build-css` - Build CSS once
- `npm run watch-css` - Watch for changes and auto-rebuild
- `npm run dev` - Development build (includes CSS bundling)
- `npm run build` - Production build (includes CSS bundling)

### Bundling Process

1. **Source Files**: Individual CSS files in `src/styles/`
2. **Bundler**: `build-css.mjs` script reads and concatenates files
3. **Output**: Single `styles.css` file in the root directory
4. **Copy**: `copy-assets.mjs` copies to test vault

### Build Order

Files are processed in dependency order:
1. `base.css` (variables first)
2. `navbar.css`
3. `modals.css`
4. `progress.css`
5. `dashboard.css`
6. `npe.css`
7. `settings.css`
8. `footer.css`

## Development Workflow

### Making Changes

1. **Edit source files** in `src/styles/` (never edit `styles.css` directly)
2. **Run build**: `npm run build-css` or use watch mode
3. **Test changes** in the test vault
4. **Commit both** source files and generated `styles.css`

### Watch Mode for Development

```bash
npm run watch-css
```

This will:
- Monitor `src/styles/` for changes
- Automatically rebuild `styles.css` when files change
- Show build status and file size

### Adding New Components

1. Create new `.css` file in `src/styles/`
2. Add import to `src/styles/index.css` (for reference)
3. Add filename to `cssFiles` array in `build-css.mjs`
4. Rebuild CSS bundle

## Best Practices

### File Organization
- Keep related styles together in the same file
- Use descriptive filenames that match component names
- Add file header comments explaining the component

### CSS Structure
- Use CSS custom properties for theming
- Follow existing naming conventions (BEM-style for components)
- Add section comments for major style groups

### Comments
- Add file-level comments explaining the component's purpose
- Use section comments to group related styles
- Document complex calculations or workarounds

### Variables
- Define component-specific variables in the component file
- Use global variables from `base.css` when appropriate
- Follow the existing variable naming conventions

## Migration from Monolithic CSS

The original 2000+ line `styles.css` has been split as follows:

- **Base styles**: ~50 lines → `base.css`
- **Navbar**: ~200 lines → `navbar.css`
- **Modals**: ~90 lines → `modals.css`
- **Progress**: ~140 lines → `progress.css`
- **Dashboard**: ~480 lines → `dashboard.css`
- **NPE**: ~700 lines → `npe.css` (largest component)
- **Settings**: ~290 lines → `settings.css`
- **Footer**: ~70 lines → `footer.css`

## Troubleshooting

### Common Issues

**Build not updating**:
- Ensure you're editing files in `src/styles/`, not root `styles.css`
- Run `npm run build-css` manually
- Check for syntax errors in CSS files

**Missing styles**:
- Verify file is listed in `build-css.mjs` `cssFiles` array
- Check file import order (base.css should be first)
- Ensure CSS selectors are correctly formatted

**Watch mode not working**:
- Stop and restart the watch process
- Check file permissions in `src/styles/` directory
- Verify Node.js version supports `fs.watch`

### File Size Monitoring

The bundler reports the total CSS size after each build. Current size: ~46.5 KB

If size grows significantly:
- Review for duplicate styles
- Consider removing unused CSS
- Optimize complex selectors

## Future Improvements

- CSS minification for production builds
- PostCSS integration for autoprefixing
- CSS custom property validation
- Automated unused CSS detection
