# Dynamic Query Field Updates - Handling Changes

## Problem Statement

When a queryDropdown field has dynamic structure mapping (e.g., `process.parameters`), we need to handle:

1. **Initial render** - Auto-apply first matching item
2. **User changes selection** - Replace dynamic fields with new structure
3. **Preserve user data** - Decide what to keep vs. replace
4. **Cascade updates** - Handle nested query fields

## Scenario 1: Initial Render

### Current Behavior (Subclass)
```typescript
// When modal opens:
// 1. Template defines subclass dropdown with options
// 2. First option is automatically selected
// 3. Subclass template additions are applied
// 4. Modal renders with all fields
```

### Desired Behavior (Query with Dynamic Mapping)
```typescript
// When modal opens:
// 1. Template defines queryDropdown with search criteria
// 2. Query executes and finds matching notes
// 3. First result is automatically selected
// 4. Mapping is applied (including dynamic fields)
// 5. Dynamic fields are inferred and injected
// 6. Modal renders with all fields
```

### Implementation
```typescript
// In modal initialization
async initializeQueryDropdowns() {
    const queryFields = this.templateManager.getFieldsByType('queryDropdown');
    
    for (const field of queryFields) {
        // Execute query
        const results = await this.executeQuery(field.input.query);
        
        if (results.length > 0) {
            // Auto-select first result (like subclass)
            await this.applyQuerySelection(field.fullKey, results[0], {
                isInitial: true,
                preserveUserData: false
            });
        }
    }
}
```

## Scenario 2: User Changes Selection

### Data Flow
```
User selects new option
    ↓
Remove old dynamic fields
    ↓
Execute mapping with new data
    ↓
Infer new field structure
    ↓
Generate new dynamic fields
    ↓
Inject into template
    ↓
Preserve matching user data (optional)
    ↓
Re-render affected sections
```

### Implementation
```typescript
async handleQuerySelectionChange(
    fieldPath: string,
    selectedNote: MetadataObject,
    options: {
        preserveUserData: boolean,
        showConfirmation: boolean
    }
) {
    this.logger.debug('Query selection changed:', {
        fieldPath,
        selectedNote: selectedNote.name,
        options
    });
    
    // 1. Find mapping config for this query field
    const mappingConfig = this.getMappingForField(fieldPath);
    const dynamicMappings = mappingConfig.filter(m => m.mode === 'dynamic');
    
    // 2. If no dynamic mappings, just apply mapping and done
    if (dynamicMappings.length === 0) {
        await this.applySimpleMapping(fieldPath, selectedNote, mappingConfig);
        return;
    }
    
    // 3. Confirm with user if they have edits
    if (options.showConfirmation && this.hasUserEdits(dynamicMappings)) {
        const confirmed = await this.showConfirmDialog(
            'Change Process',
            'Changing the process will replace parameter fields. Continue?'
        );
        if (!confirmed) return;
    }
    
    // 4. Get current user data for preservation
    const currentData = options.preserveUserData 
        ? this.inputManager.getValues(dynamicMappings.map(m => m.target))
        : {};
    
    // 5. Remove old dynamic fields from template
    this.removeDynamicFields(dynamicMappings.map(m => m.target));
    
    // 6. Apply new mapping and generate new dynamic fields
    const { mappedData, dynamicFields } = await this.applyMappingWithDynamicInference(
        selectedNote,
        mappingConfig
    );
    
    // 7. Preserve matching user data if requested
    if (options.preserveUserData) {
        this.preserveMatchingFields(mappedData, currentData);
    }
    
    // 8. Inject new dynamic fields into template
    this.templateManager.applyDynamicFields(dynamicFields);
    
    // 9. Update InputManager with new data
    this.inputManager.setValues(mappedData);
    
    // 10. Re-render affected sections
    this.renderer.rerenderPath(fieldPath);
}
```

## Scenario 3: Data Preservation Strategies

### Strategy A: Replace Everything (Simple)
```typescript
// Don't preserve anything - clean slate
// Advantages:
// ✅ Simple implementation
// ✅ No confusion about data source
// ✅ Consistent with subclass switching behavior
// ✅ Safer - no mixed state
//
// Disadvantages:
// ❌ User loses all edits
// ❌ Must re-enter data if switching back

async preserveMatchingFields(newData: any, oldData: any) {
    // Do nothing - just use newData
    return newData;
}
```

### Strategy B: Preserve Exact Field Matches (Smart)
```typescript
// Preserve user edits where field paths exactly match
// Advantages:
// ✅ Respects user work
// ✅ Useful for common fields (temperature, pressure, etc.)
// ✅ Handles back-and-forth switching well
//
// Disadvantages:
// ❌ More complex
// ❌ Potential for stale/incorrect data
// ❌ May not be obvious which data is from where

function preserveMatchingFields(
    newData: Record<string, any>,
    oldData: Record<string, any>
): Record<string, any> {
    const preserved = { ...newData };
    
    // Recursively check for matching paths
    function preservePath(newObj: any, oldObj: any, path: string[]) {
        if (typeof newObj !== 'object' || newObj === null) {
            // Leaf node - check if old has value and preserve it
            if (oldObj !== undefined && oldObj !== null) {
                // Only preserve if user actually edited it
                if (hasUserEdit(path.join('.'))) {
                    return oldObj;
                }
            }
            return newObj;
        }
        
        const result = { ...newObj };
        for (const key in newObj) {
            if (oldObj && key in oldObj) {
                result[key] = preservePath(
                    newObj[key],
                    oldObj[key],
                    [...path, key]
                );
            }
        }
        return result;
    }
    
    return preservePath(newData, oldData, []);
}
```

### Strategy C: Ask User (Safest but Annoying)
```typescript
// Show confirmation dialog with preview of changes
// Advantages:
// ✅ User is in control
// ✅ No surprises
// ✅ Can show diff preview
//
// Disadvantages:
// ❌ Interrupts workflow
// ❌ Most users will just click "OK"
// ❌ Annoying for power users

async handleQuerySelectionChange(...) {
    if (this.hasUserEdits(dynamicMappings)) {
        const options = await this.showChangeDialog({
            title: 'Process Parameters Will Change',
            message: 'You have edited parameters. What would you like to do?',
            options: [
                { label: 'Keep My Edits (where field names match)', value: 'preserve' },
                { label: 'Use New Process Parameters', value: 'replace' },
                { label: 'Cancel', value: 'cancel' }
            ]
        });
        
        if (options === 'cancel') return;
        preserveUserData = options === 'preserve';
    }
}
```

### Recommendation: **Strategy A (Replace Everything) Initially**

Start with Strategy A because:
1. Simplest to implement correctly
2. Consistent with current subclass behavior
3. Safer - no mixed state issues
4. Can always add Strategy B later if users request it

## Scenario 4: Nested Query Fields

### Problem
```typescript
{
    "fullKey": "sample.process",
    "mapping": [
        { 
            "target": "sample.parameters", 
            "source": "process.parameters",
            "mode": "dynamic"
        }
    ]
}

// process.parameters contains:
{
    "device": {
        "name": "Oven A",
        "link": "[[Oven A]]"
    }
}

// Should we ALSO query [[Oven A]] and pull its parameters?
```

### Options

**Option 1: No Cascade** (Simple)
```typescript
// Just copy device info as-is, don't query further
// User can manually add device parameters if needed
```

**Option 2: Manual Cascade** (Explicit)
```typescript
// Template explicitly defines nested query
{
    "fullKey": "sample.process",
    "mapping": [
        { 
            "target": "sample.parameters", 
            "source": "process.parameters",
            "mode": "dynamic"
        },
        {
            "target": "sample.device parameters",
            "source": "process.device parameters",
            "mode": "dynamic"
        }
    ]
}
```

**Option 3: Auto-detect Links** (Smart but Complex)
```typescript
// Automatically detect [[links]] in dynamic data
// Query linked notes and pull their parameters
// Probably too magical and could cause infinite loops
```

### Recommendation: **Option 2 (Manual Cascade)**

Template explicitly defines what gets queried:
```typescript
{
    "fullKey": "sample.process",
    "mapping": [
        { 
            "target": "sample.process.name", 
            "source": "process.name",
            "display": true
        },
        { 
            "target": "sample.process.link", 
            "source": "file.link"
        },
        // Explicitly map parameters
        { 
            "target": "sample.parameters", 
            "source": "process.parameters",
            "mode": "dynamic",
            "editable": true
        },
        // Explicitly map device parameters
        { 
            "target": "sample.device parameters", 
            "source": "process.device parameters",
            "mode": "dynamic",
            "editable": true
        }
    ]
}
```

## Implementation Checklist

### Phase 1: Initial Render ✅
- [ ] Execute queries for all queryDropdown fields on modal init
- [ ] Auto-select first result
- [ ] Apply mapping including dynamic fields
- [ ] Render with generated fields

### Phase 2: Selection Changes (Replace Strategy)
- [ ] Detect when user changes queryDropdown selection
- [ ] Remove old dynamic fields from template
- [ ] Apply new mapping and generate new dynamic fields
- [ ] Replace all data (no preservation)
- [ ] Re-render affected sections

### Phase 3: Edit Tracking
- [ ] Track which dynamic fields user has edited
- [ ] Show confirmation dialog if user has edits and changes selection
- [ ] Provide "are you sure?" protection

### Phase 4: Data Preservation (Future)
- [ ] Implement field-level preservation strategy
- [ ] Match old and new fields by path
- [ ] Preserve user edits where paths match
- [ ] Clear non-matching fields

### Phase 5: Multiple Query Fields
- [ ] Handle multiple independent queryDropdown fields
- [ ] Each query field manages its own dynamic fields
- [ ] No conflicts between different query fields' dynamic fields

### Phase 6: Nested Queries (Future)
- [ ] Support querying linked notes
- [ ] Manual cascade through mapping config
- [ ] Prevent infinite loops

## Summary

**For now, implement:**
1. ✅ Auto-select first query result on initial render
2. ✅ Replace all dynamic fields when selection changes (Strategy A)
3. ✅ Show confirmation if user has edited dynamic fields
4. ✅ Support multiple independent query fields

**Future enhancements:**
5. ⏳ Preserve matching user edits (Strategy B)
6. ⏳ Cascade to linked notes (Option 2 - explicit mapping)
7. ⏳ Better UI for reviewing changes before applying

**Key Decision: Start with Strategy A (Replace Everything)**
- Simpler, safer, consistent with subclass behavior
- Can add preservation later if users request it
