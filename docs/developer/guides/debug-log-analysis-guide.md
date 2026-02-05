# What to Look For in Debug Logs - Quick Reference

## Quick Test Procedure

1. **Delete old log:** `rm test-vault/debug-log.txt` ✅ DONE
2. **Reload Obsidian** test-vault
3. **Open sample modal** (should default to compound)
4. **Observe:** Are number+unit fields showing properly? ✅ Expected: YES
5. **Change to electrode** using subclass dropdown
6. **Observe:** Are number+unit fields still showing properly? ❌ Expected: NO (bug)
7. **Change back to compound**
8. **Observe:** Are number+unit fields showing properly? ❌ Expected: NO (bug persists)

## Quick Log Analysis

### Search Commands

```bash
# Count all our markers
grep -c "🔍 \[RENDER\]" test-vault/debug-log.txt
grep -c "🔍 \[CONFIG\]" test-vault/debug-log.txt

# See all markers in order
grep "🔍 \[RENDER\]\|🔍 \[CONFIG\]" test-vault/debug-log.txt | less

# Focus on specific field (e.g., "amount")
grep -B 2 -A 15 "key.*amount" test-vault/debug-log.txt | grep -A 15 "🔍"

# Find all render() calls
grep -A 10 "🔍 \[RENDER\] render() called" test-vault/debug-log.txt

# Find all CONFIG extractions
grep -A 15 "🔍 \[CONFIG\]" test-vault/debug-log.txt

# Find all field creations
grep -A 10 "🔍 \[RENDER\] Creating" test-vault/debug-log.txt
```

## What Each Marker Shows

### 1. 🔍 [RENDER] render() called

**Purpose:** Shows when and why rendering is triggered

**Key Info to Check:**
```javascript
{
  objectPath: "sample",              // Which object being rendered
  isUpdatingTemplate: false,         // Is this a template update?
  objectKeys: ["name", "type", ...], // What fields exist
  stackTrace: "..."                  // How did we get here?
}
```

**Compare Working vs Broken:**
- Is `isUpdatingTemplate` different?
- Are `objectKeys` the same?
- Is the stack trace different? (different code path!)

### 2. 🔍 [CONFIG] Number+unit field configuration

**Purpose:** Shows how template config is extracted for number+unit fields

**Key Info to Check:**
```javascript
{
  key: "amount",                     // Field name
  fieldPath: "sample.amount",        // Full path
  templatePath: "sample.amount",     // Template lookup path
  value: {value: 0, unit: "mg"},    // Current value structure
  valueType: "object",               // Should be "object"
  valueStructure: {...},             // Actual structure
  templateField: {
    inputType: "number",             // Should be "number"
    units: ["mg", "g", "kg"],       // Available units
    defaultUnit: "mg",               // Default unit
    default: {value: 0, unit: "mg"} // Template default
  }
}
```

**Compare Working vs Broken:**
- Is `value` structure correct? `{value: 0, unit: "mg"}` vs something else?
- Is `valueType` correct? Should be "object"
- Is `templateField` correct? Should have units array
- Is `templatePath` resolving correctly?

### 3. 🔍 [RENDER] Creating number+unit field

**Purpose:** Shows what's passed to LabeledPrimitiveInput component

**Key Info to Check:**
```javascript
{
  key: "amount",                     // Field name
  inputType: "number",               // From template
  primitiveType: "number with unit", // CRITICAL - should be this!
  value: {value: 0, unit: "mg"},    // Should be object structure
  valueType: "object",               // Should be "object"
  hasUnits: true,                    // Should be true
  units: ["mg", "g", "kg"],         // Available units
  defaultUnit: "mg"                  // Default unit
}
```

**Compare Working vs Broken:**
- Is `primitiveType` correct? **CRITICAL**: Should be "number with unit"
- Is `value` correct structure? Should be `{value: X, unit: "Y"}`
- Is `valueType` correct? Should be "object"
- Is `hasUnits` true?

## Expected Patterns

### Working (Initial Render) - GOOD ✅

```
🔍 [RENDER] render() called:
  objectPath: "sample"
  isUpdatingTemplate: false

🔍 [CONFIG] Number+unit field configuration:
  key: "amount"
  value: {value: 0, unit: "mg"}      ← Object structure
  valueType: "object"                 ← Correct type
  templateField: { units: [...] }     ← Has units

🔍 [RENDER] Creating number+unit field:
  primitiveType: "number with unit"   ← Correct type!
  value: {value: 0, unit: "mg"}      ← Object structure
  hasUnits: true                      ← Correct flag
```

### Broken (After Subclass Change) - BAD ❌

**Hypothesis 1:** Value becomes string
```
🔍 [CONFIG] Number+unit field configuration:
  value: "{value: 0, unit: \"mg\"}"  ← String instead of object!
  valueType: "string"                 ← Wrong type!
```

**Hypothesis 2:** Primitive type detection fails
```
🔍 [RENDER] Creating number+unit field:
  primitiveType: "text"               ← Wrong type!
  value: {value: 0, unit: "mg"}      ← Value might be correct
  hasUnits: false                     ← Wrong flag!
```

**Hypothesis 3:** Template path resolution fails
```
🔍 [CONFIG] Number+unit field configuration:
  templatePath: "sample.amount"
  templateField: null                 ← Template not found!
```

**Hypothesis 4:** Different code path
```
🔍 [RENDER] render() called:
  stackTrace: <different from working>  ← Different caller!
```

## Analysis Strategy

### Step 1: Find the Dividing Line
```bash
# Find where subclass changes happen
grep -n "sample.type\|type.*electrode\|type.*compound" test-vault/debug-log.txt
```

### Step 2: Compare Before and After
- **Before line X:** Initial render (working)
- **After line X:** First re-render after subclass change (broken)

### Step 3: Find the Divergence
For each field (amount, mass, loading):
1. Find its working markers (before line X)
2. Find its broken markers (after line X)  
3. **Spot the difference** - what changed?

### Step 4: Trace Root Cause
- If **value** is wrong → Data handling issue
- If **primitiveType** is wrong → Type detection issue
- If **templateField** is wrong → Template resolution issue
- If **stack trace** is different → Code path issue

## Quick Grep Patterns

```bash
# See everything for "amount" field
grep -B 3 -A 15 '"amount"' test-vault/debug-log.txt

# Compare all primitiveType values
grep "primitiveType:" test-vault/debug-log.txt

# Compare all value structures  
grep -A 1 "value:" test-vault/debug-log.txt | grep -v "^--$"

# Find subclass changes
grep -i "electrode\|compound" test-vault/debug-log.txt | head -20
```

## Expected Log Size

With the noise reduction:
- **~50-100 lines** per render cycle
- **3 render cycles** (initial + 2 subclass changes)
- **~150-300 total lines** ← Much more manageable!

Compare to before: 28,327 lines → 98% reduction! 🎉

---

**Status:** Ready for testing. Reload test-vault and run through the test procedure.
