import { TFile, App, FrontMatterCache } from 'obsidian';

/**
 * Extracts tags specifically from the frontmatter of the file cache.
 * @param cache The frontmatter cache object.
 * @returns An array of tag strings from frontmatter.
 */
function extractFrontmatterTags(cache: FrontMatterCache | undefined): string[] {
    if (!cache) return [];
    const tags = cache['tags'] || cache['tag'];
    if (Array.isArray(tags)) {
        return tags.map((tag) => typeof tag === 'string' ? tag.trim() : tag.toString().trim());
    } else if (typeof tags === 'string') {
        return [tags];
    }
    return [];
}
// Updated function using the helper
export function searchFilesByTag(app: App, searchTag: string): TFile[] {
    const files = app.vault.getMarkdownFiles();
    return files.filter(file => {
        const cache = app.metadataCache.getFileCache(file)?.frontmatter as FrontMatterCache | undefined;
        const tags = extractFrontmatterTags(cache);
        // Return true if any of the array items starts with the searchTag
        return tags.some(tag => tag.startsWith(searchTag));
    });
}