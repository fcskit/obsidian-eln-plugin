import { researchSubclassMetadataTemplate } from "./research";
import { developmentSubclassMetadataTemplate } from "./development";
import { programmingSubclassMetadataTemplate } from "./programming";
import { meetingSubclassMetadataTemplate } from "./meeting";
// import type { MetaDataTemplate } from "../../../types";

export const projectTypesMetadataTemplates: Record<string, any> = {
    "research": researchSubclassMetadataTemplate,
    "development": developmentSubclassMetadataTemplate,
    "programming": programmingSubclassMetadataTemplate,
    "meeting": meetingSubclassMetadataTemplate,
};