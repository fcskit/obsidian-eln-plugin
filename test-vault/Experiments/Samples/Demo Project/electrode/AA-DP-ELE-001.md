---
ELN version: 0.7.0
cssclasses:
  - sample
date created: 2026-02-04
author: Anne Anybody
note type: sample
tags:
  - sample/electrode
project:
  name: Demo Project
  type: science
  link: "[[Demo Project.md]]"
sample:
  name: AA-DP-ELE-001
  operator: Anne Anybody
  type: electrode
  description: Demo electrode
  preparation:
    - name: Electrode Coating
      link: "[[Electrode Coating]]"
      type: synthesis
      devices:
        - name: Unicorn Devices - Test Coater
          link: "[[Unicorn Devices - Test Coater.md]]"
          parameters:
            speed:
              value: 10
              unit: cm/min
  active material:
    - name: Lithium nickel manganese cobalt oxide
      mass:
        value: 2.58
        unit: g
      loading:
        value: 12.9
        unit: mg/cm2
  binder:
    - name: PVDF
      mass:
        value: 78
        unit: mg
  conductive additive:
    - name: Carbon Back SuperP
      mass:
        value: 78
        unit: mg
  solvent:
    - name: NMP
      volume:
        value: 10
        unit: ml
  current collector:
    name: Copper foil
    thickness:
      value: 10
      unit: µm
    width:
      value: 15
      unit: cm
    length:
      value: 25
      unit: cm
  dry thickness:
    value: 80
    unit: µm
  porosity:
    value: 50
    unit: "%"
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

