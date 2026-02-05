/**
 * API-related types for external integrations
 */

/**
 * Chemical identifier API result
 */
export interface ChemicalIdentifierResult {
    iupacName?: string;
    formula?: string;
    smiles?: string;
    molarMass?: string;
    inchi?: string;
    inchiKey?: string;
    casNumber?: string;
    name?: string;
}

/**
 * CAS Registry API detailed response
 */
export interface CASDetailResponse {
    uri: string;
    rn: string;
    name: string;
    image: string;
    inchi: string;
    inchiKey: string;
    smile: string;
    canonicalSmile: string;
    molecularFormula: string;
    molecularMass: string;
    casNumber?: string; // Added for compatibility
    properties?: Record<string, string>; // Properties like boiling point, melting point, etc.
    experimentalProperties: Array<{
        property: string;
        value: string;
        units?: string;
        temperature?: string;
        pressure?: string;
    }>;
    predictedProperties: Array<{
        property: string;
        value: string;
        units?: string;
    }>;
}
