import { Component, setIcon } from "obsidian";

/**
 * Creates a toggle button to collapse or expand all properties.
 * @param buttonContainer - The container element to append the toggle button to.
 * @param propertiesContainer - The container element containing the properties to toggle.
 */
export function createToggleButton(
    view: Component,
    buttonContainer: HTMLElement,
    propertiesContainer: HTMLElement
): void {
    const toggleButton = buttonContainer.createDiv({ cls: "clickable-icon" });
    toggleButton.setAttribute("aria-label", "Collapse All");
    // const toggleIcon = toggleButton.createDiv({ cls: "npe-button-icon" });
    // const toggleLabel = toggleButton.createDiv({ cls: "npe-button-label", text: "Expand" });

    setIcon(toggleButton, "chevrons-down-up");

    let allCollapsed = true;

    const toggleAll = () => {
        const allPropertiesContainers = propertiesContainer.querySelectorAll(
            ".npe-object-properties-container, .npe-array-objects-container"
        );

        allPropertiesContainers.forEach((container) => {
            container.classList.toggle("hidden", allCollapsed);
        });

        allCollapsed = !allCollapsed;

        setIcon(toggleButton, allCollapsed ? "chevrons-down-up" : "chevrons-up-down");
        toggleButton.setAttribute("aria-label", allCollapsed ? "Collapse All" : "Expand All");
    };

    view.registerDomEvent(toggleButton, "click", toggleAll);
}