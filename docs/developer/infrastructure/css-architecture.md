# CSS Architecture

The CSS Architecture for the Obsidian ELN Plugin follows a modular, component-based approach designed for maintainability, reusability, and seamless integration with Obsidian's theming system.

## 🏗️ Architecture Overview

```css
┌─────────────────────────────────────────────────────┐
│                CSS Architecture                     │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │  Base Styles    │  │      Component Styles       ││
│  │  • Reset        │  │      • UI Components        ││
│  │  • Variables    │  │      • Form Elements        ││
│  │  • Typography  │  │      • Layout Modules       ││
│  └─────────────────┘  └─────────────────────────────┘│
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │  Theme System   │  │       Utilities             ││
│  │  • Light Theme  │  │       • Helpers             ││
│  │  • Dark Theme   │  │       • Responsive          ││
│  │  • Variables    │  │       • Animations          ││
│  └─────────────────┘  └─────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
src/styles/
├── base/
│   ├── reset.css           # CSS reset and normalization
│   ├── variables.css       # CSS custom properties
│   └── typography.css      # Typography system
├── components/
│   ├── buttons.css         # Button components
│   ├── forms.css          # Form elements
│   ├── modals.css         # Modal dialogs
│   ├── inputs.css         # Input components
│   ├── dropdowns.css      # Dropdown components
│   ├── lists.css          # List components
│   ├── tables.css         # Table components
│   └── icons.css          # Icon components
├── layouts/
│   ├── grid.css           # Grid system
│   ├── flexbox.css        # Flexbox utilities
│   └── containers.css     # Container layouts
├── themes/
│   ├── light.css          # Light theme variables
│   ├── dark.css           # Dark theme variables
│   └── obsidian.css       # Obsidian integration
├── utilities/
│   ├── spacing.css        # Margin/padding utilities
│   ├── sizing.css         # Width/height utilities
│   ├── colors.css         # Color utilities
│   ├── text.css           # Text utilities
│   ├── visibility.css     # Display utilities
│   └── animations.css     # Animation utilities
└── main.css               # Main entry point
```

## 🎨 CSS Variables System

### Base Variables

```css
/* base/variables.css */
:root {
    /* Color System */
    --eln-primary-50: #f0f9ff;
    --eln-primary-100: #e0f2fe;
    --eln-primary-200: #bae6fd;
    --eln-primary-300: #7dd3fc;
    --eln-primary-400: #38bdf8;
    --eln-primary-500: #0ea5e9;
    --eln-primary-600: #0284c7;
    --eln-primary-700: #0369a1;
    --eln-primary-800: #075985;
    --eln-primary-900: #0c4a6e;
    
    --eln-gray-50: #f9fafb;
    --eln-gray-100: #f3f4f6;
    --eln-gray-200: #e5e7eb;
    --eln-gray-300: #d1d5db;
    --eln-gray-400: #9ca3af;
    --eln-gray-500: #6b7280;
    --eln-gray-600: #4b5563;
    --eln-gray-700: #374151;
    --eln-gray-800: #1f2937;
    --eln-gray-900: #111827;
    
    /* Semantic Colors */
    --eln-success: #10b981;
    --eln-warning: #f59e0b;
    --eln-error: #ef4444;
    --eln-info: #3b82f6;
    
    /* Typography */
    --eln-font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --eln-font-family-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    
    --eln-font-size-xs: 0.75rem;
    --eln-font-size-sm: 0.875rem;
    --eln-font-size-base: 1rem;
    --eln-font-size-lg: 1.125rem;
    --eln-font-size-xl: 1.25rem;
    --eln-font-size-2xl: 1.5rem;
    --eln-font-size-3xl: 1.875rem;
    
    --eln-font-weight-normal: 400;
    --eln-font-weight-medium: 500;
    --eln-font-weight-semibold: 600;
    --eln-font-weight-bold: 700;
    
    --eln-line-height-tight: 1.25;
    --eln-line-height-normal: 1.5;
    --eln-line-height-relaxed: 1.625;
    
    /* Spacing */
    --eln-space-0: 0;
    --eln-space-1: 0.25rem;
    --eln-space-2: 0.5rem;
    --eln-space-3: 0.75rem;
    --eln-space-4: 1rem;
    --eln-space-5: 1.25rem;
    --eln-space-6: 1.5rem;
    --eln-space-8: 2rem;
    --eln-space-10: 2.5rem;
    --eln-space-12: 3rem;
    --eln-space-16: 4rem;
    --eln-space-20: 5rem;
    
    /* Border Radius */
    --eln-radius-none: 0;
    --eln-radius-sm: 0.125rem;
    --eln-radius-default: 0.25rem;
    --eln-radius-md: 0.375rem;
    --eln-radius-lg: 0.5rem;
    --eln-radius-xl: 0.75rem;
    --eln-radius-2xl: 1rem;
    --eln-radius-full: 9999px;
    
    /* Shadows */
    --eln-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --eln-shadow-default: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    --eln-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --eln-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --eln-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    
    /* Z-Index */
    --eln-z-dropdown: 1000;
    --eln-z-sticky: 1020;
    --eln-z-fixed: 1030;
    --eln-z-modal-backdrop: 1040;
    --eln-z-modal: 1050;
    --eln-z-popover: 1060;
    --eln-z-tooltip: 1070;
    
    /* Transitions */
    --eln-transition-fast: 150ms ease-in-out;
    --eln-transition-normal: 300ms ease-in-out;
    --eln-transition-slow: 500ms ease-in-out;
    
    /* Breakpoints (for JavaScript use) */
    --eln-breakpoint-sm: 640px;
    --eln-breakpoint-md: 768px;
    --eln-breakpoint-lg: 1024px;
    --eln-breakpoint-xl: 1280px;
}
```

### Theme Integration

```css
/* themes/obsidian.css */
/* Integration with Obsidian's theme system */

.theme-light {
    --eln-bg-primary: var(--background-primary);
    --eln-bg-secondary: var(--background-secondary);
    --eln-bg-modifier-hover: var(--background-modifier-hover);
    --eln-bg-modifier-active: var(--background-modifier-active-hover);
    
    --eln-text-primary: var(--text-normal);
    --eln-text-secondary: var(--text-muted);
    --eln-text-accent: var(--text-accent);
    
    --eln-border-primary: var(--background-modifier-border);
    --eln-border-hover: var(--background-modifier-border-hover);
    --eln-border-focus: var(--background-modifier-border-focus);
    
    --eln-accent: var(--interactive-accent);
    --eln-accent-hover: var(--interactive-accent-hover);
}

.theme-dark {
    --eln-bg-primary: var(--background-primary);
    --eln-bg-secondary: var(--background-secondary);
    --eln-bg-modifier-hover: var(--background-modifier-hover);
    --eln-bg-modifier-active: var(--background-modifier-active-hover);
    
    --eln-text-primary: var(--text-normal);
    --eln-text-secondary: var(--text-muted);
    --eln-text-accent: var(--text-accent);
    
    --eln-border-primary: var(--background-modifier-border);
    --eln-border-hover: var(--background-modifier-border-hover);
    --eln-border-focus: var(--background-modifier-border-focus);
    
    --eln-accent: var(--interactive-accent);
    --eln-accent-hover: var(--interactive-accent-hover);
}

/* Plugin-specific overrides */
.eln-plugin {
    color-scheme: light dark;
}

.theme-dark .eln-plugin {
    /* Dark theme specific adjustments */
    --eln-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
    --eln-shadow-default: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3);
    --eln-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
}
```

## 🧩 Component Styles

### Button Components

```css
/* components/buttons.css */
.eln-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--eln-space-2);
    padding: var(--eln-space-2) var(--eln-space-4);
    border: 1px solid transparent;
    border-radius: var(--eln-radius-default);
    font-family: var(--eln-font-family-sans);
    font-size: var(--eln-font-size-sm);
    font-weight: var(--eln-font-weight-medium);
    line-height: var(--eln-line-height-tight);
    text-decoration: none;
    cursor: pointer;
    transition: all var(--eln-transition-fast);
    user-select: none;
    white-space: nowrap;
    
    /* Focus styles */
    &:focus {
        outline: 2px solid var(--eln-accent);
        outline-offset: 2px;
    }
    
    /* Disabled styles */
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
    }
}

/* Button Variants */
.eln-btn--primary {
    background-color: var(--eln-accent);
    border-color: var(--eln-accent);
    color: var(--text-on-accent);
    
    &:hover:not(:disabled) {
        background-color: var(--eln-accent-hover);
        border-color: var(--eln-accent-hover);
    }
}

.eln-btn--secondary {
    background-color: var(--eln-bg-secondary);
    border-color: var(--eln-border-primary);
    color: var(--eln-text-primary);
    
    &:hover:not(:disabled) {
        background-color: var(--eln-bg-modifier-hover);
        border-color: var(--eln-border-hover);
    }
}

.eln-btn--outline {
    background-color: transparent;
    border-color: var(--eln-accent);
    color: var(--eln-accent);
    
    &:hover:not(:disabled) {
        background-color: var(--eln-accent);
        color: var(--text-on-accent);
    }
}

.eln-btn--ghost {
    background-color: transparent;
    border-color: transparent;
    color: var(--eln-text-primary);
    
    &:hover:not(:disabled) {
        background-color: var(--eln-bg-modifier-hover);
    }
}

.eln-btn--danger {
    background-color: var(--eln-error);
    border-color: var(--eln-error);
    color: white;
    
    &:hover:not(:disabled) {
        background-color: color-mix(in srgb, var(--eln-error) 80%, black);
        border-color: color-mix(in srgb, var(--eln-error) 80%, black);
    }
}

/* Button Sizes */
.eln-btn--xs {
    padding: var(--eln-space-1) var(--eln-space-2);
    font-size: var(--eln-font-size-xs);
}

.eln-btn--sm {
    padding: var(--eln-space-1) var(--eln-space-3);
    font-size: var(--eln-font-size-sm);
}

.eln-btn--lg {
    padding: var(--eln-space-3) var(--eln-space-6);
    font-size: var(--eln-font-size-lg);
}

.eln-btn--xl {
    padding: var(--eln-space-4) var(--eln-space-8);
    font-size: var(--eln-font-size-xl);
}

/* Button States */
.eln-btn--loading {
    position: relative;
    pointer-events: none;
    
    &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 1rem;
        height: 1rem;
        margin: -0.5rem 0 0 -0.5rem;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        animation: eln-spin 1s linear infinite;
    }
    
    > * {
        opacity: 0;
    }
}

/* Icon buttons */
.eln-btn--icon {
    padding: var(--eln-space-2);
    aspect-ratio: 1;
    
    &.eln-btn--sm {
        padding: var(--eln-space-1);
    }
    
    &.eln-btn--lg {
        padding: var(--eln-space-3);
    }
}

/* Button groups */
.eln-btn-group {
    display: inline-flex;
    
    .eln-btn {
        border-radius: 0;
        margin-left: -1px;
        
        &:first-child {
            border-top-left-radius: var(--eln-radius-default);
            border-bottom-left-radius: var(--eln-radius-default);
            margin-left: 0;
        }
        
        &:last-child {
            border-top-right-radius: var(--eln-radius-default);
            border-bottom-right-radius: var(--eln-radius-default);
        }
        
        &:hover,
        &:focus {
            z-index: 1;
        }
    }
}
```

### Form Components

```css
/* components/forms.css */
.eln-form {
    display: flex;
    flex-direction: column;
    gap: var(--eln-space-4);
}

.eln-form-group {
    display: flex;
    flex-direction: column;
    gap: var(--eln-space-2);
}

.eln-form-group--horizontal {
    flex-direction: row;
    align-items: center;
    
    .eln-label {
        margin-bottom: 0;
        margin-right: var(--eln-space-4);
        flex-shrink: 0;
    }
}

.eln-form-group--inline {
    flex-direction: row;
    align-items: center;
    gap: var(--eln-space-3);
    
    .eln-label {
        margin-bottom: 0;
    }
}

/* Labels */
.eln-label {
    display: block;
    font-size: var(--eln-font-size-sm);
    font-weight: var(--eln-font-weight-medium);
    color: var(--eln-text-primary);
    line-height: var(--eln-line-height-tight);
    margin-bottom: var(--eln-space-1);
}

.eln-label--required::after {
    content: ' *';
    color: var(--eln-error);
}

/* Inputs */
.eln-input {
    display: block;
    width: 100%;
    padding: var(--eln-space-2) var(--eln-space-3);
    border: 1px solid var(--eln-border-primary);
    border-radius: var(--eln-radius-default);
    background-color: var(--eln-bg-primary);
    color: var(--eln-text-primary);
    font-family: var(--eln-font-family-sans);
    font-size: var(--eln-font-size-sm);
    line-height: var(--eln-line-height-normal);
    transition: all var(--eln-transition-fast);
    
    &::placeholder {
        color: var(--eln-text-secondary);
    }
    
    &:hover {
        border-color: var(--eln-border-hover);
    }
    
    &:focus {
        outline: none;
        border-color: var(--eln-accent);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--eln-accent) 20%, transparent);
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background-color: var(--eln-bg-secondary);
    }
    
    &.eln-input--error {
        border-color: var(--eln-error);
        
        &:focus {
            border-color: var(--eln-error);
            box-shadow: 0 0 0 2px color-mix(in srgb, var(--eln-error) 20%, transparent);
        }
    }
    
    &.eln-input--success {
        border-color: var(--eln-success);
        
        &:focus {
            border-color: var(--eln-success);
            box-shadow: 0 0 0 2px color-mix(in srgb, var(--eln-success) 20%, transparent);
        }
    }
}

/* Input sizes */
.eln-input--sm {
    padding: var(--eln-space-1) var(--eln-space-2);
    font-size: var(--eln-font-size-xs);
}

.eln-input--lg {
    padding: var(--eln-space-3) var(--eln-space-4);
    font-size: var(--eln-font-size-lg);
}

/* Textarea */
.eln-textarea {
    resize: vertical;
    min-height: 4rem;
}

/* Select */
.eln-select {
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right var(--eln-space-2) center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: var(--eln-space-10);
    
    &::-ms-expand {
        display: none;
    }
}

/* Checkbox and Radio */
.eln-checkbox,
.eln-radio {
    appearance: none;
    width: 1rem;
    height: 1rem;
    border: 1px solid var(--eln-border-primary);
    background-color: var(--eln-bg-primary);
    display: inline-block;
    position: relative;
    cursor: pointer;
    transition: all var(--eln-transition-fast);
    
    &:hover {
        border-color: var(--eln-border-hover);
    }
    
    &:focus {
        outline: none;
        border-color: var(--eln-accent);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--eln-accent) 20%, transparent);
    }
    
    &:checked {
        background-color: var(--eln-accent);
        border-color: var(--eln-accent);
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.eln-checkbox {
    border-radius: var(--eln-radius-sm);
    
    &:checked::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0.375rem;
        height: 0.25rem;
        border: 2px solid white;
        border-top: none;
        border-right: none;
        transform: translate(-50%, -60%) rotate(-45deg);
    }
}

.eln-radio {
    border-radius: 50%;
    
    &:checked::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0.375rem;
        height: 0.375rem;
        background-color: white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
    }
}

/* Help text */
.eln-help-text {
    font-size: var(--eln-font-size-xs);
    color: var(--eln-text-secondary);
    margin-top: var(--eln-space-1);
}

/* Error message */
.eln-error-message {
    font-size: var(--eln-font-size-xs);
    color: var(--eln-error);
    margin-top: var(--eln-space-1);
    display: flex;
    align-items: center;
    gap: var(--eln-space-1);
}
```

### Modal Components

```css
/* components/modals.css */
.eln-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: var(--eln-z-modal-backdrop);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--eln-space-4);
    opacity: 0;
    animation: eln-fade-in var(--eln-transition-fast) forwards;
}

.eln-modal {
    background-color: var(--eln-bg-primary);
    border-radius: var(--eln-radius-lg);
    box-shadow: var(--eln-shadow-xl);
    max-width: 90vw;
    max-height: 90vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    z-index: var(--eln-z-modal);
    transform: scale(0.95);
    animation: eln-scale-in var(--eln-transition-fast) forwards;
}

.eln-modal--sm {
    max-width: 400px;
}

.eln-modal--md {
    max-width: 600px;
}

.eln-modal--lg {
    max-width: 800px;
}

.eln-modal--xl {
    max-width: 1200px;
}

.eln-modal--fullscreen {
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
}

.eln-modal__header {
    padding: var(--eln-space-6);
    border-bottom: 1px solid var(--eln-border-primary);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
}

.eln-modal__title {
    font-size: var(--eln-font-size-xl);
    font-weight: var(--eln-font-weight-semibold);
    color: var(--eln-text-primary);
    margin: 0;
}

.eln-modal__close {
    background: none;
    border: none;
    font-size: var(--eln-font-size-xl);
    color: var(--eln-text-secondary);
    cursor: pointer;
    padding: var(--eln-space-1);
    border-radius: var(--eln-radius-default);
    transition: all var(--eln-transition-fast);
    
    &:hover {
        background-color: var(--eln-bg-modifier-hover);
        color: var(--eln-text-primary);
    }
    
    &:focus {
        outline: none;
        background-color: var(--eln-bg-modifier-hover);
        box-shadow: 0 0 0 2px var(--eln-accent);
    }
}

.eln-modal__body {
    padding: var(--eln-space-6);
    overflow-y: auto;
    flex: 1;
}

.eln-modal__footer {
    padding: var(--eln-space-6);
    border-top: 1px solid var(--eln-border-primary);
    display: flex;
    gap: var(--eln-space-3);
    justify-content: flex-end;
    flex-shrink: 0;
}
```

## 🎯 Layout System

### Grid System

```css
/* layouts/grid.css */
.eln-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--eln-space-4);
}

.eln-grid {
    display: grid;
    gap: var(--eln-space-4);
}

.eln-grid--cols-1 { grid-template-columns: repeat(1, 1fr); }
.eln-grid--cols-2 { grid-template-columns: repeat(2, 1fr); }
.eln-grid--cols-3 { grid-template-columns: repeat(3, 1fr); }
.eln-grid--cols-4 { grid-template-columns: repeat(4, 1fr); }
.eln-grid--cols-5 { grid-template-columns: repeat(5, 1fr); }
.eln-grid--cols-6 { grid-template-columns: repeat(6, 1fr); }
.eln-grid--cols-12 { grid-template-columns: repeat(12, 1fr); }

.eln-grid--gap-0 { gap: 0; }
.eln-grid--gap-1 { gap: var(--eln-space-1); }
.eln-grid--gap-2 { gap: var(--eln-space-2); }
.eln-grid--gap-3 { gap: var(--eln-space-3); }
.eln-grid--gap-4 { gap: var(--eln-space-4); }
.eln-grid--gap-6 { gap: var(--eln-space-6); }
.eln-grid--gap-8 { gap: var(--eln-space-8); }

/* Grid items */
.eln-col-span-1 { grid-column: span 1; }
.eln-col-span-2 { grid-column: span 2; }
.eln-col-span-3 { grid-column: span 3; }
.eln-col-span-4 { grid-column: span 4; }
.eln-col-span-5 { grid-column: span 5; }
.eln-col-span-6 { grid-column: span 6; }
.eln-col-span-full { grid-column: 1 / -1; }

/* Responsive grid */
@media (min-width: 640px) {
    .eln-grid--sm-cols-1 { grid-template-columns: repeat(1, 1fr); }
    .eln-grid--sm-cols-2 { grid-template-columns: repeat(2, 1fr); }
    .eln-grid--sm-cols-3 { grid-template-columns: repeat(3, 1fr); }
    .eln-grid--sm-cols-4 { grid-template-columns: repeat(4, 1fr); }
    
    .eln-col-sm-span-1 { grid-column: span 1; }
    .eln-col-sm-span-2 { grid-column: span 2; }
    .eln-col-sm-span-3 { grid-column: span 3; }
    .eln-col-sm-span-4 { grid-column: span 4; }
}

@media (min-width: 768px) {
    .eln-grid--md-cols-1 { grid-template-columns: repeat(1, 1fr); }
    .eln-grid--md-cols-2 { grid-template-columns: repeat(2, 1fr); }
    .eln-grid--md-cols-3 { grid-template-columns: repeat(3, 1fr); }
    .eln-grid--md-cols-4 { grid-template-columns: repeat(4, 1fr); }
    .eln-grid--md-cols-6 { grid-template-columns: repeat(6, 1fr); }
    
    .eln-col-md-span-1 { grid-column: span 1; }
    .eln-col-md-span-2 { grid-column: span 2; }
    .eln-col-md-span-3 { grid-column: span 3; }
    .eln-col-md-span-4 { grid-column: span 4; }
    .eln-col-md-span-6 { grid-column: span 6; }
}

@media (min-width: 1024px) {
    .eln-grid--lg-cols-1 { grid-template-columns: repeat(1, 1fr); }
    .eln-grid--lg-cols-2 { grid-template-columns: repeat(2, 1fr); }
    .eln-grid--lg-cols-3 { grid-template-columns: repeat(3, 1fr); }
    .eln-grid--lg-cols-4 { grid-template-columns: repeat(4, 1fr); }
    .eln-grid--lg-cols-6 { grid-template-columns: repeat(6, 1fr); }
    .eln-grid--lg-cols-12 { grid-template-columns: repeat(12, 1fr); }
    
    .eln-col-lg-span-1 { grid-column: span 1; }
    .eln-col-lg-span-2 { grid-column: span 2; }
    .eln-col-lg-span-3 { grid-column: span 3; }
    .eln-col-lg-span-4 { grid-column: span 4; }
    .eln-col-lg-span-6 { grid-column: span 6; }
    .eln-col-lg-span-12 { grid-column: span 12; }
}
```

### Flexbox Utilities

```css
/* layouts/flexbox.css */
.eln-flex { display: flex; }
.eln-inline-flex { display: inline-flex; }

/* Direction */
.eln-flex-row { flex-direction: row; }
.eln-flex-row-reverse { flex-direction: row-reverse; }
.eln-flex-col { flex-direction: column; }
.eln-flex-col-reverse { flex-direction: column-reverse; }

/* Wrap */
.eln-flex-wrap { flex-wrap: wrap; }
.eln-flex-wrap-reverse { flex-wrap: wrap-reverse; }
.eln-flex-nowrap { flex-wrap: nowrap; }

/* Justify content */
.eln-justify-start { justify-content: flex-start; }
.eln-justify-end { justify-content: flex-end; }
.eln-justify-center { justify-content: center; }
.eln-justify-between { justify-content: space-between; }
.eln-justify-around { justify-content: space-around; }
.eln-justify-evenly { justify-content: space-evenly; }

/* Align items */
.eln-items-start { align-items: flex-start; }
.eln-items-end { align-items: flex-end; }
.eln-items-center { align-items: center; }
.eln-items-baseline { align-items: baseline; }
.eln-items-stretch { align-items: stretch; }

/* Align content */
.eln-content-start { align-content: flex-start; }
.eln-content-end { align-content: flex-end; }
.eln-content-center { align-content: center; }
.eln-content-between { align-content: space-between; }
.eln-content-around { align-content: space-around; }
.eln-content-evenly { align-content: space-evenly; }

/* Flex */
.eln-flex-1 { flex: 1 1 0%; }
.eln-flex-auto { flex: 1 1 auto; }
.eln-flex-initial { flex: 0 1 auto; }
.eln-flex-none { flex: none; }

/* Flex grow */
.eln-grow { flex-grow: 1; }
.eln-grow-0 { flex-grow: 0; }

/* Flex shrink */
.eln-shrink { flex-shrink: 1; }
.eln-shrink-0 { flex-shrink: 0; }

/* Gap */
.eln-gap-0 { gap: 0; }
.eln-gap-1 { gap: var(--eln-space-1); }
.eln-gap-2 { gap: var(--eln-space-2); }
.eln-gap-3 { gap: var(--eln-space-3); }
.eln-gap-4 { gap: var(--eln-space-4); }
.eln-gap-5 { gap: var(--eln-space-5); }
.eln-gap-6 { gap: var(--eln-space-6); }
.eln-gap-8 { gap: var(--eln-space-8); }
```

## 🎨 Utility Classes

### Spacing Utilities

```css
/* utilities/spacing.css */
/* Margin */
.eln-m-0 { margin: 0; }
.eln-m-1 { margin: var(--eln-space-1); }
.eln-m-2 { margin: var(--eln-space-2); }
.eln-m-3 { margin: var(--eln-space-3); }
.eln-m-4 { margin: var(--eln-space-4); }
.eln-m-5 { margin: var(--eln-space-5); }
.eln-m-6 { margin: var(--eln-space-6); }
.eln-m-8 { margin: var(--eln-space-8); }
.eln-m-auto { margin: auto; }

/* Margin X */
.eln-mx-0 { margin-left: 0; margin-right: 0; }
.eln-mx-1 { margin-left: var(--eln-space-1); margin-right: var(--eln-space-1); }
.eln-mx-2 { margin-left: var(--eln-space-2); margin-right: var(--eln-space-2); }
.eln-mx-3 { margin-left: var(--eln-space-3); margin-right: var(--eln-space-3); }
.eln-mx-4 { margin-left: var(--eln-space-4); margin-right: var(--eln-space-4); }
.eln-mx-auto { margin-left: auto; margin-right: auto; }

/* Margin Y */
.eln-my-0 { margin-top: 0; margin-bottom: 0; }
.eln-my-1 { margin-top: var(--eln-space-1); margin-bottom: var(--eln-space-1); }
.eln-my-2 { margin-top: var(--eln-space-2); margin-bottom: var(--eln-space-2); }
.eln-my-3 { margin-top: var(--eln-space-3); margin-bottom: var(--eln-space-3); }
.eln-my-4 { margin-top: var(--eln-space-4); margin-bottom: var(--eln-space-4); }

/* Individual margins */
.eln-mt-0 { margin-top: 0; }
.eln-mt-1 { margin-top: var(--eln-space-1); }
.eln-mt-2 { margin-top: var(--eln-space-2); }
.eln-mt-3 { margin-top: var(--eln-space-3); }
.eln-mt-4 { margin-top: var(--eln-space-4); }

.eln-mr-0 { margin-right: 0; }
.eln-mr-1 { margin-right: var(--eln-space-1); }
.eln-mr-2 { margin-right: var(--eln-space-2); }
.eln-mr-3 { margin-right: var(--eln-space-3); }
.eln-mr-4 { margin-right: var(--eln-space-4); }

.eln-mb-0 { margin-bottom: 0; }
.eln-mb-1 { margin-bottom: var(--eln-space-1); }
.eln-mb-2 { margin-bottom: var(--eln-space-2); }
.eln-mb-3 { margin-bottom: var(--eln-space-3); }
.eln-mb-4 { margin-bottom: var(--eln-space-4); }

.eln-ml-0 { margin-left: 0; }
.eln-ml-1 { margin-left: var(--eln-space-1); }
.eln-ml-2 { margin-left: var(--eln-space-2); }
.eln-ml-3 { margin-left: var(--eln-space-3); }
.eln-ml-4 { margin-left: var(--eln-space-4); }

/* Padding */
.eln-p-0 { padding: 0; }
.eln-p-1 { padding: var(--eln-space-1); }
.eln-p-2 { padding: var(--eln-space-2); }
.eln-p-3 { padding: var(--eln-space-3); }
.eln-p-4 { padding: var(--eln-space-4); }
.eln-p-5 { padding: var(--eln-space-5); }
.eln-p-6 { padding: var(--eln-space-6); }
.eln-p-8 { padding: var(--eln-space-8); }

/* Padding X */
.eln-px-0 { padding-left: 0; padding-right: 0; }
.eln-px-1 { padding-left: var(--eln-space-1); padding-right: var(--eln-space-1); }
.eln-px-2 { padding-left: var(--eln-space-2); padding-right: var(--eln-space-2); }
.eln-px-3 { padding-left: var(--eln-space-3); padding-right: var(--eln-space-3); }
.eln-px-4 { padding-left: var(--eln-space-4); padding-right: var(--eln-space-4); }

/* Padding Y */
.eln-py-0 { padding-top: 0; padding-bottom: 0; }
.eln-py-1 { padding-top: var(--eln-space-1); padding-bottom: var(--eln-space-1); }
.eln-py-2 { padding-top: var(--eln-space-2); padding-bottom: var(--eln-space-2); }
.eln-py-3 { padding-top: var(--eln-space-3); padding-bottom: var(--eln-space-3); }
.eln-py-4 { padding-top: var(--eln-space-4); padding-bottom: var(--eln-space-4); }

/* Individual padding */
.eln-pt-0 { padding-top: 0; }
.eln-pt-1 { padding-top: var(--eln-space-1); }
.eln-pt-2 { padding-top: var(--eln-space-2); }
.eln-pt-3 { padding-top: var(--eln-space-3); }
.eln-pt-4 { padding-top: var(--eln-space-4); }

.eln-pr-0 { padding-right: 0; }
.eln-pr-1 { padding-right: var(--eln-space-1); }
.eln-pr-2 { padding-right: var(--eln-space-2); }
.eln-pr-3 { padding-right: var(--eln-space-3); }
.eln-pr-4 { padding-right: var(--eln-space-4); }

.eln-pb-0 { padding-bottom: 0; }
.eln-pb-1 { padding-bottom: var(--eln-space-1); }
.eln-pb-2 { padding-bottom: var(--eln-space-2); }
.eln-pb-3 { padding-bottom: var(--eln-space-3); }
.eln-pb-4 { padding-bottom: var(--eln-space-4); }

.eln-pl-0 { padding-left: 0; }
.eln-pl-1 { padding-left: var(--eln-space-1); }
.eln-pl-2 { padding-left: var(--eln-space-2); }
.eln-pl-3 { padding-left: var(--eln-space-3); }
.eln-pl-4 { padding-left: var(--eln-space-4); }
```

## 🎬 Animation System

```css
/* utilities/animations.css */
@keyframes eln-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes eln-fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
}

@keyframes eln-scale-in {
    from { transform: scale(0.95); }
    to { transform: scale(1); }
}

@keyframes eln-scale-out {
    from { transform: scale(1); }
    to { transform: scale(0.95); }
}

@keyframes eln-slide-in-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}

@keyframes eln-slide-out-down {
    from { transform: translateY(0); }
    to { transform: translateY(100%); }
}

@keyframes eln-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes eln-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

@keyframes eln-bounce {
    0%, 20%, 53%, 80%, 100% { transform: translate3d(0, 0, 0); }
    40%, 43% { transform: translate3d(0, -30px, 0); }
    70% { transform: translate3d(0, -15px, 0); }
    90% { transform: translate3d(0, -4px, 0); }
}

/* Animation utilities */
.eln-animate-fade-in { animation: eln-fade-in var(--eln-transition-normal); }
.eln-animate-fade-out { animation: eln-fade-out var(--eln-transition-normal); }
.eln-animate-scale-in { animation: eln-scale-in var(--eln-transition-normal); }
.eln-animate-scale-out { animation: eln-scale-out var(--eln-transition-normal); }
.eln-animate-slide-in-up { animation: eln-slide-in-up var(--eln-transition-normal); }
.eln-animate-slide-out-down { animation: eln-slide-out-down var(--eln-transition-normal); }
.eln-animate-spin { animation: eln-spin 1s linear infinite; }
.eln-animate-pulse { animation: eln-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
.eln-animate-bounce { animation: eln-bounce 1s infinite; }

/* Transition utilities */
.eln-transition-none { transition: none; }
.eln-transition-all { transition: all var(--eln-transition-fast); }
.eln-transition-colors { transition: color var(--eln-transition-fast), background-color var(--eln-transition-fast), border-color var(--eln-transition-fast); }
.eln-transition-opacity { transition: opacity var(--eln-transition-fast); }
.eln-transition-transform { transition: transform var(--eln-transition-fast); }

/* Duration utilities */
.eln-duration-75 { transition-duration: 75ms; }
.eln-duration-100 { transition-duration: 100ms; }
.eln-duration-150 { transition-duration: 150ms; }
.eln-duration-200 { transition-duration: 200ms; }
.eln-duration-300 { transition-duration: 300ms; }
.eln-duration-500 { transition-duration: 500ms; }
.eln-duration-700 { transition-duration: 700ms; }
.eln-duration-1000 { transition-duration: 1000ms; }

/* Easing utilities */
.eln-ease-linear { transition-timing-function: linear; }
.eln-ease-in { transition-timing-function: cubic-bezier(0.4, 0, 1, 1); }
.eln-ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }
.eln-ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
```

## 📱 Responsive Design

### Responsive Utilities

```css
/* Mobile first approach */
.eln-block { display: block; }
.eln-inline-block { display: inline-block; }
.eln-inline { display: inline; }
.eln-hidden { display: none; }

/* Responsive display utilities */
@media (min-width: 640px) {
    .eln-sm\\:block { display: block; }
    .eln-sm\\:inline-block { display: inline-block; }
    .eln-sm\\:inline { display: inline; }
    .eln-sm\\:hidden { display: none; }
}

@media (min-width: 768px) {
    .eln-md\\:block { display: block; }
    .eln-md\\:inline-block { display: inline-block; }
    .eln-md\\:inline { display: inline; }
    .eln-md\\:hidden { display: none; }
}

@media (min-width: 1024px) {
    .eln-lg\\:block { display: block; }
    .eln-lg\\:inline-block { display: inline-block; }
    .eln-lg\\:inline { display: inline; }
    .eln-lg\\:hidden { display: none; }
}

@media (min-width: 1280px) {
    .eln-xl\\:block { display: block; }
    .eln-xl\\:inline-block { display: inline-block; }
    .eln-xl\\:inline { display: inline; }
    .eln-xl\\:hidden { display: none; }
}

/* Container queries for component-level responsiveness */
@container (max-width: 400px) {
    .eln-component {
        .eln-btn-group {
            flex-direction: column;
            
            .eln-btn {
                border-radius: var(--eln-radius-default);
                margin-left: 0;
                margin-top: -1px;
                
                &:first-child {
                    margin-top: 0;
                }
            }
        }
    }
}
```

## 🧪 CSS Testing

### CSS Test Framework

```css
/* Test utilities for visual regression testing */
.eln-test-container {
    position: relative;
    padding: var(--eln-space-4);
    border: 2px dashed var(--eln-border-primary);
    margin: var(--eln-space-4) 0;
}

.eln-test-label {
    position: absolute;
    top: calc(-1 * var(--eln-space-3));
    left: var(--eln-space-2);
    background: var(--eln-bg-primary);
    padding: 0 var(--eln-space-2);
    font-size: var(--eln-font-size-xs);
    color: var(--eln-text-secondary);
    font-family: var(--eln-font-family-mono);
}

/* Debug utilities */
.eln-debug * {
    outline: 1px solid red !important;
}

.eln-debug-grid {
    background-image: 
        linear-gradient(rgba(255, 0, 0, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 0, 0, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
}

/* Performance testing */
.eln-will-change-transform { will-change: transform; }
.eln-will-change-opacity { will-change: opacity; }
.eln-will-change-scroll { will-change: scroll-position; }
```

This comprehensive CSS architecture provides a solid foundation for building scalable, maintainable, and performant user interfaces in the Obsidian ELN Plugin while maintaining compatibility with Obsidian's theming system.
