export function updateDataKeys(element: HTMLElement, oldKey: string, newKey: string): void {
    const keyBase = oldKey.split(".").slice(0, -1).join(".");
    const newFullKey = `${keyBase}.${newKey}`;
    element.setAttribute("data-key", newFullKey);

    const children = element.querySelectorAll("[data-key]");
    children.forEach((child) => {
        const childKey = child.getAttribute("data-key");
        if (childKey) {
            const newChildKey = childKey.replace(oldKey, newFullKey);
            child.setAttribute("data-key", newChildKey);
        }
    });
}