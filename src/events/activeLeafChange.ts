/* Globylly handles the active leaf change event in Obsidian.
 * It adds a Navbar and Footer to the currently active note if applicable.
*/
import { App, WorkspaceLeaf, MarkdownView } from "obsidian";
import ElnPlugin from "../main";
import { Navbar } from "../ui/components/navbar";

export function handleActiveLeafChange(app: App, plugin: ElnPlugin): void {
    /* Obsidian has no dedicated event to detect a change of the active file.
     * The active leaf change event is the closest we can get to detect a change of the active file.
     * However, this the active leaf change event may not only be triggered when switching between notes,
     * but also if the user clicks into the left and right panels, e.g. the file explorer or the tag pane.
     * In general we only want to perform an action if the active file changes. Therefore, we need to
     * to keep track of the last active file and only perform actions if the active file changes.
    */
    const activeLeaf = app.workspace.getLeaf();

    // Add Navbar to the new active leaf
    // Footer is now handled globally by the Footer class
    if (
        activeLeaf &&
        activeLeaf.view instanceof MarkdownView &&
        activeLeaf.view.file !== plugin.lastActiveFile
    ) {
        addNavbar(app, plugin, activeLeaf);
        plugin.lastActiveFile = activeLeaf.view.file;
    }
}

/**
 * Adds a navbar to the currently active note if applicable.
 * @param app The Obsidian app instance.
 * @param plugin The ELN plugin instance.
 * @param leaf The currently active workspace leaf.
 */
function addNavbar(app: App, plugin: ElnPlugin, leaf: WorkspaceLeaf): void {
    const view = leaf.view;
    if (view instanceof MarkdownView && view.file) {
        const frontmatter = app.metadataCache.getFileCache(view.file)?.frontmatter;
        let renderNavbar = plugin.settings.navbar.enabled;

        // Check if the frontmatter has a navbar property and update renderNavbar accordingly
        if (frontmatter && frontmatter.navbar !== undefined) {
            renderNavbar = frontmatter.navbar;
        }

        if (renderNavbar) {
            const navbar = new Navbar(app, plugin);
            navbar.init();
        }
    } else if (view.getViewType() === "empty") {
        // If the view is empty, we can still add the navbar
        if (plugin.settings.navbar.enabled) {
            const navbar = new Navbar(app, plugin);
            navbar.init();
        }
    }
}