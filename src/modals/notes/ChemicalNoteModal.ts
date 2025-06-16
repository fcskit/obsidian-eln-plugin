import { Notice } from "obsidian";
import { NewNoteModal, NewNoteModalOptions } from "./NewNoteModal"
import ElnPlugin from "../../main";

interface CASDetailResponse {
    casNumber: string;
    name: string;
    inchi: string;
    inchiKey: string;
    smile: string;
    canonicalSmile: string;
    molecularFormula: string;
    molecularMass: string;
    properties?: Record<string, string>; // Properties like boiling point, melting point, etc.
}
    

export class ChemicalNoteModal extends NewNoteModal {
    private lookupField: string | null = null;

    constructor(plugin: ElnPlugin, options?: Partial<NewNoteModalOptions>) {

        super(plugin, {
            ...options,
            modalTitle: options?.modalTitle || "New Chemical",
            noteTitle: options?.noteTitle || "New Chemical Note",
            noteType: options?.noteType || "chemical",
            resolve: options?.resolve || (() => {}),
        });
    }

    /**
     * Resolves the chemical name and properties using an external API.
     */
    async resolveChemicalIdentifier(identifier: string): Promise<void> {
        new Notice(`Looking up information from https://cactus.nci.nih.gov for ${identifier}`);
        console.log(`Trying to collect information from https://cactus.nci.nih.gov for ${identifier}`);

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
                // Update the corresponding fields in this.data and input fields
                const response = await this.queryChemicalIdentifier(identifier, lookupString);
                if (response) {
                    // Update the data object with the resolved value
                    const keys = fieldKey.split(".");
                    let currentData = this.data;
                    for (let i = 0; i < keys.length - 1; i++) {
                        if (!currentData[keys[i]]) {
                            currentData[keys[i]] = {};
                        }
                        currentData = currentData[keys[i]];
                    }
                    currentData[keys[keys.length - 1]] = response;
                    this.updateInputField(fieldKey, response);
                }
            } catch (error) {
                console.error("Failed to resolve chemical name:", error);
            }
        }
    }

    /**
     * Fetches chemical properties from an external API.
     * @param lookupValue The chemical name or identifier to resolve.
     * @returns A promise resolving to the chemical properties.
     */
    private async queryChemicalIdentifier(lookupValue: string, property: string): Promise<string | null> {
        const apiUrl = `https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(lookupValue)}/${property}`;
        try {
            const response = await fetch(apiUrl);
            // Check if the indentifier could be resolved and a valid response was received
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

    private async queryCASCommonChemistry(lookupValue: string): Promise<CASDetailResponse | null> {
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
            console.log(`CAS number found: ${casNumber}`);

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
                casNumber: detailData.rn,
                name: detailData.name,
                inchi: detailData.inchi,
                inchiKey: detailData.inchiKey,
                smile: detailData.smile,
                canonicalSmile: detailData.canonicalSmile,
                molecularFormula: detailData.molecularFormula,
                molecularMass: detailData.molecularMass,
                properties: detailData.experimentalProperties?.reduce((acc: Record<string, string>, prop: { name: string; property: string }) => {
                    acc[prop.name] = prop.property;
                    return acc;
                }, {}),
            };

            console.log(`Detailed data for ${lookupValue}:`, result);
            return result;
        } catch (error) {
            console.warn(`Failed to fetch CAS data for ${lookupValue}:`, error);
            return null; // Return null if any step fails
        }
    }
}