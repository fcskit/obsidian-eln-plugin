import { TextComponent } from "obsidian";

export interface SimpleTextInputOptions {
    container: HTMLElement;
    label: string;
    defaultValue: string;
    placeholder?: string;
    onChangeCallback?: (value: string) => void;
}

/**
 * Simple text input for nested structures with left label, right input layout
 * Used within container sections for a clean inline appearance
 */
export class SimpleTextInput {
    private wrapper: HTMLElement;
    private input: TextComponent;

    constructor(options: SimpleTextInputOptions) {
        const {
            container,
            label,
            defaultValue,
            placeholder,
            onChangeCallback = (value) => value.trim(),
        } = options;

        // Create simple inline wrapper
        this.wrapper = container.createDiv({ cls: "eln-simple-input" });

        // Create label
        this.wrapper.createEl("label", { cls: "eln-simple-label", text: label });

        // Create input field
        this.input = new TextComponent(this.wrapper);
        this.input.inputEl.addClass("eln-simple-field");
        this.input.setPlaceholder(placeholder || defaultValue || `Enter ${label.toLowerCase()}...`);
        this.input.setValue(defaultValue);
        this.input.onChange((value) => {
            try {
                onChangeCallback(value);
            } catch (error) {
                console.error(`Error in onChangeCallback for SimpleTextInput:`, error);
                onChangeCallback(value.trim());
            }
        });
    }

    getInput(): TextComponent {
        return this.input;
    }

    getWrapper(): HTMLElement {
        return this.wrapper;
    }

    getValue(): string {
        return this.input.getValue();
    }

    setValue(value: string): void {
        this.input.setValue(value);
    }
}
