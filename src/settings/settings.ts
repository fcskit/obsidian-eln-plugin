import { MetaDataTemplate, PathTemplate } from "../types";
import { metadataTemplates, subClassMetadataTemplates } from "../data/templates/metadataTemplates";
import { markdownTemplates } from "../data/templates/markdownTemplates";

// Navbar group configuration
export interface NavbarGroup {
    id: string;
    name: string;
    order: number;
}

// Navbar configuration for note types
export interface NoteNavbarConfig {
    display: boolean;
    name: string;
    group: string;
}

// Command configuration for note types
export interface NoteCommandConfig {
    enabled: boolean;
    id: string;
    name: string;
}

// Base note configuration interface
export interface BaseNoteConfig {
    navbar: NoteNavbarConfig;
    commands: NoteCommandConfig;
    fileName: PathTemplate;
    folderPath: PathTemplate;
    createSubfolder?: string[];
    customMetadataTemplate: boolean;
    customMarkdownTemplate: boolean;
    customMetadataTemplatePath: string;
    customMarkdownTemplatePath: string;
    metadataTemplate: MetaDataTemplate;
    markdownTemplate: string;
    [key: string]: unknown;
}

// General configuration
export interface GeneralConfig {
    authors: { name: string; initials: string }[];
    operators: { name: string; initials: string }[];
}

// Navbar configuration
export interface NavbarConfig {
    enabled: boolean;
    groups: NavbarGroup[];
}

// Footer configuration
export interface FooterConfig {
    enabled: boolean;
    includeVersion: boolean;
    includeAuthor: boolean;
    includeMtime: boolean;
    includeCtime: boolean;
}

export interface ELNSettings {
    general: GeneralConfig;
    navbar: NavbarConfig;
    footer: FooterConfig;
    note: {
        analysis: BaseNoteConfig & {
            status: string[];
        };
        chemical: BaseNoteConfig & {
            type: ChemicalType[];
            fieldOfUse: string[];
            supplier: { name: string; web: string }[];
            manufacturer: { name: string; web: string }[];
        };
        contact: BaseNoteConfig;
        dailyNote: BaseNoteConfig;
        device: BaseNoteConfig & {
            type: DeviceType[];
        };
        echemCell: BaseNoteConfig & {
            type: EchemCellType[];
        };
        electrode: BaseNoteConfig & {
            type: ElectrodeType[];
        };
        instrument: BaseNoteConfig & {
            type: InstrumentType[];
        };
        lab: BaseNoteConfig & {
            type: string[];
        };
        meeting: BaseNoteConfig & {
            type: string[];
        };
        process: BaseNoteConfig & {
            class: string;
            type: string[];
        };
        project: BaseNoteConfig & {
            type: ProjectType[];
        };
        sample: BaseNoteConfig & {
            type: SampleType[];
        };
        sampleList: BaseNoteConfig;
        default: BaseNoteConfig;
        test: BaseNoteConfig;
    };
    npe: {
        showDataTypes: boolean;
    };
}

// Transformation template for modifying base metadata templates
export interface MetaDataTemplateTransform {
    add?: Array<{
        fullKey: string;
        insertAfter?: string;
        input: {
            query: boolean;
            inputType: string;
            default?: string | string[] | number | boolean | { type: string; value: string } | { type: string; context: string[]; expression: string; reactiveDeps?: string[]; fallback?: unknown };
            options?: string[];
            units?: string | string[];
            defaultUnit?: string;
            callback?: { type: string; value: string } | { type: string; context: string[]; expression: string } | string;
        };
    }>;
    remove?: string[];
    replace?: Array<{
        fullKey: string;
        newKey?: string;
        input: {
            query: boolean;
            inputType: string;
            default?: string | string[] | number | boolean | { type: string; value: string } | { type: string; context: string[]; expression: string; reactiveDeps?: string[]; fallback?: unknown };
            options?: string[];
            units?: string | string[];
            defaultUnit?: string;
            callback?: { type: string; value: string } | { type: string; context: string[]; expression: string } | string;
        };
    }>;
}

// Chemical type configuration
export interface ChemicalType {
    name: string;
    subClassMetadataTemplate: MetaDataTemplateTransform;
    [key: string]: unknown;
}

// Electrochemical Cell type configuration
export interface EchemCellType {
    name: string;
    subClassMetadataTemplate: MetaDataTemplateTransform;
    [key: string]: unknown;
}

// Electrode type configuration
export interface ElectrodeType {
    name: string;
    subClassMetadataTemplate: MetaDataTemplateTransform;
    [key: string]: unknown;
}


// Project type configuration
export interface ProjectType {
    name: string;
    category: string[];
    subClassMetadataTemplate: MetaDataTemplateTransform;
    autoCreate?: string[];
    [key: string]: unknown;
}

// Sample type configuration
export interface SampleType {
    name: string;
    abbreviation?: string;
    subClassMetadataTemplate: MetaDataTemplateTransform;
    [key: string]: unknown;
}

// Device type configuration
export interface DeviceType {
    name: string;
    method: string[];
    [key: string]: unknown;
}

// Instrument type configuration
export interface InstrumentType {
    name: string;
    abbreviation: string;
    technique: string[];
    [key: string]: unknown;
}

export const DEFAULT_SETTINGS: ELNSettings = {
    general: {
        authors: [
            { name: "Anne Anybody", initials: "AA" },
            { name: "Nick Nobody", initials: "NN" },
        ],
        operators: [
            { name: "Anne Anybody", initials: "AA" },
            { name: "Nick Nobody", initials: "NN" },
        ],
    },
    navbar: {
        enabled: true,
        groups: [
            { id: "resources", name: "Resources", order: 1 },
            { id: "experiments", name: "Experiments", order: 2 },
            { id: "other", name: "Other", order: 3 },
        ],
    },
    footer: {
        enabled: true,
        includeVersion: true,
        includeAuthor: true,
        includeMtime: true,
        includeCtime: false,
    },
    note: {
        analysis: {
            navbar: {
                display: true,
                name: "Analysis",
                group: "experiments"
            },
            commands: {
                enabled: true,
                id: "create-analysis-note",
                name: "Create Analysis Note"
            },
            status: ["pending", "in progress", "completed", "failed"],
            fileName: {
                segments: [
                    { kind: "field", path: "sample.name", separator: " - " },
                    { kind: "field", path: "analysis.method.name", separator: "_" },
                    { kind: "counter", inheritFrom: "folderPath", separator: "" },
                ]
            },
            folderPath: {
                segments: [
                    { kind: "literal", value: "Experiments/Analyses", separator: "/" },
                    { kind: "field", path: "project.name", separator: "/" },
                    { kind: "field", path: "sample.name", separator: "/" },
                    { kind: "field", path: "analysis.method.name", separator: "_" },
                    { kind: "counter", prefix: "", separator: "" },
                ]
            },
            createSubfolder: ["data", "plots"],
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.analysis,
            markdownTemplate: markdownTemplates.analysis,
        },
        chemical: {
            navbar: {
                display: true,
                name: "Chemical",
                group: "resources"
            },
            commands: {
                enabled: true,
                id: "create-chemical-note",
                name: "Create Chemical Note"
            },
            type: [
                {
                    name: "acid",
                    subClassMetadataTemplate: subClassMetadataTemplates.chemical.acid
                },
                {
                    name: "active material",
                    subClassMetadataTemplate: subClassMetadataTemplates.chemical["active material"]
                },
                {
                    name: "binder",
                    subClassMetadataTemplate: subClassMetadataTemplates.chemical.binder
                },
                {
                    name: "conductive additive",
                    subClassMetadataTemplate: subClassMetadataTemplates.chemical["conductive additive"]
                },
                {
                    name: "current collector",
                    subClassMetadataTemplate: subClassMetadataTemplates.chemical["current collector"]
                },
                {
                    name: "electrolyte",
                    subClassMetadataTemplate: subClassMetadataTemplates.chemical.electrolyte
                },
                {
                    name: "inorganic compound",
                    subClassMetadataTemplate: subClassMetadataTemplates.chemical["inorganic compound"]
                },
                {
                    name: "metal",
                    subClassMetadataTemplate: subClassMetadataTemplates.chemical.metal
                },
                {
                    name: "organic compound",
                    subClassMetadataTemplate: subClassMetadataTemplates.chemical["organic compound"]
                },
                {
                    name: "polymer",
                    subClassMetadataTemplate: subClassMetadataTemplates.chemical.polymer
                },
                {
                    name: "semiconductor",
                    subClassMetadataTemplate: subClassMetadataTemplates.chemical.semiconductor
                },
                {
                    name: "separator",
                    subClassMetadataTemplate: subClassMetadataTemplates.chemical.separator
                },
                {
                    name: "solvent",
                    subClassMetadataTemplate: subClassMetadataTemplates.chemical.solvent
                },
            ],
            fieldOfUse: ["electrode", "electrochemical cell", "synthesis", "undefined"],
            supplier: [
                { name: "abcr", web: "https://www.abcr.com" },
                { name: "Alfa Aesar", web: "https://www.alfa.com" },
                { name: "Acros Organics", web: "https://www.acros.com" },
                { name: "Carl Roth", web: "https://www.carlroth.com" },
                { name: "Merck", web: "https://www.merck.com" },
                { name: "Sigma Aldrich", web: "https://www.sigmaaldrich.com" },
                { name: "VWR", web: "https://www.vwr.com" },
                { name: "TCI", web: "https://www.tci-chemicals.com" },
                { name: "other", web: "https://www.other.com" },
            ],
            manufacturer: [
                { name: "abcr", web: "https://www.abcr.com" },
                { name: "Alfa Aesar", web: "https://www.alfa.com" },
                { name: "Acros Organics", web: "https://www.acros.com" },
                { name: "Carl Roth", web: "https://www.carlroth.com" },
                { name: "Merck", web: "https://www.merck.com" },
                { name: "Sigma Aldrich", web: "https://www.sigmaaldrich.com" },
                { name: "VWR", web: "https://www.vwr.com" },
                { name: "TCI", web: "https://www.tci-chemicals.com" },
                { name: "other", web: "https://www.other.com" },
            ],
            fileName: {
                segments: [
                    { kind: "field", path: "chemical.name", separator: "" },
                ]
            },
            folderPath: {
                segments: [
                    { kind: "literal", value: "Resources/Chemicals", separator: "/" },
                    { kind: "field", path: "chemical.type", separator: "" },
                ]
            },
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.chemical,
            markdownTemplate: markdownTemplates.chemical,
        },
        contact: {
            navbar: {
                display: true,
                name: "Contact",
                group: "other"
            },
            commands: {
                enabled: true,
                id: "create-contact-note",
                name: "Create Contact Note"
            },
            fileName: {
                segments: [
                    { kind: "field", path: "name.given name", separator: " " },
                    { kind: "field", path: "name.family name", separator: "" }
                ]
            },
            folderPath: {
                segments: [
                    { kind: "literal", value: "Contacts", separator: "/" },
                    { kind: "field", path: "address.work.affiliation", separator: "" }
                ]
            },
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.contact,
            markdownTemplate: markdownTemplates.contact,
        },
        dailyNote: {
            navbar: {
                display: true,
                name: "Daily Note",
                group: "other"
            },
            commands: {
                enabled: true,
                id: "create-daily-note",
                name: "Create Daily Note"
            },
            fileName: {
                segments: [
                    { kind: "function", context: ["date"], expression: "date.format('YYYY-MM-DD - dddd, D. MMMM')", separator: "" }
                ]
            },
            folderPath: {
                segments: [
                    { kind: "literal", value: "Daily Notes", separator: "/" },
                    { kind: "function", context: ["date"], expression: "date.year()", separator: "/" },
                    { kind: "function", context: ["date"], expression: "date.format('MM')", separator: " " },
                    { kind: "function", context: ["date"], expression: "date.monthName()", separator: "" }
                ]
            },
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.dailyNote,
            markdownTemplate: markdownTemplates.dailyNote,
        },
        device: {
            navbar: {
                display: true,
                name: "Device",
                group: "resources"
            },
            commands: {
                enabled: true,
                id: "create-device-note",
                name: "Create Device Note"
            },
            type: [
                { name: "balance", method: ["weighing"] },
                { name: "coater", method: ["spin coating", "doctor blade", "slot die", "spray coating"] },
                { name: "ball mill", method: ["planetary ball mill", "vibrating ball mill"] },
                { name: "broad ion beam cutter", method: ["ion beam milling", "ion beam polishing"] },
                { name: "sputter coater", method: ["sputtering", "magnetron sputtering"] },
                { name: "thermal evaporator", method: ["thermal evaporation", "electron beam evaporation"] },
                { name: "plasma cleaner", method: ["plasma cleaning", "plasma etching"] },
                { name: "fume hood", method: ["fume extraction"] },
                { name: "furnace", method: ["sintering", "calcination"] },
                { name: "glove box", method: ["inert atmosphere handling"] },
                { name: "hot plate", method: ["heating"] },
                { name: "oven", method: ["drying", "curing"] },
                { name: "centrifuge", method: ["centrifugation"] },
                { name: "sonicator", method: ["ultrasonic cleaning", "sonication"] },
                { name: "stirrer", method: ["magnetic stirring", "overhead stirring"] },
                { name: "pH meter", method: ["pH measurement"] },
                { name: "other", method: ["undefined"] },
            ],
            fileName: {
                segments: [
                    { kind: "field", path: "device.manufacturer", separator: " - " },
                    { kind: "field", path: "device.name", separator: "" }
                ]
            },
            folderPath: {
                segments: [
                    { kind: "literal", value: "Resources/Devices", separator: "/" },
                    { kind: "field", path: "device.manufacturer", separator: " - " },
                    { kind: "field", path: "device.name", separator: "" }
                ]
            },
            createSubfolder: ["Documents"],
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.device,
            markdownTemplate: markdownTemplates.device,
        },
        echemCell: {
            navbar: {
                display: true,
                name: "Electrochemical Cell",
                group: "resources"
            },
            commands: {
                enabled: true,
                id: "create-echemcell-note",
                name: "Create Electrochemical Cell Note"
            },
            type: [
                {
                    name: "coin cell",
                    subClassMetadataTemplate: subClassMetadataTemplates.echemCell.coin,
                },
                {
                    name: "swagelok",
                    subClassMetadataTemplate: subClassMetadataTemplates.echemCell.swagelok
                },
                {
                    name: "custom",
                    subClassMetadataTemplate: subClassMetadataTemplates.echemCell.custom
                },
                {
                    name: "pouch bag",
                    subClassMetadataTemplate: subClassMetadataTemplates.echemCell.pouch
                }
            ],
            fileName: {
                segments: [
                    { kind: "field", path: "cell.name", separator: "" }
                ]
            },
            folderPath: {
                segments: [
                    { kind: "literal", value: "Resources/Electrochemical Cells", separator: "" }
                ]
            },
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.echemCell,
            markdownTemplate: markdownTemplates.echemCell,
        },
        electrode: {
            navbar: {
                display: true,
                name: "Electrode",
                group: "resources"
            },
            commands: {
                enabled: true,
                id: "create-electrode-note",
                name: "Create Electrode Note"
            },
            type: [
                {
                    name: "reference",
                    subClassMetadataTemplate: subClassMetadataTemplates.electrode.reference
                },
                {
                    name: "standard",
                    subClassMetadataTemplate: subClassMetadataTemplates.electrode.standard
                },
            ],
            fileName: {
                segments: [
                    { kind: "field", path: "electrode.name", separator: "" }
                ]
            },
            folderPath: {
                segments: [
                    { kind: "literal", value: "Resources/Electrodes", separator: "" }
                ]
            },
            createSubfolder: ["Documents"],
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.electrode,
            markdownTemplate: markdownTemplates.electrode,
        },
        instrument: {
            navbar: {
                display: true,
                name: "Instrument",
                group: "resources"
            },
            commands: {
                enabled: true,
                id: "create-instrument-note",
                name: "Create Instrument Note"
            },
            type: [
                {
                    name: "X-ray diffractometer",
                    abbreviation: "XRD",
                    technique: ["diffraction (reflection mode)", "diffraction (transmission mode)"],
                },
                {
                    name: "Scanning electron microscope",
                    abbreviation: "SEM",
                    technique: ["SE inlens", "SE thorny", "BSE", "EDS", "EBSD", "STEM", "EsB"],
                },
                {
                    name: "Transmission electron microscope",
                    abbreviation: "TEM",
                    technique: ["SAED", "HRTEM", "STEM", "EELS", "EDS"],
                },
                {
                    name: "Atomic force microscope",
                    abbreviation: "AFM",
                    technique: ["topography", "phase contrast", "conductivity", "magnetic force", "electric force"],
                },
                {
                    name: "other",
                    abbreviation: "NN",
                    technique: ["undefined"],
                }
            ],
            fileName: {
                segments: [
                    { kind: "field", path: "instrument.manufacturer", separator: " - " },
                    { kind: "field", path: "instrument.name", separator: "" }
                ]
            },
            folderPath: {
                segments: [
                    { kind: "literal", value: "Resources/Instruments", separator: "/" },
                    { kind: "field", path: "instrument.manufacturer", separator: " - " },
                    { kind: "field", path: "instrument.name", separator: "" }
                ]
            },
            createSubfolder: ["Documents"],
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.instrument,
            markdownTemplate: markdownTemplates.instrument,
        },
        lab: {
            navbar: {
                display: true,
                name: "Lab",
                group: "resources"
            },
            commands: {
                enabled: true,
                id: "create-lab-note",
                name: "Create Lab Note"
            },
            type: [ "chemical lab", "materials lab", "electrochemical lab", "physics lab", "biology lab", "clean room" ],
            fileName: {
                segments: [
                    { kind: "field", path: "lab.room", separator: " - " },
                    { kind: "field", path: "lab.name", separator: "" }
                ]
            },
            folderPath: {
                segments: [
                    { kind: "literal", value: "Resources/Labs", separator: "/" },
                    { kind: "field", path: "lab.building", separator: "" }
                ]
            },
            createSubfolder: [],
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.lab,
            markdownTemplate: markdownTemplates.lab,
        },
        meeting: {
            navbar: {
                display: true,
                name: "Meeting",
                group: "other"
            },
            commands: {
                enabled: true,
                id: "create-meeting-note",
                name: "Create Meeting Note"
            },
            type: ["meeting", "conference", "workshop", "symposium"],
            fileName: {
                segments: [
                    { kind: "field", path: "meeting.date", separator: " - " },
                    { kind: "field", path: "meeting.title", separator: "" }
                ]
            },
            folderPath: {
                segments: [
                    { kind: "literal", value: "Meetings", separator: "/" },
                    { kind: "function", context: ["date"], expression: "date.year()", separator: "/" },
                    { kind: "function", context: ["date"], expression: "date.format('MM')", separator: " " },
                    { kind: "function", context: ["date"], expression: "date.monthName()", separator: "" }
                ]
            },
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.meeting,
            markdownTemplate: markdownTemplates.meeting,
        },
        process: {
            navbar: {
                display: true,
                name: "Process",
                group: "experiments"
            },
            commands: {
                enabled: true,
                id: "create-process-note",
                name: "Create Process Note"
            },
            class: "organic synthesis",
            type: ["synthesis", "polymerization", "functionalization", "deprotection", "protection"],
            fileName: {
                segments: [
                    { kind: "field", path: "process.name", separator: "" }
                ]
            },
            folderPath: {
                segments: [
                    { kind: "literal", value: "Processes", separator: "/" },
                    { kind: "field", path: "process.class", separator: "" }
                ]
            },
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.process,
            markdownTemplate: markdownTemplates.process,
        },
        project: {
            navbar: {
                display: true,
                name: "Project",
                group: "other"
            },
            commands: {
                enabled: true,
                id: "create-project-note",
                name: "Create Project Note"
            },
            type: [
                {
                    name: "research",
                    category: ["chemistry", "electrochemistry", "physics", "materials science", "engineering"],
                    subClassMetadataTemplate: subClassMetadataTemplates.project.research,
                    autoCreate: ["sampleList"],
                },
                {
                    name: "development",
                    category: ["battery", "fuel cell", "supercapacitor", "electrolyzer"],
                    subClassMetadataTemplate: subClassMetadataTemplates.project.development,
                },
                {
                    name: "programming",
                    category: ["application", "webapp", "backend", "database", "data analysis", "machine learning"],
                    subClassMetadataTemplate: subClassMetadataTemplates.project.programming,
                },
                {
                    name: "meeting",
                    category: ["conference", "workshop", "symposium"],
                    subClassMetadataTemplate: subClassMetadataTemplates.project.meeting,
                },
            ],
            fileName: {
                segments: [
                    { kind: "field", path: "project.name", separator: "" }
                ]
            },
            folderPath: {
                segments: [
                    { kind: "literal", value: "Projects", separator: "/" },
                    { kind: "field", path: "project.type", separator: "/" },
                    { kind: "field", path: "project.name", separator: "" }
                ]
            },
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.project,
            markdownTemplate: markdownTemplates.project,
        },
        sample: {
            navbar: {
                display: true,
                name: "Sample",
                group: "experiments"
            },
            commands: {
                enabled: true,
                id: "create-sample-note",
                name: "Create Sample Note"
            },
            type: [
                {
                    name: "compound",
                    abbreviation: "CPD",
                    subClassMetadataTemplate: subClassMetadataTemplates.sample.compound,
                },
                {
                    name: "electrode",
                    abbreviation: "ELE",
                    subClassMetadataTemplate: subClassMetadataTemplates.sample.electrode,
                },
                {
                    name: "electrochemical cell",
                    abbreviation: "CELL",
                    subClassMetadataTemplate: subClassMetadataTemplates.sample["electrochemical cell"],
                }
            ],
            fileName: {
                segments: [
                    { kind: "function", context: ["settings", "userInput"], expression: "settings.general.operators.find(op => op.name === userInput.sample?.operator)?.initials || 'XX'", separator: "-" },
                    { kind: "function", context: ["noteMetadata", "userInput"], expression: "noteMetadata.get(userInput.project?.name)?.project?.abbreviation || 'PRJ'", separator: "-" },
                    { kind: "function", context: ["settings", "userInput"], expression: "settings.note.sample.type.find(t => t.name === userInput.sample?.type)?.abbreviation || 'SMP'", separator: "-" },
                    { kind: "counter", prefix: "", separator: "", width: 3 }
                ]
            },
            folderPath: {
                segments: [
                    { kind: "literal", value: "Experiments/Samples", separator: "/" },
                    { kind: "field", path: "project.name", separator: "/" },
                    { kind: "field", path: "sample.type", separator: "" }
                ]
            },
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.sample,
            markdownTemplate: markdownTemplates.sample,
        },
        sampleList: {
            navbar: {
                display: true,
                name: "Sample List",
                group: "experiments"
            },
            commands: {
                enabled: true,
                id: "create-sample-list-note",
                name: "Create Sample List Note"
            },
            fileName: {
                segments: [
                    { kind: "literal", value: "Samples", separator: " - " },
                    { kind: "field", path: "project.name", separator: "" }
                ]
            },
            folderPath: {
                segments: [
                    { kind: "literal", value: "Projects", separator: "/" },
                    { kind: "field", path: "project.name", separator: "" }
                ]
            },
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.sampleList,
            markdownTemplate: markdownTemplates.sampleList,
        },
        default: {
            navbar: {
                display: false,
                name: "Default Note",
                group: "other"
            },
            commands: {
                enabled: false,
                id: "create-default-note",
                name: "Create Default Note"
            },
            fileName: {
                segments: [
                    { kind: "literal", value: "Untiteled Note", separator: "" }
                ]
            },
            folderPath: {
                segments: [
                    { kind: "literal", value: "Notes", separator: "" }
                ]
            },
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.default,
            markdownTemplate: markdownTemplates.default,
        },
        test: {
            navbar: {
                display: true,
                name: "Test Note",
                group: "other"
            },
            commands: {
                enabled: true,
                id: "create-test-note",
                name: "Create Test Note"
            },
            fileName: {
                segments: [
                    { kind: "field", path: "test.title", separator: "" }
                ]
            },
            folderPath: {
                segments: [
                    { kind: "literal", value: "Test Notes", separator: "" }
                ]
            },
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.test,
            markdownTemplate: markdownTemplates.test,
        },
    },
    npe: {
        showDataTypes: true,
    },
};
