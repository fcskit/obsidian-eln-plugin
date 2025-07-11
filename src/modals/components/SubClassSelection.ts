import { App, DropdownComponent } from "obsidian";

export interface SubClassSelectionOptions {
    app: App;
    container: HTMLElement;
    label: string;
    options: string[];
    defaultValue?: string;
    onChangeCallback: (value: string) => void;
}

export class SubClassSelection {
    private dropdown: DropdownComponent;

    constructor(opts: SubClassSelectionOptions) {
        const { container, label, options, defaultValue, onChangeCallback } = opts;
        console.debug("SubClassSelection: Initializing with options:", {
            label,
            options,
            defaultValue,
            onChangeCallback,
        });
        const wrapper = container.createDiv({ cls: "eln-modal-dropdown-wrapper" });
        wrapper.createEl("label", { text: label });

        this.dropdown = new DropdownComponent(wrapper);
        this.dropdown.addOptions(Object.fromEntries(options.map(opt => [opt, opt])));
        if (defaultValue && options.includes(defaultValue)) {
            this.dropdown.setValue(defaultValue);
        } else if (options.length > 0) {
            this.dropdown.setValue(options[0]);
        }
        this.dropdown.onChange(onChangeCallback);
    }

    setValue(value: string) {
        this.dropdown.setValue(value);
    }

    getValue(): string {
        return this.dropdown.getValue();
    }
}