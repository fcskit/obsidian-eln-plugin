# Modal System

The Modal System provides a comprehensive framework for creating and managing dialog boxes, forms, and overlay interfaces within the Obsidian ELN Plugin.

## 🏗️ Architecture Overview

The Modal System is built on Obsidian's modal infrastructure with enhancements for complex form handling, validation, and lifecycle management.

```typescript
┌─────────────────────────────────────────────────────┐
│                  Modal System                      │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │   Base Modal    │  │      Modal Manager          ││
│  │    Classes      │  │                             ││
│  └─────────────────┘  └─────────────────────────────┘│
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │   Form Modal    │  │    Lifecycle Handler        ││
│  │   Components    │  │                             ││
│  └─────────────────┘  └─────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## 📍 Core Components

### Base Modal Classes

```typescript
import { Modal, App } from 'obsidian';

/**
 * Enhanced base modal with common functionality
 */
export abstract class BaseModal extends Modal {
    protected plugin: Plugin;
    protected isClosing: boolean = false;
    protected onCloseCallbacks: (() => void)[] = [];
    
    constructor(app: App, plugin: Plugin) {
        super(app);
        this.plugin = plugin;
        this.setupBaseStyles();
        this.setupKeyboardHandlers();
    }
    
    /**
     * Template method for modal initialization
     */
    public onOpen(): void {
        this.createContent();
        this.setupEventListeners();
        this.focusInitialElement();
    }
    
    /**
     * Template method for modal cleanup
     */
    public onClose(): void {
        if (this.isClosing) return;
        this.isClosing = true;
        
        this.cleanup();
        this.notifyCloseCallbacks();
        
        // Call parent close
        super.onClose();
    }
    
    // Abstract methods for subclasses
    protected abstract createContent(): void;
    protected abstract setupEventListeners(): void;
    protected abstract cleanup(): void;
    
    // Common functionality
    protected setupBaseStyles(): void {
        this.modalEl.addClass('eln-modal');
    }
    
    protected setupKeyboardHandlers(): void {
        this.scope.register(['Escape'], () => {
            this.close();
        });
        
        this.scope.register(['Ctrl'], 'Enter', () => {
            this.handleSubmit();
        });
    }
    
    protected abstract handleSubmit(): void;
    
    public onCloseCallback(callback: () => void): void {
        this.onCloseCallbacks.push(callback);
    }
}
```

### Form Modal Base Class

```typescript
/**
 * Specialized modal for form-based interactions
 */
export abstract class FormModal extends BaseModal {
    protected inputManager: InputManager;
    protected templateManager: TemplateManager;
    protected universalRenderer: UniversalObjectRenderer;
    protected formContainer: HTMLElement;
    protected submitButton: HTMLButtonElement;
    protected cancelButton: HTMLButtonElement;
    
    constructor(app: App, plugin: Plugin) {
        super(app, plugin);
        this.inputManager = new InputManager();
        this.templateManager = plugin.templateManager;
    }
    
    protected createContent(): void {
        this.contentEl.empty();
        
        // Create modal structure
        this.contentEl.innerHTML = `
            <div class="modal-header">
                <h2 class="modal-title">${this.getModalTitle()}</h2>
                <button class="modal-close-button" aria-label="Close">×</button>
            </div>
            <div class="modal-body">
                <form class="modal-form">
                    <div class="form-container"></div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary submit-button">${this.getSubmitButtonText()}</button>
                <button class="btn btn-secondary cancel-button">Cancel</button>
            </div>
        `;
        
        // Get references
        this.formContainer = this.contentEl.querySelector('.form-container') as HTMLElement;
        this.submitButton = this.contentEl.querySelector('.submit-button') as HTMLButtonElement;
        this.cancelButton = this.contentEl.querySelector('.cancel-button') as HTMLButtonElement;
        
        // Create form content
        this.createFormContent();
    }
    
    protected setupEventListeners(): void {
        // Submit button
        this.submitButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Cancel button
        this.cancelButton.addEventListener('click', () => {
            this.close();
        });
        
        // Close button
        const closeButton = this.contentEl.querySelector('.modal-close-button');
        closeButton?.addEventListener('click', () => {
            this.close();
        });
        
        // Form submission
        const form = this.contentEl.querySelector('.modal-form') as HTMLFormElement;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Real-time validation
        this.inputManager.onFieldChange('*', () => {
            this.updateSubmitButtonState();
        });
    }
    
    protected abstract createFormContent(): void;
    protected abstract getModalTitle(): string;
    protected abstract getSubmitButtonText(): string;
    
    protected updateSubmitButtonState(): void {
        const validation = this.inputManager.validateAll();
        this.submitButton.disabled = !validation.isValid;
        
        if (!validation.isValid) {
            this.submitButton.title = `Fix ${validation.results.length} validation errors`;
        } else {
            this.submitButton.title = '';
        }
    }
    
    protected async handleSubmit(): Promise<void> {
        // Validate form
        const validation = this.inputManager.validateAll();
        if (!validation.isValid) {
            this.showValidationErrors(validation.results);
            return;
        }
        
        // Disable submit button to prevent double submission
        this.submitButton.disabled = true;
        this.submitButton.textContent = 'Processing...';
        
        try {
            await this.processForm();
            this.close();
        } catch (error) {
            this.handleSubmissionError(error);
        } finally {
            this.submitButton.disabled = false;
            this.submitButton.textContent = this.getSubmitButtonText();
        }
    }
    
    protected abstract processForm(): Promise<void>;
    
    protected showValidationErrors(errors: ValidationResult[]): void {
        // Clear previous errors
        this.clearValidationErrors();
        
        // Show new errors
        for (const error of errors) {
            this.showFieldError(error.fieldPath, error.errors[0]);
        }
        
        // Focus first error field
        if (errors.length > 0) {
            this.focusField(errors[0].fieldPath);
        }
    }
    
    protected handleSubmissionError(error: Error): void {
        console.error('Form submission error:', error);
        
        // Show error message to user
        const errorContainer = this.contentEl.querySelector('.error-message');
        if (errorContainer) {
            errorContainer.textContent = `Error: ${error.message}`;
            errorContainer.classList.add('visible');
        }
    }
}
```

## 🎯 Specific Modal Implementations

### New Note Modal

The primary modal for creating new notes:

```typescript
export class NewNoteModal extends FormModal {
    private noteType: string;
    private targetFolder?: string;
    private onNoteCreated?: (file: TFile) => void;
    
    constructor(
        app: App, 
        plugin: Plugin, 
        noteType: string, 
        options: NewNoteModalOptions = {}
    ) {
        super(app, plugin);
        this.noteType = noteType;
        this.targetFolder = options.targetFolder;
        this.onNoteCreated = options.onNoteCreated;
    }
    
    protected getModalTitle(): string {
        const noteTypeLabel = this.noteType.charAt(0).toUpperCase() + this.noteType.slice(1);
        return `Create New ${noteTypeLabel}`;
    }
    
    protected getSubmitButtonText(): string {
        return 'Create Note';
    }
    
    protected createFormContent(): void {
        // Load template for note type
        const template = this.templateManager.processTemplate(this.noteType);
        if (!template) {
            this.showError(`Template not found for note type: ${this.noteType}`);
            return;
        }
        
        // Create universal renderer
        this.universalRenderer = new UniversalObjectRenderer(
            this.formContainer,
            this.inputManager
        );
        
        // Render template
        this.universalRenderer.renderTemplate(template);
        
        // Setup reactive updates
        this.setupReactiveUpdates();
    }
    
    private setupReactiveUpdates(): void {
        this.inputManager.onFieldChange('*', (value, oldValue, fieldPath) => {
            // Update reactive fields
            const updates = this.templateManager.updateReactiveFields(
                this.noteType,
                fieldPath,
                this.inputManager.getAllValues()
            );
            
            // Apply updates to renderer
            this.universalRenderer.updateReactiveFields(updates);
        });
    }
    
    protected async processForm(): Promise<void> {
        const formData = this.inputManager.getAllValues();
        
        // Create note using NoteCreator
        const noteCreator = new NoteCreator(this.app, this.plugin);
        const file = await noteCreator.createNote({
            noteType: this.noteType,
            data: formData,
            targetFolder: this.targetFolder
        });
        
        // Notify callback
        if (this.onNoteCreated) {
            this.onNoteCreated(file);
        }
    }
    
    protected cleanup(): void {
        this.universalRenderer?.destroy();
        this.inputManager?.destroy();
    }
}
```

### Confirmation Modal

Simple modal for confirmation dialogs:

```typescript
export class ConfirmationModal extends BaseModal {
    private message: string;
    private confirmText: string;
    private cancelText: string;
    private onConfirm?: () => void;
    private onCancel?: () => void;
    
    constructor(
        app: App,
        options: ConfirmationModalOptions
    ) {
        super(app, null);
        this.message = options.message;
        this.confirmText = options.confirmText || 'Confirm';
        this.cancelText = options.cancelText || 'Cancel';
        this.onConfirm = options.onConfirm;
        this.onCancel = options.onCancel;
    }
    
    protected createContent(): void {
        this.contentEl.empty();
        
        this.contentEl.innerHTML = `
            <div class="confirmation-modal">
                <div class="modal-header">
                    <h3>Confirmation</h3>
                </div>
                <div class="modal-body">
                    <p class="confirmation-message">${this.message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary confirm-button">${this.confirmText}</button>
                    <button class="btn btn-secondary cancel-button">${this.cancelText}</button>
                </div>
            </div>
        `;
    }
    
    protected setupEventListeners(): void {
        const confirmButton = this.contentEl.querySelector('.confirm-button');
        const cancelButton = this.contentEl.querySelector('.cancel-button');
        
        confirmButton?.addEventListener('click', () => {
            this.onConfirm?.();
            this.close();
        });
        
        cancelButton?.addEventListener('click', () => {
            this.onCancel?.();
            this.close();
        });
    }
    
    protected handleSubmit(): void {
        this.onConfirm?.();
        this.close();
    }
    
    protected cleanup(): void {
        // No special cleanup needed
    }
}
```

### Settings Modal

Modal for plugin settings configuration:

```typescript
export class SettingsModal extends FormModal {
    private settings: PluginSettings;
    private settingsManager: SettingsManager;
    
    constructor(app: App, plugin: Plugin) {
        super(app, plugin);
        this.settings = { ...plugin.settings };
        this.settingsManager = plugin.settingsManager;
    }
    
    protected getModalTitle(): string {
        return 'Plugin Settings';
    }
    
    protected getSubmitButtonText(): string {
        return 'Save Settings';
    }
    
    protected createFormContent(): void {
        // Create settings form structure
        this.formContainer.innerHTML = `
            <div class="settings-sections">
                <div class="settings-section" data-section="general">
                    <h3>General Settings</h3>
                    <div class="general-settings-container"></div>
                </div>
                <div class="settings-section" data-section="templates">
                    <h3>Template Settings</h3>
                    <div class="template-settings-container"></div>
                </div>
                <div class="settings-section" data-section="advanced">
                    <h3>Advanced Settings</h3>
                    <div class="advanced-settings-container"></div>
                </div>
            </div>
        `;
        
        this.createGeneralSettings();
        this.createTemplateSettings();
        this.createAdvancedSettings();
    }
    
    private createGeneralSettings(): void {
        const container = this.formContainer.querySelector('.general-settings-container') as HTMLElement;
        
        // Default folder setting
        new LabeledTextInput({
            container,
            fieldPath: 'defaultFolder',
            label: 'Default Notes Folder',
            placeholder: 'folder/path',
            value: this.settings.defaultFolder,
            inputManager: this.inputManager
        });
        
        // Auto-backup setting
        new LabeledCheckbox({
            container,
            fieldPath: 'enableAutoBackup',
            label: 'Enable Auto Backup',
            value: this.settings.enableAutoBackup,
            inputManager: this.inputManager
        });
    }
    
    private createTemplateSettings(): void {
        const container = this.formContainer.querySelector('.template-settings-container') as HTMLElement;
        
        // Template configuration
        new TemplateConfigurationComponent({
            container,
            fieldPath: 'noteTypes',
            value: this.settings.noteTypes,
            inputManager: this.inputManager
        });
    }
    
    protected async processForm(): Promise<void> {
        const formData = this.inputManager.getAllValues();
        
        // Update settings
        Object.assign(this.settings, formData);
        
        // Save settings
        await this.settingsManager.saveSettings(this.settings);
        
        // Apply settings
        await this.plugin.applySettings(this.settings);
    }
}
```

## 🎛️ Modal Manager

Centralized management of modal instances:

```typescript
export class ModalManager {
    private activeModals: Map<string, BaseModal> = new Map();
    private modalStack: BaseModal[] = [];
    private app: App;
    private plugin: Plugin;
    
    constructor(app: App, plugin: Plugin) {
        this.app = app;
        this.plugin = plugin;
    }
    
    /**
     * Opens a modal and manages its lifecycle
     */
    public openModal<T extends BaseModal>(
        modalClass: new (...args: any[]) => T,
        id: string,
        ...args: any[]
    ): T {
        // Close existing modal with same ID
        this.closeModal(id);
        
        // Create modal instance
        const modal = new modalClass(this.app, this.plugin, ...args);
        
        // Register modal
        this.activeModals.set(id, modal);
        this.modalStack.push(modal);
        
        // Setup close handler
        modal.onCloseCallback(() => {
            this.handleModalClose(id, modal);
        });
        
        // Open modal
        modal.open();
        
        return modal;
    }
    
    /**
     * Closes a specific modal
     */
    public closeModal(id: string): void {
        const modal = this.activeModals.get(id);
        if (modal) {
            modal.close();
        }
    }
    
    /**
     * Closes all open modals
     */
    public closeAllModals(): void {
        for (const modal of this.activeModals.values()) {
            modal.close();
        }
    }
    
    /**
     * Gets the currently active modal
     */
    public getActiveModal(): BaseModal | null {
        return this.modalStack.length > 0 ? this.modalStack[this.modalStack.length - 1] : null;
    }
    
    private handleModalClose(id: string, modal: BaseModal): void {
        // Remove from tracking
        this.activeModals.delete(id);
        
        const stackIndex = this.modalStack.indexOf(modal);
        if (stackIndex !== -1) {
            this.modalStack.splice(stackIndex, 1);
        }
    }
    
    // Convenience methods for common modals
    public openNewNoteModal(noteType: string, options: NewNoteModalOptions = {}): NewNoteModal {
        return this.openModal(NewNoteModal, `new-note-${noteType}`, noteType, options);
    }
    
    public openConfirmationModal(options: ConfirmationModalOptions): ConfirmationModal {
        return this.openModal(ConfirmationModal, 'confirmation', options);
    }
    
    public openSettingsModal(): SettingsModal {
        return this.openModal(SettingsModal, 'settings');
    }
}
```

## 🎨 Modal Styling

### CSS Structure

```css
/* Base modal styles */
.eln-modal {
    --modal-width: 80vw;
    --modal-max-width: 800px;
    --modal-height: auto;
    --modal-max-height: 80vh;
}

.eln-modal .modal {
    width: var(--modal-width);
    max-width: var(--modal-max-width);
    height: var(--modal-height);
    max-height: var(--modal-max-height);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

/* Modal header */
.eln-modal .modal-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
}

.eln-modal .modal-title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
}

.eln-modal .modal-close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-muted);
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Modal body */
.eln-modal .modal-body {
    padding: 1rem;
    overflow-y: auto;
    flex: 1;
}

.eln-modal .modal-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* Modal footer */
.eln-modal .modal-footer {
    padding: 1rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    flex-shrink: 0;
}

/* Button styles */
.eln-modal .btn {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
}

.eln-modal .btn-primary {
    background: var(--accent-color);
    color: var(--text-on-accent);
    border-color: var(--accent-color);
}

.eln-modal .btn-primary:hover {
    background: var(--accent-color-hover);
    border-color: var(--accent-color-hover);
}

.eln-modal .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.eln-modal .btn-secondary {
    background: var(--background-secondary);
    color: var(--text-normal);
}

.eln-modal .btn-secondary:hover {
    background: var(--background-modifier-hover);
}

/* Responsive design */
@media (max-width: 768px) {
    .eln-modal {
        --modal-width: 95vw;
        --modal-max-height: 90vh;
    }
    
    .eln-modal .modal-header,
    .eln-modal .modal-body,
    .eln-modal .modal-footer {
        padding: 0.75rem;
    }
    
    .eln-modal .modal-footer {
        flex-direction: column;
    }
    
    .eln-modal .btn {
        width: 100%;
    }
}
```

### Theme Integration

```css
/* Light theme */
.theme-light .eln-modal {
    --border-color: #e1e4e8;
    --text-muted: #6a737d;
    --accent-color: #0366d6;
    --accent-color-hover: #0256cc;
    --text-on-accent: #ffffff;
    --background-secondary: #f6f8fa;
    --background-modifier-hover: #f1f3f4;
}

/* Dark theme */
.theme-dark .eln-modal {
    --border-color: #30363d;
    --text-muted: #8b949e;
    --accent-color: #238636;
    --accent-color-hover: #2ea043;
    --text-on-accent: #ffffff;
    --background-secondary: #21262d;
    --background-modifier-hover: #30363d;
}
```

## 🧪 Testing Modal Components

### Unit Testing

```typescript
describe('NewNoteModal', () => {
    let modal: NewNoteModal;
    let app: App;
    let plugin: Plugin;
    
    beforeEach(() => {
        app = createMockApp();
        plugin = createMockPlugin();
        modal = new NewNoteModal(app, plugin, 'chemical');
    });
    
    afterEach(() => {
        modal.close();
    });
    
    describe('initialization', () => {
        it('should create modal structure', () => {
            modal.open();
            
            expect(modal.contentEl.querySelector('.modal-header')).toBeTruthy();
            expect(modal.contentEl.querySelector('.modal-body')).toBeTruthy();
            expect(modal.contentEl.querySelector('.modal-footer')).toBeTruthy();
        });
        
        it('should render form for note type', () => {
            modal.open();
            
            const formContainer = modal.contentEl.querySelector('.form-container');
            expect(formContainer.children.length).toBeGreaterThan(0);
        });
    });
    
    describe('form submission', () => {
        it('should validate form before submission', async () => {
            modal.open();
            
            const submitButton = modal.contentEl.querySelector('.submit-button') as HTMLButtonElement;
            submitButton.click();
            
            // Should show validation errors for required fields
            const errorMessages = modal.contentEl.querySelectorAll('.validation-error');
            expect(errorMessages.length).toBeGreaterThan(0);
        });
        
        it('should create note on valid submission', async () => {
            modal.open();
            
            // Fill required fields
            modal.inputManager.setValue('title', 'Test Chemical');
            modal.inputManager.setValue('formula.molecular_formula', 'H2O');
            
            const createNoteSpy = jest.spyOn(NoteCreator.prototype, 'createNote');
            
            const submitButton = modal.contentEl.querySelector('.submit-button') as HTMLButtonElement;
            submitButton.click();
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            expect(createNoteSpy).toHaveBeenCalled();
        });
    });
});
```

### Integration Testing

```typescript
describe('Modal System Integration', () => {
    let modalManager: ModalManager;
    
    beforeEach(() => {
        modalManager = new ModalManager(app, plugin);
    });
    
    it('should manage multiple modals', () => {
        const modal1 = modalManager.openNewNoteModal('chemical');
        const modal2 = modalManager.openConfirmationModal({
            message: 'Test confirmation'
        });
        
        expect(modalManager.getActiveModal()).toBe(modal2);
        
        modalManager.closeModal('confirmation');
        expect(modalManager.getActiveModal()).toBe(modal1);
    });
    
    it('should handle modal stacking', () => {
        modalManager.openNewNoteModal('chemical');
        modalManager.openSettingsModal();
        
        // Settings modal should be on top
        const activeModal = modalManager.getActiveModal();
        expect(activeModal).toBeInstanceOf(SettingsModal);
    });
});
```

## 🔗 Related Documentation

- [Component Architecture](component-architecture.md) - UI component design patterns
- [Universal Object Renderer](universal-renderer.md) - Main form rendering engine
- [Input Manager](input-manager.md) - Form state management
- [CSS Architecture](css-architecture.md) - Modular CSS system

## 📚 Examples

### Custom Modal Implementation

```typescript
// Custom modal for chemical database search
export class ChemicalSearchModal extends FormModal {
    private searchResults: ChemicalCompound[];
    private resultsContainer: HTMLElement;
    private onCompoundSelected?: (compound: ChemicalCompound) => void;
    
    constructor(
        app: App,
        plugin: Plugin,
        onCompoundSelected?: (compound: ChemicalCompound) => void
    ) {
        super(app, plugin);
        this.onCompoundSelected = onCompoundSelected;
        this.searchResults = [];
    }
    
    protected getModalTitle(): string {
        return 'Search Chemical Database';
    }
    
    protected getSubmitButtonText(): string {
        return 'Select Compound';
    }
    
    protected createFormContent(): void {
        this.formContainer.innerHTML = `
            <div class="search-section">
                <div class="search-input-container"></div>
                <div class="search-filters">
                    <div class="formula-filter-container"></div>
                    <div class="mw-range-container"></div>
                </div>
            </div>
            <div class="results-section">
                <div class="results-container"></div>
            </div>
        `;
        
        // Create search inputs
        new LabeledTextInput({
            container: this.formContainer.querySelector('.search-input-container'),
            fieldPath: 'searchTerm',
            label: 'Search Term',
            placeholder: 'Enter compound name, CAS number, or formula',
            inputManager: this.inputManager
        });
        
        new LabeledTextInput({
            container: this.formContainer.querySelector('.formula-filter-container'),
            fieldPath: 'formulaFilter',
            label: 'Molecular Formula',
            placeholder: 'e.g., C6H6',
            inputManager: this.inputManager
        });
        
        // Setup search functionality
        this.setupSearch();
        
        this.resultsContainer = this.formContainer.querySelector('.results-container') as HTMLElement;
    }
    
    private setupSearch(): void {
        let searchTimeout: NodeJS.Timeout;
        
        this.inputManager.onFieldChange('searchTerm', (searchTerm) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(searchTerm);
            }, 300);
        });
    }
    
    private async performSearch(searchTerm: string): Promise<void> {
        if (!searchTerm || searchTerm.length < 2) {
            this.clearResults();
            return;
        }
        
        try {
            this.showSearching();
            const results = await this.plugin.chemicalDatabase.search(searchTerm);
            this.displayResults(results);
        } catch (error) {
            this.showSearchError(error.message);
        }
    }
    
    private displayResults(results: ChemicalCompound[]): void {
        this.searchResults = results;
        this.resultsContainer.empty();
        
        if (results.length === 0) {
            this.resultsContainer.innerHTML = '<p class="no-results">No compounds found</p>';
            return;
        }
        
        const resultsHTML = results.map((compound, index) => `
            <div class="result-item" data-index="${index}">
                <div class="compound-name">${compound.name}</div>
                <div class="compound-formula">${compound.formula}</div>
                <div class="compound-mw">MW: ${compound.molecularWeight}</div>
                <div class="compound-cas">CAS: ${compound.casNumber}</div>
            </div>
        `).join('');
        
        this.resultsContainer.innerHTML = resultsHTML;
        
        // Setup result selection
        this.resultsContainer.querySelectorAll('.result-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectResult(parseInt(item.dataset.index));
            });
        });
    }
    
    private selectResult(index: number): void {
        const compound = this.searchResults[index];
        if (compound && this.onCompoundSelected) {
            this.onCompoundSelected(compound);
            this.close();
        }
    }
    
    protected async processForm(): Promise<void> {
        // Handle form submission if needed
        const selectedIndex = this.getSelectedResultIndex();
        if (selectedIndex !== -1) {
            this.selectResult(selectedIndex);
        }
    }
}
```

This comprehensive modal system provides a robust foundation for creating sophisticated user interfaces within the Obsidian ELN Plugin.
