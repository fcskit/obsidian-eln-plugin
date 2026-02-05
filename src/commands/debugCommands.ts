import type ElnPlugin from "../main";
import { DebugSettingsModal } from "../ui/modals/dialogs/DebugSettingsModal";

/**
 * Adds debug and logging control commands to the plugin
 */
export function addDebugCommands(plugin: ElnPlugin) {
    
    // Main debug settings modal - unified interface for all debug options
    plugin.addCommand({
        id: 'eln-debug-settings',
        name: 'Debug Settings',
        callback: () => {
            new DebugSettingsModal(plugin.app, plugin).open();
        }
    });
}
