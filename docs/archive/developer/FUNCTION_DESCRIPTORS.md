# Function Descriptors in Metadata Templates
# Function Descriptors (Detailed)

Function descriptors are used to define available functions for dynamic templates and automation in the plugin.

## Structure

- `name`: Function name
- `description`: What the function does
- `parameters`: List of parameter objects
- `returns`: Return type

## Example

```json
{
  "name": "average",
  "description": "Calculate the average of a list of numbers",
  "parameters": [
    { "name": "numbers", "type": "number[]", "description": "Numbers to average" }
  ],
  "returns": "number"
}
```
## Overview

To improve type safety and eliminate bundling warnings from `eval` usage, the plugin now supports explicit function descriptors in metadata templates. Instead of using string-based function definitions that rely on pattern matching, you can now explicitly declare functions using a structured format.

## Migration from String-based Functions

### Before (Legacy - still supported but deprecated)
```typescript
// Template field with string-based function
{
  query: true,
  inputType: "text",
  default: "this.getCurrentDate()",
  callback: "(value) => value.trim()",
  action: "this.openDialog"
}
```

### After (Recommended)
```typescript
// Template field with function descriptors
{
  query: true,
  inputType: "text",
  default: { 
    type: "function", 
    value: "this.getCurrentDate()" 
  },
  callback: { 
    type: "function", 
    value: "(value) => value.trim()" 
  },
  action: { 
    type: "function", 
    value: "this.openDialog" 
  }
}
```

## Function Descriptor Format

```typescript
interface FunctionDescriptor {
  type: "function";
  value: string; // The function code as a string
}
```

## Supported Function Types

### 1. Instance Methods
```typescript
{
  default: { 
    type: "function", 
    value: "this.getCurrentDate()" 
  }
}
```

### 2. Arrow Functions
```typescript
{
  callback: { 
    type: "function", 
    value: "(value) => value.trim()" 
  }
}
```

### 3. Constructor Calls
```typescript
{
  options: { 
    type: "function", 
    value: "new Date().toISOString()" 
  }
}
```

### 4. Regular Functions
```typescript
{
  callback: { 
    type: "function", 
    value: "function(value) { return value.toLowerCase(); }" 
  }
}
```

## JSON Compatibility

Function descriptors are fully JSON-compatible, making it possible to store metadata templates in external JSON files:

```json
{
  "author": {
    "query": true,
    "inputType": "text",
    "default": {
      "type": "function",
      "value": "this.getCurrentUser()"
    }
  }
}
```

## Benefits

1. **Type Safety**: Explicit declaration of functions vs. values
2. **Bundle Safety**: No `eval` usage, compatible with all bundlers
3. **JSON Compatible**: Can be stored in external JSON files
4. **Clear Intent**: Obvious when a property contains a function
5. **Tool Support**: Better IDE support and validation

## Migration Timeline

- **Current**: Both legacy strings and function descriptors are supported
- **Future**: Legacy string-based functions will show deprecation warnings
- **Recommended**: Migrate existing templates to use function descriptors

## New Input Type: "list"

The plugin now supports a "list" input type for comma-separated values that are automatically converted to arrays:

### Basic Usage
```typescript
{
  tags: {
    query: true,
    inputType: "list",
    default: "chemistry, analysis, experiment",
    info: "Enter comma-separated tags"
  }
}
```

### With Data Type Specification
```typescript
{
  temperatures: {
    query: true,
    inputType: "list",
    dataType: "number", // "text" (default), "number", or "boolean"
    default: "25, 50, 75",
    info: "Enter comma-separated temperature values"
  }
}
```

### Supported Data Types
- **"text"** (default): Returns `string[]` - comma-separated strings
- **"number"**: Returns `number[]` - converts each item to number
- **"boolean"**: Returns `boolean[]` - converts each item to boolean

### With Function Descriptors
```typescript
{
  keywords: {
    query: true,
    inputType: "list",
    default: {
      type: "function",
      value: "this.getDefaultKeywords()"
    },
    callback: {
      type: "function", 
      value: "(values) => values.map(v => v.toLowerCase().trim())"
    }
  }
}
```

## Reactive User Input Dependencies

When function descriptors need to react to user input changes, use the `userInputs` field to specify dependencies:

### Basic Reactive Field
```typescript
{
  tags: {
    query: false,
    inputType: "list", 
    default: {
      type: "function",
      value: "chemical.type ? chemical.type.map(item => `chemical/${item}`) : ['chemical/unknown']"
    },
    userInputs: ["chemical.type"] // This field will update when chemical.type changes
  }
}
```

### Multiple Dependencies
```typescript
{
  computedField: {
    query: true,
    inputType: "text",
    default: {
      type: "function", 
      value: "`${sample.name}-${sample.batch || '001'}`"
    },
    userInputs: ["sample.name", "sample.batch"] // Updates when either field changes
  }
}
```

### Reactive Options
```typescript
{
  relatedItems: {
    query: true,
    inputType: "dropdown",
    options: {
      type: "function",
      value: "project.category ? this.getItemsByCategory(project.category) : []"
    },
    userInputs: ["project.category"] // Options update when category changes
  }
}
```

### Benefits of Reactive Dependencies

1. **Real-time Updates**: Fields automatically update when their dependencies change
2. **Clean Syntax**: No need for `userInput` parameter, direct field access
3. **Explicit Dependencies**: Clear declaration of which fields affect others
4. **Performance**: Only dependent fields are recalculated when needed
