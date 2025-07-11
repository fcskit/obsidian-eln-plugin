import { App, Plugin, TFile, WorkspaceLeaf } from 'obsidian';
import { ELNApi } from "./api/ELNApi";
import { ELNSettings, DEFAULT_SETTINGS } from "./settings/settings";
import { ELNSettingTab } from "./settings/ENLSettingTab";
import { NestedPropertiesEditorView } from './views/NestedPropertiesEditor';
import { NestedPropertiesEditorCodeBlockView } from './views/NestedPropertiesEditor';
import { CircularProgress } from './views/CircularProgress';
import { ImageViewer } from './views/ImageViewer';
import { handleActiveLeafChange } from "./events/activeLeafChange";
import { parseNpeCodeBlockParams } from './utils/parseNpeCodeBlockParams';
import { DailyNoteNav } from "./views/DailyNoteNav";
import { ChemLinks } from "./views/ChemLinks";
import { PeriodicTableView } from "./views/PeriodicTableView";


export default class ElnPlugin extends Plugin {
	public app!: App;
	public settings!: ELNSettings;
	public lastActiveFile: TFile | null = null;

	public api!: ELNApi;


	async onload() {
		// Load plugin settings
		await this.loadSettings();

		this.app.workspace.onLayoutReady(() => {
			// Add Navbar and Footer to the new active leaf
			handleActiveLeafChange(this.app, this);
		})

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ELNSettingTab(this.app, this));

		// Initialize the ELN API
		this.api = new ELNApi();

		// Register API to global window object.
		(window["elnAPI"] as any) = this.api && this.register(() => delete window["elnAPI"]);
		
		// Register NPE view 
		this.registerView(
			NestedPropertiesEditorView.viewType,
			(leaf: WorkspaceLeaf) => new NestedPropertiesEditorView(leaf)
		);
		// Initialize the NPE view in the right sidebar
		if (this.app.workspace.layoutReady) {
			this.initNpeLeaf();
			this.lastActiveFile = this.app.workspace.getActiveFile();
		} else {
			this.app.workspace.onLayoutReady(() => {
				this.initNpeLeaf.bind(this);
				this.lastActiveFile = this.app.workspace.getActiveFile();
			});
		}

		this.registerMarkdownCodeBlockProcessor("eln-properties", async (source, el, ctx) => {
			const file = ctx.sourcePath
				? this.app.vault.getAbstractFileByPath(ctx.sourcePath)
				: null;
		
			const params = parseNpeCodeBlockParams(source);
		
			new NestedPropertiesEditorCodeBlockView(
				this.app,
				el,
				ctx,
				file instanceof TFile ? file : null,
				params.key,
				params.excludeKeys,
				params.actionButtons,
				params.cssclasses
			);
		});
		// Register CircularProgress Markdown Code Block
		this.registerMarkdownCodeBlockProcessor("circular-progress", (source, el, ctx) => {
			ctx.addChild(new CircularProgress(this.app, el, source));
		});
		// Register Image Viewer Markdown Code Block
		this.registerMarkdownCodeBlockProcessor("image-viewer", (source, el, ctx) => {
			ctx.addChild(new ImageViewer(this.app, el, source));
		});
		// Register DailyNoteNav Markdown Code Block
		this.registerMarkdownCodeBlockProcessor("daily-note-nav", (source, el, ctx) => {
			// Import directly since the file is bundled
			ctx.addChild(new DailyNoteNav(this.app, el, source));
		});
		// Register ChemLinks Markdown Code Block
		this.registerMarkdownCodeBlockProcessor("chem-links", (source, el, ctx) => {
			ctx.addChild(new ChemLinks(this.app, el, ctx.sourcePath));
		});
		// Register PeriodicTable Markdown Code Block
		this.registerMarkdownCodeBlockProcessor("periodic-table", (source, el, ctx) => {
			ctx.addChild(new PeriodicTableView(this.app, el));
		});

		// Register active-leaf-change event
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				console.log("Active leaf changed event fired!");
				handleActiveLeafChange(this.app, this);
			})
		);		
	}

	async initNpeLeaf() {
		this.app.workspace.detachLeavesOfType(NestedPropertiesEditorView.viewType);

		const rightLeaf = this.app.workspace.getRightLeaf(false);
		if (rightLeaf) {
			await rightLeaf.setViewState({
				type: NestedPropertiesEditorView.viewType,
				active: true,
			});
		}

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(NestedPropertiesEditorView.viewType)[0]
		);
	}

	onunload() {
		// Called when the plugin is unloaded
		// You can use this to clean up any resources or event listeners
		console.log("ELN Plugin Unloaded");
		// Detach the NPE view
		this.app.workspace.detachLeavesOfType(NestedPropertiesEditorView.viewType);
		// Remove the active-leaf-change event listener
		this.app.workspace.off("active-leaf-change", () => handleActiveLeafChange(this.app, this));
		this.app.workspace.off("layout-ready", () => handleActiveLeafChange(this.app, this));
	}

	async loadSettings() {
		// Load settings from storage or use default settings
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		// Save settings to storage
		await this.saveData(this.settings);
	}


}
