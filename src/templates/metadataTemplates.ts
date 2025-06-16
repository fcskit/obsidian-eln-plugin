import { App, TFile } from "obsidian";
import { ELNSettings } from "../settings/settings";
import { MetaDataTemplate } from "../utils/types";

import analysisMetadataTemplate from "./metadata/analysis";
import chemicalMetadataTemplate from "./metadata/chemical";
import contactMetadataTemplate from "./metadata/contact";
import dailyNoteMetadataTemplate from "./metadata/dailynote";
import defaultMetadataTemplate from "./metadata/default";
import deviceMetadataTemplate from "./metadata/device";
import instrumentMetadataTemplate from "./metadata/instrument";
import meetingMetadataTemplate from "./metadata/meeting";
import processMetadataTemplate from "./metadata/process";
import projectMetadataTemplate from "./metadata/project";
import sampleMetadataTemplate from "./metadata/sample";
import sampleListMetadataTemplate from "./metadata/samplelist";

export const metadataTemplates = {
    analysis: analysisMetadataTemplate,
    chemical: chemicalMetadataTemplate,
    contact: contactMetadataTemplate,
    dailyNote: dailyNoteMetadataTemplate,
    default: defaultMetadataTemplate,
    device: deviceMetadataTemplate,
    instrument: instrumentMetadataTemplate,
    meeting: meetingMetadataTemplate,
    process: processMetadataTemplate,
    project: projectMetadataTemplate,
    sample: sampleMetadataTemplate,
    sampleList: sampleListMetadataTemplate,
};

export async function loadMetadataTemplates(app: App, settings: ELNSettings) {
    const metadataTemplates: Record<string, MetaDataTemplate> = {};

    const templateFiles = {
        analysis: "templates/metadata/analysis.json",
        chemical: "templates/metadata/chemical.json",
        contact: "templates/metadata/contact.json",
        dailyNote: "templates/metadata/dailynote.json",
        device: "templates/metadata/device.json",
        instrument: "templates/metadata/instrument.json",
        meeting: "templates/metadata/meeting.json",
        process: "templates/metadata/process.json",
        project: "templates/metadata/project.json",
        sample: "templates/metadata/sample.json",
        sampleList: "templates/metadata/sample_list.json",
    };

    for (const [key, defaultPath] of Object.entries(templateFiles)) {
        const noteSettings = settings.note[key as keyof typeof settings.note];
        let templatePath = defaultPath;

        // Check if a custom template is enabled and a path is provided
        if (noteSettings?.customMetadataTemplate && noteSettings.customMetadataTemplatePath) {
            templatePath = noteSettings.customMetadataTemplatePath;
        }

        const file = app.vault.getAbstractFileByPath(templatePath);
        if (file && file instanceof TFile) {
            const content = await app.vault.read(file);
            metadataTemplates[key] = JSON.parse(content);
        } else {
            console.warn(`Metadata template not found: ${templatePath}`);
        }
    }

    return metadataTemplates;
}