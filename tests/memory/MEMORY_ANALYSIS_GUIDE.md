# Memory Debugging for NPE Plugin

## How to Analyze Heap Snapshots

### In Chrome/Obsidian Developer Tools:

1. **Compare Snapshots**:
   - Load both snapshots in DevTools Memory tab
   - Select "Comparison" view between the before/after snapshots
   - Look for objects that increased significantly

2. **Look for Plugin-Related Objects**:
   - Search for: `NPE`, `NestedProperties`, `ELN`, `renderFrontMatter`
   - Check for: DOM event listeners, HTML elements, functions
   - Filter by "Constructor" to see object types

3. **Common Leak Patterns**:
   - **Event Listeners**: Look for `EventListener` objects
   - **DOM Elements**: Look for `HTMLElement`, `HTMLDivElement` objects
   - **Closures**: Look for function objects with retained variables
   - **Component References**: Look for `MarkdownRenderChild` objects

### What to Investigate:

1. **NPEComponent Instances**: Should be cleaned up between file switches
2. **DOM Elements**: Old NPE container elements should be garbage collected
3. **Event Handlers**: Should not accumulate
4. **Obsidian Components**: Check if `MarkdownRenderChild` instances are properly cleaned

## Additional Debugging Steps

### Add Memory Monitoring to NPE:

```javascript
// Add this to browser console to monitor NPE components
window.npeDebug = {
    componentCount: 0,
    components: new Set(),
    trackComponent: function(component) {
        this.componentCount++;
        this.components.add(component);
        console.log(`NPE: Component created. Total: ${this.componentCount}, Active: ${this.components.size}`);
    },
    untrackComponent: function(component) {
        this.components.delete(component);
        console.log(`NPE: Component destroyed. Total: ${this.componentCount}, Active: ${this.components.size}`);
    }
};
```

### Memory Leak Indicators to Check:

1. **Growing Object Counts**: 
   - HTMLDivElement count increasing
   - Function objects accumulating
   - NPE-related objects not being cleaned

2. **Retained Memory**:
   - Large objects not being freed
   - Circular references preventing garbage collection

3. **Performance Impact**:
   - Slower file switching over time
   - Increasing memory usage that doesn't stabilize

## Potential Remaining Issues

Even with our component-based fix, there might be subtle leaks from:

1. **Third-party event handlers**: Some NPE elements might register events outside our control
2. **Obsidian internal references**: The app might retain references to DOM elements
3. **Async operations**: Promises or timeouts that haven't completed
4. **CSS or style calculations**: Browser retaining style information
