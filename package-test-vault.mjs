#!/usr/bin/env node

import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📦 Packaging test-vault for distribution...');

// Ensure release directory exists
const releaseDir = join(__dirname, "release");
if (!existsSync(releaseDir)) {
    mkdirSync(releaseDir, { recursive: true });
}

// Check if test-vault folder exists
const testVaultDir = join(__dirname, "test-vault");
if (!existsSync(testVaultDir)) {
    console.error('❌ test-vault folder not found');
    process.exit(1);
}

try {
    // Create zip file for test vault
    const zipName = 'obsidian-eln-test-vault.zip';
    
    console.log('📁 Packaging test-vault folder...');
    console.log('   This includes:');
    console.log('   - Pre-configured .obsidian folder with plugin installed');
    console.log('   - Sample notes (experiments, chemicals, samples, etc.)');
    console.log('   - Assets folder with images');
    console.log('   - Home page and example notes');
    console.log();
    
    // Change to parent directory and zip test-vault
    process.chdir(__dirname);
    execSync(`zip -r "release/${zipName}" test-vault -x "*.DS_Store" -x "*debug-log.txt" -x "test-vault/test-note-result.json"`, { stdio: 'inherit' });
    
    console.log();
    console.log(`✅ Created ${zipName}`);
    console.log(`📍 Location: ./release/${zipName}`);
    console.log();
    console.log('ℹ️  Installation instructions for users:');
    console.log('   1. Download obsidian-eln-test-vault.zip');
    console.log('   2. Extract the zip file');
    console.log('   3. Open Obsidian → "Open folder as vault"');
    console.log('   4. Navigate to the extracted "test-vault" folder');
    console.log('   5. ⚠️  IMPORTANT: Open the folder that CONTAINS the .obsidian folder!');
    console.log('      (Some unzip tools create parent folder - use the inner folder)');
    console.log();
    console.log('📝 The test vault includes:');
    console.log('   - Plugin pre-installed and configured');
    console.log('   - Example notes for all template types');
    console.log('   - Assets folder with images');
    console.log('   - Ready to use immediately');
    
} catch (error) {
    console.error(`❌ Failed to package test-vault: ${error.message}`);
    process.exit(1);
}
