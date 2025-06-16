import { TextComponent, ButtonComponent } from "obsidian";

export interface LabeledTextInputOptions {
    container: HTMLElement;
    label: string;
    defaultValue: string;
    onChangeCallback?: (value: string) => void; // Made optional
    actionButton?: boolean;
    actionCallback?: (value: string) => void;
    actionButtonIcon?: string;
    actionButtonTooltip?: string;
    fieldKey?: string;
}

export class LabeledTextInput {
    private wrapper: HTMLElement;
    private input: TextComponent;
    private actionButtonEl?: ButtonComponent;

    constructor(options: LabeledTextInputOptions) {
        const {
            container,
            label,
            defaultValue,
            onChangeCallback = (value) => value.trim(), // Default callback
            actionButton = false,
            actionCallback = null,
            actionButtonIcon = "play",
            actionButtonTooltip = null,
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

        // Optionally create the action button
        if (actionButton) {
            this.actionButtonEl = new ButtonComponent(this.wrapper);
            this.actionButtonEl.setIcon(actionButtonIcon);
            this.actionButtonEl.onClick(() => {
                const inputValue = this.input.getValue(); // Get the current value of the input field
                if (fieldKey) {
                    console.log(`Action button clicked for field: ${fieldKey}, with value: ${inputValue}`);
                }
                if (actionCallback) {
                    console.log(`Executing action callback function: ${actionCallback}`);
                    actionCallback(inputValue); // Pass the input value to the action callback
                }
            });
            if (actionButtonTooltip) {
                this.actionButtonEl.setTooltip(actionButtonTooltip);
            }
        }
    }

    // Get the input component for further customization if needed
    getInput(): TextComponent {
        return this.input;
    }

    // Get the wrapper element
    getWrapper(): HTMLElement {
        return this.wrapper;
    }

    // Get the action button component (if it exists)
    getActionButton(): ButtonComponent | undefined {
        return this.actionButtonEl;
    }

    // Set the value of the input field
    setValue(value: string): void {
        this.input.setValue(value);
    }
}