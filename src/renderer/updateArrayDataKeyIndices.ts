export function updateArrayDataKeyIndices(element: HTMLElement, index: number): void {
    const fullKey = element.getAttribute("data-key");
    if (!fullKey) return;

    const baseKey = fullKey.split(".").slice(0, -1).join(".");
    const newKey = `${baseKey}.${index}`;
    element.setAttribute("data-key", newKey);

    const children = element.querySelectorAll("[data-key]");
    children.forEach((child) => {
        const childKey = child.getAttribute("data-key");
        if (childKey) {
            const newChildKey = childKey.replace(fullKey, newKey);
            child.setAttribute("data-key", newChildKey);
        }
    });
}