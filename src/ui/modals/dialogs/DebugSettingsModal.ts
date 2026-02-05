import { App, Modal, Setting, Notice } from 'obsidian';
import { logger, LoggerConfig, ComponentName } from '../../../utils/Logger';
import type ElnPlugin from '../../../main';

/**
 * Modal for configuring debug logging settings
 * Provides checkboxes for each component and file logging toggle
 */
export class DebugSettingsModal extends Modal {
    private currentConfig: LoggerConfig;
    private fileLoggingEnabled: boolean;
    private plugin: ElnPlugin;

    constructor(app: App, plugin: ElnPlugin) {
        super(app);
        this.plugin = plugin;
        this.currentConfig = logger.getConfig();
        this.fileLoggingEnabled = logger.isFileLoggingActive();
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h2', { text: 'ELN Debug Settings' });

        // Add description
        contentEl.createEl('p', { 
            text: 'Enable debug logging for specific components. Warnings and errors are always shown.',
            cls: 'setting-item-description'
        });

        // File logging section
        new Setting(contentEl)
            .setName('File logging')
            .setDesc('Write debug logs to debug-log.txt in vault root')
            .addToggle(toggle => toggle
                .setValue(this.fileLoggingEnabled)
                .onChange(async (value) => {
                    this.fileLoggingEnabled = value;
                    if (value) {
                        logger.initFileLogging(this.app, 'debug-log.txt');
                        this.plugin.showFileLoggingStatusBar();
                    } else {
                        logger.disableFileLogging();
                        this.plugin.hideFileLoggingStatusBar();
                    }
                })
            );

        // Separator
        contentEl.createEl('h3', { text: 'Component Logging' });

        // Component toggles
        const components: Array<{ name: ComponentName; label: string; desc: string }> = [
            { name: 'main', label: 'Main Plugin', desc: 'Core plugin initialization and lifecycle' },
            { name: 'template', label: 'Templates', desc: 'Template processing and merging' },
            { name: 'modal', label: 'Modals', desc: 'Note creation and edit modals' },
            { name: 'npe', label: 'NPE Editor', desc: 'Nested Properties Editor' },
            { name: 'ui', label: 'UI Components', desc: 'General user interface components' },
            { name: 'inputManager', label: 'Input Manager', desc: 'Form data management' },
            { name: 'note', label: 'Note Creation', desc: 'Note file creation and processing' },
            { name: 'metadata', label: 'Metadata', desc: 'YAML frontmatter processing' },
            { name: 'api', label: 'API Calls', desc: 'External API requests (ChemicalLookup, etc.)' },
            { name: 'events', label: 'Events', desc: 'Event handling and listeners' },
            { name: 'navbar', label: 'Navigation', desc: 'Navigation bar and menus' },
            { name: 'view', label: 'Views', desc: 'Custom views and rendering' },
            { name: 'path', label: 'Path Templates', desc: 'Path template parsing' },
            { name: 'settings', label: 'Settings', desc: 'Plugin settings management' },
            { name: 'general', label: 'General', desc: 'Uncategorized logging' }
        ];

        components.forEach(component => {
            new Setting(contentEl)
                .setName(component.label)
                .setDesc(component.desc)
                .addToggle(toggle => toggle
                    .setValue(this.currentConfig[component.name] === 'debug')
                    .onChange(async (value) => {
                        if (value) {
                            logger.enableDebugFor(component.name);
                        } else {
                            logger.quietComponent(component.name);
                        }
                        this.currentConfig = logger.getConfig();
                    })
                );
        });

        // Action buttons
        const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.marginTop = '20px';
        buttonContainer.style.gap = '10px';

        // Enable all button
        const enableAllBtn = buttonContainer.createEl('button', { text: 'Enable All' });
        enableAllBtn.addEventListener('click', () => {
            components.forEach(comp => {
                logger.enableDebugFor(comp.name);
            });
            this.currentConfig = logger.getConfig();
            this.close();
            this.open(); // Reopen to refresh toggles
        });

        // Disable all button
        const disableAllBtn = buttonContainer.createEl('button', { text: 'Disable All' });
        disableAllBtn.addEventListener('click', () => {
            components.forEach(comp => {
                logger.quietComponent(comp.name);
            });
            this.currentConfig = logger.getConfig();
            this.close();
            this.open(); // Reopen to refresh toggles
        });

        // Flush logs button (if file logging active)
        if (this.fileLoggingEnabled) {
            const flushBtn = buttonContainer.createEl('button', { text: 'Flush Logs to File' });
            flushBtn.style.marginLeft = 'auto';
            flushBtn.addEventListener('click', () => {
                logger.flush();
                new Notice('Debug logs flushed to debug-log.txt');
            });

            // Clear log file button
            const clearBtn = buttonContainer.createEl('button', { text: 'Clear Log File' });
            clearBtn.addEventListener('click', () => {
                // Show confirmation
                const confirmed = confirm('Clear all contents from debug-log.txt? This cannot be undone.');
                if (confirmed) {
                    logger.clearAndFlush();
                    new Notice('Debug log file cleared');
                }
            });
        }

        // Close button
        const closeBtn = buttonContainer.createEl('button', { text: 'Close', cls: 'mod-cta' });
        closeBtn.addEventListener('click', () => {
            this.close();
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
