import { copyFile, mkdir } from "fs/promises";
import { join } from "path";

const vaultPluginDir = "./test-vault/.obsidian/plugins/obsidian-eln";

async function main() {
    // Ensure vault plugin directory exists
    await mkdir(vaultPluginDir, { recursive: true });

    // Copy styles.css and manifest.json directly to test-vault
    // (main.js is already output there by esbuild)
    await copyFile("./styles.css", join(vaultPluginDir, "styles.css"));
    await copyFile("./manifest.json", join(vaultPluginDir, "manifest.json"));
    
    console.log("✓ Copied styles.css and manifest.json to test-vault");
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});