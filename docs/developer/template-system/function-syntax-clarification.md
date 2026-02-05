# Function Definition Syntax - Clarification & Extension

## The Problem

You raised a great point with this example:
```typescript
function: "({ userInput }) => [`sample/${userInput.sample.type.replace(/\\s/g, '_')}`]",
```

**This is not just an expression** - it's creating an array with a template literal inside. We need to support both:

1. **Simple expressions** - Direct value evaluation
2. **Complex functions** - With statements, returns, array/object construction

---

## Proposed Solution: Support Both Syntaxes

### Syntax 1: Simple Expression (No arrow function)
**Use when:** The result is a direct expression evaluation

```typescript
{
    type: "function",
    context: ["settings", "userInput"],
    expression: "settings.operators[userInput.operator].initials"
}
```

**How it evaluates:**
```javascript
// Wrapped automatically at runtime:
return settings.operators[userInput.operator].initials;
```

---

### Syntax 2: Function Body (With arrow function)
**Use when:** You need to construct objects/arrays, use statements, or complex logic

```typescript
{
    type: "function",
    function: "({ userInput }) => [`sample/${userInput.sample.type.replace(/\\s/g, '_')}`]"
}
```

**How it evaluates:**
```javascript
// Used as-is, context inferred from parameters
const func = new Function('return (' + function + ')')();
```

---

## Inference of Context from Parameters

**Your suggestion:** "We could safely infer the context from the function definition"

**✅ YES! This is the right approach for function syntax.**

### Rationale:

1. **DRY Principle** - Don't repeat yourself
2. **Less Error-Prone** - Can't have mismatch between `context` array and parameters
3. **Familiar Syntax** - Just write normal JavaScript arrow functions
4. **Flexibility** - Supports complex expressions, array/object construction, multi-line

### Implementation:

```typescript
interface SimpleFunctionDescriptor {
    type: "function";
    context: ContextType[];      // ← Explicit context specification
    expression: string;          // ← Simple expression (no return needed)
    reactiveDeps?: string[];
    fallback?: unknown;
}

interface ComplexFunctionDescriptor {
    type: "function";
    function: string;            // ← Arrow function with inferred context
    reactiveDeps?: string[];
    fallback?: unknown;
}

type EnhancedFunctionDescriptor = SimpleFunctionDescriptor | ComplexFunctionDescriptor;
```

---

## Type Guard to Distinguish

```typescript
function isSimpleFunctionDescriptor(
    descriptor: EnhancedFunctionDescriptor
): descriptor is SimpleFunctionDescriptor {
    return 'expression' in descriptor && 'context' in descriptor;
}

function isComplexFunctionDescriptor(
    descriptor: EnhancedFunctionDescriptor
): descriptor is ComplexFunctionDescriptor {
    return 'function' in descriptor && !('expression' in descriptor);
}
```

---

## Evaluation Logic

```typescript
// In TemplateEvaluator or PathEvaluator

evaluateFunction(descriptor: EnhancedFunctionDescriptor, userInput: FormData): unknown {
    if (isSimpleFunctionDescriptor(descriptor)) {
        // Simple expression - context explicitly specified
        return this.evaluateSimpleExpression(descriptor, userInput);
    } else {
        // Complex function - infer context from parameters
        return this.evaluateComplexFunction(descriptor, userInput);
    }
}

private evaluateSimpleExpression(
    descriptor: SimpleFunctionDescriptor, 
    userInput: FormData
): unknown {
    // Check reactive dependencies
    if (descriptor.reactiveDeps && !this.checkDependencies(descriptor.reactiveDeps, userInput)) {
        return descriptor.fallback;
    }
    
    // Build context objects
    const contexts = this.buildContexts(descriptor.context, userInput);
    
    // Evaluate expression
    const func = new Function(...descriptor.context, `return ${descriptor.expression}`);
    const args = descriptor.context.map(name => contexts[name]);
    return func(...args);
}

private evaluateComplexFunction(
    descriptor: ComplexFunctionDescriptor,
    userInput: FormData
): unknown {
    // Check reactive dependencies
    if (descriptor.reactiveDeps && !this.checkDependencies(descriptor.reactiveDeps, userInput)) {
        return descriptor.fallback;
    }
    
    // Parse arrow function to extract parameter names
    const contextNames = this.extractContextNames(descriptor.function);
    
    // Build context objects
    const contexts = this.buildContexts(contextNames, userInput);
    
    // Evaluate function
    const func = new Function('return (' + descriptor.function + ')')();
    const contextObj = contextNames.reduce((obj, name) => {
        obj[name] = contexts[name];
        return obj;
    }, {} as Record<string, unknown>);
    
    return func(contextObj);
}

private extractContextNames(functionStr: string): string[] {
    // Parse "({ userInput, settings }) => ..." to extract ["userInput", "settings"]
    const match = functionStr.match(/^\s*\(\s*\{\s*([^}]+)\s*\}\s*\)\s*=>/);
    if (match) {
        return match[1].split(',').map(s => s.trim());
    }
    
    // Single parameter without destructuring: "(userInput) => ..."
    const singleMatch = functionStr.match(/^\s*\(\s*(\w+)\s*\)\s*=>/);
    if (singleMatch) {
        return [singleMatch[1]];
    }
    
    // No parentheses: "userInput => ..."
    const noParenMatch = functionStr.match(/^\s*(\w+)\s*=>/);
    if (noParenMatch) {
        return [noParenMatch[1]];
    }
    
    throw new Error(`Cannot parse context names from function: ${functionStr}`);
}
```

---

## Examples

### Example 1: Simple Expression (Recommended for simple cases)

```typescript
// Clean, declarative
{
    type: "function",
    context: ["settings", "userInput"],
    expression: "settings.operators[userInput.operator].initials"
}
```

---

### Example 2: Array Construction (Use function syntax)

```typescript
// Your tags example
{
    type: "function",
    function: "({ userInput }) => [`sample/${userInput.sample.type.replace(/\\s/g, '_')}`]",
    reactiveDeps: ["sample.type"],
    fallback: ["sample/unknown"]
}
```

**Context inferred:** `["userInput"]` from the `({ userInput })` parameter

---

### Example 3: Object Construction

```typescript
{
    type: "function",
    function: "({ userInput, settings }) => ({ name: userInput.name, author: settings.authors[0].name })"
}
```

**Context inferred:** `["userInput", "settings"]`

---

### Example 4: Multi-line Complex Logic

```typescript
{
    type: "function",
    function: `({ fs, userInput }) => {
        const existingFiles = fs.listFiles({ startsWith: userInput.project.name });
        const numbers = existingFiles.map(f => {
            const match = f.name.match(/(\\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
        });
        const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
        return nextNum.toString().padStart(3, '0');
    }`
}
```

**Context inferred:** `["fs", "userInput"]`

---

### Example 5: Simple Field Access (Use expression)

```typescript
// Cleaner than function syntax for simple cases
{
    type: "function",
    context: ["plugin"],
    expression: "plugin.version"
}

// vs (more verbose):
{
    type: "function",
    function: "({ plugin }) => plugin.version"
}
```

---

## Updated Type Definitions

```typescript
// src/types/templates.ts

/**
 * Simple function descriptor for expressions that can be evaluated inline
 */
export interface SimpleFunctionDescriptor {
    type: "function";
    context: ContextType[];           // Explicitly specify required contexts
    expression: string;               // Expression without return statement
    reactiveDeps?: string[];          // Optional reactive dependencies
    fallback?: unknown;               // Fallback if dependencies not met
}

/**
 * Complex function descriptor for arrow functions with inferred context
 */
export interface ComplexFunctionDescriptor {
    type: "function";
    function: string;                 // Arrow function string: "({ ctx }) => ..."
    reactiveDeps?: string[];          // Optional reactive dependencies
    fallback?: unknown;               // Fallback if dependencies not met
}

/**
 * Legacy function descriptor (deprecated, for backward compatibility)
 */
export interface LegacyFunctionDescriptor {
    type: "function";
    value: string;                    // Old format: "this.settings.value"
}

/**
 * Union type for all function descriptor formats
 */
export type EnhancedFunctionDescriptor = 
    | SimpleFunctionDescriptor 
    | ComplexFunctionDescriptor 
    | LegacyFunctionDescriptor;

export type ContextType = 
    | "userInput"      // Current form data (read-only)
    | "settings"       // Plugin settings (safe interface)
    | "plugin"         // Plugin metadata (safe interface)
    | "noteMetadata"   // Other notes' metadata (safe interface)
    | "fs"             // File system operations (safe interface)
    | "vault"          // Vault operations (safe interface)
    | "subclasses";    // Subclass definitions (safe interface)
```

---

## When to Use Which Syntax?

### Use `expression` syntax when:
- ✅ Simple value access: `settings.operators[0].initials`
- ✅ Simple calculations: `userInput.value * 2`
- ✅ Simple string operations: `userInput.name.toUpperCase()`
- ✅ Method calls that return values: `userInput.date.toISOString()`

### Use `function` syntax when:
- ✅ Constructing arrays: `[...values]`
- ✅ Constructing objects: `{ key: value }`
- ✅ Multiple statements needed
- ✅ Complex logic with if/else, loops, etc.
- ✅ Template literals: `` `sample/${type}` ``
- ✅ Array methods: `.map()`, `.filter()`, `.reduce()`

---

## Benefits of This Approach

### 1. **Flexibility**
- Simple cases remain simple with `expression`
- Complex cases use familiar arrow function syntax

### 2. **DRY (Don't Repeat Yourself)**
- Context is inferred from function parameters
- No redundancy between `context` array and parameters

### 3. **Safety**
- Both formats use safe context interfaces
- Type checking on context names
- Validation of required contexts

### 4. **Familiarity**
- `expression` syntax is declarative and template-like
- `function` syntax is standard JavaScript

### 5. **No Breaking Changes**
- Can support legacy `value` format during migration
- Clear upgrade path

---

## Migration Path

### Current Code (Various formats):
```typescript
// Old format 1
{ type: "function", value: "this.manifest.version" }

// Old format 2  
{ type: "function", value: "this.settings.authors?.map((item) => item.name) || []" }

// New format (already in use)
{
    type: "function",
    context: ["userInput"],
    reactiveDeps: ["sample.type"],
    function: "({ userInput }) => [`sample/${userInput.sample.type.replace(/\\s/g, '_')}`]",
    fallback: ["sample/unknown"]
}
```

### Migrated (Recommended):

```typescript
// Simple expression
{ 
    type: "function",
    context: ["plugin"],
    expression: "plugin.manifest.version"
}

// Complex expression with array construction
{ 
    type: "function",
    context: ["settings"],
    expression: "settings.authors?.map(item => item.name) || []"
}
// Note: This works because the expression IS the array construction

// Complex function (already good!)
{
    type: "function",
    function: "({ userInput }) => [`sample/${userInput.sample.type.replace(/\\s/g, '_')}`]",
    reactiveDeps: ["sample.type"],
    fallback: ["sample/unknown"]
}
```

---

## Recommendation for Your Tags Example

**Your current code:**
```typescript
"tags": {
    "query": false,
    "inputType": "list",
    "default": { 
        type: "function", 
        context: ["userInput"],                    // ← Redundant with parameters
        reactiveDeps: ["sample.type"],
        function: "({ userInput }) => [`sample/${userInput.sample.type.replace(/\\s/g, '_')}`]",
        fallback: ["sample/unknown"]
    },
}
```

**Recommended (remove redundant `context`):**
```typescript
"tags": {
    "showInModal": false,  // Renamed from query
    "inputType": "list",
    "default": { 
        type: "function",
        function: "({ userInput }) => [`sample/${userInput.sample.type.replace(/\\s/g, '_')}`]",
        reactiveDeps: ["sample.type"],
        fallback: ["sample/unknown"]
    },
}
```

**Why better:**
- ✅ No redundancy - context inferred from `({ userInput })`
- ✅ DRY - don't repeat context specification
- ✅ Less error-prone - can't have mismatch
- ✅ Cleaner - one less key to maintain

---

## Summary

**Your observation is correct!** We should:

1. ✅ **Support both syntaxes:**
   - `expression` for simple inline expressions (with explicit `context`)
   - `function` for complex arrow functions (with inferred context)

2. ✅ **Infer context from arrow function parameters:**
   - Parse `({ userInput, settings })` to extract context names
   - No need for redundant `context` array
   - Less error-prone

3. ✅ **Use the right tool for the job:**
   - Simple field access → `expression`
   - Array/object construction → `function`
   - Complex logic → `function`

This gives us the best of both worlds: simplicity for simple cases, power for complex cases, and no redundancy! 🎯
