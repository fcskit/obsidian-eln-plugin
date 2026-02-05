/**
 * Centralized logging system for the ELN plugin
 * Provides granular control over debug output from different components
 */

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
    events: LogLevel;
    navbar: LogLevel;
    view: LogLevel;
    general: LogLevel;
}

/**
 * Default configuration - only show warnings and errors for stable components,
 * debug for components under development
 */
const DEFAULT_CONFIG: LoggerConfig = {
    main: 'info',
    npe: 'warn',        // NPE is stable, only show warnings/errors
    modal: 'debug',     // Modals are being worked on
    api: 'info',        // API calls are generally stable
    template: 'debug',  // Template processing is being worked on
    note: 'debug',      // Note creation is being worked on
    path: 'info',       // Path parsing is stable
    metadata: 'debug',  // Metadata processing is being worked on
    settings: 'warn',   // Settings UI has issues, show warnings
    ui: 'info',         // General UI is mostly stable
    events: 'info',     // Events are stable
    navbar: 'info',     // Navbar is stable
    view: 'info',       // Views are stable
    general: 'info'     // General logging
};

class Logger {
    private config: LoggerConfig;
    private enabled: boolean;

    constructor() {
        this.config = { ...DEFAULT_CONFIG };
        this.enabled = true;
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
        }
    }

    /**
     * Info logging
     */
    info(component: ComponentName, message: string, ...args: unknown[]): void {
        if (this.shouldLog(component, 'info')) {
            console.info(this.formatMessage(component, message), ...args);
        }
    }

    /**
     * Warning logging
     */
    warn(component: ComponentName, message: string, ...args: unknown[]): void {
        if (this.shouldLog(component, 'warn')) {
            console.warn(this.formatMessage(component, message), ...args);
        }
    }

    /**
     * Error logging
     */
    error(component: ComponentName, message: string, ...args: unknown[]): void {
        if (this.shouldLog(component, 'error')) {
            console.error(this.formatMessage(component, message), ...args);
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
