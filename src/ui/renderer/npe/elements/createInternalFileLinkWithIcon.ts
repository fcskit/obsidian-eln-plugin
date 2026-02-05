import { setIcon } from "obsidian";
import { createInternalFileLink } from "./createInternalFileLink";

/**
 * Creates an internal link element with an icon.
 * @param filename - The filename of the markdown file without extension.
 * @returns The link element with an icon.
 */
export function createInternalFileLinkWithIcon(filename: string): HTMLElement {
    const link = createInternalFileLink(filename);

    // Remove the text content
    link.textContent = "";

    const iconContainer = link.createDiv({
        cls: "clickable-icon",
        attr: { "aria-label": `Open ${filename}` },
    });

    setIcon(iconContainer, "link");
    return link;
}