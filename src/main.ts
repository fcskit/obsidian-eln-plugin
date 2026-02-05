import { App, Plugin, TFile, WorkspaceLeaf } from 'obsidian';
import { ELNApi } from "./core/api/ELNApi";
import { ELNSettings, DEFAULT_SETTINGS } from "./settings/settings";
import { ELNSettingTab } from "./settings/ENLSettingTab";
import { NestedPropertiesEditorView } from './ui/views/NestedPropertiesEditor';
import { NestedPropertiesEditorCodeBlockView } from './ui/views/NestedPropertiesEditor';
import { CircularProgress } from './ui/views/CircularProgress';
import { ImageViewer } from './ui/views/ImageViewer';
import { handleActiveLeafChange } from "./events/activeLeafChange";
import { parseNpeCodeBlockParams } from './ui/renderer/npe/utils/parseNpeCodeBlockParams';
import { DailyNoteNav } from "./ui/views/DailyNoteNav";
import { ChemLinks } from "./ui/views/ChemLinks";
import { PeriodicTableView } from "./ui/views/PeriodicTableView";
import { ChemicalLookup } from "./core/api/ChemicalLookup";
import { createLogger, logger } from "./utils/Logger";
import { Footer } from "./ui/components/footer";
import { addNewNoteCommands } from "./commands/newNoteCommands";
import { addDebugCommands } from "./commands/debugCommands";
import { addTestCommands } from "./commands/testCommands";
import { DebugSettingsModal } from "./ui/modals/dialogs/DebugSettingsModal";
// Import new template system for testing
import { PathEvaluator } from "./core/templates/PathEvaluator";
import { FunctionEvaluator } from "./core/templates/FunctionEvaluator";


export default class ElnPlugin extends Plugin {
	public app!: App;
	public settings!: ELNSettings;
	public lastActiveFile: TFile | null = null;

	// Export template evaluators for manual testing
	public PathEvaluator = PathEvaluator;
	public FunctionEvaluator = FunctionEvaluator;

	public api!: ELNApi;
	public chemicalLookup!: ChemicalLookup;
	public footer!: Footer;
	private logger = createLogger('main');
	private fileLoggingStatusBar: HTMLElement | null = null;


	async onload() {
		// Load plugin settings
		await this.loadSettings();

		// File logging is disabled by default
		// Users can enable it via Debug Settings modal if needed
		// logger.initFileLogging(this.app, 'debug-log.txt');
		
		// Configure focused logging for subclass rendering debugging
		// Use 'warn' for targeted markers (🔍), 'warn' for components to reduce noise
		logger.setConfig({
			main: 'warn',
			npe: 'warn',
			modal: 'warn',  // Reduced to warn - targeted markers use warn level
			api: 'warn',
			template: 'warn',
			note: 'warn',
			path: 'warn',
			metadata: 'warn',
			settings: 'warn',
			ui: 'warn',  // Reduced to warn - only our 🔍 markers will show
			inputManager: 'warn',  // Reduced to warn
			events: 'warn',
			navbar: 'warn',
			view: 'warn',
			general: 'warn'
		});
		
		this.logger.info('ELN Plugin loaded - focused logging enabled for subclass rendering debugging');
		this.logger.info('Debug logs will be written to debug-log.txt in vault root');
		this.logger.info('Only 🔍 [RENDER], 🔍 [CONFIG] markers will appear (warn level)');

		// Add dynamic note creation commands
		addNewNoteCommands(this);

		// Add debug and logging commands
		addDebugCommands(this);

		// Add test commands for refactored architecture
		addTestCommands(this);

		this.app.workspace.onLayoutReady(() => {
			// Add Navbar and Footer to the new active leaf
			handleActiveLeafChange(this.app, this);
			
			// Initialize global Footer handler
			this.footer = new Footer(this.app, this);
			this.footer.init();
		})

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ELNSettingTab(this.app, this));

		// Initialize the ChemicalLookup service
		this.chemicalLookup = new ChemicalLookup(this);

		// Initialize the ELN API
		this.api = new ELNApi();

		// Register API to global window object.
		(window as Window & { elnAPI?: unknown })["elnAPI"] = this.api && this.register(() => delete (window as Window & { elnAPI?: unknown })["elnAPI"]);
		
		// Register NPE view 
		this.registerView(
			NestedPropertiesEditorView.viewType,
			(leaf: WorkspaceLeaf) => new NestedPropertiesEditorView(leaf, this)
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
		
		// Check for unsupported parameters
		if (params.unsupportedParams && params.unsupportedParams.length > 0) {
			el.addClasses(['eln-npe-error-container']);
			
			el.createDiv({
				cls: 'eln-npe-error',
				text: `⚠️ Unsupported parameter(s): ${params.unsupportedParams.join(', ')}`
			});
			
			el.createDiv({
				cls: 'eln-npe-error-detail',
				text: `Supported parameters: key, excludeKeys, actionButtons, cssclasses`
			});
			
			return; // Don't render NPE if there are unsupported params
		}			new NestedPropertiesEditorCodeBlockView(
				this.app,
				this,
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
				this.logger.debug("Active leaf changed event fired!");
				handleActiveLeafChange(this.app, this);
			})
		);

		// Note: Dropdown resizing is now handled automatically by individual components
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
		this.logger.info("ELN Plugin Unloaded");
		
		// Clean up file logging and status bar
		this.hideFileLoggingStatusBar();
		logger.flush(); // Ensure all logs are written
		logger.disableFileLogging();
		
		// Clean up Footer
		if (this.footer) {
			this.footer.destroy();
		}
		
		// Detach the NPE view
		this.app.workspace.detachLeavesOfType(NestedPropertiesEditorView.viewType);
		// Remove the active-leaf-change event listener
		this.app.workspace.off("active-leaf-change", () => handleActiveLeafChange(this.app, this));
		this.app.workspace.off("layout-ready", () => handleActiveLeafChange(this.app, this));
	}

	/**
	 * Show the file logging status bar indicator
	 */
	showFileLoggingStatusBar() {
		if (!this.fileLoggingStatusBar) {
			this.fileLoggingStatusBar = this.addStatusBarItem();
			this.fileLoggingStatusBar.setText('📝 Debug Logging');
			this.fileLoggingStatusBar.addClass('mod-clickable');
			this.fileLoggingStatusBar.setAttribute('aria-label', 'File logging active. Click to open Debug Settings.');
			this.fileLoggingStatusBar.addEventListener('click', () => {
				new DebugSettingsModal(this.app, this).open();
			});
		}
	}

	/**
	 * Hide the file logging status bar indicator
	 */
	hideFileLoggingStatusBar() {
		if (this.fileLoggingStatusBar) {
			this.fileLoggingStatusBar.remove();
			this.fileLoggingStatusBar = null;
		}
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
