import { createLogger } from "../../../../utils/Logger";
import { getDataType } from "./getDataType";
import type { FrontmatterValue } from "../../../../types/core";

const logger = createLogger('ui');

/**
 * Determines the appropriate data type and default value for a new array item
 * based on the existing items in the array.
 * 
 * Logic:
 * 1. If array is empty, default to string type with "new item"
 * 2. If all items have the same data type, use that type
 * 3. If mixed types, use the type of the last item
 * 
 * @param array - The existing array items
 * @returns Object containing the determined type and appropriate default value
 */
export function determineNewArrayItemType(array: FrontmatterValue[]): {
    dataType: string;
    defaultValue: string | number | boolean;
} {
    logger.debug('Analyzing array for new item type', { arrayLength: array.length, array });
    
    // Handle empty array
    if (array.length === 0) {
        logger.debug('Empty array, defaulting to string type');
        return {
            dataType: 'string',
            defaultValue: 'new item'
        };
    }
    
    // Get data types of all existing items
    const itemTypes = array.map(item => getDataType(item));
    logger.debug('Item types in array:', itemTypes);
    
    // Count occurrences of each type
    const typeCounts = itemTypes.reduce((counts, type) => {
        counts[type] = (counts[type] || 0) + 1;
        return counts;
    }, {} as Record<string, number>);
    
    // Check if all items have the same type
    const uniqueTypes = Object.keys(typeCounts);
    let targetType: string;
    
    if (uniqueTypes.length === 1) {
        // All items have the same type
        targetType = uniqueTypes[0];
        logger.debug('All items have same type:', targetType);
    } else {
        // Mixed types - use the type of the last item
        targetType = itemTypes[itemTypes.length - 1];
        logger.debug('Mixed types detected, using last item type:', targetType);
    }
    
    // Generate appropriate default value for the target type
    const defaultValue = getDefaultValueForType(targetType, array);
    
    logger.debug('Determined new item type:', { dataType: targetType, defaultValue });
    
    return {
        dataType: targetType,
        defaultValue
    };
}

/**
 * Returns an appropriate default value for a given data type,
 * optionally considering existing array values for context.
 */
function getDefaultValueForType(dataType: string, existingArray?: FrontmatterValue[]): string | number | boolean {
    switch (dataType) {
        case 'string':
            return 'new item';
            
        case 'number':
            // For numbers, only try to infer if there's a clear linear sequence
            if (existingArray && existingArray.length >= 2) {
                const numbers = existingArray
                    .filter(item => typeof item === 'number')
                    .map(item => item as number);
                
                if (numbers.length >= 2) {
                    // Check if it's a linear sequence (arithmetic progression)
                    const differences = [];
                    for (let i = 1; i < numbers.length; i++) {
                        differences.push(numbers[i] - numbers[i - 1]);
                    }
                    
                    // Check if all differences are the same (linear sequence)
                    const firstDiff = differences[0];
                    const isLinearSequence = differences.every(diff => diff === firstDiff);
                    
                    if (isLinearSequence) {
                        // It's a clear linear sequence (including constant sequences with diff = 0)
                        const lastNumber = numbers[numbers.length - 1];
                        const nextNumber = lastNumber + firstDiff;
                        logger.debug(`Detected linear sequence with increment ${firstDiff}, next: ${nextNumber}`);
                        return nextNumber;
                    }
                }
            }
            // Default to 0 only for cases with no clear pattern or insufficient data
            return 0;
            
        case 'boolean':
            // For booleans, default to the opposite of the last boolean if possible
            if (existingArray && existingArray.length > 0) {
                const lastItem = existingArray[existingArray.length - 1];
                if (typeof lastItem === 'boolean') {
                    return !lastItem;
                }
            }
            return false;
            
        case 'date':
            // For dates, try to detect linear sequences (daily, weekly, monthly, etc.)
            if (existingArray && existingArray.length >= 2) {
                const dateStrings = existingArray
                    .filter(item => typeof item === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item))
                    .map(item => item as string);
                
                if (dateStrings.length >= 2) {
                    // Convert to Date objects and calculate differences in days
                    const dates = dateStrings.map(dateStr => new Date(dateStr));
                    const differences = [];
                    
                    for (let i = 1; i < dates.length; i++) {
                        const diffMs = dates[i].getTime() - dates[i - 1].getTime();
                        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
                        differences.push(diffDays);
                    }
                    
                    // Check if all differences are the same (linear sequence)
                    const firstDiff = differences[0];
                    const isLinearSequence = differences.every(diff => diff === firstDiff);
                    
                    if (isLinearSequence) {
                        // It's a clear linear sequence - add the same increment
                        const lastDate = dates[dates.length - 1];
                        const nextDate = new Date(lastDate.getTime() + firstDiff * 24 * 60 * 60 * 1000);
                        const nextDateStr = nextDate.toISOString().split('T')[0];
                        logger.debug(`Detected date sequence with ${firstDiff} day increment, next: ${nextDateStr}`);
                        return nextDateStr;
                    }
                }
            }
            // Default to today's date for no clear pattern or insufficient data
            return new Date().toISOString().split('T')[0];
            
        case 'link':
            return '[[new link]]';
            
        case 'external-link':
            return 'https://example.com';
            
        case 'latex':
            return '$new formula$';
            
        case 'tag':
            return '#new-tag';
            
        default:
            // Fallback to string for unknown types
            return 'new item';
    }
}