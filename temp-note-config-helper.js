// Helper to quickly add navbar and commands configurations to all note types
// Run this in console to generate the configurations

const noteConfigs = {
    dailyNote: { name: "Daily Note", group: "other", display: true, commandId: "create-daily-note" },
    device: { name: "Device", group: "resources", display: true, commandId: "create-device-note" },
    instrument: { name: "Instrument", group: "resources", display: true, commandId: "create-instrument-note" },
    meeting: { name: "Meeting", group: "other", display: true, commandId: "create-meeting-note" },
    process: { name: "Process", group: "experiments", display: true, commandId: "create-process-note" },
    project: { name: "Project", group: "other", display: true, commandId: "create-project-note" },
    sample: { name: "Sample", group: "experiments", display: true, commandId: "create-sample-note" },
    sampleList: { name: "Sample List", group: "other", display: false, commandId: "create-sample-list-note" },
    default: { name: "New Note", group: "other", display: false, commandId: "create-new-note" }
};

for (const [noteType, config] of Object.entries(noteConfigs)) {
    console.log(`        ${noteType}: {
            navbar: {
                display: ${config.display},
                name: "${config.name}",
                group: "${config.group}"
            },
            commands: {
                enabled: true,
                id: "${config.commandId}",
                name: "Create ${config.name}"
            },`);
}
