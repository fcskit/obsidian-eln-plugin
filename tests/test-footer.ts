/**
 * Test file to verify the footer functionality
 */

import { App } from "obsidian";
import { Footer } from "../src/ui/components/footer";
import { DEFAULT_SETTINGS } from "../src/settings/settings";

// Mock plugin for testing
const mockPlugin = {
    settings: DEFAULT_SETTINGS,
    manifest: { version: "0.7.0" }
};

// This is a test function to ensure footer can be instantiated without errors
export function testFooter(app: App) {
    console.log("Testing footer instantiation...");

    const footer = new Footer(app, mockPlugin as any);
    
    console.log("Footer instantiated successfully!");
    
    // Test initialization
    footer.init();
    console.log("Footer initialized successfully!");
    
    // Test cleanup
    footer.destroy();
    console.log("Footer destroyed successfully!");
    
    return footer;
}
