#!/usr/bin/env node

import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📦 Packaging assets for distribution...');

// Ensure release directory exists
const releaseDir = join(__dirname, "release");
if (!existsSync(releaseDir)) {
    mkdirSync(releaseDir, { recursive: true });
}

// Check if assets folder exists
const assetsDir = join(__dirname, "test-vault", "assets");
if (!existsSync(assetsDir)) {
    console.error('❌ Assets folder not found at test-vault/assets/');
    process.exit(1);
}

try {
    // Create zip file for assets
    const zipName = 'obsidian-eln-assets.zip';
    
    console.log('📁 Packaging assets folder...');
    
    // Change to test-vault directory and zip assets
    process.chdir(join(__dirname, "test-vault"));
    execSync(`zip -r "../release/${zipName}" assets -x "*.DS_Store"`);
    
    console.log(`✅ Created ${zipName}`);
    console.log(`📍 Location: ./release/${zipName}`);
    console.log();
    console.log('ℹ️  This zip contains image assets for:');
    console.log('   - Project banners');
    console.log('   - Device/instrument images');
    console.log('   - Contact photos');
    console.log('   - Daily note banners');
    console.log();
    console.log('📝 Users should extract this to their vault root to get full template rendering.');
    
} catch (error) {
    console.error(`❌ Failed to package assets: ${error.message}`);
    process.exit(1);
}
