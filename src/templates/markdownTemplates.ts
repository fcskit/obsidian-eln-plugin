import { App, TFile } from "obsidian";
import { ELNSettings } from "../settings/settings";

import analysisMarkdownTemplate from "./markdown/analysis";
import chemicalMarkdownTemplate from "./markdown/chemical";
import contactMarkdownTemplate from "./markdown/contact";
import dailyNoteMarkdownTemplate from "./markdown/dailynote";
import defaultMarkdownTemplate from "./markdown/default";
import deviceMarkdownTemplate from "./markdown/device";
import instrumentMarkdownTemplate from "./markdown/instrument";
import meetingMarkdownTemplate from "./markdown/meeting";
import processMarkdownTemplate from "./markdown/process";
import projectMarkdownTemplate from "./markdown/project";
import sampleMarkdownTemplate from "./markdown/sample";
import sampleListMarkdownTemplate from "./markdown/samplelist";

export const markdownTemplates = {
    analysis: analysisMarkdownTemplate,
    chemical: chemicalMarkdownTemplate,
    contact: contactMarkdownTemplate,
    dailyNote: dailyNoteMarkdownTemplate,
    default: defaultMarkdownTemplate,
    device: deviceMarkdownTemplate,
    instrument: instrumentMarkdownTemplate,
    meeting: meetingMarkdownTemplate,
    process: processMarkdownTemplate,
    project: projectMarkdownTemplate,
    sample: sampleMarkdownTemplate,
    sampleList: sampleListMarkdownTemplate,
};

export async function loadMarkdownTemplates(app: App, settings: ELNSettings) {
    const markdownTemplates: Record<string, string> = {};

    const templateFiles = {
        analysis: "templates/markdown/analysis.md",
        chemical: "templates/markdown/chemical.md",
        contact: "templates/markdown/contact.md",
        dailyNote: "templates/markdown/dailynote.md",
        device: "templates/markdown/device.md",
        instrument: "templates/markdown/instrument.md",
        meeting: "templates/markdown/meeting.md",
        process: "templates/markdown/process.md",
        project: "templates/markdown/project.md",
        sample: "templates/markdown/sample.md",
        sampleList: "templates/markdown/sample_list.md",
    };

    for (const [key, defaultPath] of Object.entries(templateFiles)) {
        const noteSettings = settings.note[key as keyof ELNSettings["note"]];
        let templatePath = defaultPath;

        // Check if a custom template is enabled and a path is provided
        if (noteSettings?.customMarkdownTemplate && noteSettings.customMarkdownTemplatePath) {
            templatePath = noteSettings.customMarkdownTemplatePath;
        }

        const file = app.vault.getAbstractFileByPath(templatePath);
        if (file && file instanceof TFile) {
            const content = await app.vault.read(file);
            markdownTemplates[key] = content;
        } else {
            console.warn(`Markdown template not found: ${templatePath}`);
        }
    }

    return markdownTemplates;
}