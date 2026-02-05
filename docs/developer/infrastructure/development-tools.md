# Development Tools

The Development Tools for the Obsidian ELN Plugin provide comprehensive debugging, profiling, testing, and development assistance capabilities to ensure efficient development workflows and high-quality code.

## 🛠️ Tools Overview

```typescript
┌─────────────────────────────────────────────────────┐
│               Development Tools                     │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │    Debugging    │  │       Profiling             ││
│  │    • Logger     │  │       • Performance         ││
│  │    • DevTools   │  │       • Memory              ││
│  │    • Inspector  │  │       • Bundle Analysis     ││
│  └─────────────────┘  └─────────────────────────────┘│
│  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │    Testing      │  │       Code Quality          ││
│  │    • Unit       │  │       • Linting             ││
│  │    • Integration│  │       • Type Checking       ││
│  │    • E2E        │  │       • Coverage            ││
│  └─────────────────┘  └─────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## 🐛 Debug System

### Debug Logger

```typescript
// src/utils/debug-logger.ts
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4
}

export interface LogEntry {
    timestamp: number;
    level: LogLevel;
    category: string;
    message: string;
    data?: any;
    stack?: string;
}

export class DebugLogger {
    private static instance: DebugLogger;
    private logLevel: LogLevel = LogLevel.INFO;
    private logHistory: LogEntry[] = [];
    private maxHistorySize: number = 1000;
    private categories: Set<string> = new Set();
    private isEnabled: boolean = process.env.NODE_ENV === 'development';
    
    private constructor() {}
    
    public static getInstance(): DebugLogger {
        if (!DebugLogger.instance) {
            DebugLogger.instance = new DebugLogger();
        }
        return DebugLogger.instance;
    }
    
    /**
     * Set the minimum log level
     */
    public setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }
    
    /**
     * Enable or disable logging
     */
    public setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
    }
    
    /**
     * Log a debug message
     */
    public debug(category: string, message: string, data?: any): void {
        this.log(LogLevel.DEBUG, category, message, data);
    }
    
    /**
     * Log an info message
     */
    public info(category: string, message: string, data?: any): void {
        this.log(LogLevel.INFO, category, message, data);
    }
    
    /**
     * Log a warning message
     */
    public warn(category: string, message: string, data?: any): void {
        this.log(LogLevel.WARN, category, message, data);
    }
    
    /**
     * Log an error message
     */
    public error(category: string, message: string, data?: any): void {
        this.log(LogLevel.ERROR, category, message, data, new Error().stack);
    }
    
    /**
     * Create a scoped logger for a specific category
     */
    public createLogger(category: string): ScopedLogger {
        return new ScopedLogger(this, category);
    }
    
    private log(level: LogLevel, category: string, message: string, data?: any, stack?: string): void {
        if (!this.isEnabled || level < this.logLevel) {
            return;
        }
        
        const entry: LogEntry = {
            timestamp: Date.now(),
            level,
            category,
            message,
            data,
            stack
        };
        
        // Add to history
        this.logHistory.push(entry);
        if (this.logHistory.length > this.maxHistorySize) {
            this.logHistory.shift();
        }
        
        // Track categories
        this.categories.add(category);
        
        // Console output
        this.outputToConsole(entry);
    }
    
    private outputToConsole(entry: LogEntry): void {
        const prefix = `[ELN:${entry.category}]`;
        const timestamp = new Date(entry.timestamp).toISOString();
        
        switch (entry.level) {
            case LogLevel.DEBUG:
                console.debug(`%c${prefix} ${entry.message}`, 'color: #6b7280', entry.data);
                break;
            case LogLevel.INFO:
                console.info(`%c${prefix} ${entry.message}`, 'color: #3b82f6', entry.data);
                break;
            case LogLevel.WARN:
                console.warn(`%c${prefix} ${entry.message}`, 'color: #f59e0b', entry.data);
                break;
            case LogLevel.ERROR:
                console.error(`%c${prefix} ${entry.message}`, 'color: #ef4444', entry.data);
                if (entry.stack) {
                    console.error(entry.stack);
                }
                break;
        }
    }
    
    /**
     * Get log history
     */
    public getHistory(category?: string, level?: LogLevel): LogEntry[] {
        let filtered = this.logHistory;
        
        if (category) {
            filtered = filtered.filter(entry => entry.category === category);
        }
        
        if (level !== undefined) {
            filtered = filtered.filter(entry => entry.level >= level);
        }
        
        return filtered;
    }
    
    /**
     * Get all logged categories
     */
    public getCategories(): string[] {
        return Array.from(this.categories);
    }
    
    /**
     * Clear log history
     */
    public clear(): void {
        this.logHistory = [];
    }
    
    /**
     * Export logs for debugging
     */
    public exportLogs(): string {
        return JSON.stringify(this.logHistory, null, 2);
    }
}

/**
 * Scoped logger for specific categories
 */
export class ScopedLogger {
    constructor(
        private logger: DebugLogger,
        private category: string
    ) {}
    
    debug(message: string, data?: any): void {
        this.logger.debug(this.category, message, data);
    }
    
    info(message: string, data?: any): void {
        this.logger.info(this.category, message, data);
    }
    
    warn(message: string, data?: any): void {
        this.logger.warn(this.category, message, data);
    }
    
    error(message: string, data?: any): void {
        this.logger.error(this.category, message, data);
    }
}

// Global logger instance
export const logger = DebugLogger.getInstance();
```

### Development Console

```typescript
// src/utils/dev-console.ts
export class DevConsole {
    private container: HTMLElement;
    private logContainer: HTMLElement;
    private commandInput: HTMLInputElement;
    private isVisible: boolean = false;
    private logger: DebugLogger;
    private commands: Map<string, ConsoleCommand> = new Map();
    
    constructor() {
        this.logger = DebugLogger.getInstance();
        this.setupCommands();
        this.createConsoleUI();
        this.setupKeyboardShortcuts();
    }
    
    private createConsoleUI(): void {
        this.container = document.createElement('div');
        this.container.className = 'eln-dev-console';
        this.container.innerHTML = `
            <div class="dev-console-header">
                <h3>ELN Development Console</h3>
                <button class="dev-console-close">×</button>
            </div>
            <div class="dev-console-tabs">
                <button class="tab-button active" data-tab="logs">Logs</button>
                <button class="tab-button" data-tab="performance">Performance</button>
                <button class="tab-button" data-tab="components">Components</button>
                <button class="tab-button" data-tab="memory">Memory</button>
            </div>
            <div class="dev-console-content">
                <div class="tab-content active" data-tab="logs">
                    <div class="log-filters">
                        <select class="log-level-filter">
                            <option value="0">DEBUG</option>
                            <option value="1" selected>INFO</option>
                            <option value="2">WARN</option>
                            <option value="3">ERROR</option>
                        </select>
                        <select class="log-category-filter">
                            <option value="">All Categories</option>
                        </select>
                        <button class="clear-logs">Clear</button>
                    </div>
                    <div class="log-container"></div>
                </div>
                <div class="tab-content" data-tab="performance">
                    <div class="performance-metrics"></div>
                </div>
                <div class="tab-content" data-tab="components">
                    <div class="component-tree"></div>
                </div>
                <div class="tab-content" data-tab="memory">
                    <div class="memory-usage"></div>
                </div>
            </div>
            <div class="dev-console-command">
                <input type="text" placeholder="Enter command..." class="command-input">
                <button class="execute-command">Execute</button>
            </div>
        `;
        
        this.logContainer = this.container.querySelector('.log-container') as HTMLElement;
        this.commandInput = this.container.querySelector('.command-input') as HTMLInputElement;
        
        this.setupEventListeners();
        document.body.appendChild(this.container);
    }
    
    private setupEventListeners(): void {
        // Close button
        this.container.querySelector('.dev-console-close')?.addEventListener('click', () => {
            this.hide();
        });
        
        // Tab switching
        this.container.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const tab = target.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // Log filters
        const levelFilter = this.container.querySelector('.log-level-filter') as HTMLSelectElement;
        const categoryFilter = this.container.querySelector('.log-category-filter') as HTMLSelectElement;
        
        levelFilter.addEventListener('change', () => this.updateLogDisplay());
        categoryFilter.addEventListener('change', () => this.updateLogDisplay());
        
        // Clear logs
        this.container.querySelector('.clear-logs')?.addEventListener('click', () => {
            this.logger.clear();
            this.updateLogDisplay();
        });
        
        // Command execution
        this.container.querySelector('.execute-command')?.addEventListener('click', () => {
            this.executeCommand();
        });
        
        this.commandInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand();
            }
        });
    }
    
    private setupKeyboardShortcuts(): void {
        document.addEventListener('keydown', (e) => {
            // Toggle console with Ctrl+Shift+D
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggle();
            }
            
            // Hide console with Escape
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }
    
    private setupCommands(): void {
        this.commands.set('help', {
            description: 'Show available commands',
            execute: () => {
                const commandList = Array.from(this.commands.entries())
                    .map(([name, cmd]) => `${name}: ${cmd.description}`)
                    .join('\n');
                return `Available commands:\n${commandList}`;
            }
        });
        
        this.commands.set('clear', {
            description: 'Clear console logs',
            execute: () => {
                this.logger.clear();
                this.updateLogDisplay();
                return 'Logs cleared';
            }
        });
        
        this.commands.set('export-logs', {
            description: 'Export logs to clipboard',
            execute: () => {
                const logs = this.logger.exportLogs();
                navigator.clipboard.writeText(logs);
                return 'Logs exported to clipboard';
            }
        });
        
        this.commands.set('performance', {
            description: 'Show performance metrics',
            execute: () => {
                return this.getPerformanceMetrics();
            }
        });
        
        this.commands.set('memory', {
            description: 'Show memory usage',
            execute: () => {
                return this.getMemoryUsage();
            }
        });
    }
    
    public show(): void {
        this.container.style.display = 'block';
        this.isVisible = true;
        this.updateLogDisplay();
        this.updateCategoryFilter();
        this.commandInput.focus();
    }
    
    public hide(): void {
        this.container.style.display = 'none';
        this.isVisible = false;
    }
    
    public toggle(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    private switchTab(tab: string): void {
        // Update tab buttons
        this.container.querySelectorAll('.tab-button').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tab);
        });
        
        // Update tab content
        this.container.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tab);
        });
        
        // Load tab-specific content
        switch (tab) {
            case 'performance':
                this.updatePerformanceTab();
                break;
            case 'components':
                this.updateComponentsTab();
                break;
            case 'memory':
                this.updateMemoryTab();
                break;
        }
    }
    
    private updateLogDisplay(): void {
        const levelFilter = this.container.querySelector('.log-level-filter') as HTMLSelectElement;
        const categoryFilter = this.container.querySelector('.log-category-filter') as HTMLSelectElement;
        
        const minLevel = parseInt(levelFilter.value);
        const category = categoryFilter.value || undefined;
        
        const logs = this.logger.getHistory(category, minLevel);
        
        this.logContainer.innerHTML = logs.map(entry => `
            <div class="log-entry log-level-${entry.level}">
                <span class="log-timestamp">${new Date(entry.timestamp).toLocaleTimeString()}</span>
                <span class="log-category">[${entry.category}]</span>
                <span class="log-message">${entry.message}</span>
                ${entry.data ? `<pre class="log-data">${JSON.stringify(entry.data, null, 2)}</pre>` : ''}
            </div>
        `).join('');
        
        // Auto-scroll to bottom
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }
    
    private updateCategoryFilter(): void {
        const categoryFilter = this.container.querySelector('.log-category-filter') as HTMLSelectElement;
        const categories = this.logger.getCategories();
        
        categoryFilter.innerHTML = '<option value="">All Categories</option>' +
            categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }
    
    private executeCommand(): void {
        const command = this.commandInput.value.trim();
        if (!command) return;
        
        this.commandInput.value = '';
        
        const [commandName, ...args] = command.split(' ');
        const commandHandler = this.commands.get(commandName);
        
        if (commandHandler) {
            try {
                const result = commandHandler.execute(args);
                this.logger.info('console', `Command executed: ${command}`, { result });
            } catch (error) {
                this.logger.error('console', `Command failed: ${command}`, { error });
            }
        } else {
            this.logger.warn('console', `Unknown command: ${commandName}`);
        }
        
        this.updateLogDisplay();
    }
    
    private getPerformanceMetrics(): string {
        const performance = window.performance;
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        return JSON.stringify({
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
            memory: (performance as any).memory ? {
                used: (performance as any).memory.usedJSHeapSize,
                total: (performance as any).memory.totalJSHeapSize,
                limit: (performance as any).memory.jsHeapSizeLimit
            } : 'Not available'
        }, null, 2);
    }
    
    private getMemoryUsage(): string {
        const memory = (performance as any).memory;
        if (!memory) {
            return 'Memory information not available';
        }
        
        const formatBytes = (bytes: number) => {
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            if (bytes === 0) return '0 Bytes';
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
        };
        
        return JSON.stringify({
            used: formatBytes(memory.usedJSHeapSize),
            allocated: formatBytes(memory.totalJSHeapSize),
            limit: formatBytes(memory.jsHeapSizeLimit),
            usagePercentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100) + '%'
        }, null, 2);
    }
    
    private updatePerformanceTab(): void {
        const container = this.container.querySelector('.performance-metrics') as HTMLElement;
        container.innerHTML = `<pre>${this.getPerformanceMetrics()}</pre>`;
    }
    
    private updateMemoryTab(): void {
        const container = this.container.querySelector('.memory-usage') as HTMLElement;
        container.innerHTML = `<pre>${this.getMemoryUsage()}</pre>`;
    }
    
    private updateComponentsTab(): void {
        const container = this.container.querySelector('.component-tree') as HTMLElement;
        // This would be implemented to show the component hierarchy
        container.innerHTML = '<p>Component tree visualization would go here</p>';
    }
}

interface ConsoleCommand {
    description: string;
    execute: (args?: string[]) => string;
}
```

## 📊 Performance Profiler

### Performance Monitor

```typescript
// src/utils/performance-monitor.ts
export interface PerformanceMetric {
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    metadata?: Record<string, any>;
}

export interface PerformanceProfile {
    id: string;
    name: string;
    startTime: number;
    endTime?: number;
    metrics: PerformanceMetric[];
    nestedProfiles: PerformanceProfile[];
}

export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private activeProfiles: Map<string, PerformanceProfile> = new Map();
    private completedProfiles: PerformanceProfile[] = [];
    private maxProfileHistory: number = 100;
    
    private constructor() {}
    
    public static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }
    
    /**
     * Start a new performance profile
     */
    public startProfile(name: string, metadata?: Record<string, any>): string {
        const id = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const profile: PerformanceProfile = {
            id,
            name,
            startTime: performance.now(),
            metrics: [],
            nestedProfiles: []
        };
        
        this.activeProfiles.set(id, profile);
        
        if (metadata) {
            this.addMetric(id, 'profile-metadata', metadata);
        }
        
        return id;
    }
    
    /**
     * End a performance profile
     */
    public endProfile(id: string): PerformanceProfile | null {
        const profile = this.activeProfiles.get(id);
        if (!profile) {
            console.warn(`Performance profile not found: ${id}`);
            return null;
        }
        
        profile.endTime = performance.now();
        this.activeProfiles.delete(id);
        
        // Add to completed profiles
        this.completedProfiles.push(profile);
        
        // Maintain history limit
        if (this.completedProfiles.length > this.maxProfileHistory) {
            this.completedProfiles.shift();
        }
        
        return profile;
    }
    
    /**
     * Add a metric to a profile
     */
    public addMetric(profileId: string, name: string, metadata?: Record<string, any>): void {
        const profile = this.activeProfiles.get(profileId);
        if (!profile) {
            console.warn(`Performance profile not found: ${profileId}`);
            return;
        }
        
        const metric: PerformanceMetric = {
            name,
            startTime: performance.now(),
            metadata
        };
        
        profile.metrics.push(metric);
    }
    
    /**
     * Start timing a metric
     */
    public startMetric(profileId: string, name: string, metadata?: Record<string, any>): number {
        const profile = this.activeProfiles.get(profileId);
        if (!profile) {
            console.warn(`Performance profile not found: ${profileId}`);
            return -1;
        }
        
        const metric: PerformanceMetric = {
            name,
            startTime: performance.now(),
            metadata
        };
        
        profile.metrics.push(metric);
        return profile.metrics.length - 1; // Return index
    }
    
    /**
     * End timing a metric
     */
    public endMetric(profileId: string, metricIndex: number): void {
        const profile = this.activeProfiles.get(profileId);
        if (!profile || !profile.metrics[metricIndex]) {
            console.warn(`Performance metric not found: ${profileId}[${metricIndex}]`);
            return;
        }
        
        const metric = profile.metrics[metricIndex];
        metric.endTime = performance.now();
        metric.duration = metric.endTime - metric.startTime;
    }
    
    /**
     * Create a nested profile
     */
    public startNestedProfile(parentId: string, name: string, metadata?: Record<string, any>): string {
        const parentProfile = this.activeProfiles.get(parentId);
        if (!parentProfile) {
            console.warn(`Parent performance profile not found: ${parentId}`);
            return this.startProfile(name, metadata);
        }
        
        const nestedId = this.startProfile(name, metadata);
        const nestedProfile = this.activeProfiles.get(nestedId);
        
        if (nestedProfile) {
            parentProfile.nestedProfiles.push(nestedProfile);
        }
        
        return nestedId;
    }
    
    /**
     * Get all completed profiles
     */
    public getProfiles(): PerformanceProfile[] {
        return [...this.completedProfiles];
    }
    
    /**
     * Get a specific profile by ID
     */
    public getProfile(id: string): PerformanceProfile | null {
        return this.completedProfiles.find(p => p.id === id) || 
               this.activeProfiles.get(id) || null;
    }
    
    /**
     * Clear profile history
     */
    public clearProfiles(): void {
        this.completedProfiles = [];
    }
    
    /**
     * Export profiles for analysis
     */
    public exportProfiles(): string {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            profiles: this.completedProfiles,
            activeProfiles: Array.from(this.activeProfiles.values())
        }, null, 2);
    }
    
    /**
     * Generate a performance report
     */
    public generateReport(): PerformanceReport {
        const profiles = this.getProfiles();
        
        return {
            totalProfiles: profiles.length,
            averageDuration: this.calculateAverageDuration(profiles),
            slowestProfile: this.findSlowestProfile(profiles),
            fastestProfile: this.findFastestProfile(profiles),
            metricSummary: this.generateMetricSummary(profiles),
            recommendations: this.generateRecommendations(profiles)
        };
    }
    
    private calculateAverageDuration(profiles: PerformanceProfile[]): number {
        const durations = profiles
            .filter(p => p.endTime)
            .map(p => p.endTime! - p.startTime);
        
        return durations.length > 0 ? 
            durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;
    }
    
    private findSlowestProfile(profiles: PerformanceProfile[]): PerformanceProfile | null {
        return profiles
            .filter(p => p.endTime)
            .reduce((slowest, current) => {
                const currentDuration = current.endTime! - current.startTime;
                const slowestDuration = slowest ? (slowest.endTime! - slowest.startTime) : 0;
                return currentDuration > slowestDuration ? current : slowest;
            }, null as PerformanceProfile | null);
    }
    
    private findFastestProfile(profiles: PerformanceProfile[]): PerformanceProfile | null {
        return profiles
            .filter(p => p.endTime)
            .reduce((fastest, current) => {
                const currentDuration = current.endTime! - current.startTime;
                const fastestDuration = fastest ? (fastest.endTime! - fastest.startTime) : Infinity;
                return currentDuration < fastestDuration ? current : fastest;
            }, null as PerformanceProfile | null);
    }
    
    private generateMetricSummary(profiles: PerformanceProfile[]): Record<string, MetricSummary> {
        const metricMap: Record<string, number[]> = {};
        
        profiles.forEach(profile => {
            profile.metrics.forEach(metric => {
                if (metric.duration !== undefined) {
                    if (!metricMap[metric.name]) {
                        metricMap[metric.name] = [];
                    }
                    metricMap[metric.name].push(metric.duration);
                }
            });
        });
        
        const summary: Record<string, MetricSummary> = {};
        
        Object.entries(metricMap).forEach(([name, durations]) => {
            const sorted = durations.sort((a, b) => a - b);
            summary[name] = {
                count: durations.length,
                average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
                min: sorted[0],
                max: sorted[sorted.length - 1],
                median: sorted[Math.floor(sorted.length / 2)],
                p95: sorted[Math.floor(sorted.length * 0.95)]
            };
        });
        
        return summary;
    }
    
    private generateRecommendations(profiles: PerformanceProfile[]): string[] {
        const recommendations: string[] = [];
        const report = this.generateMetricSummary(profiles);
        
        // Check for slow operations
        Object.entries(report).forEach(([name, summary]) => {
            if (summary.average > 100) {
                recommendations.push(`Consider optimizing "${name}" - average duration: ${summary.average.toFixed(2)}ms`);
            }
            
            if (summary.max > 1000) {
                recommendations.push(`"${name}" has very slow outliers - max duration: ${summary.max.toFixed(2)}ms`);
            }
        });
        
        // Check for memory usage patterns
        if (profiles.length > 50) {
            recommendations.push('Consider reducing the number of performance profiles for better memory usage');
        }
        
        return recommendations;
    }
}

export interface PerformanceReport {
    totalProfiles: number;
    averageDuration: number;
    slowestProfile: PerformanceProfile | null;
    fastestProfile: PerformanceProfile | null;
    metricSummary: Record<string, MetricSummary>;
    recommendations: string[];
}

export interface MetricSummary {
    count: number;
    average: number;
    min: number;
    max: number;
    median: number;
    p95: number;
}

// Global performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();
```

### Performance Decorators

```typescript
// src/utils/performance-decorators.ts
import { performanceMonitor } from './performance-monitor';

/**
 * Method decorator for automatic performance profiling
 */
export function Profile(profileName?: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        const name = profileName || `${target.constructor.name}.${propertyKey}`;
        
        descriptor.value = async function (...args: any[]) {
            const profileId = performanceMonitor.startProfile(name, {
                className: target.constructor.name,
                methodName: propertyKey,
                arguments: args.map(arg => typeof arg === 'object' ? '[Object]' : String(arg))
            });
            
            try {
                const result = await originalMethod.apply(this, args);
                performanceMonitor.endProfile(profileId);
                return result;
            } catch (error) {
                performanceMonitor.addMetric(profileId, 'error', { error: error.message });
                performanceMonitor.endProfile(profileId);
                throw error;
            }
        };
        
        return descriptor;
    };
}

/**
 * Method decorator for timing specific operations
 */
export function Timed(metricName?: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        const name = metricName || `${target.constructor.name}.${propertyKey}`;
        
        descriptor.value = async function (...args: any[]) {
            const startTime = performance.now();
            
            try {
                const result = await originalMethod.apply(this, args);
                const duration = performance.now() - startTime;
                
                // Log timing information
                console.log(`[TIMING] ${name}: ${duration.toFixed(2)}ms`);
                
                return result;
            } catch (error) {
                const duration = performance.now() - startTime;
                console.log(`[TIMING] ${name} (ERROR): ${duration.toFixed(2)}ms`);
                throw error;
            }
        };
        
        return descriptor;
    };
}

/**
 * Class decorator for automatic profiling of all methods
 */
export function ProfileClass(profileName?: string) {
    return function <T extends { new (...args: any[]): {} }>(constructor: T) {
        const className = profileName || constructor.name;
        
        // Get all method names
        const methods = Object.getOwnPropertyNames(constructor.prototype)
            .filter(name => name !== 'constructor' && typeof constructor.prototype[name] === 'function');
        
        // Wrap each method
        methods.forEach(methodName => {
            const originalMethod = constructor.prototype[methodName];
            
            constructor.prototype[methodName] = async function (...args: any[]) {
                const profileId = performanceMonitor.startProfile(`${className}.${methodName}`, {
                    className,
                    methodName,
                    arguments: args.length
                });
                
                try {
                    const result = await originalMethod.apply(this, args);
                    performanceMonitor.endProfile(profileId);
                    return result;
                } catch (error) {
                    performanceMonitor.addMetric(profileId, 'error', { error: error.message });
                    performanceMonitor.endProfile(profileId);
                    throw error;
                }
            };
        });
        
        return constructor;
    };
}
```

## 🧪 Testing Framework

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/*.(test|spec).+(ts|tsx|js)'
    ],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/main.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: [
        'text',
        'lcov',
        'html'
    ],
    setupFilesAfterEnv: [
        '<rootDir>/tests/setup.ts'
    ],
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@core/(.*)$': '<rootDir>/src/core/$1',
        '^@ui/(.*)$': '<rootDir>/src/ui/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@types/(.*)$': '<rootDir>/src/types/$1'
    },
    testTimeout: 10000
};
```

### Test Utilities

```typescript
// tests/utils/test-helpers.ts
import { App, TFile, Vault } from 'obsidian';
import { TemplateManager } from '@core/template-manager';
import { InputManager } from '@ui/input-manager';

/**
 * Create a mock Obsidian App instance
 */
export function createMockApp(): App {
    const mockVault = {
        adapter: {
            fs: {
                existsSync: jest.fn().mockReturnValue(true),
                readFileSync: jest.fn().mockReturnValue('{}'),
                writeFileSync: jest.fn()
            }
        },
        getFiles: jest.fn().mockReturnValue([]),
        create: jest.fn().mockResolvedValue({} as TFile),
        modify: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined)
    } as unknown as Vault;
    
    return {
        vault: mockVault,
        workspace: {
            getActiveFile: jest.fn().mockReturnValue(null),
            openLinkText: jest.fn()
        },
        metadataCache: {
            getFileCache: jest.fn().mockReturnValue(null)
        }
    } as unknown as App;
}

/**
 * Create a mock plugin instance
 */
export function createMockPlugin() {
    return {
        app: createMockApp(),
        manifest: {
            id: 'obsidian-eln-plugin',
            name: 'ELN Plugin',
            version: '0.7.0'
        },
        settings: {
            defaultFolder: 'ELN',
            enableAutoBackup: true,
            noteTypes: {}
        },
        templateManager: new TemplateManager(createMockApp(), {} as any),
        saveSettings: jest.fn().mockResolvedValue(undefined)
    };
}

/**
 * Create a test container element
 */
export function createTestContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'test-container';
    document.body.appendChild(container);
    return container;
}

/**
 * Clean up test container
 */
export function cleanupTestContainer(container: HTMLElement): void {
    if (container.parentNode) {
        container.parentNode.removeChild(container);
    }
}

/**
 * Wait for next tick
 */
export function nextTick(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Wait for specific condition
 */
export function waitFor(condition: () => boolean, timeout: number = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        
        function check() {
            if (condition()) {
                resolve();
            } else if (Date.now() - start > timeout) {
                reject(new Error('Timeout waiting for condition'));
            } else {
                setTimeout(check, 50);
            }
        }
        
        check();
    });
}

/**
 * Create a test InputManager with mock data
 */
export function createTestInputManager(initialData: Record<string, any> = {}): InputManager {
    const inputManager = new InputManager();
    
    Object.entries(initialData).forEach(([path, value]) => {
        inputManager.setValue(path, value);
    });
    
    return inputManager;
}

/**
 * Mock DOM methods for testing
 */
export function mockDOMAPIs(): void {
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
        width: 100,
        height: 100,
        top: 0,
        left: 0,
        bottom: 100,
        right: 100,
        x: 0,
        y: 0,
        toJSON: jest.fn()
    }));
    
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
    
    // Mock focus
    HTMLElement.prototype.focus = jest.fn();
    
    // Mock clipboard API
    Object.assign(navigator, {
        clipboard: {
            writeText: jest.fn().mockResolvedValue(undefined),
            readText: jest.fn().mockResolvedValue('')
        }
    });
}

/**
 * Test event utilities
 */
export class TestEventUtils {
    static fireEvent(element: Element, eventType: string, eventProps: any = {}): void {
        const event = new Event(eventType, { bubbles: true, cancelable: true, ...eventProps });
        Object.assign(event, eventProps);
        element.dispatchEvent(event);
    }
    
    static fireKeyboardEvent(element: Element, key: string, options: any = {}): void {
        const event = new KeyboardEvent('keydown', {
            key,
            bubbles: true,
            cancelable: true,
            ...options
        });
        element.dispatchEvent(event);
    }
    
    static fireMouseEvent(element: Element, eventType: string, options: any = {}): void {
        const event = new MouseEvent(eventType, {
            bubbles: true,
            cancelable: true,
            ...options
        });
        element.dispatchEvent(event);
    }
}

/**
 * Performance testing utilities
 */
export class PerformanceTestUtils {
    static async measureExecutionTime<T>(fn: () => Promise<T> | T): Promise<{ result: T; duration: number }> {
        const start = performance.now();
        const result = await fn();
        const duration = performance.now() - start;
        
        return { result, duration };
    }
    
    static async runPerformanceTest(
        name: string,
        fn: () => Promise<void> | void,
        iterations: number = 100
    ): Promise<PerformanceTestResult> {
        const durations: number[] = [];
        
        // Warm up
        await fn();
        
        // Run test iterations
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            await fn();
            const duration = performance.now() - start;
            durations.push(duration);
        }
        
        durations.sort((a, b) => a - b);
        
        return {
            name,
            iterations,
            min: durations[0],
            max: durations[durations.length - 1],
            average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
            median: durations[Math.floor(durations.length / 2)],
            p95: durations[Math.floor(durations.length * 0.95)],
            p99: durations[Math.floor(durations.length * 0.99)]
        };
    }
}

export interface PerformanceTestResult {
    name: string;
    iterations: number;
    min: number;
    max: number;
    average: number;
    median: number;
    p95: number;
    p99: number;
}
```

## 🔍 Code Quality Tools

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json'
    },
    plugins: [
        '@typescript-eslint',
        'import',
        'prefer-arrow',
        'jsdoc'
    ],
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        '@typescript-eslint/recommended-requiring-type-checking'
    ],
    rules: {
        // TypeScript specific
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/prefer-readonly': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        
        // Import rules
        'import/order': ['error', {
            'groups': [
                'builtin',
                'external',
                'internal',
                'parent',
                'sibling',
                'index'
            ],
            'newlines-between': 'always',
            'alphabetize': {
                'order': 'asc',
                'caseInsensitive': true
            }
        }],
        'import/no-duplicates': 'error',
        'import/no-unresolved': 'off', // Handled by TypeScript
        
        // General code quality
        'prefer-const': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-template': 'error',
        'prefer-arrow-callback': 'error',
        'arrow-spacing': 'error',
        'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
        'comma-dangle': ['error', 'never'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        
        // JSDoc rules
        'jsdoc/check-alignment': 'error',
        'jsdoc/check-indentation': 'error',
        'jsdoc/check-param-names': 'error',
        'jsdoc/check-syntax': 'error',
        'jsdoc/check-tag-names': 'error',
        'jsdoc/check-types': 'error',
        'jsdoc/require-description': 'warn',
        'jsdoc/require-param': 'warn',
        'jsdoc/require-param-description': 'warn',
        'jsdoc/require-param-type': 'warn',
        'jsdoc/require-returns': 'warn',
        'jsdoc/require-returns-description': 'warn',
        'jsdoc/require-returns-type': 'warn'
    },
    env: {
        browser: true,
        es6: true,
        node: true,
        jest: true
    },
    settings: {
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
                project: './tsconfig.json'
            }
        }
    }
};
```

### Prettier Configuration

```javascript
// .prettierrc.js
module.exports = {
    printWidth: 100,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: true,
    quoteProps: 'as-needed',
    trailingComma: 'none',
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'avoid',
    endOfLine: 'lf',
    embeddedLanguageFormatting: 'auto',
    overrides: [
        {
            files: '*.json',
            options: {
                tabWidth: 2
            }
        },
        {
            files: '*.md',
            options: {
                proseWrap: 'preserve'
            }
        }
    ]
};
```

## 📝 Development Scripts

### Development Helper Scripts

```bash
#!/bin/bash
# scripts/dev-setup.sh

echo "🚀 Setting up development environment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup git hooks
echo "🔗 Setting up git hooks..."
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
npx husky add .husky/pre-push "npm run test"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p .vscode
mkdir -p tests/fixtures
mkdir -p tests/mocks
mkdir -p coverage

# Setup VS Code settings
echo "⚙️ Configuring VS Code..."
cat > .vscode/settings.json << EOF
{
    "typescript.preferences.includePackageJsonAutoImports": "auto",
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true,
        "source.organizeImports": true
    },
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "files.associations": {
        "*.md": "markdown"
    },
    "eslint.workingDirectories": ["./"],
    "typescript.suggest.autoImports": true,
    "jest.jestCommandLine": "npm test --",
    "jest.autoRun": "off"
}
EOF

# Setup VS Code extensions recommendations
cat > .vscode/extensions.json << EOF
{
    "recommendations": [
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint",
        "ms-vscode.vscode-typescript-next",
        "orta.vscode-jest",
        "ms-vscode.vscode-json",
        "bradlc.vscode-tailwindcss"
    ]
}
EOF

echo "✅ Development environment setup complete!"
echo "🏃 Run 'npm run dev' to start development"
```

```bash
#!/bin/bash
# scripts/quality-check.sh

echo "🔍 Running quality checks..."

# Type checking
echo "📝 Running TypeScript type check..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ Type check failed"
    exit 1
fi

# Linting
echo "🧹 Running ESLint..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed"
    exit 1
fi

# Testing
echo "🧪 Running tests..."
npm run test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi

# Test coverage
echo "📊 Checking test coverage..."
npm run test:coverage
COVERAGE=$(npm run test:coverage -- --silent | grep "All files" | awk '{print $10}' | sed 's/%//')
if [ "$COVERAGE" -lt 80 ]; then
    echo "⚠️ Test coverage is below 80% ($COVERAGE%)"
    echo "Consider adding more tests"
fi

echo "✅ All quality checks passed!"
```

This comprehensive development tools setup provides robust debugging, profiling, testing, and code quality capabilities for efficient development of the Obsidian ELN Plugin.
