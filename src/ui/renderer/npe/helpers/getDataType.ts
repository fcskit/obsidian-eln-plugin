import type { FrontmatterValue, FrontmatterPrimitive } from "../../../../types/core";

export interface DetectedType {
    dataType: string;
    value: string | number | boolean | null;
}

export interface TypeValidationResult {
    isValid: boolean;
    convertedValue?: FrontmatterValue;
    errorMessage?: string;
}

/**
 * Get the data type of a value.
 * @param value - The value to get the data type of.
 * @returns The data type of the value.
 */
export function getDataType(value: FrontmatterValue): string {
    if (typeof value === "string") {
        return detectStringType(value, false).dataType; // No type conversion for regular rendering
    } else if (typeof value === "number") {
        return "number";
    } else if (typeof value === "boolean") {
        return "boolean";
    } else if (Array.isArray(value)) {
        return "array";
    } else if (typeof value === "object" && value !== null) {
        return "object";
    } else {
        return "unknown";
    }
}

/**
 * Get the data type of a string value with type conversion enabled (for array inputs).
 * @param value - The string value to get the data type of.
 * @returns The data type of the value with intelligent conversion.
 */
export function getDataTypeWithConversion(value: string): string {
    return detectStringType(value, true).dataType;
}

/**
 * Get both the data type and processed value of a value.
 * @param value - The value to detect the type of.
 * @returns An object containing the data type and the processed value.
 */
export function getDetectedType(value: FrontmatterValue): DetectedType {
    if (typeof value === "string") {
        return detectStringType(value);
    } else if (typeof value === "number") {
        return { dataType: "number", value: value };
    } else if (typeof value === "boolean") {
        return { dataType: "boolean", value: value };
    } else if (Array.isArray(value)) {
        return { dataType: "array", value: null };
    } else if (typeof value === "object" && value !== null) {
        return { dataType: "object", value: null };
    } else {
        return { dataType: "unknown", value: null };
    }
}

/**
 * Detects the type of a string value and returns both type and processed value.
 * @param value - The string value to detect the type of.
 * @param enableTypeConversion - If true, enables string-to-number and string-to-boolean conversion for array inputs.
 * @returns An object containing the data type and the processed value.
 */
function detectStringType(value: string, enableTypeConversion: boolean = false): DetectedType {
    let strType: string;
    let processedValue: string | number | boolean | null = value;
    
    // Only check for boolean and number patterns if type conversion is enabled
    if (enableTypeConversion) {
        // Check for boolean patterns first
        if (value === 'true' || value === 'false') {
            strType = 'boolean';
            processedValue = value === 'true';
            return { dataType: strType, value: processedValue };
        }
        // Check for number patterns (including scientific notation)
        else if (!isNaN(Number(value)) && isFinite(Number(value)) && value.trim() !== '') {
            strType = 'number';
            processedValue = Number(value);
            return { dataType: strType, value: processedValue };
        }
    }
    
    // Check for wikilinks
    if (value.startsWith('[[') && value.endsWith(']]')) {
        strType = 'link';
        processedValue = value; // Keep the full link syntax with brackets
    }
    // match markdown style external links
    else if (value.match(/^\[.*\]\(.*\)$/)) {
        strType = 'external-link';
    }
    // match date format
    else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        strType = 'date';
    }
    // match Latex formula
    else if (value.match(/^\$.*\$$/)) {
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

/**
 * Parse and transform a primitive value based on its data type.
 * @param dataType - The target data type.
 * @param value - The value to transform.
 * @returns The transformed value.
 */
export function parsePrimitiveValue(dataType: string, value: FrontmatterPrimitive): FrontmatterPrimitive {
    type ValueTransformKey = 'string' | 'number' | 'boolean' | 'link' | 'external-link' | 'date' | 'latex' | 'unknown';
    
    const valueTransform: Record<ValueTransformKey, (v: FrontmatterPrimitive) => FrontmatterPrimitive> = {
        string: (v: FrontmatterPrimitive) => String(v ?? ''),
        number: (v: FrontmatterPrimitive) => typeof v === 'string' ? parseFloat(v) : Number(v ?? 0),
        boolean: (v: FrontmatterPrimitive) => Boolean(v),
        link: (v: FrontmatterPrimitive) => {
            const str = String(v ?? '');
            return str.startsWith("[[") && str.endsWith("]]") ? str.slice(2, -2) : str;
        },
        'external-link': (v: FrontmatterPrimitive) => String(v ?? ''),
        date: (v: FrontmatterPrimitive) => String(v ?? ''),
        latex: (v: FrontmatterPrimitive) => {
            const str = String(v ?? '');
            return str.startsWith("$") && str.endsWith("$") ? str.slice(1, -1) : str;
        },
        unknown: (v: FrontmatterPrimitive) => String(v ?? ''),
    };
    
    if ((dataType as ValueTransformKey) in valueTransform) {
        return valueTransform[dataType as ValueTransformKey](value);
    } else {
        return value;
    }
}

/**
 * Validate if a user input string can be converted to the specified data type.
 * @param input - The user input string to validate.
 * @param targetType - The target data type to validate against.
 * @returns Validation result with success status, converted value, or error message.
 */
export function validateTypeInput(input: string, targetType: string): TypeValidationResult {
    // Handle empty input
    if (!input || input.trim() === '') {
        if (targetType === 'string') {
            return { isValid: true, convertedValue: '' };
        }
        return { isValid: false, errorMessage: `${targetType} cannot be empty` };
    }

    const trimmedInput = input.trim();

    switch (targetType) {
        case 'string':
            return { isValid: true, convertedValue: trimmedInput };
            
        case 'number': {
            const numValue = parseFloat(trimmedInput);
            if (isNaN(numValue)) {
                return { isValid: false, errorMessage: 'Invalid number format' };
            }
            return { isValid: true, convertedValue: numValue };
        }
            
        case 'boolean': {
            const lowerInput = trimmedInput.toLowerCase();
            if (['true', '1', 'yes', 'on'].includes(lowerInput)) {
                return { isValid: true, convertedValue: true };
            } else if (['false', '0', 'no', 'off'].includes(lowerInput)) {
                return { isValid: true, convertedValue: false };
            }
            return { isValid: false, errorMessage: 'Invalid boolean value (use true/false, yes/no, 1/0, on/off)' };
        }
            
        case 'date': {
            if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedInput)) {
                const date = new Date(trimmedInput);
                if (!isNaN(date.getTime())) {
                    return { isValid: true, convertedValue: trimmedInput };
                }
            }
            return { isValid: false, errorMessage: 'Invalid date format (use YYYY-MM-DD)' };
        }
            
        case 'link':
            // Internal links - if input already has brackets, keep as is, otherwise add them
            if (trimmedInput.startsWith('[[') && trimmedInput.endsWith(']]')) {
                return { isValid: true, convertedValue: trimmedInput };
            }
            if (trimmedInput.includes('[[') || trimmedInput.includes(']]')) {
                return { isValid: false, errorMessage: 'Link text cannot contain [[ or ]] unless properly formatted' };
            }
            return { isValid: true, convertedValue: `[[${trimmedInput}]]` };
            
        case 'external-link':
            // Basic URL validation or markdown link format
            if (trimmedInput.startsWith('http://') || trimmedInput.startsWith('https://') || 
                /^\[.*\]\(.*\)$/.test(trimmedInput)) {
                return { isValid: true, convertedValue: trimmedInput };
            }
            return { isValid: false, errorMessage: 'Invalid URL or markdown link format' };
            
        case 'latex':
            // LaTeX can be any text, will be wrapped in $ $
            if (trimmedInput.includes('$')) {
                return { isValid: false, errorMessage: 'LaTeX formula cannot contain $ symbols' };
            }
            return { isValid: true, convertedValue: `$${trimmedInput}$` };
            
        default:
            return { isValid: false, errorMessage: `Unknown data type: ${targetType}` };
    }
}

/**
 * Get a user-friendly display name for a data type.
 * @param dataType - The internal data type string.
 * @returns The display name for the type.
 */
export function getTypeDisplayName(dataType: string): string {
    const typeDisplayNames: Record<string, string> = {
        'string': 'str',
        'number': 'num',
        'boolean': 'bool',
        'date': 'date',
        'link': 'link',
        'external-link': 'url',
        'latex': 'math',
        'array': 'array',
        'object': 'object',
        'unknown': 'unknown'
    };

    return typeDisplayNames[dataType] || dataType;
}

/**
 * Converts and validates user input for array items with intelligent type detection.
 * When user input doesn't match the expected type, automatically converts to the most appropriate type.
 * 
 * @param userInput - The raw user input value
 * @param expectedType - The expected data type for this array item
 * @param currentValue - The current value for comparison
 * @returns Object with converted value, detected type, and whether conversion occurred
 */
export function convertArrayItemInput(
    userInput: string,
    expectedType: string,
    currentValue: FrontmatterPrimitive | undefined
): {
    convertedValue: FrontmatterPrimitive;
    detectedType: string;
    typeChanged: boolean;
    originalType: string;
} {
    // Get the actual detected type of the user input WITH conversion enabled
    const detectedType = getDataTypeWithConversion(userInput);
    const originalType = expectedType;
    let typeChanged = false;
    let convertedValue: FrontmatterPrimitive = userInput;

    // If detected type matches expected type, preserve the original value for array context
    if (detectedType === expectedType) {
        // For array context, preserve full syntax when type doesn't change
        if (detectedType === 'latex' || detectedType === 'link' || detectedType === 'external-link') {
            convertedValue = userInput; // Keep $ signs, brackets, etc.
        } else {
            convertedValue = parsePrimitiveValue(detectedType, userInput);
        }
    } else {
        // Type mismatch - perform intelligent conversion
        typeChanged = true;
        
        // Use the detected type result with conversion enabled
        const detectionResult = detectStringType(userInput, true);
        convertedValue = detectionResult.value as FrontmatterPrimitive;
        
        // For links, store the full syntax (brackets included)
        // updateProperties no longer adds brackets, so we store the full syntax
        if (detectedType === 'link' && typeof convertedValue === 'string') {
            // convertedValue from detectStringType now includes brackets - keep as is
        } else if (detectedType === 'external-link') {
            // For external links, store the full markdown syntax
            convertedValue = userInput;
        } else if (detectedType === 'latex') {
            // For LaTeX, store the full syntax with $ delimiters
            convertedValue = userInput;
        }
        
        // Fallback to original conversion logic for edge cases
        if (convertedValue === userInput && detectedType !== 'link' && detectedType !== 'external-link') {
            if (detectedType === 'boolean') {
                convertedValue = userInput.toLowerCase() === 'true';
            } else if (detectedType === 'number') {
                convertedValue = parseFloat(userInput);
            }
        }
    }

    return {
        convertedValue,
        detectedType,
        typeChanged,
        originalType
    };
}