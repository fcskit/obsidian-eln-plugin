# Template Evaluator

The Template Evaluator is responsible for executing function descriptors within templates, enabling dynamic content generation and reactive field dependencies.

## 🏗️ Architecture

The Template Evaluator processes function descriptors to transform static template definitions into dynamic, context-aware configurations.

```typescript
┌─────────────────────────────────────────────────────┐
│               Template Evaluator                   │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │   Function      │  │     Context Builder         ││
│  │   Registry      │  │                             ││
│  └─────────────────┘  └─────────────────────────────┘│
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │   Execution     │  │    Dependency Resolver      ││
│  │   Engine        │  │                             ││
│  └─────────────────┘  └─────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## 📍 Location

```
src/core/templates/TemplateEvaluator.ts
```

## 🔧 Core Functionality

### Function Descriptor Evaluation

The evaluator processes function descriptors to generate dynamic values:

```typescript
export class TemplateEvaluator {
    private functionRegistry: FunctionRegistry;
    private contextBuilder: ContextBuilder;
    
    constructor() {
        this.functionRegistry = new FunctionRegistry();
        this.contextBuilder = new ContextBuilder();
        this.registerBuiltinFunctions();
    }
    
    /**
     * Evaluates a function descriptor with given context
     */
    public evaluateFunction(
        descriptor: FunctionDescriptor,
        context: EvaluationContext
    ): any {
        try {
            return this.executeFunction(descriptor, context);
        } catch (error) {
            console.error('Function evaluation failed:', error);
            return descriptor.fallback || null;
        }
    }
}
```

### Template Processing

The evaluator processes entire templates, evaluating all function descriptors:

```typescript
/**
 * Evaluates all function descriptors in a template
 */
public evaluateTemplate(
    template: MetaDataTemplate,
    userInput?: UserInputData
): MetaDataTemplateProcessed {
    const context = this.contextBuilder.buildContext(userInput);
    const processed: MetaDataTemplateProcessed = {};
    
    for (const [fieldName, fieldConfig] of Object.entries(template)) {
        processed[fieldName] = this.evaluateField(fieldConfig, context);
    }
    
    return processed;
}
```

## 🎯 Function Descriptor Types

### Simple Functions

Basic JavaScript expressions evaluated in a safe context:

```typescript
// Date function example
{
    type: "function",
    function: "new Date().toISOString().split('T')[0]"
}

// Mathematical calculation
{
    type: "function", 
    function: "Math.round(Math.random() * 1000)"
}
```

### Context-Aware Functions

Functions that receive context data for dynamic evaluation:

```typescript
{
    type: "function",
    context: ["userInput", "settings"],
    function: "({ userInput, settings }) => `${userInput.project?.name || 'Unknown'}-${settings.defaultPrefix}`"
}
```

### Reactive Functions

Functions that depend on other field values and re-evaluate when dependencies change:

```typescript
{
    type: "function",
    context: ["userInput"],
    reactiveDeps: ["chemical.type", "experiment.method"],
    function: "({ userInput }) => [`chemical/${userInput.chemical?.type}`, `method/${userInput.experiment?.method}`]",
    fallback: ["chemical/unknown", "method/general"]
}
```

## 🔄 Evaluation Process

### 1. Context Building

```typescript
class ContextBuilder {
    public buildContext(userInput?: UserInputData): EvaluationContext {
        return {
            userInput: userInput || {},
            settings: this.pluginSettings,
            utils: this.utilityFunctions,
            date: new Date(),
            random: Math.random
        };
    }
}
```

### 2. Function Execution

```typescript
private executeFunction(
    descriptor: FunctionDescriptor, 
    context: EvaluationContext
): any {
    if (descriptor.type !== 'function') {
        return descriptor.value;
    }
    
    // Build function context based on descriptor requirements
    const functionContext = this.buildFunctionContext(descriptor, context);
    
    // Execute the function safely
    return this.safeEvaluate(descriptor.function, functionContext);
}
```

### 3. Safe Evaluation

```typescript
private safeEvaluate(functionCode: string, context: any): any {
    try {
        // Create function with limited scope
        const func = new Function(...Object.keys(context), `return ${functionCode}`);
        return func(...Object.values(context));
    } catch (error) {
        throw new Error(`Function evaluation error: ${error.message}`);
    }
}
```

## 🛡️ Security & Safety

### Sandboxed Execution

Functions execute in a controlled environment with limited access:

```typescript
private createSafeContext(context: EvaluationContext): SafeContext {
    return {
        // Safe utilities
        Date: Date,
        Math: Math,
        JSON: JSON,
        
        // User data (read-only)
        userInput: Object.freeze(context.userInput),
        settings: Object.freeze(context.settings),
        
        // Utility functions
        utils: {
            formatDate: (date: Date) => date.toISOString().split('T')[0],
            slugify: (text: string) => text.toLowerCase().replace(/\s+/g, '-'),
            capitalize: (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
        }
    };
}
```

### Input Validation

Function descriptors are validated before execution:

```typescript
private validateFunctionDescriptor(descriptor: FunctionDescriptor): boolean {
    // Check required properties
    if (!descriptor.function || typeof descriptor.function !== 'string') {
        return false;
    }
    
    // Validate context requirements
    if (descriptor.context && !Array.isArray(descriptor.context)) {
        return false;
    }
    
    // Validate reactive dependencies
    if (descriptor.reactiveDeps && !Array.isArray(descriptor.reactiveDeps)) {
        return false;
    }
    
    return true;
}
```

### Error Handling

Robust error handling with fallback values:

```typescript
public evaluateFunction(
    descriptor: FunctionDescriptor,
    context: EvaluationContext
): any {
    // Validate descriptor
    if (!this.validateFunctionDescriptor(descriptor)) {
        console.warn('Invalid function descriptor:', descriptor);
        return descriptor.fallback || null;
    }
    
    try {
        return this.executeFunction(descriptor, context);
    } catch (error) {
        console.error('Function execution failed:', error);
        return descriptor.fallback || null;
    }
}
```

## 🧩 Built-in Functions

### Date Functions

```typescript
private registerBuiltinFunctions(): void {
    // Current date
    this.functionRegistry.register('currentDate', {
        function: "new Date().toISOString().split('T')[0]",
        description: "Returns current date in YYYY-MM-DD format"
    });
    
    // Formatted timestamp
    this.functionRegistry.register('timestamp', {
        function: "new Date().toISOString().replace(/[:.]/g, '-')",
        description: "Returns formatted timestamp for filenames"
    });
    
    // Relative date
    this.functionRegistry.register('relativeDate', {
        context: ['days'],
        function: "(days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]",
        description: "Returns date relative to today"
    });
}
```

### Text Processing Functions

```typescript
// String utilities
this.functionRegistry.register('slugify', {
    context: ['text'],
    function: "(text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')",
    description: "Converts text to URL-friendly slug"
});

this.functionRegistry.register('titleCase', {
    context: ['text'],
    function: "(text) => text.replace(/\\w\\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())",
    description: "Converts text to title case"
});
```

### Chemical Functions

```typescript
// Chemical name processing
this.functionRegistry.register('chemicalTags', {
    context: ['userInput'],
    reactiveDeps: ['chemical.type', 'chemical.class'],
    function: `({ userInput }) => {
        const tags = ['chemical'];
        if (userInput.chemical?.type) tags.push('chemical/' + userInput.chemical.type);
        if (userInput.chemical?.class) tags.push('class/' + userInput.chemical.class);
        return tags;
    }`,
    fallback: ['chemical'],
    description: "Generates chemical-specific tags"
});
```

## 🔗 Reactive Dependencies

### Dependency Declaration

Functions can declare dependencies on other fields:

```typescript
{
    type: "function",
    context: ["userInput"],
    reactiveDeps: ["experiment.type", "chemical.formula.name"],
    function: "({ userInput }) => `${userInput.experiment?.type}-${userInput.chemical?.formula?.name}`",
    fallback: "experiment-unknown"
}
```

### Dependency Resolution

The evaluator tracks and resolves dependencies:

```typescript
public resolveDependencies(
    template: MetaDataTemplate,
    changedField: string
): string[] {
    const affectedFields: string[] = [];
    
    for (const [fieldName, fieldConfig] of Object.entries(template)) {
        if (this.hasDependency(fieldConfig, changedField)) {
            affectedFields.push(fieldName);
        }
    }
    
    return affectedFields;
}

private hasDependency(fieldConfig: any, targetField: string): boolean {
    if (fieldConfig.default?.reactiveDeps) {
        return fieldConfig.default.reactiveDeps.includes(targetField);
    }
    return false;
}
```

### Reactive Updates

When dependencies change, affected functions are re-evaluated:

```typescript
public updateReactiveFields(
    template: MetaDataTemplate,
    changedField: string,
    context: EvaluationContext
): Partial<MetaDataTemplateProcessed> {
    const affectedFields = this.resolveDependencies(template, changedField);
    const updates: Partial<MetaDataTemplateProcessed> = {};
    
    for (const fieldName of affectedFields) {
        const fieldConfig = template[fieldName];
        updates[fieldName] = this.evaluateField(fieldConfig, context);
    }
    
    return updates;
}
```

## 🎛️ Configuration

### Function Registry Configuration

```typescript
interface FunctionRegistryConfig {
    builtin: boolean;           // Include built-in functions
    custom: FunctionDescriptor[]; // Custom function definitions
    allowEval: boolean;         // Allow direct eval (dangerous)
    timeout: number;           // Function execution timeout
}
```

### Evaluation Context

```typescript
interface EvaluationContext {
    userInput: UserInputData;
    settings: PluginSettings;
    utils: UtilityFunctions;
    date: Date;
    [key: string]: any;
}
```

## 🚀 Performance Optimizations

### Function Caching

Deterministic functions are cached to avoid repeated evaluation:

```typescript
private functionCache: Map<string, any> = new Map();

private executeWithCache(
    descriptor: FunctionDescriptor,
    context: EvaluationContext
): any {
    // Only cache if function is deterministic
    if (!this.isDeterministic(descriptor)) {
        return this.executeFunction(descriptor, context);
    }
    
    const cacheKey = this.createCacheKey(descriptor, context);
    
    if (this.functionCache.has(cacheKey)) {
        return this.functionCache.get(cacheKey);
    }
    
    const result = this.executeFunction(descriptor, context);
    this.functionCache.set(cacheKey, result);
    return result;
}
```

### Context Optimization

Context objects are reused when possible:

```typescript
private contextCache: WeakMap<UserInputData, EvaluationContext> = new WeakMap();

public buildOptimizedContext(userInput: UserInputData): EvaluationContext {
    if (this.contextCache.has(userInput)) {
        return this.contextCache.get(userInput)!;
    }
    
    const context = this.contextBuilder.buildContext(userInput);
    this.contextCache.set(userInput, context);
    return context;
}
```

## 🧪 Testing

### Unit Tests

```typescript
describe('TemplateEvaluator', () => {
    let evaluator: TemplateEvaluator;
    
    beforeEach(() => {
        evaluator = new TemplateEvaluator();
    });
    
    describe('evaluateFunction', () => {
        it('should evaluate simple function', () => {
            const descriptor = {
                type: 'function',
                function: "2 + 2"
            };
            
            const result = evaluator.evaluateFunction(descriptor, {});
            expect(result).toBe(4);
        });
        
        it('should handle context functions', () => {
            const descriptor = {
                type: 'function',
                context: ['userInput'],
                function: "({ userInput }) => userInput.name || 'default'"
            };
            
            const context = { userInput: { name: 'test' } };
            const result = evaluator.evaluateFunction(descriptor, context);
            expect(result).toBe('test');
        });
        
        it('should return fallback on error', () => {
            const descriptor = {
                type: 'function',
                function: "invalidFunction()",
                fallback: 'fallback-value'
            };
            
            const result = evaluator.evaluateFunction(descriptor, {});
            expect(result).toBe('fallback-value');
        });
    });
    
    describe('reactive dependencies', () => {
        it('should resolve dependencies correctly', () => {
            const template = {
                field1: { inputType: 'text' },
                field2: {
                    inputType: 'text',
                    default: {
                        type: 'function',
                        reactiveDeps: ['field1'],
                        function: "({ userInput }) => `derived-${userInput.field1}`"
                    }
                }
            };
            
            const affected = evaluator.resolveDependencies(template, 'field1');
            expect(affected).toContain('field2');
        });
    });
});
```

### Integration Tests

```typescript
describe('TemplateEvaluator Integration', () => {
    it('should work with complex templates', () => {
        const template = {
            title: { inputType: 'text' },
            tags: {
                inputType: 'list',
                default: {
                    type: 'function',
                    context: ['userInput'],
                    reactiveDeps: ['title'],
                    function: "({ userInput }) => [`note/${userInput.title?.toLowerCase()}`]"
                }
            }
        };
        
        const userInput = { title: 'Test Note' };
        const processed = evaluator.evaluateTemplate(template, userInput);
        
        expect(processed.tags.default).toEqual(['note/test note']);
    });
});
```

## 🐛 Error Handling

### Syntax Error Handling

```typescript
private safeEvaluate(functionCode: string, context: any): any {
    try {
        // Validate syntax first
        new Function(functionCode);
        
        // Execute with context
        const func = new Function(...Object.keys(context), `return ${functionCode}`);
        return func(...Object.values(context));
    } catch (syntaxError) {
        throw new Error(`Syntax error in function: ${syntaxError.message}`);
    }
}
```

### Runtime Error Recovery

```typescript
public evaluateFunction(descriptor: FunctionDescriptor, context: EvaluationContext): any {
    try {
        return this.executeFunction(descriptor, context);
    } catch (error) {
        // Log detailed error information
        console.error('Function evaluation failed:', {
            descriptor,
            error: error.message,
            context: Object.keys(context)
        });
        
        // Return fallback or safe default
        return descriptor.fallback || this.getDefaultValue(descriptor);
    }
}
```

## 🔗 Related Documentation

- [Template Manager](template-manager.md) - Template loading and processing
- [Reactive Dependencies](reactive-system.md) - Field dependency management  
- [API Reference](api-reference.md) - TypeScript interfaces and types
- [Architecture Overview](architecture.md) - System design context

## 📚 Examples

### Creating Custom Functions

```typescript
// Register a custom function
evaluator.functionRegistry.register('projectCode', {
    context: ['userInput', 'settings'],
    function: `({ userInput, settings }) => {
        const project = userInput.project?.name || 'default';
        const prefix = settings.projectPrefix || 'PRJ';
        return \`\${prefix}-\${project.toUpperCase()}\`;
    }`,
    description: 'Generates project code from project name'
});

// Use in template
const template = {
    code: {
        inputType: 'text',
        default: {
            type: 'function',
            function: 'projectCode'
        }
    }
};
```

### Complex Reactive Functions

```typescript
const chemicalTemplate = {
    formula: {
        name: { inputType: 'text' },
        molecular_formula: { inputType: 'text' }
    },
    properties: {
        inputType: 'object',
        default: {
            type: 'function',
            context: ['userInput'],
            reactiveDeps: ['formula.molecular_formula'],
            function: `({ userInput }) => {
                const formula = userInput.formula?.molecular_formula;
                if (!formula) return {};
                
                // Calculate molecular weight (simplified)
                const weight = formula.replace(/[A-Z][a-z]?/g, match => {
                    const weights = { H: 1, C: 12, N: 14, O: 16 };
                    return weights[match] || 0;
                }).split('').reduce((sum, char) => sum + (parseInt(char) || 1), 0);
                
                return { molecular_weight: weight };
            }`,
            fallback: {}
        }
    }
};
```
