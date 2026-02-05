# New Query/Mapping Syntax Implementation Plan

## Overview

Implementing a new unified query and mapping syntax that:
- ✅ Works for both internal queries (queryDropdown) and external APIs (ChemicalLookup)
- ✅ Supports flexible cross-section mapping (map to any metadata path)
- ✅ Handles dynamic structures with type inference (process.parameters)
- ✅ Makes mapped data editable in modal
- ✅ Auto-applies first query result on initial render
- ✅ Handles query selection changes cleanly

## Migration Strategy: Parallel Implementation

**Keep old code working during transition:**
1. Rename existing query code to `*Legacy.ts`
2. Implement new syntax handlers alongside
3. Detect syntax version and route to appropriate handler
4. Test thoroughly with electrochemCell template
5. Migrate other templates one by one
6. Remove legacy code after all migrations complete

## Implementation Phases

### Phase 1: Preserve Legacy Code ✅

**Files to check and potentially rename:**
- Search for existing query handling in TemplateManager
- Check UniversalObjectRenderer for query-specific logic
- Look for queryDropdown handling in modals

**Action:** Create `*Legacy.ts` versions for any files with significant query logic

### Phase 2: Core Infrastructure

#### 2.1 New Type Definitions
```typescript
// src/types/QueryMapping.ts (NEW FILE)

export interface QueryConfig {
    source: 'internal' | 'api';
    search?: string;              // For internal queries
    where?: WhereClause[];        // For internal queries
    endpoint?: string;            // For API queries
    searchField?: string;         // For API queries
    apiConfig?: Record<string, unknown>;
}

export interface MappingField {
    target: string;               // Path in our metadata
    source: string;               // Path in query result
    display?: boolean;            // Show in dropdown (primary field)
    editable?: boolean;           // User can edit in modal
    required?: boolean;           // Must have value
    mode?: 'simple' | 'dynamic';  // Simple = direct copy, dynamic = infer structure
    transform?: string;           // Name of transform to apply
}

export interface MappingConfig {
    fields: MappingField[];
    transforms?: Record<string, TransformConfig>;
    options?: MappingOptions;
}

export interface TransformConfig {
    type: 'unitConversion' | 'format' | 'custom';
    from?: string;
    to?: string;
    factor?: number;
    format?: string;
    customFn?: (value: any) => any;
}

export interface MappingOptions {
    onMissingSource?: 'skip' | 'error' | 'useDefault';
    onEmptyValue?: 'skip' | 'error' | 'useDefault';
    trimStrings?: boolean;
}

export interface WhereClause {
    field: string;
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'in';
    value: string | string[];
}

// Hybrid type: mapping can be array (simple) or object (complex)
export type Mapping = MappingField[] | MappingConfig;

export interface QueryFieldInput {
    inputType: 'queryDropdown' | 'multiQueryDropdown' | 'apiLookup';
    query: QueryConfig;
    mapping: Mapping;
}
```

#### 2.2 Syntax Parser
```typescript
// src/core/templates/QueryMappingParser.ts (NEW FILE)

import { createLogger } from '../../utils/Logger';
import type { Mapping, MappingConfig, MappingField, QueryFieldInput } from '../../types/QueryMapping';

const logger = createLogger('template');

export class QueryMappingParser {
    
    /**
     * Detect if field uses old or new query syntax
     */
    static isLegacySyntax(field: any): boolean {
        return field.input?.query === true && 
               field.input?.return && 
               typeof field.input.return === 'object';
    }
    
    /**
     * Detect if field uses new query syntax
     */
    static isNewSyntax(field: any): boolean {
        return field.input?.query && 
               typeof field.input.query === 'object' &&
               field.input?.mapping !== undefined;
    }
    
    /**
     * Parse mapping - handles both array (simple) and object (complex)
     */
    static parseMapping(mapping: unknown): MappingConfig {
        if (Array.isArray(mapping)) {
            // Simple case - direct field mapping
            return {
                fields: mapping as MappingField[],
                transforms: {},
                options: {}
            };
        } else if (typeof mapping === 'object' && mapping !== null) {
            // Complex case - with transforms and options
            return {
                fields: (mapping as any).fields || [],
                transforms: (mapping as any).transforms || {},
                options: (mapping as any).options || {}
            };
        }
        
        logger.error('Invalid mapping configuration', { mapping });
        throw new Error('Invalid mapping configuration');
    }
    
    /**
     * Validate mapping configuration
     */
    static validateMapping(mapping: MappingConfig): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // Check for exactly ONE display: true field
        const displayFields = mapping.fields.filter(f => f.display);
        if (displayFields.length === 0) {
            errors.push('At least one field must have display: true for dropdown');
        } else if (displayFields.length > 1) {
            errors.push('Only one field can have display: true');
        }
        
        // Check all required properties
        for (const field of mapping.fields) {
            if (!field.target || !field.source) {
                errors.push(`Field missing target or source: ${JSON.stringify(field)}`);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Get the primary display field (the one shown in dropdown)
     */
    static getPrimaryField(mapping: MappingConfig): MappingField | null {
        return mapping.fields.find(f => f.display) || null;
    }
    
    /**
     * Get all dynamic mode fields (need structure inference)
     */
    static getDynamicFields(mapping: MappingConfig): MappingField[] {
        return mapping.fields.filter(f => f.mode === 'dynamic');
    }
}
```

#### 2.3 Type Inference Engine
```typescript
// src/core/templates/TypeInferenceEngine.ts (NEW FILE)

import { createLogger } from '../../utils/Logger';
import type { FieldConfig } from '../../types/Template';

const logger = createLogger('template');

export class TypeInferenceEngine {
    
    /**
     * Infer field configuration from data structure
     */
    static inferFieldConfig(
        path: string,
        data: unknown,
        editable: boolean = true,
        depth: number = 0,
        maxDepth: number = 5
    ): FieldConfig {
        
        logger.debug('Inferring field config:', { path, dataType: typeof data, depth });
        
        // Max depth protection
        if (depth >= maxDepth) {
            logger.warn('Max depth reached, converting to JSON string', { path, depth });
            return this.createJsonStringField(path, data, editable);
        }
        
        // Handle null/undefined
        if (data === null || data === undefined) {
            return this.createTextField(path, '', editable);
        }
        
        // Handle primitives
        if (typeof data === 'number') {
            return this.createNumberField(path, data, editable);
        }
        
        if (typeof data === 'string') {
            return this.createTextField(path, data, editable);
        }
        
        if (typeof data === 'boolean') {
            return this.createBooleanField(path, data, editable);
        }
        
        // Handle arrays
        if (Array.isArray(data)) {
            return this.inferArrayField(path, data, editable, depth);
        }
        
        // Handle objects
        if (typeof data === 'object') {
            return this.inferObjectField(path, data as Record<string, unknown>, editable, depth);
        }
        
        // Fallback
        logger.warn('Unknown data type, using text field', { path, data });
        return this.createTextField(path, String(data), editable);
    }
    
    /**
     * Infer array field configuration
     */
    private static inferArrayField(
        path: string,
        data: unknown[],
        editable: boolean,
        depth: number
    ): FieldConfig {
        if (data.length === 0) {
            // Empty array - default to string list
            return {
                fullKey: path,
                input: {
                    inputType: 'list',
                    listType: 'string',
                    default: [],
                    editable
                }
            };
        }
        
        const firstItem = data[0];
        
        // String list
        if (typeof firstItem === 'string') {
            return {
                fullKey: path,
                input: {
                    inputType: 'list',
                    listType: 'string',
                    default: data as string[],
                    editable
                }
            };
        }
        
        // Object list
        if (typeof firstItem === 'object' && firstItem !== null) {
            const objectTemplate = this.inferObjectStructure(
                firstItem as Record<string, unknown>,
                editable,
                depth + 1
            );
            return {
                fullKey: path,
                input: {
                    inputType: 'list',
                    listType: 'object',
                    objectTemplate,
                    default: data,
                    editable
                }
            };
        }
        
        // Mixed or unsupported - convert to string list
        return {
            fullKey: path,
            input: {
                inputType: 'list',
                listType: 'string',
                default: data.map(String),
                editable
            }
        };
    }
    
    /**
     * Infer object field configuration
     */
    private static inferObjectField(
        path: string,
        data: Record<string, unknown>,
        editable: boolean,
        depth: number
    ): FieldConfig {
        const keys = Object.keys(data);
        
        // Check for number + unit pattern
        if (this.isNumberUnitObject(data, keys)) {
            return this.createNumberUnitField(path, data, editable);
        }
        
        // Check for Obsidian link pattern
        if (keys.length === 1 && keys[0] === 'link' && typeof data.link === 'string') {
            return this.createTextField(path, data.link as string, false); // Links not editable
        }
        
        // Regular object - create nested fields
        const nestedFields = keys.map(key =>
            this.inferFieldConfig(`${path}.${key}`, data[key], editable, depth + 1)
        );
        
        return {
            fullKey: path,
            input: {
                inputType: 'editableObject',
                objectTemplate: nestedFields,
                editable
            }
        };
    }
    
    /**
     * Check if object matches {value, unit} pattern
     */
    private static isNumberUnitObject(data: Record<string, unknown>, keys: string[]): boolean {
        return keys.length === 2 &&
               'value' in data &&
               'unit' in data &&
               (typeof data.value === 'number' || typeof data.value === 'string') &&
               typeof data.unit === 'string';
    }
    
    /**
     * Create number + unit field config
     */
    private static createNumberUnitField(
        path: string,
        data: Record<string, unknown>,
        editable: boolean
    ): FieldConfig {
        const value = typeof data.value === 'number' ? data.value : parseFloat(String(data.value));
        const unit = data.unit as string;
        
        return {
            fullKey: path,
            input: {
                inputType: 'number',
                default: isNaN(value) ? 0 : value,
                defaultUnit: unit,
                units: [unit], // At minimum include the existing unit
                editable
            }
        };
    }
    
    /**
     * Infer structure for object list items
     */
    private static inferObjectStructure(
        obj: Record<string, unknown>,
        editable: boolean,
        depth: number
    ): FieldConfig[] {
        const fields: FieldConfig[] = [];
        
        for (const [key, value] of Object.entries(obj)) {
            fields.push(this.inferFieldConfig(key, value, editable, depth));
        }
        
        return fields;
    }
    
    /**
     * Create simple text field
     */
    private static createTextField(path: string, value: string, editable: boolean): FieldConfig {
        return {
            fullKey: path,
            input: {
                inputType: 'text',
                default: value,
                editable
            }
        };
    }
    
    /**
     * Create number field
     */
    private static createNumberField(path: string, value: number, editable: boolean): FieldConfig {
        return {
            fullKey: path,
            input: {
                inputType: 'number',
                default: value,
                editable
            }
        };
    }
    
    /**
     * Create boolean field
     */
    private static createBooleanField(path: string, value: boolean, editable: boolean): FieldConfig {
        return {
            fullKey: path,
            input: {
                inputType: 'dropdown',
                options: ['true', 'false'],
                default: value.toString(),
                editable
            }
        };
    }
    
    /**
     * Create JSON string field (for complex data beyond max depth)
     */
    private static createJsonStringField(path: string, data: unknown, editable: boolean): FieldConfig {
        return {
            fullKey: path,
            input: {
                inputType: 'text',
                default: JSON.stringify(data, null, 2),
                editable,
                multiline: true
            }
        };
    }
}
```

### Phase 3: Template Manager Integration

```typescript
// Add to src/core/templates/TemplateManager.ts

/**
 * Apply dynamic fields generated from query results
 * Similar to subclass application but works on current template
 */
applyDynamicFields(dynamicFields: FieldConfig[], sourceQuery: string): void {
    this.logger.debug('Applying dynamic fields', {
        count: dynamicFields.length,
        sourceQuery
    });
    
    // Track which fields are dynamic for later removal
    if (!this.dynamicFieldsByQuery) {
        this.dynamicFieldsByQuery = new Map<string, Set<string>>();
    }
    
    // Store paths of dynamic fields from this query
    const fieldPaths = new Set(dynamicFields.map(f => f.fullKey));
    this.dynamicFieldsByQuery.set(sourceQuery, fieldPaths);
    
    // Create temporary "dynamic subclass" template
    const dynamicSubclass = {
        add: dynamicFields
    };
    
    // Get current template (may already include subclass modifications)
    const currentTemplate = this.getCurrentTemplate();
    
    // Merge using existing logic
    const mergedTemplate = this.mergeTemplateAdditions(
        currentTemplate,
        dynamicSubclass.add
    );
    
    // Update current template
    this.currentTemplate = mergedTemplate;
    
    // Notify listeners
    this.notifyTemplateChange();
}

/**
 * Remove dynamic fields from a specific query
 */
removeDynamicFields(sourceQuery: string): void {
    if (!this.dynamicFieldsByQuery || !this.dynamicFieldsByQuery.has(sourceQuery)) {
        return;
    }
    
    const fieldPaths = this.dynamicFieldsByQuery.get(sourceQuery)!;
    
    this.logger.debug('Removing dynamic fields', {
        sourceQuery,
        count: fieldPaths.size,
        paths: Array.from(fieldPaths)
    });
    
    // Remove these fields from current template
    // (Implementation similar to removing subclass fields)
    
    this.dynamicFieldsByQuery.delete(sourceQuery);
    this.notifyTemplateChange();
}
```

### Phase 4: Modal Integration

Updates needed in NewNoteModal or wherever queryDropdown fields are handled.

### Phase 5: Testing & Migration

Test with electrochemCell template first, then migrate others.

## Files to Create

1. ✅ `src/types/QueryMapping.ts` - Type definitions
2. ✅ `src/core/templates/QueryMappingParser.ts` - Syntax parser
3. ✅ `src/core/templates/TypeInferenceEngine.ts` - Dynamic field inference
4. ⏳ `src/core/templates/QueryExecutor.ts` - Query execution (internal + API)
5. ⏳ `src/core/templates/MappingApplicator.ts` - Apply mappings and transforms

## Files to Modify

1. ⏳ `src/core/templates/TemplateManager.ts` - Add dynamic field methods
2. ⏳ `src/ui/modals/components/UniversalObjectRenderer.ts` - Handle new syntax
3. ⏳ `src/ui/modals/notes/NewNoteModal.ts` - Query initialization and change handling

## Testing Checklist

- [ ] Parse new syntax correctly (simple and complex mapping)
- [ ] Detect and route legacy syntax to old handlers
- [ ] Infer correct field types from data
- [ ] Handle {value, unit} objects correctly
- [ ] Handle nested objects and arrays
- [ ] Respect max depth limit
- [ ] Auto-select first query result on modal init
- [ ] Dynamic fields render correctly
- [ ] Changing selection replaces fields
- [ ] Confirmation shows when user has edits
- [ ] Multiple independent query fields work

## Timeline Estimate

- Phase 1 (Legacy preservation): 1 hour
- Phase 2 (Core infrastructure): 4-6 hours
- Phase 3 (Template Manager): 2-3 hours
- Phase 4 (Modal integration): 3-4 hours
- Phase 5 (Testing & migration): 4-6 hours

**Total: ~15-20 hours of development**

## Next Steps

1. Check existing query handling code
2. Create legacy versions if needed
3. Implement core infrastructure (types, parser, inference)
4. Test inference engine with sample data
5. Integrate with TemplateManager
6. Update modal handling
7. Test with electrochemCell
8. Migrate other templates
9. Remove legacy code
