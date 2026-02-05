# ELN Plugin Template System Documentation

## Overview

The ELN Plugin uses a flexible template system to define the metadata structure and input fields for different types of notes. This documentation explains how to create, customize, and load your own metadata templates.

## Table of Contents

1. [Template Structure](#template-structure)
2. [Field Types](#field-types)
3. [Advanced Features](#advanced-features)
4. [Complete Examples](#complete-examples)
5. [Loading Custom Templates](#loading-custom-templates)
6. [Best Practices](#best-practices)

## Template Structure

A metadata template is a JSON object that defines the fields and their properties for a specific note type. Each template consists of field definitions with various input types and configurations.

### Basic Template Structure

```json
{
  "field_name": {
    "query": true,
    "inputType": "text",
    "default": "default value"
  },
  "another_field": {
    "query": false,
    "inputType": "number",
    "default": 0,
    "units": ["mg", "g", "kg"],
    "defaultUnit": "g"
  }
}
```

### Required Properties

- **inputType**: Defines the type of input field (see [Field Types](#field-types))

### Optional Properties

- **query**: Boolean indicating if this field can be used in queries (default: false)
- **default**: Default value for the field
- **units**: Array of available units for numeric fields
- **defaultUnit**: Default unit selection
- **options**: Available options for dropdown/multiselect fields
- **callback**: Function to process the field value
- **action**: Function to execute when an action button is clicked
- **icon**: Icon for action buttons
- **tooltip**: Tooltip text for the field
- **search**: Search configuration for query fields
- **where**: Query conditions for filtering
- **return**: Fields to return from query results

## Field Types

The template system supports various input types for different kinds of data. Here are the currently supported types:

### Text Input
Basic text input field:
```json
{
  "sample_name": {
    "inputType": "text",
    "default": "",
    "query": true,
    "placeholder": "Enter sample name",
    "multiline": false
  }
}
```

**Properties:**
- **`multiline`**: Boolean, enables multi-line text input
- **`placeholder`**: Placeholder text when field is empty

### Number Input
Numeric input with optional units:
```json
{
  "mass": {
    "inputType": "number",
    "default": 0,
    "units": ["mg", "g", "kg"],
    "defaultUnit": "g"
  }
}
```

**Properties:**
- **`units`**: Array of available units
- **`defaultUnit`**: Default unit selection

### Date Input
Date picker input:
```json
{
  "experiment_date": {
    "inputType": "date",
    "default": {
      "type": "function",
      "value": "new Date().toISOString().split('T')[0]"
    }
  }
}
```

### Boolean Input
Checkbox input:
```json
{
  "is_completed": {
    "inputType": "boolean",
    "default": false
  }
}
```

### Dropdown Selection
Single selection from predefined options:
```json
{
  "status": {
    "inputType": "dropdown",
    "options": ["pending", "in_progress", "completed", "cancelled"],
    "default": "pending"
  }
}
```

**Properties:**
- **`options`**: Array of available options or function descriptor

### Multi-Select
Multiple selections from predefined options:
```json
{
  "tags": {
    "inputType": "multiselect",
    "options": ["synthesis", "analysis", "characterization", "testing"],
    "default": ["synthesis"]
  }
}
```

### List Input
Lists can contain different types of data using the `listType` property:

#### Text Lists
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

#### Number Lists
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

#### Date Lists
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

#### Boolean Lists
```json
{
  "conditions": {
    "inputType": "list",
    "listType": "boolean",
    "default": [true, false, true],
    "placeholder": "Enter comma-separated true/false values"
  }
}
```

**Properties:**
- **`listType`**: "text" (default), "number", "boolean", "date", or "object"
- Default values can be arrays or comma-separated strings

### Object Lists
Collections of structured objects with defined fields:
```json
{
  "educts": {
    "inputType": "list",
    "listType": "object",
    "objectTemplate": {
      "name": {
        "inputType": "queryDropdown",
        "search": [{"tag": "chemical"}]
      },
      "amount": {
        "inputType": "number",
        "default": 0,
        "units": ["mg", "g", "kg"],
        "defaultUnit": "g"
      },
      "equivalents": {
        "inputType": "number",
        "default": 1.0
      }
    },
    "initialItems": 1
  }
}
```

**Properties:**
- **`listType`**: Must be "object"
- **`objectTemplate`**: Object defining the structure of list items
- **`initialItems`**: Number of empty items to create initially
- **`editableKey`**: Whether field keys can be edited
- **`removeable`**: Whether items can be removed

### Query Dropdown
Dynamic selection from existing notes based on search criteria:
```json
{
  "instrument": {
    "inputType": "queryDropdown",
    "search": [
      {
        "tag": "instrument",
        "where": [
          {
            "field": "instrument.status",
            "is": "active"
          }
        ]
      }
    ],
    "return": ["file.name", "instrument.type"]
  }
}
```

**Properties:**
- **`search`**: Array of search configurations
- **`where`**: Query conditions (see Advanced Features)
- **`return`**: Fields to return from search results

### Multi Query Dropdown
Multiple selections from query results:
```json
{
  "related_samples": {
    "inputType": "multiQueryDropdown",
    "search": [{"tag": "sample"}],
    "where": {
      "field": "sample.project",
      "operator": "is",
      "value": "current_project"
    }
  }
}
```

### Object Lists
Collections of structured objects with defined fields:
```json
{
  "educts": {
    "inputType": "list",
    "listType": "object",
    "objectTemplate": {
      "name": {
        "inputType": "queryDropdown",
        "search": [{"tag": "chemical"}],
        "key": "name"
      },
      "amount": {
        "inputType": "number",
        "default": 0,
        "units": ["mg", "g", "kg"],
        "defaultUnit": "g",
        "key": "amount"
      },
      "equivalents": {
        "inputType": "number",
        "default": 1.0,
        "key": "equivalents"
      }
    },
    "initialItems": 1
  }
}
```

**Properties:**
- **`listType`**: Must be "object"
- **`objectTemplate`**: Object defining the structure of list items
- **`initialItems`**: Number of empty items to create initially
- **`editableKey`**: Whether field keys can be edited
- **`removeable`**: Whether items can be removed

### Action Text
Text input with an associated action button:
```json
{
  "smiles": {
    "inputType": "actiontext",
    "default": "",
    "icon": "chemistry",
    "tooltip": "Generate 2D structure",
    "action": "generateStructure"
  }
}
```

**Properties:**
- **`icon`**: Icon for the action button
- **`tooltip`**: Tooltip text for the button
- **`action`**: Function name to execute on button click

### Subclass Selection
Hierarchical selection for note types:
```json
{
  "chemical_type": {
    "inputType": "subclass",
    "options": ["compound", "mixture", "solution"],
    "default": "compound"
  }
}
```

**Properties:**
- **`options`**: Array of available subclass options

### Editable Object
Dynamic object with user-defined properties:
```json
{
  "custom_properties": {
    "inputType": "editableObject",
    "default": {},
    "editableKey": true,
    "removeable": true
  }
}
```

**Properties:**
- **`editableKey`**: Whether property names can be edited
- **`removeable`**: Whether properties can be removed
```

## Advanced Features

### Function Descriptors

Function descriptors allow you to define dynamic values that are computed at runtime. There are two supported formats:

#### Legacy Function Descriptors
```json
{
  "created_date": {
    "inputType": "date",
    "default": {
      "type": "function",
      "value": "new Date().toISOString().split('T')[0]"
    }
  },
  "author": {
    "inputType": "dropdown",
    "options": {
      "type": "function",
      "value": "this.plugin.settings.authors.map(author => author.name)"
    }
  }
}
```

#### Enhanced Function Descriptors (Recommended)
```json
{
  "project_title": {
    "inputType": "text",
    "default": {
      "type": "function",
      "context": ["userInput", "settings"],
      "reactiveDeps": ["project.name", "project.type"],
      "function": "({ userInput, settings }) => `${userInput.project?.name || 'Untitled'} - ${userInput.project?.type || 'Unknown'} (${settings.authors[0]?.name})`",
      "fallback": "New Project"
    }
  }
}
```

**Enhanced Function Descriptor Properties:**
- **`context`**: Array of available contexts (`userInput`, `settings`, `plugin`, `app`)
- **`reactiveDeps`**: Array of field paths that trigger re-evaluation
- **`function`**: Function body with destructured parameters
- **`fallback`**: Static fallback value (not an expression)

#### Available Contexts
- **`userInput`**: Current form values (e.g., `userInput.chemical.name`)
- **`settings`**: Plugin settings (e.g., `settings.authors`)
- **`plugin`**: Plugin instance (e.g., `plugin.manifest.version`)
- **`app`**: Obsidian app instance (e.g., `app.vault.getName()`)

### Reactive Fields

Fields can automatically update when other fields change using the `userInputs` property:

```json
{
  "chemical": {
    "type": {
      "inputType": "dropdown",
      "options": ["polymer", "metal", "ceramic", "composite"],
      "default": "polymer"
    },
    "name": {
      "inputType": "text",
      "default": ""
    }
  },
  "tags": {
    "inputType": "list",
    "default": {
      "type": "function",
      "value": "chemical.type ? [`chemical/${chemical.type}`, 'chemistry'] : ['chemistry']"
    },
    "userInputs": ["chemical.type"]
  },
  "filename": {
    "inputType": "text",
    "default": {
      "type": "function",
      "value": "`${chemical.name || 'unnamed'}_${chemical.type || 'unknown'}_${new Date().toISOString().split('T')[0]}`"
    },
    "userInputs": ["chemical.type", "chemical.name"]
  }
}
```

**How Reactive Fields Work:**
1. When a field listed in `userInputs` changes, the dependent field is re-evaluated
2. Only function descriptors in `default` values are re-executed
3. The field's value is automatically updated in the form
4. Nested field paths are supported (e.g., `"sample.properties.mass"`)

### Complex Query Conditions

The query system supports advanced logical operators:

```json
{
  "related_samples": {
    "inputType": "queryDropdown",
    "search": [{"tag": "sample"}],
    "where": {
      "operator": "and",
      "conditions": [
        {
          "field": "sample.project",
          "operator": "is",
          "value": "this.project.name"
        },
        {
          "operator": "or",
          "conditions": [
            {
              "field": "sample.status",
              "operator": "is",
              "value": "active"
            },
            {
              "field": "sample.status",
              "operator": "is",
              "value": "completed"
            }
          ]
        }
      ]
    }
  }
}
```

**Supported Operators:**
- **`is`**: Exact match
- **`contains`**: String contains
- **`not`**: Negation
- **`gt`, `lt`, `gte`, `lte`**: Numeric comparisons
- **`exists`**: Field exists
- **`regex`**: Regular expression match

### Return Value Mapping

Map query results to specific fields with enhanced return clauses:

```json
{
  "instrument": {
    "inputType": "queryDropdown",
    "search": [{"tag": "instrument"}],
    "return": {
      "instrument_name": "file.name",
      "instrument_type": "instrument.type",
      "manufacturer": "instrument.manufacturer",
      "location": "instrument.location"
    }
  }
}
```

**Return Formats:**
- **Array**: `["field1", "field2"]` - returns values directly
- **Object**: `{"target": "source.field"}` - maps source fields to target names
```

## Complete Examples

### Chemical Template Example

```json
{
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": {
      "type": "function",
      "value": "this.plugin.manifest.version"
    }
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": {
      "type": "function",
      "value": "new Date().toISOString().split('T')[0]"
    }
  },
  "author": {
    "query": true,
    "inputType": "dropdown",
    "options": {
      "type": "function",
      "value": "this.plugin.settings.authors.map(author => author.name)"
    },
    "default": {
      "type": "function",
      "value": "this.plugin.settings.authors[0]?.name || 'Unknown'"
    }
  },
  "chemical": {
    "name": {
      "query": true,
      "inputType": "text",
      "default": "",
      "placeholder": "Enter chemical name"
    },
    "formula": {
      "query": true,
      "inputType": "text",
      "default": "",
      "placeholder": "Molecular formula"
    },
    "smiles": {
      "query": true,
      "inputType": "actiontext",
      "default": "",
      "icon": "chemistry",
      "tooltip": "Generate 2D structure",
      "action": "generateStructure"
    },
    "molar_mass": {
      "query": true,
      "inputType": "number",
      "default": 0,
      "units": ["g/mol"],
      "defaultUnit": "g/mol"
    },
    "physical_state": {
      "query": true,
      "inputType": "dropdown",
      "options": ["solid", "liquid", "gas", "solution"],
      "default": "solid"
    },
    "safety_info": {
      "hazard_statements": {
        "inputType": "multiselect",
        "options": ["H200", "H201", "H300", "H301", "H400", "H401"],
        "default": []
      },
      "precautionary_statements": {
        "inputType": "multiselect",
        "options": ["P200", "P201", "P300", "P301", "P400", "P401"],
        "default": []
      }
    }
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": {
      "type": "function",
      "value": "chemical.name ? [`chemical`, `chemical/${chemical.physical_state}`] : ['chemical']"
    },
    "userInputs": ["chemical.name", "chemical.physical_state"]
  },
  "filename": {
    "query": false,
    "inputType": "text",
    "default": {
      "type": "function",
      "value": "`${chemical.name || 'unnamed_chemical'}_${new Date().toISOString().split('T')[0]}`"
    },
    "userInputs": ["chemical.name"]
  }
}
```

### Experiment Template with Reactive Fields

```json
{
  "experiment": {
    "title": {
      "query": true,
      "inputType": "text",
      "default": "",
      "placeholder": "Experiment title"
    },
    "type": {
      "query": true,
      "inputType": "dropdown",
      "options": ["synthesis", "analysis", "characterization", "testing"],
      "default": "synthesis"
    },
    "objective": {
      "query": true,
      "inputType": "text",
      "multiline": true,
      "placeholder": "Experimental objective"
    }
  },
  "materials": {
    "inputType": "list",
    "listType": "object",
    "objectTemplate": {
      "chemical": {
        "inputType": "queryDropdown",
        "search": [{"tag": "chemical"}],
        "return": ["file.name", "chemical.formula", "chemical.molar_mass"],
        "key": "chemical"
      },
      "amount": {
        "inputType": "number",
        "default": 0,
        "units": ["mg", "g", "kg", "mL", "L"],
        "defaultUnit": "g",
        "key": "amount"
      },
      "purity": {
        "inputType": "number",
        "default": 100,
        "units": ["%"],
        "defaultUnit": "%",
        "key": "purity"
      }
    },
    "initialItems": 2
  },
  "conditions": {
    "temperature": {
      "inputType": "number",
      "default": 25,
      "units": ["°C", "K"],
      "defaultUnit": "°C"
    },
    "pressure": {
      "inputType": "number",
      "default": 1,
      "units": ["bar", "atm", "Pa"],
      "defaultUnit": "bar"
    },
    "atmosphere": {
      "inputType": "dropdown",
      "options": ["air", "nitrogen", "argon", "vacuum"],
      "default": "air"
    },
    "duration": {
      "inputType": "text",
      "default": "2 hours",
      "placeholder": "Reaction time"
    }
  },
  "equipment": {
    "inputType": "multiQueryDropdown",
    "search": [{"tag": "instrument"}],
    "where": {
      "field": "instrument.status",
      "operator": "is",
      "value": "active"
    },
    "return": ["file.name", "instrument.type", "instrument.location"]
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": {
      "type": "function",
      "value": "experiment.type ? [`experiment`, `experiment/${experiment.type}`] : ['experiment']"
    },
    "userInputs": ["experiment.type"]
  },
  "filename": {
    "query": false,
    "inputType": "text",
    "default": {
      "type": "function",
      "value": "`${experiment.title || 'untitled_experiment'}_${experiment.type || 'unknown'}_${new Date().toISOString().split('T')[0]}`"
    },
    "userInputs": ["experiment.title", "experiment.type"]
  },
  "note_id": {
    "query": false,
    "inputType": "text",
    "default": {
      "type": "function",
      "value": "Math.random().toString(36).substr(2, 9)"
    }
  }
}
```

### Enhanced Function Descriptor Example

```json
{
  "project": {
    "name": {
      "inputType": "text",
      "default": "New Project"
    },
    "type": {
      "inputType": "dropdown",
      "options": ["research", "development", "analysis"],
      "default": "research"
    }
  },
  "generated_fields": {
    "project_code": {
      "inputType": "text",
      "default": {
        "type": "function",
        "context": ["userInput", "settings"],
        "reactiveDeps": ["project.name", "project.type"],
        "function": "({ userInput, settings }) => { const name = userInput.project?.name || 'UNNAMED'; const type = userInput.project?.type || 'UNK'; const author = settings.authors[0]?.name?.substring(0, 3).toUpperCase() || 'XXX'; const date = new Date().toISOString().substr(2, 2) + new Date().getMonth().toString().padStart(2, '0'); return `${type.toUpperCase()}-${name.replace(/\\s+/g, '').substring(0, 8).toUpperCase()}-${author}-${date}`; }",
        "fallback": "PROJECT-CODE-UNKNOWN"
      },
      "userInputs": ["project.name", "project.type"]
    },
    "summary": {
      "inputType": "text",
      "multiline": true,
      "default": {
        "type": "function",
        "context": ["userInput"],
        "reactiveDeps": ["project.name", "project.type"],
        "function": "({ userInput }) => `This ${userInput.project?.type || 'project'} project named '${userInput.project?.name || 'Untitled'}' was created on ${new Date().toLocaleDateString()}.`",
        "fallback": "Project summary will be generated automatically."
      },
      "userInputs": ["project.name", "project.type"]
    }
  }
}
```
```

## Loading Custom Templates

### Via Settings UI

1. Open Obsidian Settings
2. Navigate to the ELN Plugin settings
3. Find the template configuration section
4. Enable "Use Custom Template"
5. Specify the path to your JSON template file
6. Save the settings

### Template File Location

Place your custom template files in your vault directory or a subdirectory. Use relative paths from your vault root:

```
your-vault/
├── templates/
│   ├── my-custom-chemical.json
│   ├── my-custom-process.json
│   └── my-custom-analysis.json
└── other-files...
```

### Settings Configuration

```json
{
  "note": {
    "chemical": {
      "customMetadataTemplate": true,
      "customMetadataTemplatePath": "templates/my-custom-chemical.json",
      "metadataTemplate": {}
    }
  }
}
```

### Programmatic Loading

You can also load templates programmatically:

```typescript
import { loadMetaDataTemplate } from "path/to/loadMetaDataTemplate";

const customTemplate = await loadMetaDataTemplate("path/to/template.json");
```

## Best Practices

### 1. Template Organization

- Use nested objects to group related fields
- Keep field names descriptive and consistent
- Use lowercase with underscores for field keys

### 2. Default Values

- Always provide sensible default values
- Use function descriptors for dynamic defaults
- Consider user workflow when setting defaults

### 3. Query Configuration

- Enable queries only for fields that need to be searchable
- Use appropriate search criteria for queryDropdown fields
- Consider performance impact of complex queries

### 4. Validation

- Test your templates thoroughly before deployment
- Validate JSON syntax using online tools
- Check that all referenced functions and properties exist

### 5. Documentation

- Document custom functions and their purpose
- Include comments in your template files (where JSON supports it)
- Maintain a changelog for template versions

### 6. Backup and Version Control

- Keep backups of working templates
- Use version control for template files
- Test new templates in a separate vault first

## Troubleshooting

### Common Issues

1. **JSON Syntax Errors**: Use a JSON validator to check syntax
2. **Missing Properties**: Ensure all required properties are defined
3. **Function Errors**: Check that function descriptors reference valid code
4. **Query Failures**: Verify search criteria and field references
5. **Loading Errors**: Check file paths and permissions

### Debug Mode

Enable debug mode in plugin settings to see detailed error messages and template loading information.

### Template Validation

The plugin validates templates on load and will show error messages for:
- Invalid JSON syntax
- Missing required properties
- Invalid field types
- Circular references in function descriptors

## Support

For additional help:
- Check the plugin documentation
- Review example templates in the plugin repository
- Submit issues on the GitHub repository
- Join the community discussion forums

---

This documentation covers the complete templating system. For specific use cases or advanced scenarios, refer to the example templates provided with the plugin or create custom templates following these guidelines.
