# Component Architecture

This document outlines the UI component design patterns, hierarchy, and architectural principles used throughout the Obsidian ELN Plugin.

## 🏗️ Architecture Overview

The plugin follows a component-based architecture with clear separation of concerns, reusability, and type safety.

```typescript
┌─────────────────────────────────────────────────────┐
│              Component Architecture                 │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │   Abstract      │  │      Component Factory     ││
│  │   Base Classes  │  │                             ││
│  └─────────────────┘  └─────────────────────────────┘│
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │   Concrete      │  │     Lifecycle Manager       ││
│  │  Components     │  │                             ││
│  └─────────────────┘  └─────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## 📍 Component Hierarchy

### Base Component Classes

```typescript
// Abstract base for all input components
export abstract class LabeledInputBase<T = any> {
    protected container: HTMLElement;
    protected fieldPath: string;
    protected inputManager: InputManager;
    protected validators: ValidationRule[];
    
    constructor(config: InputConfig<T>) {
        this.container = config.container;
        this.fieldPath = config.fieldPath;
        this.inputManager = config.inputManager;
        this.validators = config.validators || [];
        
        this.createElement();
        this.setupEventListeners();
        this.applyInitialValue(config.value);
    }
    
    // Abstract methods that concrete classes must implement
    protected abstract createElement(): void;
    protected abstract getValue(): T;
    protected abstract setValue(value: T): void;
    
    // Common functionality
    protected setupEventListeners(): void {
        // Base event handling
    }
    
    public validate(): ValidationResult {
        // Common validation logic
    }
    
    public destroy(): void {
        // Cleanup logic
    }
}
```

### Component Categories

#### 1. Primitive Input Components

Basic input types for simple data:

```typescript
// Text input component
export class LabeledTextInput extends LabeledInputBase<string> {
    private inputElement: HTMLInputElement;
    
    protected createElement(): void {
        this.container.innerHTML = `
            <div class="labeled-input text-input">
                <label class="input-label">${this.config.label}</label>
                <input type="text" class="input-field" placeholder="${this.config.placeholder || ''}" />
                <div class="validation-message"></div>
            </div>
        `;
        
        this.inputElement = this.container.querySelector('.input-field') as HTMLInputElement;
    }
    
    protected getValue(): string {
        return this.inputElement.value;
    }
    
    protected setValue(value: string): void {
        this.inputElement.value = value || '';
    }
}

// Number input component
export class LabeledNumberInput extends LabeledInputBase<number> {
    private inputElement: HTMLInputElement;
    
    protected createElement(): void {
        this.container.innerHTML = `
            <div class="labeled-input number-input">
                <label class="input-label">${this.config.label}</label>
                <input type="number" class="input-field" 
                       min="${this.config.min || ''}" 
                       max="${this.config.max || ''}" 
                       step="${this.config.step || 'any'}" />
                <div class="validation-message"></div>
            </div>
        `;
        
        this.inputElement = this.container.querySelector('.input-field') as HTMLInputElement;
    }
    
    protected getValue(): number {
        const value = parseFloat(this.inputElement.value);
        return isNaN(value) ? undefined : value;
    }
    
    protected setValue(value: number): void {
        this.inputElement.value = value?.toString() || '';
    }
}
```

#### 2. Complex Input Components

Advanced components for structured data:

```typescript
// Dropdown component with search functionality
export class QueryDropdown extends LabeledInputBase<string[]> {
    private selectElement: HTMLSelectElement;
    private searchInput: HTMLInputElement;
    private optionsContainer: HTMLElement;
    private options: DropdownOption[];
    
    protected createElement(): void {
        this.container.innerHTML = `
            <div class="labeled-input query-dropdown">
                <label class="input-label">${this.config.label}</label>
                <div class="dropdown-container">
                    <input type="text" class="search-input" placeholder="Search options..." />
                    <div class="options-container">
                        <!-- Options populated dynamically -->
                    </div>
                </div>
                <div class="selected-values"></div>
                <div class="validation-message"></div>
            </div>
        `;
        
        this.searchInput = this.container.querySelector('.search-input') as HTMLInputElement;
        this.optionsContainer = this.container.querySelector('.options-container') as HTMLElement;
        
        this.setupSearchFunctionality();
        this.populateOptions();
    }
    
    private setupSearchFunctionality(): void {
        this.searchInput.addEventListener('input', () => {
            const searchTerm = this.searchInput.value.toLowerCase();
            this.filterOptions(searchTerm);
        });
    }
    
    private filterOptions(searchTerm: string): void {
        const filteredOptions = this.options.filter(option => 
            option.label.toLowerCase().includes(searchTerm) ||
            option.value.toLowerCase().includes(searchTerm)
        );
        this.renderOptions(filteredOptions);
    }
    
    protected getValue(): string[] {
        return this.selectedValues;
    }
    
    protected setValue(value: string[]): void {
        this.selectedValues = value || [];
        this.updateSelectedDisplay();
    }
}

// Object list component for arrays of complex objects
export class ObjectListInput extends LabeledInputBase<object[]> {
    private items: object[];
    private itemTemplate: ObjectTemplate;
    private addButton: HTMLButtonElement;
    private itemsContainer: HTMLElement;
    
    protected createElement(): void {
        this.container.innerHTML = `
            <div class="labeled-input object-list">
                <label class="input-label">${this.config.label}</label>
                <div class="list-container">
                    <div class="items-container"></div>
                    <button class="add-item-button">Add Item</button>
                </div>
                <div class="validation-message"></div>
            </div>
        `;
        
        this.itemsContainer = this.container.querySelector('.items-container') as HTMLElement;
        this.addButton = this.container.querySelector('.add-item-button') as HTMLButtonElement;
        
        this.setupAddButton();
    }
    
    private setupAddButton(): void {
        this.addButton.addEventListener('click', () => {
            this.addNewItem();
        });
    }
    
    private addNewItem(): void {
        const newItem = this.createDefaultItem();
        this.items.push(newItem);
        this.renderItem(newItem, this.items.length - 1);
        this.notifyChange();
    }
    
    private renderItem(item: object, index: number): void {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'list-item';
        itemContainer.dataset.index = index.toString();
        
        // Render object fields using Universal Object Renderer
        const renderer = new UniversalObjectRenderer(itemContainer, this.inputManager);
        renderer.renderTemplate(this.itemTemplate);
        
        // Add remove button
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => this.removeItem(index));
        itemContainer.appendChild(removeButton);
        
        this.itemsContainer.appendChild(itemContainer);
    }
}
```

## 🎛️ Component Factory Pattern

### Factory Implementation

The Component Factory creates appropriate components based on configuration:

```typescript
export class ComponentFactory {
    private componentRegistry: Map<string, ComponentConstructor>;
    
    constructor() {
        this.componentRegistry = new Map();
        this.registerBuiltinComponents();
    }
    
    /**
     * Creates a component based on input type and configuration
     */
    public createComponent(
        inputType: InputType,
        config: ComponentConfig
    ): LabeledInputBase {
        const ComponentClass = this.getComponentClass(inputType, config);
        return new ComponentClass(config);
    }
    
    private getComponentClass(inputType: InputType, config: ComponentConfig): ComponentConstructor {
        // Handle special cases first
        if (inputType === 'list' && config.userInputs?.length > 0) {
            return QueryDropdown;
        }
        
        if (inputType === 'list' && config.listType === 'object') {
            return ObjectListInput;
        }
        
        // Standard component mapping
        const componentClass = this.componentRegistry.get(inputType);
        if (componentClass) {
            return componentClass;
        }
        
        console.warn(`Unknown input type: ${inputType}, falling back to text input`);
        return LabeledTextInput;
    }
    
    /**
     * Registers built-in component types
     */
    private registerBuiltinComponents(): void {
        this.componentRegistry.set('text', LabeledTextInput);
        this.componentRegistry.set('number', LabeledNumberInput);
        this.componentRegistry.set('date', LabeledDateInput);
        this.componentRegistry.set('dropdown', LabeledDropdown);
        this.componentRegistry.set('boolean', LabeledCheckbox);
        this.componentRegistry.set('textarea', LabeledTextarea);
        this.componentRegistry.set('list', ListInput);
        this.componentRegistry.set('object', ObjectRenderer);
    }
    
    /**
     * Registers a custom component type
     */
    public registerComponent(inputType: string, componentClass: ComponentConstructor): void {
        this.componentRegistry.set(inputType, componentClass);
    }
}
```

### Component Registration

Custom components can be registered with the factory:

```typescript
// Custom component example
export class CustomSliderInput extends LabeledInputBase<number> {
    private sliderElement: HTMLInputElement;
    private valueDisplay: HTMLSpanElement;
    
    protected createElement(): void {
        this.container.innerHTML = `
            <div class="labeled-input slider-input">
                <label class="input-label">${this.config.label}</label>
                <div class="slider-container">
                    <input type="range" class="slider" 
                           min="${this.config.min || 0}" 
                           max="${this.config.max || 100}" 
                           step="${this.config.step || 1}" />
                    <span class="value-display">0</span>
                </div>
                <div class="validation-message"></div>
            </div>
        `;
        
        this.sliderElement = this.container.querySelector('.slider') as HTMLInputElement;
        this.valueDisplay = this.container.querySelector('.value-display') as HTMLSpanElement;
        
        this.sliderElement.addEventListener('input', () => {
            this.updateValueDisplay();
            this.notifyChange();
        });
    }
    
    private updateValueDisplay(): void {
        this.valueDisplay.textContent = this.sliderElement.value;
    }
    
    protected getValue(): number {
        return parseInt(this.sliderElement.value);
    }
    
    protected setValue(value: number): void {
        this.sliderElement.value = value?.toString() || '0';
        this.updateValueDisplay();
    }
}

// Register the custom component
componentFactory.registerComponent('slider', CustomSliderInput);
```

## 🔄 Component Lifecycle

### Lifecycle Phases

```typescript
export class ComponentLifecycleManager {
    private components: Map<string, ComponentInfo> = new Map();
    
    /**
     * Creates and initializes a component
     */
    public createComponent(config: ComponentConfig): LabeledInputBase {
        // 1. Creation phase
        const component = this.componentFactory.createComponent(config.inputType, config);
        
        // 2. Registration phase
        this.registerComponent(config.fieldPath, component, config);
        
        // 3. Initialization phase
        this.initializeComponent(component, config);
        
        // 4. Activation phase
        this.activateComponent(component);
        
        return component;
    }
    
    private initializeComponent(component: LabeledInputBase, config: ComponentConfig): void {
        // Set initial value
        if (config.value !== undefined) {
            component.setValue(config.value);
        }
        
        // Setup validation
        if (config.validation) {
            component.setValidators(config.validation);
        }
        
        // Setup change listeners
        component.onValueChange((value) => {
            this.handleComponentChange(component, value);
        });
        
        // Setup reactive dependencies
        if (config.reactiveDeps) {
            this.setupReactiveDependencies(component, config.reactiveDeps);
        }
    }
    
    /**
     * Destroys a component and cleans up resources
     */
    public destroyComponent(fieldPath: string): void {
        const info = this.components.get(fieldPath);
        if (!info) return;
        
        // 1. Deactivation phase
        this.deactivateComponent(info.component);
        
        // 2. Cleanup phase
        this.cleanupComponent(info.component);
        
        // 3. Destruction phase
        info.component.destroy();
        
        // 4. Unregistration phase
        this.components.delete(fieldPath);
    }
    
    private cleanupComponent(component: LabeledInputBase): void {
        // Remove event listeners
        component.removeAllListeners();
        
        // Clear reactive dependencies
        this.clearReactiveDependencies(component);
        
        // Remove from DOM
        component.container?.remove();
    }
}
```

## 🎨 Styling Architecture

### CSS Class Conventions

Components follow a consistent CSS class naming convention:

```css
/* Base component classes */
.labeled-input {
    /* Common input container styles */
}

.labeled-input .input-label {
    /* Label styling */
}

.labeled-input .input-field {
    /* Input field styling */
}

.labeled-input .validation-message {
    /* Validation message styling */
}

/* Component-specific classes */
.labeled-input.text-input {
    /* Text input specific styles */
}

.labeled-input.number-input {
    /* Number input specific styles */
}

.labeled-input.query-dropdown {
    /* Dropdown specific styles */
}

/* State classes */
.labeled-input.invalid {
    /* Invalid state styling */
}

.labeled-input.disabled {
    /* Disabled state styling */
}

.labeled-input.focused {
    /* Focused state styling */
}
```

### Component Themes

Components support theming through CSS custom properties:

```css
.labeled-input {
    --input-border-color: var(--border-color, #ccc);
    --input-background: var(--background-primary, #fff);
    --input-text-color: var(--text-normal, #000);
    --input-focus-color: var(--accent-color, #007acc);
    --input-error-color: var(--text-error, #ff6b6b);
}

.labeled-input .input-field {
    border: 1px solid var(--input-border-color);
    background: var(--input-background);
    color: var(--input-text-color);
}

.labeled-input .input-field:focus {
    border-color: var(--input-focus-color);
}

.labeled-input.invalid .input-field {
    border-color: var(--input-error-color);
}
```

## 🧩 Extension Patterns

### Creating Custom Components

To create a custom component, extend the base class:

```typescript
// 1. Define the component class
export class CustomDateTimeInput extends LabeledInputBase<Date> {
    private dateInput: HTMLInputElement;
    private timeInput: HTMLInputElement;
    
    protected createElement(): void {
        this.container.innerHTML = `
            <div class="labeled-input datetime-input">
                <label class="input-label">${this.config.label}</label>
                <div class="datetime-container">
                    <input type="date" class="date-input" />
                    <input type="time" class="time-input" />
                </div>
                <div class="validation-message"></div>
            </div>
        `;
        
        this.dateInput = this.container.querySelector('.date-input') as HTMLInputElement;
        this.timeInput = this.container.querySelector('.time-input') as HTMLInputElement;
        
        this.setupEventListeners();
    }
    
    protected setupEventListeners(): void {
        super.setupEventListeners();
        
        [this.dateInput, this.timeInput].forEach(input => {
            input.addEventListener('change', () => {
                this.notifyChange();
            });
        });
    }
    
    protected getValue(): Date {
        const dateValue = this.dateInput.value;
        const timeValue = this.timeInput.value;
        
        if (!dateValue) return undefined;
        
        const dateTime = timeValue ? `${dateValue}T${timeValue}` : dateValue;
        return new Date(dateTime);
    }
    
    protected setValue(value: Date): void {
        if (!value) {
            this.dateInput.value = '';
            this.timeInput.value = '';
            return;
        }
        
        this.dateInput.value = value.toISOString().split('T')[0];
        this.timeInput.value = value.toTimeString().slice(0, 5);
    }
}

// 2. Register with the factory
componentFactory.registerComponent('datetime', CustomDateTimeInput);
```

### Component Composition

Complex components can be composed from simpler ones:

```typescript
export class AddressInput extends LabeledInputBase<Address> {
    private streetInput: LabeledTextInput;
    private cityInput: LabeledTextInput;
    private stateInput: LabeledDropdown;
    private zipInput: LabeledTextInput;
    
    protected createElement(): void {
        this.container.innerHTML = `
            <div class="labeled-input address-input">
                <label class="input-label">${this.config.label}</label>
                <div class="address-container">
                    <div class="street-container"></div>
                    <div class="city-state-container">
                        <div class="city-container"></div>
                        <div class="state-container"></div>
                    </div>
                    <div class="zip-container"></div>
                </div>
                <div class="validation-message"></div>
            </div>
        `;
        
        // Create sub-components
        this.streetInput = new LabeledTextInput({
            container: this.container.querySelector('.street-container'),
            fieldPath: `${this.fieldPath}.street`,
            label: 'Street',
            inputManager: this.inputManager
        });
        
        this.cityInput = new LabeledTextInput({
            container: this.container.querySelector('.city-container'),
            fieldPath: `${this.fieldPath}.city`,
            label: 'City',
            inputManager: this.inputManager
        });
        
        // Setup change propagation
        this.setupSubComponentListeners();
    }
    
    private setupSubComponentListeners(): void {
        [this.streetInput, this.cityInput, this.stateInput, this.zipInput].forEach(input => {
            input.onValueChange(() => {
                this.notifyChange();
            });
        });
    }
    
    protected getValue(): Address {
        return {
            street: this.streetInput.getValue(),
            city: this.cityInput.getValue(),
            state: this.stateInput.getValue(),
            zip: this.zipInput.getValue()
        };
    }
    
    protected setValue(value: Address): void {
        if (!value) return;
        
        this.streetInput.setValue(value.street);
        this.cityInput.setValue(value.city);
        this.stateInput.setValue(value.state);
        this.zipInput.setValue(value.zip);
    }
}
```

## 🧪 Testing Components

### Unit Testing Framework

```typescript
describe('LabeledTextInput', () => {
    let component: LabeledTextInput;
    let container: HTMLElement;
    let inputManager: InputManager;
    
    beforeEach(() => {
        container = document.createElement('div');
        inputManager = new InputManager();
        
        component = new LabeledTextInput({
            container,
            fieldPath: 'test.field',
            label: 'Test Field',
            inputManager
        });
    });
    
    afterEach(() => {
        component.destroy();
    });
    
    describe('initialization', () => {
        it('should create DOM structure', () => {
            expect(container.querySelector('.labeled-input')).toBeTruthy();
            expect(container.querySelector('.input-label')).toBeTruthy();
            expect(container.querySelector('.input-field')).toBeTruthy();
        });
        
        it('should set label text', () => {
            const label = container.querySelector('.input-label');
            expect(label.textContent).toBe('Test Field');
        });
    });
    
    describe('value management', () => {
        it('should set and get values', () => {
            component.setValue('test value');
            expect(component.getValue()).toBe('test value');
        });
        
        it('should update input element', () => {
            component.setValue('test value');
            const input = container.querySelector('.input-field') as HTMLInputElement;
            expect(input.value).toBe('test value');
        });
    });
    
    describe('events', () => {
        it('should notify on value change', () => {
            const callback = jest.fn();
            component.onValueChange(callback);
            
            const input = container.querySelector('.input-field') as HTMLInputElement;
            input.value = 'new value';
            input.dispatchEvent(new Event('input'));
            
            expect(callback).toHaveBeenCalledWith('new value');
        });
    });
});
```

### Integration Testing

```typescript
describe('Component Integration', () => {
    let renderer: UniversalObjectRenderer;
    let inputManager: InputManager;
    
    beforeEach(() => {
        inputManager = new InputManager();
        renderer = new UniversalObjectRenderer(container, inputManager);
    });
    
    it('should create components from template', () => {
        const template = {
            name: { inputType: 'text', label: 'Name' },
            age: { inputType: 'number', label: 'Age' },
            email: { inputType: 'text', label: 'Email' }
        };
        
        renderer.renderTemplate(template);
        
        expect(container.querySelectorAll('.labeled-input')).toHaveLength(3);
        expect(container.querySelector('[data-field-path="name"]')).toBeTruthy();
        expect(container.querySelector('[data-field-path="age"]')).toBeTruthy();
        expect(container.querySelector('[data-field-path="email"]')).toBeTruthy();
    });
    
    it('should handle component interactions', () => {
        const template = {
            firstName: { inputType: 'text', label: 'First Name' },
            lastName: { inputType: 'text', label: 'Last Name' },
            fullName: {
                inputType: 'text',
                label: 'Full Name',
                default: {
                    type: 'function',
                    reactiveDeps: ['firstName', 'lastName'],
                    function: "({ userInput }) => `${userInput.firstName || ''} ${userInput.lastName || ''}`.trim()"
                }
            }
        };
        
        renderer.renderTemplate(template);
        
        // Set first name
        inputManager.setValue('firstName', 'John');
        inputManager.setValue('lastName', 'Doe');
        
        // Check that full name was updated
        expect(inputManager.getValue('fullName')).toBe('John Doe');
    });
});
```

## 🔗 Related Documentation

- [Universal Object Renderer](universal-renderer.md) - Main form rendering engine
- [Input Manager](input-manager.md) - Form state management
- [Modal System](modal-system.md) - Dialog and modal implementations
- [CSS Architecture](css-architecture.md) - Modular CSS system

## 📚 Examples

### Complete Custom Component Example

```typescript
// Custom component for chemical formula input with validation
export class ChemicalFormulaInput extends LabeledInputBase<ChemicalFormula> {
    private formulaInput: HTMLInputElement;
    private previewContainer: HTMLElement;
    private elementsDisplay: HTMLElement;
    
    protected createElement(): void {
        this.container.innerHTML = `
            <div class="labeled-input chemical-formula-input">
                <label class="input-label">${this.config.label}</label>
                <div class="formula-container">
                    <input type="text" class="formula-input" placeholder="e.g., C6H6" />
                    <div class="formula-preview">
                        <div class="elements-display"></div>
                        <div class="molecular-weight"></div>
                    </div>
                </div>
                <div class="validation-message"></div>
            </div>
        `;
        
        this.formulaInput = this.container.querySelector('.formula-input') as HTMLInputElement;
        this.previewContainer = this.container.querySelector('.formula-preview') as HTMLElement;
        this.elementsDisplay = this.container.querySelector('.elements-display') as HTMLElement;
        
        this.setupFormulaValidation();
    }
    
    private setupFormulaValidation(): void {
        this.formulaInput.addEventListener('input', () => {
            const formula = this.formulaInput.value;
            const parsed = this.parseFormula(formula);
            
            if (parsed.isValid) {
                this.updatePreview(parsed);
                this.clearValidationError();
            } else {
                this.showValidationError(parsed.error);
            }
            
            this.notifyChange();
        });
    }
    
    private parseFormula(formula: string): FormulaParseResult {
        // Chemical formula parsing logic
        try {
            const elements = this.extractElements(formula);
            const molecularWeight = this.calculateMolecularWeight(elements);
            
            return {
                isValid: true,
                elements,
                molecularWeight,
                formula
            };
        } catch (error) {
            return {
                isValid: false,
                error: error.message
            };
        }
    }
    
    protected getValue(): ChemicalFormula {
        const formula = this.formulaInput.value;
        const parsed = this.parseFormula(formula);
        
        return {
            formula,
            elements: parsed.elements || {},
            molecularWeight: parsed.molecularWeight || 0,
            isValid: parsed.isValid
        };
    }
    
    protected setValue(value: ChemicalFormula): void {
        if (!value) {
            this.formulaInput.value = '';
            this.clearPreview();
            return;
        }
        
        this.formulaInput.value = value.formula;
        if (value.isValid) {
            this.updatePreview(value);
        }
    }
}
```

This comprehensive component architecture provides a solid foundation for building maintainable, reusable, and extensible UI components throughout the Obsidian ELN Plugin.
