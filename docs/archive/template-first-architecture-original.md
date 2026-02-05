# Template-First Component Architecture Design

## Current Architecture Issues

### Complex Template Navigation
```typescript
// CURRENT: Each component navigates template paths
class UniversalObjectRenderer {
    private templateManager: TemplateManager;
    private objectTemplatePath: string;
    
    render() {
        // For each field, calculate template path and query TemplateManager
        const templatePath = this.objectTemplatePath 
            ? `${this.objectTemplatePath}.${key}`
            : key;
        const templateField = this.templateManager?.getFieldTemplate(templatePath);
        
        // Extract parameters from template field for component creation
        const inputType = templateField?.inputType || this.inferInputType(value);
        const options = templateField?.options;
        const units = templateField?.units;
        // ... many more extractions
        
        // Create component with extracted parameters
        const input = new LabeledPrimitiveInput({
            type: this.mapInputTypeToPrimitive(inputType, !!units),
            units: Array.isArray(units) ? units : undefined,
            defaultUnit: templateField?.defaultUnit,
            // ... many more parameter mappings
        });
    }
}
```

### Problems
1. **Complex Path Calculation**: Each component calculates `objectTemplatePath` vs `objectPath`
2. **Repeated Template Queries**: Multiple `getFieldTemplate()` calls for same data
3. **Parameter Extraction**: Manual extraction and mapping of template properties
4. **Template Manager Dependency**: Every component needs TemplateManager reference
5. **Function Evaluation**: Components still need to evaluate template functions

## New Template-First Architecture

### Core Concept
Instead of components querying templates, **pass processed template data directly** to each component.

### Key Benefits
1. **No Template Queries**: Components receive ready-to-use template data
2. **No Function Evaluation**: All functions already evaluated by TemplateManager
3. **Simplified Component Creation**: Template field maps directly to component constructor
4. **Self-Contained Components**: Each component has its own template definition
5. **Clear Data Flow**: Template → Component, no reverse lookups

### New Interface Design

```typescript
// NEW: Enhanced template field with processed values
export interface ProcessedTemplateField extends MetaDataTemplateFieldProcessed {
    // All function defaults already evaluated
    default?: string | number | boolean | null; // No functions, only values
    
    // All function options already evaluated  
    options?: string[]; // No functions, only final option arrays
    
    // Additional processed data
    fieldPath: string; // Full path for InputManager operations
    isDisplayed: boolean; // Pre-calculated from display/query properties
    isEditable: boolean; // Pre-calculated editability
    
    // For nested objects and lists
    nestedObjectTemplate?: ProcessedObjectTemplate; // For editableObject fields
    itemTemplate?: ProcessedObjectTemplate; // For object list fields
}

// NEW: Template data for objects
export interface ProcessedObjectTemplate {
    fields: Record<string, ProcessedTemplateField>; // All field definitions ready-to-use
    allowsNewFields: boolean; // Pre-calculated capability
    renderingMode: ObjectRenderingMode; // Pre-calculated mode
}

// NEW: Simplified UniversalObjectRenderer options
export interface UniversalObjectRendererOptions {
    container: HTMLElement;
    label: string;
    objectPath: string; // Path for InputManager operations only
    defaultValue?: Record<string, FormFieldValue>;
    inputManager: InputManager; // Required, no optional
    template: ProcessedObjectTemplate; // Pre-processed template data
    onChangeCallback?: (object: Record<string, FormFieldValue>) => void;
    app: App;
}
```

### Component Creation Flow

```typescript
// NEW: Streamlined component creation
class UniversalObjectRenderer {
    private template: ProcessedObjectTemplate;
    
    constructor(options: UniversalObjectRendererOptions) {
        this.template = options.template; // No template manager needed
    }
    
    private renderField(key: string): void {
        const templateField = this.template.fields[key]; // Direct access, no queries
        
        if (!templateField.isDisplayed) return; // Skip non-displayed fields
        
        // All component types use the same constructor pattern
        let component;
        
        switch (templateField.inputType) {
            case "dropdown":
            case "multiselect":
                component = new LabeledDropdown({
                    container: container,
                    label: key,
                    templateField: templateField, // Complete template definition
                    onValueChange: (value) => {
                        this.inputManager.setValue(`${this.objectPath}.${key}`, value);
                    }
                });
                break;
                
            case "queryDropdown":
            case "multiQueryDropdown":
                component = new QueryDropdown({
                    container: container,
                    label: key,
                    templateField: templateField, // Complete template definition
                    app: this.app,
                    onValueChange: (value) => {
                        this.inputManager.setValue(`${this.objectPath}.${key}`, value);
                    }
                });
                break;
                
            case "list":
                if (templateField.listType === "object") {
                    this.renderObjectListField(key, templateField);
                    return;
                }
                // Fall through to primitive input for primitive lists
                
            default:
                component = new LabeledPrimitiveInput({
                    container: container,
                    label: key,
                    templateField: templateField, // Complete template definition
                    onValueChange: (value) => {
                        this.inputManager.setValue(`${this.objectPath}.${key}`, value);
                    }
                });
        }
        
        // Store component reference
        this.fieldComponents.set(key, component);
    }
}
```

### Component Constructor Updates

```typescript
// NEW: Component constructors accept complete template field
export interface LabeledPrimitiveInputOptions {
    container: HTMLElement;
    label: string;
    templateField: ProcessedTemplateField; // Complete template definition
    onValueChange: (value: PrimitiveValue) => void;
    onKeyChange?: (oldKey: string, newKey: string) => void;
    onRemove?: () => void;
}

// Component extracts what it needs from templateField
class LabeledPrimitiveInput {
    constructor(options: LabeledPrimitiveInputOptions) {
        this.templateField = options.templateField;
        
        // Extract properties as needed
        this.inputType = this.templateField.inputType || "text";
        this.defaultValue = this.templateField.default;
        this.units = this.templateField.units;
        this.isEditable = this.templateField.isEditable;
        // Any other properties the component needs
    }
}
```

#### Benefits of Direct Template Field Passing
1. **No Parameter Mapping**: Parent components don't extract/map template properties
2. **Extensible Components**: Components can access new template properties without parent changes
3. **Type Safety**: Complete `ProcessedTemplateField` type ensures all properties available
4. **Consistent Interface**: All input components use same constructor pattern
5. **Future-Proof**: Adding new template properties doesn't break existing code

### Template Processing Architecture

```typescript
// TemplateManager provides processed templates
class TemplateManager {
    // NEW: Generate processed template for specific object path
    getProcessedObjectTemplate(objectPath: string): ProcessedObjectTemplate {
        const template = this.currentProcessedTemplate;
        const objectTemplate = this.navigateToPath(template, objectPath);
        
        return {
            fields: this.processAllFields(objectTemplate, objectPath),
            allowsNewFields: this.calculateAllowsNewFields(objectPath),
            renderingMode: this.calculateRenderingMode(objectPath)
        };
    }
    
    private processAllFields(objectTemplate: any, basePath: string): Record<string, ProcessedTemplateField> {
        const processedFields: Record<string, ProcessedTemplateField> = {};
        
        for (const [key, fieldDef] of Object.entries(objectTemplate)) {
            const fieldPath = `${basePath}.${key}`;
            const templateField = fieldDef as MetaDataTemplateFieldProcessed;
            
            processedFields[key] = {
                ...templateField,
                // All functions already evaluated during template processing
                default: this.getEvaluatedDefault(fieldPath), // No functions
                options: this.getEvaluatedOptions(fieldPath), // No functions
                fieldPath: fieldPath,
                isDisplayed: this.calculateIsDisplayed(templateField),
                isEditable: this.calculateIsEditable(fieldPath),
                
                // Process nested templates
                nestedObjectTemplate: templateField.inputType === "editableObject" 
                    ? this.processNestedObjectTemplate(templateField, fieldPath)
                    : undefined,
                    
                itemTemplate: templateField.inputType === "list" && templateField.listType === "object"
                    ? this.processObjectListItemTemplate(templateField, fieldPath)
                    : undefined
            };
        }
        
        return processedFields;
    }
    
    private processNestedObjectTemplate(templateField: MetaDataTemplateFieldProcessed, fieldPath: string): ProcessedObjectTemplate {
        // Process the objectTemplate for editableObject fields
        const objectTemplate = templateField.objectTemplate;
        if (!objectTemplate) {
            return { fields: {}, allowsNewFields: true, renderingMode: "editable" };
        }
        
        return {
            fields: this.processAllFields(objectTemplate, fieldPath),
            allowsNewFields: this.calculateAllowsNewFields(fieldPath),
            renderingMode: this.calculateRenderingMode(fieldPath)
        };
    }
    
    private processObjectListItemTemplate(templateField: MetaDataTemplateFieldProcessed, fieldPath: string): ProcessedObjectTemplate {
        // Process the objectTemplate for object list items
        const objectTemplate = templateField.objectTemplate || templateField.object;
        if (!objectTemplate) {
            return { fields: {}, allowsNewFields: true, renderingMode: "editable" };
        }
        
        // For list items, we process relative to the list item path (not absolute)
        return {
            fields: this.processAllFields(objectTemplate, ""), // Relative paths for list items
            allowsNewFields: true, // Object list items typically allow new fields
            renderingMode: "editable"
        };
    }
}
```

### Nested Object Handling

```typescript
// NEW: Nested objects receive their own processed templates
class UniversalObjectRenderer {
    private renderEditableObjectField(key: string): void {
        const templateField = this.template.fields[key];
        
        if (templateField.inputType !== "editableObject") return;
        
        // TemplateManager generates processed template for the nested object
        // This would be done during template processing, not at render time
        const nestedTemplate = templateField.nestedObjectTemplate as ProcessedObjectTemplate;
        
        // Create nested renderer with its own processed template
        const nestedRenderer = new UniversalObjectRenderer({
            container: container,
            label: key,
            objectPath: `${this.objectPath}.${key}`,
            defaultValue: this.getCurrentValue(key) as Record<string, FormFieldValue>,
            inputManager: this.inputManager,
            template: nestedTemplate, // Pre-processed nested template
            onChangeCallback: (nestedObj) => this.handleNestedChange(key, nestedObj),
            app: this.app
        });
    }
}
```

### Object List Architecture

```typescript
// NEW: Object list items get processed item templates
class UniversalObjectRenderer {
    private renderObjectListField(key: string): void {
        const templateField = this.template.fields[key];
        
        if (templateField.inputType !== "list" || templateField.listType !== "object") return;
        
        const listPath = `${this.objectPath}.${key}`;
        const listValue = this.getCurrentValue(key) as FormFieldValue[];
        
        // Use the pre-processed item template from the field definition
        const itemTemplate = templateField.itemTemplate!; // Already processed during template creation
        
        listValue.forEach((itemValue, index) => {
            const itemPath = `${listPath}.${index}`;
            
            // Each list item gets the pre-processed item template
            const itemRenderer = new UniversalObjectRenderer({
                container: itemContainer,
                label: `${key} ${index + 1}`,
                objectPath: itemPath,
                defaultValue: itemValue as Record<string, FormFieldValue>,
                inputManager: this.inputManager,
                template: itemTemplate, // Pre-processed item template
                onChangeCallback: (itemObj) => this.handleListItemChange(key, index, itemObj),
                app: this.app
            });
        });
    }
}
```

## Implementation Benefits

### 1. Eliminated Template Manager Dependencies
- Components no longer need TemplateManager reference
- No complex path calculations (`objectPath` vs `objectTemplatePath`)
- No repeated template queries during rendering

### 2. Simplified Component Creation
- Complete template field passed directly to component constructor
- No parameter extraction or mapping needed anywhere
- Components can access any template property without parent component changes
- All values ready-to-use (no function evaluation)

### 3. Self-Contained Components
- Each component has its own complete template definition
- No external dependencies for template data
- Clear component boundaries and responsibilities

### 4. Better Performance
- Template processing done once during initialization
- No repeated template queries during user interaction
- No function re-evaluation during rendering

### 5. Cleaner Architecture
- Clear separation: TemplateManager processes, components render
- Unidirectional data flow: Template → Component
- No reverse dependencies or circular references

## Migration Path

### Phase 1: Add Processed Template Types
1. Define `ProcessedTemplateField` and `ProcessedObjectTemplate` interfaces
2. Add `getProcessedObjectTemplate()` method to TemplateManager
3. Implement template field processing logic

### Phase 2: Update Component Constructors
1. Modify `UniversalObjectRenderer` to accept processed template
2. Update component creation to use processed field data
3. Remove template manager dependencies from components

### Phase 3: Update Template Generation
1. Modify `NewNoteModal` to generate processed templates
2. Update nested object creation to use processed templates
3. Update object list creation to use processed item templates

### Phase 4: Cleanup
1. Remove unused template path calculation logic
2. Remove template manager references from components
3. Clean up parameter extraction and mapping code

## Code Impact Summary

### Files to Modify
1. `src/types/templates.ts` - Add new processed template types
2. `src/core/templates/TemplateManager.ts` - Add template processing methods
3. `src/ui/modals/components/UniversalObjectRenderer.ts` - Accept processed templates
4. `src/ui/modals/components/LabeledPrimitiveInput.ts` - May need template field parameter
5. `src/ui/modals/NewNoteModal.ts` - Generate and pass processed templates

### Compatibility
- Maintains same external API for form creation
- Internal component architecture changes are isolated
- No changes needed to template definitions or data formats
- Existing reactive field system continues to work

This template-first architecture eliminates the complex web of template queries and path calculations, replacing it with a clean data flow where each component receives exactly the processed template data it needs to render and operate.