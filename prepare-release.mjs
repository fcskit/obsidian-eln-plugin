#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get version from command line argument
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('❌ Please provide a version number');
    console.log('\nUsage:');
    console.log('  node prepare-release.mjs <version>');
    console.log('\nExamples:');
    console.log('  node prepare-release.mjs 0.7.0-beta.1   # Beta release');
    console.log('  node prepare-release.mjs 0.7.0          # Stable release');
    console.log('  node prepare-release.mjs 0.7.1-alpha.1  # Alpha release');
    process.exit(1);
}

const newVersion = args[0];
const isPrerelease = newVersion.includes('beta') || newVersion.includes('alpha');

console.log(`📝 Preparing release ${newVersion}...`);
console.log(`   Type: ${isPrerelease ? 'Prerelease' : 'Stable'}`);
console.log();

// Update package.json
console.log('📦 Updating package.json...');
const packagePath = join(__dirname, 'package.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
const oldVersion = packageJson.version;
packageJson.version = newVersion;
writeFileSync(packagePath, JSON.stringify(packageJson, null, '\t') + '\n');
console.log(`   ${oldVersion} → ${newVersion}`);

// Update manifest.json
console.log('📋 Updating manifest.json...');
const manifestPath = join(__dirname, 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.version = newVersion;
writeFileSync(manifestPath, JSON.stringify(manifest, null, '\t') + '\n');
console.log(`   version: ${newVersion}`);

// Update versions.json for Obsidian compatibility tracking
console.log('📊 Updating versions.json...');
const versionsPath = join(__dirname, 'versions.json');
const versions = JSON.parse(readFileSync(versionsPath, 'utf8'));
versions[newVersion] = manifest.minAppVersion;
writeFileSync(versionsPath, JSON.stringify(versions, null, '\t') + '\n');
console.log(`   ${newVersion}: ${manifest.minAppVersion}`);

// Check if release.config.json exists and offer to update it
try {
    const configPath = join(__dirname, 'release.config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    
    console.log('\n🔧 Updating release.config.json...');
    config.version = newVersion;
    config.tag = `v${newVersion}`;
    config.prerelease = isPrerelease;
    
    // Update the release name
    if (isPrerelease) {
        const betaMatch = newVersion.match(/beta\.(\d+)/);
        const alphaMatch = newVersion.match(/alpha\.(\d+)/);
        if (betaMatch) {
            config.name = `v${newVersion} - Beta ${betaMatch[1]}`;
        } else if (alphaMatch) {
            config.name = `v${newVersion} - Alpha ${alphaMatch[1]}`;
        }
    } else {
        config.name = `v${newVersion}`;
    }
    
    writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
    console.log('   ✓ Updated release configuration');
} catch (error) {
    console.log('\nℹ️  No release.config.json found (this is optional)');
}

// Git status check
console.log('\n📋 Git status:');
try {
    const status = execSync('git status --short', { encoding: 'utf8' });
    if (status) {
        console.log(status);
    } else {
        console.log('   Clean working tree');
    }
} catch (error) {
    console.log('   Could not check git status');
}

console.log('\n✅ Release preparation complete!');
console.log('\n📝 Next steps:');
console.log('   1. Review the changes: git diff');
console.log('   2. Update release.config.json with release notes (if using)');
console.log('   3. Commit the changes: git add -A && git commit -m "Prepare release v' + newVersion + '"');
console.log('   4. Build and publish: npm run publish');
console.log('\nOr run the full workflow:');
console.log('   git add -A && git commit -m "Prepare release v' + newVersion + '" && npm run publish');
