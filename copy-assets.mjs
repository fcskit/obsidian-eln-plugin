import { copyFile, mkdir } from "fs/promises";
import { dirname, join } from "path";

const distDir = "./dist";
const vaultPluginDir = "./vault/.obsidian/plugins/obsidian-eln";

const files = ["styles.css", "manifest.json", "main.js"];

async function copyToDir(file, targetDir) {
    const src = join(distDir, file);
    const dest = join(targetDir, file);
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(src, dest);
}

async function main() {
    // Ensure dist directory exists before copying
    await mkdir(distDir, { recursive: true });

    // Copy styles.css and manifest.json to dist (from src)
    await copyFile("./src/styles.css", join(distDir, "styles.css"));
    await copyFile("./src/manifest.json", join(distDir, "manifest.json"));

    // Copy main.js, styles.css, manifest.json to vault plugin folder
    for (const file of files) {
        await copyToDir(file, vaultPluginDir);
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});