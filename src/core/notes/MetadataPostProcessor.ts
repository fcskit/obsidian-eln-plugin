import type { 
    MetaDataTemplate, 
    MetaDataTemplateProcessed, 
    MetaDataTemplateFieldProcessed,
    FormData,
    FormFieldValue,
    JSONObject,
    SubclassMetadataTemplate,
    MetaDataTemplateTransform
} from "../../types";
import type ElnPlugin from "../../main";
import { TemplateEvaluator } from "../templates/TemplateEvaluator";
import { createLogger } from "../../utils/Logger";

const logger = createLogger('metadata');

/**
 * Handles metadata post-processing for final note creation
 * Takes form data and templates and converts them to final metadata for note files
 */
export class MetadataPostProcessor {
    private plugin: ElnPlugin;
    private evaluator: TemplateEvaluator;

    constructor(plugin: ElnPlugin) {
        this.plugin = plugin;
        this.evaluator = new TemplateEvaluator(plugin);
    }

    /**
     * Loads and processes a metadata template for a given note type
     * @param noteType The type of note (e.g., "chemical", "device", etc.)
     * @returns The processed metadata template
     */
    loadMetadataTemplate(noteType?: string): MetaDataTemplateProcessed {
        let template: MetaDataTemplate;
        
        if (noteType && noteType in this.plugin.settings.note) {
            const noteSettings = this.plugin.settings.note[noteType as keyof typeof this.plugin.settings.note];
            template = noteSettings.metadataTemplate;
        } else {
            template = this.plugin.settings.note.default.metadataTemplate;
        }

        if (!template) {
            throw new Error("Failed to load metadata template.");
        }

        // Create a deep copy to avoid modifying the original
        const processed = JSON.parse(JSON.stringify(template)) as MetaDataTemplateProcessed;
        
        // Process dynamic fields
        this.evaluator.processDynamicFields(processed);
        
        return processed;
    }

    /**
     * Preprocesses a metadata template (handles author settings, but NOT subclass selection)
     * @param template The template to preprocess
     * @param noteType The type of note
     * @returns The preprocessed template WITHOUT subclass modifications
     */
    preprocessTemplate(template: MetaDataTemplateProcessed, noteType?: string): MetaDataTemplateProcessed {
        // Handle author settings
        if (this.plugin.settings.footer.includeAuthor) {
            const authorList = this.plugin.settings.general.authors.map((author: { name: string; initials: string }) => author.name);
            if (authorList.length > 1) {
                (template.author as MetaDataTemplateFieldProcessed).query = true;
                (template.author as MetaDataTemplateFieldProcessed).inputType = "dropdown";
                (template.author as MetaDataTemplateFieldProcessed).default = authorList[0];
                (template.author as MetaDataTemplateFieldProcessed).options = authorList;
            } else {
                (template.author as MetaDataTemplateFieldProcessed).default = authorList[0];
            }
        }

        // NOTE: We no longer apply subclass templates here automatically
        // The modal will call applySubclassTemplate() when needed
        return template;
    }

    /**
     * Finds a field with inputType "subclass" in the template
     * @param template The template to search
     * @returns The subclass field if found
     */
    findSubclassInputField(template: MetaDataTemplateProcessed): MetaDataTemplateFieldProcessed | undefined {
        for (const value of Object.values(template)) {
            if (value && typeof value === "object") {
                if ("inputType" in value && value.inputType === "subclass") {
                    return value as MetaDataTemplateFieldProcessed;
                }
                // Recursively search nested objects (but not arrays)
                if (!("inputType" in value)) {
                    const nested = this.findSubclassInputField(value as MetaDataTemplateProcessed);
                    if (nested) return nested;
                }
            }
        }
        return undefined;
    }

    /**
     * Applies a subclass template to a base template for a specific note type and subclass name
     * @param baseTemplate The base template (will not be modified)
     * @param noteType The note type
     * @param subclassName The name of the subclass to apply
     * @returns The template with applied subclass modifications, or the base template if no subclass found
     */
    applySubclassTemplateByName(
        baseTemplate: MetaDataTemplateProcessed,
        noteType: string,
        subclassName: string
    ): MetaDataTemplateProcessed {
        logger.debug(`Applying subclass template for ${noteType}:${subclassName}`);
        
        if (noteType in this.plugin.settings.note) {
            const noteSettings = this.plugin.settings.note[noteType as keyof typeof this.plugin.settings.note];
            if ('type' in noteSettings) {
                // Use type assertion to handle different note type interfaces
                type NoteSettingsWithTypes = { type: Array<{ name: string; subClassMetadataTemplate?: MetaDataTemplateTransform }> };
                const typeArray = (noteSettings as NoteSettingsWithTypes).type;
                const typeObj = Array.isArray(typeArray)
                    ? typeArray.find((type) => type.name === subclassName)
                    : undefined;
                
                const subclassTemplate = typeObj?.subClassMetadataTemplate;
                if (subclassTemplate) {
                    logger.debug(`Found subclass template for ${subclassName}:`, subclassTemplate);
                    return this.applySubclassTemplate(baseTemplate, subclassTemplate as unknown as SubclassMetadataTemplate);
                } else {
                    logger.debug(`No subclass template found for ${subclassName}`);
                }
            }
        }
        
        // Return a copy of the base template if no subclass template found
        return JSON.parse(JSON.stringify(baseTemplate));
    }

    /**
     * Gets the default subclass name for a note type
     * @param baseTemplate The base template
     * @param noteType The note type
     * @returns The default subclass name or null if not found
     */
    getDefaultSubclassName(baseTemplate: MetaDataTemplateProcessed, noteType: string): string | null {
        const subclassInput = this.findSubclassInputField(baseTemplate);
        if (subclassInput) {
            let options: string[] = [];
            if (Array.isArray(subclassInput.options)) {
                options = subclassInput.options;
            } else if (typeof subclassInput.options === "function") {
                // Handle function options - this should already be evaluated by preprocessTemplate
                const evaluatedOptions = (subclassInput.options as (data: JSONObject) => unknown)({} as JSONObject);
                options = Array.isArray(evaluatedOptions) ? evaluatedOptions : [];
            }
            
            const defaultSubclass = subclassInput.default || options[0] || null;
            logger.debug(`Default subclass for ${noteType}:`, defaultSubclass);
            return defaultSubclass as string | null;
        }
        return null;
    }

    /**
     * Applies the default subclass template based on the default value
     * @param template The base template
     * @param noteType The note type
     * @param subclassInput The subclass input field
     * @returns The template with applied subclass modifications
     */
    /**
     * Applies a subclass template to modify the base template
     * @param baseTemplate The base template
     * @param subclassTemplate The subclass modifications
     * @returns The modified template
     */
    applySubclassTemplate(
        baseTemplate: MetaDataTemplateProcessed,
        subclassTemplate: SubclassMetadataTemplate
    ): MetaDataTemplateProcessed {
        logger.debug("Applying subclass template:", subclassTemplate);
        
        // Create a deep copy of the base template to avoid modifying the original
        const newTemplate = JSON.parse(JSON.stringify(baseTemplate)) as MetaDataTemplateProcessed;
        
        // Remove fields
        if (Array.isArray(subclassTemplate.remove)) {
            for (const fullKey of subclassTemplate.remove) {
                const keys = fullKey.split(".");
                let obj: MetaDataTemplateProcessed = newTemplate;
                for (let i = 0; i < keys.length - 1; i++) {
                    const next = obj[keys[i]];
                    if (!next || typeof next !== 'object' || 'query' in next) break;
                    obj = next as MetaDataTemplateProcessed;
                }
                delete obj[keys[keys.length - 1]];
            }
        }
        
        // Replace fields
        if (subclassTemplate.replace && Array.isArray(subclassTemplate.replace)) {
            for (const { fullKey, newKey, input } of subclassTemplate.replace) {
                let keyExisted = false;
                
                // Try to remove old key
                const keys = fullKey.split(".");
                let obj: MetaDataTemplateProcessed = newTemplate;
                let validPath = true;
                
                for (let i = 0; i < keys.length - 1; i++) {
                    const next = obj[keys[i]];
                    if (!next || typeof next !== 'object' || 'query' in next) {
                        validPath = false;
                        break;
                    }
                    obj = next as MetaDataTemplateProcessed;
                }
                
                if (validPath && obj[keys[keys.length - 1]]) {
                    keyExisted = true;
                    delete obj[keys[keys.length - 1]];
                }
                
                // Add new key (or add if original didn't exist)
                if (newKey) {
                    // Parse newKey to handle both dot notation and simple keys
                    const newKeys = newKey.split(".");
                    let targetObj: MetaDataTemplateProcessed = newTemplate;
                    
                    // Navigate to the correct location for the new key
                    for (let i = 0; i < newKeys.length - 1; i++) {
                        const current = targetObj[newKeys[i]];
                        if (!current || typeof current !== 'object' || 'query' in current) {
                            targetObj[newKeys[i]] = {} as MetaDataTemplateProcessed;
                        }
                        targetObj = targetObj[newKeys[i]] as MetaDataTemplateProcessed;
                    }
                    
                    // Set the new field
                    targetObj[newKeys[newKeys.length - 1]] = input as unknown as MetaDataTemplateFieldProcessed;
                } else if (!keyExisted) {
                    // If no newKey specified and original key didn't exist, 
                    // add at the original location as fallback
                    let fallbackObj: MetaDataTemplateProcessed = newTemplate;
                    for (let i = 0; i < keys.length - 1; i++) {
                        const current = fallbackObj[keys[i]];
                        if (!current || typeof current !== 'object' || 'query' in current) {
                            fallbackObj[keys[i]] = {} as MetaDataTemplateProcessed;
                        }
                        fallbackObj = fallbackObj[keys[i]] as MetaDataTemplateProcessed;
                    }
                    fallbackObj[keys[keys.length - 1]] = input as unknown as MetaDataTemplateFieldProcessed;
                }
            }
        }
        
        // Add fields
        if (Array.isArray(subclassTemplate.add)) {
            for (const { fullKey, input } of subclassTemplate.add) {
                const keys = fullKey.split(".");
                let obj: MetaDataTemplateProcessed = newTemplate;
                for (let i = 0; i < keys.length - 1; i++) {
                    const current = obj[keys[i]];
                    if (!current || typeof current !== 'object' || 'query' in current) {
                        obj[keys[i]] = {} as MetaDataTemplateProcessed;
                    }
                    obj = obj[keys[i]] as MetaDataTemplateProcessed;
                }
                obj[keys[keys.length - 1]] = input as unknown as MetaDataTemplateFieldProcessed;
            }
        }
        
        // Process dynamic fields
        this.evaluator.processDynamicFields(newTemplate);
        
        logger.debug("New template after subclass application:", newTemplate);
        return newTemplate;
    }

    /**
     * Processes metadata by resolving all default values and user inputs
     * @param template The metadata template
     * @param userInput The user input data
     * @param parentKey The parent key for nested processing
     * @returns The processed metadata ready for note creation
     */
    async processMetadata(
        template: MetaDataTemplateProcessed,
        userInput: FormData,
        parentKey = ""
    ): Promise<FormData> {
        const result: FormData = {};
        
        for (const [key, config] of Object.entries(template)) {
            const fullKey = parentKey ? `${parentKey}.${key}` : key;

            if (
                config !== null &&
                typeof config === "object" &&
                !("inputType" in config) &&
                !("query" in config) &&
                !("default" in config) &&
                !("callback" in config)
            ) {
                // Recursively process nested objects
                const nestedInput = userInput[key];
                const nestedFormData = (nestedInput && typeof nestedInput === 'object' && !Array.isArray(nestedInput)) 
                    ? nestedInput as FormData 
                    : {};
                result[key] = await this.processMetadata(config as MetaDataTemplateProcessed, nestedFormData, fullKey);
            } else {
                const field = config as MetaDataTemplateFieldProcessed;
                // Use the value directly from userInput or fallback to default
                const inputValue = userInput[key];
                const defaultValue = this.evaluator.evaluateFieldDefault(field, userInput);

                // Special handling for list inputType with objectTemplate
                if (field.inputType === "list" && field.listType === "object" && field.objectTemplate) {
                    // Process array of objects - apply callbacks to each object's fields
                    if (Array.isArray(inputValue)) {
                        result[key] = (await Promise.all(
                            inputValue.map(async (item) => {
                                if (item && typeof item === 'object' && !Array.isArray(item)) {
                                    // Process each object in the list using the objectTemplate
                                    return await this.processMetadata(
                                        field.objectTemplate as MetaDataTemplateProcessed,
                                        item as unknown as FormData,
                                        `${fullKey}.item`
                                    );
                                }
                                return item;
                            })
                        )) as FormFieldValue;
                    } else if (defaultValue !== undefined) {
                        result[key] = defaultValue as FormFieldValue;
                    } else {
                        result[key] = [] as FormFieldValue;
                    }
                    continue; // Skip the normal field processing
                }

                // Determine the raw value (before callback transformation)
                let rawValue: FormFieldValue;
                
                if (field.inputType === "number" && field.units) {
                    // Handle numeric input with units
                    const unit = field.defaultUnit || (Array.isArray(field.units) ? field.units[0] : field.units);
                    if (inputValue && typeof inputValue === "object" && "value" in inputValue && "unit" in inputValue) {
                        // If the user provided a value with a unit, use it directly
                        rawValue = inputValue;
                    } else if (inputValue !== undefined) {
                        // If the user provided only a value, include the default unit
                        rawValue = { value: inputValue as number, unit } as FormFieldValue;
                    } else if (defaultValue !== undefined) {
                        // If no user input, use the default value and unit
                        rawValue = { value: defaultValue as number, unit } as FormFieldValue;
                    } else {
                        // If no default value, set to null
                        rawValue = { value: null, unit } as FormFieldValue;
                    }
                } else {
                    // Handle other input types
                    rawValue = inputValue !== undefined ? inputValue : (defaultValue as FormFieldValue);
                }

                // Apply callback transformation if present
                if (field.callback) {
                    result[key] = this.evaluator.evaluateFieldCallback(field, rawValue, userInput) as FormFieldValue;
                } else {
                    result[key] = rawValue;
                }
            }
        }
        
        // Add any additional keys from userInput that aren't in the template
        // This handles return values from QueryDropdowns that create new keys
        for (const [key, value] of Object.entries(userInput)) {
            if (!(key in template) && value !== undefined) {
                logger.debug(`Adding additional key from userInput: ${key}`, value);
                result[key] = value;
            }
        }
        
        return result;
    }

    /**
     * Checks if the template requires user input
     * @param template The template to check
     * @returns True if user input is required
     */
    requiresUserInput(template: MetaDataTemplateProcessed): boolean {
        for (const config of Object.values(template)) {
            if (config && typeof config === "object") {
                if ("inputType" in config && "query" in config && config.query === true) {
                    return true;
                }
                // Recursively check nested objects
                if (!("inputType" in config) && this.requiresUserInput(config as MetaDataTemplateProcessed)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Updates fields that depend on user input when their dependencies change.
     * @param template The template to update
     * @param changedFieldPath The path of the field that was changed
     * @param userData The current user data
     * @param currentPath The current path in template traversal
     * @returns Array of field paths that were updated
     */
    updateDependentFields(
        template: MetaDataTemplateProcessed, 
        changedFieldPath: string, 
        userData: FormData,
        currentPath: string = ""
    ): string[] {
        const updatedFields: string[] = [];
        
        for (const [key, config] of Object.entries(template)) {
            const fieldPath = currentPath ? `${currentPath}.${key}` : key;
            
            if (config !== null && typeof config === "object" && !("inputType" in config)) {
                // Recursively search nested objects
                const nestedUpdates = this.updateDependentFields(
                    config as MetaDataTemplateProcessed, 
                    changedFieldPath, 
                    userData,
                    fieldPath
                );
                updatedFields.push(...nestedUpdates);
            } else if (config && typeof config === "object" && "inputType" in config) {
                const field = config as MetaDataTemplateFieldProcessed;
                
                // Check if any function descriptors in this field depend on the changed field
                if (this.evaluator.checkFieldForUserInputDependencies(field, changedFieldPath)) {
                    updatedFields.push(fieldPath);
                }
            }
        }
        
        return updatedFields;
    }

    /**
     * Gets the TemplateEvaluator instance
     */
    getEvaluator(): TemplateEvaluator {
        return this.evaluator;
    }
}
