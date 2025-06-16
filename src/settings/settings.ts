import { PathTemplate, MetaDataTemplate } from "../utils/types";
import { metadataTemplates } from "../templates/metadataTemplates";
import { markdownTemplates } from "../templates/markdownTemplates";

export interface ELNSettings {
    addNavbar: boolean;
    addFooter: boolean;
    includeVersion: boolean;
    includeAuthor: boolean;
    authors: { name: string; initials: string }[];
    operators: { name: string; initials: string }[];
    note: {
        analysis: {
            status: string[];
            titleTemplate: PathTemplate;
            folderTemplate: PathTemplate;
            customMetadataTemplate: boolean;
            customMarkdownTemplate: boolean;
            customMetadataTemplatePath: string;
            customMarkdownTemplatePath: string;
            metadataTemplate: MetaDataTemplate;
            markdownTemplate: string;
        };
        chemical: {
            type: string[];
            fieldOfUse: string[];
            supplier: { name: string; web: string }[];
            manufacturer: { name: string; web: string }[];
            titleTemplate: PathTemplate;
            folderTemplate: PathTemplate;
            customMetadataTemplate: boolean;
            customMarkdownTemplate: boolean;
            customMetadataTemplatePath: string;
            customMarkdownTemplatePath: string;
            metadataTemplate: MetaDataTemplate;
            markdownTemplate: string;
        };
        dailyNote: {
            titleTemplate: PathTemplate;
            folderTemplate: PathTemplate;
            customMetadataTemplate: boolean;
            customMarkdownTemplate: boolean;
            customMetadataTemplatePath: string;
            customMarkdownTemplatePath: string;
            metadataTemplate: MetaDataTemplate;
            markdownTemplate: string;
        };
        device: {
            type: { name: string; method: string[] }[];
            titleTemplate: PathTemplate;
            folderTemplate: PathTemplate;
            customMetadataTemplate: boolean;
            customMarkdownTemplate: boolean;
            customMetadataTemplatePath: string;
            customMarkdownTemplatePath: string;
            metadataTemplate: MetaDataTemplate;
            markdownTemplate: string;
        };
        instrument: {
            type: { name: string; abbreviation: string; technique: string[] }[];
            titleTemplate: PathTemplate;
            folderTemplate: PathTemplate;
            customMetadataTemplate: boolean;
            customMarkdownTemplate: boolean;
            customMetadataTemplatePath: string;
            customMarkdownTemplatePath: string;
            metadataTemplate: MetaDataTemplate;
            markdownTemplate: string;
        };
        meeting: {
            type: string[];
            titleTemplate: PathTemplate;
            folderTemplate: PathTemplate;
            customMetadataTemplate: boolean;
            customMarkdownTemplate: boolean;
            customMetadataTemplatePath: string;
            customMarkdownTemplatePath: string;
            metadataTemplate: MetaDataTemplate;
            markdownTemplate: string;
        };
        process: {
            class: string;
            type: string[];
            titleTemplate: PathTemplate;
            folderTemplate: PathTemplate;
            customMetadataTemplate: boolean;
            customMarkdownTemplate: boolean;
            customMetadataTemplatePath: string;
            customMarkdownTemplatePath: string;
            metadataTemplate: MetaDataTemplate;
            markdownTemplate: string;
        };
        project: {
            type: { name: string; category: string[] }[];
            titleTemplate: PathTemplate;
            folderTemplate: PathTemplate;
            customMetadataTemplate: boolean;
            customMarkdownTemplate: boolean;
            customMetadataTemplatePath: string;
            customMarkdownTemplatePath: string;
            metadataTemplate: MetaDataTemplate;
            markdownTemplate: string;
        };
        sample: {
            type: string[];
            titleTemplate: PathTemplate;
            folderTemplate: PathTemplate;
            customMetadataTemplate: boolean;
            customMarkdownTemplate: boolean;
            customMetadataTemplatePath: string;
            customMarkdownTemplatePath: string;
            metadataTemplate: MetaDataTemplate;
            markdownTemplate: string;
        };
        sampleList: {
            titleTemplate: PathTemplate;
            folderTemplate: PathTemplate;
            customMetadataTemplate: boolean;
            customMarkdownTemplate: boolean;
            customMetadataTemplatePath: string;
            customMarkdownTemplatePath: string;
            metadataTemplate: MetaDataTemplate;
            markdownTemplate: string;
        };
        default: {
            titleTemplate: PathTemplate;
            folderTemplate: PathTemplate;
            customMetadataTemplate: boolean;
            customMarkdownTemplate: boolean;
            customMetadataTemplatePath: string;
            customMarkdownTemplatePath: string;
            metadataTemplate: MetaDataTemplate;
            markdownTemplate: string;
        };
    };
}

export const DEFAULT_SETTINGS: ELNSettings = {
    addNavbar: true,
    addFooter: true,
    includeVersion: true,
    includeAuthor: true,
    authors: [
        { name: "Anne Anybody", initials: "AA" },
        { name: "Nick Nobody", initials: "NN" },
    ],
    operators: [
        { name: "Anne Anybody", initials: "AA" },
        { name: "Nick Nobody", initials: "NN" },
    ],
    note: {
        analysis: {
            status: ["pending", "in progress", "completed", "failed"],
            titleTemplate: [
                { type: 'userInput' , field: "sample.name", separator: " - " },
                { type: 'userInput' , field: "analysis.method", separator: "_" },
                { type: 'index' , field: "02", separator: "" },
            ],
            folderTemplate: [
                { type: 'string', field: "Experiments/Analyses", separator: "/" },
                { type: 'userInput', field: "project.name", separator: "/" },
                { type: 'userInput', field: "sample.name", separator: "/" },
                { type: 'userInput', field: "analysis.method", separator: "_" },
                { type: 'index', field: "02", separator: "" },
            ],
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.analysis,
            markdownTemplate: markdownTemplates.analysis,
        },
        chemical: {
            type: [
                "active material",
                "binder",
                "conductive additive",
                "current collector",
                "electrolyte",
                "inorganic compound",
                "metal",
                "organic compound",
                "polymer",
                "semiconductor",
                "separator",
                "solvent",
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
            ],
            titleTemplate: [
                { type: 'userInput', field: "chemical.name", separator: "" },
            ],
            folderTemplate: [
                { type: 'string', field: "Resources/Chemicals", separator: "/" },
                { type: 'userInput', field: "chemical.type", separator: "" },
            ],
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.chemical,
            markdownTemplate: markdownTemplates.chemical,
        },
        dailyNote: {
            titleTemplate: [
                { type: 'dateField' , field: "currentDate", separator: " - " },
                { type: 'dateField' , field: "weekday", separator: ", " },
                { type: 'dateField' , field: "dayOfMonth", separator: ". " },
                { type: 'dateField' , field: "monthName", separator: "" },
            ],
            folderTemplate: [
                { type: 'string', field: "Daily Notes", separator: "/" },
                { type: 'dateField', field: "year", separator: "/" },
                { type: 'dateField', field: "month", separator: " " },
                { type: 'dateField', field: "monthName", separator: "" },
            ],
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.dailyNote,
            markdownTemplate: markdownTemplates.dailyNote,
        },
        device: {
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
            ],
            titleTemplate: [
                { type: 'userInput' , field: "device.manufacturer", separator: " - " },
                { type: 'userInput' , field: "device.name", separator: "" },
            ],
            folderTemplate: [
                { type: 'string', field: "Resources/Devices", separator: "/" },
                { type: 'userInput' , field: "device.manufacturer", separator: " - " },
                { type: 'userInput', field: "device.name", separator: "" },
            ],
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.device,
            markdownTemplate: markdownTemplates.device,
        },
        instrument: {
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
            ],
            titleTemplate: [
                { type: 'userInput' , field: "instrument.manufacturer", separator: " - " },
                { type: 'userInput' , field: "instrument.name", separator: "" },
            ],
            folderTemplate: [
                { type: 'string', field: "Resources/Devices", separator: "/" },
                { type: 'userInput' , field: "instrument.manufacturer", separator: " - " },
                { type: 'userInput' , field: "instrument.name", separator: "" },
            ],
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.instrument,
            markdownTemplate: markdownTemplates.instrument,
        },
        meeting: {
            type: ["meeting", "conference", "workshop", "symposium"],
            titleTemplate: [
                { type: 'userInput' , field: "meeting.date", separator: " - " },
                { type: 'userInput' , field: "meeting.title", separator: "" },
            ],
            folderTemplate: [
                { type: 'string', field: "Meetings", separator: "/" },
                { type: 'dateField', field: "year", separator: "/" },
                { type: 'dateField', field: "month", separator: " " },
                { type: 'dateField', field: "monthName", separator: "" },
            ],
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.meeting,
            markdownTemplate: markdownTemplates.meeting,
        },
        process: {
            class: "organic synthesis",
            type: ["synthesis", "polymerization", "functionalization", "deprotection", "protection"],
            titleTemplate: [
                { type: 'userInput' , field: "process.name", separator: "" },
            ],
            folderTemplate: [
                { type: 'string', field: "Processes", separator: "/" },
                { type: 'userInput' , field: "process.class", separator: "" },
            ],
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.process,
            markdownTemplate: markdownTemplates.process,
        },
        project: {
            type: [
                {
                    name: "research",
                    category: ["chemistry", "electrochemistry", "physics", "materials science", "engineering"],
                },
                {
                    name: "development",
                    category: ["battery", "fuel cell", "supercapacitor", "electrolyzer"],
                },
                {
                    name: "programming",
                    category: ["python", "javascript", "typescript", "java", "c++"],
                },
                {
                    name: "meeting",
                    category: ["conference", "workshop", "symposium"],
                },
            ],
            titleTemplate: [
                { type: 'userInput' , field: "project.name", separator: "" },
            ],
            folderTemplate: [
                { type: 'string', field: "Projects", separator: "/" },
                { type: 'userInput', field: "project.type", separator: "" },
            ],
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.project,
            markdownTemplate: markdownTemplates.project,
        },
        sample: {
            type: ["compound", "electrode", "electrochemical cell"],
            titleTemplate: [
                { type: 'operator' , field: "operators[sample.operator].initials", separator: "-" },
                { type: 'project' , field: "projects[project.name].abbreviation", separator: "-" },
                { type: 'setting' , field: "note.sample.type[sample.type].abbreviation", separator: "" },
                { type: 'index' , field: "03", separator: "" },
            ],
            folderTemplate: [
                { type: 'string', field: "Experiments/Samples", separator: "/" },
                { type: 'userInput' , field: "project.name", separator: "/" },
                { type: 'userInput', field: "sample.type", separator: "" },
            ],
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.sample,
            markdownTemplate: markdownTemplates.sample,
        },
        sampleList: {
            titleTemplate: [
                { type: 'string', field: "Samples", separator: " - " },
                { type: 'userInput', field: "project.name", separator: "" },
            ],
            folderTemplate: [
                { type: 'string', field: "Projects", separator: "/" },
                { type: 'userInput', field: "project.name", separator: "" },
            ],
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.sampleList,
            markdownTemplate: markdownTemplates.sampleList,
        },
        default: {
            titleTemplate: [
                { type: 'string', field: "Untiteled Note", separator: "" },
            ],
            folderTemplate: [
                { type: 'string', field: "Notes", separator: "" },
            ],
            customMetadataTemplate: false,
            customMarkdownTemplate: false,
            customMetadataTemplatePath: "",
            customMarkdownTemplatePath: "",
            metadataTemplate: metadataTemplates.default,
            markdownTemplate: markdownTemplates.default,
        },
    },
};
