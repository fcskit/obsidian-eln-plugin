# Phased Migration Strategy - Visual Guide

## Overview: Incremental, Risk-Minimized Migration

```
┌─────────────────────────────────────────────────────────────────┐
│                        Current State                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TemplateEvaluator.ts (Legacy)                                  │
│  ├─ Evaluates metadata template functions ✅ WORKS              │
│  └─ Has old function format support                             │
│                                                                  │
│  Path Generation                                                 │
│  └─ Broken ❌ (titleTemplate/folderTemplate issues)             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Fix Path Generation (Keep Everything Else Working)

### Strategy: Build NEW Components, Don't Touch Working Code

```
┌─────────────────────────────────────────────────────────────────┐
│                         Phase 1 Goal                             │
│          Fix fileName/folderPath WITHOUT breaking metadata       │
└─────────────────────────────────────────────────────────────────┘

Step 1.1: Create Safe Context Interfaces
┌─────────────────────────────────────────────┐
│   ContextProviders.ts (NEW)                 │
│   ├─ PluginContext (safe)                   │
│   ├─ SettingsContext (safe)                 │
│   ├─ FileSystemContext (safe)               │
│   └─ ContextFactory                         │
└─────────────────────────────────────────────┘

Step 1.2: Create NEW Function Evaluator
┌─────────────────────────────────────────────┐
│   FunctionEvaluator.ts (NEW)                │
│   ├─ Simple expression syntax               │
│   ├─ Complex function syntax                │
│   ├─ Context inference                      │
│   └─ Uses ContextProviders (safe)           │
└─────────────────────────────────────────────┘
          │
          │ Used by (NEW component)
          ▼
┌─────────────────────────────────────────────┐
│   PathEvaluator.ts (NEW)                    │
│   ├─ Evaluates fileName segments            │
│   ├─ Evaluates folderPath segments          │
│   └─ Uses FunctionEvaluator                 │
└─────────────────────────────────────────────┘
          │
          │ Used by
          ▼
┌─────────────────────────────────────────────┐
│   NoteCreator.ts (MODIFIED)                 │
│   └─ Use PathEvaluator for paths            │
└─────────────────────────────────────────────┘

Meanwhile...
┌─────────────────────────────────────────────┐
│   TemplateEvaluator.ts (UNCHANGED!)         │
│   └─ Still evaluates metadata functions     │
│      Using legacy code ✅ STILL WORKS       │
└─────────────────────────────────────────────┘
```

### Phase 1 Architecture

```
Note Creation Flow in Phase 1:

User Creates Note
      │
      ▼
NewNoteModal (collects user input)
      │
      ├─────────────────┬──────────────────┐
      │                 │                  │
      ▼                 ▼                  ▼
  Metadata        fileName           folderPath
      │               │                  │
      │               │                  │
      ▼               └──────┬───────────┘
TemplateEvaluator          │
  (LEGACY - unchanged)     ▼
      │              PathEvaluator (NEW!)
      │                   │
      │                   ├─ Literal segments
      │                   ├─ Field segments
      │                   ├─ Counter segments
      │                   └─ Function segments
      │                         │
      │                         ▼
      │                   FunctionEvaluator (NEW!)
      │                         │
      │                         ├─ Simple expressions
      │                         ├─ Complex functions
      │                         └─ Safe contexts
      │                               │
      └───────────────┬───────────────┘
                      │
                      ▼
                 NoteCreator
                      │
                      ▼
               File Created! ✅
```

### Key Benefits:

```
✅ Isolated Testing
   └─ PathEvaluator tested independently
   └─ Metadata evaluation unchanged

✅ Risk Mitigation  
   └─ Working code stays working
   └─ New code in separate files

✅ Easy Rollback
   └─ Just stop using PathEvaluator
   └─ Revert NoteCreator changes

✅ Incremental Progress
   └─ Can deploy Phase 1 alone
   └─ Delivers immediate value
```

---

## Phase 2: Migrate Metadata Evaluation (After Phase 1 Proven)

### Strategy: Replace Legacy with Proven New Code

```
┌─────────────────────────────────────────────────────────────────┐
│                         Phase 2 Goal                             │
│     Replace legacy function evaluation with FunctionEvaluator    │
│              (Only after PathEvaluator is proven!)               │
└─────────────────────────────────────────────────────────────────┘

Before Phase 2:
┌─────────────────────────────────────────────┐
│   TemplateEvaluator.ts                      │
│   ├─ Legacy function evaluation ❌          │
│   └─ Used for metadata templates            │
└─────────────────────────────────────────────┘

Step 2.1: Refactor TemplateEvaluator
┌─────────────────────────────────────────────┐
│   TemplateEvaluator.ts (MODIFIED)           │
│   ├─ Add FunctionEvaluator instance         │
│   ├─ Delegate to FunctionEvaluator          │
│   ├─ Keep legacy support temporarily        │
│   └─ Deprecation warnings                   │
└─────────────────────────────────────────────┘
          │
          │ Uses
          ▼
┌─────────────────────────────────────────────┐
│   FunctionEvaluator.ts                      │
│   └─ Now used by BOTH                       │
│      ├─ PathEvaluator ✅                    │
│      └─ TemplateEvaluator ✅                │
└─────────────────────────────────────────────┘

Step 2.2: Convert Templates
┌─────────────────────────────────────────────┐
│   Metadata Templates                        │
│   ├─ Convert function descriptors           │
│   ├─ Test each template                     │
│   └─ Remove legacy format                   │
└─────────────────────────────────────────────┘

Step 2.3: Remove Legacy Code
┌─────────────────────────────────────────────┐
│   TemplateEvaluator.ts (CLEANED)            │
│   ├─ Legacy code removed ✅                 │
│   └─ Uses FunctionEvaluator only            │
└─────────────────────────────────────────────┘
```

### Phase 2 Complete Architecture

```
Note Creation Flow After Phase 2:

User Creates Note
      │
      ▼
NewNoteModal
      │
      ├─────────────────┬──────────────────┐
      │                 │                  │
      ▼                 ▼                  ▼
  Metadata        fileName           folderPath
      │               │                  │
      ▼               └──────┬───────────┘
TemplateEvaluator          │
  (MODERNIZED!)            ▼
      │              PathEvaluator
      │                   │
      └─────────┬─────────┘
                │
                ▼
         FunctionEvaluator
         (Used by BOTH!)
                │
                ├─ Simple expressions
                ├─ Complex functions
                └─ Safe contexts
                      │
                      ▼
              Unified, Safe, Consistent! ✅
```

---

## Phase 3: Advanced Features (After Core is Solid)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Phase 3 Goal                             │
│           Add advanced features on solid foundation              │
└─────────────────────────────────────────────────────────────────┘

├─ Subclass improvements
│  ├─ extend/override/remove operations
│  └─ Markdown inheritance modes
│
├─ Template import/export
│  ├─ JSON format
│  └─ Validation
│
└─ Template marketplace
   └─ Share templates with community
```

---

## Timeline & Risk Assessment

### Phase 1: 2-3 weeks (LOW RISK)
```
Week 1:
├─ ContextProviders.ts       [2 days]
├─ FunctionEvaluator.ts      [2 days]
└─ Unit tests                [1 day]

Week 2:
├─ Type definitions          [1 day]
├─ PathEvaluator.ts          [2 days]
├─ Migration utilities       [1 day]
└─ Unit tests                [1 day]

Week 3:
├─ Integration               [2 days]
├─ Update metadata templates [1 day]
├─ Testing                   [1 day]
└─ Bug fixes                 [1 day]

Risk: LOW
└─ New code in separate files
└─ Existing functionality unchanged
└─ Easy to rollback
```

### Phase 2: 1-2 weeks (MEDIUM RISK - but mitigated)
```
Week 4:
├─ Modify TemplateEvaluator  [2 days]
├─ Convert one template      [1 day]
├─ Test thoroughly           [1 day]
└─ Convert remaining         [1 day]

Week 5 (if needed):
├─ Remove legacy code        [1 day]
├─ Final testing             [2 days]
└─ Documentation             [2 days]

Risk: MEDIUM → LOW
└─ FunctionEvaluator proven in Phase 1
└─ Temporary backward compatibility
└─ Template-by-template migration
```

### Phase 3: 2-3 weeks (LOW RISK)
```
Weeks 6-8:
├─ Subclass system           [1 week]
├─ Import/export             [1 week]
└─ Testing & polish          [1 week]

Risk: LOW
└─ All new features
└─ Built on solid foundation
```

---

## Comparison: Incremental vs Big Bang

### ❌ Big Bang Approach (Risky)
```
Modify TemplateEvaluator.ts directly
      │
      ├─ Breaks metadata templates ❌
      ├─ Breaks path generation ❌
      ├─ Breaks existing notes ❌
      └─ Hard to debug what broke
      
Testing: Everything at once
Rollback: Impossible
Risk: HIGH ⚠️
```

### ✅ Incremental Approach (Safe)
```
Phase 1: New files, isolated testing
      │
      ├─ Metadata still works ✅
      ├─ Can test path generation independently
      └─ Easy to debug issues
      
Phase 2: Proven code replaces legacy
      │
      ├─ FunctionEvaluator already proven
      ├─ Template-by-template migration
      └─ Backward compatible during transition
      
Testing: Each component independently
Rollback: Easy at any point
Risk: LOW ✅
```

---

## Success Criteria

### Phase 1 Complete When:
- ✅ PathEvaluator generates correct file names
- ✅ PathEvaluator generates correct folder paths
- ✅ All existing metadata templates still work
- ✅ Notes create successfully with new paths
- ✅ All unit tests pass
- ✅ Integration tests pass
- ✅ Manual testing confirms no regressions

### Phase 2 Complete When:
- ✅ TemplateEvaluator uses FunctionEvaluator
- ✅ All metadata templates use new format
- ✅ Legacy code removed
- ✅ All tests pass
- ✅ No regressions in existing functionality

### Phase 3 Complete When:
- ✅ Advanced features implemented
- ✅ Templates can be imported/exported
- ✅ Documentation complete
- ✅ User feedback positive

---

## Key Principle: Separation of Concerns

```
Phase 1:
  ┌─────────────────────┐     ┌─────────────────────┐
  │  Path Generation    │     │ Metadata Evaluation │
  │                     │     │                     │
  │  NEW                │     │  OLD (unchanged)    │
  │  ├─ FunctionEval.   │     │  └─ TemplateEval.   │
  │  └─ PathEval.       │     │                     │
  └─────────────────────┘     └─────────────────────┘
       ✅ Can test              ✅ Still works
         independently            as before

Phase 2:
  ┌──────────────────────────────────────────┐
  │     Both Use FunctionEvaluator           │
  │                                          │
  │  ├─ Path Generation    (proven in P1)   │
  │  └─ Metadata Evaluation (migrated in P2)│
  └──────────────────────────────────────────┘
       ✅ Unified, consistent, safe
```

**This is how we minimize risk while maximizing progress!** 🚀
