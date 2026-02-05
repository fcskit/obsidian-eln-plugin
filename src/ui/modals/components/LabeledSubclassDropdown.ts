import { LabeledDropdown, LabeledDropdownOptions } from "./LabeledDropdown";
import { TemplateManager } from "../../../core/templates/TemplateManager";
import { createLogger } from "../../../utils/Logger";

export interface LabeledSubclassDropdownOptions extends Omit<LabeledDropdownOptions, 'onValueChange'> {
    templateManager?: TemplateManager;
    onValueChange?: (value: string) => void;
    onTemplateUpdate?: () => void; // Callback to trigger modal refresh
}

/**
 * Specialized dropdown for subclass selection that applies subclass templates
 * when the value changes. Uses elegant approach: updates template default and triggers modal refresh.
 */
export class LabeledSubclassDropdown extends LabeledDropdown {
    private templateManager?: TemplateManager;
    private userOnValueChange?: (value: string) => void;
    private onTemplateUpdate?: () => void;
    private subclassLogger = createLogger('ui');

    constructor(options: LabeledSubclassDropdownOptions) {
        // Store the user's onValueChange callback before calling super
        const userOnValueChange = options.onValueChange;
        const templateManager = options.templateManager;
        const onTemplateUpdate = options.onTemplateUpdate;
        const subclassLogger = createLogger('ui');
        
        subclassLogger.debug('LabeledSubclassDropdown constructor starting:', {
            label: options.label,
            optionsCount: options.options?.length || 0,
            hasTemplateManager: !!templateManager,
            hasTemplateUpdateCallback: !!onTemplateUpdate
        });
        
        // We need to store a reference to track user interaction that doesn't depend on 'this'
        const isUserInteractionRef = { value: false };
        
        // Create a custom onValueChange that handles template application
        const enhancedOptions: LabeledDropdownOptions = {
            ...options,
            onValueChange: (value: string | string[]) => {
                // For subclass, we expect single values only
                const stringValue = Array.isArray(value) ? value[0] || '' : value;
                
                subclassLogger.debug('Subclass dropdown value changed:', {
                    newValue: stringValue,
                    hasTemplateManager: !!templateManager,
                    hasTemplateUpdateCallback: !!onTemplateUpdate,
                    isUserInteraction: isUserInteractionRef.value
                });
                
                // Apply subclass template only if this is a user interaction
                if (templateManager && stringValue && isUserInteractionRef.value) {
                    subclassLogger.debug('Applying subclass template:', stringValue);
                    try {
                        // Apply the template (this updates the default value and template structure)
                        templateManager.applySubclassTemplateByName(stringValue);
                        subclassLogger.debug('Subclass template applied successfully:', stringValue);
                        
                        // Trigger modal refresh to show new template structure
                        if (onTemplateUpdate) {
                            subclassLogger.debug('Triggering modal refresh');
                            onTemplateUpdate();
                        }
                    } catch (error) {
                        subclassLogger.error('Failed to apply subclass template:', {
                            subclassName: stringValue,
                            error: error instanceof Error ? error.message : String(error)
                        });
                    }
                } else if (!templateManager) {
                    subclassLogger.warn('No template manager available for subclass dropdown');
                } else if (!stringValue) {
                    subclassLogger.debug('Empty subclass value, skipping template application');
                } else if (!isUserInteractionRef.value) {
                    subclassLogger.debug('Programmatic value change, skipping template application');
                }

                // Call user's onValueChange callback
                if (userOnValueChange) {
                    subclassLogger.debug('Calling user onValueChange callback');
                    userOnValueChange(stringValue);
                }
            }
        };

        super(enhancedOptions);
        
        this.templateManager = templateManager;
        this.userOnValueChange = userOnValueChange;
        this.onTemplateUpdate = onTemplateUpdate;
        
        // Store reference to the interaction flag for setValue override
        (this as unknown as { isUserInteractionRef: { value: boolean } }).isUserInteractionRef = isUserInteractionRef;

        this.subclassLogger.debug('LabeledSubclassDropdown created successfully:', {
            label: options.label,
            optionsCount: options.options?.length || 0,
            hasTemplateManager: !!this.templateManager,
            hasTemplateUpdateCallback: !!this.onTemplateUpdate
        });
    }

    /**
     * Set the template manager (useful if not available during construction)
     */
    setTemplateManager(templateManager: TemplateManager): void {
        this.templateManager = templateManager;
        this.subclassLogger.debug('Template manager set on subclass dropdown');
    }

    /**
     * Override setValue to mark as programmatic change
     */
    setValue(value: string | string[]): void {
        this.subclassLogger.debug('Setting value programmatically:', value);
        const ref = (this as unknown as { isUserInteractionRef: { value: boolean } }).isUserInteractionRef;
        ref.value = false;
        super.setValue(value);
        // Reset flag after a brief delay to allow for the onValueChange to complete
        setTimeout(() => {
            ref.value = true;
            this.subclassLogger.debug('Re-enabled user interaction detection');
        }, 10);
    }

    /**
     * Enable user interaction detection after initialization
     */
    enableUserInteractionDetection(): void {
        const ref = (this as unknown as { isUserInteractionRef: { value: boolean } }).isUserInteractionRef;
        ref.value = true;
        this.subclassLogger.debug('User interaction detection enabled');
    }
}
