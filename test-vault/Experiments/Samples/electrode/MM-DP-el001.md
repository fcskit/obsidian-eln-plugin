---
ELN version: ""
cssclasses:
  - chemical
date created: 2025-07-03
author: ""
note type: chemical
tags:
  - sample/electrode
project: Test Project
sample:
  name: Test electrode
  type: electrode
  description: ""
  active material:
    name: NMC 622 Test
    mass:
      value: ""
      unit: mg
    loading:
      value: ""
      unit: mg/cm2
  binder:
    name: PVDF
    mass:
      value: ""
      unit: mg
  conductive additive:
    mass:
      value: ""
      unit: mg
  solvent:
    name: NMP
    volume:
      value: ""
      unit: ml
  current collector:
    name: Copper foil
    thickness:
      value: ""
      unit: µm
    width:
      value: ""
      unit: cm
    length:
      value: ""
      unit: cm
  dry thickness:
    value: ""
    unit: µm
  porosity:
    value: ""
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
actionButtons: false
cssclasses: eln-sample
```

## Processing

**Open process description**
- [[]]

```eln-properties
file: sample.process.name
key: process
actionButtons: false
cssclasses: eln-process
```
## My Notes

> [!Info]
> Add your notes for this sample here.

## Characterization

```base
formulas:
  analytical method: analysis.method
  operator: analysis.operator
  date: analysis.date
  status: analysis.status
views:
  - type: table
    name: Table
    filters:
      and:
        - tags.contains("analysis")
        - sample.name.contains(this.file.name)
    order:
      - file.name
      - formula.analytical method
      - formula.operator
      - formula.date
      - formula.status
    sort: []

```


## Electrochemical Characterization

```base
formulas:
  analytical method: analysis.method
  operator: analysis.operator
  date: analysis.date
  status: analysis.status
  WE electrode: sample["working electrode"]["name"]
views:
  - type: table
    name: Table
    filters:
      and:
        - tags.contains("analysis")
        - sample.name.contains(this.file.name)
        - analysis.method.contains(GCPL)  
    order:
      - file.name
      - formula.analytical method
      - formula.operator
      - formula.date
      - formula.status
      - formula.WE electrode
    sort: []

```




