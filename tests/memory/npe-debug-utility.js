/**
 * NPE Memory Debug Utility
 * 
 * Paste this into the browser console to monitor NPE memory usage.
 * This will track component instances and help identify memory leaks.
 */

// Initialize NPE debugging on window object
window.npeDebug = {
    componentCount: 0,
    components: new Set(),
    domElementCount: 0,
    
    // Track component creation
    trackComponent: function(component) {
        this.componentCount++;
        this.components.add(component);
        console.log(`🔍 NPE Debug: Component created. Total created: ${this.componentCount}, Currently active: ${this.components.size}`);
        this.logMemoryUsage();
    },
    
    // Track component destruction
    untrackComponent: function(component) {
        this.components.delete(component);
        console.log(`🔍 NPE Debug: Component destroyed. Total created: ${this.componentCount}, Currently active: ${this.components.size}`);
        this.logMemoryUsage();
    },
    
    // Log current memory usage
    logMemoryUsage: function() {
        if ('memory' in performance) {
            const memory = performance.memory;
            const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
            const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
            console.log(`💾 Memory: ${used}MB used, ${total}MB total`);
        }
    },
    
    // Count NPE-related DOM elements
    countNPEElements: function() {
        const npeContainers = document.querySelectorAll('.npe-view-container');
        const npeButtons = document.querySelectorAll('[class*="npe-"]');
        console.log(`🏗️ DOM Elements: ${npeContainers.length} NPE containers, ${npeButtons.length} NPE elements total`);
        return { containers: npeContainers.length, elements: npeButtons.length };
    },
    
    // Full status report
    getStatus: function() {
        this.logMemoryUsage();
        const domStats = this.countNPEElements();
        console.log(`📊 NPE Status Report:`);
        console.log(`  - Components: ${this.components.size} active, ${this.componentCount} total created`);
        console.log(`  - DOM: ${domStats.containers} containers, ${domStats.elements} NPE elements`);
        
        return {
            components: {
                active: this.components.size,
                totalCreated: this.componentCount
            },
            dom: domStats,
            memory: 'memory' in performance ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
            } : 'unavailable'
        };
    },
    
    // Force garbage collection if available
    forceGC: function() {
        if (typeof window.gc === 'function') {
            console.log('🗑️ Forcing garbage collection...');
            window.gc();
            setTimeout(() => this.logMemoryUsage(), 100);
        } else {
            console.log('❌ Garbage collection not available. Start Chrome with --enable-precise-memory-info --expose-gc');
        }
    },
    
    // Monitor NPE over time
    startMonitoring: function(intervalSeconds = 5) {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
        }
        
        console.log(`🔄 Starting NPE monitoring every ${intervalSeconds} seconds...`);
        this.monitorInterval = setInterval(() => {
            console.log(`--- NPE Monitor (${new Date().toLocaleTimeString()}) ---`);
            this.getStatus();
        }, intervalSeconds * 1000);
    },
    
    stopMonitoring: function() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
            console.log('⏹️ NPE monitoring stopped');
        }
    }
};

console.log('🚀 NPE Debug utility loaded! Available commands:');
console.log('  - window.npeDebug.getStatus() - Get current status');
console.log('  - window.npeDebug.startMonitoring(5) - Monitor every 5 seconds');
console.log('  - window.npeDebug.stopMonitoring() - Stop monitoring');
console.log('  - window.npeDebug.forceGC() - Force garbage collection');
console.log('  - window.npeDebug.countNPEElements() - Count DOM elements');
