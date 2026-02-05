# NPE Robustness Testing Guide

This document outlines tests to verify that the NPE (Nested Properties Editor) handles edge cases gracefully.

## Test Cases

### 1. File Deletion Handling
**Objective**: Verify NPE doesn't enter infinite loop when active file is deleted.

**Steps**:
1. Open a markdown file with frontmatter in Obsidian
2. Ensure the NPE view is visible in the right pane and showing the file's properties
3. Delete the active file (either through File Explorer or Obsidian's file deletion)
4. Observe NPE behavior

**Expected Result**:
- NPE should detect file deletion and show "No file selected or file was deleted" message
- No infinite loop or excessive console messages should occur
- NPE should recover when a new file is selected

### 2. Event Handler Cleanup & Memory Leak Prevention
**Objective**: Verify event handlers are properly cleaned up when NPE content changes.

**Setup**:
1. Copy and paste the contents of `tests/memory/npe-debug-utility.js` into browser console
2. Start monitoring with: `window.npeDebug.startMonitoring(3)`

**Steps**:
1. Open browser developer tools and go to "Memory" tab
2. Take a baseline memory snapshot before testing
3. Open a file with complex frontmatter (nested objects, arrays)
4. Interact with various NPE elements (expand/collapse, edit values) 
5. Switch between different files 10-15 times, noting memory usage
6. Use the reload button several times on different files
7. Take another memory snapshot and compare
8. Check the console output from the monitoring utility

**Expected Result**:
- Memory usage should remain stable (not increasing by more than a few MB after many file switches)
- NPEComponent counter shows: `Currently active: 1` (only one active at a time)
- Console shows component creation/destruction messages for each file switch
- Console shows "NPE: Component unloading, cleaning up event handlers" when switching files
- DOM element count should remain stable (containers should not accumulate)
- No accumulating event handlers
- Clean transitions between files  
- No JavaScript errors in console

**Advanced Memory Analysis**:
1. In heap snapshots, search for "NPE" objects
2. Look for growing counts of: HTMLDivElement, Function, EventListener
3. Check "Retained Size" column for large NPE-related objects
4. Use `window.npeDebug.forceGC()` between tests to ensure cleanup

**Memory Leak Indicators to Watch For**:
- Memory growing by >10MB after switching files multiple times
- Obsidian becoming slower/unresponsive
- Excessive debug messages about event registration

### 3. Recursive Update Prevention
**Objective**: Verify NPE doesn't update recursively when metadata changes.

**Steps**:
1. Open a file and ensure NPE is visible
2. Edit a property in NPE (this triggers metadata change)
3. Watch console for debug messages
4. Verify only expected number of update calls occur

**Expected Result**:
- Single update cycle when changing properties
- Debug messages show "Update already in progress, skipping" if recursive calls are prevented
- No performance degradation

### 4. Heap Snapshot Analysis
**Objective**: Analyze memory snapshots to identify potential leaks.

**Steps**:
1. Take heap snapshot before testing
2. Perform file switching tests (10-15 switches)
3. Take heap snapshot after testing
4. In DevTools Memory tab, compare snapshots

**What to Look For**:

**🔍 Objects to Search in Snapshots:**
- `NPEComponent` - Should not accumulate (only 1 active)
- `HTMLDivElement` - Look for `.npe-` classes accumulating
- `EventListener` - Should not grow significantly
- `Function` - Check for closures retaining DOM elements

**📊 Snapshot Comparison Filters:**
1. Set filter to "Objects allocated between Snapshot 1 and Snapshot 2"
2. Sort by "Size Delta" (descending)
3. Look for NPE-related objects with large positive deltas

**⚠️ Red Flags:**
- NPEComponent count > 1
- Growing HTMLDivElement with `.npe-` classes
- Large Function objects with DOM references
- EventListener objects that don't decrease after component cleanup

**💡 Analysis Tips:**
- Use "Retainers" view to see what's keeping objects alive
- Check "Constructor" grouping to see object types
- Focus on objects with >1KB retained size

## Debug Information

The NPE now includes debug logging and proper component lifecycle management. Enable console logging to see:
- `NPE: Update already in progress, skipping` - Recursive update prevention
- `NPE: Current file was deleted, clearing view` - File deletion detection  
- `NPE: Active file changed, updating view` - Normal file switching
- `NPE: Metadata changed for current file, updating view` - Property updates
- `NPE: Cleaning up current component` - Component cleanup before new file
- `NPE: Component unloading, cleaning up event handlers` - Event handler cleanup

## Memory Leak Fix

The NPE now uses a component-based architecture to prevent memory leaks:
1. **NPEComponent**: Each file gets its own `MarkdownRenderChild` component
2. **Proper Lifecycle**: Components are created/destroyed when switching files
3. **Event Cleanup**: `registerDomEvent` calls are automatically cleaned up when components are destroyed
4. **Proxy Pattern**: Event handlers are routed to the current component instead of the persistent view

## Verification Checklist

- [ ] NPE handles file deletion gracefully without infinite loops
- [ ] Memory usage remains stable when switching between files multiple times
- [ ] NPEComponent cleanup messages appear in console when switching files
- [ ] Event handlers are properly registered using `registerDomEvent()`
- [ ] No memory leaks from unregistered event handlers
- [ ] Recursive updates are prevented with `isUpdating` flag
- [ ] File existence checks prevent operations on deleted files
- [ ] Console shows appropriate debug messages for different scenarios
- [ ] Performance remains good even after many file switches
