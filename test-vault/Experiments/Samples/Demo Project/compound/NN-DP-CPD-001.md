---
ELN version: 0.7.0
cssclasses:
  - sample
date created: 2026-02-03
author: Anne Anybody
note type: sample
tags:
  - sample/compound
project:
  name: Demo Project
  type: science
  link: "[[Demo Project.md]]"
sample:
  name: NN-DP-CPD-001
  operator: Nick Nobody
  type: compound
  description: Lithium cobalt oxide (own synthesis)
  preparation:
    - name: Calcination
      link: "[[Calcination]]"
      type: synthesis
      devices:
        - name: Nabertherm - Furnace 1
          link: "[[Nabertherm - Furnace 1.md]]"
          parameters:
            heating rate:
              value: 2
              unit: K/min
            holding temperature:
              value: 800
              unit: °C
            holding time:
              value: 300
              unit: min
            atmosphere: Air
      parameters:
        crucible: boat
        crucible material: Al2O3
  properties:
    density:
      value: 5.1
      unit: g/cm3
  total mass:
    value: 3
    unit: g
  product:
    chemical formula: "$LiCoO_2$"
    smiles: "[Li+].[O-2].[Co+3].[O-2]"
    molar mass:
      value: 97.87
      unit: g/mol
    yield:
      value: 80
      unit: "%"
  educts:
    - name: Lithium carbonate
      amount:
        value: 1.5
        unit: g
    - name: Cobalt carbonate
      amount:
        value: 3
        unit: g
  side products:
    - name: none
      amount:
        value: 0
        unit: mg
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
        - analysis.method.name == GCPL
    order:
      - file.name
      - formula.analytical method
      - formula.operator
      - formula.date
      - formula.status
      - formula.WE electrode
    sort: []

```

