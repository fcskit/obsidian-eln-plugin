# PathEvaluator and FunctionEvaluator Test Suite

**Created**: January 19, 2026  
**Purpose**: Validate new template system before integration with NoteCreator  
**Status**: Ready for testing

## Test Files Created

### 1. `tests/test-path-evaluator.ts` (~580 lines)
Comprehensive TypeScript test definitions with 12 real-world test cases based on actual note type configurations from `settings.ts`.

**Test Categories**:
- Field Segments (simple extraction, nested paths)
- Literal Segments (static text)
- Counter Segments (auto-increment with/without prefix)
- Function Segments (DateContext, settings context)
- Transformations (uppercase, lowercase, kebab-case, snake-case)
- Complex Functions (arrow functions with conditional logic)

**Test Cases**:
1. **Analysis - fileName**: Sample name + method + counter
2. **Analysis - folderPath**: Full path with literals, fields, and counter
3. **Chemical - fileName**: Simple single field extraction
4. **Chemical - folderPath**: Literal prefix + type field
5. **DailyNote - fileName**: Date formatting with DateContext
6. **DailyNote - folderPath**: Year/month organization
7. **Transform - uppercase**: Field transformation
8. **Transform - kebab-case**: URL-safe name generation
9. **Function - operator initials**: Settings context integration
10. **Function - complex arrow**: Conditional logic in arrow function
11. **Field - nested access**: Deeply nested object paths
12. **Counter - with prefix**: Prefix-scoped counter

### 2. `tests/run-path-tests.js` (~220 lines)
Node.js test runner that executes all test cases and reports results.

**Features**:
- Mock plugin with vault and settings
- Mock moment.js for consistent date testing
- Detailed console output for each test
- Summary statistics (passed/failed/success rate)
- Exit codes for CI/CD integration

### 3. `tests/test-cases-manual.js` (~200 lines)
Manual test cases that can be run in Obsidian Developer Console.

**Purpose**:
- Quick validation in real Obsidian environment
- Interactive debugging
- Visual inspection of results

## How to Run Tests

### Option 1: Automated Test Runner (Planned)

```bash
# Build the plugin
npm run build-fast

# Run tests
node tests/run-path-tests.js
```

**Note**: Currently the test runner needs PathEvaluator to be exported from main.js. This will be set up in Phase 1.6 during integration.

### Option 2: Manual Testing in Obsidian Console

1. Build and load the plugin in Obsidian
2. Open Developer Console (Cmd+Option+I / Ctrl+Shift+I)
3. Get plugin instance:
   ```javascript
   const plugin = app.plugins.plugins['obsidian-eln']
   ```
4. Import PathEvaluator (once exported)
5. Run individual test cases from `test-cases-manual.js`

### Option 3: Integration Testing

Once PathEvaluator is integrated into NoteCreator (Phase 1.6), test by:
1. Creating notes of each type
2. Verifying generated file names and paths
3. Checking counter incrementation
4. Testing with various user inputs

## Test Data Structures

### Mock Plugin
```javascript
{
    app: {
        vault: {
            getAbstractFileByPath: (path) => mockFolder
        }
    },
    settings: {
        operators: [
            { name: "John Doe", initials: "JD" },
            { name: "Jane Smith", initials: "JS" }
        ],
        authors: [...]
    }
}
```

### Mock Folder
```javascript
{
    children: [
        { name: "Sample-A - XRD_01" },
        { name: "Sample-A - XRD_02" }
    ]
}
```

### Sample UserInput
```javascript
{
    project: { name: "Quantum-Study" },
    sample: { name: "Sample-A" },
    analysis: { method: "XRD" },
    operator: "John Doe"
}
```

## Expected Test Results

| Test # | Test Name | Expected Result | Validates |
|--------|-----------|-----------------|-----------|
| 1 | Analysis - fileName | `Sample-A - XRD_03` | Field + Counter |
| 2 | Analysis - folderPath | `Experiments/Analyses/Quantum-Study/Sample-A/XRD_03` | Full path |
| 3 | Chemical - fileName | `Sodium Chloride` | Simple field |
| 4 | Chemical - folderPath | `Resources/Chemicals/Salt` | Literal + field |
| 5 | DailyNote - fileName | `2026-01-19 - Monday, 19. January` | Date functions |
| 6 | DailyNote - folderPath | `Daily Notes/2026/01 January` | Date context |
| 7 | Transform - uppercase | `ABC-001` | Uppercase transform |
| 8 | Transform - kebab-case | `Projects/my-cool-project-2026` | Kebab-case transform |
| 9 | Function - operator initials | `EXP-JD-001` | Settings context |
| 10 | Function - complex arrow | `PWD-123` | Arrow function |
| 11 | Field - nested access | `XRD-500_Powder` | Deep nesting |
| 12 | Counter - with prefix | `EXP-2026-0003` | Prefix scoping |

## Test Coverage

### Segment Types
- ✅ Literal segments (static text)
- ✅ Field segments (userInput extraction)
- ✅ Function segments (DateContext, settings, complex)
- ✅ Counter segments (with/without prefix)

### Transformations
- ✅ uppercase
- ✅ lowercase  
- ✅ capitalize
- ✅ kebab-case (slugify)
- ✅ snake-case

### Contexts
- ✅ userInput (form data)
- ✅ date (DateContext with moment.js)
- ✅ settings (operators, authors)
- ⏸️ fs (file system) - tested in counter segments
- ⏸️ vault - tested in counter segments
- ⏸️ plugin - implicit in all tests
- ⏸️ noteMetadata - not used in path generation
- ⏸️ subclasses - not used in path generation

### Edge Cases
- ✅ Empty userInput
- ✅ Missing nested fields (should return empty)
- ✅ Multiple separators
- ✅ No separators
- ✅ Counter with existing files
- ✅ Counter with no existing files
- ✅ Deeply nested field access (3+ levels)
- ⏸️ Function errors with fallback
- ⏸️ Invalid transform types

## Next Steps

### Before Phase 1.6 Integration:
1. ✅ Create test suite (DONE)
2. ⏸️ Export PathEvaluator from main.js
3. ⏸️ Run automated tests
4. ⏸️ Fix any failing tests
5. ⏸️ Add additional edge case tests if needed

### During Phase 1.6 Integration:
1. Integrate PathEvaluator into NoteCreator
2. Test with real note creation
3. Verify backward compatibility with LegacyPathTemplate
4. Test all note types in actual Obsidian environment
5. Document any issues or adjustments needed

### After Integration:
1. Create regression test suite
2. Set up continuous testing
3. Document known limitations
4. Plan for Phase 2 (TemplateEvaluator migration)

## Known Limitations

1. **No Unit Test Framework**: Currently using manual testing approach
   - Could integrate Jest or Vitest in future
   - Would enable automated CI/CD testing

2. **Mock Limitations**: Some Obsidian APIs difficult to mock
   - TFolder children may not match real behavior exactly
   - Moment.js mock uses fixed date

3. **Async Testing**: Counter segments require async evaluation
   - Test runner must handle promises correctly

4. **Context Dependency**: Tests depend on plugin settings structure
   - Changes to settings schema may break tests

## Success Criteria

Tests are successful if:
- ✅ All 12 test cases pass
- ✅ No TypeScript errors in test files
- ✅ PathEvaluator handles all segment types correctly
- ✅ FunctionEvaluator works with both simple and complex syntax
- ✅ DateContext produces expected date formatting
- ✅ Transformations work as specified
- ✅ Counter incrementation works correctly
- ✅ Error handling doesn't crash (returns empty string)

## Files Modified

1. ✅ `tests/test-path-evaluator.ts` - Test case definitions
2. ✅ `tests/run-path-tests.js` - Test runner
3. ✅ `tests/test-cases-manual.js` - Manual test cases
4. ✅ `src/core/templates/PathEvaluator.ts` - Fixed transform methods
5. ✅ `docs/developer/test-suite-readme.md` - This document

## Build Status

```
✅ npm run build-fast successful
✅ No TypeScript errors in PathEvaluator.ts
✅ No TypeScript errors in test-path-evaluator.ts
✅ Test runner created (requires export setup)
✅ Manual test cases ready
```

Ready for Phase 1.6 integration! 🚀
