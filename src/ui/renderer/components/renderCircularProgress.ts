import type { ListItemCache } from "obsidian";
import type { CircularProgress } from "../../views/CircularProgress";
import type { CircularProgressOptions } from "../../../types/ui";

export function renderCircularProgress(
    component: CircularProgress,
    opts: CircularProgressOptions = {}
): { percent: HTMLElement, h2: HTMLElement } {
    const container = component.containerEl.createDiv("progress-container");
    container.setAttr("id", "cp-container");

    const progress = opts.value ?? getTaskProgress(component);

    const cp_container = container.createDiv("circularprogress");
    const card = cp_container.createDiv("card");
    const percent = card.createDiv("percent");
    percent.style.setProperty('--clr', opts.color ?? '#8bdaa9');
    // 1. Set initial value to 0 for animation
    percent.style.setProperty('--num', "0");

    percent.createDiv("dot");

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "150");
    svg.setAttribute("height", "150");
    percent.appendChild(svg);
    const circle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle1.setAttribute("cx", "70");
    circle1.setAttribute("cy", "70");
    circle1.setAttribute("r", "70");
    svg.appendChild(circle1);
    const circle2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle2.setAttribute("cx", "70");
    circle2.setAttribute("cy", "70");
    circle2.setAttribute("r", "70");
    svg.appendChild(circle2);

    const number = percent.createDiv("number");
    const h2 = number.createEl("h2");
    // Create progress display securely
    h2.textContent = '0';
    const percentSpan = h2.createSpan({ text: '%' });
    const p = number.createEl("p");
    p.innerText = opts.taskLabel ?? "tasks";

    // 2. Animate to actual value after a short delay
    setTimeout(() => {
        percent.style.setProperty('--num', progress.toString());
        h2.textContent = progress.toString();
        h2.appendChild(percentSpan); // Re-add the % span
    }, 100); // 100ms delay for animation

    return { percent, h2 };
}

export function updateCircularProgressValue(
    component: CircularProgress,
    opts: CircularProgressOptions,
    percentEl: HTMLElement | null,
    h2El: HTMLElement | null
) {
    if (!percentEl || !h2El) return;
    const progress = opts.value ?? getTaskProgress(component);
    percentEl.style.setProperty('--num', progress.toString());
    h2El.textContent = progress.toString();
    const percentSpan = h2El.createSpan({ text: '%' });
    h2El.appendChild(percentSpan);
}

function getTaskProgress(
    component: CircularProgress,
): number {
    const file = component.app.workspace.getActiveFile();
    if (!file) return 0;

    const listItems = component.app.metadataCache.getFileCache(file)?.listItems || [] as ListItemCache[];

    const tasks = listItems.filter((item: ListItemCache) => item.task);
    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter((item: ListItemCache) => item.task === 'x');
    return Math.round((completedTasks.length / tasks.length) * 100);
}