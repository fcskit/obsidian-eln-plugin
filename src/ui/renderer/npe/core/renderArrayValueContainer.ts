import { getDataType, getTypeDisplayName, convertArrayItemInput } from "../helpers/getDataType";
import { getFrontmatterValue } from "../helpers/getFrontmatterValue";
import { determineNewArrayItemType } from "../helpers/determineNewArrayItemType";
import { updateProperties } from "../utils/updateProperties";
import { createInternalLinkElement } from "../elements/createInternalLinkElement";
import { createExternalLinkElement } from "../elements/createExternalLinkElement";
import { createLatexElement } from "../elements/createLatexElement";
import { createBooleanElement } from "../elements/createBooleanElement";
import { createDateElement } from "../elements/createDateElement";
import { createLogger } from "../../../../utils/Logger";
import { setTooltip } from "obsidian";

const logger = createLogger('npe');

/**
 * Re-renders a single array item after a type change.
 * This preserves the array context while updating just the item that changed.
 */
function rerenderSingleArrayItem(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    itemContainer: HTMLElement,
    fullKey: string,
    index: number,
    level: number,
    newValue: FrontmatterPrimitive,
    newDataType: string
): void {
    const parentContainer = itemContainer.parentElement;
    
    if (parentContainer) {
        // Get the next sibling before removing the current item
        const nextSibling = itemContainer.nextElementSibling;
        
        // Remove the old item container
        itemContainer.remove();
        
        // Create new item container with the known updated data
        const newItemContainer = createSingleArrayItem(view, newValue, index, fullKey, level);
        
        // Insert at the correct position using the next sibling reference
        if (nextSibling) {
            parentContainer.insertBefore(newItemContainer, nextSibling);
        } else {
            // No next sibling means it was the last item before the add button
            const addButton = parentContainer.querySelector('.npe-button--add');
            if (addButton) {
                parentContainer.insertBefore(newItemContainer, addButton);
            } else {
                parentContainer.appendChild(newItemContainer);
            }
        }
    }
}

/**
 * Creates a single array item element with all its interactions.
 * This is extracted from the main renderArrayValueContainer function for reusability.
 */
function createSingleArrayItem(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    item: FrontmatterValue,
    index: number,
    fullKey: string,
    level: number
): HTMLElement {
    const app = view.app;
    const key = fullKey.split('.').pop();
    const itemDataType = getDataType(item);
    
    const itemContainer = document.createElement('div');
    itemContainer.className = 'npe-list-item';
    itemContainer.setAttribute('data-key', `${fullKey}.${index}`);
    itemContainer.setAttribute('data-type', itemDataType);
    
    if (key === 'tags' || key === 'tag') {
        itemContainer.classList.add('npe-tag-item');
    }

    // Add type tooltip to the list item
    addTypeTooltip(view, itemContainer, itemDataType, item);

    if (itemDataType === 'link') {
        // Pass the full link syntax (should already include brackets)
        const fullLink = typeof item === 'string' ? item : String(item);
        createInternalLinkElement(view, fullLink, itemContainer, itemContainer.getAttribute('data-key') || `${fullKey}.${index}`, (newValue) => {
            // Array-specific update callback with intelligent type conversion
            const currentDataKey = itemContainer.getAttribute('data-key') || `${fullKey}.${index}`;
            if (view.currentFile) {
                // Set internal change flag BEFORE calling updateProperties
                if (view instanceof NestedPropertiesEditorView) {
                    view.setInternalChangeFlag();
                }
                
                // Use intelligent type conversion for array items
                const currentItem = typeof item === 'object' && item !== null && !Array.isArray(item) 
                    ? undefined 
                    : item as FrontmatterPrimitive | undefined;
                // Get the current data-type from the container's attribute
                const currentDataType = itemContainer.getAttribute('data-type') || itemDataType;
                const conversionResult = convertArrayItemInput(newValue, currentDataType, currentItem);
                
                // Update the data-type attribute if type changed
                if (conversionResult.typeChanged) {
                    itemContainer.setAttribute('data-type', conversionResult.detectedType);
                    // Update tooltip if shown
                    if (view.plugin?.settings?.npe?.showDataTypes) {
                        const displayName = getTypeDisplayName(conversionResult.detectedType);
                        const tooltipText = `Data type: ${displayName} (converted from ${getTypeDisplayName(conversionResult.originalType)})`;
                        setTooltip(itemContainer, tooltipText, {
                            delay: 2000,
                            placement: 'top'
                        });
                    }
                    logger.debug(`Array item type converted from ${conversionResult.originalType} to ${conversionResult.detectedType}`, {
                        newValue,
                        convertedValue: conversionResult.convertedValue
                    });
                }
                
                // Use the converted value and detected type for storage
                updateProperties(
                    view.app, 
                    view.currentFile, 
                    currentDataKey, 
                    conversionResult.convertedValue, 
                    conversionResult.detectedType
                );
                
                // Re-render just this specific item if type changed
                if (conversionResult.typeChanged) {
                    rerenderSingleArrayItem(view, itemContainer, fullKey, index, level, conversionResult.convertedValue, conversionResult.detectedType);
                }
            }
        });
    } else if (itemDataType === 'external-link') {
        const linkValue = typeof item === 'string' ? item : String(item);
        createExternalLinkElement(view, linkValue, itemContainer, itemContainer.getAttribute('data-key') || `${fullKey}.${index}`, (newValue) => {
            // Array-specific update callback with intelligent type conversion
            const currentDataKey = itemContainer.getAttribute('data-key') || `${fullKey}.${index}`;
            if (view.currentFile) {
                // Set internal change flag BEFORE calling updateProperties
                if (view instanceof NestedPropertiesEditorView) {
                    view.setInternalChangeFlag();
                }
                
                // Use intelligent type conversion for array items
                const currentItem = typeof item === 'object' && item !== null && !Array.isArray(item) 
                    ? undefined 
                    : item as FrontmatterPrimitive | undefined;
                // Get the current data-type from the container's attribute
                const currentDataType = itemContainer.getAttribute('data-type') || itemDataType;
                const conversionResult = convertArrayItemInput(newValue, currentDataType, currentItem);
                
                // Update the data-type attribute if type changed
                if (conversionResult.typeChanged) {
                    itemContainer.setAttribute('data-type', conversionResult.detectedType);
                    // Update tooltip if shown
                    if (view.plugin?.settings?.npe?.showDataTypes) {
                        const displayName = getTypeDisplayName(conversionResult.detectedType);
                        const tooltipText = `Data type: ${displayName} (converted from ${getTypeDisplayName(conversionResult.originalType)})`;
                        setTooltip(itemContainer, tooltipText, {
                            delay: 2000,
                            placement: 'top'
                        });
                    }
                    logger.debug(`Array item type converted from ${conversionResult.originalType} to ${conversionResult.detectedType}`, {
                        newValue,
                        convertedValue: conversionResult.convertedValue
                    });
                }
                
                // Use the converted value and detected type for storage
                updateProperties(
                    view.app, 
                    view.currentFile, 
                    currentDataKey, 
                    conversionResult.convertedValue, 
                    conversionResult.detectedType
                );
                
                // Re-render just this specific item if type changed
                if (conversionResult.typeChanged) {
                    rerenderSingleArrayItem(view, itemContainer, fullKey, index, level, conversionResult.convertedValue, conversionResult.detectedType);
                }
            }
        });
    } else if (itemDataType === 'latex') {
        const latexValue = typeof item === 'string' ? item : String(item);
        createLatexElement(view, latexValue, itemContainer, itemContainer.getAttribute('data-key') || `${fullKey}.${index}`, (newValue) => {
            // Array-specific update callback with intelligent type conversion
            const currentDataKey = itemContainer.getAttribute('data-key') || `${fullKey}.${index}`;
            if (view.currentFile) {
                // Set internal change flag BEFORE calling updateProperties
                if (view instanceof NestedPropertiesEditorView) {
                    view.setInternalChangeFlag();
                }
                
                // Use intelligent type conversion for array items
                const currentItem = typeof item === 'object' && item !== null && !Array.isArray(item) 
                    ? undefined 
                    : item as FrontmatterPrimitive | undefined;
                // Get the current data-type from the container's attribute
                const currentDataType = itemContainer.getAttribute('data-type') || itemDataType;
                const conversionResult = convertArrayItemInput(newValue, currentDataType, currentItem);
                
                // Update the data-type attribute if type changed
                if (conversionResult.typeChanged) {
                    itemContainer.setAttribute('data-type', conversionResult.detectedType);
                    // Update tooltip if shown
                    if (view.plugin?.settings?.npe?.showDataTypes) {
                        const displayName = getTypeDisplayName(conversionResult.detectedType);
                        const tooltipText = `Data type: ${displayName} (converted from ${getTypeDisplayName(conversionResult.originalType)})`;
                        setTooltip(itemContainer, tooltipText, {
                            delay: 2000,
                            placement: 'top'
                        });
                    }
                    logger.debug(`Array item type converted from ${conversionResult.originalType} to ${conversionResult.detectedType}`, {
                        newValue,
                        convertedValue: conversionResult.convertedValue
                    });
                }
                
                // Use the converted value and detected type for storage
                updateProperties(
                    view.app, 
                    view.currentFile, 
                    currentDataKey, 
                    conversionResult.convertedValue, 
                    conversionResult.detectedType
                );
                
                // Re-render just this specific item if type changed
                if (conversionResult.typeChanged) {
                    rerenderSingleArrayItem(view, itemContainer, fullKey, index, level, conversionResult.convertedValue, conversionResult.detectedType);
                }
            }
        });
    } else if (itemDataType === 'array') {
        // Handle nested arrays by rendering them as proper nested structures
        if (Array.isArray(item)) {
            const nestedArrayContainer = itemContainer.createDiv({ 
                cls: 'npe-nested-array-container',
                attr: { 'data-key': `${fullKey}.${index}` }
            });
            renderArray(view, `item ${index + 1}`, item as Array<FrontmatterValue>, nestedArrayContainer, level + 1, `${fullKey}.${index}`, [], false);
        }
    } else if (itemDataType === 'object') {
        // Handle nested objects by rendering them as proper nested structures  
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
            const nestedObjectContainer = itemContainer.createDiv({ 
                cls: 'npe-nested-object-container',
                attr: { 'data-key': `${fullKey}.${index}` }
            });
            renderObjectContainer(view, `item ${index + 1}`, item as FrontmatterObject, nestedObjectContainer, level + 1, `${fullKey}.${index}`, []);
        }
    } else if (itemDataType === 'string' || itemDataType === 'number') {
        const input = itemContainer.createDiv({ cls: 'npe-list-item-value', text: String(item) });
        input.contentEditable = "true";
        view.registerDomEvent(input, 'blur', () => {
            // Read the current data-key from the container to handle dynamic array changes
            const currentDataKey = itemContainer.getAttribute('data-key') || `${fullKey}.${index}`;
            if (view.currentFile) {
                // Set internal change flag BEFORE calling updateProperties
                if (view instanceof NestedPropertiesEditorView) {
                    view.setInternalChangeFlag();
                }
                
                // Use intelligent type conversion for array items
                const userInput = input.textContent || '';
                const currentItem = typeof item === 'object' && item !== null && !Array.isArray(item) 
                    ? undefined 
                    : item as FrontmatterPrimitive | undefined;
                // Get the current data-type from the container's attribute, not the original itemDataType
                const currentDataType = itemContainer.getAttribute('data-type') || itemDataType;
                const conversionResult = convertArrayItemInput(userInput, currentDataType, currentItem);
                
                // Update the data-type attribute if type changed
                if (conversionResult.typeChanged) {
                    itemContainer.setAttribute('data-type', conversionResult.detectedType);
                    // Update tooltip if shown
                    if (view.plugin?.settings?.npe?.showDataTypes) {
                        const displayName = getTypeDisplayName(conversionResult.detectedType);
                        const tooltipText = `Data type: ${displayName} (converted from ${getTypeDisplayName(conversionResult.originalType)})`;
                        setTooltip(itemContainer, tooltipText, {
                            delay: 2000,
                            placement: 'top'
                        });
                    }
                    logger.debug(`Array item type converted from ${conversionResult.originalType} to ${conversionResult.detectedType}`, {
                        userInput,
                        convertedValue: conversionResult.convertedValue
                    });
                }
                
                // Use the converted value and detected type for storage
                updateProperties(
                    view.app, 
                    view.currentFile, 
                    currentDataKey, 
                    conversionResult.convertedValue, 
                    conversionResult.detectedType
                );
                
                // Re-render just this specific item if type changed
                if (conversionResult.typeChanged) {
                    rerenderSingleArrayItem(view, itemContainer, fullKey, index, level, conversionResult.convertedValue, conversionResult.detectedType);
                }
            }
        });
    } else if (itemDataType === 'boolean') {
        // Handle boolean values with special toggle/edit behavior
        const booleanValue = typeof item === 'boolean' ? item : Boolean(item);
        createBooleanElement(view, booleanValue, itemContainer, itemContainer.getAttribute('data-key') || `${fullKey}.${index}`, (newValue) => {
            // Array-specific update callback with intelligent type conversion (for edit mode only)
            const currentDataKey = itemContainer.getAttribute('data-key') || `${fullKey}.${index}`;
            if (view.currentFile) {
                // Set internal change flag BEFORE calling updateProperties
                if (view instanceof NestedPropertiesEditorView) {
                    view.setInternalChangeFlag();
                }
                
                // Use intelligent type conversion for array items (when editing as text)
                const currentItem = typeof item === 'object' && item !== null && !Array.isArray(item) 
                    ? undefined 
                    : item as FrontmatterPrimitive | undefined;
                // Get the current data-type from the container's attribute
                const currentDataType = itemContainer.getAttribute('data-type') || itemDataType;
                const conversionResult = convertArrayItemInput(newValue, currentDataType, currentItem);
                
                // Update the data-type attribute if type changed
                if (conversionResult.typeChanged) {
                    itemContainer.setAttribute('data-type', conversionResult.detectedType);
                    // Update tooltip if shown
                    if (view.plugin?.settings?.npe?.showDataTypes) {
                        const displayName = getTypeDisplayName(conversionResult.detectedType);
                        const tooltipText = `Data type: ${displayName} (converted from ${getTypeDisplayName(conversionResult.originalType)})`;
                        setTooltip(itemContainer, tooltipText, {
                            delay: 2000,
                            placement: 'top'
                        });
                    }
                    logger.debug(`Array item type converted from ${conversionResult.originalType} to ${conversionResult.detectedType}`, {
                        newValue,
                        convertedValue: conversionResult.convertedValue
                    });
                }
                
                // Use the converted value and detected type for storage
                updateProperties(
                    view.app, 
                    view.currentFile, 
                    currentDataKey, 
                    conversionResult.convertedValue, 
                    conversionResult.detectedType
                );
                
                // Re-render just this specific item if type changed
                if (conversionResult.typeChanged) {
                    rerenderSingleArrayItem(view, itemContainer, fullKey, index, level, conversionResult.convertedValue, conversionResult.detectedType);
                }
            }
        });
    } else {
        // Handle other data types (boolean, date, etc.)
        let inputType: string;
        switch (itemDataType) {
            case 'date':
                inputType = 'date';
                break;
            case 'boolean':
                inputType = 'checkbox';
                break;
            default:
                inputType = 'text';
        }
        
        // Use editable divs for text/number inputs, HTML inputs for date/checkbox
        if (inputType === 'text' || inputType === 'number') {
            const editableDiv = createEditableDiv(
                itemContainer,
                String(item),
                `Enter ${inputType === "number" ? "number" : "text"}...`,
                inputType as "text" | "number",
                (newValue) => {
                    const currentDataKey = itemContainer.getAttribute('data-key') || `${fullKey}.${index}`;
                    if (view.currentFile) {
                        // Set internal change flag BEFORE calling updateProperties
                        if (view instanceof NestedPropertiesEditorView) {
                            view.setInternalChangeFlag();
                        }
                        
                        // Use intelligent type conversion for array items
                        const currentItem = typeof item === 'object' && item !== null && !Array.isArray(item) 
                            ? undefined 
                            : item as FrontmatterPrimitive | undefined;
                        // Get the current data-type from the container's attribute, not the original itemDataType
                        const currentDataType = itemContainer.getAttribute('data-type') || itemDataType;
                        const conversionResult = convertArrayItemInput(String(newValue), currentDataType, currentItem);
                        
                        // Update the data-type attribute if type changed
                        if (conversionResult.typeChanged) {
                            itemContainer.setAttribute('data-type', conversionResult.detectedType);
                            editableDiv.setAttribute('data-type', conversionResult.detectedType);
                            // Update tooltip if shown
                            if (view.plugin?.settings?.npe?.showDataTypes) {
                                const displayName = getTypeDisplayName(conversionResult.detectedType);
                                const tooltipText = `Data type: ${displayName} (converted from ${getTypeDisplayName(conversionResult.originalType)})`;
                                setTooltip(itemContainer, tooltipText, {
                                    delay: 2000,
                                    placement: 'top'
                                });
                            }
                            logger.debug(`Array item type converted from ${conversionResult.originalType} to ${conversionResult.detectedType}`, {
                                newValue,
                                convertedValue: conversionResult.convertedValue
                            });
                        }
                        
                        // Use the converted value and detected type for storage
                        updateProperties(
                            view.app, 
                            view.currentFile, 
                            currentDataKey, 
                            conversionResult.convertedValue, 
                            conversionResult.detectedType
                        );
                        
                        // Re-render just this specific item if type changed
                        if (conversionResult.typeChanged) {
                            rerenderSingleArrayItem(view, itemContainer, fullKey, index, level, conversionResult.convertedValue, conversionResult.detectedType);
                        }
                    }
                }
            );
            editableDiv.setAttribute('data-key', `${fullKey}.${index}`);
            editableDiv.setAttribute('data-type', itemDataType);
        } else if (inputType === 'date') {
            // Use specialized date element that supports both date picker and text editing
            createDateElement(
                view,
                String(item),
                itemContainer,
                itemContainer.getAttribute('data-key') || `${fullKey}.${index}`,
                (newValue) => {
                    // Array-specific update callback with intelligent type conversion
                    const currentDataKey = itemContainer.getAttribute('data-key') || `${fullKey}.${index}`;
                    if (view.currentFile) {
                        // Set internal change flag BEFORE calling updateProperties
                        if (view instanceof NestedPropertiesEditorView) {
                            view.setInternalChangeFlag();
                        }
                        
                        // Use intelligent type conversion for array items
                        const currentItem = typeof item === 'object' && item !== null && !Array.isArray(item) 
                            ? undefined 
                            : item as FrontmatterPrimitive | undefined;
                        // Get the current data-type from the container's attribute
                        const currentDataType = itemContainer.getAttribute('data-type') || itemDataType;
                        const conversionResult = convertArrayItemInput(newValue, currentDataType, currentItem);
                        
                        // Update the data-type attribute if type changed
                        if (conversionResult.typeChanged) {
                            itemContainer.setAttribute('data-type', conversionResult.detectedType);
                            // Update tooltip if shown
                            if (view.plugin?.settings?.npe?.showDataTypes) {
                                const displayName = getTypeDisplayName(conversionResult.detectedType);
                                const tooltipText = `Data type: ${displayName} (converted from ${getTypeDisplayName(conversionResult.originalType)})`;
                                setTooltip(itemContainer, tooltipText, {
                                    delay: 2000,
                                    placement: 'top'
                                });
                            }
                            logger.debug(`Array item type converted from ${conversionResult.originalType} to ${conversionResult.detectedType}`, {
                                newValue,
                                convertedValue: conversionResult.convertedValue
                            });
                        }
                        
                        // Use the converted value and detected type for storage
                        updateProperties(
                            view.app, 
                            view.currentFile, 
                            currentDataKey, 
                            conversionResult.convertedValue, 
                            conversionResult.detectedType
                        );
                        
                        // Re-render just this specific item if type changed
                        if (conversionResult.typeChanged) {
                            rerenderSingleArrayItem(view, itemContainer, fullKey, index, level, conversionResult.convertedValue, conversionResult.detectedType);
                        }
                    }
                }
            );
        } else {
            // Use traditional HTML input for checkbox and other input types
            const input = itemContainer.createEl('input', {
                type: inputType,
                value: typeof item === 'string' || typeof item === 'number' ? String(item) : '',
                attr: { 'data-key': `${fullKey}.${index}`, 'data-type': itemDataType }
            });
            input.oninput = () => {
                const currentDataKey = itemContainer.getAttribute('data-key') || `${fullKey}.${index}`;
                if (view.currentFile) {
                    // Set internal change flag BEFORE calling updateProperties
                    if (view instanceof NestedPropertiesEditorView) {
                        view.setInternalChangeFlag();
                    }
                    
                    // Use intelligent type conversion for array items
                    const currentItem = typeof item === 'object' && item !== null && !Array.isArray(item) 
                        ? undefined 
                        : item as FrontmatterPrimitive | undefined;
                    // Get the current data-type from the container's attribute, not the original itemDataType
                    const currentDataType = itemContainer.getAttribute('data-type') || itemDataType;
                    const conversionResult = convertArrayItemInput(input.value, currentDataType, currentItem);
                    
                    // Update the data-type attribute if type changed
                    if (conversionResult.typeChanged) {
                        itemContainer.setAttribute('data-type', conversionResult.detectedType);
                        input.setAttribute('data-type', conversionResult.detectedType);
                        // Update tooltip if shown
                        if (view.plugin?.settings?.npe?.showDataTypes) {
                            const displayName = getTypeDisplayName(conversionResult.detectedType);
                            const tooltipText = `Data type: ${displayName} (converted from ${getTypeDisplayName(conversionResult.originalType)})`;
                            setTooltip(itemContainer, tooltipText, {
                                delay: 2000,
                                placement: 'top'
                            });
                        }
                        logger.debug(`Array item type converted from ${conversionResult.originalType} to ${conversionResult.detectedType}`, {
                            inputValue: input.value,
                            convertedValue: conversionResult.convertedValue
                        });
                    }
                    
                    // Use the converted value and detected type for storage
                    updateProperties(
                        view.app, 
                        view.currentFile, 
                        currentDataKey, 
                        conversionResult.convertedValue, 
                        conversionResult.detectedType
                    );
                    
                    // Re-render just this specific item if type changed
                    if (conversionResult.typeChanged) {
                        rerenderSingleArrayItem(view, itemContainer, fullKey, index, level, conversionResult.convertedValue, conversionResult.detectedType);
                    }
                }
            };
        }
    }

    // --- Remove Button for Array Item ---
    const removeButton = itemContainer.createDiv({ cls: 'npe-button npe-button--remove', text: '×' });
    view.registerDomEvent(removeButton, 'click', () => {
        // Get current array from the frontmatter (like old JS version)
        const currentArray = getFrontmatterValue(app, fullKey.split('.').slice(0, -1).join('.'));
        if (Array.isArray(currentArray)) {
            currentArray.splice(index, 1);
            // Clear content of the value container and re-render (like old JS version)
            const valueContainer = itemContainer.parentElement;
            if (valueContainer) {
                valueContainer.empty();
                renderArrayValueContainer(view, valueContainer, currentArray as Array<FrontmatterValue>, fullKey.split('.').slice(0, -1).join('.'), level);
            }
            // Use standard updateProperties function
            if (view.currentFile) {
                // Set internal change flag BEFORE calling updateProperties
                if (view instanceof NestedPropertiesEditorView) {
                    view.setInternalChangeFlag();
                }
                updateProperties(view.app, view.currentFile, fullKey.split('.').slice(0, -1).join('.'), currentArray, 'array');
            }
        }
    });

    return itemContainer;
}
import { createEditableDiv } from "../elements/createEditableDiv";
import { renderArray } from "./renderArray";
import { renderObjectContainer } from "./renderObjectContainer";
import { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import type { FrontmatterValue, FrontmatterObject, FrontmatterPrimitive } from "../../../../types/core";



export function renderArrayValueContainer(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    valueContainer: HTMLElement,
    array: Array<FrontmatterValue>,
    fullKey: string,
    level: number = 0
) {
    const app = view.app;

    array.forEach((item, index) => {
        // Use the shared createSingleArrayItem function instead of duplicating logic
        const itemContainer = createSingleArrayItem(view, item, index, fullKey, level);
        valueContainer.appendChild(itemContainer);
    });

    // --- Add Button ---
    const addButton = valueContainer.createDiv({ cls: 'npe-button npe-button--add', text: '+' });
    view.registerDomEvent(addButton, 'click', () => {
        // Get current array from the frontmatter (like old JS version)
        const currentArray = getFrontmatterValue(app, fullKey);
        if (Array.isArray(currentArray)) {
            // Determine the appropriate data type and default value for the new item
            const { dataType, defaultValue } = determineNewArrayItemType(currentArray);
            logger.debug('Adding new array item', { dataType, defaultValue, arrayLength: currentArray.length });
            
            currentArray.push(defaultValue);
                            // Clear content of the value container and re-render (like old JS version)
                valueContainer.empty();
            renderArrayValueContainer(view, valueContainer, currentArray as Array<FrontmatterValue>, fullKey, level);
            // Use standard updateProperties function
            if (view.currentFile) {
                // Set internal change flag BEFORE calling updateProperties
                if (view instanceof NestedPropertiesEditorView) {
                    view.setInternalChangeFlag();
                }
                updateProperties(view.app, view.currentFile, fullKey, currentArray, 'array');
            }
        }
    });
}

/**
 * Adds a tooltip to array items showing their data type.
 * Only adds tooltip if the plugin setting is enabled.
 */
function addTypeTooltip(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    element: HTMLElement,
    dataType: string,
    value: FrontmatterValue
): void {
    const showTypeLabels = view.plugin?.settings?.npe?.showDataTypes || false;
    
    if (!showTypeLabels) {
        return;
    }

    // Don't show tooltips for arrays and objects as they're obvious from structure
    if (dataType === 'array' || dataType === 'object' || dataType === 'unknown') {
        return;
    }

    // Get display name for the type using unified function
    const displayName = getTypeDisplayName(dataType);
    const tooltipText = `Data type: ${displayName}`;
    
    // Add tooltip with 2 second delay to avoid interference with editing
    setTooltip(element, tooltipText, {
        delay: 2000,
        placement: 'top'
    });
}