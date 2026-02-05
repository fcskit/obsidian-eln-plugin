# Universal Object Renderer

The Universal Object Renderer is the main form rendering engine that dynamically creates UI components based on template configurations, handling nested objects, field dependencies, and complex form layouts.

## 🏗️ Architecture

The Universal Object Renderer serves as the central orchestrator for form generation, coordinating multiple input components and managing their interactions.

```typescript
┌─────────────────────────────────────────────────────┐
│            Universal Object Renderer               │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │   Component     │  │      Layout Manager         ││
│  │    Factory      │  │                             ││
│  └─────────────────┘  └─────────────────────────────┘│
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │   Validation    │  │    Event Coordinator        ││
│  │   Orchestrator  │  │                             ││
│  └─────────────────┘  └─────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## 📍 Location

```
src/ui/modals/components/UniversalObjectRenderer.ts
```

## 🔧 Core Functionality

### Dynamic Component Creation

The renderer analyzes template structures and creates appropriate UI components:

```typescript
export class UniversalObjectRenderer {
    private container: HTMLElement;
    private componentFactory: ComponentFactory;
    private layoutManager: LayoutManager;
    private renderedComponents: Map<string, LabeledInputBase>;
    
    constructor(container: HTMLElement, inputManager: InputManager) {
        this.container = container;
        this.componentFactory = new ComponentFactory();
        this.layoutManager = new LayoutManager();
        this.renderedComponents = new Map();
    }
    
    /**
     * Renders a complete template structure
     */
    public renderTemplate(template: MetaDataTemplateProcessed): void {
        this.clearContainer();
        
        // Analyze template structure
        const renderPlan = this.analyzeTemplate(template);
        
        // Render components according to plan
        this.executeRenderPlan(renderPlan);
        
        // Set up field interactions
        this.setupFieldInteractions();
    }
}
```

### Nested Object Handling

The renderer handles complex nested object structures recursively:

```typescript
/**
 * Renders nested object fields
 */
private renderObjectField(
    fieldPath: string,
    fieldConfig: any,
    parentContainer: HTMLElement
): void {
    // Create section container for object
    const section = this.createSection(fieldPath, fieldConfig.label);
    parentContainer.appendChild(section);
    
    // Render nested fields
    if (fieldConfig.inputType === 'object' && fieldConfig.properties) {
        for (const [subFieldName, subFieldConfig] of Object.entries(fieldConfig.properties)) {
            const subFieldPath = `${fieldPath}.${subFieldName}`;
            this.renderField(subFieldPath, subFieldConfig, section);
        }
    }
}
```

### Component Factory Integration

The renderer uses a factory pattern to create appropriate input components:

```typescript
private renderField(
    fieldPath: string,
    fieldConfig: any,
    container: HTMLElement
): LabeledInputBase | null {
    try {
        // Determine component type
        const componentType = this.determineComponentType(fieldConfig);
        
        // Create component using factory
        const component = this.componentFactory.createComponent(
            componentType,
            {
                container,
                fieldPath,
                config: fieldConfig,
                inputManager: this.inputManager
            }
        );
        
        // Register component for management
        this.renderedComponents.set(fieldPath, component);
        
        return component;
    } catch (error) {
        console.error(`Failed to render field ${fieldPath}:`, error);
        return this.createErrorComponent(fieldPath, error);
    }
}
```

## 🎯 Rendering Strategies

### Layout Management

The renderer supports multiple layout strategies:

```typescript
class LayoutManager {
    public createLayout(
        template: MetaDataTemplateProcessed,
        layoutType: LayoutType = 'auto'
    ): LayoutPlan {
        switch (layoutType) {
            case 'grid':
                return this.createGridLayout(template);
            case 'sections':
                return this.createSectionLayout(template);
            case 'tabs':
                return this.createTabLayout(template);
            default:
                return this.createAutoLayout(template);
        }
    }
    
    private createAutoLayout(template: MetaDataTemplateProcessed): LayoutPlan {
        const fields = Object.keys(template);
        const sections: LayoutSection[] = [];
        
        // Group related fields into sections
        const groupedFields = this.groupRelatedFields(fields);
        
        for (const group of groupedFields) {
            sections.push({
                title: this.generateSectionTitle(group),
                fields: group,
                layout: this.determineSectionLayout(group)
            });
        }
        
        return { sections, type: 'auto' };
    }
}
```

### Component Type Detection

The renderer automatically determines the best component type for each field:

```typescript
private determineComponentType(fieldConfig: any): ComponentType {
    const inputType = fieldConfig.inputType;
    
    switch (inputType) {
        case 'text':
            return fieldConfig.multiline ? 'textarea' : 'text-input';
        case 'number':
            return fieldConfig.slider ? 'slider' : 'number-input';
        case 'date':
            return fieldConfig.includeTime ? 'datetime-input' : 'date-input';
        case 'list':
            return this.determineListComponentType(fieldConfig);
        case 'object':
            return 'object-renderer';
        case 'dropdown':
            return fieldConfig.searchable ? 'searchable-dropdown' : 'dropdown';
        default:
            console.warn(`Unknown input type: ${inputType}`);
            return 'text-input';
    }
}

private determineListComponentType(fieldConfig: any): ComponentType {
    if (fieldConfig.userInputs?.length > 0) {
        return 'query-dropdown';
    }
    
    switch (fieldConfig.listType) {
        case 'text':
            return 'text-list';
        case 'number':
            return 'number-list';
        case 'object':
            return 'object-list';
        default:
            return 'generic-list';
    }
}
```

## 🎨 UI Component Management

### Component Lifecycle

The renderer manages the complete lifecycle of UI components:

```typescript
class ComponentLifecycleManager {
    private components: Map<string, ComponentInfo> = new Map();
    
    public createComponent(
        fieldPath: string,
        config: ComponentConfig
    ): LabeledInputBase {
        // Create component
        const component = this.componentFactory.create(config);
        
        // Initialize component
        this.initializeComponent(component, config);
        
        // Register for lifecycle management
        this.components.set(fieldPath, {
            component,
            config,
            createdAt: Date.now(),
            status: 'active'
        });
        
        return component;
    }
    
    public destroyComponent(fieldPath: string): void {
        const info = this.components.get(fieldPath);
        if (info) {
            // Clean up component resources
            info.component.destroy?.();
            
            // Remove from DOM
            info.component.container?.remove();
            
            // Unregister
            this.components.delete(fieldPath);
        }
    }
    
    public updateComponent(fieldPath: string, newConfig: Partial<ComponentConfig>): void {
        const info = this.components.get(fieldPath);
        if (info) {
            // Update component configuration
            info.component.updateConfig?.(newConfig);
            info.config = { ...info.config, ...newConfig };
        }
    }
}
```

### Validation Integration

The renderer integrates with validation systems to provide real-time feedback:

```typescript
private setupValidation(component: LabeledInputBase, fieldConfig: any): void {
    if (fieldConfig.validation) {
        // Create validation rules
        const rules = this.validationFactory.createRules(fieldConfig.validation);
        
        // Attach validators to component
        component.setValidators(rules);
        
        // Set up real-time validation
        component.onValueChange((value) => {
            const result = this.validateField(fieldConfig, value);
            component.showValidationResult(result);
        });
    }
}
```

## 🔄 Dynamic Updates

### Reactive Field Updates

The renderer responds to reactive field changes by updating affected components:

```typescript
public updateReactiveFields(updates: Partial<MetaDataTemplateProcessed>): void {
    for (const [fieldPath, newConfig] of Object.entries(updates)) {
        const component = this.renderedComponents.get(fieldPath);
        
        if (component) {
            // Update component with new configuration
            this.updateComponentConfig(component, newConfig);
        } else {
            // Create new component if it doesn't exist
            this.renderNewField(fieldPath, newConfig);
        }
    }
}

private updateComponentConfig(component: LabeledInputBase, newConfig: any): void {
    // Update value if changed
    if (newConfig.default !== undefined) {
        component.setValue(newConfig.default);
    }
    
    // Update options for dropdown components
    if (newConfig.options && 'setOptions' in component) {
        (component as any).setOptions(newConfig.options);
    }
    
    // Update validation rules
    if (newConfig.validation) {
        const rules = this.validationFactory.createRules(newConfig.validation);
        component.setValidators(rules);
    }
}
```

### Conditional Rendering

Fields can be conditionally shown or hidden based on other field values:

```typescript
private evaluateConditionalRendering(template: MetaDataTemplateProcessed): void {
    for (const [fieldPath, fieldConfig] of Object.entries(template)) {
        if (fieldConfig.showWhen) {
            const shouldShow = this.evaluateCondition(fieldConfig.showWhen);
            this.setFieldVisibility(fieldPath, shouldShow);
        }
    }
}

private evaluateCondition(condition: ConditionalExpression): boolean {
    // Evaluate conditions like: { field: 'chemical.type', equals: 'organic' }
    const fieldValue = this.inputManager.getValue(condition.field);
    
    switch (condition.operator || 'equals') {
        case 'equals':
            return fieldValue === condition.value;
        case 'not-equals':
            return fieldValue !== condition.value;
        case 'contains':
            return Array.isArray(fieldValue) && fieldValue.includes(condition.value);
        case 'exists':
            return fieldValue !== undefined && fieldValue !== null;
        default:
            return false;
    }
}
```

## 🎛️ Configuration

### Renderer Options

```typescript
interface RendererOptions {
    layout: LayoutType;
    showLabels: boolean;
    showDescriptions: boolean;
    enableValidation: boolean;
    enableTooltips: boolean;
    compactMode: boolean;
    customCSS?: string;
}
```

### Field Configuration

```typescript
interface FieldRenderConfig {
    inputType: InputType;
    label?: string;
    description?: string;
    placeholder?: string;
    required?: boolean;
    readonly?: boolean;
    showWhen?: ConditionalExpression;
    validation?: ValidationRule[];
    layout?: {
        width?: string;
        order?: number;
        group?: string;
    };
}
```

## 🚀 Performance Optimizations

### Virtual Scrolling

For large forms, the renderer implements virtual scrolling:

```typescript
class VirtualScrollRenderer {
    private viewportHeight: number;
    private itemHeight: number;
    private visibleItems: Map<string, HTMLElement> = new Map();
    
    public renderVisibleItems(startIndex: number, endIndex: number): void {
        // Remove items outside viewport
        this.cleanupInvisibleItems(startIndex, endIndex);
        
        // Render items in viewport
        for (let i = startIndex; i <= endIndex; i++) {
            if (!this.visibleItems.has(String(i))) {
                const fieldPath = this.getFieldPathAtIndex(i);
                const component = this.renderField(fieldPath);
                this.visibleItems.set(String(i), component.container);
            }
        }
    }
}
```

### Component Pooling

Frequently created components are pooled for reuse:

```typescript
class ComponentPool {
    private pools: Map<ComponentType, LabeledInputBase[]> = new Map();
    
    public acquire(type: ComponentType): LabeledInputBase | null {
        const pool = this.pools.get(type);
        return pool && pool.length > 0 ? pool.pop()! : null;
    }
    
    public release(component: LabeledInputBase): void {
        const type = component.getType();
        component.reset();
        
        if (!this.pools.has(type)) {
            this.pools.set(type, []);
        }
        this.pools.get(type)!.push(component);
    }
}
```

### Lazy Rendering

Complex fields are rendered only when needed:

```typescript
private createLazyComponent(fieldPath: string, fieldConfig: any): HTMLElement {
    const placeholder = document.createElement('div');
    placeholder.className = 'lazy-field-placeholder';
    placeholder.dataset.fieldPath = fieldPath;
    
    // Create intersection observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.renderActualComponent(placeholder, fieldPath, fieldConfig);
                observer.unobserve(placeholder);
            }
        });
    });
    
    observer.observe(placeholder);
    return placeholder;
}
```

## 🧪 Testing

### Unit Tests

```typescript
describe('UniversalObjectRenderer', () => {
    let renderer: UniversalObjectRenderer;
    let container: HTMLElement;
    let inputManager: InputManager;
    
    beforeEach(() => {
        container = document.createElement('div');
        inputManager = new InputManager();
        renderer = new UniversalObjectRenderer(container, inputManager);
    });
    
    describe('template rendering', () => {
        it('should render simple template', () => {
            const template = {
                title: { inputType: 'text', label: 'Title' },
                description: { inputType: 'text', label: 'Description' }
            };
            
            renderer.renderTemplate(template);
            
            expect(container.children).toHaveLength(2);
            expect(container.querySelector('[data-field-path="title"]')).toBeTruthy();
            expect(container.querySelector('[data-field-path="description"]')).toBeTruthy();
        });
        
        it('should handle nested objects', () => {
            const template = {
                chemical: {
                    inputType: 'object',
                    properties: {
                        name: { inputType: 'text' },
                        formula: { inputType: 'text' }
                    }
                }
            };
            
            renderer.renderTemplate(template);
            
            expect(container.querySelector('[data-field-path="chemical.name"]')).toBeTruthy();
            expect(container.querySelector('[data-field-path="chemical.formula"]')).toBeTruthy();
        });
    });
    
    describe('component updates', () => {
        it('should update reactive fields', () => {
            const template = {
                source: { inputType: 'text' },
                derived: { inputType: 'text', default: 'derived-value' }
            };
            
            renderer.renderTemplate(template);
            
            const updates = { derived: { inputType: 'text', default: 'new-value' } };
            renderer.updateReactiveFields(updates);
            
            const derivedInput = container.querySelector('[data-field-path="derived"] input') as HTMLInputElement;
            expect(derivedInput.value).toBe('new-value');
        });
    });
});
```

### Integration Tests

```typescript
describe('UniversalObjectRenderer Integration', () => {
    it('should work with complex template and input manager', async () => {
        const template = {
            chemical: {
                inputType: 'object',
                properties: {
                    type: { inputType: 'dropdown', options: ['organic', 'inorganic'] },
                    name: { inputType: 'text' }
                }
            },
            tags: {
                inputType: 'list',
                default: {
                    type: 'function',
                    reactiveDeps: ['chemical.type'],
                    function: "({ userInput }) => [`chemical/${userInput.chemical?.type}`]"
                }
            }
        };
        
        renderer.renderTemplate(template);
        
        // Simulate user input
        const typeDropdown = container.querySelector('[data-field-path="chemical.type"] select') as HTMLSelectElement;
        typeDropdown.value = 'organic';
        typeDropdown.dispatchEvent(new Event('change'));
        
        // Wait for reactive updates
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Check that tags were updated
        const tagsInput = container.querySelector('[data-field-path="tags"] input') as HTMLInputElement;
        expect(tagsInput.value).toContain('chemical/organic');
    });
});
```

## 🐛 Error Handling

### Component Creation Errors

```typescript
private createErrorComponent(fieldPath: string, error: Error): HTMLElement {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'field-error';
    errorContainer.innerHTML = `
        <div class="field-error-message">
            <strong>Error rendering field "${fieldPath}":</strong>
            <span>${error.message}</span>
        </div>
        <button onclick="this.parentElement.parentElement.remove()">Remove</button>
    `;
    
    console.error(`Field rendering error for ${fieldPath}:`, error);
    return errorContainer;
}
```

### Graceful Degradation

```typescript
public renderTemplate(template: MetaDataTemplateProcessed): void {
    try {
        this.renderTemplateInternal(template);
    } catch (error) {
        console.error('Template rendering failed:', error);
        
        // Try to render a basic fallback form
        this.renderFallbackForm(template);
    }
}

private renderFallbackForm(template: MetaDataTemplateProcessed): void {
    // Create simple text inputs for all fields
    for (const [fieldPath, fieldConfig] of Object.entries(template)) {
        try {
            const fallbackComponent = this.componentFactory.createComponent('text-input', {
                container: this.container,
                fieldPath,
                config: { inputType: 'text', label: fieldPath }
            });
        } catch (fallbackError) {
            console.error(`Even fallback rendering failed for ${fieldPath}:`, fallbackError);
        }
    }
}
```

## 🔗 Related Documentation

- [Component Architecture](component-architecture.md) - UI component design patterns
- [Input Manager](input-manager.md) - Form state management
- [Template Manager](template-manager.md) - Template processing
- [Modal System](modal-system.md) - Dialog and modal implementations

## 📚 Examples

### Custom Layout Configuration

```typescript
const customLayoutRenderer = new UniversalObjectRenderer(container, inputManager, {
    layout: 'grid',
    showLabels: true,
    showDescriptions: true,
    enableValidation: true,
    compactMode: false
});

// Render with custom field grouping
const template = {
    // Basic info section
    title: { inputType: 'text', layout: { group: 'basic', order: 1 } },
    description: { inputType: 'text', layout: { group: 'basic', order: 2 } },
    
    // Chemical section
    formula: { inputType: 'text', layout: { group: 'chemical', order: 1 } },
    molWeight: { inputType: 'number', layout: { group: 'chemical', order: 2 } },
    
    // Advanced section (conditionally shown)
    advanced: {
        inputType: 'object',
        showWhen: { field: 'showAdvanced', equals: true },
        properties: {
            purity: { inputType: 'number' },
            supplier: { inputType: 'text' }
        }
    }
};
```

### Dynamic Component Creation

```typescript
// Custom component registration
renderer.componentFactory.registerComponent('custom-input', CustomInputComponent);

// Template using custom component
const templateWithCustom = {
    customField: {
        inputType: 'custom-input',
        config: {
            customOption1: 'value1',
            customOption2: 'value2'
        }
    }
};

renderer.renderTemplate(templateWithCustom);
```
