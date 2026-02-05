export function getPropertyInputType(dataType: string): string {
    const dataTypeInputTypes: Record<string, string> = {
        string: 'text',
        number: 'number',
        boolean: 'checkbox',
        list: 'list',
        object: 'object',
        objectArray: 'objectArray',
        unknown: 'text',
        link: 'text',
        'external-link': 'url',
        date: 'date',
        latex: 'text',
    };

    // Return the input type based on the data type
    return dataTypeInputTypes[dataType] || 'text'; // Default to text if not found
}