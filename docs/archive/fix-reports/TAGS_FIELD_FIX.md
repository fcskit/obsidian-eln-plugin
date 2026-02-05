# Fix: Tags Field Function Evaluation Error

## Root Cause Analysis

The error `chemical.type.map is not a function` was occurring because:

1. **Data Type Mismatch**: The `chemical.type` field uses `inputType: "subclass"`, which stores a **single string value** (e.g., `"organic"`), not an array.

2. **Function Assumption**: The tags function was written assuming `chemical.type` would be an array that could use the `.map()` method:
   ```javascript
   chemical.type.map(item => `chemical/${item}`)
   ```

3. **Context Issues**: The `processMetadata` function wasn't using the correct evaluation method for reactive function descriptors.

## Fixes Applied

### 1. Fixed Tags Function Logic
**File**: `src/templates/metadata/chemical.ts`

**Before**:
```javascript
"chemical.type ? chemical.type.map(item => `chemical/${(item || 'unknown').replace(/\\s/g, '_')}`) : ['chemical/unknown']"
```

**After**:
```javascript  
"chemical.type ? (Array.isArray(chemical.type) ? chemical.type : [chemical.type]).map(item => `chemical/${(item || 'unknown').replace(/\\s/g, '_')}`) : ['chemical/unknown']"
```

**Explanation**: The function now handles both string and array values by converting single strings to arrays before calling `.map()`.

### 2. Fixed processMetadata Function
**File**: `src/modals/notes/NewNoteModal.ts`

**Issue**: The `processMetadata` function wasn't using `evaluateUserInputFunction` for reactive function descriptors.

**Fix**: Updated to check for `userInputs` and use the appropriate evaluation method:
```typescript
if (isFunctionDescriptor(field.default)) {
    if (field.default.userInputs && field.default.userInputs.length > 0) {
        // For reactive functions, use evaluateUserInputFunction with current user data
        defaultValue = this.evaluateUserInputFunction(field.default, userInput);
    } else {
        // For non-reactive functions, evaluate normally
        const func = evaluateFunctionDescriptor(field.default, this);
        defaultValue = typeof func === "function" ? await func(userInput as JSONObject) : func;
    }
}
```

## Expected Results

1. **✅ No more `.map is not a function` errors**
2. **✅ Tags field works with single string values** (e.g., `"organic"` → `["chemical/organic"]`)
3. **✅ Tags field works with array values** (e.g., `["organic", "polymer"]` → `["chemical/organic", "chemical/polymer"]`)
4. **✅ Tags field appears in generated metadata**
5. **✅ Reactive updates work when chemical.type changes**

## Test Cases

- **Initial load**: Tags = `["chemical/unknown"]`
- **Select single type**: `chemical.type = "organic"` → Tags = `["chemical/organic"]`  
- **Multiple types** (if supported): `chemical.type = ["organic", "polymer"]` → Tags = `["chemical/organic", "chemical/polymer"]`
- **Empty/null type**: Tags fallback to `["chemical/unknown"]`

The system now robustly handles the `chemical.type` field regardless of whether it stores a single string or an array of strings.
