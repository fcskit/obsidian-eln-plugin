// Main rendering functions
export { renderFrontMatter } from "./core/renderFrontMatter";
export { renderObject } from "./core/renderObject";
export { renderPrimitive } from "./core/renderPrimitive";
export { renderArray } from "./core/renderArray";
export { renderObjectContainer } from "./core/renderObjectContainer";
export { renderObjectArray } from "./core/renderObjectArray";
export { renderPrimitiveArray } from "./core/renderPrimitiveArray";
export { renderArrayValueContainer } from "./core/renderArrayValueContainer";
export { renderObjectOfArray } from "./core/renderObjectOfArray";

// Button components
export { createAddPropertyButton } from "./buttons/createAddPropertyButton";
export { createToggleButton } from "./buttons/createToggleButton";
export { createReloadButton } from "./buttons/createReloadButton";
export { createFixDepricatedPropertiesButton } from "./buttons/createFixDepricatedPropertiesButton";
export { createOptionsMenuButton } from "./buttons/createOptionsMenuButton";

// Element components
export { createInternalLinkElement } from "./elements/createInternalLinkElement";
export { createExternalLinkElement } from "./elements/createExternalLinkElement";
export { createInternalFileLink } from "./elements/createInternalFileLink";
export { createExternalLink } from "./elements/createExternalLink";
export { createInternalFileLinkWithIcon } from "./elements/createInternalFileLinkWithIcon";
export { createExternalLinkWithIcon } from "./elements/createExternalLinkWithIcon";
export { createResizableInput } from "./elements/createResizableInput";

// Helper functions
export { getPropertyIcon } from "./helpers/getPropertyIcon";
export { getPropertyInputType } from "./helpers/getPropertyInputType";
export { getDataType } from "./helpers/getDataType";
export { getFrontmatterValue } from "./helpers/getFrontmatterValue";
export { addToggleEvent } from "./helpers/addToggleEvent";
export { addKeyWrapperResizeHandle } from "./helpers/addKeyWrapperResizeHandle";
export { addProperty } from "./helpers/addProperty";
export { updateDataKeys } from "./helpers/updateDataKeys";
export { updateArrayDataKeyIndices } from "./helpers/updateArrayDataKeyIndices";
export { showTypeSwitchMenu } from "./helpers/showTypeSwitchMenu";

// Legacy functions (re-exports to utils)
export { updateProperties } from "./legacy/updateProperties";
export { changeKeyName } from "./legacy/changeKeyName";
