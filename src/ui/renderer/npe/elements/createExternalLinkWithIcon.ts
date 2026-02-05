import { setIcon } from "obsidian";
import { createExternalLink } from "./createExternalLink";

/**
 * Creates a link element for an external URL with an icon.
 * @param url - The URL to link to.
 * @param displayText - The text to display for the link.
 * @param icon - The icon name.
 * @returns The link element with an icon.
 */
export function createExternalLinkWithIcon(
    url: string,
    displayText: string,
    icon: string
): HTMLElement {
    const link = createExternalLink(url, displayText);

    // Remove the text content
    link.textContent = "";

    const iconContainer = link.createDiv({ cls: "clickable-icon" });
    setIcon(iconContainer, icon);

    return link;
}