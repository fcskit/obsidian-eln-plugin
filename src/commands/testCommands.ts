import { Notice } from "obsidian";
import type ElnPlugin from "../main";
import { NewNote } from "../core/notes/NewNote";

/**
 * Adds test commands for the refactored architecture to the plugin
 */
export function addTestCommands(plugin: ElnPlugin) {
    
    // Template-driven test note with modal
    plugin.addCommand({
        id: 'eln-create-test-note-modal',
        name: 'Create Test Note (With Modal)',
        callback: async () => {
            console.log('🚀 Creating Test Note with Modal using template-driven approach');
            
            try {
                const newNote = new NewNote(plugin);
                
                // Use proper template-driven approach with minimal initial data
                // Field names must match the template structure (title, description, priority, tags, metadata.*)
                await newNote.createNote({
                    noteType: 'test',
                    initialData: {
                        // These field names match the test metadata template
                        'title': 'Modal Test Note',
                        'description': 'Test note created with modal interface'
                    },
                    skipModal: false // Show the modal
                });
                
                console.log('✅ Test note with modal created successfully!');
                
            } catch (error) {
                console.error('❌ Error creating test note with modal:', error);
                new Notice('Failed to create test note with modal');
            }
        }
    });

    // Template-driven test note without modal (direct creation)
    plugin.addCommand({
        id: 'eln-create-test-note-direct',
        name: 'Create Test Note (Direct)',
        callback: async () => {
            console.log('🚀 Creating Test Note directly using template-driven approach');
            
            try {
                const newNote = new NewNote(plugin);
                
                // Use proper template-driven approach - field names match test metadata template
                await newNote.createNote({
                    noteType: 'test',
                    initialData: {
                        // Correct field names matching the template structure
                        'title': 'Direct Test Note',
                        'description': 'Created directly using template-driven architecture',
                        'priority': 'high',
                        'tags': ['direct-creation', 'test'],
                        // Nested metadata fields (matching template structure)
                        'metadata': {
                            'author': 'Test User',
                            'category': 'Direct Testing'
                        }
                    },
                    skipModal: true // Bypass modal for direct creation
                });
                
                console.log('✅ Direct test note created successfully!');
                new Notice('Test note created successfully');
                
            } catch (error) {
                console.error('❌ Error creating direct test note:', error);
                new Notice('Failed to create direct test note');
            }
        }
    });

    // Minimal test note (let template handle everything)
    plugin.addCommand({
        id: 'eln-create-minimal-test-note',
        name: 'Create Minimal Test Note',
        callback: async () => {
            console.log('🚀 Creating Minimal Test Note with full template defaults');
            
            try {
                const newNote = new NewNote(plugin);
                
                // Minimal data - let template system handle all defaults
                await newNote.createNote({
                    noteType: 'test',
                    initialData: {
                        // Just override the title, let template provide all other defaults
                        'title': 'Minimal Test Note'
                    },
                    skipModal: true
                });
                
                console.log('✅ Minimal test note created successfully!');
                new Notice('Minimal test note created with template defaults');
                
            } catch (error) {
                console.error('❌ Error creating minimal test note:', error);
                new Notice('Failed to create minimal test note');
            }
        }
    });
}
