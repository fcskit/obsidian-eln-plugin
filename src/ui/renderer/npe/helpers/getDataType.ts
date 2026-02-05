import type { FrontmatterValue } from "../../../../types/core";

export interface DetectedType {
    dataType: string;
    value: string | number | boolean | null;
}

/**
 * Get the data type of a value.
 * @param value - The value to get the data type of.
 * @returns The data type of the value.
 */
export function getDataType(value: FrontmatterValue): string {
    if (typeof value === "string") {
        return detectStringType(value).dataType;
    } else if (typeof value === "number") {
        return "number";
    } else if (typeof value === "boolean") {
        return "boolean";
    } else {
        return "unknown";
    }
}

/**
 * Detects the type of a string value and returns both type and processed value.
 * @param value - The string value to detect the type of.
 * @returns An object containing the data type and the processed value.
 */
function detectStringType(value: string): DetectedType {
    let strType: string;
    let processedValue = value;
    
    if (value.startsWith('[[') && value.endsWith(']]')) {
        strType = 'link';
        processedValue = value.slice(2, -2);
    // match markdown style external links
    } else if (value.match(/^\[.*\]\(.*\)$/)) {
        strType = 'external-link';
    // match date format
    } else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        strType = 'date';
    // match Latex formula
    } else if (value.match(/^\$.*\$$/)) {
        strType = 'latex';
        processedValue = value.slice(1, -1);
    } else {
        strType = 'string';
    }
    
    return {
        dataType: strType,
        value: processedValue,
    };
}