# Complete UI Components Example

This example demonstrates all three UI components working together in a single note.

## Experiment Overview

```nested-properties
key: experiment
```

## Chemical References

For this experiment, we'll be working with several elements. Here's the periodic table for reference:

```periodic-table
```

## Visual Documentation

### Progress Photos

```image-viewer
folder: assets/experiments/exp-001
shuffle: manual
shuffleOrder: alphabetic
thumbnails: true
size: 500
bgColor: #f8f8f8
```

### Microscopy Images

```image-viewer
folder: assets/experiments/exp-001/microscopy
shuffle: auto
interval: 6
size: 400
invertGray: true
```

## Data Management

### Experimental Conditions

```nested-properties
key: conditions
actionButtons: true
```

### Results Data

```nested-properties
key: results
excludeKeys: internal_calculations,temporary_data
```

### Equipment Settings

```nested-properties
key: equipment
actionButtons: false
cssclasses: compact-view
```

---

## Example Frontmatter Structure

This note would work with frontmatter like this:

```yaml
---
experiment:
  id: "EXP-2024-001"
  title: "Crystal Growth Study"
  date: "2024-01-15"
  researcher: "Dr. Smith"
  status: "in-progress"

conditions:
  temperature: 25
  pressure: 1.0
  ph: 7.2
  duration_hours: 48

results:
  yield_percent: 87.3
  purity: 95.1
  crystal_size_mm: 2.4
  color: "pale blue"
  notes: "Well-formed crystals with minimal defects"

equipment:
  microscope: "Zeiss Axio Imager"
  camera: "Canon EOS R5"
  heating_plate: "IKA C-MAG HS 7"
  ph_meter: "Hanna HI-2020"
---
```
