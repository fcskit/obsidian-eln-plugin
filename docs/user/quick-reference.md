# Template Quick Reference

A concise reference for creating and customizing ELN Plugin templates.

## Basic Template Structure

```json
{
  "field_name": {
    "inputType": "text",           // Required: Field type
    "query": false,                // Optional: Enable for queries
    "default": "value",            // Optional: Default value
    "placeholder": "hint text"     // Optional: Placeholder text
  }
}
```

## Input Types Reference

| Type | Description | Example |
|------|-------------|---------|
| `text` | Text input | `"inputType": "text"` |
| `number` | Numeric input with units | `"inputType": "number", "units": ["mg", "g"]` |
| `boolean` | Checkbox | `"inputType": "boolean"` |
| `date` | Date picker | `"inputType": "date"` |
| `dropdown` | Single selection | `"inputType": "dropdown", "options": ["a", "b"]` |
| `multiselect` | Multiple selections | `"inputType": "multiselect", "options": ["x", "y"]` |
| `list` | Lists of values (text, number, boolean, or objects) | `"inputType": "list", "listType": "text"` |
| `queryDropdown` | Dynamic selection from notes | `"inputType": "queryDropdown", "search": [...]` |
| `multiQueryDropdown` | Multiple selections from notes | `"inputType": "multiQueryDropdown", "search": [...]` |
| `actiontext` | Text with action button | `"inputType": "actiontext", "action": "functionName"` |
| `subclass` | Hierarchical selection | `"inputType": "subclass", "options": [...]` |
| `editableObject` | Dynamic key-value pairs | `"inputType": "editableObject"` |

## Function Descriptors

### Legacy Format
```json
{
  "field": {
    "default": {
      "type": "function",
      "value": "new Date().toISOString().split('T')[0]"
    }
  }
}
```

### Enhanced Format (Recommended)
```json
{
  "field": {
    "default": {
      "type": "function",
      "context": ["userInput", "settings"],
      "reactiveDeps": ["other.field"],
      "function": "({ userInput, settings }) => userInput.other?.field || 'default'",
      "fallback": "static_fallback"
    }
  }
}
```

### Common Function Examples
- Current date: `"new Date().toISOString().split('T')[0]"`
- Plugin version: `"this.manifest.version"`
- Settings value: `"this.settings.authors.map(a => a.name)"`

## Reactive Fields

Fields that update when other fields change:

```json
{
  "source_field": {
    "inputType": "text",
    "default": ""
  },
  "reactive_field": {
    "inputType": "text",
    "default": {
      "type": "function",
      "value": "source_field ? `Updated: ${source_field}` : 'No value'"
    },
    "userInputs": ["source_field"]  // Triggers re-evaluation
  }
}
```

## Query Configuration

### Basic Query
```json
{
  "field": {
    "inputType": "queryDropdown",
    "search": [{"tag": "tagname"}]
  }
}
```

### Query with Conditions
```json
{
  "field": {
    "inputType": "queryDropdown",
    "search": [{"tag": "tagname"}],
    "where": {
      "field": "metadata.status",
      "operator": "is",
      "value": "active"
    }
  }
}
```

### Complex Query Logic
```json
{
  "where": {
    "operator": "and",
    "conditions": [
      {"field": "status", "operator": "is", "value": "active"},
      {
        "operator": "or",
        "conditions": [
          {"field": "type", "operator": "is", "value": "A"},
          {"field": "type", "operator": "is", "value": "B"}
        ]
      }
    ]
  }
}
```

## Query Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `is` | Exact match | `"operator": "is", "value": "active"` |
| `contains` | String contains | `"operator": "contains", "value": "test"` |
| `not` | Negation | `"operator": "not", "value": "inactive"` |
| `gt` | Greater than | `"operator": "gt", "value": 100` |
| `lt` | Less than | `"operator": "lt", "value": 50` |
| `gte` | Greater than or equal | `"operator": "gte", "value": 10` |
| `lte` | Less than or equal | `"operator": "lte", "value": 90` |
| `exists` | Field exists | `"operator": "exists"` |
| `regex` | Regular expression | `"operator": "regex", "value": "^test.*"` |

## Logical Operators

For complex query conditions:

```json
{
  "operator": "and|or|not",
  "conditions": [...]
}
```

## Return Clauses

### Array Format
```json
{
  "return": ["file.name", "metadata.field"]
}
```

### Mapping Format
```json
{
  "return": {
    "display_name": "file.name",
    "status": "metadata.status",
    "created": "file.ctime"
  }
}
```

## List Types

Lists support different data types and structures using the `listType` property:

### Simple Lists

#### Text List
```json
{
  "keywords": {
    "inputType": "list",
    "listType": "text",
    "default": ["keyword1", "keyword2"],
    "placeholder": "Enter comma-separated keywords"
  }
}
```

#### Number List
```json
{
  "measurements": {
    "inputType": "list",
    "listType": "number",
    "default": [1.0, 2.5, 3.7],
    "placeholder": "Enter comma-separated numbers"
  }
}
```

#### Date List
```json
{
  "experiment_dates": {
    "inputType": "list",
    "listType": "date",
    "default": ["2023-01-15", "2023-02-20"],
    "placeholder": "Enter comma-separated dates (YYYY-MM-DD)"
  }
}
```

#### Boolean List
```json
{
  "flags": {
    "inputType": "list",
    "listType": "boolean",
    "default": [true, false, true],
    "placeholder": "Enter comma-separated true/false values"
  }
}
```

### Object Lists

For structured collections of objects:

```json
{
  "materials": {
    "inputType": "list",
    "listType": "object",
    "objectTemplate": {
      "name": {
        "inputType": "text",
        "default": "",
        "placeholder": "Material name"
      },
      "amount": {
        "inputType": "number",
        "units": ["mg", "g", "kg"],
        "defaultUnit": "g",
        "default": 0
      },
      "purity": {
        "inputType": "number",
        "units": ["%"],
        "defaultUnit": "%",
        "default": 100
      }
    },
    "initialItems": 1
  }
}
```

**Object List Properties:**
- **`objectTemplate`**: Defines the structure of each object in the list
- **`initialItems`**: Number of empty objects to create initially
- **`editableKey`**: Whether field names can be edited
- **`removeable`**: Whether objects can be removed from the list

## Object Lists

### New Format (Recommended)
```json
{
  "materials": {
    "inputType": "list",
    "listType": "object",
    "objectTemplate": {
      "name": {
        "inputType": "text"
      },
      "amount": {
        "inputType": "number",
        "units": ["mg", "g"]
      }
    },
    "initialItems": 1
  }
}
```

### Legacy Array Format
```json
{
  "materials": {
    "inputType": "list",
    "listType": "object",
    "objectTemplate": [
      {"key": "name", "inputType": "text"},
      {"key": "amount", "inputType": "number", "units": ["mg", "g"]}
    ]
  }
}
```


## Common Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `inputType` | string | **Required** Field type | `"text"` |
| `listType` | string | List data type (for list inputs) | `"text"`, `"number"`, `"boolean"`, `"date"`, `"object"` |
| `objectTemplate` | object | Object structure (for object lists) | `{"field": {...}}` |
| `query` | boolean | Enable for queries | `true` |
| `default` | any | Default value | `"default"` or function descriptor |
| `placeholder` | string | Placeholder text | `"Enter value..."` |
| `options` | array | Available options | `["option1", "option2"]` |
| `units` | array | Available units | `["mg", "g", "kg"]` |
| `defaultUnit` | string | Default unit | `"g"` |
| `multiline` | boolean | Multi-line text | `true` |
| `userInputs` | array | Reactive dependencies | `["field1", "field2"]` |
| `initialItems` | number | Initial list items (for lists) | `1` |
| `icon` | string | Icon for action buttons | `"chemistry"` |
| `tooltip` | string | Tooltip text | `"Click to..."` |
| `action` | string | Action function name | `"generateStructure"` |

## Available Contexts

When using enhanced function descriptors:

| Context | Description | Example Usage |
|---------|-------------|---------------|
| `userInput` | Current form values | `userInput.field?.subfield` |
| `settings` | Plugin settings | `settings.authors[0]?.name` |
| `plugin` | Plugin instance | `plugin.manifest.version` |
| `app` | Obsidian app | `app.vault.getName()` |


## Minimal Template Example

```json
{
  "title": {
    "inputType": "text",
    "default": ""
  },
  "created": {
    "inputType": "date",
    "default": {
      "type": "function",
      "value": "new Date().toISOString().split('T')[0]"
    }
  },
  "tags": {
    "inputType": "list",
    "default": ["note"]
  }
}
```

## Template Validation Checklist

- [ ] Valid JSON syntax
- [ ] All required `inputType` fields present
- [ ] Function descriptors have proper syntax
- [ ] Query fields have valid search configurations
- [ ] Object lists have proper structure
- [ ] Reactive dependencies are correctly specified
- [ ] No circular dependencies in reactive fields
- [ ] Units arrays are not empty when specified
- [ ] Default values match field types

## Best Practices

### Naming
- Use descriptive field names
- Use lowercase with underscores: `field_name`
- Group related fields in nested objects

### Defaults
- Always provide sensible defaults
- Use function descriptors for dynamic defaults
- Consider user workflow when setting defaults

### Performance
- Limit complex queries and reactive dependencies
- Use appropriate field types for data
- Test templates with realistic data

### Maintenance
- Document custom functions
- Keep templates in version control
- Test thoroughly before deployment

## Common Patterns

### Auto-Generated Tags
```json
{
  "type": {"inputType": "dropdown", "options": ["A", "B"]},
  "tags": {
    "inputType": "list",
    "default": {
      "type": "function",
      "value": "type ? [`category/${type.toLowerCase()}`] : []"
    },
    "userInputs": ["type"]
  }
}
```

### Dynamic Filename
```json
{
  "filename": {
    "inputType": "text",
    "default": {
      "type": "function",
      "value": "`${title || 'untitled'}_${new Date().toISOString().split('T')[0]}`"
    },
    "userInputs": ["title"]
  }
}
```

### Conditional Fields
```json
{
  "conditional_field": {
    "inputType": "text",
    "default": {
      "type": "function",
      "value": "show_field ? 'visible' : ''"
    },
    "userInputs": ["show_field"]
  }
}
```
