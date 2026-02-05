import { setIcon, App, Menu } from "obsidian";

/**
 * Creates an options menu button and attaches it to the given button container.
 * Uses the Obsidian Menu API for menu rendering and actions.
 * @param app - The Obsidian app instance.
 * @param buttonContainer - The container to which the button will be added.
 * @param options - Optional: array of menu item definitions { label, icon, callback }
 * @returns The created button element.
 */
export function createOptionsMenuButton(
    app: App,
    buttonContainer: HTMLElement,
    options?: Array<{ label: string; icon?: string; callback: () => void }>
): HTMLElement {
    const btn = buttonContainer.createDiv({ cls: "clickable-icon npe-options-menu-btn" });
    btn.setAttribute("aria-label", "Options");
    setIcon(btn, "ellipsis");
    // btn.style.float = "right";
    // btn.style.marginLeft = "auto";
    // btn.style.marginRight = "0";

    btn.onclick = (e) => {
        e.stopPropagation();
        const menu = new Menu();
        if (options && options.length > 0) {
            for (const opt of options) {
                menu.addItem((item) => {
                    item.setTitle(opt.label);
                    if (opt.icon) item.setIcon(opt.icon);
                    item.onClick(opt.callback);
                });
            }
        }
        menu.showAtMouseEvent(e);
    };
    return btn;
}
