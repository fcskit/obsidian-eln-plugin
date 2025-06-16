import { App, Notice } from "obsidian";
import ElnPlugin from "../main";
import { ChemicalNoteModal } from "../modals/notes/ChemicalNoteModal";
import { ContactNoteModal } from "../modals/notes/ContactNoteModal";
import { DailyNoteModal } from "../modals/notes/DailyNoteModal";
import { DeviceNoteModal } from "../modals/notes/DeviceNoteModal";
import { InstrumentNoteModal } from "../modals/notes/InstrumentNoteModal";
import { MeetingNoteModal } from "../modals/notes/MeetingNoteModal";
import { ProjectNoteModal } from "../modals/notes/ProjectNoteModal";

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

        // Add the "New" menu
        navbar.appendChild(createDropdown("New", `
            <div class="navmenu-column">
                <h3>Resources</h3>
                <div class="navbar-link-internal" data-action="new_chemical">Chemical</div>
                <div class="navbar-link-internal" data-action="new_device">Device</div>
                <div class="navbar-link-internal" data-action="new_instrument">Instrument</div>
                <div class="navbar-link-internal" data-action="new_lab">Lab</div>
            </div>
            <div class="navmenu-column">
                <h3>Experiments</h3>
                <div class="navbar-link-internal" data-action="new_process">Process</div>
                <div class="navbar-link-internal" data-action="new_sample">Sample</div>
                <div class="navbar-link-internal" data-action="new_analysis">Analysis</div>
            </div>
            <div class="navmenu-column">
                <h3>Other</h3>
                <div class="navbar-link-internal" data-action="new_daily_note">Daily Note</div>
                <div class="navbar-link-internal" data-action="new_project">Project</div>
                <div class="navbar-link-internal" data-action="new_contact">Contact</div>
                <div class="navbar-link-internal" data-action="new_meeting">Meeting</div>
            </div>
        `));
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

    // Add event listener for all navbar links
    private registerNavbarLinkListeners(navbar: HTMLElement) {
        const navbarLinks = navbar.querySelectorAll(".navbar-link-internal");
        navbarLinks.forEach((link) => {
            // Check if the event listener is already registered
            if (!link.hasAttribute("data-listener-registered")) {
                link.addEventListener("click", (event) => {
                    const action = (event.currentTarget as HTMLElement).getAttribute("data-action");
                    const link = (event.currentTarget as HTMLElement).getAttribute("data-link");

                    if (action) {
                        console.log(`Action triggered: ${action}`);
                        // Handle the action here
                        switch (action) {
                            case "new_chemical":
                                new Notice("Opening new chemical modal...");
                                console.log("Opening new chemical modal...");
                                new ChemicalNoteModal(this.plugin).open();
                                break;
                            case "new_device":
                                new Notice("Opening new device modal...");
                                console.log("Opening new device modal...");
                                new DeviceNoteModal(this.plugin).open();
                                break;
                            case "new_instrument":
                                new Notice("Opening new instrument modal...");
                                console.log("Opening new instrument modal...");
                                new InstrumentNoteModal(this.plugin).open();
                                break;
                            case "new_lab":
                                new Notice("Opening new lab modal...");
                                console.log("Opening new lab modal...");
                                break;
                            case "new_process":
                                new Notice("Opening new process modal...");
                                console.log("Opening new process modal...");
                                break;
                            case "new_sample":
                                new Notice("Opening new sample modal...");
                                console.log("Opening new sample modal...");
                                break;
                            case "new_analysis":
                                new Notice("Opening new analysis modal...");
                                console.log("Opening new analysis modal...");
                                break;
                            case "new_daily_note":
                                new Notice("Opening new daily note modal...");
                                console.log("Opening new daily note modal...");
                                new DailyNoteModal(this.plugin).open();
                                break;
                            case "new_project":
                                new Notice("Opening new project modal...");
                                console.log("Opening new project modal...");
                                new ProjectNoteModal(this.plugin).open();
                                break;
                            case "new_contact":
                                new Notice("Opening new contact modal...");
                                console.log("Opening new contact modal...");
                                new ContactNoteModal(this.plugin).open();
                                break;
                            case "new_meeting":
                                new Notice("Opening new meeting modal...");
                                console.log("Opening new meeting modal...");
                                new MeetingNoteModal(this.plugin).open();
                                break;
                            default:
                                new Notice(`Unknown action: ${action}`);
                                console.log(`Unknown action: ${action}`);
                                break;
                        }
                    } else if (link) {
                        console.log(`Navigating to: ${link}`);
                        this.app.workspace.openLinkText(link, '', false);
                    }
                });

                // Mark the link as having a registered listener
                link.setAttribute("data-listener-registered", "true");
            }
        });
    }
}