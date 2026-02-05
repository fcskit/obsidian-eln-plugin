import { setIcon } from "obsidian";
import { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import type { FrontmatterPrimitive, Primitive } from "../../../../types/core";
import { getPropertyIcon } from "../helpers/getPropertyIcon";
import { getPropertyInputType } from "../helpers/getPropertyInputType";
import { createLogger } from "../../../../utils/Logger";
import { updateProperties } from "../utils/updateProperties";
import { changeKeyName } from "../utils/changeKeyName";
import { createInternalLinkElement } from "../elements/createInternalLinkElement";
import { createExternalLinkElement } from "../elements/createExternalLinkElement";
import { createLatexElement } from "../elements/createLatexElement";
import { showTypeSwitchMenu } from "../helpers/showTypeSwitchMenu";
import { addKeyWrapperResizeHandle } from "../helpers/addKeyWrapperResizeHandle";
import { createEditableDiv } from "../elements/createEditableDiv";
import { createTypeLabel } from "../helpers/createTypeLabel";
import { getDataType, parsePrimitiveValue } from "../helpers/getDataType";

const logger = createLogger('npe');

/**
 * Render a primitive value (string, number, boolean, link, etc.) as an editable row.
 */
export function renderPrimitive(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    key: string,
    value: FrontmatterPrimitive,
    parent: HTMLElement,
    level: number,
    fullKey: string,
    isKeyOfArrayObject = false,
    update = false
): void {
    const app = view.app;
    const file = view.currentFile;
    if (!file) return;
    const { dataType, inputType, inputValue, icon, callback } = getPrimitiveDetails(key, value);

    const container = update ? parent : parent.createDiv({ cls: "npe-key-value-container" });
    container.setAttribute("data-level", level.toString());
    container.setAttribute("data-key", fullKey);
    container.setAttribute("data-type", dataType);

    // --- Key (label, icon, editable) ---
    const keyWrapper = container.createDiv({ cls: "npe-primitive npe-key-wrapper" });
    keyWrapper.style.setProperty("--npe-data-level", level.toString());
    const keyDiv = keyWrapper.createDiv({ cls: "npe-key npe-primitive" });
    if (icon) {
        const iconDiv = keyDiv.createDiv({ cls: "npe-key-icon" });
        setIcon(iconDiv, icon);
    }
    const keyLabelDiv = keyDiv.createDiv({ cls: "npe-key-label npe-primitive npe-editable-key", text: key });
    keyLabelDiv.style.setProperty("--npe-data-level", level.toString());
    keyLabelDiv.contentEditable = "true";
    view.registerDomEvent(keyLabelDiv, "blur", async () => {
        const newKey = keyLabelDiv.textContent?.trim();
        if (newKey && newKey !== key) {
            
            // If the key of the parent object has been renamed, the fullKey variable may
            // no longer point to the correct object in the frontmatter.
            // Therefore we need to update the fullKey from the data-key attribute of the container
            const oldFullKey = container.getAttribute("data-key") || fullKey;
            fullKey = oldFullKey.split(".").slice(0, -1).concat(newKey).join(".");
            
            // Update the key in the frontmatter using standard changeKeyName function
            if (view instanceof NestedPropertiesEditorView && view.currentFile) {
                await changeKeyName({ app: view.app, file: view.currentFile, key: oldFullKey, newKeyName: newKey, view });
            } else if (file) {
                // Fallback for code block view
                await changeKeyName({ app, file, key: oldFullKey, newKeyName: newKey });
            }
            // Update the key and fullKey variables and the data-key attribute
            key = newKey;
            container.setAttribute("data-key", fullKey);
        }
    });

    // --- Add resize handle for key wrapper ---
    const npeViewContainer = container.closest(".npe-view-container");
    if (npeViewContainer) {
        addKeyWrapperResizeHandle(view, keyWrapper, npeViewContainer as HTMLElement);
    }

    // --- Value ---
    const valueDiv = container.createDiv({ cls: "npe-value" });
    valueDiv.setAttribute("data-type", dataType);

    if (dataType === "external-link") {
        createExternalLinkElement(view, inputValue as string, valueDiv, fullKey);
    } else if (dataType === "link") {
        createInternalLinkElement(view, inputValue as string, valueDiv, fullKey);
    } else if (dataType === "latex") {
        // Use unified LaTeX element for consistent rendering with \mathsf{} wrapping
        createLatexElement(view, inputValue as string, valueDiv, fullKey);
    } else if (inputType) {
        // Use editable divs for text/number inputs, HTML inputs for date/checkbox
        if (inputType === "text" || inputType === "number") {
            // Create editable div for text and number inputs
            const editableDiv = createEditableDiv(
                valueDiv,
                String(inputValue),
                `Enter ${inputType === "number" ? "number" : "text"}...`,
                inputType,
                (newValue) => {
                    if (callback) {
                        callback(newValue);
                    }
                    logger.debug(`Editable div callback: ${fullKey} = ${newValue} (${dataType})`);
                    fullKey = container.getAttribute("data-key") || fullKey;
                    
                    if (view.currentFile) {
                        // Set internal change flag BEFORE calling updateProperties
                        if (view instanceof NestedPropertiesEditorView) {
                            view.setInternalChangeFlag();
                        }
                        // Use standard updateProperties function
                        updateProperties(view.app, view.currentFile, fullKey, newValue, dataType);
                    }
                    // Optionally update label if this is a key of an array object
                    if (isKeyOfArrayObject && key === "name") {
                        const objectFullKey = fullKey.split(".").slice(0, -1).join(".");
                        const objectItemContainer = parent.closest(`.npe-object-container[data-key="${objectFullKey}"]`);
                        const objectKeyLabelDiv = objectItemContainer?.querySelector('.npe-key-label.npe-object');
                        if (objectKeyLabelDiv) (objectKeyLabelDiv as HTMLElement).textContent = newValue;
                    }
                }
            );
            editableDiv.setAttribute("data-key", fullKey);
            editableDiv.setAttribute("data-type", dataType);
        } else {
            // Use traditional HTML input for date, checkbox, and other input types
            const input = valueDiv.createEl("input", {
                type: inputType,
                value: inputType === "checkbox" ? undefined : String(inputValue),
                attr: { "data-key": fullKey, "data-type": dataType }
            });
            if (inputType === "checkbox") input.checked = !!inputValue;
            view.registerDomEvent(input, "blur", () => {
                if (callback) {
                    callback(inputType === "checkbox" ? input.checked : input.value);
                }
                fullKey = container.getAttribute("data-key") || fullKey;
                if (view.currentFile) {
                    // Set internal change flag BEFORE calling updateProperties
                    if (view instanceof NestedPropertiesEditorView) {
                        view.setInternalChangeFlag();
                    }
                    // Use standard updateProperties function
                    updateProperties(view.app, view.currentFile, fullKey, inputType === "checkbox" ? input.checked : input.value, dataType);
                }
                // Optionally update label if this is a key of an array object
                if (isKeyOfArrayObject && key === "name") {
                    const objectFullKey = fullKey.split(".").slice(0, -1).join(".");
                    const objectItemContainer = parent.closest(`.npe-object-container[data-key="${objectFullKey}"]`);
                    const objectKeyLabelDiv = objectItemContainer?.querySelector('.npe-key-label.npe-object');
                    if (objectKeyLabelDiv) (objectKeyLabelDiv as HTMLElement).textContent = input.value;
                }
            });
        }
    } else {
        valueDiv.textContent = value !== null ? value.toString() : "";
    }

    // --- Type Label (if enabled in settings) ---
    const showTypeLabels = view.plugin?.settings?.npe?.showDataTypes || false;
    const typeLabel = createTypeLabel(value, showTypeLabels);
    if (typeLabel) {
        container.appendChild(typeLabel);
    }

    // --- Remove Button ---
    const removeButton = container.createDiv({ cls: "npe-button npe-button--remove", text: "×" });
    view.registerDomEvent(removeButton, "click", () => {
        if (view.currentFile) {
            // Set internal change flag BEFORE calling updateProperties
            if (view instanceof NestedPropertiesEditorView) {
                view.setInternalChangeFlag();
            }
            // Use standard updateProperties function for removal
            updateProperties(view.app, view.currentFile, fullKey, undefined, "undefined");
        }
        container.remove();
    });

    // --- Type Switch Button ---
    const optionsButton = keyWrapper.createDiv({ cls: "npe-button npe-button--options" });
    setIcon(optionsButton, "ellipsis");
    view.registerDomEvent(optionsButton, "click", () => {
        showTypeSwitchMenu(view, container, key, fullKey, level, isKeyOfArrayObject);
    });
}

// --- Your improved getPrimitiveDetails and helpers below ---

function getPrimitiveDetails(
    key: string,
    value: FrontmatterPrimitive
): {
    dataType: string;
    inputType?: string;
    inputValue: FrontmatterPrimitive;
    icon: string;
    callback?: (input: FrontmatterPrimitive) => void;
} {
    const dataType: string = getDataType(value);

    const inputType = getPropertyInputType(dataType);
    let inputValue = parsePrimitiveValue(dataType, value);
    if (inputValue === null) {
        inputValue = '';
    }
    const icon = getPropertyIcon(key, dataType);
    // Define a input callback function for the dataType to handle input changes
    const callback = (input: Primitive) => {
        // Handle the input change based on the dataType
        if (dataType === 'boolean') {
            inputValue = input ? 'checked' : '';
        } else if (dataType === 'number') {
            inputValue = parseFloat(input as string);
        } else if (dataType === 'string' || dataType === 'link' || dataType === 'external-link' || dataType === 'date' || dataType === 'latex') {
            inputValue = input as string;
        } else {
            logger.warn(`Unknown data type: ${dataType}. Input not processed.`);
        }
    };

    return { dataType, inputType, inputValue, icon, callback };
}


