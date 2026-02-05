import { watch } from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { watch } from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * CSS Watch Mode for Development
 * 
 * This script watches for changes in src/styles/ and automatically
 * rebuilds the styles.css file when changes are detected.
 */

const cssDir = "./src/styles";

console.log("👀 Watching CSS files for changes...");
console.log(`📁 Watching directory: ${cssDir}`);
console.log("🔄 Changes will automatically trigger CSS rebuild");
console.log("⏹️  Press Ctrl+C to stop watching\n");

// Initial build
try {
    await execAsync("npm run build-css");
    console.log("✅ Initial CSS build completed\n");
} catch (error) {
    console.error("❌ Initial CSS build failed:", error.message);
}

// Watch for changes
const watcher = watch(cssDir, { recursive: true }, async (eventType, filename) => {
    if (filename && filename.endsWith('.css')) {
        console.log(`📝 Detected change in ${filename}`);
        
        try {
            await execAsync("npm run build-css");
            console.log("🔄 CSS rebuilt successfully\n");
        } catch (error) {
            console.error("❌ CSS rebuild failed:", error.message);
        }
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log("\n👋 Stopping CSS watcher...");
    watcher.close();
    process.exit(0);
});
const execAsync = promisify(exec);

/**
 * CSS Watch Mode for Development
 * 
 * This script watches for changes in src/styles/ and automatically
 * rebuilds the styles.css file when changes are detected.
 */

const cssDir = "./src/styles";

console.log("👀 Watching CSS files for changes...");
console.log(`📁 Watching directory: ${cssDir}`);
console.log("🔄 Changes will automatically trigger CSS rebuild");
console.log("⏹️  Press Ctrl+C to stop watching\n");

// Initial build
try {
    await execAsync("npm run build-css");
    console.log("✅ Initial CSS build completed\n");
} catch (error) {
    console.error("❌ Initial CSS build failed:", error.message);
}

// Watch for changes
const watcher = watch(cssDir, { recursive: true }, async (eventType, filename) => {
    if (filename && filename.endsWith('.css')) {
        console.log(`📝 Detected change in ${filename}`);
        
        try {
            await execAsync("npm run build-css");
            console.log("🔄 CSS rebuilt successfully\n");
        } catch (error) {
            console.error("❌ CSS rebuild failed:", error.message);
        }
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log("\n👋 Stopping CSS watcher...");
    watcher.close();
    process.exit(0);
});
