import { setIcon } from "obsidian";
import { fixDeprecatedKey, deprecatedToPlural } from "../utils/fixDeprecatedKey";
import type { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import { renderObject } from "../core/renderObject";

// deprecatedToPlural is now imported from utils

// fixDeprecatedKey is now imported from ../utils/fixDeprecatedKey

/**
 * Creates a button that, when clicked, fixes deprecated properties in the frontmatter.
 */
export function createFixDepricatedPropertiesButton(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    buttonContainer: HTMLElement,
    propertiesContainer: HTMLElement,
    parentKey: string,
    excludeKeys: string[]
) {
    const btn = buttonContainer.createDiv({ cls: "clickable-icon"});
    btn.setAttribute("aria-label", "Fix deprecated properties (tag, cssclass, alias)");
    setIcon(btn, "wrench");

    view.registerDomEvent(btn, "click", async () => {
        let changed = false;
        const app = view.app;
        const file = view.currentFile;
        if (!file) return;

        const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
        if (!frontmatter) return;

        for (const [deprecatedKey, pluralKey] of Object.entries(deprecatedToPlural)) {
            console.debug(`Fixing deprecated key: ${deprecatedKey} -> ${pluralKey}`);
            await fixDeprecatedKey(app, file, deprecatedKey, pluralKey);
            changed = true;
        }

        if (changed) {
            // Reload the view to reflect changes (same as createReloadButton)
            propertiesContainer.empty();
            renderObject(view, frontmatter, propertiesContainer, excludeKeys, 0, parentKey);
        }
    });

    return btn;
}