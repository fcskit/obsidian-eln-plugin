# Quick Debug Reference - Subclass Rendering Issue

## 🎯 Quick Start

1. **Delete** `debug-log.txt` from vault root
2. **Open** Create New Sample modal
3. **Do** your test (see below)
4. **Close** modal without saving
5. **Search** log for these patterns

## 🔍 What to Search For

### Pattern 1: Your Field Name
```
Search: "amount"  (for compound educts)
Search: "mass"    (for electrode active material)
Search: "loading" (for electrode active material)
```

### Pattern 2: Debug Markers
```
Search: 🔍 [CONFIG] Number+unit
Search: 🔍 [RENDER] Creating number+unit
Search: 🔍 [RENDER] render() called
```

## ✅ Working Example (Initial Render)
```log
🔍 [CONFIG] Number+unit field configuration: {
  key: "amount",
  value: { value: 0, unit: "mg" },  <-- ✅ Structured object
  valueType: "object",               <-- ✅ Correct type
  templateField: {
    inputType: "number",             <-- ✅ Found
    units: ["mg", "g", "kg"]         <-- ✅ Array present
  }
}

🔍 [RENDER] Creating number+unit field: {
  key: "amount",
  primitiveType: "number with unit", <-- ✅ Correct type
  value: { value: 0, unit: "mg" },  <-- ✅ Still structured
  hasUnits: true,                    <-- ✅ Units detected
  units: ["mg", "g", "kg"]           <-- ✅ Passed through
}
```

## ❌ What Broken Might Look Like

### Broken Scenario A: Value Corruption
```log
🔍 [CONFIG] Number+unit field configuration: {
  value: { value: 0, unit: "mg" },  <-- ✅ Still good here
  ...
}

🔍 [RENDER] Creating number+unit field: {
  value: 0,                          <-- ❌ CORRUPTED! Lost structure
  primitiveType: "number",           <-- ❌ Wrong type (no "with unit")
  hasUnits: false                    <-- ❌ Units lost
}
```

### Broken Scenario B: Template Not Found
```log
🔍 [CONFIG] Number+unit field configuration: {
  value: { value: 0, unit: "mg" },
  templateField: undefined           <-- ❌ TEMPLATE NOT FOUND!
}

🔍 [RENDER] Creating number+unit field: {
  primitiveType: "number",           <-- ❌ Defaults to plain number
  hasUnits: false,                   <-- ❌ No template means no units
  units: undefined                   <-- ❌ Can't get units
}
```

## 📝 Tests to Run

### Test 1: Baseline (WORKS)
- Open modal (compound default)
- Look at educts `amount` field
- Should render correctly

### Test 2: Electrode (BROKEN?)
- Open modal
- Change to "electrode"
- Look at active material `mass` field
- May render incorrectly

### Test 3: Round Trip (BROKEN?)
- Open modal (compound)
- Change to "electrode"  
- Change back to "compound"
- Look at educts `amount` field
- May now render incorrectly

## 💡 Key Insights

**If value is corrupt**: Problem between createFieldConfig() and renderPrimitiveField()
**If template not found**: Problem with templatePath calculation during re-render
**If hasUnits is false**: Problem with mapInputTypeToPrimitive() detection

## 🐛 Report Format

When reporting, include:
```
Field: <field name>
Test: <which test>
Issue: <what's wrong in the log>

Log excerpt:
<paste the 🔍 [CONFIG] section>
<paste the 🔍 [RENDER] section>
```

## 📌 Remember

- Fresh log for each test
- Search for field name first
- Then look for 🔍 markers
- Compare working vs. broken
- Focus on what's different
