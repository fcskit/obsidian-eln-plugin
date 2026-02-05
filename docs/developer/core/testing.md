# Testing Guide

This document covers testing strategies, tools, and procedures for the Obsidian ELN Plugin.

## 🧪 Testing Strategy

### Testing Pyramid

```
                    ┌─────────────┐
                    │    E2E      │ ← Integration & User Workflows
                    └─────────────┘
                  ┌─────────────────┐
                  │  Integration    │ ← Component Interactions
                  └─────────────────┘
                ┌─────────────────────┐
                │      Unit           │ ← Individual Functions/Classes
                └─────────────────────┘
```

### Testing Philosophy
- **Test-Driven Development**: Write tests before implementation when possible
- **Behavior Testing**: Focus on what the code should do, not how it does it
- **Fast Feedback**: Unit tests run quickly, integration tests verify workflows
- **Real-World Scenarios**: Test with actual Obsidian API integration

## 🏗️ Test Organization

### Directory Structure

```
tests/
├── unit/                          # Unit tests for individual components
│   ├── core/                     # Core system tests
│   │   ├── templates/            # Template system tests
│   │   ├── notes/               # Note creation tests
│   │   └── data/                # Data handling tests
│   ├── ui/                      # UI component tests
│   │   ├── modals/              # Modal component tests
│   │   └── components/          # Individual UI component tests
│   └── utils/                   # Utility function tests
├── integration/                  # Integration tests for workflows
│   ├── note-creation.test.ts    # End-to-end note creation
│   ├── template-processing.test.ts # Template evaluation workflows
│   └── ui-interactions.test.ts  # User interface interactions
├── template-examples/           # Template validation tests
│   ├── chemical.test.ts         # Chemical template validation
│   ├── analysis.test.ts         # Analysis template validation
│   └── meeting.test.ts          # Meeting template validation
└── memory/                      # Performance and memory tests
    ├── memory-leaks.test.ts     # Memory leak detection
    └── performance.test.ts      # Performance benchmarks
```

## 🔧 Testing Tools

### Primary Testing Framework
- **Jest**: Main testing framework for unit and integration tests
- **@testing-library/dom**: DOM testing utilities
- **jest-environment-jsdom**: Browser-like environment for UI tests

### Obsidian Testing
- **obsidian-testing-library**: Mock Obsidian API for testing
- **test-vault**: Minimal vault for testing file operations

### Setup and Configuration

```typescript
// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/main.ts'
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
```

## 📝 Unit Testing

### Testing Core Components

#### Template Manager Tests

```typescript
// tests/unit/core/templates/TemplateManager.test.ts
import { TemplateManager } from '../../../../src/core/templates/TemplateManager';
import { MetaDataTemplate } from '../../../../src/types/templates';

describe('TemplateManager', () => {
    let templateManager: TemplateManager;
    
    beforeEach(() => {
        templateManager = new TemplateManager(mockSettings);
    });
    
    describe('loadRawTemplate', () => {
        it('should load existing template', () => {
            const template = templateManager.loadRawTemplate('chemical');
            expect(template).toBeDefined();
            expect(template?.formula).toBeDefined();
        });
        
        it('should return null for non-existent template', () => {
            const template = templateManager.loadRawTemplate('nonexistent');
            expect(template).toBeNull();
        });
    });
    
    describe('processTemplate', () => {
        it('should evaluate function descriptors', () => {
            const processed = templateManager.processTemplate('meeting');
            expect(processed?.date?.default).toMatch(/\d{4}-\d{2}-\d{2}/);
        });
        
        it('should handle reactive dependencies', () => {
            const processed = templateManager.processTemplate('analysis');
            expect(processed?.tags?.userInputs).toContain('analysis.type');
        });
    });
});
```

#### UI Component Tests

```typescript
// tests/unit/ui/components/LabeledTextInput.test.ts
import { LabeledTextInput } from '../../../../src/ui/modals/components/LabeledTextInput';

describe('LabeledTextInput', () => {
    let container: HTMLElement;
    
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    
    afterEach(() => {
        container.remove();
    });
    
    it('should render with label and input', () => {
        const input = new LabeledTextInput({
            container,
            label: 'Test Label',
            value: 'test value'
        });
        
        expect(container.querySelector('label')).toHaveTextContent('Test Label');
        expect(container.querySelector('input')).toHaveValue('test value');
    });
    
    it('should call onChange when value changes', () => {
        const onChange = jest.fn();
        const input = new LabeledTextInput({
            container,
            label: 'Test',
            onValueChange: onChange
        });
        
        const inputElement = container.querySelector('input') as HTMLInputElement;
        inputElement.value = 'new value';
        inputElement.dispatchEvent(new Event('input'));
        
        expect(onChange).toHaveBeenCalledWith('new value');
    });
});
```

### Testing Utilities

#### Mock Helpers

```typescript
// tests/utils/mocks.ts
import { App, TFile, Vault } from 'obsidian';

export const createMockApp = (): Partial<App> => ({
    vault: createMockVault(),
    workspace: createMockWorkspace(),
    metadataCache: createMockMetadataCache()
});

export const createMockVault = (): Partial<Vault> => ({
    create: jest.fn().mockResolvedValue(createMockFile()),
    read: jest.fn().mockResolvedValue(''),
    modify: jest.fn().mockResolvedValue(undefined)
});

export const createMockFile = (path = 'test.md'): TFile => ({
    path,
    name: path.split('/').pop() || 'test.md',
    basename: 'test',
    extension: 'md',
    stat: { ctime: Date.now(), mtime: Date.now(), size: 0 },
    vault: null as any
});
```

## 🔗 Integration Testing

### Note Creation Workflow

```typescript
// tests/integration/note-creation.test.ts
import { NewNoteModal } from '../../src/ui/modals/NewNoteModal';
import { createMockApp } from '../utils/mocks';

describe('Note Creation Integration', () => {
    let app: App;
    let modal: NewNoteModal;
    
    beforeEach(() => {
        app = createMockApp() as App;
        modal = new NewNoteModal(app, mockPlugin, 'chemical');
    });
    
    it('should create note with filled template', async () => {
        // Fill form data
        modal.inputManager.setValue('formula.name', 'Benzene');
        modal.inputManager.setValue('formula.molecular_formula', 'C6H6');
        
        // Submit form
        const file = await modal.createNote();
        
        expect(file).toBeDefined();
        expect(app.vault.create).toHaveBeenCalledWith(
            expect.stringContaining('Benzene'),
            expect.stringContaining('C6H6')
        );
    });
    
    it('should validate required fields', async () => {
        // Try to submit without required fields
        const result = modal.validateForm();
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('formula.name is required');
    });
});
```

### Template Processing Integration

```typescript
// tests/integration/template-processing.test.ts
describe('Template Processing Integration', () => {
    it('should process complex reactive template', async () => {
        const templateManager = new TemplateManager(settings);
        const inputManager = new InputManager();
        
        // Load analysis template with reactive tags
        const template = templateManager.processTemplate('analysis');
        
        // Set analysis type
        inputManager.setValue('analysis.type', 'spectroscopy');
        
        // Update reactive fields
        inputManager.updateReactiveFields('analysis.type');
        
        // Check that tags were updated
        const tags = inputManager.getValue('tags');
        expect(tags).toContain('analysis/spectroscopy');
    });
});
```

## 📋 Template Validation Testing

### Template Structure Tests

```typescript
// tests/template-examples/chemical.test.ts
import { chemicalTemplate } from '../../src/data/templates/metadata/chemical';
import { validateTemplate } from '../utils/template-validator';

describe('Chemical Template', () => {
    it('should have valid structure', () => {
        const validation = validateTemplate(chemicalTemplate);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toEqual([]);
    });
    
    it('should have required fields', () => {
        expect(chemicalTemplate.formula?.name).toBeDefined();
        expect(chemicalTemplate.formula?.molecular_formula).toBeDefined();
        expect(chemicalTemplate.tags).toBeDefined();
    });
    
    it('should have valid function descriptors', () => {
        const tagsField = chemicalTemplate.tags;
        expect(tagsField?.default?.type).toBe('function');
        expect(tagsField?.default?.function).toBeDefined();
    });
});
```

### Function Descriptor Tests

```typescript
// tests/template-examples/function-descriptors.test.ts
describe('Function Descriptor Validation', () => {
    it('should evaluate date functions correctly', () => {
        const descriptor = {
            type: 'function',
            value: "new Date().toISOString().split('T')[0]"
        };
        
        const result = evaluateFunction(descriptor, {});
        expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
    
    it('should handle reactive dependencies', () => {
        const descriptor = {
            type: 'function',
            context: ['userInput'],
            reactiveDeps: ['chemical.type'],
            function: "({ userInput }) => [`chemical/${userInput.chemical?.type}`]",
            fallback: ['chemical/unknown']
        };
        
        const context = {
            userInput: { chemical: { type: 'organic' } }
        };
        
        const result = evaluateFunction(descriptor, context);
        expect(result).toEqual(['chemical/organic']);
    });
});
```

## 🚀 Performance Testing

### Memory Leak Detection

```typescript
// tests/memory/memory-leaks.test.ts
describe('Memory Leak Detection', () => {
    it('should not leak memory on modal creation/destruction', () => {
        const initialMemory = process.memoryUsage().heapUsed;
        
        // Create and destroy modals multiple times
        for (let i = 0; i < 100; i++) {
            const modal = new NewNoteModal(app, plugin, 'chemical');
            modal.open();
            modal.close();
        }
        
        // Force garbage collection
        if (global.gc) global.gc();
        
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory increase should be minimal
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
    });
});
```

### Performance Benchmarks

```typescript
// tests/memory/performance.test.ts
describe('Performance Benchmarks', () => {
    it('should render large templates quickly', () => {
        const startTime = performance.now();
        
        const largeTemplate = generateLargeTemplate(100); // 100 fields
        const renderer = new UniversalObjectRenderer(container, largeTemplate);
        
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        expect(renderTime).toBeLessThan(100); // Under 100ms
    });
});
```

## 🎯 Testing Best Practices

### Writing Good Tests

```typescript
// ✅ Good: Descriptive test names
describe('TemplateManager.processTemplate', () => {
    it('should evaluate date functions to current date format', () => {
        // Test implementation
    });
});

// ❌ Bad: Vague test names
describe('TemplateManager', () => {
    it('should work', () => {
        // Test implementation
    });
});
```

### Test Data Management

```typescript
// ✅ Good: Use factories for test data
const createTestTemplate = (overrides = {}) => ({
    title: { inputType: 'text', default: 'Test' },
    date: { inputType: 'date', default: { type: 'function', value: 'new Date()' } },
    ...overrides
});

// ✅ Good: Isolate test data
beforeEach(() => {
    // Reset state for each test
    templateManager = new TemplateManager(createTestSettings());
});
```

### Async Testing

```typescript
// ✅ Good: Proper async handling
it('should create note asynchronously', async () => {
    const promise = modal.createNote();
    await expect(promise).resolves.toBeDefined();
});

// ✅ Good: Test error cases
it('should handle creation errors gracefully', async () => {
    vault.create.mockRejectedValue(new Error('Disk full'));
    await expect(modal.createNote()).rejects.toThrow('Disk full');
});
```

## 🏃‍♂️ Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=TemplateManager

# Run integration tests only
npm test -- --testPathIgnorePatterns=unit

# Run performance tests
npm run test:performance
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

## 🐛 Debugging Tests

### Debug Configuration

```json
// .vscode/launch.json
{
    "type": "node",
    "request": "launch",
    "name": "Debug Jest Tests",
    "program": "${workspaceFolder}/node_modules/.bin/jest",
    "args": ["--runInBand", "--no-cache"],
    "console": "integratedTerminal",
    "internalConsoleOptions": "neverOpen"
}
```

### Common Debugging Techniques

```typescript
// Add debug output
it('should process template correctly', () => {
    const result = processTemplate(template);
    console.log('Template result:', JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
});

// Use debugger breakpoints
it('should handle edge case', () => {
    debugger; // Execution will pause here
    const result = complexFunction(edgeCaseInput);
    expect(result).toBe(expectedOutput);
});
```

## 📊 Test Coverage

### Coverage Goals
- **Unit Tests**: >90% line coverage
- **Integration Tests**: All major workflows
- **Template Tests**: All template files validated

### Coverage Reports

```bash
# Generate HTML coverage report
npm run test:coverage
open coverage/lcov-report/index.html
```

## 🔗 Related Documentation

- [Development Setup](development-setup.md) - Environment setup for testing
- [API Reference](api-reference.md) - Interfaces and types for testing
- [Architecture Overview](architecture.md) - System understanding for test design
- [Contributing Guide](contributing.md) - Contribution workflow including testing requirements
