import { Command } from "obsidian";
import ElnPlugin from "../../../main";
import { NewNoteModal } from "../notes/NewNoteModal";
import { NewNote } from "../../../core/notes/NewNote";
import type { MetaDataTemplateProcessed } from "../../../types";

/**
 * Test note type for validating the refactored modal architecture.
 * This creates a simple note with basic fields to test:
 * - Template-driven rendering
 * - InputManager state management
 * - UniversalObjectRenderer functionality
 * - Subclass template application
 */

// Simple test template
const testNoteTemplate: MetaDataTemplateProcessed = {
    title: {
        inputType: "text",
        defaultValue: "",
        placeholder: "Enter note title...",
        editable: true,
        required: true
    },
    description: {
        inputType: "text", 
        defaultValue: "",
        placeholder: "Enter description...",
        editable: true,
        multiline: true
    },
    priority: {
        inputType: "dropdown",
        defaultValue: "medium",
        options: ["low", "medium", "high"],
        editable: true
    },
    tags: {
        inputType: "list",
        defaultValue: [],
        editable: true
    },
    metadata: {
        created: {
            inputType: "date",
            defaultValue: new Date().toISOString().split('T')[0],
            editable: false // Readonly field to test mixed mode
        },
        author: {
            inputType: "text",
            defaultValue: "Test User",
            editable: true
        },
        category: {
            inputType: "text",
            defaultValue: "General",
            editable: true
        }
    }
};

export function createTestNoteCommand(plugin: ElnPlugin): Command {
    return {
        id: 'create-test-note-refactored',
        name: 'Create Test Note (Refactored)',
        callback: () => {
            console.log('🚀 Creating Test Note with Refactored Architecture');
            
            try {
                const modal = new NewNoteModal(plugin, {
                    modalTitle: 'Create Test Note',
                    noteType: 'test-note',
                    metadataTemplate: testNoteTemplate,
                    onSubmit: async (result) => {
                        if (result) {
                            console.log('✅ Form submitted, creating note...');
                            
                            // Use the proper note creation infrastructure
                            await createTestNoteWithProperInfrastructure(plugin, result.formData, result.template);
                        } else {
                            console.log('❌ Test note creation cancelled');
                        }
                    }
                });
                
                modal.open();
                
                // Add test button to demonstrate subclass functionality
                setTimeout(() => {
                    addTestSubclassButton(modal);
                }, 100);
                
            } catch (error) {
                console.error('❌ Error creating test modal:', error);
            }
        }
    };
}

function addTestSubclassButton(modal: NewNoteModal): void {
    // Add a test button to the modal to demonstrate subclass template application
    const modalEl = modal.contentEl;
    if (modalEl) {
        const testSection = modalEl.createDiv({ cls: 'eln-test-section' });
        testSection.createEl('h3', { text: 'Testing Features' });
        
        const subclassBtn = testSection.createEl('button', { 
            text: 'Apply Test Subclass',
            cls: 'mod-cta'
        });
        
        subclassBtn.onclick = () => {
            // Test with electrolyte subclass if available, otherwise just log
            try {
                modal.applySubclassTemplateByName('electrolyte');
                console.log('Test subclass template applied: electrolyte');
            } catch (error) {
                console.log('Test subclass not available, test skipped:', error);
            }
        };
        
        const resetBtn = testSection.createEl('button', { 
            text: 'Reset Template',
            cls: 'mod-warning'
        });
        
        resetBtn.onclick = () => {
            modal.resetTemplate();
            console.log('Template reset to base');
        };
        
        const dataBtn = testSection.createEl('button', { 
            text: 'Log Current Data'
        });
        
        dataBtn.onclick = () => {
            const data = modal.getCurrentData();
            console.log('Current form data:', data);
        };
    }
}

async function createTestNoteWithProperInfrastructure(
    plugin: ElnPlugin, 
    formData: Record<string, unknown>, 
    template: MetaDataTemplateProcessed
): Promise<void> {
    try {
        console.log('📝 Creating test note with proper infrastructure...');
        
        // Use the existing NewNote system but bypass its modal since we already have our data
        const newNote = new NewNote(plugin);
        
        // Create the note directly with our collected form data using the refactored interface
        await newNote.createNote({
            noteType: 'test',
            initialData: {
                'test.title': formData.title as string || 'Test Note',
                'test.description': 'Test note created from refactored modal',
                'test.priority': 'medium',
                'test.tags': ['test', 'refactored'],
                'metadata.created': new Date().toISOString(),
                'metadata.author': plugin.settings.general.authors[0]?.name || 'Unknown',
                'metadata.category': 'testing'
            },
            skipModal: true
        });
        
        console.log('✅ Test note created successfully using refactored architecture');
        
        // Save debug information
        await plugin.app.vault.adapter.write('test-note-result.json', JSON.stringify({
            formData,
            template,
            noteType: 'test',
            timestamp: new Date().toISOString()
        }, null, 2));
        
        // Show the right panel for NPE
        plugin.app.workspace.rightSplit?.expand();
        
    } catch (error) {
        console.error('❌ Error in createTestNoteWithProperInfrastructure:', error);
    }
}


