# QueryDropdown Migration Notes

## Current Status (v0.7.0)

QueryDropdown fields currently use the **legacy FunctionEvaluatorLegacy** system, which supports:
- Arrow function syntax with `function: "({ param }) => ..."`
- Special contexts: `frontmatter` and `selection` (not yet in new FunctionEvaluator)
- Enhanced format with `context`, `reactiveDeps`, and `fallback`

## Templates Using Advanced QueryDropdown Features

### analysis.ts - Complex Frontmatter-Based QueryDropdown

The `analysis.method` field uses sophisticated queryDropdown features:

```typescript
"method": {
    "inputType": "queryDropdown",
    "from": {
        type: "function",
        context: ["userInput"],
        reactiveDeps: ["analysis.instrument.name"],
        function: "({ userInput }) => userInput.analysis.instrument.name",
        fallback: ""
    },
    "get": {
        type: "function",
        context: ["frontmatter"],
        function: "({ frontmatter }) => frontmatter.instrument?.methods?.map((item) => item.name) || []",
        fallback: []
    },
    "return": {
        "analysis.method.name": {
            type: "function",
            context: ["selection"],
            function: "({ selection }) => selection",
            fallback: ""
        },
        "analysis.method.parameters": {
            type: "function",
            context: ["selection", "frontmatter"],
            function: "({ selection, frontmatter }) => frontmatter.instrument?.methods?.find(m => m.name === selection)?.parameters || {}",
            fallback: {}
        }
    }
}
```

**Key Features Used:**
1. **`from`** - Dynamically determines which file to load (reactive)
2. **`get`** - Extracts options from frontmatter of that file
3. **`return`** - Complex mapping with access to:
   - `selection` - The user's dropdown selection
   - `frontmatter` - The frontmatter of the loaded file
4. **Reactive dependencies** - Updates when instrument changes

### sample.ts - Where Clause with Functions

```typescript
"sample": {
    "inputType": "queryDropdown",
    "search": "sample",
    "where": [
        {
            "field": "project.name",
            "is": {
                type: "function",
                context: ["userInput"],
                reactiveDeps: ["project.name"],
                function: "({ userInput }) => userInput.project.name",
                fallback: ""
            }
        }
    ],
    "return": {
        "sample.name": "sample.name",
        "sample.link": "file.link"
    }
}
```

## TODO: Future QueryDropdown Redesign

When redesigning QueryDropdown with the new "mapping syntax", ensure compatibility with:

### Required Context Support
- [ ] **`frontmatter`** context - Access to loaded file's frontmatter
- [ ] **`selection`** context - User's current dropdown selection
- [ ] **`userInput`** context - Current form data (already in new FunctionEvaluator)

### Required Features
- [ ] **Reactive `from` parameter** - Dynamically determine source file based on user input
- [ ] **`get` parameter** - Extract dropdown options from file frontmatter
- [ ] **Complex `return` mappings** - Map selection + frontmatter to multiple fields
- [ ] **Reactive `where` clauses** - Filter query results based on user input

### Migration Strategy

1. **Add missing contexts to new FunctionEvaluator:**
   ```typescript
   export type ContextType = 
       | "userInput"
       | "settings"
       | "plugin"
       | "frontmatter"  // NEW - for queryDropdown get/return
       | "selection"     // NEW - for queryDropdown return
       | "noteMetadata"
       | "fs"
       | "vault"
       | "subclasses"
       | "date";
   ```

2. **Implement context providers:**
   - `FrontmatterContext` - Safe readonly access to file frontmatter
   - `SelectionContext` - Current dropdown selection value

3. **Update QueryDropdown to use new FunctionEvaluator:**
   - Replace calls to `TemplateEvaluator.evaluateUserInputFunction()`
   - Use `FunctionEvaluator.evaluateFunction()` with proper contexts
   - Pass frontmatter/selection as additional parameters

4. **Test against existing templates:**
   - analysis.ts method field (most complex)
   - sample.ts project filtering
   - Verify reactive updates work correctly

### Design Considerations for New Mapping Syntax

The new mapping syntax should support:

**Simple mappings (current):**
```typescript
"return": {
    "sample.name": "sample.name",
    "sample.link": "file.link"
}
```

**Complex mappings (preserve capability):**
```typescript
"return": {
    "method.name": {
        type: "function",
        context: ["selection"],
        expression: "selection"  // or function syntax if needed
    },
    "method.parameters": {
        type: "function",
        context: ["selection", "frontmatter"],
        function: "({ selection, frontmatter }) => frontmatter.instrument?.methods?.find(m => m.name === selection)?.parameters || {}"
    }
}
```

**Or potentially cleaner syntax:**
```typescript
"return": {
    "method.name": "$selection",
    "method.parameters": {
        from: "frontmatter.instrument.methods",
        where: { name: "$selection" },
        get: "parameters",
        fallback: {}
    }
}
```

## Related Files

- `src/core/templates/FunctionEvaluatorLegacy.ts` - Lines 170-175 (frontmatter/selection contexts)
- `src/core/templates/FunctionEvaluator.ts` - Needs context additions
- `src/core/templates/ContextProviders.ts` - Need FrontmatterContext and SelectionContext
- `src/ui/modals/components/QueryDropdown.ts` - Uses TemplateEvaluator (legacy path)
- `src/types/templates.ts` - ContextType union definition

## Timeline

- **v0.7.0-beta**: Keep current implementation, all queryDropdown uses legacy evaluator
- **v0.8.0**: Plan and design new mapping syntax + query syntax
- **v0.9.0**: Implement new FunctionEvaluator support for queryDropdown
- **v1.0.0**: Migrate all templates to new syntax

## Testing Requirements

When implementing new queryDropdown system, test:
1. ✅ Simple search-based queries (most templates)
2. ✅ Where clause with reactive functions (sample.ts)
3. ✅ Frontmatter-based options with complex returns (analysis.ts)
4. ✅ Reactive updates when dependencies change
5. ✅ Fallback values when dependencies not satisfied
6. ✅ Multi-select queryDropdowns
7. ✅ Performance with large vaults
