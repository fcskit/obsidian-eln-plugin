# Template Integration Example

This document demonstrates how to use the new `insertAfter` and `insertBefore` functionality in the InputManager with subclass metadata templates.

## Example: Active Material Template

The `activeMaterial.ts` template demonstrates the use of `insertAfter` positioning:

```typescript
export const activeMaterialSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.theoretical capacity",
            "insertAfter": "chemical.properties.density",
            "input": {
                "query": true,
                "inputType": "number",
                "units": ["mAh/g", "Ah/kg"],
                "defaultUnit": "mAh/g",
            }
        },
        {
            "fullKey": "chemical.properties.storage mechanism",
            "insertAfter": "chemical.properties.theoretical capacity",
            "input": {
                "query": true,
                "inputType": "dropdown",
                "options": [
                    "intercalation",
                    "conversion",
                    "alloying",
                    "other"
                ],
                "default": "intercalation",
            }
        }
    ]
};
```

## Using the InputManager

### Method 1: Direct API Usage

```typescript
// Using the new position parameter format
inputManager.addKeyAtPosition(
    "chemical.properties", 
    "theoretical capacity", 
    "150 mAh/g",
    { insertAfter: "density" }
);

// Using insertBefore
inputManager.addKeyAtPosition(
    "chemical.properties", 
    "flash point", 
    "50°C",
    { insertBefore: "boiling point" }
);
```

### Method 2: Convenience Methods

```typescript
// Using template-style convenience methods
inputManager.addFieldWithInsertAfter(
    "chemical.properties", 
    "theoretical capacity", 
    "150 mAh/g", 
    "density"
);

inputManager.addFieldWithInsertBefore(
    "chemical.properties", 
    "flash point", 
    "50°C", 
    "boiling point"
);
```

### Method 3: Combined Data and Input

```typescript
// Add both data and input component with positioning
inputManager.addFieldWithInput(
    "chemical.properties",
    "theoretical capacity",
    "150 mAh/g",
    {
        inputType: "number",
        units: ["mAh/g", "Ah/kg"],
        defaultUnit: "mAh/g"
    },
    { insertAfter: "density" }
);
```

## Template Processing Example

When processing a template like `activeMaterial.ts`, you can now directly use the `insertAfter` property:

```typescript
// Process template add operations
template.add.forEach(operation => {
    if (operation.insertAfter) {
        // Extract parent path and key from fullKey
        const keyParts = operation.fullKey.split('.');
        const newKey = keyParts.pop();
        const parentPath = keyParts.join('.');
        
        // Extract reference key from insertAfter
        const afterKeyParts = operation.insertAfter.split('.');
        const afterKey = afterKeyParts.pop();
        
        // Add with insertAfter positioning
        inputManager.addKeyAtPosition(
            parentPath,
            newKey,
            operation.input?.default || "",
            { insertAfter: afterKey }
        );
        
        // Add input component if specified
        if (operation.input) {
            inputManager.addInputAtPosition(
                parentPath,
                newKey,
                operation.input,
                { insertAfter: afterKey }
            );
        }
    }
});
```

## Supported Position Types

The InputManager now supports these position specifications:

1. **"start"** - Insert at the beginning
2. **"end"** - Insert at the end (default)
3. **{insertAfter: "keyName"}** - Insert after the specified key
4. **{insertBefore: "keyName"}** - Insert before the specified key
5. **"keyName"** - Legacy: insert after the specified key (for backward compatibility)

## Key Order Preservation

The InputManager preserves the insertion order of object keys, ensuring that:

1. When adding with `insertAfter`, the new key appears immediately after the reference key
2. When adding with `insertBefore`, the new key appears immediately before the reference key
3. If the reference key is not found, the new key is added at the end
4. The order of all other keys remains unchanged

This enables precise control over field ordering in template-driven interfaces.
