import type { FormData, FormFieldValue, InputComponents } from "../../../types";

/**
 * InputManager handles the state and operations for input components and form data.
 * This allows clean separation between UI components and data management.
 */
export class InputManager {
    private data: FormData;
    private inputs: InputComponents;
    private changeCallback?: (data: FormData) => void;

    constructor(initialData: FormData = {}, changeCallback?: (data: FormData) => void) {
        this.data = { ...initialData };
        this.inputs = {};
        this.changeCallback = changeCallback;
    }

    /**
     * Get the current form data
     */
    getData(): FormData {
        return { ...this.data };
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
        const keys = keyPath.split('.');
        let current: any = this.data;
        
        // Navigate to the parent object
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        // Set the final value
        const finalKey = keys[keys.length - 1];
        current[finalKey] = value;
        
        this.triggerChange();
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
        const keys = keyPath.split('.');
        let current: any = this.data;
        
        // Navigate to the parent object
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                return; // Path doesn't exist
            }
            current = current[key];
        }
        
        // Remove the final key
        const finalKey = keys[keys.length - 1];
        if (current && typeof current === 'object' && finalKey in current) {
            delete current[finalKey];
            this.triggerChange();
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
        this.changeCallback?.(this.getData());
    }

    /**
     * Update the entire data object
     */
    updateData(newData: FormData): void {
        this.data = { ...newData };
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
}
