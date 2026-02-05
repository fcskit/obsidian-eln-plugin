---
ELN version: 0.7.0
cssclasses:
  - sample
date created: 2026-02-04
author: Anne Anybody
note type: sample
tags:
  - sample/electrochemical_cell
project:
  name: Demo Project
  type: science
  link: "[[Demo Project.md]]"
sample:
  name: AA-DP-CELL-001
  operator: Anne Anybody
  type: electrochemical cell
  description: Demo electrochemical cell
  preparation:
    - name: Cell assembly
      link: "[[Cell assembly]]"
      type: synthesis
      devices:
        - name: MBraun - Glovebox Cell Assembly
          link: "[[MBraun - Glovebox Cell Assembly.md]]"
          parameters:
            H2O:
              value: 0.1
              unit: ppm
            O2:
              value: 0.1
              unit: ppm
  cell:
    name: Coin Cell - CR2032
    link: "[[Coin Cell - CR2032.md]]"
    type: coin cell
  working electrode:
    name: AA-DP-ELE-001
    active material mass:
      value: 0
      unit: mg
    total mass:
      value: 0
      unit: mg
    area:
      value: 2.01
      unit: cm2
    link: "[[AA-DP-ELE-001]]"
  counter electrode:
    name: AA-DP-ELE-002
    link: "[[AA-DP-ELE-002]]"
  reference electrode:
    name: Lithium Reference Electrode
    link: "[[Lithium Reference Electrode]]"
  electrolyte:
    name: LP30 - Standard Electrolyte
    volume:
      value: 20
      unit: µL
    link: "[[LP30 - Standard Electrolyte]]"
  separator:
    name: Celgard 2320 Trilayer Microporous Membrane
    layers: 1
    link: "[[Celgard 2320 Trilayer Microporous Membrane]]"
---

> [!Example] TOC
> - [[#Properties]]
> - [[#Processing]]
> - [[#My Notes]]
> - [[#Characterization]]
> - [[#Electrochemical Characterization]]

## Properties

```eln-properties
key: sample
actionButtons: hidden
cssclasses: eln-sample
```

## Processing

**Open process description**

```base
formulas:
  processes: sample.preparation.map([value.link])
views:
  - type: list
    name: Processes
    filters:
      and:
        - tags.contains("sample")
        - sample.name == this.sample.name
    order:
      - formula.processes

```



## My Notes

> [!Info]
> Add your notes for this sample here.

## All Characterizations

```base
formulas:
  analytical method: analysis.method.name
  operator: analysis.operator
  date: analysis.date
  status: analysis.status
properties:
  file.name:
    displayName: Analysis
  formula.analytical method:
    displayName: Method
  formula.operator:
    displayName: Operator
  formula.date:
    displayName: Date
  formula.status:
    displayName: Status
views:
  - type: table
    name: Analyses
    filters:
      and:
        - tags.contains("analysis")
        - sample.name == this.file.name
    order:
      - file.name
      - formula.analytical method
      - formula.operator
      - formula.date
      - formula.status
    sort:
      - property: formula.analytical method
        direction: DESC

```

## Electrochemical Characterizations

```base
formulas:
  analytical method: analysis.method.name
  operator: analysis.operator
  date: analysis.date
  status: analysis.status
  WE electrode: sample["working electrode"]["name"]
properties:
  file.name:
    displayName: Analysis
  formula.analytical method:
    displayName: Method
  formula.operator:
    displayName: Operator
  formula.date:
    displayName: Date
  formula.status:
    displayName: Status
views:
  - type: table
    name: Echem. Analyses
    filters:
      and:
        - tags.contains("analysis")
        - sample.name == this.file.name
        - - analysis.method.name == GCPL
    order:
      - file.name
      - formula.analytical method
      - formula.operator
      - formula.date
      - formula.status
      - formula.WE electrode
    sort: []

```

