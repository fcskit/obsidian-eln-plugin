import { Component } from "obsidian";

/**
 * Adds a resize handle after a .npe-key-wrapper element to allow resizing --npe-key-width.
 * @param view The Obsidian Component for registerDomEvent
 * @param keyWrapper The .npe-key-wrapper HTMLElement
 * @param npeViewContainer The element (usually .npe-view-container) where --npe-key-width is set
 */
export function addKeyWrapperResizeHandle(
    view: Component,
    keyWrapper: HTMLElement,
    npeViewContainer: HTMLElement,
) {
    // Prevent duplicate handles
    if (keyWrapper.nextElementSibling && keyWrapper.nextElementSibling.classList.contains('npe-key-resize-handle')) return;

    // Create the handle as a sibling after keyWrapper
    const handle = keyWrapper.parentElement?.createDiv({ cls: 'npe-key-resize-handle' });
    if (!handle) return;
    keyWrapper.insertAdjacentElement('afterend', handle);

    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    view.registerDomEvent(handle, 'mousedown', (e: MouseEvent) => {
        e.preventDefault();
        isResizing = true;
        startX = e.clientX;
        const style = getComputedStyle(npeViewContainer);
        const widthValue = style.getPropertyValue('--npe-key-width').trim();
        startWidth = widthValue.endsWith('%')
            ? keyWrapper.offsetWidth
            : parseInt(widthValue) || keyWrapper.offsetWidth;
        handle.classList.add('resizing');
        document.body.style.cursor = 'ew-resize';
    });

    view.registerDomEvent(handle, 'mouseenter', () => {
        npeViewContainer.classList.add('npe-key-resize-handle-hovering');
    });
    view.registerDomEvent(handle, 'mouseleave', () => {
        npeViewContainer.classList.remove('npe-key-resize-handle-hovering');
    });

    const onMouseMove = (e: MouseEvent) => {
        if (!isResizing) return;
        const dx = e.clientX - startX;
        let newWidth = startWidth + dx;
        newWidth = Math.max(50, Math.min(newWidth, 600));
        npeViewContainer.style.setProperty('--npe-key-width', `${newWidth}px`);
    };

    const onMouseUp = () => {
        if (isResizing) {
            isResizing = false;
            handle.classList.remove('resizing');
            document.body.style.cursor = '';
        }
    };

    view.registerDomEvent(document, 'mousemove', onMouseMove);
    view.registerDomEvent(document, 'mouseup', onMouseUp);
}