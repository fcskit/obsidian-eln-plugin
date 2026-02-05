import { App, TFile, setIcon } from "obsidian";
import type { ImageViewerOptions } from "../../../utils/parsers/parseImageViewerOptions";

export async function renderImageViewer(
    app: App,
    container: HTMLElement,
    opts: ImageViewerOptions
) {
    // Normalize folder path
    opts.folder = opts.folder.replace(/^\/|\/$/g, "");

    // Find all image files in the specified folder
    const folder = app.vault.getFolderByPath(opts.folder);
    if (!folder || !("children" in folder)) {
        container.createEl("div", { text: `Folder not found: ${opts.folder}` });
        return;
    }
    let images = (folder.children as TFile[]).filter(
        (f: TFile) =>
            f instanceof TFile &&
            (f.extension === "jpg" || f.extension === "png" || f.extension === "jpeg" || f.extension === "gif")
    );
    if (images.length === 0) {
        container.createEl("div", { text: `No images found in: ${opts.folder}` });
        return;
    }

    // Sort images if needed
    if (opts.shuffleOrder === "alphabetic") {
        images = images.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Initial image index
    let currentIdx = 0;
    if (opts.image) {
        const foundIdx = images.findIndex(img => img.name === opts.image);
        if (foundIdx !== -1) currentIdx = foundIdx;
    } else {
        currentIdx = Math.floor(Math.random() * images.length);
    }

    // === PARENT CONTAINER ===
    const parentContainer = container.createDiv({ cls: "image-viewer-parent" });
    if (opts.bgColor) parentContainer.style.backgroundColor = opts.bgColor;

    // === MANUAL SHUFFLE ===
    if (opts.shuffle === "manual" && images.length > 1) {
        // Create container for shuffle controls
        const shuffleControls = parentContainer.createDiv("image-viewer-action-buttons");
        // Add prev/next buttons
        const prevBtn = shuffleControls.createEl("button", { cls: "clickable-icon" });
        setIcon(prevBtn, "chevron-left");
        prevBtn.setAttribute("aria-label", "Previous Image");
        const nextBtn = shuffleControls.createEl("button", { cls: "clickable-icon" });
        setIcon(nextBtn, "chevron-right");
        nextBtn.setAttribute("aria-label", "Next Image");
        prevBtn.onclick = () => {
            if (opts.shuffleOrder === "random") {
                let prevIdx;
                do {
                    prevIdx = Math.floor(Math.random() * images.length);
                } while (prevIdx === currentIdx && images.length > 1);
                currentIdx = prevIdx;
            } else { // alphabetic or default
                currentIdx = (currentIdx - 1 + images.length) % images.length;
            }
            showImage(currentIdx);
            if (opts.thumbnails) updateThumbnails();
        };
        nextBtn.onclick = () => {
            if (opts.shuffleOrder === "random") {
                let nextIdx;
                do {
                    nextIdx = Math.floor(Math.random() * images.length);
                } while (nextIdx === currentIdx && images.length > 1);
                currentIdx = nextIdx;
            } else { // alphabetic or default
                currentIdx = (currentIdx + 1) % images.length;
            }
            showImage(currentIdx);
            if (opts.thumbnails) updateThumbnails();
        };
    }
    
    // === IMAGE CONTAINER ===
    const imgContainer = parentContainer.createDiv({ cls: "image-viewer-container" });

    const showImage = (idx: number) => {
        let img = imgContainer.querySelector("img.image-viewer") as HTMLImageElement;
        const image = images[idx];
        const imgSrc = app.vault.getResourcePath(image);

        const applyInvert = (imgEl: HTMLImageElement) => {
            if (opts.invertGray) {
                imgEl.style.filter = "invert(1) hue-rotate(180deg)";
            } else {
                imgEl.style.filter = "";
            }
        };

        if (img) {
            // Fade out, then change src, then fade in
            img.classList.add("fade-out");
            setTimeout(() => {
                img.src = imgSrc;
                img.classList.remove("fade-out");
                applyInvert(img);
            }, 700); // Match your CSS transition duration (ms)
        } else {
            // First render
            img = imgContainer.createEl("img", {
                cls: "image-viewer",
                attr: { src: imgSrc },
            });
            if (opts.size) {
                img.style.width = `${opts.size}px`;
                img.style.height = "auto";
            }
            applyInvert(img);
        }
        // Always update size if needed
        if (img && opts.size) {
            img.style.width = `${opts.size}px`;
            img.style.height = "auto";
        }
    };

    showImage(currentIdx);

    // === AUTO SHUFFLE ===
    let timer: number | undefined;
    if (opts.shuffle === "auto" && opts.interval && images.length > 1) {
        const nextImage = () => {
            if (opts.shuffleOrder === "random") {
                let nextIdx;
                do {
                    nextIdx = Math.floor(Math.random() * images.length);
                } while (nextIdx === currentIdx && images.length > 1);
                currentIdx = nextIdx;
            } else { // alphabetic or default
                currentIdx = (currentIdx + 1) % images.length;
            }
            showImage(currentIdx);
            if (opts.thumbnails) updateThumbnails();
        };
        timer = window.setInterval(nextImage, opts.interval * 1000);

        // Clean up interval when container is removed
        new MutationObserver((mutations, obs) => {
            if (!document.body.contains(container)) {
                if (timer) window.clearInterval(timer);
                obs.disconnect();
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

    // === THUMBNAILS ===
    let updateThumbnails = () => {};
    if (opts.thumbnails) {
        let thumbStart = 0;
        const maxThumbs = 5;
        const thumbContainer = parentContainer.createDiv("image-viewer-thumbnails");
        updateThumbnails = () => {
            thumbContainer.empty();
            const end = Math.min(thumbStart + maxThumbs, images.length);
            for (let i = thumbStart; i < end; i++) {
                const thumb = thumbContainer.createEl("img", {
                    cls: "image-viewer-thumb" + (i === currentIdx ? " active" : ""),
                    attr: { src: app.vault.getResourcePath(images[i]) }
                });
                thumb.onclick = () => {
                    currentIdx = i;
                    showImage(currentIdx);
                    updateThumbnails();
                };
            }
            // Add left/right controls if needed
            if (thumbStart > 0) {
                const left = thumbContainer.createEl("button");
                setIcon(left, "chevron-left");
                left.onclick = () => { thumbStart = Math.max(0, thumbStart - 1); updateThumbnails(); };
                thumbContainer.prepend(left);
            }
            if (end < images.length) {
                const right = thumbContainer.createEl("button");
                setIcon(right, "chevron-right");
                right.onclick = () => { thumbStart = Math.min(images.length - maxThumbs, thumbStart + 1); updateThumbnails(); };
                thumbContainer.append(right);
            }
        };
        updateThumbnails();
    }

}