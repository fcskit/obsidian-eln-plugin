# Tests

This folder contains test scripts for the Obsidian ELN plugin.

## Test Files

- `test-chemical-lookup.js` - Tests the ChemicalLookup utility integration with external APIs
- `test-subclass.ts` - Tests subclass template functionality 
- `test-subclass-isolation.ts` - Tests complete subclass template isolation to ensure base templates remain immutable
- `test-list-types.ts` - Tests the list input type implementation

## Running Tests

Most test files are designed to be run in the browser console when the plugin is loaded in Obsidian.

For the chemical lookup test (Node.js):
```bash
node tests/test-chemical-lookup.js
```
