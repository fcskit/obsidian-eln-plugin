#!/usr/bin/env node

import { readFileSync } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json to get version info
const packageJson = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8"));
const version = packageJson.version;
const tagName = `v${version}`;
const zipFile = `obsidian-eln-${version}.zip`;

console.log(`🚀 Publishing GitHub release for ${tagName}...`);

// Step 1: Sync files from test-vault if they're newer
console.log("🔄 Syncing files from test-vault...");
try {
    execSync('node sync-from-vault.mjs', { stdio: 'inherit' });
} catch (error) {
    console.error(`⚠️  Warning: Failed to sync from test-vault: ${error.message}`);
    console.log("Continuing with publish...");
}

try {
    // Check if git is clean
    try {
        execSync('git diff-index --quiet HEAD --', { stdio: 'pipe' });
    } catch {
        console.log('⚠️  Warning: You have uncommitted changes. Consider committing them first.');
    }

    // Check if tag already exists
    try {
        execSync(`git rev-parse ${tagName}`, { stdio: 'pipe' });
        console.log(`ℹ️  Tag ${tagName} already exists. Skipping tag creation.`);
    } catch {
        // Tag doesn't exist, create it
        console.log(`📋 Creating git tag ${tagName}...`);
        execSync(`git tag ${tagName}`);
        
        console.log(`📤 Pushing tag to origin...`);
        execSync(`git push origin ${tagName}`);
    }

    // Check if release file exists
    try {
        readFileSync(join(__dirname, zipFile));
    } catch {
        console.error(`❌ Release file ${zipFile} not found. Run 'npm run release' first.`);
        process.exit(1);
    }

    // Check if GitHub CLI is available
    try {
        execSync('gh --version', { stdio: 'pipe' });
    } catch {
        console.error('❌ GitHub CLI not found. Please install it or create the release manually.');
        console.log('\nManual steps:');
        console.log(`1. Go to https://github.com/your-username/obsidian-eln-plugin/releases/new`);
        console.log(`2. Choose tag: ${tagName}`);
        console.log(`3. Upload: ${zipFile}`);
        process.exit(1);
    }

    // Create GitHub release
    console.log(`📦 Creating GitHub release...`);
    
    const releaseNotes = `Release ${tagName}

## Installation
Download the \`${zipFile}\` file and extract it to your vault's \`.obsidian/plugins/obsidian-eln/\` directory.

## Changes
- Plugin refactoring and improvements
- Enhanced renderer structure  
- Bug fixes and performance improvements

_For detailed changes, see the commit history._`;

    // Check if release already exists
    try {
        execSync(`gh release view ${tagName}`, { stdio: 'pipe' });
        console.log(`ℹ️  Release ${tagName} already exists. Updating with new assets...`);
        execSync(`gh release upload ${tagName} "${zipFile}" --clobber`);
    } catch {
        // Release doesn't exist, create it
        execSync(`gh release create ${tagName} "${zipFile}" --title "${tagName}" --notes "${releaseNotes}"`);
    }

    console.log(`✅ GitHub release ${tagName} published successfully!`);
    console.log(`🔗 View at: https://github.com/your-username/obsidian-eln-plugin/releases/tag/${tagName}`);
    
} catch (error) {
    console.error(`❌ Failed to publish release: ${error.message}`);
    process.exit(1);
}
