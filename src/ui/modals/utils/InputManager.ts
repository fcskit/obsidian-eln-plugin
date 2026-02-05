import type { FormData, FormFieldValue, InputComponents } from "../../../types";
import { createLogger } from "../../../utils/Logger";

/**
 * Interface for reactive field dependencies
 */
interface ReactiveField {
    fieldPath: string;
    dependencies: string[];
    evaluateFunction: (userInputs: Record<string, any>, plugin: any) => any;
}

/**
 * InputManager handles the state and operations for input components and form data.
 * Enhanced to support reactive field updates based on dependencies.
 */
export class InputManager {
    private data: FormData;
    private inputs: InputComponents;
    private changeCallback?: (data: FormData) => void;
    private reactiveFields: Map<string, ReactiveField> = new Map();
    private dependencyMap: Map<string, string[]> = new Map(); // Maps dependency -> list of reactive fields
    private isInitializing: boolean = false;
    private plugin: any; // Reference to the plugin for function evaluation
    private logger = createLogger('inputManager'); // Dedicated InputManager logger

    constructor(initialData: FormData = {}, changeCallback?: (data: FormData) => void, plugin?: any) {
        this.data = { ...initialData };
        this.inputs = {};
        this.changeCallback = changeCallback;
        this.plugin = plugin;
        
        this.logger.debug('Constructor - Initial data:', {
            dataKeys: Object.keys(this.data),
            dataStructure: this.data
        });
    }

    /**
     * Get the current form data
     */
    getData(): FormData {
        // Filter out internal reactive trigger fields
        const filteredData: FormData = {};
        for (const [key, value] of Object.entries(this.data)) {
            if (!key.startsWith('__reactive_trigger__')) {
                filteredData[key] = value;
            }
        }
        
        this.logger.debug('getData() called - returning:', {
            dataKeys: Object.keys(filteredData),
            dataStructure: filteredData,
            fullStructure: JSON.stringify(filteredData, null, 2)
        });
        return filteredData;
    }

    /**
     * Set the initialization flag to prevent reactive updates during modal setup
     */
    setInitializing(isInitializing: boolean): void {
        this.isInitializing = isInitializing;
    }

    /**
     * Register a reactive field that depends on other inputs
     */
    registerReactiveField(fieldPath: string, dependencies: string[], evaluateFunction: (userInputs: Record<string, unknown>, plugin: unknown) => unknown): void {
        const reactiveField: ReactiveField = {
            fieldPath,
            dependencies,
            evaluateFunction
        };
        
        this.reactiveFields.set(fieldPath, reactiveField);
        
        // Build reverse dependency map for efficient lookup
        for (const dep of dependencies) {
            if (!this.dependencyMap.has(dep)) {
                this.dependencyMap.set(dep, []);
            }
            this.dependencyMap.get(dep)!.push(fieldPath);
        }
    }

    /**
     * Clear all reactive field registrations
     */
    clearReactiveFields(): void {
        this.reactiveFields.clear();
        this.dependencyMap.clear();
    }

    /**
     * Update reactive fields that depend on the changed field
     */
    private updateReactiveFields(changedFieldPath: string): void {
        // Skip reactive updates during initialization
        if (this.isInitializing) {
            return;
        }

        const dependentFields = this.dependencyMap.get(changedFieldPath);
        if (!dependentFields || dependentFields.length === 0) {
            return;
        }

        for (const fieldPath of dependentFields) {
            this.evaluateReactiveField(fieldPath);
        }
    }

    /**
     * Evaluate a specific reactive field
     */
    private evaluateReactiveField(fieldPath: string): void {
        this.logger.debug(`🔧 [InputManager] evaluateReactiveField called for: ${fieldPath}`);
        
        const reactiveField = this.reactiveFields.get(fieldPath);
        if (!reactiveField) {
            this.logger.debug(`❌ [InputManager] No reactive field found for: ${fieldPath}`);
            return;
        }

        this.logger.debug(`🔧 [InputManager] Found reactive field:`, {
            fieldPath: reactiveField.fieldPath,
            dependencies: reactiveField.dependencies
        });

        try {
            // Check if all dependencies are satisfied
            const userInputs: Record<string, unknown> = {};
            let allDependenciesSatisfied = true;

            for (const dep of reactiveField.dependencies) {
                const value = this.getNestedValue(dep);
                this.logger.debug(`🔍 [InputManager] Dependency ${dep} = ${JSON.stringify(value)}`);
                
                if (value === undefined || value === null || value === '') {
                    allDependenciesSatisfied = false;
                    break;
                }
                userInputs[dep] = value;
            }

            if (!allDependenciesSatisfied) {
                this.logger.debug(`⚠️ [InputManager] Not all dependencies satisfied for ${fieldPath}`);
                return; // Skip evaluation if dependencies aren't ready
            }

            this.logger.debug(`🚀 [InputManager] Calling evaluateFunction for ${fieldPath} with userInputs:`, userInputs);

            // Convert flat userInputs to nested structure for template evaluation
            const nestedUserInputs = this.convertFlatToNested(userInputs);
            this.logger.debug(`🔄 [InputManager] Converted to nested structure:`, nestedUserInputs);

            // Evaluate the reactive function
            const result = reactiveField.evaluateFunction(nestedUserInputs, this.plugin);
            
            this.logger.debug(`📊 [InputManager] Evaluation result for ${fieldPath}:`, {
                result,
                isPromise: result instanceof Promise,
                resultType: typeof result
            });
            
            // Handle Promise results
            if (result instanceof Promise) {
                this.logger.debug(`⏳ [InputManager] Handling Promise result for ${fieldPath}`);
                result.then((resolvedValue) => {
                    this.logger.debug(`✅ [InputManager] Promise resolved for ${fieldPath}:`, resolvedValue);
                    this.handleReactiveResult(fieldPath, resolvedValue);
                }).catch((error) => {
                    console.error(`❌ [InputManager] Promise rejected for ${fieldPath}:`, error);
                });
            } else {
                this.handleReactiveResult(fieldPath, result);
            }
        } catch (error) {
            console.error(`❌ [InputManager] Error evaluating reactive field "${fieldPath}":`, error);
        }
    }

    /**
     * Handle the result of a reactive field evaluation
     */
    private handleReactiveResult(fieldPath: string, newValue: unknown): void {
        this.logger.debug(`🎯 [InputManager] handleReactiveResult for ${fieldPath}:`, newValue);
        
        // Get current value to avoid unnecessary updates
        const currentValue = this.getNestedValue(fieldPath);
        
        this.logger.debug(`🔍 [InputManager] Comparing values for ${fieldPath}:`, {
            currentValue,
            newValue,
            areEqual: JSON.stringify(newValue) === JSON.stringify(currentValue)
        });
        
        // Only update if the value actually changed
        if (JSON.stringify(newValue) !== JSON.stringify(currentValue)) {
            this.logger.debug(`📝 [InputManager] Updating value for ${fieldPath} from ${JSON.stringify(currentValue)} to ${JSON.stringify(newValue)}`);
            this.setNestedValue(fieldPath, newValue);
            // Note: Don't trigger change callback here to avoid infinite loops
            // The change callback will be triggered by the original setValue call
        } else {
            this.logger.debug(`✅ [InputManager] No update needed for ${fieldPath} (value unchanged)`);
        }
    }

    /**
     * Get a nested value from the data object
     */
    private getNestedValue(keyPath: string): unknown {
        const keys = keyPath.split('.');
        let current: unknown = this.data;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
                current = (current as Record<string, unknown>)[key];
            } else {
                return undefined;
            }
        }
        
        return current;
    }

    /**
     * Set a nested value in the data object without triggering reactive updates
     */
    private setNestedValue(keyPath: string, value: unknown): void {
        const keys = keyPath.split('.');
        let current = this.data as Record<string, unknown>;
        
        // Navigate to the parent object
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key] as Record<string, unknown>;
        }
        
        // Set the final value
        const finalKey = keys[keys.length - 1];
        current[finalKey] = value;
    }

    /**
     * Evaluate all reactive fields (used during initialization after all data is set)
     */
    evaluateAllReactiveFields(): void {
        for (const fieldPath of this.reactiveFields.keys()) {
            this.evaluateReactiveField(fieldPath);
        }
    }

    /**
     * Evaluate a specific reactive field (public method for external triggers)
     */
    public evaluateSpecificReactiveField(fieldPath: string): void {
        this.logger.debug(`🔍 [InputManager] evaluateSpecificReactiveField called for: ${fieldPath}`);
        this.logger.debug(`🔍 [InputManager] Registered reactive fields:`, Array.from(this.reactiveFields.keys()));
        
        const reactiveField = this.reactiveFields.get(fieldPath);
        if (reactiveField) {
            this.logger.debug(`🔍 [InputManager] Found reactive field for ${fieldPath}:`, {
                fieldPath: reactiveField.fieldPath,
                dependencies: reactiveField.dependencies,
                evaluateFunction: reactiveField.evaluateFunction.toString().substring(0, 200) + '...'
            });
        } else {
            this.logger.debug(`❌ [InputManager] No reactive field found for: ${fieldPath}`);
        }
        
        this.evaluateReactiveField(fieldPath);
    }

    /**
     * Get the input components
     */
    getInputs(): InputComponents {
        return this.inputs;
    }

    /**
     * Set a value at a specific key path (supports nested paths like "parent.child.key")
     */
    setValue(keyPath: string, value: FormFieldValue): void {
        this.logger.debug('InputManager.setValue called:', {
            keyPath,
            value,
            valueType: typeof value
        });
        
        // Add call stack debugging to identify the source
        const stack = new Error().stack;
        const caller = stack?.split('\n')[2]?.trim(); // Get the calling function
        
        this.logger.debug('setValue() called from:', {
            keyPath,
            value,
            caller,
            stackDepth: stack?.split('\n').length || 0
        });
        // Get the current value to check if it has actually changed
        const currentValue = this.getValue(keyPath);
        
        // Deep equality check for objects and arrays, shallow for primitives
        const hasChanged = !this.isEqual(currentValue, value);
        
        if (!hasChanged) {
            // Value hasn't changed, skip unnecessary operations
            this.logger.debug('setValue() skipped - value unchanged:', {
                keyPath,
                value,
                currentValue
            });
            return;
        }
        
        this.logger.debug('setValue() called:', {
            keyPath,
            value,
            currentDataBefore: this.data
        });
        
        const keys = keyPath.split('.');
        let current: any = this.data;
        
        this.logger.debug('InputManager.setValue navigating path:', { keys });
        
        // Navigate to the parent object
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            const nextKey = keys[i + 1];
            const isNextKeyNumeric = !isNaN(Number(nextKey));
            
            this.logger.debug('InputManager.setValue navigation step:', {
                index: i,
                key,
                nextKey,
                isNextKeyNumeric,
                currentType: typeof current[key],
                isArray: Array.isArray(current[key])
            });
            
            if (!current[key]) {
                // Key doesn't exist - create appropriate structure
                if (isNextKeyNumeric) {
                    // Next key is numeric, create an array
                    current[key] = [];
                    this.logger.debug('InputManager.setValue created array:', { key });
                } else {
                    // Next key is not numeric, create an object
                    current[key] = {};
                    this.logger.debug('InputManager.setValue created object:', { key });
                }
            } else if (typeof current[key] !== 'object') {
                // Key exists but is not an object - overwrite
                if (isNextKeyNumeric) {
                    current[key] = [];
                    this.logger.debug('InputManager.setValue overwrote with array:', { key });
                } else {
                    current[key] = {};
                    this.logger.debug('InputManager.setValue overwrote with object:', { key });
                }
            }
            // If current[key] is already an array/object, keep it as is
            
            current = current[key];
        }
        
        // Set the final value with smart merging for objects
        const finalKey = keys[keys.length - 1];
        
        // Check if we're about to overwrite an existing object with a partial object
        if (current[finalKey] && 
            typeof current[finalKey] === 'object' && 
            !Array.isArray(current[finalKey]) &&
            value && 
            typeof value === 'object' && 
            !Array.isArray(value)) {
            
            const existingKeys = Object.keys(current[finalKey]);
            const newKeys = Object.keys(value);
            
            // If the existing object has more keys than the new object,
            // this might be a partial update that would lose data
            if (existingKeys.length > newKeys.length) {
                const hasUniqueKeys = existingKeys.some(key => !newKeys.includes(key));
                
                if (hasUniqueKeys) {
                    this.logger.debug('setValue() detected partial object update - merging instead of overwriting:', {
                        keyPath,
                        existingKeys,
                        newKeys,
                        preservingKeys: existingKeys.filter(key => !newKeys.includes(key))
                    });
                    
                    // Merge the new object with the existing object
                    current[finalKey] = { ...current[finalKey], ...value };
                    
                    this.logger.debug('setValue() merge result:', {
                        keyPath,
                        mergedValue: current[finalKey]
                    });
                    
                    this.changeCallback?.(this.getData());
                    return;
                }
            }
        }
        
        // Default behavior: set the value directly
        this.logger.debug('InputManager.setValue setting final value:', {
            finalKey,
            value,
            isCurrentArray: Array.isArray(current)
        });
        
        current[finalKey] = value;
        
        this.logger.debug('InputManager.setValue AFTER setting:', {
            finalKey,
            setValue: current[finalKey]
        });

        this.logger.debug('setValue() result:', {
            keyPath,
            value,
            currentDataAfter: this.data,
            fullDataStructure: JSON.stringify(this.data, null, 2)
        });
        
        // Update reactive fields that depend on this field
        this.updateReactiveFields(keyPath);
        
        this.triggerChange();
    }

    /**
     * Deep equality check for form field values
     */
    private isEqual(a: FormFieldValue | undefined, b: FormFieldValue | undefined): boolean {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (typeof a !== typeof b) return false;
        
        // Handle arrays
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            return a.every((val, index) => this.isEqual(val, b[index]));
        }
        
        // Handle objects (but not dates or arrays)
        if (typeof a === 'object' && typeof b === 'object' && 
            !(a instanceof Date) && !(b instanceof Date) &&
            !Array.isArray(a) && !Array.isArray(b)) {
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            if (keysA.length !== keysB.length) return false;
            return keysA.every(key => this.isEqual((a as Record<string, FormFieldValue>)[key], (b as Record<string, FormFieldValue>)[key]));
        }
        
        // Handle dates
        if (a instanceof Date && b instanceof Date) {
            return a.getTime() === b.getTime();
        }
        
        // Primitives
        return a === b;
    }

    /**
     * Get a value at a specific key path
     */
    getValue(keyPath: string): FormFieldValue | undefined {
        const keys = keyPath.split('.');
        let current: any = this.data;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return undefined;
            }
        }
        
        return current;
    }

    /**
     * Remove a value at a specific key path
     */
    removeValue(keyPath: string): void {
        this.logger.debug('removeValue() called:', {
            keyPath,
            currentDataBefore: this.data
        });
        
        const keys = keyPath.split('.');
        let current: any = this.data;
        
        // Navigate to the parent object
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                this.logger.debug('removeValue() - path doesn\'t exist:', keyPath);
                return; // Path doesn't exist
            }
            current = current[key];
        }
        
        // Remove the final key
        const finalKey = keys[keys.length - 1];
        if (current && typeof current === 'object' && finalKey in current) {
            delete current[finalKey];
            this.logger.debug('removeValue() - successfully removed:', {
                keyPath,
                currentDataAfter: this.data
            });
            this.triggerChange();
        } else {
            this.logger.debug('removeValue() - key not found:', {
                keyPath,
                finalKey,
                availableKeys: Object.keys(current || {})
            });
        }
    }

    /**
     * Add a new key-value pair at a specific position in the object
     * @param parentPath - Path to the parent object (e.g., "parent.child" or "" for root)
     * @param newKey - The new key to add
     * @param value - The value for the new key
     * @param position - Position specification: "start", "end", {insertAfter: "key"}, {insertBefore: "key"}, or key name (legacy)
     */
    addKeyAtPosition(parentPath: string, newKey: string, value: FormFieldValue, position: string | "start" | "end" | {insertAfter: string} | {insertBefore: string} = "end"): void {
        // Navigate to the parent object
        let current: any = this.data;
        if (parentPath) {
            const keys = parentPath.split('.');
            for (const key of keys) {
                if (!current[key] || typeof current[key] !== 'object') {
                    current[key] = {};
                }
                current = current[key];
            }
        }
        
        // Check if key already exists
        if (newKey in current) {
            return; // Key already exists, don't add
        }
        
        // Handle different position options
        if (position === "start") {
            // Add at the beginning
            const newObject: any = { [newKey]: value };
            for (const [key, val] of Object.entries(current)) {
                newObject[key] = val;
            }
            Object.keys(current).forEach(key => delete current[key]);
            Object.assign(current, newObject);
        } else if (position === "end") {
            // Add at the end (simple assignment)
            current[newKey] = value;
        } else if (typeof position === "object") {
            // Handle insertAfter and insertBefore objects
            const newObject: any = {};
            let inserted = false;
            
            if ("insertAfter" in position) {
                // Insert after the specified key
                for (const [key, val] of Object.entries(current)) {
                    newObject[key] = val;
                    if (key === position.insertAfter && !inserted) {
                        newObject[newKey] = value;
                        inserted = true;
                    }
                }
            } else if ("insertBefore" in position) {
                // Insert before the specified key
                for (const [key, val] of Object.entries(current)) {
                    if (key === position.insertBefore && !inserted) {
                        newObject[newKey] = value;
                        inserted = true;
                    }
                    newObject[key] = val;
                }
            }
            
            // If position key wasn't found, add at the end
            if (!inserted) {
                newObject[newKey] = value;
            }
            
            Object.keys(current).forEach(key => delete current[key]);
            Object.assign(current, newObject);
        } else {
            // Legacy: Add after a specific key (string)
            const newObject: any = {};
            let inserted = false;
            
            for (const [key, val] of Object.entries(current)) {
                newObject[key] = val;
                if (key === position && !inserted) {
                    newObject[newKey] = value;
                    inserted = true;
                }
            }
            
            // If position key wasn't found, add at the end
            if (!inserted) {
                newObject[newKey] = value;
            }
            
            Object.keys(current).forEach(key => delete current[key]);
            Object.assign(current, newObject);
        }
        
        this.triggerChange();
    }

    /**
     * Rename a key at a specific path while preserving its position in the object
     */
    renameKey(keyPath: string, newKey: string): void {
        const keys = keyPath.split('.');
        const oldKey = keys[keys.length - 1];
        
        // Navigate to the parent object
        let current: any = this.data;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                return; // Path doesn't exist
            }
            current = current[key];
        }
        
        // Check if the old key exists
        if (!(oldKey in current)) {
            return; // Old key doesn't exist
        }
        
        // If new key is the same as old key, no change needed
        if (oldKey === newKey) {
            return;
        }
        
        // Create a new object with keys in the same order, but with the renamed key
        const newObject: any = {};
        const value = current[oldKey];
        
        for (const [key, val] of Object.entries(current)) {
            if (key === oldKey) {
                newObject[newKey] = value;
            } else {
                newObject[key] = val;
            }
        }
        
        // Replace the parent object's content with the new object
        Object.keys(current).forEach(key => delete current[key]);
        Object.assign(current, newObject);
        
        this.triggerChange();
    }

    /**
     * Add a new input component at a specific position
     * @param parentPath - Path to the parent object (e.g., "parent.child" or "" for root)
     * @param newKey - The new key to add
     * @param input - The input component for the new key
     * @param position - Position specification: "start", "end", {insertAfter: "key"}, {insertBefore: "key"}, or key name (legacy)
     */
    addInputAtPosition(parentPath: string, newKey: string, input: any, position: string | "start" | "end" | {insertAfter: string} | {insertBefore: string} = "end"): void {
        // Navigate to the parent object
        let current: any = this.inputs;
        if (parentPath) {
            const keys = parentPath.split('.');
            for (const key of keys) {
                if (!current[key] || typeof current[key] !== 'object') {
                    current[key] = {};
                }
                current = current[key];
            }
        }
        
        // Check if key already exists
        if (newKey in current) {
            return; // Key already exists, don't add
        }
        
        // Handle different position options
        if (position === "start") {
            // Add at the beginning
            const newObject: any = { [newKey]: input };
            for (const [key, val] of Object.entries(current)) {
                newObject[key] = val;
            }
            Object.keys(current).forEach(key => delete current[key]);
            Object.assign(current, newObject);
        } else if (position === "end") {
            // Add at the end (simple assignment)
            current[newKey] = input;
        } else if (typeof position === "object") {
            // Handle insertAfter and insertBefore objects
            const newObject: any = {};
            let inserted = false;
            
            if ("insertAfter" in position) {
                // Insert after the specified key
                for (const [key, val] of Object.entries(current)) {
                    newObject[key] = val;
                    if (key === position.insertAfter && !inserted) {
                        newObject[newKey] = input;
                        inserted = true;
                    }
                }
            } else if ("insertBefore" in position) {
                // Insert before the specified key
                for (const [key, val] of Object.entries(current)) {
                    if (key === position.insertBefore && !inserted) {
                        newObject[newKey] = input;
                        inserted = true;
                    }
                    newObject[key] = val;
                }
            }
            
            // If position key wasn't found, add at the end
            if (!inserted) {
                newObject[newKey] = input;
            }
            
            Object.keys(current).forEach(key => delete current[key]);
            Object.assign(current, newObject);
        } else {
            // Legacy: Add after a specific key (string)
            const newObject: any = {};
            let inserted = false;
            
            for (const [key, val] of Object.entries(current)) {
                newObject[key] = val;
                if (key === position && !inserted) {
                    newObject[newKey] = input;
                    inserted = true;
                }
            }
            
            // If position key wasn't found, add at the end
            if (!inserted) {
                newObject[newKey] = input;
            }
            
            Object.keys(current).forEach(key => delete current[key]);
            Object.assign(current, newObject);
        }
    }

    /**
     * Set an input component at a specific key path
     */
    setInput(keyPath: string, input: any): void {
        const keys = keyPath.split('.');
        let current: any = this.inputs;
        
        // Navigate to the parent object
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        // Set the final input
        const finalKey = keys[keys.length - 1];
        current[finalKey] = input;
    }

    /**
     * Get an input component at a specific key path
     */
    getInput(keyPath: string): any {
        const keys = keyPath.split('.');
        let current: any = this.inputs;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return undefined;
            }
        }
        
        return current;
    }

    /**
     * Remove an input component at a specific key path
     */
    removeInput(keyPath: string): void {
        const keys = keyPath.split('.');
        let current: any = this.inputs;
        
        // Navigate to the parent object
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                return; // Path doesn't exist
            }
            current = current[key];
        }
        
        // Remove the final input
        const finalKey = keys[keys.length - 1];
        if (current && typeof current === 'object' && finalKey in current) {
            delete current[finalKey];
        }
    }

    /**
     * Rename an input key at a specific path while preserving its position
     */
    renameInputKey(keyPath: string, newKey: string): void {
        const keys = keyPath.split('.');
        const oldKey = keys[keys.length - 1];
        
        // Navigate to the parent object
        let current: any = this.inputs;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                return; // Path doesn't exist
            }
            current = current[key];
        }
        
        // Check if the old key exists
        if (!(oldKey in current)) {
            return; // Old key doesn't exist
        }
        
        // If new key is the same as old key, no change needed
        if (oldKey === newKey) {
            return;
        }
        
        // Create a new object with keys in the same order, but with the renamed key
        const newObject: any = {};
        const input = current[oldKey];
        
        for (const [key, val] of Object.entries(current)) {
            if (key === oldKey) {
                newObject[newKey] = input;
            } else {
                newObject[key] = val;
            }
        }
        
        // Replace the parent object's content with the new object
        Object.keys(current).forEach(key => delete current[key]);
        Object.assign(current, newObject);
    }

    /**
     * Get nested data object for a specific path (creates if doesn't exist)
     */
    getNestedData(keyPath: string): FormData {
        if (!keyPath) return this.data;
        
        const keys = keyPath.split('.');
        let current: any = this.data;
        
        for (const key of keys) {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        return current as FormData;
    }

    /**
     * Get nested inputs object for a specific path (creates if doesn't exist)
     */
    getNestedInputs(keyPath: string): InputComponents {
        if (!keyPath) return this.inputs;
        
        const keys = keyPath.split('.');
        let current: any = this.inputs;
        
        for (const key of keys) {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        return current as InputComponents;
    }

    /**
     * Trigger the change callback
     */
    private triggerChange(): void {
        this.logger.debug('triggerChange() called:', {
            currentData: this.data,
            hasChangeCallback: !!this.changeCallback
        });
        this.changeCallback?.(this.getData());
    }

    /**
     * Update the entire data object
     */
    updateData(newData: FormData): void {
        this.logger.debug('updateData() called:', {
            currentDataBefore: this.data,
            newData: newData,
            isInitializing: this.isInitializing
        });
        
        this.data = { ...newData };
        
        this.logger.debug('updateData() result:', {
            currentDataAfter: this.data
        });
        
        // Evaluate all reactive fields after data update (but only if not initializing)
        if (!this.isInitializing) {
            this.evaluateAllReactiveFields();
        }
        
        this.triggerChange();
    }

    /**
     * Clear all data and inputs
     */
    clear(): void {
        this.data = {};
        this.inputs = {};
        this.triggerChange();
    }

    /**
     * Convenience method: Add a field at the end of an object
     */
    addField(parentPath: string, key: string, value: FormFieldValue = ""): void {
        this.addKeyAtPosition(parentPath, key, value, "end");
    }

    /**
     * Convenience method: Add a field at the beginning of an object
     */
    addFieldAtStart(parentPath: string, key: string, value: FormFieldValue = ""): void {
        this.addKeyAtPosition(parentPath, key, value, "start");
    }

    /**
     * Convenience method: Add a field after a specific existing field
     */
    addFieldAfter(parentPath: string, afterKey: string, newKey: string, value: FormFieldValue = ""): void {
        this.addKeyAtPosition(parentPath, newKey, value, afterKey);
    }

    /**
     * Convenience method: Generate a unique field key within a parent object
     */
    generateUniqueKey(parentPath: string, prefix: string = "field"): string {
        // Navigate to the parent object
        let current: any = this.data;
        if (parentPath) {
            const keys = parentPath.split('.');
            for (const key of keys) {
                if (!current[key] || typeof current[key] !== 'object') {
                    current[key] = {};
                }
                current = current[key];
            }
        }

        let counter = 1;
        let key = `${prefix}${counter}`;
        while (key in current) {
            counter++;
            key = `${prefix}${counter}`;
        }
        return key;
    }

    /**
     * Convenience method: Add a new field with auto-generated unique key
     */
    addUniqueField(parentPath: string, prefix: string = "field", value: FormFieldValue = "", position: string | "start" | "end" | {insertAfter: string} | {insertBefore: string} = "end"): string {
        const uniqueKey = this.generateUniqueKey(parentPath, prefix);
        this.addKeyAtPosition(parentPath, uniqueKey, value, position);
        return uniqueKey;
    }

    /**
     * Get all keys at a specific path (useful for determining insertion positions)
     */
    getKeysAtPath(parentPath: string): string[] {
        let current: any = this.data;
        if (parentPath) {
            const keys = parentPath.split('.');
            for (const key of keys) {
                if (!current[key] || typeof current[key] !== 'object') {
                    return [];
                }
                current = current[key];
            }
        }
        return Object.keys(current);
    }

    /**
     * Convenience method: Add a field with template-style insertAfter positioning
     */
    addFieldWithInsertAfter(parentPath: string, newKey: string, value: FormFieldValue, insertAfter: string): void {
        this.addKeyAtPosition(parentPath, newKey, value, { insertAfter });
    }

    /**
     * Convenience method: Add a field with template-style insertBefore positioning
     */
    addFieldWithInsertBefore(parentPath: string, newKey: string, value: FormFieldValue, insertBefore: string): void {
        this.addKeyAtPosition(parentPath, newKey, value, { insertBefore });
    }

    /**
     * Convenience method: Add a field with both data and input using template-style positioning
     */
    addFieldWithInput(parentPath: string, newKey: string, value: FormFieldValue, input: any, position: {insertAfter: string} | {insertBefore: string} | "start" | "end" = "end"): void {
        this.addKeyAtPosition(parentPath, newKey, value, position);
        this.addInputAtPosition(parentPath, newKey, input, position);
    }

    /**
     * Convert flat object with dot notation keys to nested object structure
     * Example: {device.type: 'ball mill'} -> {device: {type: 'ball mill'}}
     */
    private convertFlatToNested(flatObject: Record<string, unknown>): Record<string, unknown> {
        const nested: Record<string, unknown> = {};
        
        for (const [flatKey, value] of Object.entries(flatObject)) {
            const keys = flatKey.split('.');
            let current = nested;
            
            // Navigate/create the nested structure
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (!current[key] || typeof current[key] !== 'object') {
                    current[key] = {};
                }
                current = current[key] as Record<string, unknown>;
            }
            
            // Set the final value
            const finalKey = keys[keys.length - 1];
            current[finalKey] = value;
        }
        
        return nested;
    }
}
