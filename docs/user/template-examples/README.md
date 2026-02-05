# Template Examples

This directory contains complete, ready-to-use template examples for common laboratory note types. Each template demonstrates different features of the ELN Plugin template system.

## Available Templates

### 1. Chemical Template (`chemical-template.json`)
Complete template for chemical compound documentation including:
- Basic chemical properties (formula, SMILES, molecular weight)
- Physical properties (melting point, boiling point, density)
- Safety information (hazard statements, precautionary statements)
- Solubility data
- Supplier and storage information
- **Features demonstrated**: Action text fields, nested objects, multiselect fields, safety data

### 2. Process Template (`process-template.json`)
Comprehensive template for documenting chemical processes and reactions:
- Object lists for educts and products with query dropdowns
- Detailed reaction conditions
- Equipment and safety information
- Procedure documentation
- Analytical data linking
- **Features demonstrated**: Object lists, query dropdowns, complex nested structures, dynamic field references

### 3. Analysis Template (`analysis-template.json`)
Template for analytical measurements and characterization:
- Technique-specific configurations
- Sample preparation details
- Instrument settings
- Results and peak assignments
- Quality assessment
- **Features demonstrated**: Dynamic fields, conditional options, result documentation

### 4. Project Template (`project-template.json`)
Template for project management and tracking:
- Team management with dropdowns
- Budget tracking with object lists
- Milestone and deliverable tracking
- Risk assessment
- Progress monitoring
- **Features demonstrated**: Complex object lists, team management, budget calculations, project relationships

## How to Use These Templates

### Method 1: Direct Copy
1. Copy the desired JSON file to your vault
2. In ELN Plugin settings, enable "Use Custom Template"
3. Set the path to your copied template file
4. Apply to the desired note type

### Method 2: Modification
1. Copy a template as a starting point
2. Modify field names, options, and structure as needed
3. Add or remove fields based on your requirements
4. Test with a new note to ensure functionality

### Method 3: Combination
Combine elements from different templates:
```json
{
  "basic_info": {
    // From chemical-template.json
  },
  "process_data": {
    // From process-template.json
  },
  "custom_fields": {
    // Your additions
  }
}
```

## Customization Tips

### Adding New Field Types
```json
{
  "my_new_field": {
    "inputType": "dropdown",
    "options": ["option1", "option2", "option3"],
    "default": "option1",
    "query": true
  }
}
```

### Creating Simple Lists
```json
{
  "keywords": {
    "inputType": "list",
    "listType": "text",
    "default": ["research", "experiment"]
  },
  "measurements": {
    "inputType": "list", 
    "listType": "number",
    "default": [1.5, 2.3, 4.7]
  },
  "conditions": {
    "inputType": "list",
    "listType": "boolean", 
    "default": [true, false, true]
  },
  "experiment_dates": {
    "inputType": "list",
    "listType": "date",
    "default": ["2023-01-15", "2023-02-20"]
  }
}
```

### Creating Object Lists
```json
{
  "my_list": {
    "inputType": "list",
    "listType": "object",
    "objectTemplate": [
      {
        "key": "field1",
        "inputType": "text",
        "default": ""
      },
      {
        "key": "field2",
        "inputType": "number",
        "default": 0
      }
    ]
  }
}
```

### Using Query Dropdowns
```json
{
  "related_item": {
    "inputType": "queryDropdown",
    "search": [
      {
        "tag": "target_type",
        "where": [
          {
            "field": "status",
            "operator": "is",
            "value": "active"
          }
        ]
      }
    ],
    "return": ["file.name", "relevant.field"]
  }
}
```

## Validation Checklist

Before using a template:
- [ ] Valid JSON syntax (use jsonlint.com)
- [ ] All `inputType` fields are valid
- [ ] Function descriptors use correct syntax
- [ ] Query field references exist in your vault
- [ ] Default values match field types
- [ ] Units arrays are properly formatted

## Common Issues and Solutions

### JSON Syntax Errors
- Use a JSON validator before saving
- Check for missing commas, brackets, or quotes
- Ensure proper escaping of special characters

### Function Descriptor Errors
- Verify function syntax with `this.` prefix for plugin context
- Test functions in browser console first
- Use simple expressions for reliability

### Query Failures
- Ensure target tags and fields exist in your vault
- Check field name spelling and case sensitivity
- Test queries with simple conditions first

### Performance Issues
- Limit complex queries in frequently used templates
- Use specific search criteria to reduce result sets
- Consider caching for expensive operations

## Support and Feedback

- Report issues on the GitHub repository
- Share custom templates with the community
- Suggest improvements for existing templates
- Contribute new template examples

---

These templates provide a foundation for creating sophisticated laboratory documentation systems. Modify them to match your specific workflow and requirements.
