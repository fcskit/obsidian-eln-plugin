# Footer Implementation Guide

This document describes the newly implemented footer system for the Obsidian ELN plugin, based on learnings from the rich-foot plugin analysis.

## Key Implementation Details

### Architecture

The footer system is designed with the following principles:

1. **Global Management**: One Footer instance handles all notes globally
2. **Event-Driven**: Responds to Obsidian workspace events
3. **Mode-Aware**: Different handling for reading vs editing modes
4. **Robust**: Uses mutation observers to handle dynamic content changes

### How It Works

#### 1. Container Detection

The footer automatically detects the correct container based on the current view mode:

**Reading Mode (`preview`)**:
- Targets `.markdown-preview-section` elements
- Skips embedded notes by checking for `.internal-embed` parent

**Editing Mode (`source`)**:
- Targets `.cm-sizer` elements (CodeMirror container)

#### 2. Event Handling

The footer listens to multiple Obsidian events:

- `active-leaf-change`: When switching between notes
- `file-open`: When opening a new file
- `layout-change`: When the workspace layout changes
- `editor-change`: When editing content (debounced)

#### 3. Dynamic Content Management

**Mutation Observer**: Watches for DOM changes and re-adds footer if removed
**Debouncing**: Editor changes are debounced to avoid performance issues

### Configuration

Footer display is controlled by:

1. **Global Setting**: `settings.footer.enabled`
2. **Frontmatter Override**: `footer: true/false` in note frontmatter
3. **Content Options**:
   - `includeVersion`: Show ELN version
   - `includeAuthor`: Show author information
   - `includeCtime`: Show creation time
   - `includeMtime`: Show modification time

### CSS Styling

The footer uses CSS classes for styling:

- `.eln-footer`: Main footer container
- `.eln-footer--hidden`: For fade-in animation
- `.eln-footer--separator`: Dashed separator line
- `.eln-footer--content`: Content container
- `.eln-footer--info`: Information text

### Comparison with Rich-Foot Plugin

| Feature | Rich-Foot | ELN Footer |
|---------|-----------|------------|
| **Content** | Backlinks, outlinks, dates | Version, author, dates |
| **Positioning** | Same technique | Same technique |
| **Events** | Multiple workspace events | Multiple workspace events |
| **Mode Handling** | `.cm-sizer` / `.markdown-preview-section` | Same |
| **Mutation Observer** | Yes | Yes |
| **Debouncing** | Yes (configurable delay) | Yes (500ms) |
| **Exclusions** | Folder/frontmatter exclusions | Frontmatter only |

### Usage

#### Basic Usage

```typescript
// In main plugin class
this.footer = new Footer(this.app, this);
this.footer.init();
```

#### Cleanup

```typescript
// On plugin unload
if (this.footer) {
    this.footer.destroy();
}
```

#### Settings Configuration

```typescript
// Enable/disable footer
settings.footer.enabled = true;

// Configure content
settings.footer.includeVersion = true;
settings.footer.includeAuthor = true;
settings.footer.includeMtime = true;
settings.footer.includeCtime = false;
```

#### Frontmatter Override

```yaml
---
footer: false  # Disable footer for this note
author: "John Doe"  # Override default author
---
```

### Implementation Benefits

1. **Reliability**: Handles Obsidian's dynamic content rendering
2. **Performance**: Debounced updates prevent excessive DOM manipulation
3. **User Control**: Global and per-note configuration options
4. **Maintenance**: Clean separation of concerns and event handling

### Common Issues and Solutions

#### Footer Not Appearing

1. **Check Settings**: Ensure `settings.footer.enabled` is true
2. **Check Frontmatter**: Look for `footer: false` override
3. **Check Console**: Look for error messages about container detection

#### Footer Disappearing

- **Cause**: Obsidian re-renders content, removing the footer
- **Solution**: Mutation observer automatically re-adds it

#### Performance Issues

- **Cause**: Too frequent updates in editing mode
- **Solution**: Debouncing limits update frequency to 500ms

### Future Enhancements

Potential improvements for the footer system:

1. **Custom Templates**: Allow users to define footer templates
2. **Additional Content**: Support for custom metadata fields
3. **Styling Options**: User-configurable appearance settings
4. **Exclusion Rules**: Folder-based exclusion like rich-foot
5. **Position Options**: Top/bottom positioning choices

### Technical Notes

#### Container Selection Logic

```typescript
private findContainer(view: MarkdownView): HTMLElement | null {
    const mode = view.getMode();
    
    if (mode === 'preview') {
        // Find non-embedded preview section
        const sections = content.querySelectorAll('.markdown-preview-section');
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i] as HTMLElement;
            if (!section.closest('.internal-embed')) {
                return section;
            }
        }
    } else if (mode === 'source') {
        // Use CodeMirror container
        return content.querySelector('.cm-sizer') as HTMLElement;
    }
    
    return null;
}
```

#### Mutation Observer Setup

```typescript
this.mutationObserver = new MutationObserver(() => {
    const footer = container.querySelector('.eln-footer');
    if (!footer) {
        // Re-add footer if removed
        setTimeout(() => this.updateFooter(), 50);
    }
});

this.mutationObserver.observe(container, { 
    childList: true, 
    subtree: true 
});
```

This footer implementation provides a solid foundation for displaying contextual information in Obsidian notes while handling the complexities of Obsidian's dynamic content rendering system.
