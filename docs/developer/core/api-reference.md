# API Reference

This document provides comprehensive API documentation for the Obsidian ELN Plugin, including TypeScript interfaces, core classes, and public APIs.

## 🏗️ Core Interfaces

### Template System

#### MetaDataTemplate
Core template structure for defining note templates.

```typescript
interface MetaDataTemplate {
    [key: string]: MetaDataTemplateField | MetaDataTemplate;
}
```

#### MetaDataTemplateField
Individual field definition within a template.

```typescript
interface MetaDataTemplateField {
    inputType?: "text" | "number" | "boolean" | "date" | "dropdown" | "multiselect" | 
               "actiontext" | "dynamic" | "editableObject" | "queryDropdown" | 
               "multiQueryDropdown" | "subclass" | "list";
    query?: boolean;
    default?: string | number | boolean | null | FunctionDescriptor;
    placeholder?: string;
    options?: string | string[] | (() => string[]);
    callback?: string | ((...args: unknown[]) => unknown);
    action?: string | ((...args: unknown[]) => unknown);
    units?: string[];
    defaultUnit?: string;
    icon?: string;
    tooltip?: string;
    search?: string | QueryConfig[];
    where?: QueryWhereClause;
    return?: QueryReturnClause;
    listType?: "text" | "number" | "boolean" | "date" | "object";
    objectTemplate?: MetaDataTemplateField[] | Record<string, MetaDataTemplateField>;
    initialItems?: number;
    editableKey?: boolean;
    removeable?: boolean;
    multiline?: boolean;
    userInputs?: string[];
}
```

#### FunctionDescriptor
Defines dynamic template functions.

```typescript
interface FunctionDescriptor {
    type: "function";
    value?: string;
    context?: string[];
    reactiveDeps?: string[];
    function?: string;
    fallback?: string | number | boolean | null;
}
```

### Query System

#### QueryConfig
Configuration for query dropdowns and searches.

```typescript
interface QueryConfig {
    tag?: string;
    where?: QueryWhereClause;
    return?: QueryReturnClause;
}
```

#### QueryWhereClause
Defines query conditions and filters.

```typescript
interface QueryWhereClause {
    field?: string;
    operator?: "is" | "contains" | "not" | "gt" | "lt" | "gte" | "lte" | "exists" | "regex";
    value?: string | number | boolean;
    conditions?: QueryWhereClause[];
}
```

#### QueryReturnClause
Specifies what data to return from queries.

```typescript
type QueryReturnClause = string[] | Record<string, string>;
```

### Form System

#### FormFieldValue
Valid values for form fields.

```typescript
type FormFieldValue = 
    | string 
    | number 
    | boolean 
    | null 
    | Date 
    | string[] 
    | number[] 
    | boolean[]
    | Date[]
    | { [key: string]: FormFieldValue };
```

#### FormData
Structure for collecting user input.

```typescript
type FormData = {
    [key: string]: FormFieldValue;
};
```

## 🔧 Core Classes

### TemplateManager
Unified interface for template operations.

**Location**: `src/core/templates/TemplateManager.ts`

```typescript
class TemplateManager {
    loadRawTemplate(noteType: string): MetaDataTemplate | null;
    processTemplate(noteType: string): MetaDataTemplateProcessed | null;
    applySubclassTemplate(noteType: string, subclass: string): boolean;
    evaluateFunction(descriptor: FunctionDescriptor, context: object): any;
}
```

### UniversalObjectRenderer
Main form rendering engine.

**Location**: `src/ui/modals/components/UniversalObjectRenderer.ts`

```typescript
class UniversalObjectRenderer {
    render(template: MetaDataTemplateProcessed, container: HTMLElement): void;
    updateField(key: string, value: FormFieldValue): void;
    getFormData(): FormData;
    validateForm(): ValidationResult;
}
```

### InputManager
Centralized form state management.

**Location**: `src/ui/modals/utils/InputManager.ts`

```typescript
class InputManager {
    getValue(key: string): FormFieldValue;
    setValue(key: string, value: FormFieldValue): void;
    getFormData(): FormData;
    setFormData(data: FormData): void;
    addReactiveField(key: string, dependencies: string[]): void;
    updateReactiveFields(changedKey: string): void;
}
```

## 🎨 UI Components

### LabeledInputBase
Abstract base class for all input components.

**Location**: `src/ui/modals/components/LabeledInputBase.ts`

```typescript
abstract class LabeledInputBase<T> {
    protected value: T;
    protected onValueChange?: (value: T) => void;
    
    abstract getValue(): T;
    abstract setValue(value: T): void;
    protected abstract createValueEditor(options: LabeledInputBaseOptions<T>): void;
}
```

### Component Options

#### LabeledInputBaseOptions
Base options for all input components.

```typescript
interface LabeledInputBaseOptions<T> {
    container: HTMLElement;
    label: string;
    value?: T;
    placeholder?: string;
    onValueChange?: (value: T) => void;
    multiline?: boolean;
    disabled?: boolean;
}
```

## 📡 Event System

### Plugin Events
Events emitted by the plugin for external integration.

```typescript
interface PluginEvents {
    'note-created': (file: TFile, metadata: FormData) => void;
    'template-loaded': (noteType: string, template: MetaDataTemplate) => void;
    'form-validated': (isValid: boolean, errors: ValidationError[]) => void;
}
```

### Workspace Events
Integration with Obsidian's workspace event system.

```typescript
interface WorkspaceEvents {
    'active-leaf-change': () => void;
    'file-open': (file: TFile) => void;
    'layout-change': () => void;
}
```

## 🔌 Plugin Integration

### Public Plugin API
APIs available for other plugins to integrate with.

```typescript
interface ELNPluginAPI {
    // Template operations
    createNote(noteType: string, metadata?: Partial<FormData>): Promise<TFile>;
    getTemplate(noteType: string): MetaDataTemplate | null;
    registerTemplate(noteType: string, template: MetaDataTemplate): void;
    
    // UI operations
    openNoteModal(noteType: string): Promise<TFile | null>;
    validateTemplate(template: MetaDataTemplate): ValidationResult;
    
    // Settings access
    getSettings(): PluginSettings;
    updateSettings(settings: Partial<PluginSettings>): Promise<void>;
}
```

### Plugin Settings
Configuration structure for the plugin.

```typescript
interface PluginSettings {
    noteTypes: Record<string, MetaDataTemplate>;
    navbarGroups: NavbarGroup[];
    noteTypeUIConfig: Record<string, NoteTypeUIConfig>;
    authors: Author[];
    globalSettings: {
        defaultAuthor: string;
        dateFormat: string;
        enableFooter: boolean;
        enableNavbar: boolean;
    };
}
```

## 🛡️ Type Guards

### Template Type Guards
Utility functions for runtime type checking.

```typescript
function isMetaDataTemplate(obj: unknown): obj is MetaDataTemplate;
function isFunctionDescriptor(obj: unknown): obj is FunctionDescriptor;
function isQueryConfig(obj: unknown): obj is QueryConfig;
```

### Form Type Guards
Type guards for form validation.

```typescript
function isFormFieldValue(value: unknown): value is FormFieldValue;
function isFormData(obj: unknown): obj is FormData;
```

## 📝 Usage Examples

### Creating a Custom Template

```typescript
const customTemplate: MetaDataTemplate = {
    title: {
        inputType: "text",
        query: true,
        default: "",
        placeholder: "Enter note title"
    },
    date: {
        inputType: "date",
        default: {
            type: "function",
            value: "new Date().toISOString().split('T')[0]"
        }
    },
    tags: {
        inputType: "list",
        listType: "text",
        default: ["experiment"]
    }
};
```

### Using Function Descriptors

```typescript
const reactiveField: MetaDataTemplateField = {
    inputType: "text",
    default: {
        type: "function",
        context: ["userInput", "settings"],
        reactiveDeps: ["title"],
        function: "({ userInput }) => `Analysis: ${userInput.title}`",
        fallback: "Analysis: Untitled"
    },
    userInputs: ["title"]
};
```

### Registering with Plugin API

```typescript
// Access the plugin API
const elnPlugin = app.plugins.plugins['obsidian-eln-plugin'];
const api: ELNPluginAPI = elnPlugin.api;

// Register a custom template
api.registerTemplate('custom-experiment', customTemplate);

// Create a note programmatically
const file = await api.createNote('custom-experiment', {
    title: 'My Experiment',
    tags: ['chemistry', 'analysis']
});
```

## 🔗 Related Documentation

- [Architecture Overview](architecture.md) - System design and components
- [Development Setup](development-setup.md) - Setting up development environment
- [Template System Guide](template-manager.md) - Working with templates
- [Component Architecture](component-architecture.md) - UI component patterns
