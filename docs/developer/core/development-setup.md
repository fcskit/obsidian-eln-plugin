# Development Setup

This guide will help you set up a development environment for contributing to the Obsidian ELN Plugin.

## 📋 Prerequisites

### Required Software
- **Node.js**: v16 or higher (LTS recommended)
- **npm**: v8 or higher (comes with Node.js)
- **Git**: Latest version
- **Code Editor**: VS Code recommended (with TypeScript support)
- **Obsidian**: Latest version for testing

### Recommended Tools
- **TypeScript**: Global installation (`npm install -g typescript`)
- **VS Code Extensions**:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - GitLens

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/fcskit/obsidian-eln-plugin.git
cd obsidian-eln-plugin
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- **esbuild**: Fast JavaScript bundler
- **TypeScript**: Type checking and compilation
- **Obsidian types**: TypeScript definitions for Obsidian API
- **ESLint**: Code linting and formatting

### 3. Configure Development Environment

#### VS Code Configuration
Create `.vscode/settings.json` (if not present):
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

#### Environment Variables (Optional)
Create `.env` file for development settings:
```bash
# Development vault path (optional)
DEV_VAULT_PATH=/path/to/your/test-vault

# Debug logging level
LOG_LEVEL=debug
```

## 🔧 Build System

### Available Scripts

```bash
# Development build with CSS and watch mode
npm run dev

# Production build
npm run build

# Fast build (skip TypeScript checking)
npm run build-fast

# Build CSS only
npm run build-css

# Watch CSS changes
npm run watch-css

# Version bump and release
npm run release

# Sync from test vault
npm run sync
```

### Build Process Overview

1. **CSS Compilation**: `build-css.mjs` compiles modular CSS
2. **TypeScript Compilation**: `tsc` checks types (in production)
3. **Bundling**: `esbuild` bundles TypeScript to JavaScript
4. **Asset Copying**: `copy-assets.mjs` copies manifest and styles

### Build Configuration

#### esbuild Configuration (`esbuild.config.mjs`)
```javascript
{
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: ["obsidian", "electron", ...builtins],
  format: "cjs",
  target: "es2018",
  sourcemap: prod ? false : "inline",
  outfile: "test-vault/.obsidian/plugins/obsidian-eln/main.js"
}
```

#### TypeScript Configuration (`tsconfig.json`)
- **Target**: ES2018
- **Module**: ESNext
- **Strict**: Enabled
- **Include**: `src/**/*`
- **Exclude**: `node_modules`, `test-vault`

## 🧪 Testing Setup

### Test Vault Configuration

1. **Create Test Vault**: Set up a dedicated Obsidian vault for testing
2. **Plugin Symlink**: Link your development build to the test vault
3. **Hot Reload**: Use development mode for automatic reloading

```bash
# Link plugin to test vault (Unix/macOS)
ln -s /path/to/obsidian-eln-plugin/release /path/to/test-vault/.obsidian/plugins/obsidian-eln

# Windows
mklink /D "C:\path\to\test-vault\.obsidian\plugins\obsidian-eln" "C:\path\to\obsidian-eln-plugin\release"
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test files
node tests/test-dynamic-system.ts

# Run with debugging
node --inspect tests/test-template-validation.ts
```

### Test Categories

- **Unit Tests**: Individual component testing
- **Integration Tests**: Workflow and system testing
- **Template Tests**: Template validation and processing
- **Memory Tests**: Performance and memory leak detection

## 🔄 Development Workflow

### 1. Daily Development

```bash
# Start development with hot reloading
npm run dev

# In another terminal, watch CSS changes
npm run watch-css

# Open Obsidian with your test vault
# Make changes and test in real-time
```

### 2. Feature Development

1. **Create Feature Branch**: `git checkout -b feature/my-feature`
2. **Development**: Make changes with hot reloading
3. **Testing**: Test thoroughly in test vault
4. **Build**: Run production build and test
5. **Commit**: Commit with descriptive messages

### 3. Code Quality

```bash
# Type checking
npx tsc --noEmit

# Linting
npx eslint src/

# Format code
npx prettier --write src/

# Full quality check
npm run build
```

## 🐛 Debugging

### Browser DevTools

1. **Open Obsidian DevTools**: `Ctrl/Cmd + Shift + I`
2. **Console Logging**: Use `console.log()` for debugging
3. **Breakpoints**: Set breakpoints in Sources tab
4. **Network Tab**: Monitor API calls and resource loading

### VS Code Debugging

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Plugin",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true,
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "${workspaceFolder}"
    }
  ]
}
```

### Logging System

The plugin includes a comprehensive logging system:

```typescript
import { Logger } from './utils/logger';

const logger = new Logger('ComponentName');

logger.debug('Debug information');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error occurred', error);
```

### Common Debugging Scenarios

#### Template Issues
- Check browser console for template parsing errors
- Validate JSON syntax in template files
- Use template test files to isolate issues

#### UI Component Issues
- Inspect DOM structure in DevTools
- Check for CSS class conflicts
- Verify component state with React DevTools equivalent

#### Performance Issues
- Use Performance tab in DevTools
- Monitor memory usage over time
- Check for memory leaks with heap snapshots

## 📁 Project Structure Details

### Source Code Organization

```
src/
├── main.ts                    # Plugin entry point
├── commands/                  # Command implementations
├── core/                      # Core business logic
│   ├── notes/                # Note creation system
│   ├── templates/            # Template processing
│   └── data/                 # Data management
├── events/                   # Event system
├── settings/                 # Settings management
├── styles/                   # Modular CSS
├── types/                    # TypeScript definitions
├── ui/                       # User interface
└── utils/                    # Utilities and helpers
```

### Important Files

- **`main.ts`**: Plugin entry point and lifecycle
- **`manifest.json`**: Plugin metadata and configuration
- **`package.json`**: NPM dependencies and scripts
- **`tsconfig.json`**: TypeScript configuration
- **`esbuild.config.mjs`**: Build configuration

## 🔧 Advanced Configuration

### Custom Build Scripts

Create custom build scripts for specific needs:

```javascript
// custom-build.mjs
import esbuild from 'esbuild';

await esbuild.build({
  // Custom configuration
  entryPoints: ['src/main.ts'],
  outfile: 'custom-output/main.js',
  // Additional options...
});
```

### Plugin Hot Reloading

For faster development, set up plugin hot reloading:

1. Use development build with watch mode
2. Configure Obsidian to auto-reload plugins
3. Use file system watchers for automatic rebuilds

### CSS Development

The plugin uses a modular CSS system:

```bash
# Watch for CSS changes during development
npm run watch-css

# CSS files are in src/styles/
# Compiled output goes to styles.css
```

## 🚀 Production Preparation

### Pre-release Checklist

- [ ] All tests passing
- [ ] TypeScript compilation without errors
- [ ] Production build successful
- [ ] Manual testing in clean vault
- [ ] Documentation updated
- [ ] Version numbers updated

### Release Process

```bash
# Version bump and build
npm run version
npm run release

# Publish (when ready)
npm run publish
```

## 🆘 Troubleshooting

### Common Issues

#### Build Errors
- **Node.js Version**: Ensure compatible Node.js version
- **Dependencies**: Run `npm install` to update dependencies
- **Cache**: Clear npm cache with `npm cache clean --force`

#### TypeScript Errors
- **Type Definitions**: Update `@types/*` packages
- **Configuration**: Check `tsconfig.json` settings
- **IDE Issues**: Restart TypeScript service in VS Code

#### Plugin Loading Issues
- **Manifest**: Verify `manifest.json` is valid
- **Dependencies**: Check external dependencies are available
- **Obsidian Version**: Ensure compatibility with Obsidian version

### Getting Help

- **Documentation**: Check relevant documentation sections
- **GitHub Issues**: Search existing issues or create new ones
- **Community**: Join discussions in GitHub Discussions
- **Code Review**: Request code review for complex changes

## 📖 Next Steps

Once your development environment is set up:

1. **Explore the Codebase**: Read the [Architecture Overview](architecture.md)
2. **Study Examples**: Review existing components and templates
3. **Start Contributing**: Check the [Contributing Guide](contributing.md)
4. **Test Your Changes**: Use the comprehensive test suite

## 🔗 Related Documentation

- [Architecture Overview](architecture.md) - Understanding the system design
- [API Reference](api-reference.md) - Detailed API documentation
- [Testing Guide](testing.md) - Testing strategies and tools
- [Contributing Guide](contributing.md) - Contribution guidelines
