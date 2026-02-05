/**
 * Centralized logging system for the ELN plugin
 * Provides granular control over debug output from different components
 * Supports both console and file logging
 */

import { App } from 'obsidian';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type ComponentName = 
    | 'main'
    | 'npe'           // Nested Properties Editor
    | 'modal'         // Modals (NewNoteModal, etc.)
    | 'api'           // API calls (ChemicalLookup, etc.)
    | 'template'      // Template processing
    | 'note'          // Note creation and processing
    | 'path'          // Path template parsing
    | 'metadata'      // Metadata processing
    | 'settings'      // Settings management
    | 'ui'            // General UI components
    | 'inputManager'  // InputManager component specifically
    | 'events'        // Event handling
    | 'navbar'        // Navigation bar
    | 'view'          // Views and rendering
    | 'general';      // General/uncategorized

export interface LoggerConfig {
    main: LogLevel;
    npe: LogLevel;
    modal: LogLevel;
    api: LogLevel;
    template: LogLevel;
    note: LogLevel;
    path: LogLevel;
    metadata: LogLevel;
    settings: LogLevel;
    ui: LogLevel;
    inputManager: LogLevel;
    events: LogLevel;
    navbar: LogLevel;
    view: LogLevel;
    general: LogLevel;
}

/**
 * Default configuration - disabled for production beta
 * Users can enable debug logging through the Debug Settings modal if needed
 */
const DEFAULT_CONFIG: LoggerConfig = {
    main: 'warn',
    npe: 'warn',
    modal: 'warn',
    api: 'warn',
    template: 'warn',
    note: 'warn',
    path: 'warn',
    metadata: 'warn',
    settings: 'warn',
    ui: 'warn',
    inputManager: 'warn',
    events: 'warn',
    navbar: 'warn',
    view: 'warn',
    general: 'warn'
};

class Logger {
    private config: LoggerConfig;
    private enabled: boolean;
    private fileLoggingEnabled: boolean = false;
    private logFilePath: string = '';
    private logBuffer: string[] = [];
    private maxBufferSize: number = 10; // Reduced from 100 - flush more frequently for debugging
    private app: App | null = null; // Obsidian App instance

    constructor() {
        this.config = { ...DEFAULT_CONFIG };
        this.enabled = true;
    }

    /**
     * Initialize file logging with the Obsidian app instance
     */
    initFileLogging(app: App, logFileName: string = 'debug-log.txt'): void {
        this.app = app;
        this.logFilePath = logFileName;
        this.fileLoggingEnabled = true;
        
        // Write initial log entry
        this.writeToFile(`[${new Date().toISOString()}] === ELN Plugin Debug Log Started ===\n`);
    }

    /**
     * Disable file logging
     */
    disableFileLogging(): void {
        if (this.fileLoggingEnabled && this.logBuffer.length > 0) {
            this.flushBuffer(); // Write any remaining buffered logs
        }
        this.fileLoggingEnabled = false;
    }

    /**
     * Write a message to the log file (buffered)
     */
    private writeToFile(message: string): void {
        if (!this.fileLoggingEnabled || !this.app) return;

        this.logBuffer.push(message);
        
        // Flush buffer if it's full
        if (this.logBuffer.length >= this.maxBufferSize) {
            this.flushBuffer();
        }
    }

    /**
     * Flush the log buffer to file
     */
    private flushBuffer(): void {
        if (!this.fileLoggingEnabled || !this.app || this.logBuffer.length === 0) return;

        try {
            const content = this.logBuffer.join('');
            const maxFileSize = 1024 * 1024; // 1MB limit

            // Check if file exists, if not create it
            this.app.vault.adapter.exists(this.logFilePath).then((exists: boolean) => {
                if (!this.app) return; // Double-check app is still available
                
                if (exists) {
                    // Check file size before appending
                    this.app.vault.adapter.stat(this.logFilePath).then((stat) => {
                        if (!this.app || !stat) return;
                        
                        // If file exceeds size limit, clear it before writing new content
                        if (stat.size > maxFileSize) {
                            const clearHeader = `[${new Date().toISOString()}] === Log file cleared (size exceeded 1MB) ===\n`;
                            this.app.vault.adapter.write(this.logFilePath, clearHeader + content).then(() => {
                                this.logBuffer = [];
                            }).catch((error) => {
                                console.error('[Logger] Failed to clear and write log file:', error);
                            });
                        } else {
                            // Append to existing file (size OK)
                            this.app.vault.adapter.read(this.logFilePath).then((existingContent: string) => {
                                if (!this.app) return;
                                const newContent = existingContent + content;
                                this.app.vault.adapter.write(this.logFilePath, newContent).then(() => {
                                    this.logBuffer = [];
                                }).catch((error) => {
                                    console.error('[Logger] Failed to write to log file (append):', error);
                                });
                            }).catch((error) => {
                                console.error('[Logger] Failed to read existing log file:', error);
                            });
                        }
                    }).catch((error) => {
                        console.error('[Logger] Failed to get log file stats:', error);
                    });
                } else {
                    // Create new file
                    this.app.vault.adapter.write(this.logFilePath, content).then(() => {
                        this.logBuffer = [];
                    }).catch((error) => {
                        console.error('[Logger] Failed to create log file:', error);
                    });
                }
            }).catch((error) => {
                console.error('[Logger] Failed to check if log file exists:', error);
            });
        } catch (error) {
            console.error('Failed to flush log buffer:', error);
        }
    }

    /**
     * Format log message for file output with timestamp and structured JSON
     */
    private formatForFile(component: ComponentName, level: LogLevel, message: string, args: unknown[]): string {
        const timestamp = new Date().toISOString();
        const formattedMessage = this.formatMessage(component, message);
        
        let result = `[${timestamp}] [${level.toUpperCase()}] ${formattedMessage}`;
        
        // Add structured JSON for complex objects
        if (args.length > 0) {
            result += '\n  Arguments: ';
            try {
                const argsJson = JSON.stringify(args, null, 2);
                result += argsJson;
            } catch (error) {
                result += '[Unable to serialize arguments: ' + String(error) + ']';
            }
        }
        
        result += '\n';
        return result;
    }

    /**
     * Update the logging configuration
     */
    setConfig(config: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Enable or disable all logging
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Get current configuration
     */
    getConfig(): LoggerConfig {
        return { ...this.config };
    }

    /**
     * Check if a log level should be output for a component
     */
    private shouldLog(component: ComponentName, level: LogLevel): boolean {
        if (!this.enabled) return false;

        const componentLevel = this.config[component];
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
        const componentLevelIndex = levels.indexOf(componentLevel);
        const requestedLevelIndex = levels.indexOf(level);

        return requestedLevelIndex >= componentLevelIndex;
    }

    /**
     * Format log message with component prefix
     */
    private formatMessage(component: ComponentName, message: string): string {
        return `[${component.toUpperCase()}] ${message}`;
    }

    /**
     * Debug logging
     */
    debug(component: ComponentName, message: string, ...args: unknown[]): void {
        if (this.shouldLog(component, 'debug')) {
            console.debug(this.formatMessage(component, message), ...args);
            
            // Also write to file if enabled
            if (this.fileLoggingEnabled) {
                this.writeToFile(this.formatForFile(component, 'debug', message, args));
            }
        }
    }

    /**
     * Info logging
     */
    info(component: ComponentName, message: string, ...args: unknown[]): void {
        if (this.shouldLog(component, 'info')) {
            console.info(this.formatMessage(component, message), ...args);
            
            // Also write to file if enabled
            if (this.fileLoggingEnabled) {
                this.writeToFile(this.formatForFile(component, 'info', message, args));
            }
        }
    }

    /**
     * Warning logging
     */
    warn(component: ComponentName, message: string, ...args: unknown[]): void {
        if (this.shouldLog(component, 'warn')) {
            console.warn(this.formatMessage(component, message), ...args);
            
            // Also write to file if enabled
            if (this.fileLoggingEnabled) {
                this.writeToFile(this.formatForFile(component, 'warn', message, args));
            }
        }
    }

    /**
     * Error logging
     */
    error(component: ComponentName, message: string, ...args: unknown[]): void {
        if (this.shouldLog(component, 'error')) {
            console.error(this.formatMessage(component, message), ...args);
            
            // Also write to file if enabled
            if (this.fileLoggingEnabled) {
                this.writeToFile(this.formatForFile(component, 'error', message, args));
            }
        }
    }

    /**
     * Manually flush the log buffer (useful for ensuring logs are written)
     */
    flush(): void {
        this.flushBuffer();
    }

    /**
     * Clear the log buffer without writing to file
     */
    clearBuffer(): void {
        this.logBuffer = [];
    }

    /**
     * Get the current size of the log buffer
     */
    getBufferSize(): number {
        return this.logBuffer.length;
    }

    /**
     * Check if file logging is currently active
     */
    isFileLoggingActive(): boolean {
        return this.fileLoggingEnabled;
    }

    /**
     * Test logging functionality - useful for debugging
     */
    testLogging(): void {
        if (!this.fileLoggingEnabled) {
            console.log('[Logger Test] File logging is NOT active');
            return;
        }
        
        console.log('[Logger Test] File logging is active');
        console.log('[Logger Test] Current buffer size:', this.logBuffer.length);
        console.log('[Logger Test] Log file path:', this.logFilePath);
        console.log('[Logger Test] App instance:', !!this.app);
        
        // Add a test message to buffer
        this.debug('general', 'Test message from logger test function');
        console.log('[Logger Test] Buffer size after test message:', this.logBuffer.length);
    }

    /**
     * Clear the debug log file and flush current buffer to the empty file
     */
    clearAndFlush(): void {
        if (!this.app || !this.fileLoggingEnabled) {
            // If file logging not active, initialize it first
            if (this.app) {
                this.initFileLogging(this.app, this.logFilePath || 'debug-log.txt');
            }
            return;
        }

        try {
            // Clear the file by writing an empty string, then write header and buffer
            const headerMessage = `[${new Date().toISOString()}] === ELN Plugin Debug Log (Fresh Start) ===\n`;
            const bufferSize = this.logBuffer.length;
            
            if (this.logBuffer.length > 0) {
                const bufferedContent = this.logBuffer.join('');
                const fullContent = headerMessage + bufferedContent;
                this.app.vault.adapter.write(this.logFilePath, fullContent).then(() => {
                    this.logBuffer = []; // Clear buffer after successful write
                    console.log(`[Logger] Successfully cleared log file and flushed ${bufferSize} entries`);
                }).catch((error) => {
                    console.error('[Logger] Error writing cleared log file with buffer:', error);
                });
            } else {
                // No buffer content, just write header
                this.app.vault.adapter.write(this.logFilePath, headerMessage).then(() => {
                    console.log('[Logger] Successfully cleared log file (no buffered content)');
                }).catch((error) => {
                    console.error('[Logger] Error clearing log file:', error);
                });
            }
        } catch (error) {
            console.error('[Logger] Error in clearAndFlush:', error);
        }
    }

    /**
     * Set log level for a specific component
     */
    setComponentLevel(component: ComponentName, level: LogLevel): void {
        this.config[component] = level;
    }

    /**
     * Enable debug logging for a component (useful for debugging)
     */
    enableDebugFor(component: ComponentName): void {
        this.setComponentLevel(component, 'debug');
    }

    /**
     * Disable debug logging for a component (only show warnings/errors)
     */
    quietComponent(component: ComponentName): void {
        this.setComponentLevel(component, 'warn');
    }

    /**
     * Create a component-specific logger that automatically prefixes the component
     */
    createComponentLogger(component: ComponentName) {
        return {
            debug: (message: string, ...args: unknown[]) => this.debug(component, message, ...args),
            info: (message: string, ...args: unknown[]) => this.info(component, message, ...args),
            warn: (message: string, ...args: unknown[]) => this.warn(component, message, ...args),
            error: (message: string, ...args: unknown[]) => this.error(component, message, ...args),
        };
    }
}

// Export a singleton instance
export const logger = new Logger();

// Convenience method to get component loggers
export function createLogger(component: ComponentName) {
    return logger.createComponentLogger(component);
}

// Export type for component loggers
export type ComponentLogger = ReturnType<typeof createLogger>;
