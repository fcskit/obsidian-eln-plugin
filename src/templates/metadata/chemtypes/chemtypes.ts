import { acidSubclassMetadataTemplate } from "./acid";
import { activeMaterialSubclassMetadataTemplate } from "./activeMaterial";
import { binderSubclassMetadataTemplate } from "./binder";
import { conductiveAdditiveSubclassMetadataTemplate } from "./conductiveAdditive";
import { currentCollectorSubclassMetadataTemplate } from "./currentCollector";
import { electrolyteSubclassMetadataTemplate } from "./electrolyte";
import { inorganicCompoundSubclassMetadataTemplate } from "./inorganicCompound";
import { metalSubclassMetadataTemplate } from "./metal";
import { organicCompoundSubclassMetadataTemplate } from "./organicCompound";
import { polymerSubclassMetadataTemplate } from "./polymer";
import { semiconductorSubclassMetadataTemplate } from "./semiconductor";
import { separatorSubclassMetadataTemplate } from "./separator";
import { solventSubclassMetadataTemplate } from "./solvent";

export const chemTypesMetadataTemplates = {
    "acid": acidSubclassMetadataTemplate,
    "active material": activeMaterialSubclassMetadataTemplate,
    "binder": binderSubclassMetadataTemplate,
    "conductive additive": conductiveAdditiveSubclassMetadataTemplate,
    "current collector": currentCollectorSubclassMetadataTemplate,
    "electrolyte": electrolyteSubclassMetadataTemplate,
    "inorganic compound": inorganicCompoundSubclassMetadataTemplate,
    "metal": metalSubclassMetadataTemplate,
    "organic compound": organicCompoundSubclassMetadataTemplate,
    "polymer": polymerSubclassMetadataTemplate,
    "semiconductor": semiconductorSubclassMetadataTemplate,
    "separator": separatorSubclassMetadataTemplate,
    "solvent": solventSubclassMetadataTemplate
}