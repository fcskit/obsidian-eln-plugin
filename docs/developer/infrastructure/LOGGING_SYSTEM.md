# Logging System

The Obsidian ELN Plugin features a sophisticated component-based logging system designed for development, debugging, and production monitoring. The system provides granular control over debug output from different components and supports both console and file logging.

## Overview

The logging system is built around a centralized `Logger` class that manages log levels for different components of the plugin. This allows developers to:

- Enable/disable debug output for specific components without affecting others
- Filter logs by severity level (debug, info, warn, error)
- Buffer logs to memory and flush to files for persistent debugging
- Control logging at runtime through VS Code commands
- Maintain performance in production by selectively disabling verbose logging

## Architecture

### Core Components

1. **Logger Class** (`src/utils/Logger.ts`) - Central logging manager
2. **Debug Commands** (`src/commands/debugCommands.ts`) - Runtime control commands
3. **Component Loggers** - Pre-configured loggers for each component

### Component Categories

The system recognizes these component types:

| Component | Purpose | Default Level |
|-----------|---------|---------------|
| `main` | Core plugin functionality | info |
| `npe` | Nested Properties Editor | warn |
| `modal` | Modal dialogs (NewNoteModal, etc.) | debug |
| `api` | External API calls (ChemicalLookup, etc.) | info |
| `template` | Template processing | debug |
| `note` | Note creation and processing | debug |
| `path` | Path template parsing | info |
| `metadata` | Metadata processing | debug |
| `settings` | Settings management | warn |
| `ui` | General UI components | debug |
| `inputManager` | InputManager component | debug |
| `events` | Event handling | info |
| `navbar` | Navigation bar | info |
| `view` | Views and rendering | info |
| `general` | Uncategorized logging | info |

### Log Levels

- **debug**: Detailed diagnostic information (most verbose)
- **info**: General information messages
- **warn**: Warning messages for potential issues
- **error**: Error messages for failures (least verbose)

The system only outputs messages at or above the configured level for each component.

## Usage

### Basic Logging

#### Creating a Component Logger

```typescript
import { createLogger } from '../utils/Logger';

// Create a logger for your component
const logger = createLogger('modal');

// Use the logger
logger.debug('Modal opened with data:', modalData);
logger.info('Processing user input');
logger.warn('Validation warning:', validationResult);
logger.error('Failed to save data:', error);
```

#### Direct Logger Access

```typescript
import { logger } from '../utils/Logger';

// Direct logging with component specification
logger.debug('npe', 'NPE editor initialized');
logger.error('api', 'Chemical lookup failed', errorDetails);
```

### Configuration

#### Setting Component Log Levels

```typescript
import { logger } from '../utils/Logger';

// Enable debug logging for a specific component
logger.enableDebugFor('modal');

// Quiet a component (only show warnings/errors)
logger.quietComponent('npe');

// Set specific log level
logger.setComponentLevel('api', 'info');

// Update multiple components at once
logger.setConfig({
    modal: 'debug',
    npe: 'warn',
    ui: 'info'
});
```

#### Global Controls

```typescript
// Disable all logging
logger.setEnabled(false);

// Re-enable logging
logger.setEnabled(true);

// Get current configuration
const config = logger.getConfig();
console.log('Current log levels:', config);
```

### File Logging

The system supports buffered file logging for persistent debugging:

#### Setup

```typescript
import { logger } from '../utils/Logger';

// Initialize file logging (typically done in main.ts)
logger.initFileLogging(this.app, 'debug-log.txt');
```

#### Buffer Management

```typescript
// Check file logging status
const isActive = logger.isFileLoggingActive();

// Get current buffer size
const bufferSize = logger.getBufferSize();

// Manually flush buffer to file
logger.flush();

// Clear buffer without writing
logger.clearBuffer();

// Clear file and start fresh
logger.clearAndFlush();

// Disable file logging (flushes remaining buffer)
logger.disableFileLogging();
```

## Runtime Commands

The plugin provides VS Code commands for runtime logging control:

### Component-Specific Commands

- **Enable debug logging for NPE**: `eln-enable-debug-npe`
- **Quiet NPE logging**: `eln-quiet-npe`
- **Enable debug logging for modals**: `eln-enable-debug-modal`
- **Quiet modal logging**: `eln-quiet-modal`
- **Enable debug logging for UI components**: `eln-enable-debug-ui`
- **Quiet UI logging**: `eln-quiet-ui`
- **Enable debug logging for InputManager**: `eln-enable-debug-inputmanager`
- **Quiet InputManager logging**: `eln-quiet-inputmanager`

### File Logging Commands

- **Start debug logging to buffer**: `eln-start-debug-logging`
- **Stop debug logging**: `eln-stop-debug-logging`
- **Flush debug logs to file**: `eln-flush-logs`
- **Clear debug log buffer**: `eln-clear-log-buffer`

### Status and Testing

- **Show current logger configuration**: `eln-show-logger-config`
- **Show debug logging status**: `eln-debug-logging-status`
- **Test debug logging functionality**: `eln-test-debug-logging`

## Development Workflow

### Debugging a Component

1. **Enable debug logging** for the component:
   ```typescript
   logger.enableDebugFor('modal');
   ```

2. **Start file logging** if you need persistent logs:
   ```typescript
   logger.initFileLogging(this.app, 'modal-debug.txt');
   ```

3. **Add logging statements** in your code:
   ```typescript
   const modalLogger = createLogger('modal');
   modalLogger.debug('Modal state changed:', newState);
   ```

4. **Test the functionality** and observe console output

5. **Flush logs to file** if using file logging:
   ```typescript
   logger.flush();
   ```

6. **Quiet the component** when debugging is complete:
   ```typescript
   logger.quietComponent('modal');
   ```

### Production Considerations

- Set stable components to `warn` or `error` level
- Keep development components at `debug` level during active work
- Use file logging sparingly in production
- Monitor buffer size to prevent memory issues

### Log File Format

File logs include structured information:

```
[2024-01-15T10:30:45.123Z] [DEBUG] [MODAL] Modal opened with configuration
  Arguments: [
    {
      "title": "Create New Note",
      "defaultPath": "/Experiments",
      "templateData": { ... }
    }
  ]
```

## Performance Considerations

### Efficient Logging

- **Lazy evaluation**: Log messages are only formatted if they will be output
- **Component filtering**: Disabled components have minimal overhead
- **Buffered file I/O**: File writes are batched for efficiency
- **Memory management**: Buffer size is limited and automatically flushed

### Best Practices

1. **Use appropriate log levels**:
   - `debug`: Detailed diagnostic information
   - `info`: General progress information
   - `warn`: Potential issues that don't prevent operation
   - `error`: Actual failures that prevent operation

2. **Avoid expensive operations in log statements**:
   ```typescript
   // Good: Simple message
   logger.debug('modal', 'Processing input');
   
   // Good: Pass objects directly (formatted only if logged)
   logger.debug('modal', 'Input data:', inputObject);
   
   // Avoid: Expensive serialization in message
   logger.debug('modal', `Input: ${JSON.stringify(complexObject)}`);
   ```

3. **Use component-specific loggers**:
   ```typescript
   const logger = createLogger('modal');
   logger.debug('Message'); // Automatically prefixed with [MODAL]
   ```

4. **Clean up file logging**:
   ```typescript
   // Always disable file logging when done
   logger.disableFileLogging();
   ```

## Testing

The system includes a test function for verification:

```typescript
logger.testLogging();
```

This outputs diagnostic information about the current logging state, buffer size, and file logging status.

## Troubleshooting

### Common Issues

1. **No log output**: Check if the component log level allows the message level
2. **File logging not working**: Ensure `initFileLogging()` was called with valid app instance
3. **Buffer not flushing**: Check if buffer size limit (100 messages) has been reached
4. **Performance issues**: Reduce log levels for high-frequency components

### Debug Steps

1. Check current configuration: `logger.getConfig()`
2. Verify file logging status: `logger.isFileLoggingActive()`
3. Check buffer size: `logger.getBufferSize()`
4. Test logging functionality: `logger.testLogging()`

## Integration Examples

### In Main Plugin Class

```typescript
import { logger } from './utils/Logger';

export default class ElnPlugin extends Plugin {
    async onload() {
        // Initialize file logging
        logger.initFileLogging(this.app, 'eln-debug.txt');
        
        // Configure component levels based on development needs
        logger.setConfig({
            main: 'info',
            npe: 'warn',
            modal: 'debug' // Currently debugging modals
        });
        
        const mainLogger = createLogger('main');
        mainLogger.info('Plugin loaded successfully');
    }
    
    async onunload() {
        // Clean up file logging
        logger.disableFileLogging();
    }
}
```

### In Component Classes

```typescript
import { createLogger } from '../utils/Logger';

export class NewNoteModal extends Modal {
    private logger = createLogger('modal');
    
    constructor(app: App, private plugin: ElnPlugin) {
        super(app);
        this.logger.debug('NewNoteModal constructor called');
    }
    
    onOpen() {
        this.logger.debug('Modal opening');
        try {
            // Modal setup code
            this.logger.info('Modal opened successfully');
        } catch (error) {
            this.logger.error('Failed to open modal:', error);
        }
    }
}
```

This logging system provides comprehensive debugging capabilities while maintaining performance and flexibility for both development and production use.
