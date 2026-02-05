# Enhanced Query System Examples

## 1. Simple String Query (Backward Compatible)

```typescript
{
    "fullKey": "sample.electrode",
    "input": {
        "query": true,
        "inputType": "queryDropdown",
        "search": "#sample",
        "where": "sample.type = 'electrode'",
        "return": ["sample.name", "sample.mass"]
    }
}
```

## 2. Complex Logical Query with AND/OR/NOT

```typescript
{
    "fullKey": "sample.active_electrode", 
    "input": {
        "query": true,
        "inputType": "queryDropdown",
        "search": "#sample",
        "where": {
            "operator": "and",
            "conditions": [
                { "field": "sample.type", "operator": "is", "value": "electrode" },
                { "field": "sample.status", "operator": "not", "value": "inactive" },
                {
                    "operator": "or",
                    "conditions": [
                        { "field": "sample.mass", "operator": "gt", "value": 5 },
                        { "field": "sample.priority", "operator": "is", "value": "high" }
                    ]
                }
            ]
        },
        "return": {
            "sample.name": "electrode.name",
            "sample.mass": "electrode.active_mass", 
            "sample.composition": "electrode.material"
        }
    }
}
```

## 3. Complex Nested Query

```typescript
{
    "fullKey": "chemical.electrolyte",
    "input": {
        "query": true,
        "inputType": "queryDropdown", 
        "search": "#chemical",
        "where": {
            "operator": "and",
            "conditions": [
                { "field": "chemical.type", "operator": "is", "value": "electrolyte" },
                { "field": "chemical.properties.conductivity", "operator": "gte", "value": 0.01 },
                {
                    "operator": "not",
                    "conditions": [
                        { "field": "chemical.safety.hazard_level", "operator": "is", "value": "high" }
                    ]
                }
            ]
        },
        "return": {
            "chemical.name": "electrolyte.name",
            "chemical.properties.conductivity": "electrolyte.conductivity",
            "chemical.supplier": "electrolyte.source"
        }
    }
}
```

## 4. Multi-Field Search with Regex

```typescript
{
    "fullKey": "analysis.reference",
    "input": {
        "query": true,
        "inputType": "queryDropdown",
        "search": "#analysis", 
        "where": {
            "operator": "and",
            "conditions": [
                { "field": "analysis.type", "operator": "contains", "value": "electrochemical" },
                { "field": "analysis.sample.name", "operator": "regex", "value": "^LiPF6.*" },
                { "field": "analysis.date", "operator": "gte", "value": "2025-01-01" }
            ]
        },
        "return": {
            "analysis.sample.name": "reference.sample",
            "analysis.results.capacity": "reference.capacity",
            "analysis.conditions.temperature": "reference.temp"
        }
    }
}
```

## Result Data Structure

When a selection is made, the enhanced QueryDropDown will:

1. **Execute the complex query** using logical operators
2. **Map return values** to target field names
3. **Store mapped values** in the form data structure

For example, selecting an electrode might result in:
```javascript
// Original file metadata:
{
    "sample": {
        "name": "LiFePO4_electrode_batch_42",
        "mass": 15.7,
        "composition": "LiFePO4 + Carbon + PVDF"
    }
}

// Mapped to target data:
{
    "electrode": {
        "name": "LiFePO4_electrode_batch_42",
        "active_mass": 15.7,
        "material": "LiFePO4 + Carbon + PVDF"
    }
}
```

## Supported Operators

- **Comparison**: `is`, `not`, `gt`, `lt`, `gte`, `lte`
- **Text**: `contains`, `regex`
- **Existence**: `exists`
- **Logical**: `and`, `or`, `not`

## Supported Return Formats

1. **Simple Array**: `["field1", "field2"]` - Direct field mapping
2. **Mapping Object**: `{"source.field": "target.field"}` - Field renaming/restructuring
