#!/usr/bin/env node
/**
 * Script to convert legacy path templates to new PathTemplate format
 * Run this once to convert all templates in settings.ts
 */

const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../src/settings/settings.ts');
let content = fs.readFileSync(settingsPath, 'utf8');

// Regular expression to find legacy template arrays
// Matches: fileName: [ ... ], or folderPath: [ ... ],
const legacyTemplateRegex = /(fileName|folderPath):\s*\[([\s\S]*?)\],/g;

let match;
let replacements = [];

while ((match = legacyTemplateRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const fieldName = match[1]; // 'fileName' or 'folderPath'
    const arrayContent = match[2]; // Everything between [ and ]
    
    // Skip if already converted (contains 'segments:')
    if (fullMatch.includes('segments:')) {
        continue;
    }
    
    // Parse the array items
    const items = [];
    const itemRegex = /\{\s*type:\s*['"](\w+)['"]\s*,\s*field:\s*["']([^"']+)["']\s*,\s*separator:\s*["']([^"']*)["']\s*\}/g;
    
    let itemMatch;
    while ((itemMatch = itemRegex.exec(arrayContent)) !== null) {
        const type = itemMatch[1];
        const field = itemMatch[2];
        const separator = itemMatch[3];
        
        items.push({ type, field, separator });
    }
    
    // Convert to new format
    const segments = items.map(item => {
        switch (item.type) {
            case 'string':
                return `                    { kind: "literal", value: "${item.field}", separator: "${item.separator}" }`;
            
            case 'userInput':
                return `                    { kind: "field", path: "${item.field}", separator: "${item.separator}" }`;
            
            case 'index':
                return `                    { kind: "counter", prefix: "", separator: "${item.separator}" }`;
            
            case 'dateField':
                // Convert date fields to date context functions
                let expression;
                switch (item.field) {
                    case 'currentDate':
                        expression = 'date.format(\'YYYY-MM-DD\')';
                        break;
                    case 'year':
                        expression = 'date.year()';
                        break;
                    case 'month':
                        expression = 'date.month()';
                        break;
                    case 'monthName':
                        expression = 'date.monthName()';
                        break;
                    case 'weekday':
                        expression = 'date.weekdayName()';
                        break;
                    case 'dayOfMonth':
                        expression = 'date.day()';
                        break;
                    default:
                        expression = `date.format('${item.field}')`;
                }
                return `                    { kind: "function", context: ["date"], expression: "${expression}", separator: "${item.separator}" }`;
            
            case 'function':
                return `                    { kind: "function", function: "${item.field}", separator: "${item.separator}" }`;
            
            default:
                console.warn(`Unknown type: ${item.type}, treating as literal`);
                return `                    { kind: "literal", value: "${item.field}", separator: "${item.separator}" }`;
        }
    });
    
    // Build new format
    const newFormat = `${fieldName}: {
                segments: [
${segments.join(',\n')}
                ]
            },`;
    
    replacements.push({
        old: fullMatch,
        new: newFormat
    });
}

// Apply replacements
for (const { old, new: newText } of replacements) {
    content = content.replace(old, newText);
}

// Write back
fs.writeFileSync(settingsPath, content, 'utf8');

console.log(`✅ Converted ${replacements.length} templates`);
console.log(`\nConverted templates in: ${settingsPath}`);
console.log(`\nPlease review the changes and run: npm run build-fast`);
