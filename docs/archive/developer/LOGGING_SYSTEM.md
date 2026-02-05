# ELN Plugin Logging System

The ELN plugin uses a centralized logging system that provides granular control over debug output from different components.

## Features

- **Component-based logging**: Each component has its own log level
- **Runtime control**: Change log levels without restarting
- **Structured output**: All log messages are prefixed with component names
- **Performance friendly**: Debug messages are only processed when needed

## Components

The logging system recognizes these components:

- `main` - Main plugin lifecycle
- `npe` - Nested Properties Editor
- `modal` - Modal dialogs (NewNoteModal, etc.)
- `api` - API calls (ChemicalLookup, etc.)
- `template` - Template processing
- `note` - Note creation and processing
- `path` - Path template parsing
- `metadata` - Metadata processing
- `settings` - Settings management
- `ui` - General UI components
- `events` - Event handling
- `navbar` - Navigation bar
- `view` - Views and rendering
- `general` - General/uncategorized

## Log Levels

- `debug` - Detailed debug information
- `info` - General information
- `warn` - Warnings
- `error` - Errors

## Usage in Code

```typescript
import { createLogger } from "../../utils/Logger";

// Create a component-specific logger
const logger = createLogger('npe');

// Use it instead of console.log/console.debug
logger.debug("Processing item:", item);
logger.info("Operation completed");
logger.warn("Deprecated feature used");
logger.error("Operation failed", error);
```

## Default Configuration

By default, the system is configured to:
- Show only warnings/errors for stable components (like NPE)
- Show debug messages for components under development
- Always show warnings and errors

## Commands

The plugin provides these commands for runtime control:

- **Enable debug logging for NPE** - Shows all NPE debug messages
- **Quiet NPE logging** - Only shows NPE warnings/errors
- **Enable debug logging for modals** - Shows all modal debug messages  
- **Quiet modal logging** - Only shows modal warnings/errors
- **Show current logger configuration** - Displays current log levels

## Benefits

1. **Cleaner console**: No more noise from stable components
2. **Focused debugging**: Enable debug only for the component you're working on
3. **Better performance**: Debug messages are skipped when not needed
4. **Consistent formatting**: All messages have component prefixes
5. **Easy maintenance**: Central configuration for all logging

## Migration

To migrate existing console.log/console.debug calls:

1. Import the logger: `import { createLogger } from "../utils/Logger";`
2. Create component logger: `const logger = createLogger('component');`
3. Replace calls:
   - `console.log()` → `logger.info()`
   - `console.debug()` → `logger.debug()`
   - `console.warn()` → `logger.warn()`
   - `console.error()` → `logger.error()`
