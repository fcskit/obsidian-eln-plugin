# CSS Modularization Example
# CSS Modularization Example

This example demonstrates how to add a new CSS module to the Obsidian ELN plugin.

## 1. Create a new CSS file

Add a new file in `src/styles/`, e.g. `timeline.css`.

## 2. Import in index.css

Add the following line to `src/styles/index.css`:

```css
@import "./timeline.css";
```

## 3. Add to build script

Edit `build-css.mjs` and add `timeline.css` to the `cssFiles` array in the correct order.

## 4. Use the styles

Reference your new classes in the plugin TypeScript/HTML code as needed.
## Before: Monolithic CSS

Previously, if you wanted to change navbar styling, you had to:

1. Open the massive 2000+ line `styles.css` file
2. Search through all the CSS to find navbar-related styles
3. Navigate between scattered navbar rules mixed with other components
4. Risk accidentally modifying unrelated styles

## After: Modular CSS

Now, navbar changes are simple:

1. Open `src/styles/navbar.css` (only ~200 lines)
2. All navbar styles are in one place
3. Change what you need
4. Run `npm run build-css` or use watch mode
5. Test in the vault

## Example Change

Let's say you want to change the navbar dropdown animation speed:

### Edit the source file
```css
/* In src/styles/navbar.css */
.navbar {
    --dropdown-speed: 0.5s;  /* Changed from 0.3s */
    /* ... rest of navbar styles ... */
}
```

### Rebuild
```bash
npm run build-css
```

### Result
The change is automatically bundled into the main `styles.css` file and ready for testing.

## Development Workflow

### One-time setup for development:
```bash
# Terminal 1: Watch CSS files
npm run watch-css

# Terminal 2: Watch TypeScript files  
npm run dev
```

Now any CSS changes are automatically rebuilt!

## File Size Comparison

- **Before**: One 2007-line file (hard to navigate)
- **After**: 8 focused files (easy to find what you need)
  - `base.css`: 50 lines
  - `navbar.css`: 200 lines  
  - `modals.css`: 90 lines
  - `progress.css`: 140 lines
  - `dashboard.css`: 480 lines
  - `npe.css`: 700 lines (largest component)
  - `settings.css`: 290 lines
  - `footer.css`: 70 lines

**Total**: Same content, better organized!
