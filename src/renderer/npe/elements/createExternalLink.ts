/**
 * Creates a link element for an external URL.
 * @param url - The URL to link to.
 * @param displayText - The text to display for the link.
 * @returns The link element.
 */
export function createExternalLink(url: string, displayText: string): HTMLElement {
    return createFragment().createEl("a", {
        attr: {
            href: url,
            target: "_blank",
            rel: "noopener nofollow",
        },
        text: displayText,
    });
}