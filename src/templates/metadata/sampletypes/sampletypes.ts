import { compoundSubclassMetadataTemplate } from "./compound";
import { electrodeSubclassMetadataTemplate } from "./electrode";
import { electrochemCellSubclassMetadataTemplate } from "./electrochemCell";

export const sampleTypesMetadataTemplates: Record<string, any> = {
    "compound": compoundSubclassMetadataTemplate,
    "electrode": electrodeSubclassMetadataTemplate,
    "electrochemical cell": electrochemCellSubclassMetadataTemplate,
};