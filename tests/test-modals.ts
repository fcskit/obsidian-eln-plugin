/**
 * Test file to verify the new modal functionality works correctly
 * This file demonstrates the usage of the new modal dialogs
 */

import { App } from "obsidian";
import { PathTemplateEditorModal, MetadataTemplateEditorModal } from "../src/ui/modals/settings/TemplateEditorModal";
import { ArrayEditorModal } from "../src/ui/modals/settings/ArrayEditorModal";
import { FilePickerModal } from "../src/ui/modals/FilePickerModal";
import { NoteTypeManagerModal } from "../src/ui/modals/settings/NoteTypeManagerModal";
import { DEFAULT_SETTINGS } from "../src/settings/settings";

// This is a test file to ensure all modals can be instantiated without errors
export function testModals(app: App) {
    console.log("Testing modal instantiation...");

    // Test PathTemplateEditorModal
    const pathTemplate = DEFAULT_SETTINGS.note.default.titleTemplate;
    const pathModal = new PathTemplateEditorModal(
        app,
        pathTemplate,
        (template) => console.log("Path template updated:", template)
    );

    // Test MetadataTemplateEditorModal
    const metadataTemplate = DEFAULT_SETTINGS.note.default.metadataTemplate;
    const metadataModal = new MetadataTemplateEditorModal(
        app,
        metadataTemplate,
        (template) => console.log("Metadata template updated:", template)
    );

    // Test ArrayEditorModal
    const testArray = [{ name: "Test", value: "123" }];
    const arrayModal = new ArrayEditorModal(
        app,
        testArray,
        (items) => console.log("Array updated:", items),
        { name: "", value: "" },
        "Test Array"
    );

    // Test FilePickerModal
    const fileModal = new FilePickerModal(
        app,
        (path) => console.log("File selected:", path),
        ".md",
        "Test File Picker"
    );

    // Test NoteTypeManagerModal
    const noteTypeModal = new NoteTypeManagerModal(
        app,
        DEFAULT_SETTINGS,
        (settings) => console.log("Settings updated:", settings)
    );

    console.log("All modals instantiated successfully!");
    
    return {
        pathModal,
        metadataModal,
        arrayModal,
        fileModal,
        noteTypeModal
    };
}
