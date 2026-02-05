import { Modal, ButtonComponent } from "obsidian";
import ElnPlugin from "../../../main";
import { TemplateManager } from "../../../core/templates/TemplateManager";
import { InputManager } from "../../modals/utils/InputManager";
import { UniversalObjectRenderer } from "../components/UniversalObjectRenderer";
import type { 
    MetaDataTemplateProcessed, 
    FormData,
    FunctionDescriptor
} from "../../../types";
import { createLogger } from "../../../utils/Logger";

export interface NewNoteModalOptions {
    modalTitle?: string;
    noteType: string;
    templateManager?: TemplateManager; // Accept an existing TemplateManager instance
    metadataTemplate?: MetaDataTemplateProcessed;
    initialData?: FormData;
    onSubmit: (result: { formData: FormData; template: MetaDataTemplateProcessed } | null) => void;
}

/**
 * Refactored version of NewNoteModal using the new architecture:
 * - TemplateManager for template handling
 * - InputManager for centralized state management  
 * - UniversalObjectRenderer for recursive object rendering
 * - Clean separation of concerns
 */
export class NewNoteModal extends Modal {
    private plugin: ElnPlugin;
    private modalTitle: string;
    private noteType: string;
    private onSubmit: (result: { formData: FormData; template: MetaDataTemplateProcessed } | null) => void;
    private submitted: boolean = false;
    
    // Flag to prevent recursive updates during initialization
    private isInitializing: boolean = false;
    
    // Flag to prevent callbacks during UI rendering
    private isRenderingUI: boolean = false;
    
    // Reactive dependency mapping: field path -> array of fields it depends on
    private reactiveDependencyMap: Map<string, string[]> = new Map();
    
    // Reverse dependency mapping: field path -> array of fields that depend on it
    private reverseDependencyMap: Map<string, string[]> = new Map();
    
    // New architecture components
    private templateManager: TemplateManager;
    private inputManager: InputManager;
    private objectRenderer!: UniversalObjectRenderer;
    
    // UI elements
    private inputContainer!: HTMLElement;
    private submitButton!: ButtonComponent;
    private cancelButton!: ButtonComponent;
    
    private logger = createLogger('modal');

    constructor(plugin: ElnPlugin, options: NewNoteModalOptions) {
        super(plugin.app);
        
        this.plugin = plugin;
        this.modalTitle = options.modalTitle || `Create New ${options.noteType}`;
        this.noteType = options.noteType;
        this.onSubmit = options.onSubmit;
        
        // Use provided TemplateManager instance or create a new one
        if (options.templateManager) {
            this.logger.debug('📋 Using provided TemplateManager instance');
            this.templateManager = options.templateManager;
        } else {
            this.logger.debug('📋 Creating new TemplateManager instance');
            // Initialize new architecture components
            this.templateManager = new TemplateManager({
                plugin: this.plugin,
                noteType: this.noteType,
                baseTemplate: options.metadataTemplate, // Can be undefined, TemplateManager will load from settings
                initialData: options.initialData || {}
            });
        }
        
        // Initialize InputManager temporarily with basic data
        // Will be updated with proper defaults in onOpen
        this.inputManager = new InputManager(options.initialData || {}, (data) => {
            // Prevent recursive updates during initialization
            if (this.isInitializing) {
                this.logger.debug('⚠️ InputManager change callback blocked during initialization');
                return;
            }
            
            // Prevent callbacks during UI rendering
            if (this.isRenderingUI) {
                this.logger.debug('⚠️ InputManager change callback blocked during UI rendering');
                return;
            }
            
            this.logger.debug('InputManager change callback triggered');
            this.debugFlatFields('InputManager change callback', data);
            
            // Update template manager with current data context
            this.templateManager.updateDataContext(data);
        }, this.plugin); // Pass plugin reference for reactive function evaluation
        
        this.logger.debug('NewNoteModal initialized', {
            noteType: this.noteType,
            template: options.metadataTemplate
        });
    }

    /**
     * Initialize InputManager with properly defaulted form data
     */
    private async initializeInputManagerWithDefaults(): Promise<void> {
        try {
            // Set flag to prevent recursive callbacks during initialization
            this.isInitializing = true;
            this.inputManager.setInitializing(true);
            
            // Get form data with defaults populated from the metadata template
            const formDataWithDefaults = await this.templateManager.getFormDataWithDefaults();
            
            // Debug: Check if defaults already contain flat fields
            this.debugFlatFields('After getFormDataWithDefaults()', formDataWithDefaults);
            
            // Register reactive fields before updating data
            this.registerReactiveFields();
            
            // Update the InputManager data with the processed defaults
            this.inputManager.updateData(formDataWithDefaults);
            
            // Debug: Check InputManager state after update
            const inputManagerData = this.inputManager.getData();
            this.debugFlatFields('After InputManager.updateData()', inputManagerData);
            
        } catch (error) {
            console.error('Error initializing InputManager with defaults:', error);
            // InputManager will continue to work with its existing data
        } finally {
            // Re-enable callbacks after initialization is complete
            this.isInitializing = false;
            this.inputManager.setInitializing(false);
            
            // Build reactive dependency maps after initialization (legacy compatibility)
            this.buildReactiveDependencyMaps();
            
            // Evaluate all reactive fields now that initialization is complete
            this.inputManager.evaluateAllReactiveFields();
        }
    }

    /**
     * Register reactive fields with the InputManager
     */
    private registerReactiveFields(): void {
        this.logger.debug('🔗 Registering reactive fields with InputManager');
        
        // Clear any existing reactive field registrations
        this.inputManager.clearReactiveFields();
        
        // Get all reactive fields from TemplateManager (both default and QueryDropdown types)
        const reactiveFields = this.templateManager.getReactiveFieldsForRegistration();
        
        for (const reactiveField of reactiveFields) {
            const { fieldPath, dependencies, type, field } = reactiveField;
            
            this.logger.debug(`📋 Found reactive field: "${fieldPath}" (${type}) depends on:`, dependencies);
            
            if (type === 'default') {
                // Handle reactive default values
                const evaluateFunction = (userInputs: Record<string, unknown>) => {
                    try {
                        const evaluator = this.templateManager.getEvaluator();
                        if (typeof field.default === 'object' && field.default !== null && 'type' in field.default) {
                            // Use evaluateUserInputFunction which handles all function descriptor formats
                            return evaluator.evaluateUserInputFunction(field.default, userInputs as FormData);
                        } else {
                            // Fall back to regular field default evaluation
                            return evaluator.evaluateFieldDefault(field, userInputs as FormData);
                        }
                    } catch (error) {
                        this.logger.error(`Error evaluating reactive field "${fieldPath}":`, error);
                        return undefined;
                    }
                };
                
                this.inputManager.registerReactiveField(fieldPath, dependencies, evaluateFunction);
                
            } else if (type === 'queryDropdown') {
                // QueryDropdown reactive updates are handled directly by calling component's updateQuery() method
                this.logger.debug(`� QueryDropdown reactive field "${fieldPath}" will be updated via component method`);
            }
        }
        
        this.logger.debug('✅ Enhanced reactive fields registered');
    }

    /**
     * Build dependency maps using InputManager's reactive field registrations
     */
    private buildReactiveDependencyMaps(): void {
        this.logger.debug('� Building reactive dependency maps');
        
        // Clear existing maps
        this.reactiveDependencyMap.clear();
        this.reverseDependencyMap.clear();
        
        // Get reactive fields to build dependency maps
        const reactiveFields = this.templateManager.getReactiveFieldsForRegistration();
        
        for (const { fieldPath, dependencies } of reactiveFields) {
            // Build forward mapping (field -> dependencies)
            this.reactiveDependencyMap.set(fieldPath, dependencies);
            
            // Build reverse mapping (dependency -> dependents)
            for (const dependency of dependencies) {
                if (!this.reverseDependencyMap.has(dependency)) {
                    this.reverseDependencyMap.set(dependency, []);
                }
                this.reverseDependencyMap.get(dependency)!.push(fieldPath);
            }
        }
        
        this.logger.debug('📊 Dependency maps built:', {
            reactiveDependencyMap: Object.fromEntries(this.reactiveDependencyMap),
            reverseDependencyMap: Object.fromEntries(this.reverseDependencyMap)
        });
    }

    async onOpen() {
        this.logger.debug('Modal opening');
        
        // Set modal title
        this.titleEl.setText(this.modalTitle);
        
        // Create main UI
        this.createMainUI();
        
        // Initialize InputManager with proper default values from the template FIRST
        await this.initializeInputManagerWithDefaults();
        
        // THEN initialize object renderer with the populated data
        this.initializeObjectRenderer();
        
        this.logger.debug('Modal opened successfully');
    }

    onClose() {
        this.logger.debug('Modal closing', { submitted: this.submitted });
        
        // Clean up components
        this.objectRenderer?.unload();
        
        // Submit null if modal was closed without submission
        if (!this.submitted) {
            this.onSubmit(null);
        }
    }

    private createMainUI(): void {
        this.modalEl.addClass('eln-new-note-modal');
        const content = this.contentEl;
        content.empty();
        
        // Main input container
        this.inputContainer = content.createDiv({ cls: 'eln-modal-inputs' });
        
        // Footer with buttons
        const footer = content.createDiv({ cls: 'eln-modal-footer' });
        this.createFooterButtons(footer);
    }

    private createFooterButtons(footer: HTMLElement): void {
        const buttonContainer = footer.createDiv({ cls: 'eln-modal-buttons' });
        
        // Cancel button
        this.cancelButton = new ButtonComponent(buttonContainer);
        this.cancelButton.setButtonText('Cancel');
        this.cancelButton.setCta();
        this.cancelButton.onClick(() => {
            this.logger.debug('Cancel button clicked');
            this.close();
        });
        
        // Submit button  
        this.submitButton = new ButtonComponent(buttonContainer);
        this.submitButton.setButtonText('Create Note');
        this.submitButton.setCta();
        this.submitButton.onClick(() => {
            this.logger.debug('Submit button clicked');
            this.handleSubmit();
        });
    }

    private initializeObjectRenderer(): void {
        this.logger.debug('Initializing object renderer');
        
        // Set flag to prevent callbacks during UI rendering
        this.isRenderingUI = true;
        
        try {
            // Create the universal object renderer for the entire form
            this.objectRenderer = new UniversalObjectRenderer({
                container: this.inputContainer,
                label: 'Note Metadata',
                templateManager: this.templateManager,
                inputManager: this.inputManager,
                renderingMode: 'editable',
                allowNewFields: true,
                onChangeCallback: (data) => {
                    // Only process callbacks after rendering is complete
                    if (this.isRenderingUI) {
                        this.logger.debug('⚠️ UniversalObjectRenderer change callback blocked during UI rendering');
                        return;
                    }
                    
                    this.logger.debug('UniversalObjectRenderer change callback triggered');
                    this.debugFlatFields('UniversalObjectRenderer change callback', data);
                    
                    this.handleDataChange(data);
                    this.validateForm();
                },
                app: this.app
            });
            
            this.logger.debug('Object renderer initialized');
        } finally {
            // Re-enable callbacks after UI rendering is complete
            this.isRenderingUI = false;
        }
    }

    /**
     * Handle data changes and trigger reactive field updates
     */
    private handleDataChange(data: FormData): void {
        this.logger.debug('🔄 Handling reactive data changes for:', Object.keys(data));
        
        // Debug: Check state before reactive updates
        this.debugFlatFields('Before reactive updates', data);
        
        // Use optimized dependency-based reactive updates
        this.updateReactiveFieldsOptimized(data);
        
        // Debug: Check state after reactive updates
        const finalData = this.inputManager.getData();
        this.debugFlatFields('After reactive updates', finalData);
    }
    
    /**
     * Optimized reactive field updates using pre-built dependency maps
     */
    private updateReactiveFieldsOptimized(userData: FormData): void {
        // Update the template manager's data context first
        this.templateManager.updateDataContext(userData);
        
        // Get only actual field paths from the form data (exclude container objects)
        const actualFieldPaths = this.getActualFieldPaths(userData);
        
        this.logger.debug('🔍 Checking reactive updates for actual fields:', actualFieldPaths);
        
        // For each actual field, check if any other fields depend on it or its nested properties
        for (const changedField of actualFieldPaths) {
            // Check for direct dependencies
            const directDependentFields = this.reverseDependencyMap.get(changedField);
            
            if (directDependentFields && directDependentFields.length > 0) {
                this.logger.debug(`🎯 Field "${changedField}" changed, updating dependent fields:`, directDependentFields);
                
                for (const dependentField of directDependentFields) {
                    this.updateReactiveField(dependentField, userData);
                }
            }
            
            // Check for nested property dependencies (e.g., when "project" changes, trigger "project.name" dependencies)
            for (const [dependencyPath, dependentFields] of this.reverseDependencyMap.entries()) {
                if (dependencyPath.startsWith(changedField + '.')) {
                    this.logger.debug(`🎯 Field "${changedField}" changed, triggering nested dependency "${dependencyPath}" for fields:`, dependentFields);
                    
                    for (const dependentField of dependentFields) {
                        this.updateReactiveField(dependentField, userData);
                    }
                }
            }
        }
    }
    
    /**
     * Get actual field paths from form data, recursively extracting nested field paths
     */
    private getActualFieldPaths(userData: FormData): string[] {
        const actualFields: string[] = [];
        
        // Recursively extract all field paths that correspond to input fields
        this.extractFieldPaths(userData, '', actualFields);
        
        return actualFields;
    }
    
    /**
     * Recursively extract field paths from nested objects
     */
    private extractFieldPaths(data: unknown, currentPath: string, result: string[]): void {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            return;
        }
        
        const dataObj = data as Record<string, unknown>;
        
        for (const [key, value] of Object.entries(dataObj)) {
            const fieldPath = currentPath ? `${currentPath}.${key}` : key;
            
            // Check if this path corresponds to an actual input field in the template
            if (this.isActualField(fieldPath, value)) {
                result.push(fieldPath);
            }
            
            // If it's a nested object, recurse into it
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                this.extractFieldPaths(value, fieldPath, result);
            }
        }
    }
    
    /**
     * Determine if a field is an actual input field vs a container object
     */
    private isActualField(fieldPath: string, value: unknown): boolean {
        // Check if the field exists in the template as an input field
        const template = this.templateManager.getCurrentTemplate();
        const field = this.getFieldFromTemplate(template, fieldPath);
        
        // If it has an inputType, it's an actual field
        if (field && typeof field === 'object' && 'inputType' in field) {
            return true;
        }
        
        // If it's a primitive value and not a nested object, treat it as a field
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            return true;
        }
        
        // Otherwise, it's likely a container object
        return false;
    }
    
    /**
     * Get a field from template using dot notation path
     */
    private getFieldFromTemplate(template: MetaDataTemplateProcessed, fieldPath: string): unknown {
        const pathParts = fieldPath.split('.');
        let current: unknown = template;
        
        for (const part of pathParts) {
            if (current && typeof current === 'object' && part in current) {
                current = (current as Record<string, unknown>)[part];
            } else {
                return undefined;
            }
        }
        
        return current;
    }
    
    /**
     * Update a specific reactive field (only handles QueryDropdown components)
     * Regular reactive fields are handled by InputManager's built-in reactive system
     */
    private updateReactiveField(fieldPath: string, userData: FormData): void {
        const dependencies = this.reactiveDependencyMap.get(fieldPath);
        
        if (!dependencies) {
            this.logger.debug(`Field "${fieldPath}" has no reactive dependencies`);
            return;
        }
        
        // Check if all dependencies are satisfied
        const allDependenciesSatisfied = dependencies.every(dep => {
            const depValue = this.getNestedValue(userData, dep);
            return depValue !== undefined && depValue !== null && depValue !== '';
        });
        
        if (!allDependenciesSatisfied) {
            this.logger.debug(`Not all dependencies satisfied for "${fieldPath}":`, {
                dependencies,
                values: dependencies.map(dep => ({ [dep]: this.getNestedValue(userData, dep) }))
            });
            return;
        }
        
        this.logger.debug(`🎯 Updating reactive field "${fieldPath}" with satisfied dependencies:`, dependencies);
        
        try {
            // Get the component instance from InputManager (now properly registered by UniversalObjectRenderer)
            const component = this.inputManager.getInput(fieldPath);
            
            if (!component) {
                // This is expected for regular reactive fields handled by InputManager
                this.logger.debug(`No UI component for reactive field "${fieldPath}" - handled by InputManager's reactive system`);
                return;
            }
            
            this.logger.debug(`🔧 Found component for ${fieldPath}:`, {
                componentType: component.constructor.name,
                hasUpdateQuery: typeof component.updateQuery === 'function'
            });
            
            // Only handle QueryDropdown components with updateQuery method
            // Regular reactive fields (like 'tags') are handled by InputManager's reactive system
            if (typeof component.updateQuery === 'function') {
                this.logger.debug(`📡 Calling updateQuery() on QueryDropdown component for ${fieldPath}`);
                component.updateQuery();
                this.logger.debug(`✅ QueryDropdown ${fieldPath} update completed`);
            } else {
                this.logger.debug(`Component for ${fieldPath} is not a QueryDropdown - skipping (handled by InputManager)`, {
                    componentType: component.constructor.name
                });
            }
        } catch (error) {
            this.logger.error(`Error updating reactive field "${fieldPath}":`, error);
        }
    }
    
    /**
     * Type guard to check if a value is a function descriptor
     */
    private isFunctionDescriptor(value: unknown): value is FunctionDescriptor {
        return (
            typeof value === 'object' &&
            value !== null &&
            'type' in value &&
            'value' in value &&
            (value as FunctionDescriptor).type === 'function' &&
            typeof (value as FunctionDescriptor).value === 'string'
        );
    }
    
    /**
     * Helper to get nested values from userData using dot notation
     */
    private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
        return path.split('.').reduce((current: unknown, key: string) => {
            return (current && typeof current === 'object' && key in current) 
                ? (current as Record<string, unknown>)[key] 
                : undefined;
        }, obj);
    }
    
    /**
     * Debug helper to detect and log flat fields with dots
     */
    private debugFlatFields(context: string, data: FormData): void {
        const flatFields = Object.keys(data).filter(key => key.includes('.'));
        if (flatFields.length > 0) {
            this.logger.error(`🚨 FLAT FIELDS DETECTED [${context}]:`, flatFields);
            this.logger.error(`🔍 Full data [${context}]:`, data);
            
            // Log stack trace to see where this was called from
            this.logger.error(`📍 Stack trace [${context}]:`, new Error().stack);
        } else {
            this.logger.debug(`✅ No flat fields found [${context}]`);
        }
    }

    private validateForm(): boolean {
        // Basic validation - can be extended
        const data = this.inputManager.getData();
        const hasRequiredFields = Object.keys(data).length > 0;
        
        // Update submit button state
        this.submitButton.setDisabled(!hasRequiredFields);
        
        return hasRequiredFields;
    }

    private handleSubmit(): void {
        this.logger.debug('Handling form submission');
        
        if (!this.validateForm()) {
            this.logger.warn('Form validation failed');
            return;
        }
        
        const rawFormData = this.inputManager.getData();
        
        // 🔍 DEBUG: Log the raw form data structure
        this.logger.debug('🔍 [SUBMIT] Raw form data from InputManager:', {
            keys: Object.keys(rawFormData),
            fullData: rawFormData
        });
        
        // Filter out any flat fields that contain dots (which shouldn't exist)
        const formData = this.sanitizeFormDataForSubmission(rawFormData);
        
        const currentTemplate = this.templateManager.getCurrentTemplate();
        
        this.logger.debug('Submitting form data:', { formData, template: currentTemplate });
        
        this.submitted = true;
        this.onSubmit({
            formData,
            template: currentTemplate
        });
        
        this.close();
    }
    
    /**
     * Remove any flat fields with dots from form data before submission
     */
    private sanitizeFormDataForSubmission(rawData: FormData): FormData {
        const sanitized: FormData = {};
        const filteredFields: string[] = [];
        
        for (const [key, value] of Object.entries(rawData)) {
            // Skip fields that contain dots (these are flat field artifacts)
            if (key.includes('.')) {
                this.logger.warn(`🧹 Filtering out flat field "${key}" with value:`, value);
                filteredFields.push(key);
                continue;
            }
            
            sanitized[key] = value;
        }
        
        if (filteredFields.length > 0) {
            this.logger.error(`🚨 CLEANED UP ${filteredFields.length} flat fields during submission:`, filteredFields);
            this.logger.error(`📊 Original data keys:`, Object.keys(rawData));
            this.logger.error(`📊 Sanitized data keys:`, Object.keys(sanitized));
        } else {
            this.logger.debug(`✅ No flat fields to clean up during submission`);
        }
        
        return sanitized;
    }

    /**
     * Public API for testing and integration
     */
    

    
    /**
     * Apply a subclass template by name (uses plugin settings)
     */
    applySubclassTemplateByName(subclassName: string): void {
        this.logger.debug('🔧 Applying subclass template by name:', subclassName);
        
        // Debug: Check state before subclass template by name
        const beforeSubclass = this.inputManager.getData();
        this.debugFlatFields('Before applySubclassTemplateByName', beforeSubclass);
        
        this.templateManager.applySubclassTemplateByName(subclassName);
        this.objectRenderer.updateTemplate(this.templateManager);
        
        // Rebuild dependency maps after template change
        this.buildReactiveDependencyMaps();
        
        // Debug: Check state after subclass template by name
        const afterSubclass = this.inputManager.getData();
        this.debugFlatFields('After applySubclassTemplateByName', afterSubclass);
        
        this.logger.debug('✅ Subclass template applied successfully');
    }
    
    /**
     * Get current form data (for testing)
     */
    getCurrentData(): FormData {
        return this.inputManager.getData();
    }
    
    /**
     * Set form data programmatically (for testing)
     */
    setFormData(data: FormData): void {
        this.logger.debug('📝 Setting form data programmatically');
        
        // Debug: Check input data for flat fields
        this.debugFlatFields('setFormData input', data);
        
        this.inputManager.updateData(data);
        
        // Debug: Check InputManager state after updateData
        const afterUpdateData = this.inputManager.getData();
        this.debugFlatFields('After InputManager.updateData in setFormData', afterUpdateData);
        
        this.objectRenderer.setValue(data);
        
        // Debug: Check final state after objectRenderer.setValue
        const afterSetValue = this.inputManager.getData();
        this.debugFlatFields('After objectRenderer.setValue in setFormData', afterSetValue);
    }
    
    /**
     * Get current template state (for testing)
     */
    getCurrentTemplate(): MetaDataTemplateProcessed {
        return this.templateManager.getCurrentTemplate();
    }
    
    /**
     * Reset to base template (for testing)
     */
    resetTemplate(): void {
        this.templateManager.resetToBase();
        this.objectRenderer.updateTemplate(this.templateManager);
        
        // Rebuild dependency maps after template reset
        this.buildReactiveDependencyMaps();
        
        this.logger.debug('Template reset to base');
    }
    
    /**
     * Undo last template change
     */
    undoLastTemplateChange(): boolean {
        const success = this.templateManager.undoLastChange();
        if (success) {
            this.objectRenderer.updateTemplate(this.templateManager);
            
            // Rebuild dependency maps after template change
            this.buildReactiveDependencyMaps();
            
            this.logger.debug('Template change undone');
        }
        return success;
    }
    
    /**
     * Check if a field is editable
     */
    isFieldEditable(fieldPath: string): boolean {
        return this.templateManager.isFieldEditable(fieldPath);
    }
    
    /**
     * Get the default subclass name for the current note type
     */
    getDefaultSubclassName(): string | null {
        return this.templateManager.getDefaultSubclassName();
    }
}
