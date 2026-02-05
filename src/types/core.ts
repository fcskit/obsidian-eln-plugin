/**
 * Core domain types used across the application
 */

/**
 * Utility type to extract keys of an object whose values are of type `string`.
 */
export type StringKeys<T> = {
    [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

/**
 * Generic JSON value types for handling dynamic data
 */
export type JSONValue = string | number | boolean | null | JSONObject | Array<JSONValue>;

export interface JSONObject {
    [key: string]: JSONValue;
}

/**
 * Basic primitive types - used throughout the application for simple scalar values
 */
export type Primitive = string | number | boolean | null;

/**
 * Valid frontmatter value types (YAML-compatible).
 * Represents the types that can be stored in Obsidian note frontmatter.
 */
export type FrontmatterValue = 
    | Primitive
    | undefined
    | Array<Primitive | FrontmatterObject>
    | FrontmatterObject;

/**
 * Primitive frontmatter values - basic scalar types that can be rendered as single inputs
 */
export type FrontmatterPrimitive = Primitive;

/**
 * Array of primitive frontmatter values
 */
export type FrontmatterPrimitiveArray = Array<FrontmatterPrimitive>;

/**
 * Object frontmatter values - complex nested structures that mirror FrontMatterCache
 * Can contain primitives, arrays of primitives/objects, or nested objects
 */
export type FrontmatterObject = {
    [key: string]: FrontmatterValue;
};

/**
 * Array of object frontmatter values
 */
export type FrontmatterObjectArray = Array<FrontmatterObject>;

/**
 * Array frontmatter values - can contain either primitives or objects
 */
export type FrontmatterArray = FrontmatterPrimitiveArray | FrontmatterObjectArray;

/**
 * Any writable frontmatter value - used for operations that can handle any type
 */
export type WritableFrontmatterValue = 
    | Primitive
    | FrontmatterPrimitiveArray 
    | FrontmatterObject;

/**
 * Represents the data object that stores user input.
 * Nested fields are allowed.
 */
export interface Data {
    [key: string]: string | number | boolean | null | Data;
}

/**
 * Periodic table element data structure
 */
export interface Element {
    name: string;
    atomicNumber: number;
    group: number | string; // Can be numeric (1-18) or string (e.g., "La-1", "Ac-2")
    groupName: string;
    period: number;
    atomicMass: number;
    stability: string;
    isotopes?: string[];
    electronegativity?: number | null;
    ionizationEnergies?: (number | null)[];
    xrayAbsorptionEnergies?: Record<string, number | null>;
    xrayEmissionEnergies?: Record<string, number | null>;
}

/**
 * Collection of all elements indexed by their symbol
 */
export type ElementsData = Record<string, Element>;
