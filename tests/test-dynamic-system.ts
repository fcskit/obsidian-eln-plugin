/**
 * Test script to validate the dynamic note creation system
 * Run with: npm run test-dynamic-system
 */

import { DEFAULT_SETTINGS, NavbarGroup, NoteTypeUIConfig } from './src/settings/settings';

// Test that all enabled note types have valid configurations
function validateNoteTypeConfigurations(): boolean {
    const { noteTypeUIConfig, navbarGroups } = DEFAULT_SETTINGS;
    let isValid = true;
    const errors: string[] = [];

    // Collect all valid navbar group IDs
    const validGroupIds = new Set(navbarGroups.map(group => group.id));

    // Test each note type configuration
    Object.entries(noteTypeUIConfig).forEach(([noteType, config]) => {
        // Check if enabled note types have valid navbar groups
        if (config.enabled && config.showInNavbar) {
            if (!validGroupIds.has(config.navbarGroup)) {
                errors.push(`Note type "${noteType}" references invalid navbar group "${config.navbarGroup}"`);
                isValid = false;
            }
        }

        // Check required fields
        if (!config.displayName || !config.commandId || !config.commandName) {
            errors.push(`Note type "${noteType}" is missing required fields`);
            isValid = false;
        }

        // Check for duplicate command IDs
        const commandIds = Object.values(noteTypeUIConfig)
            .filter(c => c.enabled)
            .map(c => c.commandId);
        
        const duplicateCommandIds = commandIds.filter((id, index) => commandIds.indexOf(id) !== index);
        if (duplicateCommandIds.length > 0) {
            errors.push(`Duplicate command IDs found: ${duplicateCommandIds.join(', ')}`);
            isValid = false;
        }
    });

    // Test navbar groups
    const groupIds = navbarGroups.map(group => group.id);
    const duplicateGroupIds = groupIds.filter((id, index) => groupIds.indexOf(id) !== index);
    if (duplicateGroupIds.length > 0) {
        errors.push(`Duplicate navbar group IDs found: ${duplicateGroupIds.join(', ')}`);
        isValid = false;
    }

    if (!isValid) {
        console.error('❌ Configuration validation failed:');
        errors.forEach(error => console.error(`  - ${error}`));
    } else {
        console.log('✅ All configurations are valid');
    }

    return isValid;
}

// Test that note types are correctly grouped
function validateNavbarGrouping(): void {
    const { noteTypeUIConfig, navbarGroups } = DEFAULT_SETTINGS;
    
    console.log('\n📋 Navbar Grouping Analysis:');
    
    // Group note types by navbar group
    const groupedNoteTypes: Record<string, string[]> = {};
    
    navbarGroups.forEach(group => {
        groupedNoteTypes[group.id] = [];
    });
    
    Object.entries(noteTypeUIConfig).forEach(([noteType, config]) => {
        if (config.enabled && config.showInNavbar) {
            if (groupedNoteTypes[config.navbarGroup]) {
                groupedNoteTypes[config.navbarGroup].push(config.displayName);
            }
        }
    });

    // Display grouped note types
    navbarGroups
        .sort((a, b) => a.order - b.order)
        .forEach(group => {
            const noteTypes = groupedNoteTypes[group.id];
            console.log(`  ${group.name} (${noteTypes.length} items):`);
            noteTypes.forEach(noteType => console.log(`    - ${noteType}`));
        });
}

// Test settings extensibility example
function demonstrateExtensibility(): void {
    console.log('\n🔧 Extensibility Example:');
    console.log('To add a new "Protocol" note type, add this to settings:');
    
    const newNoteType: NoteTypeUIConfig = {
        enabled: true,
        displayName: "Protocol",
        navbarGroup: "experiments", 
        showInNavbar: true,
        commandId: "create-protocol-note",
        commandName: "Create Protocol Note"
    };
    
    console.log('noteTypeUIConfig: {');
    console.log('  // ...existing types...');
    console.log('  "protocol":', JSON.stringify(newNoteType, null, 4));
    console.log('}');
    
    const newNavbarGroup: NavbarGroup = {
        id: "protocols",
        name: "Protocols",
        order: 4
    };
    
    console.log('\nTo add a new navbar group:');
    console.log('navbarGroups: [');
    console.log('  // ...existing groups...');
    console.log('  ', JSON.stringify(newNavbarGroup, null, 2));
    console.log(']');
}

// Run all tests
function runTests(): void {
    console.log('🧪 Testing Dynamic Note Creation System\n');
    
    const isValid = validateNoteTypeConfigurations();
    validateNavbarGrouping();
    demonstrateExtensibility();
    
    console.log('\n' + '='.repeat(50));
    console.log(isValid ? '✅ All tests passed!' : '❌ Some tests failed!');
    console.log('='.repeat(50));
}

// Run if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    runTests();
}

export { validateNoteTypeConfigurations, validateNavbarGrouping, demonstrateExtensibility, runTests };
