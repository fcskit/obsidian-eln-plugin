import { Notice } from "obsidian";
import type ElnPlugin from "../../main";
import type { FormData, FormFieldValue } from "../../types";
import type { CASDetailResponse } from "../../types/api";
import { createLogger } from "../../utils/Logger";

/**
 * Chemical lookup utilities for retrieving chemical information from external APIs
 */
export class ChemicalLookup {
    private plugin: ElnPlugin;
    private logger = createLogger('api');

    constructor(plugin: ElnPlugin) {
        this.plugin = plugin;
    }

    /**
     * Resolves chemical identifier and populates multiple fields at once
     * This function is designed to be used in templates as an action callback
     * @param identifier Chemical name, CAS number, or other identifier
     * @param formData Current form data to update
     * @param updateField Callback to update individual fields
     * @returns Promise that resolves when lookup is complete
     */
    async resolveChemicalIdentifier(
        identifier: string, 
        formData: FormData, 
        updateField: (fieldKey: string, value: FormFieldValue) => void
    ): Promise<void> {
        if (!identifier || identifier.trim() === "") {
            return;
        }

        new Notice(`Looking up information from https://cactus.nci.nih.gov for ${identifier}`);
        this.logger.info(`Trying to collect information from https://cactus.nci.nih.gov for ${identifier}`);

        const lookupProperties = [
            { lookupString: "iupac_name", fieldKey: "chemical.IUPAC name" },
            { lookupString: "formula", fieldKey: "chemical.formula" },
            { lookupString: "smiles", fieldKey: "chemical.smiles" },
            { lookupString: "mw", fieldKey: "chemical.properties.molar mass" },
            { lookupString: "stdinchi", fieldKey: "chemical.inchi" },
            { lookupString: "stdinchikey", fieldKey: "chemical.inchi key" },
        ];

        for (const { lookupString, fieldKey } of lookupProperties) {
            try {
                const response = await this.queryChemicalIdentifier(identifier, lookupString);
                if (response) {
                    // Update the data object with the resolved value
                    this.setNestedValue(formData, fieldKey, response);
                    // Update the UI field
                    updateField(fieldKey, response);
                }
            } catch (error) {
                console.error(`Failed to resolve chemical property ${lookupString}:`, error);
            }
        }
    }

    /**
     * Queries a single chemical property from the NIST CACTUS API
     * @param lookupValue The chemical name or identifier to resolve
     * @param property The property to look up (e.g., "iupac_name", "formula", "smiles")
     * @returns Promise resolving to the property value or null if not found
     */
    async queryChemicalIdentifier(lookupValue: string, property: string): Promise<string | null> {
        const apiUrl = `https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(lookupValue)}/${property}`;
        try {
            const response = await fetch(apiUrl);
            // Check if the identifier could be resolved and a valid response was received
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            // Handle errors like network issues or invalid urls gracefully
            console.warn(`Failed to fetch chemical data for ${lookupValue}:`, error);
            return null; // Return null if the fetch fails
        }
    }

    /**
     * Queries CAS Common Chemistry database for detailed chemical information
     * @param lookupValue Chemical name or identifier to search for
     * @returns Promise resolving to detailed chemical information or null if not found
     */
    async queryCASCommonChemistry(lookupValue: string): Promise<CASDetailResponse | null> {
        const searchApiUrl = `https://commonchemistry.cas.org/api/search?q=${encodeURIComponent(lookupValue)}`;
        try {
            // Step 1: Search for the CAS number
            const searchResponse = await fetch(searchApiUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!searchResponse.ok) {
                throw new Error(`Search API request failed with status ${searchResponse.status}`);
            }

            const searchData = await searchResponse.json();
            if (!searchData || searchData.count === 0 || !searchData.results || searchData.results.length === 0) {
                console.warn(`No results found for ${lookupValue}`);
                return null;
            }

            // Extract the CAS number from the search results
            const casNumber = searchData.results[0].rn;
            this.logger.debug(`CAS number found: ${casNumber}`);

            // Step 2: Fetch detailed information using the CAS number
            const detailApiUrl = `https://commonchemistry.cas.org/api/detail?cas_rn=${encodeURIComponent(casNumber)}`;
            const detailResponse = await fetch(detailApiUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!detailResponse.ok) {
                throw new Error(`Detail API request failed with status ${detailResponse.status}`);
            }

            const detailData = await detailResponse.json();
            if (!detailData) {
                console.warn(`No detailed data found for CAS number ${casNumber}`);
                return null;
            }

            // Extract relevant fields from the detailed data
            const result: CASDetailResponse = {
                uri: detailData.uri || '',
                rn: detailData.rn,
                name: detailData.name,
                image: detailData.image || '',
                inchi: detailData.inchi,
                inchiKey: detailData.inchiKey,
                smile: detailData.smile,
                canonicalSmile: detailData.canonicalSmile,
                molecularFormula: detailData.molecularFormula,
                molecularMass: detailData.molecularMass,
                casNumber: detailData.rn,
                properties: detailData.experimentalProperties?.reduce((acc: Record<string, string>, prop: { name: string; property: string }) => {
                    acc[prop.name] = prop.property;
                    return acc;
                }, {}),
                experimentalProperties: detailData.experimentalProperties || [],
                predictedProperties: detailData.predictedProperties || [],
            };

            this.logger.debug(`Detailed data for ${lookupValue}:`, result);
            return result;
        } catch (error) {
            console.warn(`Failed to fetch CAS data for ${lookupValue}:`, error);
            return null; // Return null if any step fails
        }
    }

    /**
     * Resolves chemical identifier using CAS Common Chemistry and populates multiple fields
     * @param identifier Chemical name or identifier to search for
     * @param formData Current form data to update
     * @param updateField Callback to update individual fields
     * @returns Promise that resolves when lookup is complete
     */
    async resolveChemicalIdentifierCAS(
        identifier: string, 
        formData: FormData, 
        updateField: (fieldKey: string, value: FormFieldValue) => void
    ): Promise<void> {
        if (!identifier || identifier.trim() === "") {
            return;
        }

        new Notice(`Looking up information from CAS Common Chemistry for ${identifier}`);
        
        try {
            const result = await this.queryCASCommonChemistry(identifier);
            if (result) {
                const fieldMappings = [
                    { property: result.name, fieldKey: "chemical.IUPAC name" },
                    { property: result.molecularFormula, fieldKey: "chemical.formula" },
                    { property: result.smile, fieldKey: "chemical.smiles" },
                    { property: result.molecularMass, fieldKey: "chemical.properties.molar mass" },
                    { property: result.inchi, fieldKey: "chemical.inchi" },
                    { property: result.inchiKey, fieldKey: "chemical.inchi key" },
                    { property: result.casNumber, fieldKey: "chemical.CAS" },
                ];

                for (const { property, fieldKey } of fieldMappings) {
                    if (property) {
                        this.setNestedValue(formData, fieldKey, property);
                        updateField(fieldKey, property);
                    }
                }

                // Handle additional properties if available
                if (result.properties) {
                    for (const [propName, propValue] of Object.entries(result.properties)) {
                        const fieldKey = `chemical.properties.${propName.toLowerCase()}`;
                        this.setNestedValue(formData, fieldKey, propValue);
                        updateField(fieldKey, propValue);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to resolve chemical identifier using CAS:", error);
            new Notice("Failed to lookup chemical information from CAS database");
        }
    }

    /**
     * Sets a nested value in an object using dot notation
     * @param obj The object to modify
     * @param path The dot-separated path
     * @param value The value to set
     */
    private setNestedValue(obj: FormData, path: string, value: FormFieldValue): void {
        const keys = path.split(".");
        let current = obj;
        
        // Navigate to the parent object
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]] || typeof current[keys[i]] !== "object") {
                current[keys[i]] = {} as FormData;
            }
            current = current[keys[i]] as FormData;
        }
        
        // Set the final value
        current[keys[keys.length - 1]] = value;
    }
}
