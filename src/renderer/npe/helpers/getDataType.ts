/**
 * Get the data type of a value.
 * @param value - The value to get the data type of.
 * @returns The data type of the value.
 */
export function getDataType(value: any): string {
    if (typeof value === "string") {
        return detectStringType(value);
    } else if (typeof value === "number") {
        return "number";
    } else if (typeof value === "boolean") {
        return "boolean";
    } else {
        return "unknown";
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