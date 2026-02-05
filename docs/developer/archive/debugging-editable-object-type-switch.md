# Debugging EditableObject Type Switch After Rename

## Issue Description

When renaming an editableObject field and then switching its type, the operation fails:
- Field appears with old key name + new key name
- Type switch not applied to either key
- Values lost or rendered incorrectly

Example:
1. Rename `param1` → `temperature`
2. Switch type to `boolean`
3. Result: Shows both `param1` (empty text) and `temperature` (empty text), original `param2` unchanged

## Debug Logging Added

### Console Messages to Watch

All debug messages use `console.warn()` with emoji prefixes for easy filtering:

#### Key Rename Operation (`🔄 [KEY RENAME]`)
```
🔄 [KEY RENAME] Key rename initiated
🔄 [KEY RENAME] Computed new fullKey
✅ [KEY RENAME] changeKeyName completed
✅ [KEY RENAME] Container updated
```

**Location**: `src/ui/renderer/npe/core/renderPrimitive.ts`

**What to check**:
- Does `newFullKey` correctly reflect the renamed key?
- Does `container.getAttribute("data-key")` update correctly?
- Is `changeKeyName` completing successfully?

#### Type Switch Menu (`🔧 [TYPE SWITCH]`)
```
🔧 [TYPE SWITCH] Menu opened
🔄 [TYPE SWITCH] Type switch initiated
🔍 [TYPE SWITCH] Retrieved frontmatter value
📦 [TYPE SWITCH] Switching to object (if object type)
📋 [TYPE SWITCH] Switching to list (if list type)
🔢 [TYPE SWITCH] Switching to primitive type (for text/number/boolean/link)
✅ [TYPE SWITCH] Primitive type switch completed
⚠️ [TYPE SWITCH] No type change - same type selected
```

**Location**: `src/ui/renderer/npe/helpers/showTypeSwitchMenu.ts`

**What to check**:
- Does `currentFullKey` match the renamed key?
- Is `currentKey` extracted correctly?
- Does the retrieved frontmatter value exist?

#### Frontmatter Value Lookup (`🔍 [GET VALUE]`)
```
🔍 [GET VALUE] Looking up key
🔍 [GET VALUE] Traversal failed - not an object
🔍 [GET VALUE] Key not found
🔍 [GET VALUE] Value found
```

**Location**: `src/ui/renderer/npe/helpers/getFrontmatterValue.ts`

**What to check**:
- Does the lookup use the correct (renamed) key?
- Are the available keys in the frontmatter correct?
- Is the value retrieved successfully?

## Testing Procedure

1. **Open a device note** in the test vault
2. **Open browser console** (Cmd+Option+I on Mac)
3. **Filter console** by typing `TYPE SWITCH` or `KEY RENAME` in the filter box
4. **Perform the operation**:
   - Click on `param1` key label
   - Change text to `temperature`
   - Click outside to trigger blur (rename)
   - Click the ellipsis (...) button
   - Select a type (e.g., `boolean`)
5. **Review console output** in chronological order

## Expected Flow

### Successful Rename + Type Switch

```
1. 🔄 [KEY RENAME] Key rename initiated
   - Shows oldKey: "param1", newKey: "temperature"
   
2. 🔄 [KEY RENAME] Computed new fullKey
   - Shows newFullKey: "device.parameters.temperature"
   
3. ✅ [KEY RENAME] changeKeyName completed
   
4. ✅ [KEY RENAME] Container updated
   - containerDataKey: "device.parameters.temperature"
   
5. 🔧 [TYPE SWITCH] Menu opened
   - currentFullKey: "device.parameters.temperature" ✅
   - currentKey: "temperature" ✅
   
6. 🔄 [TYPE SWITCH] Type switch initiated
   - from: "text", to: "boolean"
   - currentFullKey: "device.parameters.temperature" ✅
   
7. 🔍 [GET VALUE] Looking up key
   - fullKey: "device.parameters.temperature" ✅
   
8. 🔍 [GET VALUE] Value found (or Key not found if renamed)
   
9. 🔢 [TYPE SWITCH] Switching to primitive type
   
10. ✅ [TYPE SWITCH] Primitive type switch completed
```

## Common Issues to Look For

### Issue 1: Stale fullKey in Type Switch Menu
**Symptom**: `currentFullKey` still shows old key name
**Log check**: Compare `passedFullKey` vs `currentFullKey` in "Menu opened"
**Fix**: Ensure `container.getAttribute("data-key")` returns updated value

### Issue 2: Frontmatter Not Updated After Rename
**Symptom**: `getFrontmatterValue` can't find renamed key
**Log check**: Look at `availableKeys` in "Key not found" message
**Cause**: `changeKeyName` function might not be completing or cached metadata not updated

### Issue 3: Container data-key Not Updated
**Symptom**: `containerDataKey` doesn't match renamed key
**Log check**: Compare `containerDataKey` in "Container updated" vs "Menu opened"
**Cause**: Container update might be happening after type switch menu opens

### Issue 4: Multiple Containers with Same Key
**Symptom**: Old key still rendered after rename
**Cause**: DOM not properly cleaned up, multiple containers exist
**Check**: Search DOM for `data-key="device.parameters.param1"`

## Next Steps After Debugging

Based on console output, we can determine:
1. **Is the rename operation completing successfully?**
   - If no: Fix `changeKeyName` or container update timing
   - If yes: Continue to next check

2. **Is the type switch menu receiving correct keys?**
   - If no: Fix how `data-key` attribute is read or timing of menu open
   - If yes: Continue to next check

3. **Is frontmatter lookup successful?**
   - If no: Check metadata cache refresh or key path construction
   - If yes: Issue is in rendering logic

4. **Are there duplicate containers?**
   - If yes: Need to clean up old containers before/after rename
   - If no: Issue is in single container state management

## Build and Test

```bash
npm run build-fast
```

Then reload Obsidian and test the device note's parameters field.
