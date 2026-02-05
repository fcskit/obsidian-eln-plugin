# Additional UI Components

This document covers the specialized UI components that enhance the Obsidian ELN Plugin's functionality: Navbar, Footer, ImageViewer, and PeriodicTableView.

## Navbar Component

The Navbar component provides quick access to note creation and navigation functionality across all workspace leaves.

### Overview

The Navbar creates dropdown menus for:
- **Quick Navigation**: Direct links to important notes (Home, Resources, Help)
- **Dynamic Note Creation**: Context-aware note type creation based on plugin settings
- **Resource Access**: Links to instruments, devices, chemicals, and other lab resources
- **Help System**: Access to documentation and tutorials

### Architecture

```typescript
┌─────────────────────────────────────────────────────┐
│                Navbar Component                     │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │  Navigation     │  │      Dynamic Menus          ││
│  │  • Home Link    │  │      • Setting-driven       ││
│  │  • Icon Display │  │      • Grouped Content      ││
│  │  • Quick Access │  │      • Auto-generated       ││
│  └─────────────────┘  └─────────────────────────────┘│
│                              │                       │
│  ┌─────────────────────────────▼─────────────────────┐│
│  │           Event Handling                          ││
│  │  • Link Navigation      • Note Creation          ││
│  │  • Dropdown Controls    • Settings Integration   ││
│  │  • Dynamic Actions      • Error Handling         ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Implementation

#### Core Class Structure

```typescript
export class Navbar {
    private app: App;
    private plugin: ElnPlugin;

    constructor(app: App, plugin: ElnPlugin) {
        this.app = app;
        this.plugin = plugin;
    }
}
```

#### Initialization and DOM Integration

```typescript
init() {
    // Add navbars to all existing workspace leaves
    this.addNavbarsToAllLeaves();
}

private addNavbarsToAllLeaves() {
    const wsContainer = document.querySelector(".workspace-split.mod-vertical.mod-root");
    const wsLeafs = wsContainer?.querySelectorAll(".workspace-leaf");
    wsLeafs?.forEach((leaf) => this.addNavbarToLeaf(leaf));
}
```

#### Dynamic Content Generation

The navbar content is generated dynamically based on plugin settings:

```typescript
private generateNewMenuContent(): string {
    const { navbar, note } = this.plugin.settings;
    
    // Group note types by their navbar group
    const groupedNoteTypes: Record<string, Array<{...}>> = {};
    
    // Generate HTML for each group
    const columns = navbar.groups
        .sort((a, b) => a.order - b.order)
        .filter(group => groupedNoteTypes[group.id].length > 0)
        .map(group => `
            <div class="navmenu-column">
                <h3>${group.name}</h3>
                ${items}
            </div>
        `);
}
```

### Features

#### 1. Home Navigation
- **Icon-based Home Link**: SVG icon for visual appeal
- **Quick Access**: One-click navigation to vault home
- **Visual Feedback**: Hover effects and styling

#### 2. Dynamic Note Creation
- **Settings Integration**: Menu items generated from plugin configuration
- **Grouped Organization**: Note types organized into logical groups
- **Real-time Updates**: Menu content reflects current settings

#### 3. Resource Management
- **Quick Access Links**: Direct navigation to resource directories
- **Organized Categories**: Instruments, devices, chemicals, etc.
- **Consistent Interface**: Same interaction pattern across all categories

#### 4. Help System
- **Documentation Links**: Direct access to guides and tutorials
- **Getting Started**: Quick onboarding for new users
- **Export Tools**: Access to file export functionality

### Usage Examples

#### Basic Integration

```typescript
// Initialize navbar in plugin main class
export default class ElnPlugin extends Plugin {
    navbar: Navbar;
    
    async onload() {
        this.navbar = new Navbar(this.app, this);
        this.navbar.init();
    }
}
```

#### Custom Note Type Registration

```typescript
// Settings configuration for navbar
const noteSettings = {
    experiment: {
        commands: { enabled: true },
        navbar: { 
            display: true, 
            group: "research", 
            name: "Experiment" 
        }
    }
};
```

### Styling and Customization

#### CSS Classes

```css
/* Main navbar container */
.eln-navbar-container {
    border-bottom: 1px solid var(--background-modifier-border);
    background-color: var(--background-primary);
}

/* Dropdown menus */
.navbar-dropdown {
    position: relative;
    display: inline-block;
}

.navbar-dropdown.open .dropdown-content {
    display: block;
    animation: fadeIn 0.2s ease-in-out;
}

/* Home icon styling */
.navbar-home svg {
    vertical-align: middle;
    opacity: 0.7;
    transition: opacity 0.2s;
}
```

---

## Footer Component

The Footer component displays contextual metadata and version information at the bottom of notes.

### Overview

The Footer provides:
- **File Metadata**: Creation and modification timestamps
- **Author Information**: Note author from frontmatter or settings
- **Version Display**: Plugin version information
- **Smart Visibility**: Conditional display based on settings and frontmatter

### Architecture

```typescript
┌─────────────────────────────────────────────────────┐
│                Footer Component                     │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │  Content        │  │      Display Logic          ││
│  │  • Metadata     │  │      • Mode Detection       ││
│  │  • Timestamps   │  │      • Settings Checks      ││
│  │  • Author Info  │  │      • Frontmatter Override ││
│  │  • Version      │  │      • Container Finding    ││
│  └─────────────────┘  └─────────────────────────────┘│
│                              │                       │
│  ┌─────────────────────────────▼─────────────────────┐│
│  │           Lifecycle Management                    ││
│  │  • View Mode Handling  • Mutation Observation    ││
│  │  • Debounced Updates   • Event Registration      ││
│  │  • Container Cleanup   • Memory Management       ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Implementation

#### Core Class Structure

```typescript
export class Footer {
    private app: App;
    private plugin: ELNPlugin;
    private containerEl: HTMLElement | null = null;
    private mutationObserver: MutationObserver | null = null;
    private debouncedUpdate: () => void;

    constructor(app: App, plugin: ELNPlugin) {
        this.app = app;
        this.plugin = plugin;
        
        // Create debounced update function for editing mode
        this.debouncedUpdate = debounce(() => {
            this.updateFooter();
        }, 500, true);
    }
}
```

#### Smart Display Logic

```typescript
private shouldShowFooter(file: TFile): boolean {
    // Check global footer setting
    if (!this.plugin.settings.footer.enabled) {
        return false;
    }

    // Check frontmatter override
    const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
    if (frontmatter?.footer !== undefined) {
        return frontmatter.footer;
    }

    return true;
}
```

#### Dynamic Container Finding

```typescript
private findContainer(view: MarkdownView): HTMLElement | null {
    const content = view.contentEl;
    const mode = view.getMode();

    if (mode === 'preview') {
        // Reading mode: find the main preview section
        const previewSections = content.querySelectorAll('.markdown-preview-section');
        for (let i = 0; i < previewSections.length; i++) {
            const section = previewSections[i] as HTMLElement;
            if (!section.closest('.internal-embed')) {
                return section;
            }
        }
    } else if (mode === 'source') {
        // Editing mode: use .cm-sizer
        return content.querySelector('.cm-sizer') as HTMLElement;
    }

    return null;
}
```

### Features

#### 1. Contextual Information Display
- **File Timestamps**: Creation and modification dates
- **Author Attribution**: From frontmatter or global settings
- **Version Information**: Current plugin version
- **Formatted Output**: Human-readable date formatting

#### 2. Mode-Aware Rendering
- **Reading Mode**: Attached to preview sections
- **Source Mode**: Integrated with CodeMirror editor
- **Embedded Handling**: Skips embedded note content

#### 3. Performance Optimization
- **Debounced Updates**: Prevents excessive re-rendering in edit mode
- **Mutation Observation**: Automatic footer restoration
- **Memory Management**: Proper cleanup and event removal

#### 4. Configuration Flexibility
- **Global Settings**: Enable/disable footer display
- **Per-Note Override**: Frontmatter-based control
- **Content Selection**: Choose which metadata to display

### Usage Examples

#### Basic Initialization

```typescript
export default class ElnPlugin extends Plugin {
    footer: Footer;
    
    async onload() {
        this.footer = new Footer(this.app, this);
        this.footer.init();
    }
    
    async onunload() {
        this.footer.destroy();
    }
}
```

#### Per-Note Configuration

```yaml
---
title: "My Lab Note"
author: "Dr. Smith"
footer: true  # Override global setting
---
```

#### Settings Configuration

```typescript
interface FooterSettings {
    enabled: boolean;
    includeAuthor: boolean;
    includeCtime: boolean;
    includeMtime: boolean;
    includeVersion: boolean;
}
```

---

## ImageViewer Component

The ImageViewer component provides advanced image viewing capabilities with folder-based navigation and slideshow features.

### Overview

The ImageViewer offers:
- **Folder-Based Display**: Automatically loads images from specified vault folders
- **Slideshow Functionality**: Manual and automatic image cycling
- **Thumbnail Navigation**: Quick image selection with thumbnail strip
- **Customization Options**: Size, background, shuffle options, and visual effects

### Architecture

```typescript
┌─────────────────────────────────────────────────────┐
│               ImageViewer Component                 │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │  Image Loading  │  │      Display Controls       ││
│  │  • Folder Scan  │  │      • Manual Navigation    ││
│  │  • File Filter  │  │      • Auto Slideshow       ││
│  │  • Path Resolve │  │      • Thumbnail Strip      ││
│  │  • Error Handle │  │      • Visual Effects       ││
│  └─────────────────┘  └─────────────────────────────┘│
│                              │                       │
│  ┌─────────────────────────────▼─────────────────────┐│
│  │           Interaction Management                  ││
│  │  • Click Handling       • Keyboard Navigation    ││
│  │  • Timer Management     • Cleanup & Memory       ││
│  │  • State Persistence    • Responsive Layout      ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Implementation

#### Core Interface

```typescript
export interface ImageViewerOptions {
    folder: string;           // Source folder path
    bgColor?: string;         // Background color
    size?: number;            // Image size in pixels
    image?: string;           // Specific image filename
    shuffle?: "auto" | "manual"; // Slideshow mode
    shuffleOrder?: "random" | "alphabetic"; // Order type
    interval?: number;        // Auto-slideshow interval (seconds)
    thumbnails?: boolean;     // Show thumbnail strip
    invertGray?: boolean;     // Apply invert filter
}
```

#### Folder Scanning and Image Loading

```typescript
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
            (f.extension === "jpg" || f.extension === "png" || 
             f.extension === "jpeg" || f.extension === "gif")
    );
}
```

#### Dynamic Image Display

```typescript
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
        }, 700);
    }
};
```

#### Automatic Slideshow

```typescript
if (opts.shuffle === "auto" && opts.interval && images.length > 1) {
    const nextImage = () => {
        if (opts.shuffleOrder === "random") {
            let nextIdx;
            do {
                nextIdx = Math.floor(Math.random() * images.length);
            } while (nextIdx === currentIdx && images.length > 1);
            currentIdx = nextIdx;
        } else {
            currentIdx = (currentIdx + 1) % images.length;
        }
        showImage(currentIdx);
        if (opts.thumbnails) updateThumbnails();
    };

    timer = window.setInterval(nextImage, opts.interval * 1000);
}
```

### Features

#### 1. Flexible Image Sources
- **Folder-Based Loading**: Automatic image discovery from vault folders
- **File Type Support**: JPG, PNG, JPEG, GIF formats
- **Specific Image Selection**: Target specific images by filename
- **Error Handling**: Graceful fallbacks for missing folders/images

#### 2. Navigation Controls
- **Manual Navigation**: Previous/next buttons with visual icons
- **Thumbnail Strip**: Quick access to any image in the collection
- **Keyboard Support**: Arrow key navigation (planned feature)

#### 3. Slideshow Modes
- **Auto Slideshow**: Timed automatic progression
- **Manual Control**: User-controlled navigation
- **Shuffle Options**: Random or alphabetic ordering
- **Configurable Timing**: Custom interval settings

#### 4. Visual Enhancements
- **Size Control**: Custom image dimensions
- **Background Colors**: Customizable container backgrounds
- **Fade Transitions**: Smooth image changes
- **Visual Filters**: Invert/grayscale effects for dark themes

### Usage Examples

#### Basic Code Block Usage

````markdown
```image-viewer
folder: assets/experiments
size: 400
thumbnails: true
```
````

#### Advanced Configuration

````markdown
```image-viewer
folder: lab-photos/setup
bgColor: #f0f0f0
size: 600
shuffle: auto
shuffleOrder: random
interval: 5
thumbnails: true
invertGray: false
```
````

#### Programmatic Usage

```typescript
import { ImageViewer } from './views/ImageViewer';

// Create image viewer component
const imageViewer = new ImageViewer(
    this.app,
    containerEl,
    'folder: assets/images\nsize: 500'
);

await imageViewer.onload();
```

---

## PeriodicTableView Component

The PeriodicTableView component renders an interactive periodic table of elements with detailed element information.

### Overview

The PeriodicTableView provides:
- **Complete Periodic Table**: All elements with proper positioning
- **Interactive Popups**: Detailed element information on hover
- **Visual Grouping**: Color-coded element groups (metals, non-metals, etc.)
- **Responsive Design**: Proper scaling and layout
- **Chemical Data**: Comprehensive element properties

### Architecture

```typescript
┌─────────────────────────────────────────────────────┐
│            PeriodicTableView Component              │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │  Data Model     │  │      Rendering Engine       ││
│  │  • Element Data │  │      • Table Generation     ││
│  │  • Properties   │  │      • Cell Positioning     ││
│  │  • Group Info   │  │      • Layout Management    ││
│  │  • Validation   │  │      • Responsive Design    ││
│  └─────────────────┘  └─────────────────────────────┘│
│                              │                       │
│  ┌─────────────────────────────▼─────────────────────┐│
│  │           Interactive Features                    ││
│  │  • Hover Popups         • Element Selection      ││
│  │  • Property Display     • Visual Feedback        ││
│  │  • Group Highlighting   • Keyboard Navigation    ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Implementation

#### Core Component Structure

```typescript
export class PeriodicTableView extends MarkdownRenderChild {
    private app: App;

    constructor(app: App, containerEl: HTMLElement) {
        super(containerEl);
        this.app = app;
    }

    async onload() {
        renderPeriodicTable(this, this.containerEl);
    }
}
```

#### Table Generation Logic

```typescript
export function renderPeriodicTable(view: PeriodicTableView, container: HTMLElement) {
    container.empty();
    const table = container.createEl("table", { cls: "periodic-table" });

    // Find max period and group
    const maxPeriod = Math.max(...Object.values(elements).map(e => e.period));
    const maxGroup = Math.max(
        ...Object.values(elements)
            .map(e => typeof e.group === "number" ? e.group : -Infinity)
    );

    // Build table rows
    for (let period = 1; period <= maxPeriod; period++) {
        const row = table.createEl("tr");
        for (let group = 1; group <= maxGroup; group++) {
            const entry = Object.entries(elements).find(
                ([, e]) => e.period === period && e.group === group
            );
            
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
}
```

#### Interactive Popup System

```typescript
function createPopup(contentDiv: HTMLElement, el: Element, symbol: string) {
    let popup: HTMLDivElement | null = null;

    view.registerDomEvent(contentDiv, "mouseenter", (e) => {
        popup = document.createElement("div");
        popup.className = "element-popup";
        popup.innerHTML = `
            <strong>${el.name} (${el.atomicNumber})</strong><br>
            Symbol: ${symbol}<br>
            Group: ${el.groupName}<br>
            Period: ${el.period}<br>
            Atomic Mass: ${el.atomicMass}<br>
            Electronegativity: ${el.electronegativity ?? "n/a"}<br>
            Stability: ${el.stability}<br>
            Isotopes: ${el.isotopes?.join(", ") ?? "n/a"}
        `;
        
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
```

#### Special Series Handling

```typescript
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
```

### Features

#### 1. Complete Element Data
- **Comprehensive Properties**: Atomic number, mass, electronegativity, stability
- **Isotope Information**: Available isotopes for each element
- **Group Classifications**: Proper chemical group assignments
- **Validated Data**: Accurate scientific information

#### 2. Interactive Experience
- **Hover Popups**: Detailed information on mouse hover
- **Visual Feedback**: Element highlighting and transitions
- **Responsive Popups**: Smart positioning to avoid screen edges
- **Memory Management**: Proper popup cleanup and event handling

#### 3. Visual Organization
- **Standard Layout**: Traditional periodic table arrangement
- **Separate Series**: Lanthanoids and actinoids displayed separately
- **Group Coloring**: CSS-based visual grouping by element type
- **Responsive Design**: Scales appropriately for different screen sizes

#### 4. Chemical Accuracy
- **Standard Notation**: Proper chemical symbols and conventions
- **Current Data**: Up-to-date element properties
- **Scientific Precision**: Accurate atomic masses and properties

### Usage Examples

#### Basic Code Block Usage

````markdown
```periodic-table
```
````

#### Programmatic Integration

```typescript
import { PeriodicTableView } from './views/PeriodicTableView';

// Create periodic table component
const periodicTable = new PeriodicTableView(this.app, containerEl);
await periodicTable.onload();
```

#### Custom Styling

```css
/* Element group coloring */
.periodic-table-cell[data-group-name="Alkali metals"] {
    background-color: #ff6b6b;
}

.periodic-table-cell[data-group-name="Halogens"] {
    background-color: #4ecdc4;
}

.periodic-table-cell[data-group-name="Noble gases"] {
    background-color: #45b7d1;
}

/* Popup styling */
.element-popup {
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: var(--radius-s);
    padding: 8px 12px;
    font-size: 0.9em;
    box-shadow: var(--shadow-s);
    z-index: 1000;
}
```

## Integration and Testing

### Code Block Processors

All components integrate with Obsidian's markdown processing system:

```typescript
// Register processors in main plugin
this.registerMarkdownCodeBlockProcessor("image-viewer", (source, el, ctx) => {
    const viewer = new ImageViewer(this.app, el, source);
    ctx.addChild(viewer);
});

this.registerMarkdownCodeBlockProcessor("periodic-table", (source, el, ctx) => {
    const table = new PeriodicTableView(this.app, el);
    ctx.addChild(table);
});
```

### Memory Management

All components implement proper cleanup:

```typescript
// Component lifecycle management
onunload() {
    // Clear timers
    if (this.timer) {
        clearInterval(this.timer);
    }
    
    // Remove event listeners
    this.cleanupEventListeners();
    
    // Clear DOM references
    this.containerEl = null;
}
```

### Testing Strategies

#### Unit Testing

```typescript
describe('ImageViewer', () => {
    it('should load images from specified folder', async () => {
        const mockApp = createMockApp();
        const container = document.createElement('div');
        const options = { folder: 'test-images' };
        
        await renderImageViewer(mockApp, container, options);
        
        expect(container.querySelector('.image-viewer')).toBeTruthy();
    });
});
```

#### Integration Testing

```typescript
describe('Navbar Integration', () => {
    it('should create note when navbar link clicked', async () => {
        const navbar = new Navbar(mockApp, mockPlugin);
        navbar.init();
        
        const link = document.querySelector('[data-action="new_experiment"]');
        link?.click();
        
        expect(mockPlugin.createNote).toHaveBeenCalledWith({
            noteType: 'experiment'
        });
    });
});
```

These UI components work together to provide a comprehensive, interactive experience within the Obsidian ELN Plugin, each serving specific user needs while maintaining consistent design patterns and performance characteristics.
