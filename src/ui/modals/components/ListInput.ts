import { TextComponent } from "obsidian";

/* The ListInput class provides a labeled text input component
 * that can be used in Obsidian modals or other UI components for
 * list inputs. The input values shold be separated by commas.
*/
export interface ListInputOptions {
    container: HTMLElement;
    label: string;
    defaultValue: string;
    dataType?: string; // Optional, used to specify the type of data expected
    onChangeCallback?: (value: string) => void; // Made optional
    fieldKey?: string;
}

export class ListInput {
    private wrapper: HTMLElement;
    private input: TextComponent;

    constructor(options: ListInputOptions) {
        const {
            container,
            label,
            defaultValue,
            dataType = "text", // Default to "text" if not provided
            onChangeCallback = (value) => {
                if (dataType === "number") {
                    return value.split(",").map(item => parseFloat(item.trim()));
                } else if (dataType === "boolean") {
                    return value.split(",").map(item => item.trim().toLowerCase() === "true");
                }
                return value.split(",").map(item => item.trim());
            },
            fieldKey = null,
        } = options;

        // Create the wrapper div
        this.wrapper = container.createDiv({ cls: "eln-modal-input-wrapper", attr: { "data-type": "text" } });

        // Create the label
        this.wrapper.createEl("label", { text: label });

        // Create the input field
        this.input = new TextComponent(this.wrapper);
        this.input.setPlaceholder(defaultValue);
        this.input.setValue(defaultValue); // Set the initial value of the input field
        this.input.onChange((value) => {
            try {
                onChangeCallback(value); // Attempt to call the provided callback
            } catch (error) {
                console.error(`Error in onChangeCallback for field "${fieldKey}":`, error);
                onChangeCallback(value.trim()); // Fallback to default behavior
            }
        });
    }

    // Get the input component for further customization if needed
    getInput(): TextComponent {
        return this.input;
    }

    // Get the wrapper element
    getWrapper(): HTMLElement {
        return this.wrapper;
    }

    // Set the value of the input field
    setValue(value: string): void {
        this.input.setValue(value);
    }
}