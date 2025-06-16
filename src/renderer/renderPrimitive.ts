import { setIcon } from "obsidian";
import type { NestedPropertiesEditorView } from "views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "views/NestedPropertiesEditor";
import { getPropertyIcon } from "./getPropertyIcon";
import { getPropertyInputType } from "./getPropertyInputType";
import { updateProperties } from "./updateProperties";
import { changeKeyName } from "./changeKeyName";
import { getFrontmatterValue } from "./getFrontmatterValue";
import { createInternalLinkElement } from "./createInternalLinkElement";
import { createExternalLinkElement } from "./createExternalLinkElement";
import { latexToHTML } from "./latexToHTML";
import { showTypeSwitchMenu } from "./showTypeSwitchMenu";
import { addKeyWrapperResizeHandle } from "./addKeyWrapperResizeHandle";

/**
 * Render a primitive value (string, number, boolean, link, etc.) as an editable row.
 */
export function renderPrimitive(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    key: string,
    value: string | number | boolean | null,
    parent: HTMLElement,
    level: number,
    fullKey: string,
    isKeyOfArrayObject = false,
    update = false
): void {
    const app = view.app;
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
            await changeKeyName(app, oldFullKey, newKey);
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
            let val = getFrontmatterValue(app, fullKey);
            if (typeof val === "string" && val.startsWith("$") && val.endsWith("$")) {
                val = val.slice(1, -1);
            }
            latexDiv.innerHTML = val;
            latexDiv.contentEditable = "true";
            latexDiv.focus();
        });
        view.registerDomEvent(latexDiv,"blur", () => {
            const newValue = latexDiv.textContent || "";
            fullKey = container.getAttribute("data-key") || fullKey;
            updateProperties(view, fullKey, newValue, "latex");
            latexDiv.innerHTML = latexToHTML(newValue);
            latexDiv.contentEditable = "false";
        });
    } else if (inputType) {
        // Render as input
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
            updateProperties(view, fullKey, inputType === "checkbox" ? input.checked : input.value, dataType);
            // Optionally update label if this is a key of an array object
            if (isKeyOfArrayObject && key === "name") {
                const objectFullKey = fullKey.split(".").slice(0, -1).join(".");
                const objectItemContainer = parent.closest(`.npe-object-container[data-key="${objectFullKey}"]`);
                const objectKeyLabelDiv = objectItemContainer?.querySelector('.npe-object-key-label');
                if (objectKeyLabelDiv) (objectKeyLabelDiv as HTMLElement).textContent = input.value;
            }
        });
    } else {
        valueDiv.textContent = value !== null ? value.toString() : "";
    }

    // --- Remove Button ---
    const removeButton = container.createDiv({ cls: "npe-button npe-button--remove", text: "×" });
    view.registerDomEvent(removeButton, "click", () => {
        updateProperties(view, fullKey, undefined, "undefined");
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
    value: string | number | boolean | null
): {
    dataType: string;
    inputType?: string;
    inputValue: string | number | boolean | null;
    icon: string;
    callback?: (input: string | number | boolean | null) => void;
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
    const callback = (input: string | number | boolean | null) => {
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

function parsePrimitiveValue(dataType: string, value: string | number | boolean | null): string | number | boolean | null {
    const valueTransform: Record<ValueTransformKey, (v: any) => any> = {
        string: (v: string) => v,
        number: (v: string) => parseFloat(v),
        boolean: (v: boolean) => v ? 'checked' : '',
        link: (v: string) => v.startsWith("[[") && v.endsWith("]]") ? v.slice(2, -2) : v,
        'external-link': (v: string) => v,
        date: (v: string) => v,
        latex: (v: string) => v.startsWith("$") && v.endsWith("$") ? v.slice(1, -1) : v,
        unknown: (v: string) => v,
    };
    if ((dataType as ValueTransformKey) in valueTransform) {
        return valueTransform[dataType as ValueTransformKey](value as any);
    } else {
        console.warn(`Unknown data type: ${dataType}. Returning value as is.`);
        return value as string | number | boolean | null;
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
