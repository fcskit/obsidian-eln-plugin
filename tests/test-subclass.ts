import ElnPlugin from '../src/main';
import { NewNote } from '../src/modals/notes/NewNote';

/**
 * Test script to verify subclass template functionality
 * Run this in the browser console when the plugin is loaded
 */
async function testSubclassTemplate() {
    console.log("=== Testing Subclass Template Functionality ===");
    
    // Get the plugin instance (assuming it's available globally)
    const plugin = (window as any).elnAPI?.plugin;
    if (!plugin) {
        console.error("ELN Plugin not found. Make sure the plugin is loaded.");
        return;
    }
    
    console.log("Plugin found:", plugin);
    
    // Test creating a chemical note (which should have subclass functionality)
    const newNote = new NewNote(plugin);
    
    try {
        const result = await newNote.create({
            noteType: 'chemical',
            modalTitle: 'Test Chemical Note Creation',
            openNote: false // Don't actually open the note for testing
        });
        
        console.log("Note creation result:", result);
        
    } catch (error) {
        console.error("Error during note creation test:", error);
    }
}

// Export for manual testing
(window as any).testSubclassTemplate = testSubclassTemplate;

console.log("Test script loaded. Run testSubclassTemplate() in the console to test.");
