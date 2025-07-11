import { Component } from "obsidian";

export function addToggleEvent(
    view: Component,
    iconContainer: HTMLElement,
    keyDiv: HTMLElement,
    targetContainer: HTMLElement
): void {
    const toggleContainer = () => {
        // console.log("Toggle event fired!");
        targetContainer.classList.toggle("hidden");
    };

    view.registerDomEvent(iconContainer, "click", toggleContainer);
    view.registerDomEvent(keyDiv, "click", toggleContainer);
}