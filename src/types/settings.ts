import { PathTemplate, MetaDataTemplate } from "./templates";

/**
 * Settings-related types and interfaces
 */

/**
 * Navbar group configuration
 */
export interface NavbarGroup {
    name: string;
    collapsed?: boolean;
    children: string[];
}

/**
 * Note type UI configuration
 */
export interface NoteTypeUIConfig {
    icon: string;
    color: string;
    navbarGroup?: string;
    navbarIndex?: number;
}

/**
 * Main plugin settings interface
 */
export interface ELNSettings {
    ui: {
        navbar: {
            groups: NavbarGroup[];
        };
        footer: {
            show: boolean;
        };
    };
    note: {
        [key: string]: {
            titleTemplate: PathTemplate;
            folderTemplate: PathTemplate;
            folder?: string; // Simple folder path
            customMetadataTemplate: boolean;
            customMarkdownTemplate: boolean;
            customMetadataTemplatePath: string;
            customMarkdownTemplatePath: string;
            metadataTemplate: MetaDataTemplate;
            markdownTemplate: string;
        } & NoteTypeUIConfig;
    };
    api: {
        chemicalLookup: {
            enabled: boolean;
            casRegistryApiKey: string;
        };
    };
}

/**
 * Metadata template transformation interface
 */
export interface MetaDataTemplateTransform {
    type: "replace" | "add" | "remove";
    path: string;
    value?: unknown;
}

/**
 * Type definitions for different note types
 */
export interface ChemicalType {
    name: string;
    casNumber?: string;
    formula?: string;
}

export interface ProjectType {
    name: string;
    description?: string;
    status?: string;
}

export interface SampleType {
    name: string;
    description?: string;
    origin?: string;
}

export interface DeviceType {
    name: string;
    model?: string;
    manufacturer?: string;
}

export interface InstrumentType {
    name: string;
    model?: string;
    manufacturer?: string;
}
