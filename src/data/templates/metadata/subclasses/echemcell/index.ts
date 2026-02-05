import { coinCellSubclassMetadataTemplate } from "./coin";
import { customCellSubclassMetadataTemplate } from "./custom";
import { pouchCellSubclassMetadataTemplate } from "./pouch";
import { swagelokCellSubclassMetadataTemplate } from "./swagelok";

export const echemCellSubclassMetadataTemplates = {
    "coin": coinCellSubclassMetadataTemplate,
    "custom": customCellSubclassMetadataTemplate,
    "pouch": pouchCellSubclassMetadataTemplate,
    "swagelok": swagelokCellSubclassMetadataTemplate
};