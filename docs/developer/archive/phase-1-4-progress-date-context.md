# Phase 1.4 Progress: DateContext Added ✅

## Summary

Successfully added `DateContext` to ContextProviders with full moment.js support for date formatting and manipulation. This enables templates to use date-based fields with flexible format strings.

## What Was Added

### DateContext Interface

```typescript
export interface DateContext {
    format(format: string, offsetStr?: string): string;
    year(): number;
    month(): number;
    monthName(): string;
    day(): number;
    weekday(): string;
    week(): number;
    iso(): string;
}
```

### Key Features

**1. Flexible Date Formatting**
- Uses moment.js format tokens
- Supports any format string from moment.js
- Examples:
  - `"YYYY-MM-DD"` → "2026-01-19"
  - `"dddd, MMMM Do, YYYY"` → "Sunday, January 19th, 2026"
  - `"YYYY/MM/DD"` → "2026/01/19"
  - `"DD.MM.YYYY"` → "19.01.2026"

**2. Date Offsets**
- Add or subtract time from current date
- Offset format: `[+-]number[hdwMy]`
- Units:
  - `h` = hours
  - `d` = days  
  - `w` = weeks
  - `M` = months
  - `y` = years
- Examples:
  - `date.format("YYYY-MM-DD", "+1d")` → Tomorrow
  - `date.format("YYYY-MM-DD", "-1w")` → Last week
  - `date.format("YYYY", "-1y")` → Last year
  - `date.format("MMMM", "+1M")` → Next month

**3. Convenient Helper Methods**
- `year()` - Current year (4-digit)
- `month()` - Current month (1-12, **not** 0-indexed!)
- `monthName()` - Month name (e.g., "January")
- `day()` - Day of month (1-31)
- `weekday()` - Weekday name (e.g., "Sunday")
- `week()` - ISO week number (1-53)
- `iso()` - ISO format date (YYYY-MM-DD)

## Implementation Details

### parseOffset Helper Function

```typescript
function parseOffset(offset: string): {
    amount: number;
    unit: moment.unitOfTime.DurationConstructor
} | null
```

- Parses offset strings like "+1d", "-2w"
- Returns null for invalid formats
- Used internally by `format()` method

### ContextFactory Integration

```typescript
createDateContext(): DateContext {
    const { moment } = window as typeof window & { moment: typeof import('moment') };
    
    return {
        format(formatStr: string, offsetStr?: string): string { ... },
        year(): number { ... },
        month(): number { return moment().month() + 1; },  // De-indexes!
        // ... other methods
    };
}
```

### Type System Updates

**Added to ContextType:**
```typescript
export type ContextType = 
    | "userInput"
    | "settings"
    | "plugin"
    | "noteMetadata"
    | "fs"
    | "vault"
    | "subclasses"
    | "date";  // ✨ NEW
```

**Updated FunctionEvaluator:**
- Added "date" to valid contexts list
- Added case for date context in `buildContexts()`
- Full integration with dual syntax support

## Usage Examples

### Simple Expression Syntax

```typescript
{
    kind: "function",
    context: ["date"],
    expression: "date.format('YYYY-MM-DD')",
    separator: "-"
}
// Generates: "2026-01-19-"
```

### Complex Function Syntax

```typescript
{
    kind: "function",
    function: "({ date }) => date.format('YYYY/MM/DD')",
    separator: "/"
}
// Generates: "2026/01/19/"
```

### With Offsets

```typescript
{
    kind: "function",
    context: ["date"],
    expression: "date.format('YYYY-MM-DD', '+1d')",
    fallback: "2026-01-20"
}
// Generates tomorrow's date
```

### Multiple Date Fields

```typescript
{
    segments: [
        {
            kind: "literal",
            value: "Daily Notes",
            separator: "/"
        },
        {
            kind: "function",
            context: ["date"],
            expression: "date.year()",
            separator: "/"
        },
        {
            kind: "function",
            context: ["date"],
            expression: "date.format('MM')",
            separator: " "
        },
        {
            kind: "function",
            context: ["date"],
            expression: "date.monthName()",
            separator: ""
        }
    ]
}
// Generates: "Daily Notes/2026/01 January"
```

### Replacing Legacy dateField

**Old format (legacy):**
```typescript
{ type: 'dateField', field: "currentDate", separator: " - " }
{ type: 'dateField', field: "weekday", separator: ", " }
{ type: 'dateField', field: "dayOfMonth", separator: ". " }
{ type: 'dateField', field: "monthName", separator: "" }
```

**New format (Phase 1):**
```typescript
{
    kind: "function",
    context: ["date"],
    expression: "date.format('YYYY-MM-DD')",  // or date.iso()
    separator: "-"
}
{
    kind: "function",
    context: ["date"],
    expression: "date.weekday()",
    separator: ","
}
{
    kind: "function",
    context: ["date"],
    expression: "date.day()",
    separator: "."
}
{
    kind: "function",
    context: ["date"],
    expression: "date.monthName()",
    separator: ""
}
```

**Or even simpler with format string:**
```typescript
{
    kind: "function",
    context: ["date"],
    expression: "date.format('YYYY-MM-DD - dddd, D. MMMM')",
    separator: ""
}
// Generates: "2026-01-19 - Sunday, 19. January"
```

## Benefits

### 1. Flexibility
- Any date format supported by moment.js
- Easy to change format without code changes
- Localization handled by moment.js

### 2. Power
- Date arithmetic with offsets
- Week numbers, ISO dates, etc.
- Consistent across all note types

### 3. Simplicity
- Single context for all date needs
- Clear, readable syntax
- Well-documented with examples

### 4. Backward Compatibility
- Legacy dateField still works (handled by PathTemplateParser)
- Can migrate gradually
- No breaking changes

## Moment.js Format Reference

Common format tokens:

| Token | Output |
|-------|--------|
| `YYYY` | 4-digit year (2026) |
| `YY` | 2-digit year (26) |
| `MMMM` | Full month name (January) |
| `MMM` | Short month name (Jan) |
| `MM` | 2-digit month (01-12) |
| `M` | Month (1-12) |
| `DD` | 2-digit day (01-31) |
| `D` | Day (1-31) |
| `dddd` | Full weekday (Sunday) |
| `ddd` | Short weekday (Sun) |
| `HH` | 24-hour (00-23) |
| `hh` | 12-hour (01-12) |
| `mm` | Minutes (00-59) |
| `ss` | Seconds (00-59) |
| `w` | Week of year (1-53) |

Full reference: https://momentjs.com/docs/#/displaying/format/

## Build Status

✅ **Build Successful** - No TypeScript errors  
✅ **DateContext implemented**  
✅ **ContextFactory updated**  
✅ **FunctionEvaluator integrated**  
✅ **Type system updated**

## Next Steps

Still to complete for Phase 1.4:
1. ~~Add DateContext~~ ✅ **DONE**
2. Rename `titleTemplate` → `fileName` in settings.ts
3. Rename `folderTemplate` → `folderPath` in settings.ts
4. Update DEFAULT_SETTINGS with new key names
5. Keep existing structure (don't unify templates yet)

Note: We're **NOT** doing these in Phase 1.4:
- ❌ Renaming `query` → `showInModal` (postponed - too risky)
- ❌ Unifying note template structure (postponed - Phase 3)
- ❌ Modifying all metadata templates (postponed)

---

**Status**: Phase 1.4 In Progress (DateContext ✅)  
**Date**: 2026-01-19  
**Next**: Rename titleTemplate/folderTemplate keys in settings.ts
