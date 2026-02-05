# UI Components User Guide

This guide covers the advanced UI components available in the ELN Plugin: **ImageViewer**, **PeriodicTable**, and the **Nested Properties Editor** (both standalone view and embedded code block version).

## 📸 ImageViewer

The ImageViewer component creates an interactive slideshow for displaying images from your vault. It supports automatic and manual navigation, thumbnails, visual effects, and customizable display options.

### Basic Usage

Create an ImageViewer by using a code block with the `image-viewer` language:

````markdown
```image-viewer
folder: assets/experiments/photos
```
````

### Configuration Options

The ImageViewer accepts the following configuration parameters:

#### Required Parameters

- **`folder`**: Path to the folder containing images (relative to vault root)
  ```
  folder: assets/images/microscopy
  folder: Daily Notes/2024/January/photos
  ```

#### Display Options

- **`size`**: Image width in pixels (height scales automatically)
  ```
  size: 400
  size: 600
  ```

- **`bgColor`**: Background color for the viewer container
  ```
  bgColor: #f0f0f0
  bgColor: black
  bgColor: rgba(0,0,0,0.1)
  ```

- **`image`**: Start with a specific image (filename)
  ```
  image: sample_01.jpg
  image: microscope_view.png
  ```

#### Navigation & Slideshow

- **`shuffle`**: Enable navigation controls
  - `manual`: Show previous/next buttons for user control
  - `auto`: Automatically change images at intervals
  ```
  shuffle: manual
  shuffle: auto
  ```

- **`shuffleOrder`**: Order for image transitions
  - `alphabetic`: Navigate images in alphabetical order
  - `random`: Display images in random order
  ```
  shuffleOrder: alphabetic
  shuffleOrder: random
  ```

- **`interval`**: Auto-change interval in seconds (only with `shuffle: auto`)
  ```
  interval: 5
  interval: 10
  ```

#### Advanced Features

- **`thumbnails`**: Show thumbnail navigation bar
  ```
  thumbnails: true
  thumbnails: false
  ```

- **`invertGray`**: Apply visual filter (invert colors + 180° hue rotation)
  This option may be useful if you prefer working in dark mode and want to display plots of your experimental data with a transparent background and black or dark axis and axis labels. The option will invert the colors of the image so that black becomes white. Since simple color inversion would also change the base colors of the lines in the plot a 180° hue rotation is applied. This will restore the original hue but dark colors will be lighter and light colors darker due to the previous color inversion.
  ```
  invertGray: true
  invertGray: false
  ```

### Complete Examples

#### Basic Image Gallery
````markdown
```image-viewer
folder: assets/lab-photos
size: 500
thumbnails: true
```
````

#### Automatic Slideshow
````markdown
```image-viewer
folder: Daily Notes/2024/experiments
shuffle: auto
shuffleOrder: alphabetic
interval: 8
size: 400
bgColor: #1a1a1a
```
````

#### Manual Navigation with Effects
````markdown
```image-viewer
folder: assets/microscopy/samples
shuffle: manual
shuffleOrder: random
thumbnails: true
size: 600
invertGray: true
```
````

#### Focused Image Display
````markdown
```image-viewer
folder: assets/results
image: final_product.jpg
size: 450
bgColor: white
```
````

### Supported Image Formats

- **JPEG**: `.jpg`, `.jpeg`
- **PNG**: `.png`
- **GIF**: `.gif`

### Tips & Best Practices

1. **Folder Organization**: Keep related images in dedicated folders for easier management
2. **Performance**: For large image collections, consider using `thumbnails: false` for better performance
3. **Auto Slideshow**: Use reasonable intervals (5-10 seconds) for automatic slideshows
4. **Visual Effects**: The `invertGray` filter is useful for dark themes or scientific imagery
5. **Size Settings**: Choose appropriate sizes based on your note layout and image resolution

---

## 🧪 PeriodicTable

The PeriodicTable component displays an interactive periodic table of elements with detailed information popups.

### Basic Usage

Add a periodic table to your note using a code block:

````markdown
```periodic-table
```
````

That's it! The periodic table will be rendered with all elements displayed in their correct positions.

Currently the periodic table view does not support any options. However, options may be added to a later date to display different element information or color mappings for the elements.

### Features

#### Interactive Elements
- **Hover Information**: Hover over any element to see detailed information
  - Element name and atomic number
  - Chemical symbol
  - Group and period
  - Atomic mass
  - Electronegativity
  - Stability information
  - Known isotopes

#### Visual Design
- **Group Coloring**: Elements are color-coded by their chemical groups:
  - Alkali metals
  - Alkaline earth metals
  - Transition metals
  - Post-transition metals
  - Metalloids
  - Nonmetals
  - Halogens
  - Noble gases

#### Complete Layout
- **Main Table**: Standard 18-column periodic table layout
- **Lanthanoids**: Separate row for lanthanoid elements
- **Actinoids**: Separate row for actinoid elements

### Usage Examples

#### Standard Periodic Table
````markdown
# Chemical Reference

For quick element lookup, here's the complete periodic table:

```periodic-table
```

Use this to identify element properties and relationships.
````

#### In Chemistry Notes
````markdown
# Transition Metal Chemistry

## Overview

```periodic-table
```

Transition metals (highlighted in blue-green) show variable oxidation states...
````

#### Laboratory Reference
````markdown
# Lab Safety - Element Properties

```periodic-table
```

**Safety Note**: Always check element properties before handling. Hover over elements above for detailed information including stability and common isotopes.
````

### Integration with Research Notes

The periodic table integrates seamlessly with the ELN plugin's chemical features:

1. **Element Selection**: Click or reference elements in your experimental procedures
2. **Chemical Formulas**: Use alongside chemical notation in your notes
3. **Research Planning**: Quick reference for element properties when designing experiments

---

## 🔧 Nested Properties Editor (NPE)

The Nested Properties Editor provides a visual interface for editing note frontmatter (YAML properties) with advanced features for complex data structures.

### Two Usage Modes

#### 1. Sidebar View (Global)

Access the NPE through the sidebar:
1. Open the command palette (`Ctrl/Cmd + P`)
2. Run "Open Nested Properties Editor View"
3. The editor opens in the sidebar and automatically tracks the active note

**Features:**
- Automatic file tracking (switches when you change notes)
- Persistent view (stays open across sessions)
- Full-featured editing interface

#### 2. Embedded Code Block (Note-Specific)

Embed the NPE directly in your notes using code blocks:

````markdown
```nested-properties
```
````

### Configuration Options for Embedded NPE

The embedded version supports several configuration parameters:

#### Focus on Specific Properties

- **`key`**: Edit only a specific property or nested object
  ````markdown
  ```nested-properties
  key: experiment_conditions
  ```
  ````

- **`excludeKeys`**: Hide specific properties from the editor
  ````markdown
  ```nested-properties
  excludeKeys: id,created_date,internal_notes
  ```
  ````

#### Interface Controls

- **`actionButtons`**: Show/hide add/delete action buttons
  ````markdown
  ```nested-properties
  actionButtons: false
  ```
  ````

- **`cssclasses`**: Apply custom CSS classes for styling
  ````markdown
  ```nested-properties
  cssclasses: compact-view,dark-theme
  ```
  ````

### Complete Configuration Examples

#### Basic Embedded Editor
````markdown
# Experiment Log

```nested-properties
```

## Procedure
...
````

#### Focused Property Editing
````markdown
# Sample Analysis

## Conditions
Edit the experimental conditions:

```nested-properties
key: conditions
actionButtons: true
```

## Results
...
````

#### Minimal Interface
````markdown
# Quick Data Entry

```nested-properties
excludeKeys: id,file_path,template_version
actionButtons: false
cssclasses: minimal-editor
```
````

#### Multiple Focused Editors
````markdown
# Complex Experiment Setup

## Chemical Composition
```nested-properties
key: chemicals
```

## Equipment Settings
```nested-properties
key: equipment
excludeKeys: calibration_date
```

## Environmental Conditions
```nested-properties
key: environment
actionButtons: false
```
````

### Data Types & Features

The NPE supports all YAML/frontmatter data types:

#### Simple Properties
- **Text**: Regular text fields
- **Numbers**: Numeric values
- **Dates**: Date pickers
- **Booleans**: Toggle switches

#### Complex Structures
- **Objects**: Nested properties with expand/collapse
- **Arrays**: Lists of values with add/remove functionality
- **Mixed Arrays**: Arrays containing different data types

#### Advanced Features
- **Type Switching**: Change data types on the fly
- **Real-time Updates**: Changes sync immediately to frontmatter
- **Validation**: Prevents invalid data entry
- **Memory Optimization**: Efficient handling of large data structures

### Practical Examples

#### Laboratory Notebook
````markdown
---
experiment_id: EXP-2024-001
title: "Protein Crystallization Study"
researcher: "Dr. Smith"
date: 2024-01-15
conditions:
  temperature: 20
  ph: 7.4
  buffer: "Tris-HCl"
  concentration: 0.1
samples:
  - name: "Sample A"
    purity: 95.2
    volume: 50
  - name: "Sample B"
    purity: 98.1
    volume: 75
---

# Experiment Setup

## Conditions Editor
```nested-properties
key: conditions
```

## Sample Management
```nested-properties
key: samples
```
````

#### Project Tracking
````markdown
---
project:
  name: "Solar Cell Efficiency"
  phase: "Testing"
  team:
    - "Alice Johnson"
    - "Bob Chen"
    - "Carol Davis"
  milestones:
    design_complete: true
    prototype_built: true
    testing_started: false
    analysis_complete: false
budget:
  allocated: 50000
  spent: 32450
  remaining: 17550
---

# Project Dashboard

## Team & Milestones
```nested-properties
key: project
excludeKeys: id,created_by
```

## Budget Tracking
```nested-properties
key: budget
actionButtons: false
```
````

#### Chemical Inventory
````markdown
---
inventory:
  chemicals:
    sodium_chloride:
      cas: "7647-14-5"
      purity: 99.9
      amount: "500g"
      location: "Cabinet A, Shelf 2"
      expiry: "2025-12-31"
    ethanol:
      cas: "64-17-5"
      purity: 95.0
      amount: "1L"
      location: "Flammable Storage"
      expiry: "2024-08-15"
---

# Chemical Inventory

```nested-properties
key: inventory.chemicals
```
````

### Tips & Best Practices

#### General Usage
1. **Start Simple**: Begin with the basic embedded editor before using advanced configurations
2. **Property Organization**: Group related properties in objects for better organization
3. **Backup Data**: Always backup your vault before extensive frontmatter editing

#### Performance Optimization
1. **Large Data Sets**: Use `excludeKeys` to hide unnecessary properties in large documents
2. **Complex Objects**: Consider splitting very complex data across multiple focused editors
3. **Memory Management**: The NPE automatically optimizes memory for large data structures

#### Integration Tips
1. **Template Compatibility**: NPE works seamlessly with ELN plugin templates
2. **Search Integration**: Edited properties are immediately searchable in Obsidian
3. **Plugin Compatibility**: Works with other plugins that read frontmatter data

---

## 🔄 Component Integration

These UI components work together to create a comprehensive research environment:

### Combined Usage Example

````markdown
---
experiment:
  title: "Crystallization Analysis"
  date: 2024-01-15
  elements_used: ["Na", "Cl", "H", "O"]
  photos_folder: "assets/exp-001/images"
conditions:
  temperature: 25
  pressure: 1.0
  humidity: 45
---

# Crystallization Study

## Experimental Setup

### Element Reference
```periodic-table
```

### Condition Parameters
```nested-properties
key: conditions
```

## Documentation

### Image Gallery
```nested-properties
key: experiment.photos_folder
```

```image-viewer
folder: assets/exp-001/images
shuffle: manual
thumbnails: true
size: 500
```

## Data Entry

### Complete Experiment Data
```nested-properties
excludeKeys: internal_id,file_version
```
````

This comprehensive setup provides:
- **Chemical reference** with the periodic table
- **Visual documentation** with the image viewer
- **Structured data entry** with the nested properties editor
- **Seamless integration** between all components

---

## 🎯 Quick Reference

### ImageViewer Code Block
```
```image-viewer
folder: path/to/images
size: 500
shuffle: manual|auto
shuffleOrder: alphabetic|random
interval: 5
thumbnails: true|false
invertGray: true|false
bgColor: #color
image: filename.jpg
```
```

### PeriodicTable Code Block
```
```periodic-table
```
```

### Nested Properties Editor Code Block
```
```nested-properties
key: property.path
excludeKeys: key1,key2,key3
actionButtons: true|false
cssclasses: class1,class2
```
```

### Common Use Cases

- **Lab Documentation**: Combine all three for complete experimental records
- **Chemical Research**: Use PeriodicTable + NPE for chemical data management
- **Visual Analysis**: Combine ImageViewer + NPE for annotated image studies
- **Project Management**: Use NPE for structured project data with ImageViewer for progress photos
