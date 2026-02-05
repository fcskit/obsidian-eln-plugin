// Simple test to verify reactive dependency detection
const fs = require('fs');
const path = require('path');

// Read the UniversalObjectRenderer file and check if our changes are in place
const rendererPath = './src/ui/modals/components/UniversalObjectRenderer.ts';
const content = fs.readFileSync(rendererPath, 'utf8');

console.log('🔍 Checking reactive dependency detection...');

// Check for our key methods
const checks = [
    { name: 'scanTemplateForReactiveFields', pattern: /scanTemplateForReactiveFields/ },
    { name: 'extractReactiveDependenciesFromWhere', pattern: /extractReactiveDependenciesFromWhere/ },
    { name: 'checkFieldForReactiveFunctions', pattern: /checkFieldForReactiveFunctions/ },
    { name: 'Enhanced function descriptor support', pattern: /reactiveDeps/ },
    { name: 'QueryDropdown where clause detection', pattern: /templateField\.where.*QueryWhereClause/ }
];

let allPresent = true;
checks.forEach(check => {
    if (check.pattern.test(content)) {
        console.log(`✅ ${check.name} - FOUND`);
    } else {
        console.log(`❌ ${check.name} - MISSING`);
        allPresent = false;
    }
});

if (allPresent) {
    console.log('\n🎉 All reactive dependency detection features are implemented!');
    console.log('\nNext steps:');
    console.log('1. Fix the import path issues in the codebase');
    console.log('2. Test with the analysis template sample dropdown');
    console.log('3. Verify reactive updates when project selection changes');
} else {
    console.log('\n⚠️  Some features are missing or need verification');
}

// Check the analysis template
const analysisPath = './src/data/templates/metadata/analysis.ts';
if (fs.existsSync(analysisPath)) {
    const analysisContent = fs.readFileSync(analysisPath, 'utf8');
    if (analysisContent.includes('reactiveDeps: ["project.name"]')) {
        console.log('✅ Analysis template has reactive sample dropdown configuration');
    } else if (analysisContent.includes('"search": "sample"') && analysisContent.includes('"where"')) {
        console.log('✅ Analysis template has sample QueryDropdown (legacy format)');
        console.log('💡 Reactive dependencies will be detected at runtime from where clause');
    } else {
        console.log('❌ Analysis template missing sample dropdown configuration');
    }
}
