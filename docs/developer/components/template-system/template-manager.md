# Template Manager

The Template Manager is the central component responsible for loading, processing, and managing note templates in the Obsidian ELN Plugin.

## 🏗️ Architecture

The Template Manager serves as the unified interface for all template operations, coordinating between raw template loading, function evaluation, and reactive dependency management.

```typescript
┌─────────────────────────────────────────────────────┐
│                Template Manager                     │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │  Raw Template   │  │    Template Evaluator      ││
│  │     Loader      │  │                             ││
│  └─────────────────┘  └─────────────────────────────┘│
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │    Cache        │  │  Reactive Dependencies      ││
│  │   Manager       │  │       Manager               ││
│  └─────────────────┘  └─────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## 📍 Location

```
src/core/templates/TemplateManager.ts
```

## 🔧 Core Functionality

### Template Loading

The Template Manager loads templates from the plugin settings and caches them for efficient access:

```typescript
export class TemplateManager {
    private templates: Map<string, MetaDataTemplate>;
    private processedCache: Map<string, MetaDataTemplateProcessed>;
    private settings: PluginSettings;
    
    constructor(settings: PluginSettings) {
        this.settings = settings;
        this.templates = new Map();
        this.processedCache = new Map();
        this.loadTemplates();
    }
    
    /**
     * Loads a raw template by note type
     */
    public loadRawTemplate(noteType: string): MetaDataTemplate | null {
        return this.templates.get(noteType) || null;
    }
}
```

### Template Processing

Templates are processed to evaluate function descriptors and resolve dynamic values:

```typescript
/**
 * Processes a template by evaluating all function descriptors
 * and resolving reactive dependencies
 */
public processTemplate(
    noteType: string, 
    userInput?: UserInputData
): MetaDataTemplateProcessed | null {
    // Check cache first
    const cacheKey = this.getCacheKey(noteType, userInput);
    if (this.processedCache.has(cacheKey)) {
        return this.processedCache.get(cacheKey)!;
    }
    
    const rawTemplate = this.loadRawTemplate(noteType);
    if (!rawTemplate) return null;
    
    // Process template with evaluator
    const processed = this.templateEvaluator.evaluateTemplate(
        rawTemplate, 
        userInput
    );
    
    // Cache the result
    this.processedCache.set(cacheKey, processed);
    return processed;
}
```

## 🎯 Key Methods

### loadRawTemplate(noteType: string)

Loads an unprocessed template from the settings configuration.

**Parameters:**
- `noteType`: The type of note template to load (e.g., 'chemical', 'meeting')

**Returns:**
- `MetaDataTemplate | null`: Raw template object or null if not found

**Example:**
```typescript
const template = templateManager.loadRawTemplate('chemical');
if (template) {
    console.log('Template fields:', Object.keys(template));
}
```

### processTemplate(noteType: string, userInput?: UserInputData)

Processes a template by evaluating function descriptors and resolving dependencies.

**Parameters:**
- `noteType`: The type of note template to process
- `userInput`: Current user input for reactive field evaluation

**Returns:**
- `MetaDataTemplateProcessed | null`: Processed template with evaluated values

**Example:**
```typescript
const processed = templateManager.processTemplate('meeting', {
    meeting: { type: 'standup' }
});
// Results in evaluated dates, reactive tags, etc.
```

### applySubclassTemplate(noteType: string, subclass: string)

Applies a subclass template modification to a base template.

**Parameters:**
- `noteType`: Base template type
- `subclass`: Subclass identifier

**Returns:**
- `boolean`: Success status of subclass application

**Example:**
```typescript
const success = templateManager.applySubclassTemplate('chemical', 'organic');
// Modifies the chemical template with organic-specific fields
```

### clearCache()

Clears the processed template cache, forcing re-evaluation on next access.

```typescript
templateManager.clearCache();
// All subsequent processTemplate calls will re-evaluate
```

## 🔄 Template Lifecycle

### 1. Loading Phase

```typescript
// Template loading from settings
private loadTemplates(): void {
    const templates = this.settings.noteTypes;
    
    for (const [noteType, template] of Object.entries(templates)) {
        if (this.validateTemplate(template)) {
            this.templates.set(noteType, template);
        } else {
            console.warn(`Invalid template: ${noteType}`);
        }
    }
}
```

### 2. Processing Phase

```typescript
// Template processing with function evaluation
private processTemplateFields(
    template: MetaDataTemplate,
    userInput?: UserInputData
): MetaDataTemplateProcessed {
    const processed: MetaDataTemplateProcessed = {};
    
    for (const [fieldName, fieldConfig] of Object.entries(template)) {
        processed[fieldName] = this.processField(fieldConfig, userInput);
    }
    
    return processed;
}
```

### 3. Caching Phase

```typescript
// Intelligent caching based on template and input state
private getCacheKey(noteType: string, userInput?: UserInputData): string {
    const inputHash = userInput ? this.hashUserInput(userInput) : 'no-input';
    return `${noteType}:${inputHash}`;
}
```

## 🧩 Integration Points

### With Template Evaluator

The Template Manager delegates function evaluation to the Template Evaluator:

```typescript
import { TemplateEvaluator } from './TemplateEvaluator';

export class TemplateManager {
    private templateEvaluator: TemplateEvaluator;
    
    constructor(settings: PluginSettings) {
        this.templateEvaluator = new TemplateEvaluator();
        // ...
    }
}
```

### With UI Components

UI components request processed templates for rendering:

```typescript
// In NewNoteModal or similar UI component
const processedTemplate = this.templateManager.processTemplate(
    this.noteType,
    this.inputManager.getAllValues()
);

this.renderer.renderTemplate(processedTemplate);
```

### With Reactive System

Reactive field updates trigger template reprocessing:

```typescript
// When a reactive field changes
onFieldChange(fieldPath: string, value: any): void {
    const userInput = this.inputManager.getAllValues();
    
    // Reprocess template with new input
    const updated = this.templateManager.processTemplate(
        this.noteType,
        userInput
    );
    
    // Update affected fields
    this.updateReactiveFields(updated);
}
```

## 🎛️ Configuration

### Template Structure

Templates are defined in the plugin settings:

```typescript
interface PluginSettings {
    noteTypes: {
        [noteType: string]: MetaDataTemplate;
    };
}

interface MetaDataTemplate {
    [fieldName: string]: TemplateField;
}

interface TemplateField {
    inputType: InputType;
    label?: string;
    required?: boolean;
    default?: any;
    validation?: ValidationRule[];
    reactive?: string[];
}
```

### Function Descriptors

Dynamic values are defined using function descriptors:

```typescript
// Example: Current date function
{
    title: {
        inputType: "text",
        default: {
            type: "function",
            function: "new Date().toISOString().split('T')[0]"
        }
    }
}
```

## 🚀 Performance Optimizations

### Template Caching

Processed templates are cached to avoid repeated evaluation:

```typescript
private processedCache: Map<string, MetaDataTemplateProcessed> = new Map();

// Cache invalidation strategies
public invalidateCache(noteType?: string): void {
    if (noteType) {
        // Remove specific template from cache
        for (const key of this.processedCache.keys()) {
            if (key.startsWith(noteType + ':')) {
                this.processedCache.delete(key);
            }
        }
    } else {
        // Clear entire cache
        this.processedCache.clear();
    }
}
```

### Lazy Loading

Templates are loaded only when first accessed:

```typescript
public getTemplate(noteType: string): MetaDataTemplate | null {
    if (!this.templates.has(noteType)) {
        this.loadTemplate(noteType);
    }
    return this.templates.get(noteType) || null;
}
```

### Reactive Dependency Optimization

Only affected fields are reprocessed when dependencies change:

```typescript
public updateReactiveFields(
    noteType: string,
    changedField: string,
    userInput: UserInputData
): Partial<MetaDataTemplateProcessed> {
    const template = this.loadRawTemplate(noteType);
    if (!template) return {};
    
    // Find fields that depend on the changed field
    const affectedFields = this.findReactiveDependencies(template, changedField);
    
    // Process only affected fields
    const updates: Partial<MetaDataTemplateProcessed> = {};
    for (const fieldName of affectedFields) {
        updates[fieldName] = this.processField(template[fieldName], userInput);
    }
    
    return updates;
}
```

## 🧪 Testing

### Unit Tests

```typescript
describe('TemplateManager', () => {
    let templateManager: TemplateManager;
    let mockSettings: PluginSettings;
    
    beforeEach(() => {
        mockSettings = createMockSettings();
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
        
        it('should cache processed templates', () => {
            const first = templateManager.processTemplate('chemical');
            const second = templateManager.processTemplate('chemical');
            expect(first).toBe(second); // Same reference due to caching
        });
    });
});
```

### Integration Tests

```typescript
describe('TemplateManager Integration', () => {
    it('should work with reactive dependencies', async () => {
        const userInput = { analysis: { type: 'spectroscopy' } };
        const processed = templateManager.processTemplate('analysis', userInput);
        
        expect(processed?.tags?.default).toContain('analysis/spectroscopy');
    });
});
```

## 🐛 Error Handling

### Template Validation

```typescript
private validateTemplate(template: MetaDataTemplate): boolean {
    try {
        for (const [fieldName, fieldConfig] of Object.entries(template)) {
            if (!this.validateFieldConfig(fieldConfig)) {
                throw new Error(`Invalid field configuration: ${fieldName}`);
            }
        }
        return true;
    } catch (error) {
        console.error('Template validation failed:', error);
        return false;
    }
}
```

### Graceful Degradation

```typescript
public processTemplate(noteType: string, userInput?: UserInputData): MetaDataTemplateProcessed | null {
    try {
        // Template processing logic
        return this.processTemplateInternal(noteType, userInput);
    } catch (error) {
        console.error(`Failed to process template ${noteType}:`, error);
        
        // Return basic fallback template
        return this.createFallbackTemplate(noteType);
    }
}
```

## 🔗 Related Documentation

- [Template Evaluator](template-evaluator.md) - Function descriptor evaluation
- [Reactive Dependencies](reactive-system.md) - Field dependency management
- [API Reference](api-reference.md) - TypeScript interfaces and types
- [Architecture Overview](architecture.md) - System design context

## 📚 Examples

### Creating a Custom Template

```typescript
const customTemplate: MetaDataTemplate = {
    title: {
        inputType: "text",
        required: true,
        label: "Document Title"
    },
    date: {
        inputType: "date",
        default: {
            type: "function",
            function: "new Date().toISOString().split('T')[0]"
        }
    },
    tags: {
        inputType: "list",
        listType: "text",
        default: {
            type: "function",
            context: ["userInput"],
            reactiveDeps: ["title"],
            function: "({ userInput }) => [`document/${userInput.title?.toLowerCase()}`]"
        }
    }
};

// Register template
settings.noteTypes['custom'] = customTemplate;
templateManager = new TemplateManager(settings);
```

### Processing with User Input

```typescript
const userInput = {
    title: "My Research Notes",
    project: { name: "Alpha Project" }
};

const processed = templateManager.processTemplate('custom', userInput);
// Results in tags: ["document/my research notes"]
```
