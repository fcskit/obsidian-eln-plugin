/**
 * UI component types and interfaces
 */

/**
 * Circular progress component options
 */
export interface CircularProgressOptions {
    value?: number; // 0-100, if not provided, will be computed from checkboxes
    label?: string;
    color?: string;
    taskLabel?: string;
    size?: number;
    strokeWidth?: number;
    backgroundColor?: string;
    foregroundColor?: string;
    min?: number;
    max?: number;
    showValue?: boolean;
    unit?: string;
}

/**
 * Image viewer component options
 */
export interface ImageViewerOptions {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
    caption?: string;
}

/**
 * Code block parsing parameters
 */
export interface CodeBlockParams {
    [key: string]: string | number | boolean;
}
