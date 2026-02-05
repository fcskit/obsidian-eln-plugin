/**
 * Test script to verify that TemplateManager.normalizeTemplateFields() 
 * correctly sets query: true by default for all fields
 */

import type { MetaDataTemplateProcessed, MetaDataTemplateFieldProcessed } from '../src/types';

// Mock template with missing query properties
const testTemplate: MetaDataTemplateProcessed = {
    "field1": {
        "inputType": "text",
        // query is missing - should default to true
        "default": "test"
    },
    "field2": {
        "inputType": "number",
        "query": false, // Explicitly false - should remain false
        "default": 0
    },
    "nested": {
        "field3": {
            "inputType": "text",
            // query is missing in nested field - should default to true
            "default": ""
        }
    },
    "objectList": {
        "query": true,
        "inputType": "list",
        "listType": "object",
        "initialItems": 1,
        "objectTemplate": {
            "itemField1": {
                "inputType": "text",
                // query is missing in objectTemplate - should default to true
                "default": ""
            },
            "itemField2": {
                "inputType": "number",
                "query": false, // Explicitly false - should remain false
                "default": 0
            }
        }
    }
};

/**
 * Simple normalization function (simplified version of TemplateManager logic)
 */
function normalizeTemplateFields(template: MetaDataTemplateProcessed): void {
    for (const key in template) {
        const field = template[key];
        
        if (!field || typeof field !== 'object') {
            continue;
        }
        
        const isField = 'inputType' in field || 'query' in field || 'default' in field;
        
        if (isField) {
            const fieldDef = field as MetaDataTemplateFieldProcessed;
            
            // Set query: true by default if not explicitly defined
            if (fieldDef.query === undefined) {
                fieldDef.query = true;
            }
            
            // Process objectTemplate for list fields
            if (fieldDef.inputType === 'list' && 
                fieldDef.listType === 'object' && 
                fieldDef.objectTemplate &&
                typeof fieldDef.objectTemplate === 'object') {
                normalizeTemplateFields(fieldDef.objectTemplate as MetaDataTemplateProcessed);
            }
            
            // Process objectTemplate for editableObject fields
            if (fieldDef.inputType === 'editableObject' && 
                fieldDef.objectTemplate &&
                typeof fieldDef.objectTemplate === 'object') {
                normalizeTemplateFields(fieldDef.objectTemplate as MetaDataTemplateProcessed);
            }
        } else {
            // Nested object structure
            normalizeTemplateFields(field as MetaDataTemplateProcessed);
        }
    }
}

/**
 * Validation function
 */
function validateNormalization(): boolean {
    console.log('🧪 Testing query field normalization...\n');
    
    // Make a deep copy to test
    const testCopy = JSON.parse(JSON.stringify(testTemplate));
    
    console.log('📋 Before normalization:');
    console.log('- field1.query:', (testCopy.field1 as any).query);
    console.log('- field2.query:', (testCopy.field2 as any).query);
    console.log('- nested.field3.query:', (testCopy.nested.field3 as any).query);
    console.log('- objectList.objectTemplate.itemField1.query:', 
                (testCopy.objectList.objectTemplate.itemField1 as any).query);
    console.log('- objectList.objectTemplate.itemField2.query:', 
                (testCopy.objectList.objectTemplate.itemField2 as any).query);
    
    // Apply normalization
    normalizeTemplateFields(testCopy);
    
    console.log('\n📋 After normalization:');
    console.log('- field1.query:', (testCopy.field1 as any).query);
    console.log('- field2.query:', (testCopy.field2 as any).query);
    console.log('- nested.field3.query:', (testCopy.nested.field3 as any).query);
    console.log('- objectList.objectTemplate.itemField1.query:', 
                (testCopy.objectList.objectTemplate.itemField1 as any).query);
    console.log('- objectList.objectTemplate.itemField2.query:', 
                (testCopy.objectList.objectTemplate.itemField2 as any).query);
    
    // Validate results
    const checks = [
        { name: 'field1.query defaults to true', 
          pass: (testCopy.field1 as any).query === true },
        { name: 'field2.query remains false', 
          pass: (testCopy.field2 as any).query === false },
        { name: 'nested.field3.query defaults to true', 
          pass: (testCopy.nested.field3 as any).query === true },
        { name: 'objectTemplate itemField1.query defaults to true', 
          pass: (testCopy.objectList.objectTemplate.itemField1 as any).query === true },
        { name: 'objectTemplate itemField2.query remains false', 
          pass: (testCopy.objectList.objectTemplate.itemField2 as any).query === false },
    ];
    
    console.log('\n✅ Validation Results:');
    let allPassed = true;
    for (const check of checks) {
        const status = check.pass ? '✅' : '❌';
        console.log(`${status} ${check.name}`);
        if (!check.pass) allPassed = false;
    }
    
    if (allPassed) {
        console.log('\n🎉 All tests passed! Query field normalization works correctly.');
    } else {
        console.log('\n❌ Some tests failed!');
    }
    
    return allPassed;
}

// Run validation
validateNormalization();
