# InputManager Key Order Preservation Fix

## Problem Identified

The original `renameKey()` and `renameInputKey()` functions in `InputManager` were changing the order of keys in objects because they:

1. Removed the old key (delete operation)
2. Added the new key (which goes to the end)

This broke the visual order of fields in forms when users renamed keys.

## Solution Implemented

Modified both `renameKey()` and `renameInputKey()` to preserve key order by:

1. Creating a new object with the same key order
2. Iterating through original keys in order  
3. Replacing the old key name with the new key name in the same position
4. Replacing the entire object content while maintaining references

## Technical Details

### Before (Problematic Approach)
```typescript
function renameKeyOld(keyPath: string, newKey: string): void {
    const value = this.getValue(keyPath);        // Get value
    this.removeValue(keyPath);                   // Remove old key (changes order!)
    this.setValue(newPath, value);               // Add new key (goes to end!)
}
```

### After (Order-Preserving Approach)
```typescript
function renameKeyNew(keyPath: string, newKey: string): void {
    // Navigate to parent object
    let current = /* navigate to parent object */;
    
    // Create new object with same key order
    const newObject = {};
    const value = current[oldKey];
    
    // Iterate through keys in original order
    for (const [key, val] of Object.entries(current)) {
        if (key === oldKey) {
            newObject[newKey] = value;  // Replace old key with new key in same position
        } else {
            newObject[key] = val;       // Keep other keys in same position
        }
    }
    
    // Replace object content while maintaining reference
    Object.keys(current).forEach(key => delete current[key]);
    Object.assign(current, newObject);
}
```

## Example Demonstration

### Original Object
```javascript
const original = {
    firstName: "John",
    lastName: "Doe",     // <- This key will be renamed
    email: "john@example.com", 
    phone: "123-456-7890"
};
```

### Old Behavior (Broken)
After renaming "lastName" to "surname":
```javascript
{
    firstName: "John",
    email: "john@example.com",
    phone: "123-456-7890", 
    surname: "Doe"              // <- Moved to end! Order changed!
}
```

### New Behavior (Fixed)
After renaming "lastName" to "surname":
```javascript
{
    firstName: "John",
    surname: "Doe",             // <- Stays in same position! Order preserved!
    email: "john@example.com",
    phone: "123-456-7890"
}
```

## Benefits of the Fix

- ✅ **Key Order Preserved**: Fields maintain their visual order in forms
- ✅ **User Experience**: Renaming a field doesn't rearrange the form
- ✅ **Predictable Behavior**: Keys stay where users expect them
- ✅ **Reference Integrity**: Object references remain valid
- ✅ **Nested Support**: Works with nested object structures

## Technical Notes

1. `Object.entries()` preserves insertion order (ES2015+ guarantee)
2. `Object.assign()` maintains property order when replacing
3. Delete + assign pattern ensures reference integrity
4. Works with nested objects through recursive navigation
5. Early returns prevent unnecessary operations

## Testing

The fix can be tested using the test cases in `/tests/InputManagerTest.ts` which demonstrates:

- Key order preservation for top-level keys
- Key order preservation for nested keys  
- Proper value preservation during rename
- Edge case handling (same key name, non-existent keys)
