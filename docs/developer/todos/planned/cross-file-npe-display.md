# Cross-File NPE Display

**Status**: Planned  
**Priority**: Medium  
**Target Version**: v0.8.0  
**Estimated Effort**: 2-3 weeks

## Overview

Enable the Nested Properties Editor (NPE) code block to display metadata from files other than the current file, allowing embedded property views from related notes.

## Problem Statement

Users want to display metadata from related files directly in a note. For example, a sample note should be able to display the metadata from process notes referenced in `sample.preparation`.

### Example Use Case

Sample note wants to show embedded NPE for each process:

```markdown
## Processing

```eln-properties
file: [[Process 001]]
key: process
actionButtons: hidden
```

Or dynamically for each process in sample.preparation:

```markdown
<!-- For each item in sample.preparation, show: -->
```eln-properties
file: {{item.link}}
key: process
```
```

Currently: Not implemented - code block renders empty with no error message.

## Implementation Details

### Phase 1: Single File Reference (v0.8.0)

**Supported `file` parameter formats:**
- `file: [[Process 001]]` - Wiki link
- `file: Process 001.md` - File path
- `file: Experiments/Process 001` - Relative path
- `file: sample.process.name` - Template reference (requires evaluation)

**Implementation steps:**

1. **Update `CodeBlockParams` interface:**

```typescript
export interface CodeBlockParams {
    key?: string;
    excludeKeys?: string[];
    actionButtons?: boolean;
    cssclasses?: string[];
    file?: string; // File reference to display metadata from
    unsupportedParams?: string[];
}
```

2. **Update `parseNpeCodeBlockParams`:**

```typescript
export function parseNpeCodeBlockParams(source: string): CodeBlockParams {
    // ... existing code ...
    
    if (line.startsWith("file:")) {
        params.file = line.slice(5).trim();
        // Remove from unsupported list if added
        unsupported = unsupported.filter(p => p !== 'file');
    }
    
    // ... rest of code ...
}
```

3. **Update NPE code block processor in main.ts:**

```typescript
this.registerMarkdownCodeBlockProcessor("eln-properties", async (source, el, ctx) => {
    const params = parseNpeCodeBlockParams(source);
    
    // Check for unsupported parameters (file is now supported)
    if (params.unsupportedParams && params.unsupportedParams.length > 0) {
        // ... show error ...
        return;
    }
    
    // Resolve target file
    let targetFile: TFile | null = null;
    if (params.file) {
        targetFile = await resolveFileReference(this.app, params.file, ctx.sourcePath);
        if (!targetFile) {
            el.createDiv({
                cls: 'eln-npe-warning',
                text: `⚠️ File not found: ${params.file}`
            });
            // Show help message
            el.createDiv({
                cls: 'eln-npe-help',
                text: 'Check that the file exists and the path is correct.'
            });
            return;
        }
    } else {
        // Use current file
        targetFile = ctx.sourcePath
            ? this.app.vault.getAbstractFileByPath(ctx.sourcePath)
            : null;
    }
    
    if (!targetFile || !(targetFile instanceof TFile)) {
        el.createDiv({
            cls: 'eln-npe-error',
            text: '⚠️ No file available for properties display'
        });
        return;
    }
    
    new NestedPropertiesEditorCodeBlockView(
        this.app,
        this,
        el,
        ctx,
        targetFile,
        params.key,
        params.excludeKeys,
        params.actionButtons,
        params.cssclasses
    );
});
```

4. **Create file resolver utility:**

```typescript
// src/utils/fileResolver.ts
export async function resolveFileReference(
    app: App,
    reference: string,
    currentFilePath?: string
): Promise<TFile | null> {
    // Handle wiki links: [[File Name]]
    if (reference.startsWith('[[') && reference.endsWith(']]')) {
        const fileName = reference.slice(2, -2);
        const file = app.metadataCache.getFirstLinkpathDest(fileName, currentFilePath || '');
        return file;
    }
    
    // Handle direct file paths
    const file = app.vault.getAbstractFileByPath(reference);
    if (file instanceof TFile) {
        return file;
    }
    
    // Try adding .md extension
    const fileWithExt = app.vault.getAbstractFileByPath(reference + '.md');
    if (fileWithExt instanceof TFile) {
        return fileWithExt;
    }
    
    // Search by basename
    const files = app.vault.getMarkdownFiles();
    const match = files.find(f => f.basename === reference || f.name === reference);
    return match || null;
}
```

5. **Update NestedPropertiesEditorCodeBlockView:**
   - Already accepts `file` parameter
   - Ensure it uses the provided file instead of ctx.sourcePath
   - Add visual indicator that properties are from another file

6. **Add visual indicator:**

```typescript
// In NestedPropertiesEditorCodeBlockView constructor or render
if (this.file && ctx.sourcePath && this.file.path !== ctx.sourcePath) {
    // Add header showing which file's properties are displayed
    const header = el.createDiv({ cls: 'eln-npe-cross-file-header' });
    header.createSpan({ text: '📄 Properties from: ' });
    header.createEl('a', {
        cls: 'internal-link',
        text: this.file.basename,
        href: this.file.path
    });
}
```

### Phase 2: Dynamic File References (v0.8.1)

**Support template expressions in file parameter:**

```markdown
```eln-properties
file: {{sample.process.link}}
key: process
```
```

**Implementation:**
1. Detect if `file` parameter contains template syntax `{{...}}`
2. Evaluate template expression using FunctionEvaluator
3. Resolve resulting path/link to file
4. Display NPE for resolved file

**Challenges:**
- Template evaluation requires access to frontmatter/context
- May need async evaluation
- Error handling for invalid expressions

### Phase 3: Multiple File Display (v0.9.0)

**Support arrays in file parameter:**

```markdown
<!-- For each process in sample.preparation -->
```eln-properties
file: {{sample.preparation.*.link}}
key: process
actionButtons: hidden
```
```

**Implementation:**
- If `file` resolves to array, create multiple NPE instances
- Add collapsible sections for each file
- Performance optimization for many files

## Dependencies

- NPE code block infrastructure (exists)
- File resolution utilities (new)
- Template evaluation system (for Phase 2)
- Array operations (for Phase 3, see template-array-operations.md)

## Success Criteria

- [ ] Single file reference works with wiki links
- [ ] Single file reference works with file paths
- [ ] Error message shown when file not found
- [ ] Visual indicator shows which file's properties displayed
- [ ] Clicking file name navigates to that file
- [ ] Edit mode still saves to correct file
- [ ] No performance issues with cross-file access
- [ ] Documentation with examples
- [ ] Unit tests for file resolution
- [ ] Integration tests with sample workflow

## Testing Plan

### Unit Tests

```typescript
describe('File Resolution', () => {
    test('resolves wiki link', async () => {
        const file = await resolveFileReference(app, '[[Process 001]]');
        expect(file?.basename).toBe('Process 001');
    });
    
    test('returns null for non-existent file', async () => {
        const file = await resolveFileReference(app, 'NonExistent.md');
        expect(file).toBeNull();
    });
});
```

### Integration Tests

1. Create sample note with process reference
2. Add NPE code block with `file: [[Process 001]]`
3. Verify process metadata displays
4. Edit property in embedded NPE
5. Verify edit saves to Process 001, not sample note

## Security Considerations

- **File Access:** Ensure users can only display files they have permission to read
- **Path Traversal:** Validate file paths to prevent directory traversal attacks
- **Edit Permissions:** Verify user can edit file before allowing property changes

## Performance Considerations

- **Caching:** Cache resolved files to avoid repeated lookups
- **Lazy Loading:** Don't load all cross-file NPEs immediately
- **Debouncing:** Debounce updates when displaying many files
- **Metadata Watch:** Watch for changes in referenced files

## UI/UX Considerations

### Visual Indicators

- **Header:** Show "Properties from: [File Name]" above NPE
- **Styling:** Slightly different background to distinguish from current file
- **Icons:** Use 📄 or similar icon to indicate cross-file reference

### Error States

- **File Not Found:** Clear message with suggestions
- **Permission Denied:** Explain why file can't be accessed
- **Invalid Reference:** Show what was parsed and why it's invalid

### Edit Mode

- **Warning:** Show warning before editing cross-file properties
- **Confirmation:** Optional confirmation dialog for cross-file edits
- **Feedback:** Clear indication when save succeeds/fails

## Migration Path

1. **v0.7.1**: Current implementation shows error for `file` parameter ✅
2. **v0.8.0**: Implement single file reference support
3. **v0.8.1**: Add template expression evaluation in file parameter
4. **v0.9.0**: Add support for multiple file display

## Alternative Solutions Considered

### 1. Transclude Entire Note
**Pros:** Obsidian native feature  
**Cons:** Shows entire note content, not just properties  
**Decision:** Rejected - need focused property view

### 2. Dataview Query
**Pros:** Already exists  
**Cons:** Read-only, different syntax, not editable  
**Decision:** Rejected - need editable properties

### 3. Custom Embed Syntax (CHOSEN)
**Pros:** Consistent with NPE system, editable, focused view  
**Cons:** Requires implementation  
**Decision:** Best fit for use case

## Related Documentation

- [Nested Properties Editor](../components/nested-properties-editor.md)
- [Template Array Operations](template-array-operations.md)
- [Sample Markdown Template](../../src/data/templates/markdown/sample.ts)
- [Code Block Views](../components/code-block-views.md)

## Known Limitations

### Phase 1 Limitations

- Only single file reference supported
- No template evaluation in file parameter
- No array/multiple file support
- Edit mode requires manual save (no auto-save across files)

### Future Enhancements

- Auto-complete for file parameter
- Preview hover over file name
- Batch edit across multiple files
- Version history for cross-file edits
- Undo/redo across file boundaries

## Notes

- This feature complements array operations (template-array-operations.md)
- Combined, these enable powerful cross-note workflows
- Consider performance impact with many cross-references
- May need to limit number of simultaneous cross-file NPE displays
- Error handling is critical - must not break entire note rendering
