import { elements } from "../../../data/elements";
import type { PeriodicTableView } from "../../views/PeriodicTableView";
import type { Element } from "../../../types/core";

export function renderPeriodicTable(view: PeriodicTableView, container: HTMLElement) {
    container.empty();
    const table = container.createEl("table", { cls: "periodic-table" });

    // Find max period and group
    const maxPeriod = Math.max(...Object.values(elements).map(e => e.period));
    const maxGroup = Math.max(
        ...Object.values(elements)
            .map(e => typeof e.group === "number" ? e.group : -Infinity)
    );

    // Helper to create popup
    function createPopup(contentDiv: HTMLElement, el: Element, symbol: string) {
        let popup: HTMLDivElement | null = null;

        view.registerDomEvent(contentDiv, "mouseenter", (e) => {
            popup = document.createElement("div");
            popup.className = "element-popup";
            
            // Create popup content securely using DOM API
            const nameHeader = document.createElement("strong");
            nameHeader.textContent = `${el.name} (${el.atomicNumber})`;
            popup.appendChild(nameHeader);
            popup.appendChild(document.createElement("br"));
            
            const symbolSpan = document.createElement("span");
            symbolSpan.textContent = `Symbol: ${symbol}`;
            popup.appendChild(symbolSpan);
            popup.appendChild(document.createElement("br"));
            
            const groupSpan = document.createElement("span");
            groupSpan.textContent = `Group: ${el.groupName}`;
            popup.appendChild(groupSpan);
            popup.appendChild(document.createElement("br"));
            
            const periodSpan = document.createElement("span");
            periodSpan.textContent = `Period: ${el.period}`;
            popup.appendChild(periodSpan);
            popup.appendChild(document.createElement("br"));
            
            const massSpan = document.createElement("span");
            massSpan.textContent = `Atomic Mass: ${el.atomicMass}`;
            popup.appendChild(massSpan);
            popup.appendChild(document.createElement("br"));
            
            const electronegativitySpan = document.createElement("span");
            electronegativitySpan.textContent = `Electronegativity: ${el.electronegativity ?? "n/a"}`;
            popup.appendChild(electronegativitySpan);
            popup.appendChild(document.createElement("br"));
            
            const stabilitySpan = document.createElement("span");
            stabilitySpan.textContent = `Stability: ${el.stability}`;
            popup.appendChild(stabilitySpan);
            popup.appendChild(document.createElement("br"));
            
            const isotopesSpan = document.createElement("span");
            isotopesSpan.textContent = `Isotopes: ${el.isotopes?.join(", ") ?? "n/a"}`;
            popup.appendChild(isotopesSpan);
            
            document.body.appendChild(popup);
            const rect = contentDiv.getBoundingClientRect();
            popup.style.position = "fixed";
            popup.style.left = `${rect.right + 8}px`;
            popup.style.top = `${rect.top}px`;
            popup.style.zIndex = "1000";
        });

        contentDiv.addEventListener("mouseleave", () => {
            if (popup) {
                popup.remove();
                popup = null;
            }
        });
    }

    // Build table rows
    for (let period = 1; period <= maxPeriod; period++) {
        const row = table.createEl("tr");
        for (let group = 1; group <= maxGroup; group++) {
            const entry = Object.entries(elements).find(
                ([, e]) => e.period === period && e.group === group
            );
            // Add data-group-name attribute for CSS styling
            const groupName = entry ? entry[1].groupName : "";
            const cell = row.createEl("td", { 
                cls: "periodic-table-cell", 
                attr: { "data-group-name": groupName }
            });
            if (entry) {
                const [symbol, el] = entry;
                const content = cell.createEl("div", { cls: "element-content" });
                content.createEl("div", { text: symbol, cls: "element-symbol" });
                content.createEl("div", { text: el.atomicNumber.toString(), cls: "atomic-number" });
                content.createEl("div", { text: el.name, cls: "element-name" });
                createPopup(content, el, symbol);
            }
        }
    }

    // Render lanthanoids
    const lanthanoids = Object.entries(elements)
        .filter(([, e]) => typeof e.group === "string" && e.group.startsWith("La-"))
        .sort(([, a], [, b]) => a.atomicNumber - b.atomicNumber);

    const lanthRow = container.createEl("table", { cls: "periodic-table-lanthanoids" }).createEl("tr");
    lanthanoids.forEach(([symbol, el]) => {
        const cell = lanthRow.createEl("td", { 
            cls: "periodic-table-cell", 
            attr: { "data-group-name": el.groupName }
        });
        const content = cell.createEl("div", { cls: "element-content" });
        content.createEl("div", { text: symbol, cls: "element-symbol" });
        content.createEl("div", { text: el.atomicNumber.toString(), cls: "atomic-number" });
        content.createEl("div", { text: el.name, cls: "element-name" });
        createPopup(content, el, symbol);
    });

    // Render actinoids
    const actinoids = Object.entries(elements)
        .filter(([, e]) => typeof e.group === "string" && e.group.startsWith("Ac-"))
        .sort(([, a], [, b]) => a.atomicNumber - b.atomicNumber);

    const actinRow = container.createEl("table", { cls: "periodic-table-actinoids" }).createEl("tr");
    actinoids.forEach(([symbol, el]) => {
        const cell = actinRow.createEl("td", { 
            cls: "periodic-table-cell", 
            attr: { "data-group-name": el.groupName }
        });
        const content = cell.createEl("div", { cls: "element-content" });
        content.createEl("div", { text: symbol, cls: "element-symbol" });
        content.createEl("div", { text: el.atomicNumber.toString(), cls: "atomic-number" });
        content.createEl("div", { text: el.name, cls: "element-name" });
        createPopup(content, el, symbol);
    });
}