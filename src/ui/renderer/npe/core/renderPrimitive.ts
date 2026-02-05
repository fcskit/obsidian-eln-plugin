import { setIcon } from "obsidian";
import type { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import type { FrontmatterPrimitive, Primitive } from "../../../../types/core";
import { getPropertyIcon } from "../helpers/getPropertyIcon";
import { getPropertyInputType } from "../helpers/getPropertyInputType";
import { updateProperties } from "../utils/updateProperties";
import { changeKeyName } from "../utils/changeKeyName";
import { getFrontmatterValue } from "../helpers/getFrontmatterValue";
import { createInternalLinkElement } from "../elements/createInternalLinkElement";
import { createExternalLinkElement } from "../elements/createExternalLinkElement";
import { latexToHTML } from "../../components/latexToHTML";
import { showTypeSwitchMenu } from "../helpers/showTypeSwitchMenu";
import { addKeyWrapperResizeHandle } from "../helpers/addKeyWrapperResizeHandle";
import { createEditableDiv, getEditableDivValue } from "../elements/createEditableDiv";

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
            // Update the key in the frontmatter
            await changeKeyName(app, file, oldFullKey, newKey);
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
        // Render LaTeX as HTML, allow editing on click
        const latexDiv = valueDiv.createDiv({ cls: "npe-latex" });
        latexDiv.innerHTML = latexToHTML(inputValue as string);
        fullKey = container.getAttribute("data-key") || fullKey;
        view.registerDomEvent(latexDiv, "click", () => {
            const val = getFrontmatterValue(app, fullKey);
            let stringVal = "";
            if (typeof val === "string") {
                stringVal = val.startsWith("$") && val.endsWith("$") ? val.slice(1, -1) : val;
            } else if (val != null) {
                stringVal = String(val);
            }
            latexDiv.innerHTML = stringVal;
            latexDiv.contentEditable = "true";
            latexDiv.focus();
        });
        view.registerDomEvent(latexDiv,"blur", () => {
            const newValue = latexDiv.textContent || "";
            fullKey = container.getAttribute("data-key") || fullKey;
            if (view.currentFile) {
                // Use internal update to prevent full re-render for individual value changes
                if ('updatePropertiesInternal' in view && typeof view.updatePropertiesInternal === 'function') {
                    view.updatePropertiesInternal(fullKey, newValue, "latex");
                } else {
                    updateProperties(view.app, view.currentFile, fullKey, newValue, "latex");
                }
            }
            latexDiv.innerHTML = latexToHTML(newValue);
            latexDiv.contentEditable = "false";
        });
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
                    fullKey = container.getAttribute("data-key") || fullKey;
                    if (view.currentFile) {
                        // Use internal update to prevent full re-render for individual value changes
                        if ('updatePropertiesInternal' in view && typeof view.updatePropertiesInternal === 'function') {
                            view.updatePropertiesInternal(fullKey, newValue, dataType);
                        } else {
                            updateProperties(view.app, view.currentFile, fullKey, newValue, dataType);
                        }
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
                    // Use internal update to prevent full re-render for individual value changes
                    if ('updatePropertiesInternal' in view && typeof view.updatePropertiesInternal === 'function') {
                        view.updatePropertiesInternal(fullKey, inputType === "checkbox" ? input.checked : input.value, dataType);
                    } else {
                        updateProperties(view.app, view.currentFile, fullKey, inputType === "checkbox" ? input.checked : input.value, dataType);
                    }
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

    // --- Remove Button ---
    const removeButton = container.createDiv({ cls: "npe-button npe-button--remove", text: "×" });
    view.registerDomEvent(removeButton, "click", () => {
        if (view.currentFile) {
            // Use internal update to prevent full re-render for removal operations
            if ('updatePropertiesInternal' in view && typeof view.updatePropertiesInternal === 'function') {
                view.updatePropertiesInternal(fullKey, undefined, "undefined");
            } else {
                updateProperties(view.app, view.currentFile, fullKey, undefined, "undefined");
            }
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
    let dataType: string = typeof value;
    if (dataType === 'string') { 
        dataType = detectStringType(value as string);
    }

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
            console.warn(`Unknown data type: ${dataType}. Input not processed.`);
        }
    };

    return { dataType, inputType, inputValue, icon, callback };
}

type ValueTransformKey = 'string' | 'number' | 'boolean' | 'link' | 'external-link' | 'date' | 'latex' | 'unknown';

function parsePrimitiveValue(dataType: string, value: FrontmatterPrimitive): FrontmatterPrimitive {
    const valueTransform: Record<ValueTransformKey, (v: FrontmatterPrimitive) => FrontmatterPrimitive> = {
        string: (v: FrontmatterPrimitive) => String(v ?? ''),
        number: (v: FrontmatterPrimitive) => typeof v === 'string' ? parseFloat(v) : Number(v ?? 0),
        boolean: (v: FrontmatterPrimitive) => Boolean(v),
        link: (v: FrontmatterPrimitive) => {
            const str = String(v ?? '');
            return str.startsWith("[[") && str.endsWith("]]") ? str.slice(2, -2) : str;
        },
        'external-link': (v: FrontmatterPrimitive) => String(v ?? ''),
        date: (v: FrontmatterPrimitive) => String(v ?? ''),
        latex: (v: FrontmatterPrimitive) => {
            const str = String(v ?? '');
            return str.startsWith("$") && str.endsWith("$") ? str.slice(1, -1) : str;
        },
        unknown: (v: FrontmatterPrimitive) => String(v ?? ''),
    };
    if ((dataType as ValueTransformKey) in valueTransform) {
        return valueTransform[dataType as ValueTransformKey](value);
    } else {
        console.warn(`Unknown data type: ${dataType}. Returning value as is.`);
        return value;
    }
}

function detectStringType(value: string): string  {
    let strType: string;

    if (value.startsWith("[[") && value.endsWith("]]")) {
        strType = "link";
        value = value.slice(2, -2);
    } else if (/^\[.*\]\(.*\)$/.test(value)) {
        strType = "external-link";
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        strType = "date";
    } else if (/^\$.*\$$/.test(value)) {
        strType = "latex";
        value = value.slice(1, -1);
    } else {
        strType = "string";
    }

    return strType
}
