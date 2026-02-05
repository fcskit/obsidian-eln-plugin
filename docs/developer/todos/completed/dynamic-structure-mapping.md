# Dynamic Structure Mapping - Complex Objects/Arrays

## Problem Statement

When mapping complex nested structures (like `process.parameters`), we face several challenges:

1. **Dynamic structure** - varies by source (different processes have different parameters)
2. **No fixed schema** - can't predefine field mappings in template
3. **User editability** - mapped data should be editable in the modal
4. **Missing rendering info** - source data lacks inputType, display, etc.

## Example Scenario

```typescript
// User selects a process from dropdown
// Process note has this structure:
{
    "process": {
        "name": "Electrode Coating",
        "parameters": {
            "coating": {
                "thickness": { "value": 100, "unit": "μm" },
                "drying time": { "value": 2, "unit": "h" },
                "temperature": { "value": 80, "unit": "°C" }
            },
            "device": {
                "name": "Doctor Blade Coater",
                "link": "[[Doctor Blade Coater]]"
            }
        },
        "device parameters": {
            "blade gap": { "value": 150, "unit": "μm" },
            "coating speed": { "value": 10, "unit": "mm/s" }
        }
    }
}

// We want to map this to sample.parameters in our new note
// BUT: Structure is dynamic - different processes have different parameters
// AND: User needs to edit values (change from dummy/default to actual values)
```

## Proposed Solution: Dynamic Field Config Generation

### Mapping Syntax (Simple Case)

```typescript
{
    "fullKey": "sample.process",
    "input": {
        "inputType": "queryDropdown",
        "query": {
            "source": "internal",
            "search": "process",
            "where": [
                { "field": "process.type", "operator": "equals", "value": "synthesis" }
            ]
        },
        "mapping": [
            { 
                "target": "sample.process.name", 
                "source": "process.name", 
                "display": true,
                "editable": false
            },
            { 
                "target": "sample.process.link", 
                "source": "file.link",
                "display": false,
                "editable": false
            },
            // Map entire complex structure
            { 
                "target": "sample.parameters", 
                "source": "process.parameters",
                "display": false,
                "editable": true,
                "mode": "dynamic"  // ← Signals: infer structure from data
            },
            { 
                "target": "sample.device parameters", 
                "source": "process.device parameters",
                "display": false,
                "editable": true,
                "mode": "dynamic"
            }
        ]
    }
}
```

### Key Addition: `"mode": "dynamic"`

When `mode: "dynamic"` is set:
1. Map the entire object/array from source
2. **Analyze the mapped data structure**
3. **Generate fieldConfigs** based on data types
4. **Inject into template** as dynamic fields
5. Render using normal template pipeline

## Type Inference Algorithm

```typescript
function inferFieldConfigFromData(
    path: string,
    data: unknown,
    editable: boolean
): FieldConfig {
    
    // Null/undefined → text input with empty default
    if (data === null || data === undefined) {
        return {
            fullKey: path,
            input: {
                inputType: "text",
                default: "",
                editable: editable
            }
        };
    }
    
    // Number → number input
    if (typeof data === 'number') {
        return {
            fullKey: path,
            input: {
                inputType: "number",
                default: data,
                editable: editable
            }
        };
    }
    
    // String → text input
    if (typeof data === 'string') {
        return {
            fullKey: path,
            input: {
                inputType: "text",
                default: data,
                editable: editable
            }
        };
    }
    
    // Boolean → toggle or dropdown
    if (typeof data === 'boolean') {
        return {
            fullKey: path,
            input: {
                inputType: "dropdown",
                options: ["true", "false"],
                default: data.toString(),
                editable: editable
            }
        };
    }
    
    // Array → list input
    if (Array.isArray(data)) {
        // Infer list type from first element
        const firstItem = data[0];
        
        if (typeof firstItem === 'string') {
            return {
                fullKey: path,
                input: {
                    inputType: "list",
                    listType: "string",
                    default: data,
                    editable: editable
                }
            };
        }
        
        if (typeof firstItem === 'object' && firstItem !== null) {
            // Object list - recursively infer structure
            const objectTemplate = inferObjectStructure(firstItem, editable);
            return {
                fullKey: path,
                input: {
                    inputType: "list",
                    listType: "object",
                    objectTemplate: objectTemplate,
                    default: data,
                    editable: editable
                }
            };
        }
        
        // Mixed or empty array → string list as fallback
        return {
            fullKey: path,
            input: {
                inputType: "list",
                listType: "string",
                default: data.map(String),
                editable: editable
            }
        };
    }
    
    // Object → Check for special cases
    if (typeof data === 'object' && data !== null) {
        const keys = Object.keys(data);
        
        // Number + Unit object
        if (keys.length === 2 && 'value' in data && 'unit' in data) {
            return {
                fullKey: path,
                input: {
                    inputType: "number",
                    default: (data as any).value,
                    defaultUnit: (data as any).unit,
                    units: [(data as any).unit],  // At least include the existing unit
                    editable: editable
                }
            };
        }
        
        // Regular object → editableObject with nested fields
        const nestedFields = keys.map(key => 
            inferFieldConfigFromData(`${path}.${key}`, (data as any)[key], editable)
        );
        
        return {
            fullKey: path,
            input: {
                inputType: "editableObject",
                objectTemplate: nestedFields,
                editable: editable
            }
        };
    }
    
    // Fallback
    return {
        fullKey: path,
        input: {
            inputType: "text",
            default: String(data),
            editable: editable
        }
    };
}

function inferObjectStructure(obj: Record<string, unknown>, editable: boolean): FieldConfig[] {
    const fields: FieldConfig[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
        fields.push(inferFieldConfigFromData(key, value, editable));
    }
    
    return fields;
}
```

## Integration with Template Pipeline

### Step 1: Map Query Results
```typescript
// In query result handler
function handleQuerySelection(selectedNote: MetadataObject, mapping: MappingConfig[]) {
    const mappedData: Record<string, unknown> = {};
    const dynamicFields: FieldConfig[] = [];
    
    for (const map of mapping) {
        const sourceValue = getValueFromPath(selectedNote, map.source);
        
        if (map.mode === 'dynamic' && map.editable) {
            // Generate dynamic field configs from data structure
            const dynamicConfig = inferFieldConfigFromData(
                map.target,
                sourceValue,
                true  // editable
            );
            dynamicFields.push(dynamicConfig);
        }
        
        // Still map the data
        mappedData[map.target] = sourceValue;
    }
    
    // Return both mapped data AND dynamic field configs
    return { mappedData, dynamicFields };
}
```

### Step 2: Inject into Template
```typescript
// In TemplateManager
function applyDynamicFields(dynamicFields: FieldConfig[]) {
    // Use existing subclass template merging logic
    // BUT apply to current template (not original)
    
    const currentTemplate = this.getCurrentTemplate();
    
    // Create a temporary "dynamic subclass" template
    const dynamicSubclass = {
        add: dynamicFields
    };
    
    // Merge using existing logic (similar to applySubclassTemplateByName)
    const mergedTemplate = this.mergeTemplateAdditions(
        currentTemplate,
        dynamicSubclass.add
    );
    
    // Update current template
    this.currentTemplate = mergedTemplate;
    
    // Trigger re-render
    this.notifyTemplateChange();
}
```

### Step 3: Render Normally
```typescript
// In UniversalObjectRenderer
// No special handling needed!
// The dynamically generated fields are now part of the template
// and render using existing logic
```

## Benefits of This Approach

1. ✅ **Reuses existing code** - leverages subclass template merging logic
2. ✅ **No special rendering** - dynamic fields render like any other field
3. ✅ **Type-safe** - inferred types match data structure
4. ✅ **User editable** - works with existing editability controls
5. ✅ **Flexible** - handles any dynamic structure
6. ✅ **Consistent** - follows NPE pattern for type inference

## Edge Cases & Considerations

### 1. Unit Detection for Number Fields

When inferring number fields, we may want to recognize common patterns:

```typescript
// Recognize various unit patterns
const unitPatterns = [
    { regex: /^(\d+\.?\d*)\s*(mg|g|kg|μg)$/, type: "mass" },
    { regex: /^(\d+\.?\d*)\s*(mL|L|μL)$/, type: "volume" },
    { regex: /^(\d+\.?\d*)\s*(°C|K|°F)$/, type: "temperature" },
    { regex: /^(\d+\.?\d*)\s*(min|h|s|d)$/, type: "time" }
];

// Enhanced number inference
if (typeof data === 'number' || typeof data === 'string') {
    // Check if string matches unit pattern
    const match = unitPatterns.find(p => p.regex.test(String(data)));
    if (match) {
        const [, value, unit] = String(data).match(match.regex)!;
        return {
            fullKey: path,
            input: {
                inputType: "number",
                default: parseFloat(value),
                defaultUnit: unit,
                units: getCommonUnitsForType(match.type),
                editable: editable
            }
        };
    }
}
```

### 2. Preserving Links

```typescript
// Recognize Obsidian link patterns
if (typeof data === 'string' && /^\[\[.*\]\]$/.test(data)) {
    return {
        fullKey: path,
        input: {
            inputType: "text",
            default: data,
            editable: false,  // Links typically not editable
            isLink: true
        }
    };
}
```

### 3. Deep Nesting

```typescript
// Add depth limit to prevent excessive nesting
function inferFieldConfigFromData(
    path: string,
    data: unknown,
    editable: boolean,
    depth: number = 0,
    maxDepth: number = 5
): FieldConfig {
    if (depth >= maxDepth) {
        // Convert to JSON string at max depth
        return {
            fullKey: path,
            input: {
                inputType: "text",
                default: JSON.stringify(data, null, 2),
                editable: editable,
                multiline: true
            }
        };
    }
    
    // ... rest of inference logic with depth + 1
}
```

### 4. Conflicts with Existing Template Fields

```typescript
// Before injecting dynamic fields, check for conflicts
function applyDynamicFields(dynamicFields: FieldConfig[]) {
    const currentTemplate = this.getCurrentTemplate();
    const existingPaths = this.getAllFieldPaths(currentTemplate);
    
    // Filter out dynamic fields that conflict with existing template
    const nonConflictingFields = dynamicFields.filter(field => {
        if (existingPaths.includes(field.fullKey)) {
            this.logger.warn('Dynamic field conflicts with template:', {
                path: field.fullKey,
                action: 'Skipping dynamic field, using template definition'
            });
            return false;
        }
        return true;
    });
    
    // Merge non-conflicting fields
    const dynamicSubclass = { add: nonConflictingFields };
    // ... continue merging
}
```

## Summary

**When mapping complex structures:**

1. Use `"mode": "dynamic"` in mapping config
2. Map entire object/array to target path
3. **Infer field types** from data structure
4. **Generate fieldConfigs** dynamically
5. **Inject as template additions** using existing subclass logic
6. Render normally through existing pipeline

This approach:
- ✅ Handles dynamic structures (process.parameters)
- ✅ Makes mapped data editable
- ✅ Reuses existing infrastructure
- ✅ Requires minimal new code
- ✅ Follows NPE inference pattern
- ✅ Integrates cleanly with template system

The key insight: **Dynamic structure mapping is just runtime subclass template generation.**
