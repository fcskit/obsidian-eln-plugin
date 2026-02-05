import { getDataType, getTypeDisplayName } from "./getDataType";
import type { FrontmatterValue } from "../../../../types/core";

/**
 * Creates a type label element that displays the data type of a property value.
 * The label is styled with muted colors and positioned to the right of the value container.
 * 
 * @param value - The frontmatter value to create a type label for
 * @param showTypeLabels - Whether type labels should be displayed (from plugin settings)
 * @returns HTMLElement | null - The type label element or null if disabled
 */
export function createTypeLabel(value: FrontmatterValue, showTypeLabels: boolean): HTMLElement | null {
    if (!showTypeLabels) {
        return null;
    }

    const dataType = getDataType(value);

    // Don't show type labels for arrays and objects as they're obvious from structure
    if (dataType === 'array' || dataType === 'object' || dataType === 'unknown') {
        return null;
    }

    const typeLabel = document.createElement('span');
    typeLabel.className = `npe-type-label npe-type-${dataType}`;
    
    // Get display name for the type using unified function
    const displayName = getTypeDisplayName(dataType);
    typeLabel.textContent = displayName.toLowerCase(); // Use lowercase for labels
    
    // Add tooltip with more details
    typeLabel.title = `Data type: ${displayName}`;
    
    return typeLabel;
}