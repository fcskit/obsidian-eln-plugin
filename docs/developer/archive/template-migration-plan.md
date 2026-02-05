# Template System Migration Plan

## Overview

This document outlines a phased approach to migrate the template system to the improved structure, focusing on fixing broken functionality first (fileName/folderPath generation) and implementing low-hanging fruit improvements while addressing security concerns.

## Phases

### Phase 1: Foundation & Security (Immediate Priority)
**Goal:** Fix broken path generation, improve security, and establish foundation for future work.

#### 1.1 Create Safe Context Interfaces
**Why:** Prevent unsafe access to plugin internals and file system

**Implementation:**
```typescript
// src/core/templates/ContextProviders.ts

/**
 * Safe context interfaces that limit access to only what's needed
 */

export interface PluginContext {
    version: string;
    manifest: {
        version: string;
        id: string;
        name: string;
    };
}

export interface SettingsContext {
    authors: Array<{ name: string; initials: string }>;
    operators: Array<{ name: string; initials: string }>;
    // Other safe settings access
    get(path: string): unknown;  // Safe getter with path validation
}

export interface FileSystemContext {
    // Limited, safe file system operations
    listFiles(filter?: { startsWith?: string; noteType?: string }): Array<{
        name: string;
        basename: string;
        path: string;
    }>;
    
    getNextCounter(prefix: string, width?: number): string;
    
    fileExists(path: string): boolean;
    
    // No direct file write/delete access
}

export interface VaultContext {
    // Safe vault operations
    getAllTags(): string[];
    
    getNotesWithTag(tag: string): Array<{
        name: string;
        path: string;
    }>;
    
    // No direct vault modification access
}

export interface NoteMetadataContext {
    // Safe access to other notes' metadata
    get(noteNameOrPath: string): Record<string, unknown> | null;
    
    query(filter: {
        noteType?: string;
        tag?: string;
        field?: { path: string; value: unknown };
    }): Array<Record<string, unknown>>;
}

export interface SubclassContext {
    // Access to subclass definitions
    get(subclassName: string): SubclassTemplate | null;
    list(): string[];
}

/**
 * Factory to create safe context objects from plugin instance
 */
export class ContextFactory {
    constructor(private plugin: ElnPlugin) {}
    
    createPluginContext(): PluginContext {
        return {
            version: this.plugin.manifest.version,
            manifest: {
                version: this.plugin.manifest.version,
                id: this.plugin.manifest.id,
                name: this.plugin.manifest.name
            }
        };
    }
    
    createSettingsContext(): SettingsContext {
        const settings = this.plugin.settings;
        return {
            authors: settings.general.authors,
            operators: settings.general.operators,
            get(path: string): unknown {
                // Implement safe nested property access with validation
                return safeGet(settings, path);
            }
        };
    }
    
    createFileSystemContext(): FileSystemContext {
        const vault = this.plugin.app.vault;
        return {
            listFiles(filter) {
                const files = vault.getMarkdownFiles();
                let filtered = files;
                
                if (filter?.startsWith) {
                    filtered = filtered.filter(f => 
                        f.basename.startsWith(filter.startsWith!)
                    );
                }
                
                if (filter?.noteType) {
                    // Filter by note type from frontmatter
                    filtered = filtered.filter(f => {
                        const cache = this.plugin.app.metadataCache.getFileCache(f);
                        return cache?.frontmatter?.["note type"] === filter.noteType;
                    });
                }
                
                return filtered.map(f => ({
                    name: f.name,
                    basename: f.basename,
                    path: f.path
                }));
            },
            
            getNextCounter(prefix: string, width: number = 2): string {
                const files = this.listFiles({ startsWith: prefix });
                const numbers = files
                    .map(f => {
                        const match = f.basename.match(/(\d+)$/);
                        return match ? parseInt(match[1], 10) : 0;
                    })
                    .filter(n => !isNaN(n));
                
                const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
                return nextNum.toString().padStart(width, '0');
            },
            
            fileExists(path: string): boolean {
                return vault.getAbstractFileByPath(path) !== null;
            }
        };
    }
    
    createNoteMetadataContext(): NoteMetadataContext {
        // Implementation
    }
    
    createSubclassContext(noteType: string): SubclassContext {
        // Implementation
    }
}

/**
 * Safe property getter with path validation
 */
function safeGet(obj: unknown, path: string): unknown {
    // Prevent access to dangerous properties
    const dangerousProps = ['__proto__', 'constructor', 'prototype'];
    const parts = path.split('.');
    
    if (parts.some(p => dangerousProps.includes(p))) {
        throw new Error(`Access to property '${path}' is not allowed`);
    }
    
    let current = obj;
    for (const part of parts) {
        if (current == null) return undefined;
        current = (current as Record<string, unknown>)[part];
    }
    return current;
}
```

**Files to create:**
- ✅ `src/core/templates/ContextProviders.ts`

**Files to modify:**
- ⏸️ `src/core/templates/TemplateEvaluator.ts` - **NOT YET** (keep legacy implementation for now)

**Note:** We'll create a NEW separate `FunctionEvaluator.ts` instead of modifying the existing TemplateEvaluator. This allows us to:
1. Keep existing metadata template evaluation working
2. Test new function evaluation only for path generation
3. Gradually migrate to new system once proven

---

#### 1.2 Create New FunctionEvaluator (Separate from Legacy)
**Why:** Keep new implementation isolated, minimize risk to existing functionality

**Strategy:**
1. Create NEW `FunctionEvaluator.ts` with safe context evaluation
2. Use ONLY in PathEvaluator for fileName/folderPath generation
3. Keep existing `TemplateEvaluator.ts` unchanged for metadata templates
4. Once proven, migrate TemplateEvaluator to use FunctionEvaluator (Phase 2)

**Implementation:**
```typescript
// src/core/templates/FunctionEvaluator.ts

import { createLogger } from "../../utils/Logger";
import { ContextFactory } from "./ContextProviders";
import type { 
    SimpleFunctionDescriptor, 
    ComplexFunctionDescriptor,
    EnhancedFunctionDescriptor 
} from "../../types";
import type { FormData } from "../../types";

const logger = createLogger('template');

/**
 * NEW function evaluator with safe context interfaces and dual syntax support.
 * Separate from legacy TemplateEvaluator to minimize risk during migration.
 * 
 * Initially used ONLY for PathEvaluator (fileName/folderPath generation).
 * Once proven stable, TemplateEvaluator will be refactored to use this.
 */
export class FunctionEvaluator {
    private contextFactory: ContextFactory;
    
    constructor(private plugin: ElnPlugin) {
        this.contextFactory = new ContextFactory(plugin);
    }
    
    /**
     * Evaluate a function descriptor with user input context.
     * Supports both simple expressions and complex arrow functions.
     */
    evaluateFunction(
        descriptor: EnhancedFunctionDescriptor,
        userInput: FormData
    ): unknown {
        // Type guard to distinguish between syntaxes
        if (this.isSimpleFunctionDescriptor(descriptor)) {
            return this.evaluateSimpleExpression(descriptor, userInput);
        } else if (this.isComplexFunctionDescriptor(descriptor)) {
            return this.evaluateComplexFunction(descriptor, userInput);
        } else {
            // Legacy format - log warning
            logger.warn('Legacy function descriptor detected. Please migrate to new format:', descriptor);
            throw new Error('Legacy function descriptors not supported in FunctionEvaluator. Use TemplateEvaluator for legacy formats.');
        }
    }
    
    /**
     * Type guard for simple function descriptor (explicit context)
     */
    private isSimpleFunctionDescriptor(
        descriptor: EnhancedFunctionDescriptor
    ): descriptor is SimpleFunctionDescriptor {
        return 'expression' in descriptor && 'context' in descriptor;
    }
    
    /**
     * Type guard for complex function descriptor (inferred context)
     */
    private isComplexFunctionDescriptor(
        descriptor: EnhancedFunctionDescriptor
    ): descriptor is ComplexFunctionDescriptor {
        return 'function' in descriptor && !('expression' in descriptor) && !('value' in descriptor);
    }
    
    /**
     * Evaluate simple expression with explicit context
     */
    private evaluateSimpleExpression(
        descriptor: SimpleFunctionDescriptor,
        userInput: FormData
    ): unknown {
        logger.debug('Evaluating simple expression:', {
            expression: descriptor.expression,
            contexts: descriptor.context,
            reactiveDeps: descriptor.reactiveDeps
        });
        
        // Check reactive dependencies
        if (descriptor.reactiveDeps && !this.checkDependencies(descriptor.reactiveDeps, userInput)) {
            logger.debug('Dependencies not satisfied, using fallback:', {
                deps: descriptor.reactiveDeps,
                fallback: descriptor.fallback
            });
            return descriptor.fallback;
        }
        
        // Build context objects (safe interfaces)
        const contexts = this.buildContexts(descriptor.context, userInput);
        
        // Evaluate expression
        try {
            const func = new Function(...descriptor.context, `return ${descriptor.expression}`);
            const args = descriptor.context.map(name => contexts[name]);
            const result = func(...args);
            
            logger.debug('Expression evaluated successfully:', { result });
            return result;
        } catch (error) {
            logger.error('Error evaluating expression:', {
                expression: descriptor.expression,
                error
            });
            return descriptor.fallback;
        }
    }
    
    /**
     * Evaluate complex arrow function with inferred context
     */
    private evaluateComplexFunction(
        descriptor: ComplexFunctionDescriptor,
        userInput: FormData
    ): unknown {
        logger.debug('Evaluating complex function:', {
            function: descriptor.function,
            reactiveDeps: descriptor.reactiveDeps
        });
        
        // Check reactive dependencies
        if (descriptor.reactiveDeps && !this.checkDependencies(descriptor.reactiveDeps, userInput)) {
            logger.debug('Dependencies not satisfied, using fallback:', {
                deps: descriptor.reactiveDeps,
                fallback: descriptor.fallback
            });
            return descriptor.fallback;
        }
        
        // Extract context names from function parameters
        const contextNames = this.extractContextNames(descriptor.function);
        logger.debug('Extracted context names:', contextNames);
        
        // Build context objects (safe interfaces)
        const contexts = this.buildContexts(contextNames, userInput);
        
        // Evaluate function
        try {
            // Create the arrow function from string
            const func = new Function('return (' + descriptor.function + ')')();
            
            // Build context object for destructuring parameter
            const contextObj = contextNames.reduce((obj, name) => {
                obj[name] = contexts[name];
                return obj;
            }, {} as Record<string, unknown>);
            
            const result = func(contextObj);
            logger.debug('Function evaluated successfully:', { result });
            return result;
        } catch (error) {
            logger.error('Error evaluating function:', {
                function: descriptor.function,
                error
            });
            return descriptor.fallback;
        }
    }
    
    /**
     * Extract context names from arrow function string
     * Parses: "({ userInput, settings }) => ..." to ["userInput", "settings"]
     */
    private extractContextNames(functionStr: string): string[] {
        // Match destructured parameters: ({ userInput, settings }) =>
        const destructuredMatch = functionStr.match(/^\s*\(\s*\{\s*([^}]+)\s*\}\s*\)\s*=>/);
        if (destructuredMatch) {
            return destructuredMatch[1].split(',').map(s => s.trim());
        }
        
        // Match single parameter with parentheses: (userInput) =>
        const singleParenMatch = functionStr.match(/^\s*\(\s*(\w+)\s*\)\s*=>/);
        if (singleParenMatch) {
            return [singleParenMatch[1]];
        }
        
        // Match single parameter without parentheses: userInput =>
        const noParenMatch = functionStr.match(/^\s*(\w+)\s*=>/);
        if (noParenMatch) {
            return [noParenMatch[1]];
        }
        
        throw new Error(`Cannot parse context names from function: ${functionStr}`);
    }
    
    /**
     * Check if all reactive dependencies are satisfied
     */
    private checkDependencies(deps: string[], userInput: FormData): boolean {
        return deps.every(dep => {
            const value = this.getNestedValue(userInput, dep);
            const satisfied = value !== undefined && value !== null && value !== '';
            
            if (!satisfied) {
                logger.debug(`Dependency not satisfied: ${dep}`, { value });
            }
            
            return satisfied;
        });
    }
    
    /**
     * Build context objects from context names
     * Uses ContextFactory to create safe interfaces
     */
    private buildContexts(
        contextNames: string[],
        userInput: FormData
    ): Record<string, unknown> {
        const contexts: Record<string, unknown> = {};
        
        for (const name of contextNames) {
            switch (name) {
                case 'userInput':
                    contexts.userInput = userInput; // Direct reference, read-only in function
                    break;
                    
                case 'settings':
                    contexts.settings = this.contextFactory.createSettingsContext();
                    break;
                    
                case 'plugin':
                    contexts.plugin = this.contextFactory.createPluginContext();
                    break;
                    
                case 'fs':
                    contexts.fs = this.contextFactory.createFileSystemContext();
                    break;
                    
                case 'noteMetadata':
                    contexts.noteMetadata = this.contextFactory.createNoteMetadataContext();
                    break;
                    
                case 'vault':
                    contexts.vault = this.contextFactory.createVaultContext();
                    break;
                    
                case 'subclasses':
                    // TODO: Need note type to get specific subclasses
                    contexts.subclasses = this.contextFactory.createSubclassContext(/* noteType */);
                    break;
                    
                default:
                    logger.warn(`Unknown context type: ${name}`);
                    throw new Error(`Unknown context type: ${name}`);
            }
        }
        
        return contexts;
    }
    
    /**
     * Get nested value from object using dot notation path
     */
    private getNestedValue(obj: unknown, path: string): unknown {
        const parts = path.split('.');
        let current = obj;
        
        for (const part of parts) {
            if (current == null) return undefined;
            current = (current as Record<string, unknown>)[part];
        }
        
        return current;
    }
}
```

**Files to create:**
- ✅ `src/core/templates/FunctionEvaluator.ts` - NEW, separate from TemplateEvaluator

**Files NOT modified (yet):**
- ⏸️ `src/core/templates/TemplateEvaluator.ts` - Keep unchanged, still used for metadata templates

**Benefits of this approach:**
1. ✅ **Isolated testing** - New code doesn't affect existing metadata evaluation
2. ✅ **Risk mitigation** - Existing functionality remains untouched
3. ✅ **Incremental migration** - Can test path generation independently
4. ✅ **Easy rollback** - Just stop using FunctionEvaluator if issues arise
5. ✅ **Clear separation** - Old vs new implementations are distinct

---

#### 1.3 Support Dual Function Syntax
1. Redundant context specification: both in `context` array and function parameters
2. Need to support both simple expressions and complex functions (array/object construction)
3. Overly verbose for simple cases

**Proposed Solution: Support TWO syntaxes**

**Syntax 1: Simple Expression (for inline value evaluation)**
```typescript
interface SimpleFunctionSegment {
    kind: "function";
    context: ContextType[];
    expression: string;  // No arrow function, just the expression
    reactiveDeps?: string[];
    fallback?: string;
    separator?: string;
}

// Example:
{
    kind: "function",
    context: ["settings", "userInput"],
    expression: "settings.operators[userInput.sample.operator].initials",
    separator: "-"
}
```

**Syntax 2: Complex Function (for array/object construction, complex logic)**
```typescript
interface ComplexFunctionSegment {
    kind: "function";
    function: string;  // Arrow function with INFERRED context from parameters
    reactiveDeps?: string[];
    fallback?: string;
    separator?: string;
}

// Example:
{
    kind: "function",
    function: "({ userInput }) => [`sample/${userInput.sample.type.replace(/\\s/g, '_')}`]",
    reactiveDeps: ["sample.type"],
    fallback: ["sample/unknown"]
}
```

**Benefits:**
- ✅ Simple cases use `expression` - declarative, explicit context
- ✅ Complex cases use `function` - full JavaScript power, inferred context
- ✅ No redundancy - `function` syntax infers context from parameters
- ✅ No ambiguity - parser extracts context names automatically
- ✅ Flexibility - use the right tool for the job

**When to use which:**
- Use `expression` for: simple value access, calculations, method calls
- Use `function` for: array/object construction, multiple statements, complex logic

**Context Inference:**
```typescript
function extractContextNames(functionStr: string): string[] {
    // Parse "({ userInput, settings }) => ..." to extract ["userInput", "settings"]
    const match = functionStr.match(/^\s*\(\s*\{\s*([^}]+)\s*\}\s*\)\s*=>/);
    if (match) {
        return match[1].split(',').map(s => s.trim());
    }
    
    // Single parameter: "(userInput) => ..." or "userInput => ..."
    const singleMatch = functionStr.match(/^\s*\(?(\w+)\)?\s*=>/);
    if (singleMatch) {
        return [singleMatch[1]];
    }
    
    throw new Error(`Cannot parse context from: ${functionStr}`);
}
```

**Evaluation:**
```typescript
evaluateFunctionSegment(segment: FunctionSegment, userInput: FormData): string {
    if ('expression' in segment) {
        // Simple expression - context explicitly specified
        const contexts = this.buildContexts(segment.context, userInput);
        const func = new Function(...segment.context, `return ${segment.expression}`);
        const args = segment.context.map(name => contexts[name]);
        return String(func(...args));
    } else {
        // Complex function - infer context from parameters
        const contextNames = this.extractContextNames(segment.function);
        const contexts = this.buildContexts(contextNames, userInput);
        const func = new Function('return (' + segment.function + ')')();
        const contextObj = contextNames.reduce((obj, name) => {
            obj[name] = contexts[name];
            return obj;
        }, {});
        return String(func(contextObj));
    }
}
```

**Decision: Support BOTH syntaxes** - gives us flexibility and simplicity

---

#### 1.3 Support Dual Function Syntax
**Why:** Support both simple expressions and complex functions (already covered in FunctionEvaluator)

**Type Definitions:**
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
```

**Note:** FunctionEvaluator (1.2) already implements support for both syntaxes.
Legacy format is NOT supported in FunctionEvaluator - it will throw an error if encountered.
This forces new path templates to use the new syntax.

---

#### 1.4 Simple Key Renames (Low-Hanging Fruit)
**Why:** Improve clarity with minimal risk

**Changes:**
```typescript
// Metadata fields
interface MetadataField {
    showInModal: boolean;     // Renamed from: query
    // ... rest unchanged for now
}

// Path templates
interface NoteTemplate {
    fileName: PathTemplate;   // Renamed from: titleTemplate
    folderPath: PathTemplate; // Renamed from: folderTemplate
}

// Settings
interface BaseNoteConfig {
    fileName: PathTemplate;   // Renamed from: titleTemplate  
    folderPath: PathTemplate; // Renamed from: folderTemplate
}
```

**Migration Script:**
```typescript
// src/utils/migrations/renameTemplateKeys.ts

export function migrateSettings(settings: ELNSettings): ELNSettings {
    const migrated = JSON.parse(JSON.stringify(settings));
    
    // Migrate each note type
    for (const noteType in migrated.note) {
        const config = migrated.note[noteType];
        
        // Rename titleTemplate -> fileName
        if ('titleTemplate' in config) {
            config.fileName = config.titleTemplate;
            delete config.titleTemplate;
        }
        
        // Rename folderTemplate -> folderPath
        if ('folderTemplate' in config) {
            config.folderPath = config.folderTemplate;
            delete config.folderTemplate;
        }
    }
    
    return migrated;
}

export function migrateMetadataTemplate(template: MetaDataTemplate): MetaDataTemplate {
    const migrated = { ...template };
    
    for (const key in migrated) {
        const field = migrated[key];
        if (typeof field === 'object' && field !== null) {
            // Rename query -> showInModal
            if ('query' in field) {
                field.showInModal = field.query;
                delete field.query;
            }
            
            // Recursively handle nested fields
            if ('objectTemplate' in field && typeof field.objectTemplate === 'object') {
                field.objectTemplate = migrateMetadataTemplate(field.objectTemplate);
            }
        }
    }
    
    return migrated;
}
```

**Files to create:**
- ✅ `src/utils/migrations/renameTemplateKeys.ts`

**Files to modify:**
- ✅ `src/types/templates.ts` - Update type definitions
- ✅ `src/types/settings.ts` - Update settings types
- ✅ `src/settings/settings.ts` - Update default settings
- ✅ `src/main.ts` - Run migration on settings load
- ✅ All metadata template files in `src/data/templates/metadata/`

**Testing:**
- Unit tests for migration functions
- Integration test with old settings file

---

#### 1.5 Implement Unified PathTemplate Structure
**Why:** Fix broken path generation with consistent syntax

**New Structure:**
```typescript
// src/types/templates.ts

export type PathSegment = 
    | LiteralSegment
    | FieldSegment
    | FunctionSegment
    | CounterSegment;

export interface LiteralSegment {
    kind: "literal";
    value: string;
    separator?: string;
}

export interface FieldSegment {
    kind: "field";
    path: string;  // Dot notation: "userInput.project.name"
    transform?: "uppercase" | "lowercase" | "capitalize" | "kebab-case" | "snake-case";
    separator?: string;
}

export interface FunctionSegment {
    kind: "function";
    name?: string;  // Optional descriptive name for debugging
    context: ContextType[];
    expression: string;  // The actual expression without arrow function syntax
    reactiveDeps?: string[];  // userInput paths that trigger re-evaluation
    fallback?: string;
    separator?: string;
}

export interface CounterSegment {
    kind: "counter";
    prefix?: string;  // Filter files by prefix
    width?: number;   // Zero-pad width
    separator?: string;
}

export type ContextType = 
    | "userInput"      // Current form data (read-only)
    | "settings"       // Plugin settings (safe interface)
    | "plugin"         // Plugin metadata (safe interface)
    | "noteMetadata"   // Other notes' metadata (safe interface)
    | "fs"             // File system operations (safe interface)
    | "vault"          // Vault operations (safe interface)
    | "subclasses";    // Subclass definitions (safe interface)

export interface PathTemplate {
    segments: PathSegment[];
}

// Helper type for note templates
export interface NoteTemplate {
    id: string;
    name: string;
    fileName: PathTemplate;
    folderPath: PathTemplate;
    metadata: MetaDataTemplate;
    markdown: string;
    subclasses?: {
        field?: string;  // Which field determines subclass
        sources: SubclassSource[];
    };
    createSubfolders?: string[];
}
```

**Path Evaluator Implementation:**
```typescript
// src/core/templates/PathEvaluator.ts

import { createLogger } from "../../utils/Logger";
import { FunctionEvaluator } from "./FunctionEvaluator";  // Use NEW evaluator
import type { PathTemplate, PathSegment, FieldSegment, FunctionSegment } from "../../types";
import type { FormData } from "../../types";

const logger = createLogger('path');

/**
 * PathEvaluator for fileName and folderPath generation.
 * Uses the NEW FunctionEvaluator with safe context interfaces.
 * 
 * This is the FIRST component to use the new template system.
 * Existing metadata template evaluation still uses legacy TemplateEvaluator.
 */
export class PathEvaluator {
    private functionEvaluator: FunctionEvaluator;  // NEW evaluator
    
    constructor(plugin: ElnPlugin) {
        this.functionEvaluator = new FunctionEvaluator(plugin);
    }
    
    /**
     * Evaluate a path template to generate a file name or folder path
     */
    evaluatePath(template: PathTemplate, userInput: FormData): string {
        const parts: string[] = [];
        
        for (const segment of template.segments) {
            try {
                const value = this.evaluateSegment(segment, userInput);
                if (value) {
                    parts.push(value);
                    if (segment.separator) {
                        parts.push(segment.separator);
                    }
                }
            } catch (error) {
                logger.error(`Error evaluating path segment:`, { segment, error });
                // Use fallback or skip segment
                if ('fallback' in segment && segment.fallback) {
                    parts.push(segment.fallback);
                    if (segment.separator) {
                        parts.push(segment.separator);
                    }
                }
            }
        }
        
        return parts.join('');
    }
    
    private evaluateSegment(segment: PathSegment, userInput: FormData): string {
        switch (segment.kind) {
            case "literal":
                return segment.value;
            
            case "field":
                return this.evaluateFieldSegment(segment, userInput);
            
            case "function":
                return this.evaluateFunctionSegment(segment, userInput);
            
            case "counter":
                return this.evaluateCounterSegment(segment);
            
            default:
                throw new Error(`Unknown segment kind: ${(segment as PathSegment).kind}`);
        }
    }
    
    private evaluateFieldSegment(segment: FieldSegment, userInput: FormData): string {
        // Extract value from userInput using path
        let value = this.getNestedValue(userInput, segment.path);
        
        if (value == null) {
            return '';
        }
        
        // Convert to string
        let result = String(value);
        
        // Apply transform if specified
        if (segment.transform) {
            result = this.applyTransform(result, segment.transform);
        }
        
        return result;
    }
    
    private evaluateFunctionSegment(segment: FunctionSegment, userInput: FormData): string {
        // Use NEW FunctionEvaluator instead of inline evaluation
        try {
            const result = this.functionEvaluator.evaluateFunction(segment, userInput);
            return String(result);
        } catch (error) {
            logger.error(`Error evaluating function segment:`, { 
                segment: segment.name, 
                error 
            });
            return segment.fallback || '';
        }
    }
    
    private evaluateCounterSegment(segment: CounterSegment): string {
        // Counter segments use simple context access - no function evaluation needed
        // TODO: Implement counter logic (can use ContextFactory directly if needed)
        return '001'; // Placeholder
    }
    
    private getNestedValue(obj: unknown, path: string): unknown {
        const parts = path.split('.');
        let current = obj;
        
        for (const part of parts) {
            if (current == null) return undefined;
            current = (current as Record<string, unknown>)[part];
        }
        
        return current;
    }
    
    private applyTransform(value: string, transform: FieldSegment['transform']): string {
        switch (transform) {
            case 'uppercase':
                return value.toUpperCase();
            case 'lowercase':
                return value.toLowerCase();
            case 'capitalize':
                return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
            case 'kebab-case':
                return value.toLowerCase().replace(/\s+/g, '-');
            case 'snake-case':
                return value.toLowerCase().replace(/\s+/g, '_');
            default:
                return value;
        }
    }
}
```

**Files to create:**
- ✅ `src/core/templates/PathEvaluator.ts`
- ✅ `src/core/templates/ContextProviders.ts` (from 1.1)
- ✅ `src/core/templates/FunctionEvaluator.ts` (from 1.2)

**Files to modify:**
- ✅ `src/types/templates.ts` - Add new types
- ✅ `src/core/notes/NoteCreator.ts` - Use PathEvaluator
- ✅ `src/modals/notes/NewNoteModal.ts` - Use PathEvaluator for preview

**Files NOT modified (intentionally):**
- ⏸️ `src/core/templates/TemplateEvaluator.ts` - Keep unchanged for now
  - Still used for metadata template function evaluation
  - Will be migrated in Phase 2 after PathEvaluator is proven

**Testing Strategy:**
1. Unit test FunctionEvaluator with both simple and complex functions
2. Unit test PathEvaluator with all segment types
3. Integration test: Create notes using PathEvaluator
4. Verify existing metadata templates still work (using old TemplateEvaluator)
5. Once stable, proceed to Phase 2

---

### Phase 2: Migrate Metadata Template Evaluation (Medium Priority)
**Goal:** Replace legacy function evaluation in TemplateEvaluator with FunctionEvaluator

**Prerequisites:**
- ✅ Phase 1 complete and tested
- ✅ PathEvaluator working correctly for fileName/folderPath
- ✅ FunctionEvaluator proven stable

**Strategy Overview:**
Before migrating TemplateEvaluator, we'll first extract and separate the legacy code into dedicated modules. This provides:
- Clear separation between old and new code
- Easier cleanup after migration
- Better code maintainability
- Isolated testing of legacy functionality
- Simpler code review

#### 2.1 Extract Legacy Code into Separate Modules

**Goal:** Separate legacy evaluation code from TemplateEvaluator for cleaner migration

**Modules to Create:**

##### 2.1a Create FunctionEvaluatorLegacy.ts
Extract the legacy function evaluation logic from TemplateEvaluator into a dedicated legacy module.

**Implementation:**
```typescript
// src/core/templates/FunctionEvaluatorLegacy.ts

import type { FunctionDescriptor, EnhancedFunctionDescriptor } from "../../types";
import type { FormData } from "../../types";
import { createLogger } from "../../utils/Logger";
import type ElnPlugin from "../../main";

const logger = createLogger('template');

/**
 * @deprecated Legacy function evaluator - DO NOT USE FOR NEW CODE
 * 
 * This module contains the old function evaluation logic extracted from TemplateEvaluator.
 * It is maintained only for backward compatibility during the migration period.
 * 
 * All new code should use FunctionEvaluator from FunctionEvaluator.ts instead.
 * 
 * This will be REMOVED after all metadata templates are migrated to the new format.
 */
export class FunctionEvaluatorLegacy {
    
    /**
     * Evaluates a legacy function descriptor (old format with 'value' field)
     * @deprecated Use FunctionEvaluator instead
     */
    static evaluateFunctionDescriptor(
        descriptor: FunctionDescriptor, 
        context?: object
    ): unknown {
        // Move the static evaluateFunctionDescriptor method from TemplateEvaluator here
        // This is the core legacy evaluation logic that uses unsafe 'this' context
        
        logger.warn('Using legacy function evaluator - please migrate to new format');
        
        if (!descriptor.value || typeof descriptor.value !== 'string') {
            throw new Error("Function descriptor must have a 'value' field with a string");
        }

        try {
            const functionBody = descriptor.value;
            
            // Legacy evaluation with 'this' context (UNSAFE)
            const wrappedFunction = new Function('return ' + functionBody);
            const fn = wrappedFunction.call(context || {});
            
            if (typeof fn === 'function') {
                return fn.call(context || {});
            } else {
                return fn;
            }
        } catch (error) {
            logger.error("Error evaluating legacy function descriptor:", {
                descriptor,
                error
            });
            throw error;
        }
    }
    
    /**
     * Evaluates enhanced function descriptor (transitional format)
     * @deprecated Use FunctionEvaluator instead
     */
    static evaluateEnhancedFunction(
        descriptor: EnhancedFunctionDescriptor,
        userData: FormData,
        plugin: ElnPlugin
    ): unknown {
        // Move evaluateEnhancedFunction from TemplateEvaluator here
        // This handles the intermediate format that some templates might still use
        
        logger.warn('Using legacy enhanced function evaluator - please migrate to new FunctionEvaluator');
        
        try {
            // Check reactive dependencies
            if (descriptor.reactiveDeps) {
                const allSatisfied = descriptor.reactiveDeps.every(dep => {
                    const value = getNestedValue(userData, dep);
                    return value !== undefined && value !== null && value !== '';
                });
                
                if (!allSatisfied) {
                    logger.debug('Dependencies not satisfied, using fallback:', {
                        deps: descriptor.reactiveDeps,
                        fallback: descriptor.fallback
                    });
                    return descriptor.fallback;
                }
            }
            
            // Build context object (UNSAFE - exposes full plugin)
            const contextObj: Record<string, unknown> = {};
            
            if (descriptor.context) {
                for (const contextName of descriptor.context) {
                    switch (contextName) {
                        case 'userInput':
                            contextObj.userInput = userData;
                            break;
                        case 'settings':
                            contextObj.settings = plugin.settings;  // UNSAFE
                            break;
                        case 'plugin':
                            contextObj.plugin = plugin;  // UNSAFE
                            break;
                        // ... other contexts
                    }
                }
            }
            
            // Execute function
            const functionCode = `return (${descriptor.function})`;
            const fn = new Function(functionCode)();
            const result = fn(contextObj);
            
            return result;
        } catch (error) {
            logger.error('Error evaluating enhanced function:', error);
            return descriptor.fallback;
        }
    }
    
    /**
     * Checks if a descriptor is in legacy format
     */
    static isLegacyFormat(descriptor: unknown): boolean {
        return typeof descriptor === 'object' 
            && descriptor !== null 
            && 'type' in descriptor 
            && (descriptor as any).type === 'function'
            && 'value' in descriptor 
            && typeof (descriptor as any).value === 'string';
    }
    
    /**
     * Checks if a descriptor is in enhanced (transitional) format
     */
    static isEnhancedFormat(descriptor: unknown): boolean {
        return typeof descriptor === 'object'
            && descriptor !== null
            && 'type' in descriptor
            && (descriptor as any).type === 'function'
            && 'function' in descriptor
            && 'context' in descriptor;
    }
}

/**
 * Helper to get nested value from object
 */
function getNestedValue(obj: unknown, path: string): unknown {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
        if (current == null) return undefined;
        current = (current as Record<string, unknown>)[part];
    }
    
    return current;
}
```

**Files to create:**
- [ ] `src/core/templates/FunctionEvaluatorLegacy.ts`

**Code to migrate FROM TemplateEvaluator:**
- Static method `evaluateFunctionDescriptor()` (~50 lines)
- Method `evaluateEnhancedFunction()` (~100 lines)
- Helper methods `isEnhancedFunctionDescriptor()` etc.

---

##### 2.1b Create QueryEvaluator.ts
Extract query evaluation logic into its own module for better separation of concerns.

**Implementation:**
```typescript
// src/core/templates/QueryEvaluator.ts

import { QueryWhereClause, QueryReturnClause } from "../../types/templates";
import { QueryEngine, SearchQuery, QueryCondition, QueryLogic, SearchResult } from "../../search/QueryEngine";
import type { FormData, JSONObject } from "../../types";
import { createLogger } from "../../utils/Logger";

const logger = createLogger('template');

/**
 * Handles evaluation of query clauses in metadata templates.
 * 
 * Query evaluation is separate from function evaluation and deserves its own module.
 * This handles the complex logic of:
 * - WHERE clause parsing and evaluation
 * - RETURN clause field extraction
 * - Search query building
 * - Result processing
 */
export class QueryEvaluator {
    private queryEngine: QueryEngine;
    
    constructor(queryEngine: QueryEngine) {
        this.queryEngine = queryEngine;
    }
    
    /**
     * Evaluates a query with WHERE and RETURN clauses
     */
    async evaluateQuery(
        whereClause: QueryWhereClause | undefined,
        returnClause: QueryReturnClause | undefined,
        userData: FormData
    ): Promise<unknown> {
        logger.debug('Evaluating query:', { whereClause, returnClause });
        
        if (!whereClause || !returnClause) {
            logger.warn('Query missing WHERE or RETURN clause');
            return undefined;
        }
        
        try {
            // Build search query from WHERE clause
            const searchQuery = this.buildSearchQuery(whereClause, userData);
            
            // Execute search
            const results = await this.queryEngine.search(searchQuery);
            
            // Process results using RETURN clause
            return this.processResults(results, returnClause);
            
        } catch (error) {
            logger.error('Error evaluating query:', error);
            return undefined;
        }
    }
    
    /**
     * Build SearchQuery from WHERE clause
     */
    private buildSearchQuery(
        whereClause: QueryWhereClause,
        userData: FormData
    ): SearchQuery {
        // Move WHERE clause parsing logic here from TemplateEvaluator
        // This includes:
        // - noteType filtering
        // - tag filtering
        // - field value matching
        // - combining conditions with AND/OR
        
        const conditions: QueryCondition[] = [];
        
        // Parse WHERE clause and build conditions
        // ... (implementation moved from TemplateEvaluator)
        
        return {
            conditions,
            logic: whereClause.logic || QueryLogic.AND
        };
    }
    
    /**
     * Process search results using RETURN clause
     */
    private processResults(
        results: SearchResult[],
        returnClause: QueryReturnClause
    ): unknown {
        // Move RETURN clause processing logic here from TemplateEvaluator
        // This includes:
        // - Field extraction from results
        // - Array/single value handling
        // - Nested property access
        
        if (results.length === 0) {
            return returnClause.multiple ? [] : undefined;
        }
        
        // ... (implementation moved from TemplateEvaluator)
        
        return returnClause.multiple ? results : results[0];
    }
    
    /**
     * Evaluates query fields in a metadata template
     */
    async evaluateQueryFields(
        template: JSONObject,
        userData: FormData
    ): Promise<JSONObject> {
        // Move query field evaluation logic here from TemplateEvaluator
        // This handles fields with WHERE/RETURN clauses
        
        const result: JSONObject = {};
        
        for (const [key, value] of Object.entries(template)) {
            if (this.isQueryField(value)) {
                result[key] = await this.evaluateQuery(
                    value.WHERE,
                    value.RETURN,
                    userData
                );
            } else {
                result[key] = value;
            }
        }
        
        return result;
    }
    
    /**
     * Check if a field is a query field
     */
    private isQueryField(value: unknown): boolean {
        return typeof value === 'object'
            && value !== null
            && ('WHERE' in value || 'RETURN' in value);
    }
}
```

**Files to create:**
- [ ] `src/core/templates/QueryEvaluator.ts`

**Code to migrate FROM TemplateEvaluator:**
- Query-related methods (~150 lines)
- WHERE/RETURN clause processing
- Search query building

---

#### 2.2 Refactor TemplateEvaluator to Use Extracted Modules

**Goal:** Simplify TemplateEvaluator by delegating to specialized modules

#### 2.2 Refactor TemplateEvaluator to Use Extracted Modules

**Goal:** Simplify TemplateEvaluator by delegating to specialized modules

After extracting legacy code, TemplateEvaluator becomes a thin coordinator that:
1. Routes legacy formats to FunctionEvaluatorLegacy
2. Routes new formats to FunctionEvaluator  
3. Delegates query evaluation to QueryEvaluator
4. Handles template processing and field evaluation

**Refactored Implementation:**
```typescript
// src/core/templates/TemplateEvaluator.ts (Phase 2.2 - Refactored)

import { FunctionEvaluator } from "./FunctionEvaluator";  // NEW
import { FunctionEvaluatorLegacy } from "./FunctionEvaluatorLegacy";  // LEGACY
import { QueryEvaluator } from "./QueryEvaluator";  // NEW
import type { EnhancedFunctionDescriptor, FunctionDescriptor } from "../../types";
import type { FormData } from "../../types";
import { QueryEngine } from "../../search/QueryEngine";
import { createLogger } from "../../utils/Logger";
import type ElnPlugin from "../../main";

const logger = createLogger('template');

/**
 * TemplateEvaluator - Coordinates template evaluation using specialized modules
 * 
 * After Phase 2.1 extraction, this class becomes a thin coordinator:
 * - Routes function evaluation to appropriate evaluator (new vs legacy)
 * - Delegates query evaluation to QueryEvaluator
 * - Handles overall template processing workflow
 * 
 * Legacy code is isolated in separate modules for easy cleanup after migration.
 */
export class TemplateEvaluator {
    private plugin: ElnPlugin;
    private functionEvaluator: FunctionEvaluator;  // NEW evaluator
    private queryEvaluator: QueryEvaluator;        // Query evaluator
    
    constructor(plugin: ElnPlugin) {
        this.plugin = plugin;
        this.functionEvaluator = new FunctionEvaluator(plugin);
        
        const queryEngine = new QueryEngine(plugin.app);
        this.queryEvaluator = new QueryEvaluator(queryEngine);
    }
    
    /**
     * Evaluates a function descriptor - routes to appropriate evaluator
     */
    evaluateUserInputFunction(
        descriptor: EnhancedFunctionDescriptor | FunctionDescriptor,
        userData: FormData
    ): unknown {
        if (descriptor.type !== "function") {
            throw new Error("Invalid function descriptor type");
        }
        
        // Check format and route to appropriate evaluator
        if (FunctionEvaluatorLegacy.isLegacyFormat(descriptor)) {
            logger.debug('Routing to legacy function evaluator');
            return FunctionEvaluatorLegacy.evaluateFunctionDescriptor(
                descriptor as FunctionDescriptor,
                { ...this.plugin, ...userData }
            );
        }
        
        if (FunctionEvaluatorLegacy.isEnhancedFormat(descriptor)) {
            logger.debug('Routing to legacy enhanced function evaluator');
            return FunctionEvaluatorLegacy.evaluateEnhancedFunction(
                descriptor as EnhancedFunctionDescriptor,
                userData,
                this.plugin
            );
        }
        
        // NEW format - use new FunctionEvaluator
        logger.debug('Routing to new function evaluator');
        try {
            return this.functionEvaluator.evaluateFunction(descriptor, userData);
        } catch (error) {
            logger.error("Error evaluating function:", error);
            throw error;
        }
    }
    
    /**
     * Evaluates query fields in a template
     */
    async evaluateQueryFields(template: JSONObject, userData: FormData): Promise<JSONObject> {
        return this.queryEvaluator.evaluateQueryFields(template, userData);
    }
    
    /**
     * Checks if a string represents an inline function (legacy)
     * @deprecated Legacy method - will be removed
     */
    isInlineFunction(field: string): boolean {
        logger.warn('isInlineFunction() is deprecated');
        const inlineFunctionPattern = /^(\(?\w+\)?\s*=>|function\s*\(|this\.\w+\(|return\s|[a-zA-Z_$][a-zA-Z0-9_$]*\s*\()/;
        
        if (field.includes(' ') && !field.includes('=>') && !field.includes('function') && !field.includes('this.')) {
            return false;
        }
        
        return inlineFunctionPattern.test(field.trim());
    }
    
    /**
     * Evaluates a dynamic field (legacy string-based function)
     * @deprecated Use function descriptors instead
     */
    evaluateDynamicField(field: string): unknown {
        logger.warn(`Legacy string-based function evaluation is deprecated. Field: ${field}`);
        
        const functionDescriptor: FunctionDescriptor = {
            type: "function",
            value: field
        };
        
        return FunctionEvaluatorLegacy.evaluateFunctionDescriptor(
            functionDescriptor,
            this.plugin
        );
    }
    
    // ... other template processing methods (unchanged)
}
```

**Benefits of this refactoring:**
- ✅ **Clear separation** - Legacy code isolated in dedicated modules
- ✅ **Simple routing** - TemplateEvaluator just routes to appropriate handler
- ✅ **Easy cleanup** - Delete FunctionEvaluatorLegacy.ts when migration complete
- ✅ **Better testing** - Each module can be tested independently
- ✅ **Code clarity** - Purpose of each module is explicit
- ✅ **Maintainability** - New developers immediately see old vs new code

**Files to modify:**
- [ ] `src/core/templates/TemplateEvaluator.ts` - Refactor to use extracted modules

---

#### 2.3 Update Metadata Templates to New Format

**Goal:** Migrate all metadata template functions from legacy to new format

**Strategy:**
1. Create migration script to convert function descriptors
2. Update one template as proof of concept
3. Test thoroughly
4. Batch convert remaining templates
5. Verify all templates work with new format

**Conversion Examples:**

**Example 1: Simple field access**
```typescript
// OLD (Legacy format)
{
    type: "function",
    value: "this.settings.operators[this.userInput.sample.operator].initials"
}

// NEW (Simple expression)
{
    type: "function",
    context: ["settings", "userInput"],
    expression: "settings.operators[userInput.sample.operator].initials",
    reactiveDeps: ["sample.operator"],
    fallback: ""
}
```

**Example 2: Complex logic**
```typescript
// OLD (Legacy format)
{
    type: "function",
    value: "() => { return this.userInput.sample.type ? `sample/${this.userInput.sample.type}` : 'sample/unknown'; }"
}

// NEW (Complex function)
{
    type: "function",
    function: "({ userInput }) => userInput.sample.type ? `sample/${userInput.sample.type}` : 'sample/unknown'",
    reactiveDeps: ["sample.type"],
    fallback: "sample/unknown"
}
```

**Migration Script:**
```typescript
// scripts/migrate-function-descriptors.ts

interface LegacyDescriptor {
    type: "function";
    value: string;
}

interface NewDescriptor {
    type: "function";
    context?: string[];
    expression?: string;
    function?: string;
    reactiveDeps?: string[];
    fallback?: unknown;
}

function migrateFunctionDescriptor(legacy: LegacyDescriptor): NewDescriptor {
    const value = legacy.value;
    
    // Detect patterns and convert
    
    // Pattern 1: this.settings.operators[this.userInput.X].Y
    const settingsPattern = /this\.settings\.(\w+)\[this\.userInput\.([^\]]+)\]\.(\w+)/;
    const match = value.match(settingsPattern);
    
    if (match) {
        const [, settingsField, userInputPath, property] = match;
        return {
            type: "function",
            context: ["settings", "userInput"],
            expression: `settings.${settingsField}[userInput.${userInputPath}].${property}`,
            reactiveDeps: [userInputPath],
            fallback: ""
        };
    }
    
    // Pattern 2: Arrow functions
    if (value.includes('=>')) {
        // Extract dependencies from this.userInput.X references
        const userInputRefs = value.match(/this\.userInput\.([a-zA-Z0-9_.]+)/g) || [];
        const deps = userInputRefs.map(ref => ref.replace('this.userInput.', ''));
        
        // Convert this.userInput -> userInput, this.settings -> settings
        let converted = value
            .replace(/this\.userInput/g, 'userInput')
            .replace(/this\.settings/g, 'settings')
            .replace(/this\.plugin/g, 'plugin');
        
        // Infer context from references
        const contexts: string[] = [];
        if (converted.includes('userInput')) contexts.push('userInput');
        if (converted.includes('settings')) contexts.push('settings');
        if (converted.includes('plugin')) contexts.push('plugin');
        
        return {
            type: "function",
            function: converted,
            reactiveDeps: deps.length > 0 ? deps : undefined,
            fallback: undefined
        };
    }
    
    // ... more patterns
    
    // Default: treat as complex function
    logger.warn(`Could not automatically migrate function descriptor: ${value}`);
    return legacy as any;  // Return as-is for manual review
}

// Usage
function migrateMetadataTemplate(template: MetaDataTemplate): MetaDataTemplate {
    // Recursively process template and convert function descriptors
    // ...
}
```

**Files to create:**
- [ ] `scripts/migrate-function-descriptors.ts` - Conversion script
- [ ] `scripts/test-migration.ts` - Test converted templates

**Files to modify:**
- [ ] All files in `src/data/templates/metadata/` - Update function descriptors

---

#### 2.4 Remove Legacy Code

**Goal:** Clean up legacy evaluation code after migration is complete

**Prerequisites:**
- All metadata templates migrated to new format
- All tests passing
- Production use confirmed working

**Cleanup tasks:**
- [ ] Delete `src/core/templates/FunctionEvaluatorLegacy.ts`
- [ ] Remove legacy routing from TemplateEvaluator
- [ ] Remove deprecated methods (`isInlineFunction`, `evaluateDynamicField`)
- [ ] Remove legacy type definitions from `src/types/templates.ts`
- [ ] Update documentation
- [ ] Add migration notes for future reference

**Final TemplateEvaluator (after cleanup):**
```typescript
// src/core/templates/TemplateEvaluator.ts (Phase 2.4 - Final)

import { FunctionEvaluator } from "./FunctionEvaluator";
import { QueryEvaluator } from "./QueryEvaluator";
import type { EnhancedFunctionDescriptor } from "../../types";
import type { FormData } from "../../types";
import { QueryEngine } from "../../search/QueryEngine";
import { createLogger } from "../../utils/Logger";
import type ElnPlugin from "../../main";

const logger = createLogger('template');

/**
 * TemplateEvaluator - Coordinates template evaluation
 * 
 * Clean, modern implementation using only new evaluation modules.
 * All legacy code has been removed.
 */
export class TemplateEvaluator {
    private plugin: ElnPlugin;
    private functionEvaluator: FunctionEvaluator;
    private queryEvaluator: QueryEvaluator;
    
    constructor(plugin: ElnPlugin) {
        this.plugin = plugin;
        this.functionEvaluator = new FunctionEvaluator(plugin);
        
        const queryEngine = new QueryEngine(plugin.app);
        this.queryEvaluator = new QueryEvaluator(queryEngine);
    }
    
    /**
     * Evaluates a function descriptor
     */
    evaluateUserInputFunction(
        descriptor: EnhancedFunctionDescriptor,
        userData: FormData
    ): unknown {
        return this.functionEvaluator.evaluateFunction(descriptor, userData);
    }
    
    /**
     * Evaluates query fields in a template
     */
    async evaluateQueryFields(template: JSONObject, userData: FormData): Promise<JSONObject> {
        return this.queryEvaluator.evaluateQueryFields(template, userData);
    }
    
    // ... other template processing methods
}
```

---

## Updated Phase 2 Checklist

### Phase 2 - Medium Priority (Migrate Metadata Evaluation)
**Goal:** Replace legacy function evaluation with FunctionEvaluator

**Prerequisites:** Phase 1 complete, PathEvaluator working, FunctionEvaluator proven

- [ ] **2.1** Extract legacy code into separate modules
  - [ ] **2.1a** Create `FunctionEvaluatorLegacy.ts`
    - [ ] Move `evaluateFunctionDescriptor()` static method
    - [ ] Move `evaluateEnhancedFunction()` method
    - [ ] Add format detection methods
    - [ ] Add deprecation warnings
    - [ ] Unit tests for legacy evaluation
  
  - [ ] **2.1b** Create `QueryEvaluator.ts`
    - [ ] Move query evaluation logic
    - [ ] Move WHERE clause processing
    - [ ] Move RETURN clause processing
    - [ ] Unit tests for query evaluation
  
- [ ] **2.2** Refactor TemplateEvaluator
  - [ ] Import FunctionEvaluator (new)
  - [ ] Import FunctionEvaluatorLegacy (temporary)
  - [ ] Import QueryEvaluator (new)
  - [ ] Add routing logic (legacy vs new format)
  - [ ] Delegate query evaluation to QueryEvaluator
  - [ ] Test with existing templates (backward compatibility)
  
- [ ] **2.3** Migrate metadata templates
  - [ ] Create migration script
  - [ ] Migrate one template as proof of concept
  - [ ] Test thoroughly
  - [ ] Batch convert remaining templates
  - [ ] Verify all templates work
  - [ ] Update documentation
  
- [ ] **2.4** Remove legacy code
  - [ ] Delete `FunctionEvaluatorLegacy.ts`
  - [ ] Remove legacy routing from TemplateEvaluator
  - [ ] Remove deprecated methods
  - [ ] Remove legacy type definitions
  - [ ] Update documentation
  - [ ] Add migration notes

---

---

### Phase 3: Subclass Improvements & Advanced Features (Lower Priority)
**Goal:** Better subclass support and extensibility

#### 3.1 Subclass Template Structure
- Implement `extend`, `override`, `remove` operations
- Support markdown inheritance modes
- Allow subclass-specific path templates

#### 3.2 Import/Export Support
- JSON template import/export
- Template validation
- Version compatibility checking

---

## Migration Checklist

### Phase 1 - Immediate (Focus on Path Generation)
**Goal:** Fix broken fileName/folderPath generation WITHOUT touching existing metadata evaluation

- [ ] **1.1** Create `ContextProviders.ts` with safe interfaces
  - [ ] PluginContext
  - [ ] SettingsContext
  - [ ] FileSystemContext
  - [ ] VaultContext
  - [ ] NoteMetadataContext
  - [ ] SubclassContext
  - [ ] ContextFactory class
  - [ ] Unit tests for each context
  
- [ ] **1.2** Create `FunctionEvaluator.ts` (NEW - separate from TemplateEvaluator)
  - [ ] Support simple expression syntax
  - [ ] Support complex function syntax with context inference
  - [ ] Reject legacy format with clear error
  - [ ] Unit tests for both syntaxes
  - [ ] Unit tests for context inference
  
- [ ] **1.3** Update type definitions
  - [ ] Add SimpleFunctionDescriptor
  - [ ] Add ComplexFunctionDescriptor
  - [ ] Add PathSegment types
  - [ ] Add PathTemplate interface
  
- [ ] **1.4** Create migration utility for key renames
  - [ ] `query` → `showInModal` migration
  - [ ] `titleTemplate` → `fileName` migration
  - [ ] `folderTemplate` → `folderPath` migration
  - [ ] Unit tests for migrations
  
- [ ] **1.5** Create `PathEvaluator.ts`
  - [ ] Use FunctionEvaluator for function segments
  - [ ] Implement literal, field, function, counter segments
  - [ ] Add path transforms (uppercase, lowercase, etc.)
  - [ ] Unit tests for all segment types
  
- [ ] **Integration & Testing**
  - [ ] Update `NoteCreator.ts` to use PathEvaluator
  - [ ] Update `NewNoteModal.ts` for live preview
  - [ ] Update all metadata templates (rename `query` → `showInModal`)
  - [ ] Update `settings.ts` with new keys
  - [ ] Add `main.ts` migration runner
  - [ ] Integration tests with real vault data
  - [ ] **Verify existing metadata templates still work** (using old TemplateEvaluator)
  
**Important:** Do NOT modify TemplateEvaluator.ts in Phase 1!

### Phase 2 - Medium Priority (Migrate Metadata Evaluation)
**Goal:** Replace legacy function evaluation with FunctionEvaluator

**Prerequisites:** Phase 1 complete, PathEvaluator working, FunctionEvaluator proven

- [ ] **2.1** Modify TemplateEvaluator to use FunctionEvaluator
  - [ ] Add FunctionEvaluator instance
  - [ ] Delegate new formats to FunctionEvaluator
  - [ ] Keep legacy format support temporarily
  - [ ] Add tests for both paths
  
- [ ] **2.2** Convert metadata templates
  - [ ] Update one template as proof of concept
  - [ ] Test thoroughly
  - [ ] Convert remaining templates
  - [ ] Update all function descriptors to new format
  
- [ ] **2.3** Remove legacy code
  - [ ] Remove legacy function evaluation
  - [ ] Clean up deprecated code
  - [ ] Update documentation

### Phase 3 - Lower Priority (Advanced Features)
- [ ] Implement subclass operations
- [ ] Add JSON import/export
- [ ] Add version compatibility checking
- [ ] Create template marketplace/sharing mechanism

---

## Risk Mitigation

1. **Backward Compatibility:**
   - Keep migration utilities in codebase
   - Support reading old format during transition
   - Clear deprecation warnings

2. **Testing:**
   - Unit tests for all new components
   - Integration tests with real vault data
   - Manual testing of note creation workflow

3. **Rollback Plan:**
   - Keep old code commented during transition
   - Settings backup before migration
   - Clear rollback documentation

4. **Security:**
   - Code review of context providers
   - Security testing of function evaluation
   - Document security model clearly

---

## Example Conversions

### Old Format (Current - Broken):
```typescript
titleTemplate: [
    { type: 'userInput', field: "sample.name", separator: " - " },
    { type: 'userInput', field: "analysis.method", separator: "_" },
    { type: 'index', field: "02", separator: "" },
]
```

### New Format (Phase 1):
```typescript
fileName: {
    segments: [
        {
            kind: "field",
            path: "userInput.sample.name",
            separator: "-"
        },
        {
            kind: "field",
            path: "userInput.analysis.method",
            separator: "_"
        },
        {
            kind: "counter",
            width: 2,
            separator: ""
        }
    ]
}
```

### Complex Function Example:

**Old (Current):**
```typescript
{
    type: 'function',
    field: "this.settings.operators[this.userInput.sample.operator].initials",
    separator: "-"
}
```

**New (Phase 1):**
```typescript
{
    kind: "function",
    name: "operator-initials",
    context: ["settings", "userInput"],
    expression: "settings.operators[userInput.sample.operator].initials",
    separator: "-"
}
```

This provides safe, controlled access through the SettingsContext interface, preventing direct manipulation of plugin internals.

## Future Migration Tasks

### Unified Template Structure (Future Phase)
**Status:** Reference implementation in progress  
**Files:** `src/data/templates/notes/sample.ts`, `src/data/templates/notes/sample_sclasses.ts`

**Goal:** Create a unified template structure that combines:
- Metadata templates (currently separate)
- Markdown templates (currently separate)  
- Note settings (fileName, folderPath - currently in settings.ts)

**Benefits:**
- Single source of truth per note type
- Easier template management
- Better organization
- Clearer relationships between templates

**Current Status:**
- Reference files exist but are not yet integrated
- TypeScript errors present (expected - these are reference implementations)
- Will be addressed in a future migration phase after core PathEvaluator work is complete

**Note:** These reference files should be ignored for now as they represent future work.

### Settings UI TypeScript Errors
**Status:** Known issues  
**Files:** `src/settings/ENLSettingTab.ts`, `src/ui/modals/settings/TemplateEditorModal.ts`

**Description:**
- Some TypeScript errors exist in settings-related files
- These may increase during template migration as settings.ts evolves
- Will be addressed systematically as part of the unified template migration

**Strategy:**
- Don't fix piecemeal - wait for unified template structure
- These files will need comprehensive updates during that phase
- Current functionality works despite TypeScript warnings

