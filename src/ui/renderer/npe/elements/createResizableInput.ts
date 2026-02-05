import { updateProperties } from "../utils/updateProperties";
import { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import type { FrontmatterPrimitive } from "../../../../types/core";

/**
 * Creates a resizable input field.
 * @param parent - The parent element to append the input field to.
 * @param fullKey - The full key of the input field, in dot notation.
 * @param value - The initial value of the input field.
 * @param inputType - The input type (e.g., "text", "checkbox").
 * @param dataType - The data type of the input field.
 * @param callback - The callback function to call when the input field is changed.
 * @returns The input field container element.
 */
export function createResizableInput(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    parent: HTMLElement,
    fullKey: string,
    value: FrontmatterPrimitive,
    inputType: string,
    dataType: string,
    callback: (input: HTMLInputElement) => void
): HTMLElement {
    const app = view.app;
    const file = view.currentFile;
    if (!file) return parent.createDiv({ text: "No file available" });

    const container = parent.createDiv({ cls: "resize-container" });

    const span = container.createEl("span", { cls: "resize-text", text: String(value) });

    const input = container.createEl("input", {
        type: inputType,
        value: inputType === "checkbox" ? undefined : String(value),
        attr: { "data-key": fullKey, "data-type": dataType },
    });
    input.className = "resize-input";
    if (inputType === "checkbox") {
        input.checked = Boolean(value);
    }

    // Add event listener to handle input events and resize the input field
    view.registerDomEvent(input, "input", () => {
        span.textContent = inputType === "checkbox" ? String(input.checked) : input.value;
    });

    // Initialize the span text content
    span.textContent = inputType === "checkbox" ? String(input.checked) : input.value;

    input.oninput = () => {
        callback(input);
        // Use standard updateProperties function
        if (view instanceof NestedPropertiesEditorView && view.currentFile) {
            updateProperties(view.app, view.currentFile, fullKey, inputType === "checkbox" ? input.checked : input.value, dataType);
        } else {
            updateProperties(app, file, fullKey, inputType === "checkbox" ? input.checked : input.value, dataType);
        }
    };

    return container;
}