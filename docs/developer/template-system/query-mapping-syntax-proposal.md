# Query & Mapping Syntax Proposal

## Design Goals

1. **Unified syntax** for both internal queries (queryDropdown, multiQueryDropdown) and external API calls (ChemicalLookup)
2. **Flexible mapping** - map returned data to ANY metadata path, not just children of the query field
3. **Editable returns** - returned fields should be rendered in the modal for user review/editing
4. **Clear separation** between query configuration and data mapping
5. **Intuitive structure** - obvious what data flows from where to where

## Proposed Syntax Structure

```typescript
{
    "fullKey": "sample.cell",  // The field that triggers the query (for dropdowns)
    "input": {
        "inputType": "queryDropdown",  // or "multiQueryDropdown", "apiLookup", etc.
        
        // QUERY CONFIGURATION
        "query": {
            // For internal queries (queryDropdown)
            "source": "internal",
            "search": "electrochemical cell",
            "where": [
                {
                    "field": "sample.type",
                    "operator": "equals",  // or "contains", "startsWith", etc.
                    "value": "cell"
                }
            ],
            
            // For external API queries (ChemicalLookup)
            // "source": "api",
            // "endpoint": "pubchem",
            // "searchField": "name",  // or "cas", "inchi", etc.
        },
        
        // DATA MAPPING CONFIGURATION
        "mapping": {
            // Define what gets mapped from query result to our metadata
            "fields": [
                {
                    "target": "sample.cell.name",        // Where in OUR metadata
                    "source": "electrochemical cell.name", // Where from QUERY result
                    "display": true,                      // Show in dropdown (primary field)
                    "editable": true,                     // Allow editing in modal
                    "required": true                      // Must have value
                },
                {
                    "target": "sample.cell.link",
                    "source": "file.link",
                    "display": false,
                    "editable": false,
                    "required": false
                },
                {
                    "target": "sample.cell.type",
                    "source": "electrochemical cell.type",
                    "display": false,
                    "editable": true,
                    "required": false
                },
                {
                    "target": "project.name",            // Maps to DIFFERENT parent!
                    "source": "project.name",
                    "display": false,
                    "editable": true,
                    "required": false
                }
            ]
        }
    }
}
```

## Key Features

### 1. Query Configuration (`query` object)

**For Internal Queries:**
```typescript
"query": {
    "source": "internal",
    "search": "tag or folder path",
    "where": [/* optional filters */]
}
```

**For External API Queries:**
```typescript
"query": {
    "source": "api",
    "endpoint": "pubchem",  // or "chemspider", "custom", etc.
    "searchField": "name",  // what field to search by
    "apiConfig": {          // endpoint-specific config
        "timeout": 5000,
        "retries": 3
    }
}
```

### 2. Mapping Configuration (`mapping.fields` array)

Each field mapping has:
- **`target`**: Full path in our metadata where value goes
- **`source`**: Path in query result where value comes from
- **`display`**: Whether to show in dropdown (true for primary field)
- **`editable`**: Whether user can edit in modal after query
- **`required`**: Whether field must have value

### 3. Flexible Target Paths

The `target` can be:
- Child of query field: `"sample.cell.name"` (when fullKey is `"sample.cell"`)
- Sibling field: `"sample.description"` (different child of same parent)
- Completely different path: `"project.name"` (maps to different metadata section)

### 4. Display & Editability Control

```typescript
"display": true   // Shows in dropdown, typically only ONE field should have this
"editable": true  // Renders as input field in modal after query selection
"editable": false // Renders as read-only or hidden field
```

## Migration from Current Syntax

### Current Syntax:
```typescript
{
    "fullKey": "sample.cell.name",
    "input": {
        "query": true,
        "inputType": "queryDropdown",
        "search": "electrochemical cell",
        "return": {
            "sample.cell.name": "electrochemical cell.name",
            "sample.cell.link": "file.link",
            "sample.cell.type": "electrochemical cell.type"
        }
    }
}
```

### New Syntax:
```typescript
{
    "fullKey": "sample.cell",
    "input": {
        "inputType": "queryDropdown",
        "query": {
            "source": "internal",
            "search": "electrochemical cell"
        },
        "mapping": {
            "fields": [
                {
                    "target": "sample.cell.name",
                    "source": "electrochemical cell.name",
                    "display": true,
                    "editable": true
                },
                {
                    "target": "sample.cell.link",
                    "source": "file.link",
                    "display": false,
                    "editable": false
                },
                {
                    "target": "sample.cell.type",
                    "source": "electrochemical cell.type",
                    "display": false,
                    "editable": true
                }
            ]
        }
    }
}
```

## Use Case Examples

### Example 1: Simple Dropdown with Link
```typescript
{
    "fullKey": "sample.electrolyte",
    "input": {
        "inputType": "queryDropdown",
        "query": {
            "source": "internal",
            "search": "chemical",
            "where": [
                { "field": "chemical.type", "operator": "equals", "value": "electrolyte" }
            ]
        },
        "mapping": {
            "fields": [
                {
                    "target": "sample.electrolyte.name",
                    "source": "chemical.name",
                    "display": true,
                    "editable": true,
                    "required": true
                },
                {
                    "target": "sample.electrolyte.link",
                    "source": "file.link",
                    "display": false,
                    "editable": false
                }
            ]
        }
    }
}
```

### Example 2: Sample from Process (with editable parameters)
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
        "mapping": {
            "fields": [
                {
                    "target": "sample.process.name",
                    "source": "process.name",
                    "display": true,
                    "editable": false,
                    "required": true
                },
                {
                    "target": "sample.process.link",
                    "source": "file.link",
                    "display": false,
                    "editable": false
                },
                // Import parameters section - user should edit values
                {
                    "target": "sample.parameters",
                    "source": "process.parameters",
                    "display": false,
                    "editable": true,  // User can modify imported parameters
                    "required": false
                },
                // Import device parameters - user should edit values
                {
                    "target": "sample.device parameters",
                    "source": "process.device parameters",
                    "display": false,
                    "editable": true,
                    "required": false
                }
            ]
        }
    }
}
```

### Example 3: Chemical Lookup (External API)
```typescript
{
    "fullKey": "chemical",
    "input": {
        "inputType": "apiLookup",  // New input type for API queries
        "query": {
            "source": "api",
            "endpoint": "pubchem",
            "searchField": "name",
            "apiConfig": {
                "timeout": 5000
            }
        },
        "mapping": {
            "fields": [
                {
                    "target": "chemical.name",
                    "source": "name",
                    "display": true,
                    "editable": true,
                    "required": true
                },
                {
                    "target": "chemical.cas",
                    "source": "cas",
                    "display": false,
                    "editable": true
                },
                {
                    "target": "chemical.formula",
                    "source": "molecular_formula",
                    "display": false,
                    "editable": true
                },
                {
                    "target": "chemical.molecular weight",
                    "source": "molecular_weight",
                    "display": false,
                    "editable": true
                },
                // Even map to different metadata sections
                {
                    "target": "safety.h statements",
                    "source": "hazard_statements",
                    "display": false,
                    "editable": true
                }
            ]
        }
    }
}
```

### Example 4: Cross-Section Mapping (Different Parent)
```typescript
{
    "fullKey": "sample.cell",
    "input": {
        "inputType": "queryDropdown",
        "query": {
            "source": "internal",
            "search": "electrochemical cell"
        },
        "mapping": {
            "fields": [
                {
                    "target": "sample.cell.name",
                    "source": "electrochemical cell.name",
                    "display": true,
                    "editable": true
                },
                {
                    "target": "sample.cell.link",
                    "source": "file.link",
                    "display": false,
                    "editable": false
                },
                // Map project from cell to our project field
                {
                    "target": "project.name",
                    "source": "project.name",
                    "display": false,
                    "editable": false
                },
                {
                    "target": "project.link",
                    "source": "project.link",
                    "display": false,
                    "editable": false
                }
            ]
        }
    }
}
```

## Implementation Considerations

### 1. Backward Compatibility

Support both old and new syntax during transition:

```typescript
// Detect old syntax
if (field.input.return && typeof field.input.return === 'object') {
    // Convert to new syntax internally
    field = convertLegacySyntax(field);
}
```

### 2. Rendering Editable Fields

Fields with `"editable": true` should:
- Render as input fields in the modal after query selection
- Use appropriate input type based on data type
- Allow user to modify before creating note

### 3. Template Manager Changes

- Parse new `mapping.fields` structure
- Support cross-section mappings (different parent paths)
- Validate target paths exist in template

### 4. API Integration

- ChemicalLookup should use same mapping syntax
- API results get transformed to match mapping sources
- Same rendering logic for both internal and external queries

### 5. Validation

```typescript
// Validate mapping configuration
function validateMapping(mapping: MappingConfig): ValidationResult {
    // Check for exactly ONE display: true field
    const displayFields = mapping.fields.filter(f => f.display);
    if (displayFields.length !== 1) {
        return { valid: false, error: "Exactly one field must have display: true" };
    }
    
    // Check all required fields
    for (const field of mapping.fields) {
        if (!field.target || !field.source) {
            return { valid: false, error: "All fields must have target and source" };
        }
    }
    
    return { valid: true };
}
```

## Benefits of This Design

1. ✅ **Unified** - Same syntax for internal queries and external APIs
2. ✅ **Flexible** - Map to any metadata path, not just children
3. ✅ **Editable** - Control what user can see/edit after query
4. ✅ **Clear** - Obvious separation between query and mapping
5. ✅ **Extensible** - Easy to add new query sources or mapping features
6. ✅ **Backward Compatible** - Can auto-convert old syntax
7. ✅ **Maintainable** - Self-documenting structure

## Next Steps

1. Implement syntax parser in TemplateManager
2. Update UniversalObjectRenderer to handle editable mapped fields
3. Implement API query support with same mapping structure
4. Create migration utility for existing templates
5. Add validation and helpful error messages
6. Document for users

---

## Questions for Review

1. Should we add field transformations? (e.g., `"transform": "uppercase"`)
2. Should we support conditional mappings? (e.g., only map if value exists)
3. Should we add default values per field in mapping?
4. How should we handle array/object valued fields in mapping?
