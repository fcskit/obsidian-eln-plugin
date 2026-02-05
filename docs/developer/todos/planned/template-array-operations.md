# Template Array Operations

**Status**: Planned  
**Priority**: Medium  
**Target Version**: v0.7.2 or v0.8.0  
**Estimated Effort**: 1-2 weeks

## Overview

Add support for JavaScript-like array operations in template fields, enabling transformations like `.map()`, `.filter()`, `.join()` on array data.

## Problem Statement

Users need to transform array data in templates for display purposes. Current workaround requires using Obsidian Base query blocks, which is less intuitive and harder to maintain.

### Example Use Case

Sample markdown template needs to display a list of process links from `sample.preparation` (an object list):

```markdown
**Processes:** {{sample.preparation.map(item => item.link).join(', ')}}
```

Currently impossible - requires Base query workaround:

```yaml
formulas:
  processes: sample.preparation.map([value.link])
views:
  - type: list
    name: Processes
    filters:
      and:
        - tags.contains("sample")
        - sample.name == this.sample.name
```

## Implementation Details

### Phase 1: Basic Array Methods (v0.7.2)

**Target methods:**
- `.map(fn)` - Transform array elements
- `.filter(fn)` - Filter array elements
- `.join(separator)` - Join array to string
- `.length` - Get array length

**Syntax options:**

**Option A: JavaScript-like (complex, full evaluation)**
```
{{sample.preparation.map(item => item.link)}}
{{sample.preparation.filter(item => item.status === 'complete')}}
```

**Option B: Function descriptor syntax (simpler, consistent with existing system)**
```
{{@map(sample.preparation, 'link')}}
{{@filter(sample.preparation, @eq('status', 'complete'))}}
{{@join(@map(sample.preparation, 'link'), ', ')}}
```

**Recommendation:** Option B - Consistent with existing `@function()` syntax, easier to parse and evaluate.

### Phase 2: Advanced Operations (v0.8.0)

- `.reduce(fn, initial)` - Reduce array to single value
- `.find(fn)` - Find first matching element
- `.some(fn)` / `.every(fn)` - Boolean array checks
- `.sort(fn)` - Sort array elements
- `.slice(start, end)` - Extract array subset

### Implementation Approach

1. **Extend FunctionEvaluator** (`src/core/templates/FunctionEvaluator.ts`)
   - Add array operation functions
   - Handle nested function calls
   - Validate input types

2. **Add Array Operation Functions:**

```typescript
// In FunctionEvaluator or new ArrayOperations.ts
class ArrayOperations {
    static map(array: any[], property: string): any[] {
        if (!Array.isArray(array)) return [];
        return array.map(item => {
            if (typeof item === 'object' && property in item) {
                return item[property];
            }
            return item;
        });
    }
    
    static filter(array: any[], predicate: Function): any[] {
        if (!Array.isArray(array)) return [];
        return array.filter(predicate);
    }
    
    static join(array: any[], separator: string = ', '): string {
        if (!Array.isArray(array)) return '';
        return array.join(separator);
    }
}
```

3. **Register in FunctionEvaluator:**

```typescript
// Add to evaluateFunction()
case 'map':
    return ArrayOperations.map(args[0], args[1]);
case 'filter':
    return ArrayOperations.filter(args[0], args[1]);
case 'join':
    return ArrayOperations.join(args[0], args[1]);
```

4. **Update Template Parser:**
   - Handle nested function calls: `@join(@map(array, 'prop'), ', ')`
   - Proper parentheses matching
   - Type validation

5. **Testing:**
   - Unit tests for each array operation
   - Integration tests with sample template
   - Edge cases: empty arrays, null values, nested arrays

## Dependencies

- Existing function descriptor system (`@function()` syntax)
- FunctionEvaluator infrastructure
- Template parsing system

## Success Criteria

- [ ] `.map()` works with property extraction
- [ ] `.filter()` works with predicates
- [ ] `.join()` converts arrays to strings
- [ ] Nested function calls work correctly
- [ ] Error handling for invalid inputs
- [ ] Sample markdown template uses new syntax
- [ ] Documentation updated with examples
- [ ] Unit tests cover all operations
- [ ] No performance degradation

## Testing Plan

### Unit Tests

```typescript
describe('Array Operations', () => {
    test('map extracts property', () => {
        const input = [{name: 'A', link: '[[A]]'}, {name: 'B', link: '[[B]]'}];
        expect(ArrayOperations.map(input, 'link')).toEqual(['[[A]]', '[[B]]']);
    });
    
    test('join with custom separator', () => {
        const input = ['A', 'B', 'C'];
        expect(ArrayOperations.join(input, ' | ')).toBe('A | B | C');
    });
});
```

### Integration Tests

```typescript
test('nested map and join', () => {
    const template = '{{@join(@map(sample.preparation, "link"), ", ")}}';
    const data = {
        sample: {
            preparation: [
                {link: '[[Process 1]]'},
                {link: '[[Process 2]]'}
            ]
        }
    };
    expect(evaluate(template, data)).toBe('[[Process 1]], [[Process 2]]');
});
```

## Migration Path

1. **v0.7.1**: Document current Base query workaround
2. **v0.7.2**: Implement basic array operations
3. **v0.8.0**: Migrate sample template to use new syntax
4. **v0.8.0**: Deprecation notice for complex Base queries

## Alternative Solutions Considered

### 1. Full JavaScript Evaluation
**Pros:** Maximum flexibility  
**Cons:** Security risks, complex parsing, performance overhead  
**Decision:** Rejected - too complex for template system

### 2. Expand Base Query Syntax
**Pros:** Already works  
**Cons:** Not integrated with template fields, separate system  
**Decision:** Rejected - want unified template syntax

### 3. Custom Template Functions (CHOSEN)
**Pros:** Consistent with existing syntax, secure, performant  
**Cons:** Limited compared to full JavaScript  
**Decision:** Best balance of power and safety

## Related Documentation

- [Function Descriptor Syntax](../template-system/function-descriptor-syntax.md)
- [FunctionEvaluator Design](../template-system/function-evaluator-design.md)
- [Template System Overview](../template-system/template-redesign-index.md)
- [Sample Metadata Template](../../src/data/templates/metadata/sample.ts)
- [Sample Markdown Template](../../src/data/templates/markdown/sample.ts)

## Notes

- This feature complements the existing function descriptor system
- Should integrate seamlessly with reactive dependencies
- Consider performance for large arrays (>100 items)
- May need to add pagination for very large result sets
