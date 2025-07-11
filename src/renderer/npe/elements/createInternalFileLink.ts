/**
 * Converts an Obsidian filename into an internal link element.
 * @param filename - The filename of the markdown file without extension.
 * @returns The link element.
 */
export function createInternalFileLink(filename: string): HTMLElement {
    const displayText = filename;
    const linkText = filename;

    return createFragment().createEl("a", {
        attr: {
            "data-href": linkText,
            target: "_blank",
            rel: "noopener nofollow",
        },
        href: linkText,
        cls: "internal-link",
        text: displayText,
    });
}