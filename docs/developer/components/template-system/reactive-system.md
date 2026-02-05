# Reactive System

The Reactive System manages field dependencies and automatic updates when related values change, enabling dynamic form behavior and intelligent template processing.

## 🏗️ Architecture

The Reactive System coordinates between field changes, dependency resolution, and template re-evaluation to provide a seamless user experience.

```typescript
┌─────────────────────────────────────────────────────┐
│                Reactive System                     │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │   Dependency    │  │      Change Detector        ││
│  │     Graph       │  │                             ││
│  └─────────────────┘  └─────────────────────────────┘│
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │    Update       │  │     Event Dispatcher        ││
│  │   Scheduler     │  │                             ││
│  └─────────────────┘  └─────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## 📍 Location

```
src/core/templates/ReactiveSystem.ts
src/ui/modals/utils/ReactiveDependencyManager.ts
```

## 🔧 Core Functionality

### Dependency Management

The system tracks which fields depend on others and manages update propagation:

```typescript
export class ReactiveSystem {
    private dependencyGraph: Map<string, Set<string>>;
    private subscribers: Map<string, ReactiveCallback[]>;
    private updateQueue: UpdateScheduler;
    
    constructor() {
        this.dependencyGraph = new Map();
        this.subscribers = new Map();
        this.updateQueue = new UpdateScheduler();
    }
    
    /**
     * Registers a reactive dependency
     */
    public addDependency(dependentField: string, sourceField: string): void {
        if (!this.dependencyGraph.has(sourceField)) {
            this.dependencyGraph.set(sourceField, new Set());
        }
        this.dependencyGraph.get(sourceField)!.add(dependentField);
    }
}
```

### Field Change Detection

The system monitors field value changes and triggers appropriate updates:

```typescript
/**
 * Notifies the system of a field value change
 */
public notifyFieldChange(fieldPath: string, newValue: any, oldValue?: any): void {
    // Skip if value hasn't actually changed
    if (this.valuesEqual(newValue, oldValue)) {
        return;
    }
    
    // Queue updates for dependent fields
    const dependents = this.getDependentFields(fieldPath);
    for (const dependent of dependents) {
        this.updateQueue.scheduleUpdate(dependent, fieldPath);
    }
    
    // Process queued updates
    this.updateQueue.processUpdates();
}
```

## 🎯 Dependency Types

### Direct Dependencies

Simple field-to-field dependencies:

```typescript
// Field B depends on Field A
{
    fieldA: { inputType: "text" },
    fieldB: {
        inputType: "text",
        default: {
            type: "function",
            context: ["userInput"],
            reactiveDeps: ["fieldA"],
            function: "({ userInput }) => `derived-${userInput.fieldA}`"
        }
    }
}
```

### Nested Dependencies

Dependencies on nested object properties:

```typescript
// Tags depend on chemical type and experiment method
{
    chemical: {
        type: { inputType: "text" },
        purity: { inputType: "number" }
    },
    experiment: {
        method: { inputType: "text" }
    },
    tags: {
        inputType: "list",
        default: {
            type: "function",
            context: ["userInput"],
            reactiveDeps: ["chemical.type", "experiment.method"],
            function: `({ userInput }) => [
                'chemical/' + (userInput.chemical?.type || 'unknown'),
                'method/' + (userInput.experiment?.method || 'general')
            ]`
        }
    }
}
```

### Multi-Level Dependencies

Complex dependency chains:

```typescript
// C depends on B, B depends on A
{
    fieldA: { inputType: "text" },
    fieldB: {
        inputType: "text", 
        default: {
            type: "function",
            reactiveDeps: ["fieldA"],
            function: "({ userInput }) => userInput.fieldA + '-processed'"
        }
    },
    fieldC: {
        inputType: "text",
        default: {
            type: "function", 
            reactiveDeps: ["fieldB"],
            function: "({ userInput }) => userInput.fieldB + '-final'"
        }
    }
}
```

## 🔄 Update Lifecycle

### 1. Change Detection

```typescript
class FieldChangeDetector {
    public detectChange(fieldPath: string, newValue: any): ChangeEvent {
        const oldValue = this.getCurrentValue(fieldPath);
        
        return {
            fieldPath,
            newValue,
            oldValue,
            timestamp: Date.now(),
            changeType: this.determineChangeType(oldValue, newValue)
        };
    }
    
    private determineChangeType(oldValue: any, newValue: any): ChangeType {
        if (oldValue === undefined) return 'initialize';
        if (newValue === undefined) return 'clear';
        if (typeof oldValue !== typeof newValue) return 'type-change';
        return 'update';
    }
}
```

### 2. Dependency Resolution

```typescript
class DependencyResolver {
    public resolveDependents(fieldPath: string): ResolvedDependency[] {
        const directDependents = this.dependencyGraph.get(fieldPath) || new Set();
        const resolved: ResolvedDependency[] = [];
        
        for (const dependent of directDependents) {
            resolved.push({
                fieldPath: dependent,
                updatePriority: this.calculatePriority(dependent),
                requiresRecomputation: true
            });
        }
        
        // Sort by priority (higher priority updates first)
        return resolved.sort((a, b) => b.updatePriority - a.updatePriority);
    }
}
```

### 3. Update Scheduling

```typescript
class UpdateScheduler {
    private updateQueue: PriorityQueue<FieldUpdate>;
    private isProcessing: boolean = false;
    
    public scheduleUpdate(fieldPath: string, sourcePath: string): void {
        const update: FieldUpdate = {
            fieldPath,
            sourcePath,
            priority: this.calculatePriority(fieldPath),
            timestamp: Date.now()
        };
        
        this.updateQueue.enqueue(update);
        
        if (!this.isProcessing) {
            this.processUpdates();
        }
    }
    
    public async processUpdates(): Promise<void> {
        this.isProcessing = true;
        
        while (!this.updateQueue.isEmpty()) {
            const update = this.updateQueue.dequeue();
            await this.executeUpdate(update);
        }
        
        this.isProcessing = false;
    }
}
```

### 4. Template Re-evaluation

```typescript
private async executeUpdate(update: FieldUpdate): Promise<void> {
    try {
        // Get current template and user input
        const template = this.templateManager.loadRawTemplate(this.noteType);
        const userInput = this.inputManager.getAllValues();
        
        // Re-evaluate the specific field
        const fieldConfig = this.getFieldConfig(template, update.fieldPath);
        const newValue = this.templateEvaluator.evaluateField(fieldConfig, userInput);
        
        // Update the UI component
        await this.updateFieldValue(update.fieldPath, newValue);
        
        // Notify subscribers
        this.notifySubscribers(update.fieldPath, newValue);
    } catch (error) {
        console.error(`Failed to update field ${update.fieldPath}:`, error);
    }
}
```

## 🎛️ Configuration

### Dependency Declaration

Dependencies are declared in template field configurations:

```typescript
interface ReactiveFieldConfig {
    inputType: InputType;
    default?: {
        type: "function";
        context: string[];
        reactiveDeps: string[];  // Array of field paths this field depends on
        function: string;
        fallback?: any;
    };
}
```

### Update Options

```typescript
interface ReactiveUpdateOptions {
    debounceMs?: number;        // Debounce rapid changes
    batchUpdates?: boolean;     // Batch multiple updates
    maxDepth?: number;          // Prevent infinite dependency loops
    validateCycles?: boolean;   // Check for circular dependencies
}
```

## 🚀 Performance Optimizations

### Debouncing

Rapid changes are debounced to prevent excessive updates:

```typescript
class DebounceManager {
    private timers: Map<string, NodeJS.Timeout> = new Map();
    private defaultDelay: number = 300;
    
    public debounce(fieldPath: string, callback: () => void, delay?: number): void {
        // Clear existing timer
        if (this.timers.has(fieldPath)) {
            clearTimeout(this.timers.get(fieldPath)!);
        }
        
        // Set new timer
        const timer = setTimeout(() => {
            callback();
            this.timers.delete(fieldPath);
        }, delay || this.defaultDelay);
        
        this.timers.set(fieldPath, timer);
    }
}
```

### Batch Updates

Multiple updates are batched to improve performance:

```typescript
class BatchUpdateManager {
    private pendingUpdates: Set<string> = new Set();
    private batchTimer: NodeJS.Timeout | null = null;
    
    public scheduleBatchUpdate(fieldPath: string): void {
        this.pendingUpdates.add(fieldPath);
        
        if (!this.batchTimer) {
            this.batchTimer = setTimeout(() => {
                this.processBatch();
            }, 16); // Next animation frame
        }
    }
    
    private processBatch(): void {
        const updates = Array.from(this.pendingUpdates);
        this.pendingUpdates.clear();
        this.batchTimer = null;
        
        // Process all updates in optimal order
        this.processUpdateBatch(updates);
    }
}
```

### Cycle Detection

Circular dependencies are detected and prevented:

```typescript
class CycleDetector {
    public detectCycles(dependencyGraph: Map<string, Set<string>>): string[][] {
        const visited = new Set<string>();
        const recursionStack = new Set<string>();
        const cycles: string[][] = [];
        
        for (const node of dependencyGraph.keys()) {
            if (!visited.has(node)) {
                this.dfsDetectCycle(node, dependencyGraph, visited, recursionStack, [], cycles);
            }
        }
        
        return cycles;
    }
    
    private dfsDetectCycle(
        node: string,
        graph: Map<string, Set<string>>,
        visited: Set<string>,
        recursionStack: Set<string>,
        path: string[],
        cycles: string[][]
    ): void {
        visited.add(node);
        recursionStack.add(node);
        path.push(node);
        
        const neighbors = graph.get(node) || new Set();
        for (const neighbor of neighbors) {
            if (recursionStack.has(neighbor)) {
                // Cycle detected
                const cycleStart = path.indexOf(neighbor);
                cycles.push(path.slice(cycleStart));
            } else if (!visited.has(neighbor)) {
                this.dfsDetectCycle(neighbor, graph, visited, recursionStack, [...path], cycles);
            }
        }
        
        recursionStack.delete(node);
    }
}
```

## 🧩 Integration Points

### With Input Manager

The reactive system integrates with the Input Manager to detect field changes:

```typescript
export class InputManager {
    private reactiveSystem: ReactiveSystem;
    
    public setValue(fieldPath: string, value: any): void {
        const oldValue = this.getValue(fieldPath);
        
        // Update the value
        this.values.set(fieldPath, value);
        
        // Notify reactive system
        this.reactiveSystem.notifyFieldChange(fieldPath, value, oldValue);
    }
}
```

### With Template Manager

The reactive system works with the Template Manager to re-evaluate templates:

```typescript
export class TemplateManager {
    private reactiveSystem: ReactiveSystem;
    
    public processTemplate(noteType: string, userInput?: UserInputData): MetaDataTemplateProcessed | null {
        const template = this.loadRawTemplate(noteType);
        if (!template) return null;
        
        // Build dependency graph from template
        this.reactiveSystem.buildDependencyGraph(template);
        
        // Process template with reactive evaluation
        return this.templateEvaluator.evaluateTemplate(template, userInput);
    }
}
```

### With UI Components

UI components subscribe to reactive updates:

```typescript
export class LabeledTextInput extends LabeledInputBase {
    constructor(config: InputConfig) {
        super(config);
        
        // Subscribe to reactive updates
        this.reactiveSystem.subscribe(this.fieldPath, (newValue) => {
            this.updateValue(newValue);
        });
    }
}
```

## 🧪 Testing

### Unit Tests

```typescript
describe('ReactiveSystem', () => {
    let reactiveSystem: ReactiveSystem;
    
    beforeEach(() => {
        reactiveSystem = new ReactiveSystem();
    });
    
    describe('dependency management', () => {
        it('should add dependencies correctly', () => {
            reactiveSystem.addDependency('fieldB', 'fieldA');
            
            const dependents = reactiveSystem.getDependentFields('fieldA');
            expect(dependents).toContain('fieldB');
        });
        
        it('should handle nested dependencies', () => {
            reactiveSystem.addDependency('tags', 'chemical.type');
            
            const dependents = reactiveSystem.getDependentFields('chemical.type');
            expect(dependents).toContain('tags');
        });
    });
    
    describe('change detection', () => {
        it('should detect value changes', () => {
            const callback = jest.fn();
            reactiveSystem.subscribe('fieldA', callback);
            
            reactiveSystem.notifyFieldChange('fieldA', 'new value', 'old value');
            
            expect(callback).toHaveBeenCalledWith('new value', 'old value');
        });
        
        it('should skip unchanged values', () => {
            const callback = jest.fn();
            reactiveSystem.subscribe('fieldA', callback);
            
            reactiveSystem.notifyFieldChange('fieldA', 'same value', 'same value');
            
            expect(callback).not.toHaveBeenCalled();
        });
    });
    
    describe('cycle detection', () => {
        it('should detect circular dependencies', () => {
            reactiveSystem.addDependency('fieldB', 'fieldA');
            reactiveSystem.addDependency('fieldA', 'fieldB');
            
            const cycles = reactiveSystem.detectCycles();
            expect(cycles).toHaveLength(1);
            expect(cycles[0]).toContain('fieldA');
            expect(cycles[0]).toContain('fieldB');
        });
    });
});
```

### Integration Tests

```typescript
describe('ReactiveSystem Integration', () => {
    let templateManager: TemplateManager;
    let inputManager: InputManager;
    let reactiveSystem: ReactiveSystem;
    
    beforeEach(() => {
        reactiveSystem = new ReactiveSystem();
        templateManager = new TemplateManager(settings, reactiveSystem);
        inputManager = new InputManager(reactiveSystem);
    });
    
    it('should update dependent fields when source changes', async () => {
        const template = {
            source: { inputType: 'text' },
            derived: {
                inputType: 'text',
                default: {
                    type: 'function',
                    reactiveDeps: ['source'],
                    function: "({ userInput }) => `derived-${userInput.source}`"
                }
            }
        };
        
        // Process template to build dependencies
        templateManager.processTemplateWithReactive(template);
        
        // Set source value
        inputManager.setValue('source', 'test');
        
        // Wait for reactive updates
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Check derived value was updated
        expect(inputManager.getValue('derived')).toBe('derived-test');
    });
});
```

## 🐛 Error Handling

### Circular Dependency Prevention

```typescript
private validateDependencyGraph(): void {
    const cycles = this.cycleDetector.detectCycles(this.dependencyGraph);
    
    if (cycles.length > 0) {
        console.error('Circular dependencies detected:', cycles);
        
        // Break cycles by removing problematic dependencies
        for (const cycle of cycles) {
            const lastDep = cycle[cycle.length - 1];
            const firstDep = cycle[0];
            this.removeDependency(firstDep, lastDep);
        }
    }
}
```

### Update Error Recovery

```typescript
private async executeUpdate(update: FieldUpdate): Promise<void> {
    try {
        await this.performUpdate(update);
    } catch (error) {
        console.error(`Reactive update failed for ${update.fieldPath}:`, error);
        
        // Try to recover with fallback value
        try {
            await this.applyFallbackValue(update.fieldPath);
        } catch (fallbackError) {
            console.error('Fallback recovery also failed:', fallbackError);
            // Last resort: notify user of the issue
            this.notifyUpdateError(update.fieldPath, error);
        }
    }
}
```

## 🔗 Related Documentation

- [Template Manager](template-manager.md) - Template loading and processing
- [Template Evaluator](template-evaluator.md) - Function descriptor evaluation
- [Input Manager](input-manager.md) - Form state management
- [API Reference](api-reference.md) - TypeScript interfaces and types

## 📚 Examples

### Complex Reactive Template

```typescript
const chemicalExperimentTemplate = {
    chemical: {
        name: { inputType: 'text' },
        type: { inputType: 'dropdown', options: ['organic', 'inorganic', 'polymer'] },
        formula: { inputType: 'text' }
    },
    experiment: {
        type: { inputType: 'dropdown', options: ['synthesis', 'analysis', 'characterization'] },
        conditions: {
            temperature: { inputType: 'number' },
            pressure: { inputType: 'number' }
        }
    },
    // Reactive fields
    filename: {
        inputType: 'text',
        default: {
            type: 'function',
            context: ['userInput'],
            reactiveDeps: ['chemical.name', 'experiment.type'],
            function: `({ userInput }) => {
                const name = userInput.chemical?.name || 'unknown';
                const exp = userInput.experiment?.type || 'general';
                const date = new Date().toISOString().split('T')[0];
                return \`\${date}-\${exp}-\${name.replace(/\\s+/g, '-')}\`;
            }`
        }
    },
    tags: {
        inputType: 'list',
        default: {
            type: 'function',
            context: ['userInput'],
            reactiveDeps: ['chemical.type', 'experiment.type'],
            function: `({ userInput }) => {
                const tags = ['experiment'];
                if (userInput.chemical?.type) {
                    tags.push('chemical/' + userInput.chemical.type);
                }
                if (userInput.experiment?.type) {
                    tags.push('experiment/' + userInput.experiment.type);
                }
                return tags;
            }`,
            fallback: ['experiment']
        }
    }
};
```

### Custom Reactive Behavior

```typescript
// Custom reactive field with complex logic
const smartTags = {
    inputType: 'list',
    default: {
        type: 'function',
        context: ['userInput', 'settings'],
        reactiveDeps: ['chemical.formula', 'experiment.conditions.temperature'],
        function: `({ userInput, settings }) => {
            const tags = [];
            
            // Add chemical formula tags
            const formula = userInput.chemical?.formula;
            if (formula) {
                // Extract elements from formula
                const elements = formula.match(/[A-Z][a-z]*/g) || [];
                tags.push(...elements.map(el => 'element/' + el));
            }
            
            // Add temperature range tags  
            const temp = userInput.experiment?.conditions?.temperature;
            if (temp !== undefined) {
                if (temp < 0) tags.push('conditions/cryogenic');
                else if (temp < 100) tags.push('conditions/ambient');
                else if (temp < 500) tags.push('conditions/elevated');
                else tags.push('conditions/high-temperature');
            }
            
            // Add project tags from settings
            if (settings.currentProject) {
                tags.push('project/' + settings.currentProject);
            }
            
            return tags;
        }`,
        fallback: ['experiment']
    }
};
```
