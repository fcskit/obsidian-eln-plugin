#!/usr/bin/env node

import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read release config if it exists, otherwise fall back to package.json
let releaseConfig;
let version, tagName, zipFile, isPrerelease, releaseName, releaseNotes;

const configPath = join(__dirname, "release.config.json");
if (existsSync(configPath)) {
    console.log("📋 Using release.config.json for release settings...");
    releaseConfig = JSON.parse(readFileSync(configPath, "utf8"));
    version = releaseConfig.version;
    tagName = releaseConfig.tag || `v${version}`;
    zipFile = `obsidian-eln-${version}.zip`;
    isPrerelease = releaseConfig.prerelease || false;
    releaseName = releaseConfig.name || tagName;
    releaseNotes = releaseConfig.releaseNotes || `Release ${tagName}`;
} else {
    console.log("📋 Using package.json for release settings...");
    const packageJson = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8"));
    version = packageJson.version;
    tagName = `v${version}`;
    zipFile = `obsidian-eln-${version}.zip`;
    isPrerelease = version.includes('beta') || version.includes('alpha');
    releaseName = tagName;
    releaseNotes = `Release ${tagName}\n\n## Installation\nDownload the \`${zipFile}\` file and extract it to your vault's \`.obsidian/plugins/obsidian-eln/\` directory.`;
}

console.log(`🚀 Publishing GitHub release for ${tagName}...`);
console.log(`   Version: ${version}`);
console.log(`   Prerelease: ${isPrerelease ? 'Yes' : 'No'}`);
console.log(`   Release name: ${releaseName}`);
console.log();

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

    // Check for assets file
    const assetsZip = 'obsidian-eln-assets.zip';
    const assetsPath = join(__dirname, 'release', assetsZip);
    const hasAssets = existsSync(assetsPath);
    if (!hasAssets) {
        console.log(`ℹ️  Assets zip not found. Run 'npm run package-assets' to include assets.`);
    }

    // Check for test vault file
    const testVaultZip = 'obsidian-eln-test-vault.zip';
    const testVaultPath = join(__dirname, 'release', testVaultZip);
    const hasTestVault = existsSync(testVaultPath);
    if (!hasTestVault) {
        console.log(`ℹ️  Test vault zip not found. Run 'npm run package-test-vault' to include test vault.`);
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
    
    // Prepare files to upload
    const filesToUpload = [zipFile];
    if (hasAssets) {
        filesToUpload.push(`release/${assetsZip}`);
    }
    if (hasTestVault) {
        filesToUpload.push(`release/${testVaultZip}`);
    }
    const filesArg = filesToUpload.map(f => `"${f}"`).join(' ');
    
    console.log(`📤 Files to upload: ${filesToUpload.join(', ')}`);
    console.log();
    
    // Check if release already exists
    try {
        execSync(`gh release view ${tagName}`, { stdio: 'pipe' });
        console.log(`ℹ️  Release ${tagName} already exists. Updating with new assets...`);
        execSync(`gh release upload ${tagName} ${filesArg} --clobber`, { stdio: 'inherit' });
    } catch {
        // Release doesn't exist, create it
        const prereleaseFlag = isPrerelease ? '--prerelease' : '';
        const command = `gh release create ${tagName} ${filesArg} --title "${releaseName}" --notes "${releaseNotes}" ${prereleaseFlag}`.trim();
        execSync(command, { stdio: 'inherit' });
    }

    console.log(`✅ GitHub release ${tagName} published successfully!`);
    console.log(`🔗 View at: https://github.com/fcskit/obsidian-eln-plugin/releases/tag/${tagName}`);
    
} catch (error) {
    console.error(`❌ Failed to publish release: ${error.message}`);
    process.exit(1);
}
