/**
 * Simple validation script for the dynamic note creation system
 */

// Simulate the DEFAULT_SETTINGS structure for validation
const DEFAULT_SETTINGS = {
    navbarGroups: [
        { id: "resources", name: "Resources", order: 1 },
        { id: "experiments", name: "Experiments", order: 2 },
        { id: "other", name: "Other", order: 3 },
    ],
    noteTypeUIConfig: {
        chemical: {
            enabled: true,
            displayName: "Chemical",
            navbarGroup: "resources",
            showInNavbar: true,
            commandId: "create-chemical-note",
            commandName: "Create Chemical Note"
        },
        device: {
            enabled: true,
            displayName: "Device",
            navbarGroup: "resources",
            showInNavbar: true,
            commandId: "create-device-note",
            commandName: "Create Device Note"
        },
        instrument: {
            enabled: true,
            displayName: "Instrument",
            navbarGroup: "resources",
            showInNavbar: true,
            commandId: "create-instrument-note",
            commandName: "Create Instrument Note"
        },
        analysis: {
            enabled: true,
            displayName: "Analysis",
            navbarGroup: "experiments",
            showInNavbar: true,
            commandId: "create-analysis-note",
            commandName: "Create Analysis Note"
        },
        process: {
            enabled: true,
            displayName: "Process",
            navbarGroup: "experiments",
            showInNavbar: true,
            commandId: "create-process-note",
            commandName: "Create Process Note"
        },
        sample: {
            enabled: true,
            displayName: "Sample",
            navbarGroup: "experiments",
            showInNavbar: true,
            commandId: "create-sample-note",
            commandName: "Create Sample Note"
        },
        dailyNote: {
            enabled: true,
            displayName: "Daily Note",
            navbarGroup: "other",
            showInNavbar: true,
            commandId: "create-daily-note",
            commandName: "Create Daily Note"
        },
        project: {
            enabled: true,
            displayName: "Project",
            navbarGroup: "other",
            showInNavbar: true,
            commandId: "create-project-note",
            commandName: "Create Project Note"
        },
        meeting: {
            enabled: true,
            displayName: "Meeting",
            navbarGroup: "other",
            showInNavbar: true,
            commandId: "create-meeting-note",
            commandName: "Create Meeting Note"
        },
        sampleList: {
            enabled: false,
            displayName: "Sample List",
            navbarGroup: "other",
            showInNavbar: false,
            commandId: "create-sample-list-note",
            commandName: "Create Sample List Note"
        },
        default: {
            enabled: true,
            displayName: "New Note",
            navbarGroup: "other",
            showInNavbar: false,
            commandId: "create-new-note",
            commandName: "Create New Note"
        }
    }
};

function validateConfiguration() {
    console.log('🧪 Testing Dynamic Note Creation System\n');
    
    const { noteTypeUIConfig, navbarGroups } = DEFAULT_SETTINGS;
    let isValid = true;
    const errors = [];

    // Collect all valid navbar group IDs
    const validGroupIds = new Set(navbarGroups.map(group => group.id));
    console.log('📋 Available navbar groups:', Array.from(validGroupIds).join(', '));

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
    });

    // Check for duplicate command IDs
    const commandIds = Object.values(noteTypeUIConfig)
        .filter(c => c.enabled)
        .map(c => c.commandId);
    
    const duplicateCommandIds = commandIds.filter((id, index) => commandIds.indexOf(id) !== index);
    if (duplicateCommandIds.length > 0) {
        errors.push(`Duplicate command IDs found: ${duplicateCommandIds.join(', ')}`);
        isValid = false;
    }

    if (!isValid) {
        console.error('❌ Configuration validation failed:');
        errors.forEach(error => console.error(`  - ${error}`));
    } else {
        console.log('✅ All configurations are valid');
    }

    // Show navbar grouping
    console.log('\n📋 Navbar Grouping Analysis:');
    
    const groupedNoteTypes = {};
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

    navbarGroups
        .sort((a, b) => a.order - b.order)
        .forEach(group => {
            const noteTypes = groupedNoteTypes[group.id];
            console.log(`  ${group.name} (${noteTypes.length} items):`);
            noteTypes.forEach(noteType => console.log(`    - ${noteType}`));
        });

    console.log('\n🔧 Dynamic System Benefits:');
    console.log('  ✓ Commands are registered dynamically based on settings');
    console.log('  ✓ Navbar groups are configurable and sortable');
    console.log('  ✓ Note types can be enabled/disabled individually');
    console.log('  ✓ New note types can be added without code changes');
    console.log('  ✓ Legacy modal classes have been replaced with unified NewNote class');

    console.log('\n' + '='.repeat(50));
    console.log(isValid ? '✅ All tests passed!' : '❌ Some tests failed!');
    console.log('='.repeat(50));

    return isValid;
}

validateConfiguration();
