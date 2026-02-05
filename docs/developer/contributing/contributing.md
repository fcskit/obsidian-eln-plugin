# Contributing Guide

Thank you for your interest in contributing to the Obsidian ELN Plugin! This guide will help you get started with contributing code, documentation, or other improvements to the project.

## 🤝 Ways to Contribute

### Code Contributions
- **Bug fixes**: Fix reported issues
- **New features**: Implement requested or proposed features
- **Performance improvements**: Optimize existing functionality
- **Code refactoring**: Improve code structure and maintainability

### Documentation Contributions
- **User guides**: Improve user-facing documentation
- **Developer docs**: Enhance technical documentation
- **API documentation**: Document interfaces and usage
- **Examples**: Create template and usage examples

### Other Contributions
- **Testing**: Add test cases and improve coverage
- **Issue reporting**: Report bugs and suggest improvements
- **Community support**: Help other users with questions
- **Translations**: Localize the plugin for different languages

## 🏁 Getting Started

### Prerequisites

Before contributing, ensure you have:
- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Git** for version control
- **VS Code** (recommended) with TypeScript support
- **Obsidian** for testing the plugin

### Setting Up the Development Environment

1. **Fork the Repository**
   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/obsidian-eln-plugin.git
   cd obsidian-eln-plugin
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Development Environment**
   ```bash
   # Copy example templates
   cp -r examples/templates/* src/data/templates/

   # Set up test vault
   npm run setup:test-vault
   ```

4. **Build and Test**
   ```bash
   # Build the plugin
   npm run build

   # Run tests
   npm test

   # Start development build (watches for changes)
   npm run dev
   ```

For complete setup instructions, see [Development Setup](development-setup.md).

## 🔄 Development Workflow

### Branch Strategy

We use a simplified Git flow:

```
main (stable) ← develop (integration) ← feature/bug branches
```

1. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following our style guide
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm test                    # Run unit tests
   npm run test:integration    # Run integration tests
   npm run lint                # Check code style
   npm run build               # Ensure it builds
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new template validation system"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create pull request on GitHub
   ```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(templates): add reactive field dependencies
fix(ui): resolve modal positioning on small screens
docs(api): update template system documentation
test(core): add unit tests for TemplateManager
```

## 📝 Code Style Guide

### TypeScript Standards

```typescript
// ✅ Good: Use proper TypeScript types
interface TemplateField {
    inputType: 'text' | 'number' | 'date' | 'list';
    label: string;
    required?: boolean;
    default?: any;
}

// ✅ Good: Use meaningful names
const processedTemplate = templateManager.processTemplate(noteType);

// ❌ Bad: Avoid 'any' when possible
const data: any = someFunction();

// ✅ Good: Use specific types
const userData: UserInputData = getUserInput();
```

### Code Organization

```typescript
// ✅ Good: Clear class structure
export class TemplateManager {
    private templates: Map<string, MetaDataTemplate>;
    private settings: PluginSettings;
    
    constructor(settings: PluginSettings) {
        this.settings = settings;
        this.templates = new Map();
    }
    
    public loadTemplate(noteType: string): MetaDataTemplate | null {
        // Implementation
    }
    
    private validateTemplate(template: MetaDataTemplate): boolean {
        // Implementation
    }
}
```

### Naming Conventions

- **Classes**: PascalCase (`TemplateManager`, `NewNoteModal`)
- **Functions/Methods**: camelCase (`processTemplate`, `createNote`)
- **Variables**: camelCase (`noteType`, `templateData`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_TEMPLATE`, `MAX_FILE_SIZE`)
- **Files**: kebab-case for TypeScript files (`template-manager.ts`)

### Documentation Standards

```typescript
/**
 * Processes a template by evaluating function descriptors and resolving dependencies.
 * 
 * @param noteType - The type of note template to process
 * @param userInput - Current user input data for reactive fields
 * @returns Processed template with evaluated values, or null if template not found
 * 
 * @example
 * ```typescript
 * const processed = templateManager.processTemplate('chemical', { formula: { name: 'Water' } });
 * ```
 */
public processTemplate(noteType: string, userInput?: UserInputData): MetaDataTemplateProcessed | null {
    // Implementation
}
```

## 🧪 Testing Requirements

### Test Coverage Expectations

- **New Features**: Must include unit tests with >90% coverage
- **Bug Fixes**: Must include regression tests
- **UI Components**: Should include component tests
- **Integration**: Complex features need integration tests

### Writing Tests

```typescript
// tests/unit/core/TemplateManager.test.ts
describe('TemplateManager', () => {
    let templateManager: TemplateManager;
    
    beforeEach(() => {
        templateManager = new TemplateManager(createMockSettings());
    });
    
    describe('loadTemplate', () => {
        it('should load existing template successfully', () => {
            const template = templateManager.loadTemplate('chemical');
            expect(template).toBeDefined();
            expect(template?.formula).toBeDefined();
        });
        
        it('should return null for non-existent template', () => {
            const template = templateManager.loadTemplate('nonexistent');
            expect(template).toBeNull();
        });
    });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --testPathPattern=TemplateManager

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode during development
npm run test:watch
```

For detailed testing information, see [Testing Guide](testing.md).

## 🏗️ Architecture Guidelines

### Component Design Principles

1. **Single Responsibility**: Each class/component has one clear purpose
2. **Dependency Injection**: Use constructor injection for dependencies
3. **Interface Segregation**: Keep interfaces focused and minimal
4. **Open/Closed**: Open for extension, closed for modification

### Adding New Features

#### New Input Types

1. **Create Component**
   ```typescript
   // src/ui/modals/components/LabeledCustomInput.ts
   export class LabeledCustomInput extends LabeledInputBase<CustomType> {
       // Implementation
   }
   ```

2. **Register Type**
   ```typescript
   // src/ui/modals/components/InputTypeRegistry.ts
   inputTypeRegistry.register('custom', LabeledCustomInput);
   ```

3. **Add Types**
   ```typescript
   // src/types/templates.ts
   export type InputType = 'text' | 'number' | 'date' | 'list' | 'custom';
   ```

4. **Update Documentation**
   - Add to API reference
   - Create usage examples
   - Update user guide

#### New Template Functions

1. **Define Function**
   ```typescript
   // src/core/templates/functions/custom-function.ts
   export const customFunction: FunctionDescriptor = {
       name: 'customFunction',
       description: 'Performs custom operation',
       parameters: [
           { name: 'input', type: 'string', required: true }
       ],
       execute: (params: any) => {
           // Implementation
       }
   };
   ```

2. **Register Function**
   ```typescript
   // src/core/templates/FunctionRegistry.ts
   functionRegistry.register('customFunction', customFunction);
   ```

3. **Add Tests**
   ```typescript
   // tests/unit/templates/functions/custom-function.test.ts
   describe('customFunction', () => {
       it('should execute correctly with valid input', () => {
           // Test implementation
       });
   });
   ```

## 📋 Pull Request Process

### Before Submitting

1. **Self-Review Checklist**
   - [ ] Code follows style guidelines
   - [ ] Tests are included and passing
   - [ ] Documentation is updated
   - [ ] No console.log statements left in code
   - [ ] TypeScript types are properly defined
   - [ ] Performance impact considered

2. **Test Your Changes**
   ```bash
   npm run lint              # Check code style
   npm test                  # Run tests
   npm run build             # Ensure it builds
   npm run test:integration  # Test workflows
   ```

3. **Update Documentation**
   - Update relevant README sections
   - Add API documentation for new features
   - Include usage examples
   - Update changelog if applicable

### Pull Request Template

When creating a PR, use this template:

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] No performance regression

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Review Process

1. **Automated Checks**
   - CI/CD pipeline runs tests and linting
   - TypeScript compilation check
   - Test coverage validation

2. **Code Review**
   - At least one maintainer review required
   - Address feedback and requested changes
   - Keep discussions constructive and focused

3. **Merge Requirements**
   - All tests passing
   - No merge conflicts
   - Approved by maintainer
   - Documentation updated

## 🐛 Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. Windows 10, macOS 12.6]
- Obsidian version: [e.g. 1.4.13]
- Plugin version: [e.g. 0.7.0]

**Additional context**
Add any other context about the problem here.
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## 🏷️ Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Workflow

1. **Prepare Release**
   ```bash
   npm run version:minor  # or major/patch
   npm run build:release
   npm run test:all
   ```

2. **Update Documentation**
   - Update CHANGELOG.md
   - Update version in manifest.json
   - Tag release in git

3. **Publish**
   ```bash
   npm run publish:release
   git push origin main --tags
   ```

## 🌍 Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- **Be respectful**: Treat all community members with respect
- **Be inclusive**: Welcome newcomers and help them get involved
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Remember that people have different experience levels

### Getting Help

- **Documentation**: Check our [documentation](../README.md) first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Discord**: Join our community Discord for real-time help

## 🔗 Related Documentation

- [Development Setup](development-setup.md) - Environment setup guide
- [Architecture Overview](architecture.md) - System design and structure
- [API Reference](api-reference.md) - Detailed API documentation
- [Testing Guide](testing.md) - Testing strategies and tools

## 📞 Contact

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community discussion
- **Email**: For security issues or sensitive matters

Thank you for contributing to the Obsidian ELN Plugin! 🎉
