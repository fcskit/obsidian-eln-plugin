# Renderer Folder Reorganization

The `src/renderer` folder has been reorganized for better maintainability and structure.

## New Structure

```
src/renderer/
├── npe/                           # Nested Properties Editor specific code
│   ├── core/                      # Core rendering functions
│   │   ├── renderFrontMatter.ts   # Main entry point for NPE
│   │   ├── renderObject.ts        # Object rendering logic
│   │   ├── renderPrimitive.ts     # Primitive value rendering
│   │   ├── renderArray.ts         # Array rendering
│   │   ├── renderObjectContainer.ts
│   │   ├── renderObjectArray.ts
│   │   ├── renderPrimitiveArray.ts
│   │   ├── renderArrayValueContainer.ts
│   │   └── renderObjectOfArray.ts
│   ├── buttons/                   # Button creation functions
│   │   ├── createAddPropertyButton.ts
│   │   ├── createToggleButton.ts
│   │   ├── createReloadButton.ts
│   │   ├── createFixDepricatedPropertiesButton.ts
│   │   └── createOptionsMenuButton.ts
│   ├── elements/                  # Element creation helpers
│   │   ├── createInternalLinkElement.ts
│   │   ├── createExternalLinkElement.ts
│   │   ├── createInternalFileLink.ts
│   │   ├── createExternalLink.ts
│   │   ├── createInternalFileLinkWithIcon.ts
│   │   ├── createExternalLinkWithIcon.ts
│   │   └── createResizableInput.ts
│   ├── helpers/                   # Helper functions
│   │   ├── getPropertyIcon.ts
│   │   ├── getPropertyInputType.ts
│   │   ├── getDataType.ts
│   │   ├── getFrontmatterValue.ts
│   │   ├── addToggleEvent.ts
│   │   ├── addKeyWrapperResizeHandle.ts
│   │   ├── addProperty.ts
│   │   ├── updateDataKeys.ts
│   │   ├── updateArrayDataKeyIndices.ts
│   │   └── showTypeSwitchMenu.ts
│   ├── legacy/                    # Legacy functions (re-exports to utils)
│   │   ├── updateProperties.ts    # Re-exports from ../../../utils/updateProperties
│   │   └── changeKeyName.ts       # Re-exports from ../../../utils/changeKeyName
│   └── index.ts                   # Main export file for NPE
├── components/                    # Other component renderers
│   ├── renderCircularProgress.ts
│   ├── renderImageViewer.ts
│   ├── renderPeriodicTable.ts
│   ├── latexToHTML.ts
│   └── index.ts                   # Main export file for components
```

## Import Changes

### Before
```typescript
import { renderFrontMatter } from "./renderer/renderFrontMatter";
import { createAddPropertyButton } from "./renderer/createAddPropertyButton";
```

### After
```typescript
import { renderFrontMatter } from "./renderer/npe/core/renderFrontMatter";
import { createAddPropertyButton } from "./renderer/npe/buttons/createAddPropertyButton";

// Or using the index exports:
import { renderFrontMatter, createAddPropertyButton } from "./renderer/npe";
```

## Benefits

1. **Better Organization**: Related files are grouped together
2. **Clearer Separation**: Core rendering, UI elements, and helpers are clearly separated
3. **Easier Maintenance**: Finding specific functionality is more intuitive
4. **Scalability**: Easy to add new components in appropriate folders
5. **Legacy Support**: Old functions are re-exported from utils for backward compatibility

## Migration Notes

- Main API entry point (`renderFrontMatter`) is now in `npe/core/`
- All button creation functions moved to `npe/buttons/`
- Element creation helpers moved to `npe/elements/`
- Utility functions moved to `npe/helpers/`
- Legacy functions in `npe/legacy/` re-export from the new utils folder
- Component renderers (non-NPE) moved to `components/`

## TODO

Some imports in the moved files still need to be updated to reflect the new structure. This should be done systematically by:

1. Updating relative imports in all moved files
2. Fixing imports in consuming files (views, main.ts, etc.)
3. Testing that all functionality still works
