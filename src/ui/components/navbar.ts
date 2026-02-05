import { App, Notice } from "obsidian";
import ElnPlugin from "../../main";
import { NewNote } from "../../core/notes/NewNote";
import { NoteNavbarConfig, NoteCommandConfig } from "../../settings/settings";

export class Navbar {
    private app: App;
    private plugin: ElnPlugin;

    constructor(app: App, plugin: ElnPlugin) {
        this.app = app;
        this.plugin = plugin;
    }

    // Initialize the navbar
    init() {
        console.log("Initializing navbar...");

        // Add navbars to all existing workspace leaves
        this.addNavbarsToAllLeaves();

    }

    // Add navbars to all existing workspace leaves
    private addNavbarsToAllLeaves() {
        const wsContainer = document.querySelector(".workspace-split.mod-vertical.mod-root");
        if (!wsContainer) {
            console.log("Workspace container not found.");
            return;
        }

        const wsLeafs = wsContainer.querySelectorAll(".workspace-leaf");
        wsLeafs.forEach((leaf) => this.addNavbarToLeaf(leaf));
    }

    // Add a navbar to a specific workspace leaf
    private addNavbarToLeaf(leaf: Element) {
        const leafContent = leaf.querySelector(".workspace-leaf-content");
        const thisViewHeader = leaf.querySelector(".view-header");
        const thisViewContent = leaf.querySelector(".view-content");

        if (!leafContent || !thisViewHeader || !thisViewContent) {
            console.log("Leaf content, header, or view content not found for a leaf.");
            return;
        }

        let navbarContainer = leafContent.querySelector(".eln-navbar-container");
        if (navbarContainer) {
            navbarContainer.innerHTML = "";
        } else {
            navbarContainer = document.createElement("div");
            navbarContainer.classList.add("eln-navbar-container");
            thisViewHeader.insertAdjacentElement("afterend", navbarContainer);
        }

        const navbar = document.createElement("div");
        navbar.classList.add("navbar");

        const createDropdown = (title: string, contentHtml: string) => {
            const dropdown = document.createElement("div");
            dropdown.classList.add("navbar-dropdown");

            const button = document.createElement("button");
            button.classList.add("dropbtn");
            button.textContent = title;

            const content = document.createElement("div");
            content.classList.add("dropdown-content");
            content.innerHTML = contentHtml;

            dropdown.addEventListener("mouseenter", () => {
                dropdown.classList.add("open");
                thisViewContent?.classList.add("eln-view-content-blur");
            });

            dropdown.addEventListener("mouseleave", () => {
                dropdown.classList.remove("open");
                thisViewContent?.classList.remove("eln-view-content-blur");
            });

            dropdown.appendChild(button);
            dropdown.appendChild(content);
            return dropdown;
        };

        // Add the Home link with the icon
        const homeLink = document.createElement("div");
        homeLink.classList.add("navbar-home", "navbar-link-internal");
        homeLink.setAttribute("data-link", "Home");
        homeLink.innerHTML = `
            <svg width="20px" height="20px" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 20 20" xmlns:v="https://vecta.io/nano">
                <path d="M12.368 2.382l1.377 1.459c.129.145 1.713 1.764 1.732 2.015.033.426.047 2.475.424 3.273.363.769 2.279 2.985 2.172 3.331-.167.538-1.69 2.381-1.69 2.381-.293-.496-1.853-2.276-2.422-2.595-.957-.537-1.916-.816-2.806-.862-.094.02-.821-2.054-.842-2.829-.031-1.148.131-2.282.563-3.098l1.152-2.06c.263-.559.376-1.01.34-1.015z" fill="#888"/>
                <path d="M11.478 1.381c-.137-.143-.408-.354-.931-.367-.157-.004-.916.272-1.192.508L6.411 3.978c-.259.223-1.001.623-1.164.913-.263.466-.41 2.037-.677 3.31.967.234 2.821 2.283 3.076 3.455 0 0 1.202-.261 2.542-.311 0 0-.45-1.201-.645-2.426-.137-.857-.012-2.153.257-3.067.354-1.205 1.557-2.738 1.645-3.183.183-.937.035-1.288.035-1.288z" fill="#aeaeae"/>
                <path d="M5.9 17.576c.671-1.03 1.528-3.192 1.227-4.847-.245-1.346-1.179-2.883-2.83-3.801-.16.4-1.637 3.109-2.035 3.92-.139.283-.425.689-.352.944.155.545 3.851 3.77 3.991 3.784z" fill="#525252"/>
                <path d="M16.011 15.793s-1.404-2.67-3.417-3.301-4.705-.074-4.705-.074.235 1.446-.107 2.694c-.285 1.038-.786 2.306-1.159 2.796l3.555.359c1.108.162 2.551.565 2.972.692 0 0 .696.205 1.318-.133.602-.327.744-.895.78-1.136.017-.115.125-.668.299-1.123.19-.499.464-.774.464-.774z" fill="#6a6a6a"/>
            </svg>
        `;
        navbar.appendChild(homeLink);

        // Add the "New" menu with dynamic content
        const newMenuContent = this.generateNewMenuContent();
        navbar.appendChild(createDropdown("New", newMenuContent));
        navbar.appendChild(createDropdown("Resources", `
            <div class="navmenu-column">
                <div class="navbar-link-internal" data-link="Instruments">Instruments</div>
                <div class="navbar-link-internal" data-link="Devices">Devices</div>
                <div class="navbar-link-internal" data-link="Chemicals">Chemicals</div>
                <div class="navbar-link-internal" data-link="Electrodes">Electrodes</div>
                <div class="navbar-link-internal" data-link="Cells">Cells</div>
            </div>
        `));
        navbar.appendChild(createDropdown("Help", `
            <div class="navmenu-column">
                <div class="navbar-link-internal" data-link="Obsidian ELN - Getting started">Getting Started Guide</div>
                <div class="navbar-link-internal" data-link="Markdown Formatting Guide">Markdown Formatting Guide</div>
                <div class="navbar-link-internal" data-link="Obsidian Tutorial for Academic Writing">Tutorial for Academic Writing</div>
                <div class="navbar-link-internal" data-link="File Export">File Export</div>
            </div>
        `));

        navbarContainer.appendChild(navbar);

        // Register event listeners for the navbar links
        this.registerNavbarLinkListeners(navbar);
    }

    /**
     * Generate dynamic content for the "New" menu based on settings
     */
    private generateNewMenuContent(): string {
        const { navbar, note } = this.plugin.settings;
        
        // Group note types by their navbar group
        const groupedNoteTypes: Record<string, Array<{noteType: string, navbar: NoteNavbarConfig, commands: NoteCommandConfig}>> = {};
        
        // Initialize groups
        navbar.groups.forEach(group => {
            groupedNoteTypes[group.id] = [];
        });
        
        // Populate groups with enabled note types that should show in navbar
        Object.entries(note).forEach(([noteType, config]) => {
            if (config.commands.enabled && config.navbar.display && groupedNoteTypes[config.navbar.group]) {
                groupedNoteTypes[config.navbar.group].push({ 
                    noteType, 
                    navbar: config.navbar, 
                    commands: config.commands 
                });
            }
        });
        
        // Generate HTML for each group
        const columns = navbar.groups
            .sort((a, b) => a.order - b.order)
            .filter(group => groupedNoteTypes[group.id].length > 0)
            .map(group => {
                const items = groupedNoteTypes[group.id]
                    .map(({noteType, navbar}) => 
                        `<div class="navbar-link-internal" data-action="new_${noteType}">${navbar.name}</div>`
                    )
                    .join('');
                
                return `
                    <div class="navmenu-column">
                        <h3>${group.name}</h3>
                        ${items}
                    </div>
                `;
            })
            .join('');
        
        return columns;
    }

    // Add event listener for all navbar links
    private registerNavbarLinkListeners(navbar: HTMLElement) {
        const navbarLinks = navbar.querySelectorAll(".navbar-link-internal");
        navbarLinks.forEach((link) => {
            // Check if the event listener is already registered
            if (!link.hasAttribute("data-listener-registered")) {
                link.addEventListener("click", async (event) => {
                    const action = (event.currentTarget as HTMLElement).getAttribute("data-action");
                    const linkAttr = (event.currentTarget as HTMLElement).getAttribute("data-link");

                    if (action) {
                        // Handle dynamic note creation actions
                        if (action.startsWith("new_")) {
                            const noteType = action.replace("new_", "");
                            const config = this.plugin.settings.note[noteType as keyof typeof this.plugin.settings.note];
                            
                            if (config && config.commands.enabled) {
                                console.log(`Creating new ${config.navbar.name}...`);
                                new Notice(`Creating new ${config.navbar.name}...`);
                                
                                try {
                                    const newNote = new NewNote(this.plugin);
                                    await newNote.create({
                                        noteType: noteType
                                    });
                                } catch (error) {
                                    console.error(`Error creating ${config.navbar.name}:`, error);
                                    new Notice(`Error creating ${config.navbar.name}: ${error}`);
                                }
                            } else {
                                new Notice(`Unknown note type: ${noteType}`);
                                console.error(`Unknown note type: ${noteType}`);
                            }
                        } else {
                            new Notice(`Unknown action: ${action}`);
                            console.log(`Unknown action: ${action}`);
                        }
                    } else if (linkAttr) {
                        console.log(`Navigating to: ${linkAttr}`);
                        this.app.workspace.openLinkText(linkAttr, '', false);
                    }
                });

                // Mark the link as having a registered listener
                link.setAttribute("data-listener-registered", "true");
            }
        });
    }
}