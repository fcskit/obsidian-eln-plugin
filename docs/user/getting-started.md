---
layout: default
title: Getting Started
---

# Getting Started with Obsidian ELN Plugin

Welcome! This guide will help you understand the basic workflow and concepts of the Obsidian ELN Plugin, so you can start documenting your research effectively.

## 📋 Table of Contents

1. [Understanding the ELN Concept](#understanding-the-eln-concept)
2. [Basic Workflow](#basic-workflow)
3. [Note Types and Dependencies](#note-types-and-dependencies)
4. [Creating Your First Notes](#creating-your-first-notes)
5. [Best Practices](#best-practices)
6. [Common Patterns](#common-patterns)

---

## Understanding the ELN Concept

The Obsidian ELN Plugin transforms your Obsidian vault into an **Electronic Lab Notebook** with structured, interconnected research documentation.

### Key Concepts

**Templates**: Pre-defined structures for different types of research notes (experiments, samples, chemicals, etc.)

**Metadata**: Structured information stored in YAML frontmatter that makes your notes searchable and linkable

**Reactive Fields**: Fields that automatically update when related information changes

**Note Dependencies**: How different note types reference and link to each other

---

## Basic Workflow

### The Typical Research Documentation Flow

```
1. Set Up Resources (One-Time)
   ├── Create Projects
   ├── Document Chemicals/Materials
   ├── Define Processes/Protocols
   └── Add Instruments/Devices

2. Create Samples
   ├── Link to Project
   ├── Reference Chemicals (educts/reactants)
   ├── Reference Processes (preparation method)
   └── Document experimental conditions
   └── Set Status (planned/in-progress/complete)

3. Perform Analyses
   ├── Link to Sample
   ├── Reference Instrument
   ├── Document Results
   └── Set Status (planned/in-progress/complete)

4. Review and Report
   ├── Link Related Notes
   ├── Generate Reports
   └── Share Findings
```

> **Note about Experiments**: Samples and Analyses are considered to be experiments. Both are stored in the `Experiments/` folder. Use the `status` field to track experiment progress (currently implemented for Analyses; will also be added to Samples).

---

## Note Types and Dependencies

Understanding how note types relate to each other is crucial for effective documentation.

### 📁 Resource Notes (Foundation Layer)

These are the building blocks referenced by other notes:

#### **Projects**
- **Purpose**: Organize related experiments and analyses
- **Dependencies**: None (standalone)
- **Used by**: Samples, Analyses
- **Example**: "Battery Development Project", "Synthesis Optimization Study"

#### **Chemicals**
- **Purpose**: Document materials and compounds
- **Dependencies**: None (standalone)
- **Used by**: Samples
- **Example**: "Lithium Carbonate", "Sulfuric Acid", "NMC-622"

#### **Processes**
- **Purpose**: Define procedures and protocols
- **Dependencies**: May reference Chemicals, Devices
- **Used by**: Samples
- **Example**: "Ball Milling", "Calcination", "Electrode Coating"

#### **Devices**
- **Purpose**: Document equipment and tools
- **Dependencies**: None (standalone)
- **Used by**: Processes, Samples
- **Example**: "Planetary Ball Mill", "Tube Furnace", "Balance"

#### **Instruments**
- **Purpose**: Document analytical instruments
- **Dependencies**: None (standalone)
- **Used by**: Analyses
- **Example**: "XRD Diffractometer", "SEM Microscope", "Potentiostat"

### 🧪 Experimental Notes (Work Layer)

These document your actual research activities:

#### **Samples**
- **Purpose**: Track specific samples and document experimental procedures
- **Dependencies**:
  - **Required**: At least one Project
  - **Recommended**: Chemicals (educts/reactants), Processes (preparation method)
- **Used by**: Analyses
- **Storage Location**: `Experiments/` folder
- **Status Tracking**: Should include status field (planned/in-progress/complete)
- **Example**: "NMC-622 Sample Batch A", "Cathode Material Synthesis #1"

#### **Analyses**
- **Purpose**: Document analytical measurements and results
- **Dependencies**:
  - **Required**: Sample (what was analyzed)
  - **Recommended**: Instrument (how it was measured), Project
- **Used by**: Reports, Publications
- **Storage Location**: `Experiments/` folder
- **Status Tracking**: Includes status field (planned/in-progress/complete)
- **Example**: "XRD Analysis of Sample A", "Electrochemical Testing Batch A"

### 📝 Documentation Notes (Organization Layer)

#### **Daily Notes**
- **Purpose**: Daily lab journal entries
- **Dependencies**: Can link to any note type
- **Example**: "2026-02-06 - Lab Journal"

#### **Meetings**
- **Purpose**: Meeting minutes and discussions
- **Dependencies**: Can link to Projects, People
- **Example**: "Weekly Project Meeting - Feb 6"

#### **Contacts**
- **Purpose**: People and institutions
- **Dependencies**: None (standalone)
- **Example**: "Dr. Jane Smith", "University Lab"

---

## Creating Your First Notes

### Step 1: Set Up Your First Project

Before creating experiments or samples, you need at least one project:

1. Press `Ctrl/Cmd+P` to open command palette
2. Type "ELN: Create Note"
3. Select **"Project"** template
4. Fill in:
   - **Title**: "My First Research Project"
   - **Type**: "Research"
   - **Start Date**: Today's date
   - **Description**: Brief project description
5. Click "Create Note"

✅ **You now have a project to organize your work!**

### Step 2: Document Your Resources

Before creating samples, document the chemicals and processes you'll use:

#### Create a Chemical Note

1. Open command palette: `Ctrl/Cmd+P` → "ELN: Create Note"
2. Select **"Chemical"** template
3. Fill in:
   - **Name**: e.g., "Lithium Carbonate"
   - **Type**: e.g., "Inorganic Compound"
   - **Formula**: e.g., "Li₂CO₃"
   - **CAS Number**: (optional)
4. Click "Create Note"

#### Create a Process Note

1. Open command palette: `Ctrl/Cmd+P` → "ELN: Create Note"
2. Select **"Process"** template
3. Fill in:
   - **Name**: e.g., "Ball Milling"
   - **Description**: Brief procedure description
   - **Parameters**: Temperature, time, etc.
4. Click "Create Note"

### Step 3: Create Your First Sample

Now you can create a sample using your project and resources. Remember: **Samples ARE your experiments** - they document what you're making, how you're making it, and the experimental conditions.

1. Open command palette: `Ctrl/Cmd+P` → "ELN: Create Note"
2. Select **"Sample"** template
3. Fill in:
   - **Project**: Select your project (dropdown will show available projects)
   - **Type**: Choose sample type (e.g., "Compound", "Material")
   - **Educts**: Select chemicals used (can select multiple)
   - **Preparation**: Select process used
   - **Description**: What the sample is and experimental goals
   - **Status**: Set to "planned", "in-progress", or "complete"
4. Click "Create Note"

✅ **Your sample note is automatically linked to the project, chemicals, and process! This note will be saved in the `Experiments/` folder.**

### Step 4: Create an Analysis

Document measurements performed on your sample. **Analyses ARE your analytical measurements** - they document what you measured, how you measured it, and the results.

1. Open command palette: `Ctrl/Cmd+P` → "ELN: Create Note"
2. Select **"Analysis"** template
3. Fill in:
   - **Sample**: Select the sample you just created
   - **Project**: Should auto-fill from sample
   - **Analysis Type**: e.g., "XRD", "SEM", "Electrochemistry"
   - **Instrument**: Select instrument used
   - **Status**: Set to "planned", "in-progress", or "complete"
   - **Results**: Document your findings
4. Click "Create Note"

✅ **Your analysis note is automatically linked to the sample and saved in the `Experiments/` folder.**

---

## Best Practices

### 📌 Recommended Workflow

1. **Start with Projects**: Always create projects first to organize your work

2. **Build Your Resource Library**: Document chemicals, devices, processes you use regularly

3. **Create Samples for Experiments**: Samples ARE your experiments - they document what you're making and how

4. **Track Progress with Status**: Use status fields to track experiment progress (planned → in-progress → complete)

5. **Use Consistent Naming**: Follow naming conventions (e.g., "PROJECT-ID-SAMPLE-001")

6. **Link Related Notes**: Use the built-in dropdowns to link notes rather than typing manually

7. **Update as You Go**: Fill in details immediately while fresh in your mind

8. **Use Tags**: Add tags for easy filtering and searching

### ⚠️ Common Mistakes to Avoid

❌ **Creating samples before projects**: Samples need a project reference

❌ **Skipping resource documentation**: Document chemicals/processes before using them

❌ **Looking for "Experiment" note type**: Samples and Analyses ARE your experiments

❌ **Manual linking**: Use dropdowns instead of typing note names manually

❌ **Incomplete metadata**: Fill in all required fields for proper organization

❌ **Inconsistent naming**: Stick to a naming convention for easy searching

### ✅ Tips for Success

✨ **Use the Test Vault**: Download the test vault to see example workflows

✨ **Start Simple**: Begin with basic note types, add complexity as needed

✨ **Regular Backups**: Back up your vault regularly (Obsidian Sync or git)

✨ **Template Customization**: Customize templates to match your workflow

✨ **Dataview Integration**: Use Dataview plugin to create dynamic dashboards

---

## Common Patterns

### Pattern 1: Synthesis Experiment

```
1. Create Project: "Material Synthesis Study"
2. Create Chemicals: Document all starting materials
3. Create Process: "Solid State Synthesis"
4. Create Device: "Tube Furnace"
5. Create Sample (Experiment): Link project, chemicals, process, device
   - Set status: "planned" → "in-progress" → "complete"
   - Saved in Experiments/ folder
6. Create Analysis (Measurement): XRD, SEM, etc. on the sample
   - Set status: "planned" → "in-progress" → "complete"
   - Saved in Experiments/ folder
```

### Pattern 2: Electrochemical Testing

```
1. Create Project: "Battery Testing Program"
2. Create Sample (Experiment): Reference existing electrode materials
   - Document preparation or source
   - Set status as appropriate
3. Create Instrument: "Potentiostat"
4. Create Analysis (Measurement): "Cyclic Voltammetry"
   - Link to sample and instrument
   - Document settings and results
   - Set status: "planned" → "in-progress" → "complete"
```

### Pattern 3: Daily Lab Work

```
1. Create Daily Note: Today's date
2. Link to:
   - Projects you worked on
   - Samples you prepared (experiments)
   - Analyses you performed (measurements)
   - Meetings you attended
3. Add observations and ideas
```

---

## Next Steps

Now that you understand the basics:

1. 📖 **[Read Features Overview](features.md)** - Discover all plugin capabilities
2. 🎨 **[Explore Templates](TEMPLATE_SYSTEM.md)** - Understand template customization
3. 🧪 **[Try Examples](template-examples/)** - Use pre-made templates
4. ⚙️ **[Configure Settings](installation.md#configuration)** - Customize the plugin
5. 🎯 **[See UI Components](ui-components.md)** - Learn about advanced features

---

## Getting Help

- 📚 **[Full Documentation](README.md)** - Complete user guide
- 🐛 **[Known Issues](../developer/public/KNOWN-ISSUES.md)** - Current limitations
- 💬 **[GitHub Discussions](https://github.com/fcskit/obsidian-eln-plugin/discussions)** - Ask questions
- 🔧 **[Report Issues](https://github.com/fcskit/obsidian-eln-plugin/issues)** - Report bugs

---

**Ready to start?** Download the [test vault](https://github.com/fcskit/obsidian-eln-plugin/releases/latest) to see everything in action, or install the plugin and create your first project!
