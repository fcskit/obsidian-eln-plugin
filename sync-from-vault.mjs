#!/usr/bin/env node

import { statSync, copyFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testVaultPluginDir = join(__dirname, "test-vault", ".obsidian", "plugins", "obsidian-eln");

// Command line arguments
const args = process.argv.slice(2);
const forceFromVault = args.includes('--force-from-vault');
const forceToVault = args.includes('--force-to-vault');

// Files to sync
const filesToSync = [
    {
        source: join(testVaultPluginDir, "manifest.json"),
        dest: join(__dirname, "manifest.json"),
        name: "manifest.json"
    },
    {
        source: join(testVaultPluginDir, "styles.css"),
        dest: join(__dirname, "styles.css"),
        name: "styles.css"
    }
];

console.log("🔄 Checking for updated files in test-vault...");

let filesUpdated = 0;

for (const file of filesToSync) {
    try {
        // Check if source file exists
        if (!existsSync(file.source)) {
            console.log(`⚠️  Source file not found: ${file.source}`);
            continue;
        }

        // Check if destination file exists
        if (!existsSync(file.dest)) {
            console.log(`📥 Copying new file: ${file.name}`);
            copyFileSync(file.source, file.dest);
            filesUpdated++;
            continue;
        }

        // Force sync options
        if (forceFromVault) {
            console.log(`🔄 Force syncing ${file.name} from test-vault to root`);
            copyFileSync(file.source, file.dest);
            filesUpdated++;
            continue;
        }

        if (forceToVault) {
            console.log(`🔄 Force syncing ${file.name} from root to test-vault`);
            copyFileSync(file.dest, file.source);
            filesUpdated++;
            continue;
        }

        // Get modification times for smart sync
        const sourceStat = statSync(file.source);
        const destStat = statSync(file.dest);

        // Compare modification times
        if (sourceStat.mtime > destStat.mtime) {
            console.log(`🔄 Updating ${file.name} (test-vault version is newer)`);
            console.log(`   Source: ${sourceStat.mtime.toISOString()}`);
            console.log(`   Dest:   ${destStat.mtime.toISOString()}`);
            copyFileSync(file.source, file.dest);
            filesUpdated++;
        } else {
            console.log(`✅ ${file.name} is up to date`);
        }
    } catch (error) {
        console.error(`❌ Error checking ${file.name}: ${error.message}`);
    }
}

if (filesUpdated > 0) {
    console.log(`\n📝 Updated ${filesUpdated} file(s)`);
    if (!forceToVault) {
        console.log("ℹ️  Consider committing these changes to version control");
    }
} else {
    console.log("\n✅ All files are up to date");
}

// Show usage if unknown arguments
if (args.length > 0 && !forceFromVault && !forceToVault) {
    console.log("\nUsage:");
    console.log("  npm run sync                    # Smart sync (newer files win)");
    console.log("  npm run sync -- --force-from-vault  # Force sync from test-vault to root");
    console.log("  npm run sync -- --force-to-vault    # Force sync from root to test-vault");
}
