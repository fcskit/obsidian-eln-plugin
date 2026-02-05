# Template Processing Workflow - Detailed Implementation

## Overview

This document provides a comprehensive walkthrough of the TemplateManager's template processing workflow, including concrete examples, class variables, and method implementations. It demonstrates how base templates and subclass templates are processed, merged, and prepared for form generation.

## TemplateManager Class Structure

### Key Class Variables

```typescript
export class TemplateManager {
    // Template Storage
    private originalBaseTemplate: Record<string, unknown>; // Immutable base template
    private currentProcessedTemplate: Record<string, unknown>; // Active working template
    private availableSubclasses: Record<string, Record<string, unknown>>; // Loaded subclass templates
    
    // Data Management
    private initialMetadata: Record<string, FormFieldValue>; // Default values structure
    private reactiveFieldMap: Map<string, ReactiveFieldConfig>; // Reactive field dependencies
    
    // Processing State
    private templatePath: string; // Path to base template file
    private currentSubclass: string | null; // Currently applied subclass
    private isProcessed: boolean; // Processing completion flag
    
    // Dependencies
    private plugin: ElnPlugin;
    private logger = createLogger('template');
}
```

### Core Method Signatures

```typescript
export class TemplateManager {
    // Template Loading and Processing
    async loadBaseTemplate(templatePath: string): Promise<void>
    async loadSubclassTemplate(subclassName: string): Promise<Record<string, unknown>>
    private mergeTemplates(base: Record<string, unknown>, subclass: Record<string, unknown>): Record<string, unknown>
    
    // Function Processing
    private processNonReactiveFunctions(template: Record<string, unknown>): Promise<Record<string, unknown>>
    private identifyReactiveFields(template: Record<string, unknown>): void
    private evaluateReactiveFields(context: Record<string, FormFieldValue>): Promise<void>
    
    // Data Management
    private createInitialMetadata(template: Record<string, unknown>): Record<string, FormFieldValue>
    async getFormDataForSubclassChange(): Promise<Record<string, FormFieldValue>>
    getCurrentTemplate(): Record<string, unknown>
}
```

## Example Templates

### Base Template Example

```typescript
// Base template structure (loaded from plugin settings)
{
  "ELN version": {
    "display": false, // Whether to show input field in modal
    "inputType": "text",
    "default": {
      "type": "function",
      "value": "this.manifest.version"
    }
  },
  "date created": {
    "display": false,
    "inputType": "date",
    "default": {
      "type": "function",
      "value": "new Date().toISOString().split('T')[0]"
    }
  },
  "author": {
    "display": true,
    "inputType": "dropdown",
    "options": {
      "type": "function",
      "value": "this.settings.authors.map(author => author.name)"
    }
  },
  "chemical": {
    "name": {
      "display": true,
      "inputType": "text",
      "default": ""
    },
    "chemtype": {
      "display": true,
      "inputType": "subclass",
      "options": ["electrolyte", "polymer", "solvent", "metal"],
      "default": "electrolyte"
    },
    "properties": {
      "molecular_weight": {
        "display": true,
        "inputType": "number",
        "units": ["g/mol"],
        "defaultUnit": "g/mol",
        "default": 0 // Use 0 instead of null for processFrontmatter compatibility
      }
    }
  }
}
```

### Subclass Template Example

```typescript
// Subclass template structure (TypeScript export from chemtypes folder)
export const electrolyteSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "chemical.properties.composition.solvents",
      "input": {
        "display": true,
        "inputType": "list",
        "listType": "object",
        "initialItems": 1,
        "objectTemplate": {
          "name": {
            "inputType": "text",
            "placeholder": "Enter solvent name...",
            "default": ""
          },
          "volume fraction": {
            "inputType": "text", 
            "placeholder": "Enter solvent volume fraction...",
            "default": ""
          }
        }
      }
    },
    {
      "fullKey": "chemical.properties.composition.salts",
      "input": {
        "display": true,
        "inputType": "list",
        "listType": "object",
        "initialItems": 1,
        "objectTemplate": {
          "name": {
            "inputType": "text",
            "placeholder": "Enter salt name...",
            "default": ""
          },
          "concentration": {
            "inputType": "number",
            "units": ["M", "mM", "μM"],
            "defaultUnit": "M",
            "default": 0 // Use 0 instead of null for processFrontmatter compatibility
          }
        }
      }
    },
    {
      "fullKey": "chemical.properties.composition.molarity",
      "input": {
        "display": true,
        "inputType": "number",
        "units": ["M"],
        "defaultUnit": "M",
        "default": {
          "type": "function",
          "reactive": true,
          "dependencies": ["chemical.properties.composition.solvents", "chemical.properties.composition.salts"],
          "value": "(data) => { const solvents = data['chemical.properties.composition.solvents'] || []; const salts = data['chemical.properties.composition.salts'] || []; return (solvents.reduce((sum, s) => sum + (s.concentration || 0), 0) + salts.reduce((sum, s) => sum + (s.concentration || 0), 0)); }"
        }
      }
    }
  ]
}
```

## Detailed Workflow Implementation

### Step 1: Base Template Loading

```typescript
async loadBaseTemplate(templatePath: string): Promise<void> {
    this.logger.debug('Loading base template:', templatePath);
    
    // Load template file
    const templateContent = await this.plugin.app.vault.adapter.read(templatePath);
    const baseTemplate = JSON.parse(templateContent);
    
    // Store original base template (immutable)
    this.originalBaseTemplate = this.deepCopy(baseTemplate);
    this.templatePath = templatePath;
    
    this.logger.debug('Base template loaded:', {
        name: baseTemplate.name,
        fields: Object.keys(baseTemplate.fields || {})
    });
}
```

**State after Step 1:**
```typescript
// originalBaseTemplate contains:
{
  "ELN version": {
    "display": false,
    "inputType": "text",
    "default": {
      "type": "function",
      "value": "this.manifest.version"
    }
  },
  "date created": {
    "display": false,
    "inputType": "date", 
    "default": {
      "type": "function",
      "value": "new Date().toISOString().split('T')[0]"
    }
  },
  "author": {
    "display": true,
    "inputType": "dropdown",
    "options": {
      "type": "function",
      "value": "this.settings.authors.map(author => author.name)"
    }
  },
  "chemical": {
    "name": {
      "display": true,
      "inputType": "text",
      "default": ""
    },
    "chemtype": {
      "display": true,
      "inputType": "subclass",
      "options": ["electrolyte", "polymer", "solvent", "metal"],
      "default": "electrolyte"
    },
    "properties": {
      "molecular_weight": {
        "display": true,
        "inputType": "number",
        "units": ["g/mol"],
        "defaultUnit": "g/mol",
        "default": null
      }
    }
  }
}
```

### Step 2: Deep Copy Creation

```typescript
private processTemplate(): void {
    // Create working copy that will be modified
    this.currentProcessedTemplate = this.deepCopy(this.originalBaseTemplate);
    
    this.logger.debug('Created working template copy');
}
```

### Step 3-4: Subclass Detection and Application

```typescript
private async applyDefaultSubclass(): Promise<void> {
    // Check for subclass field
    const subclassField = this.findSubclassField(this.currentProcessedTemplate);
    
    if (subclassField) {
        const defaultSubclass = subclassField.default || subclassField.options[0];
        this.logger.debug('Found subclass field with default:', defaultSubclass);
        
        // Load default subclass template
        const subclassTemplate = await this.loadSubclassTemplate(defaultSubclass);
        
        // Merge with working template
        this.currentProcessedTemplate = this.mergeTemplates(
            this.currentProcessedTemplate, 
            subclassTemplate
        );
        
        this.currentSubclass = defaultSubclass;
        
        this.logger.debug('Applied default subclass template:', {
            subclass: defaultSubclass,
            newFields: Object.keys(subclassTemplate.fields || {})
        });
    }
}

private mergeTemplates(base: Record<string, unknown>, subclass: Record<string, unknown>): Record<string, unknown> {
    const merged = this.deepCopy(base);
    const subclassFields = subclass.fields as Record<string, unknown> || {};
    
    // Merge fields
    merged.fields = {
        ...merged.fields,
        ...subclassFields
    };
    
    return merged;
}
```

**State after Steps 3-4:**
```typescript
// currentProcessedTemplate now contains merged fields from base + electrolyte subclass:
{
  "ELN version": {
    "display": false,
    "inputType": "text",
    "default": {
      "type": "function", 
      "value": "this.manifest.version"
    }
  },
  "date created": {
    "display": false,
    "inputType": "date",
    "default": {
      "type": "function",
      "value": "new Date().toISOString().split('T')[0]"
    }
  },
  "author": {
    "display": true,
    "inputType": "dropdown",
    "options": {
      "type": "function",
      "value": "this.settings.authors.map(author => author.name)"
    }
  },
  "chemical": {
    "name": {
      "display": true,
      "inputType": "text",
      "default": ""
    },
    "chemtype": {
      "display": true,
      "inputType": "subclass",
      "options": ["electrolyte", "polymer", "solvent", "metal"],
      "default": "electrolyte"
    },
    "properties": {
      "molecular_weight": {
        "display": true,
        "inputType": "number",
        "units": ["g/mol"],
        "defaultUnit": "g/mol",
        "default": null
      },
      // --- Added by electrolyte subclass ---
      "composition": {
        "solvents": {
          "display": true,
          "inputType": "list",
          "listType": "object",
          "initialItems": 1,
          "objectTemplate": {
            "name": {
              "inputType": "text",
              "placeholder": "Enter solvent name...",
              "default": ""
            },
            "volume fraction": {
              "inputType": "text",
              "placeholder": "Enter solvent volume fraction...",
              "default": ""
            }
          }
        },
        "salts": {
          "display": true,
          "inputType": "list",
          "listType": "object", 
          "initialItems": 1,
          "objectTemplate": {
            "name": {
              "inputType": "text",
              "placeholder": "Enter salt name...",
              "default": ""
            },
            "concentration": {
              "inputType": "number",
              "units": ["M", "mM", "μM"],
              "defaultUnit": "M",
              "default": null
            }
          }
        },
        "molarity": {
          "display": true,
          "inputType": "number",
          "units": ["M"],
          "defaultUnit": "M",
          "default": {
            "type": "function",
            "reactive": true,
            "dependencies": ["chemical.properties.composition.solvents", "chemical.properties.composition.salts"],
            "value": "(data) => { /* molarity calculation function */ }"
          }
        }
      }
    }
  }
}
}
```

### Step 5: Non-Reactive Function Processing

```typescript
private async processNonReactiveFunctions(template: Record<string, unknown>): Promise<Record<string, unknown>> {
    const processed = this.deepCopy(template);
    
    await this.processFieldsRecursively(processed.fields as Record<string, unknown>, async (field: Record<string, unknown>) => {
        // Process default values
        if (field.default && typeof field.default === 'object' && field.default.type === 'function') {
            const funcConfig = field.default as FunctionConfig;
            
            if (!funcConfig.reactive) {
                // Evaluate non-reactive function
                const result = await this.evaluateFunction(funcConfig.function as string, {});
                
                this.logger.debug('Evaluated non-reactive default:', {
                    field: field.label,
                    function: funcConfig.function,
                    result: result
                });
                
                // Replace function with evaluated value
                field.default = result;
            }
        }
        
        // Process dropdown options functions
        if (field.options && typeof field.options === 'object' && field.options.type === 'function') {
            const funcConfig = field.options as FunctionConfig;
            
            if (!funcConfig.reactive) {
                const result = await this.evaluateFunction(funcConfig.function as string, {});
                field.options = result;
            }
        }
    });
    
    return processed;
}
```

**State after Step 5:**
```typescript
// Non-reactive functions have been evaluated and replaced:
{
  "ELN version": {
    "display": false,
    "inputType": "text",
    "default": "0.7.0" // Function evaluated: this.manifest.version
  },
  "date created": {
    "display": false,
    "inputType": "date",
    "default": "2025-09-16" // Function evaluated: new Date().toISOString().split('T')[0]
  },
  "author": {
    "display": true,
    "inputType": "dropdown",
    "options": ["Dr. Smith", "Dr. Johnson", "Dr. Brown"] // Function evaluated: this.settings.authors.map(...)
  },
  "chemical": {
    "name": {
      "display": true,
      "inputType": "text", 
      "default": ""
    },
    "chemtype": {
      "display": true,
      "inputType": "subclass",
      "options": ["electrolyte", "polymer", "solvent", "metal"],
      "default": "electrolyte"
    },
    "properties": {
      "molecular_weight": {
        "display": true,
        "inputType": "number",
        "units": ["g/mol"],
        "defaultUnit": "g/mol",
        "default": null
      },
      "composition": {
        "solvents": { /* unchanged - no functions */ },
        "salts": { /* unchanged - no functions */ },
        "molarity": {
          "display": true,
          "inputType": "number",
          "units": ["M"],
          "defaultUnit": "M",
          "default": {
            // Reactive function still present - not evaluated yet
            "type": "function",
            "reactive": true,
            "dependencies": ["chemical.properties.composition.solvents", "chemical.properties.composition.salts"],
            "value": "(data) => { /* molarity calculation function */ }"
          }
        }
      }
    }
  }
}
```

### Step 6: Initial Metadata Creation

```typescript
private extractDefaultValuesFromTemplate(template: MetaDataTemplateProcessed, parentKey = "", depth = 0): FormData {
    const result: FormData = {};
    
    this.processFieldsRecursively(template.fields as Record<string, unknown>, (field: Record<string, unknown>, path: string) => {
        if (field.default !== undefined && typeof field.default !== 'object') {
            // Store evaluated default values
            // CRITICAL: Never store undefined or null - use proper defaults for processFrontmatter compatibility
            let defaultValue = field.default as FormFieldValue;
            
            // Ensure no undefined/null values that would be ignored by Obsidian's processFrontmatter
            if (defaultValue === undefined || defaultValue === null) {
                if (field.inputType === 'number') {
                    defaultValue = 0;
                } else if (field.inputType === 'list') {
                    defaultValue = [];
                } else {
                    defaultValue = '';
                }
            }
            
            metadata[path] = defaultValue;
            
            this.logger.debug('Added default value to metadata:', {
                path: path,
                value: defaultValue
            });
        }
        
        // Handle list fields with initialItems
        if (field.inputType === 'list' && field.listType === 'object' && field.initialItems) {
            const initialItems = field.initialItems as number;
            const objectTemplate = field.objectTemplate as Record<string, unknown>;
            
            const listData: Record<string, FormFieldValue>[] = [];
            for (let i = 0; i < initialItems; i++) {
                const itemData = this.createDefaultObjectFromTemplate(objectTemplate);
                listData.push(itemData);
            }
            
            metadata[path] = listData;
            
            this.logger.debug('Created initial list items:', {
                path: path,
                itemCount: initialItems,
                listData: listData
            });
        }
    });
    
    return metadata;
}
```

**State after Step 6:**
```typescript
// initialMetadata contains evaluated default values:
{
  "ELN version": "0.7.0",
  "date created": "2025-09-16", 
  "author": "", // Empty string instead of undefined - user will select from dropdown
  "chemical.name": "",
  "chemical.chemtype": "electrolyte",
  "chemical.properties.molecular_weight": 0, // Default number instead of null
  "chemical.properties.composition.solvents": [
    {
      "name": "",
      "volume fraction": ""
    }
  ],
  "chemical.properties.composition.salts": [
    {
      "name": "",
      "concentration": 0 // Default number instead of null
    }
  ]
  // Note: molarity not included yet - will be calculated reactively
}
```

### Step 7: Reactive Field Identification

```typescript
private identifyReactiveFields(template: Record<string, unknown>): void {
    this.reactiveFieldMap.clear();
    
    this.processFieldsRecursively(template.fields as Record<string, unknown>, (field: Record<string, unknown>, path: string) => {
        if (field.default && typeof field.default === 'object' && field.default.type === 'function') {
            const funcConfig = field.default as FunctionConfig;
            
            if (funcConfig.reactive) {
                const reactiveConfig: ReactiveFieldConfig = {
                    path: path,
                    dependencies: funcConfig.dependencies || [],
                    function: funcConfig.function as string,
                    field: field
                };
                
                this.reactiveFieldMap.set(path, reactiveConfig);
                
                this.logger.debug('Identified reactive field:', {
                    path: path,
                    dependencies: reactiveConfig.dependencies
                });
            }
        }
    });
    
    // Build dependency graph for proper evaluation order
    this.buildDependencyGraph();
}
```

**State after Step 7:**
```typescript
// reactiveFieldMap contains:
Map {
  "chemical.properties.composition.molarity" => {
    path: "chemical.properties.composition.molarity",
    dependencies: ["chemical.properties.composition.solvents", "chemical.properties.composition.salts"],
    function: "(data) => { const solvents = data['chemical.properties.composition.solvents'] || []; const salts = data['chemical.properties.composition.salts'] || []; return (solvents.reduce((sum, s) => sum + (s.concentration || 0), 0) + salts.reduce((sum, s) => sum + (s.concentration || 0), 0)); }",
    field: {
      "display": true,
      "inputType": "number",
      "units": ["M"],
      "defaultUnit": "M"
    }
  }
}
```

### Step 8: Reactive Field Evaluation

```typescript
private async evaluateReactiveFields(context: Record<string, FormFieldValue>): Promise<void> {
    // Get evaluation order from dependency graph
    const evaluationOrder = this.getReactiveFieldEvaluationOrder();
    
    for (const fieldPath of evaluationOrder) {
        const reactiveConfig = this.reactiveFieldMap.get(fieldPath);
        if (!reactiveConfig) continue;
        
        // Evaluate reactive function with current context
        const result = await this.evaluateFunction(reactiveConfig.function, context);
        
        // Update context with new value
        context[fieldPath] = result;
        
        this.logger.debug('Evaluated reactive field:', {
            path: fieldPath,
            dependencies: reactiveConfig.dependencies,
            result: result
        });
    }
    
    // Update initial metadata with reactive results
    this.initialMetadata = { ...this.initialMetadata, ...context };
}
```

**State after Step 8:**
```typescript
// initialMetadata now includes reactive field results:
{
  "ELN version": "0.7.0",
  "date created": "2025-09-16",
  "author": "", // Empty string instead of undefined
  "chemical.name": "",
  "chemical.chemtype": "electrolyte", 
  "chemical.properties.molecular_weight": 0, // Default number instead of null
  "chemical.properties.composition.solvents": [
    {
      "name": "",
      "volume fraction": ""
    }
  ],
  "chemical.properties.composition.salts": [
    {
      "name": "",
      "concentration": 0 // Default number instead of null
    }
  ],
  "chemical.properties.composition.molarity": 0 // Calculated from empty solvents/salts
}
```

### Step 9: User Input Requirement Determination

```typescript
private requiresUserInput(): boolean {
    // Check for reactive functions with user input dependencies
    const reactiveFields = this.findReactiveFields(this.currentTemplate);
    
    // Check if any reactive functions need user input
    for (const [path, descriptor] of Object.entries(reactiveFields)) {
        if (this.hasReactiveDependencies(descriptor)) {
            return true;
        }
    }
    
    // Check for fields with missing default values that are displayed
    return this.hasFieldsNeedingUserInput();
}

private hasFieldsNeedingUserInput(): boolean {
    let needsInput = false;
    
    this.processFieldsRecursively(this.currentTemplate.fields as Record<string, unknown>, (field: Record<string, unknown>, path: string) => {
        // Check if field is displayed but has no default value
        if (field.display && this.data[path] === undefined && !field.default) {
            needsInput = true;
        }
        
        // Check for list fields that might need user interaction
        if (field.inputType === 'list' && field.listType === 'object') {
            const listData = this.initialMetadata[path] as Record<string, FormFieldValue>[];
            
            // If list items have displayed fields without defaults, input is needed
            if (listData && listData.length > 0) {
                const objectTemplate = field.objectTemplate as Record<string, unknown>;
                
                Object.entries(objectTemplate).forEach(([subField, subFieldDef]) => {
                    const subFieldConfig = subFieldDef as Record<string, unknown>;
                    if (subFieldConfig.display && listData.some(item => item[subField] === undefined)) {
                        needsInput = true;
                    }
                });
            }
        }
    });
    
    return needsInput;
}
}
```

## Subclass Template Application

When a user changes the subclass selection, the process repeats with the preserved original base template:

```typescript
async applySubclassTemplate(newSubclassName: string): Promise<Record<string, FormFieldValue>> {
    this.logger.debug('Applying new subclass template:', newSubclassName);
    
    // Start fresh from original base template
    this.currentProcessedTemplate = this.deepCopy(this.originalBaseTemplate);
    
    // Load and merge new subclass
    const newSubclassTemplate = await this.loadSubclassTemplate(newSubclassName);
    this.currentProcessedTemplate = this.mergeTemplates(
        this.currentProcessedTemplate, 
        newSubclassTemplate
    );
    
    // Repeat processing steps 5-8
    this.currentProcessedTemplate = await this.processNonReactiveFunctions(this.currentProcessedTemplate);
    const newMetadata = this.createInitialMetadata(this.currentProcessedTemplate);
    this.identifyReactiveFields(this.currentProcessedTemplate);
    await this.evaluateReactiveFields(newMetadata);
    
    this.currentSubclass = newSubclassName;
    this.initialMetadata = newMetadata;
    
    return this.initialMetadata;
}
```

## Key Benefits of This Architecture

1. **Clean Separation**: Non-reactive and reactive functions processed separately
2. **Efficient Processing**: Functions evaluated once and replaced permanently
3. **Template Preservation**: Original base template never modified
4. **Data Integrity**: Initial metadata structure matches template exactly
5. **Predictable Dependencies**: Reactive fields evaluated in correct order
6. **Flexible Subclass Switching**: Can change subclasses without data corruption

## Debugging and Logging

The TemplateManager provides comprehensive logging at each step:

```typescript
// Example log output during processing:
[template] Loading base template: templates/electrolyte-base.json
[template] Base template loaded: { name: 'electrolyte-base', fields: ['experimentName', 'experimentType', 'temperature', 'notes'] }
[template] Found subclass field with default: aqueous
[template] Applied default subclass template: { subclass: 'aqueous', newFields: ['composition', 'pH'] }
[template] Evaluated non-reactive default: { field: 'Experiment Name', result: 'Electrolyte_2025-09-16' }
[template] Added default value to metadata: { path: 'experimentName', value: 'Electrolyte_2025-09-16' }
[template] Identified reactive field: { path: 'composition.molarity', dependencies: ['composition.solvents', 'composition.salts'] }
[template] Evaluated reactive field: { path: 'composition.molarity', result: 0 }
[template] User input determination: { requiresInput: true, totalFields: 7 }
```

This detailed workflow ensures that templates are processed efficiently, predictably, and with full traceability for debugging purposes.