export interface LabeledDateInputOptions {
    container: HTMLElement;
    label: string;
    defaultValue: string;
    onChangeCallback?: (value: string) => void; // Made optional
}

export class LabeledDateInput {
    private wrapper: HTMLElement;
    private input: HTMLInputElement;

    constructor(options: LabeledDateInputOptions) {
        const {
            container,
            label,
            defaultValue,
            onChangeCallback = (value) => value
        } = options;

        // Create the wrapper div
        this.wrapper = container.createDiv({ cls: "eln-modal-input-wrapper" });

        // Create the label
        this.wrapper.createEl("label", { text: label });

        // Create the date input field
        this.input = this.wrapper.createEl("input", { cls: "eln-modal-input" });
        this.input.setAttr("type", "date");
        this.input.setAttr("value", defaultValue); // Set the initial value of the date input

        // Register the onChange callback
        this.input.addEventListener("input", (event: Event) => {
            const value = (event.target as HTMLInputElement).value;
            try {
                onChangeCallback(value); // Attempt to call the provided callback
            } catch (error) {
                console.error(`Error in onChangeCallback for LabeledDateInput:`, error);
                onChangeCallback(value.trim()); // Fallback to default behavior
            }
        });
    }

    // Get the input element for further customization if needed
    getInput(): HTMLInputElement {
        return this.input;
    }

    // Get the wrapper element
    getWrapper(): HTMLElement {
        return this.wrapper;
    }

    // Set the value of the date input
    setValue(value: string) {
        this.input.value = value;
    }

    // Get the current value of the date input
    getValue(): string {
        return this.input.value;
    }
}