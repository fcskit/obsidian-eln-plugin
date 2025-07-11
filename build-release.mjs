#!/usr/bin/env node

import { copyFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json to get version info
const packageJson = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8"));
const version = packageJson.version;

// Create release directory
const releaseDir = join(__dirname, "release");
if (!existsSync(releaseDir)) {
    mkdirSync(releaseDir, { recursive: true });
}

console.log(`Building release for version ${version}...`);

// Files to copy for the release
const filesToCopy = [
    {
        source: join(__dirname, "manifest.json"),
        dest: join(releaseDir, "manifest.json"),
        description: "Plugin manifest"
    },
    {
        source: join(__dirname, "styles.css"), 
        dest: join(releaseDir, "styles.css"),
        description: "Plugin styles"
    },
    {
        source: join(__dirname, "test-vault", ".obsidian", "plugins", "obsidian-eln", "main.js"),
        dest: join(releaseDir, "main.js"),
        description: "Compiled plugin code"
    }
];

// Copy files
for (const file of filesToCopy) {
    try {
        console.log(`Copying ${file.description}: ${file.source} -> ${file.dest}`);
        copyFileSync(file.source, file.dest);
        console.log(`✓ Successfully copied ${file.description}`);
    } catch (error) {
        console.error(`✗ Failed to copy ${file.description}:`, error.message);
        process.exit(1);
    }
}

// Create zip file for easy distribution
try {
    const zipName = `obsidian-eln-${version}.zip`;
    
    console.log(`\nCreating zip file: ${zipName}`);
    
    // Use native zip command (works on macOS/Linux)
    process.chdir(releaseDir);
    execSync(`zip -r "../${zipName}" .`);
    
    console.log(`✓ Created ${zipName}`);
} catch (error) {
    console.log(`⚠️  Could not create zip file automatically: ${error.message}`);
    console.log(`You can manually zip the contents of the release/ directory`);
}

console.log(`\n✓ Release built successfully!`);
console.log(`\nRelease files:`);
console.log(`  📁 ./release/ directory contains:`);
console.log(`    - manifest.json`);
console.log(`    - styles.css`);
console.log(`    - main.js`);
console.log(`  📦 obsidian-eln-${version}.zip (ready for distribution)`);
console.log(`\nTo install manually:`);
console.log(`  1. Copy the contents of release/ to your vault's .obsidian/plugins/obsidian-eln/ directory`);
console.log(`  2. Or extract the zip file directly into .obsidian/plugins/obsidian-eln/`);
