---
ELN version: 0.7.0
cssclasses:
  - sample-list
date created: 2026-02-03
author: Anne Anybody
note type: sample-list
tags:
  - list/samples
project:
  name: Demo Project
---

> [!Example] TOC
> - [[#Compounds]]
> - [[#Electrodes]]
> - [[#Electrochemical Cells / Batteries]]
> - [[#All Samples]]

## Compounds

```base
formulas:
  chemical formula: sample.product["chemical formula"]
  educts: sample.educts.map([value.name + " (" + value.amount.value + " " + value.amount.unit + ")"])
properties:
  file.name:
    displayName: Compound
  formula.chemical formula:
    displayName: Chemical formula
  formula.educts:
    displayName: Educts
views:
  - type: table
    name: Compounds
    filters:
      and:
        - tags.contains("sample")
        - project.name == this.project.name
        - sample.type == "compound"
    order:
      - file.name
      - formula.chemical formula
      - formula.educts
      - date created
    sort:
      - property: file.name
        direction: DESC
    columnSize:
      formula.educts: 296

```

## Electrodes

```base
formulas:
  active_material: sample["active material"].map([value.name + " (" + value.mass.value + " " + value.mass.unit + ")"])
  binder: sample.binder.map([value.name + " (" + value.mass.value + " " + value.mass.unit + ")"])
  cond_additive: sample["conductive additive"].map([value.name + " (" + value.mass.value + " " + value.mass.unit + ")"])
properties:
  file.name:
    displayName: Electrode
views:
  - type: table
    name: Electrodes
    filters:
      and:
        - tags.contains("sample")
        - project.name == this.project.name
        - sample.type == "electrode"
    order:
      - file.name
      - formula.active_material
      - formula.binder
      - formula.cond_additive
      - date created
    sort:
      - property: file.name
        direction: DESC
      - property: formula.active material
        direction: ASC
    columnSize:
      formula.active_material: 321

```

## Electrochemical Cells / Batteries

```base
formulas:
  working electrode: sample["working electrode"]["link"]
  counter electrode: sample["counter electrode"]["link"]
  reference electrode: sample["reference electrode"]["link"]
  electrolyte: sample.electrolyte.link
properties:
  file.name:
    displayName: Cell/Battery
views:
  - type: table
    name: Echem. Cells/Batteries
    filters:
      and:
        - tags.contains("sample")
        - project.name == this.project.name
        - sample.type == "electrochemical cell"
    order:
      - file.name
      - formula.working electrode
      - formula.counter electrode
      - formula.reference electrode
      - formula.electrolyte
      - date created
    sort:
      - property: file.name
        direction: DESC

```

## All Samples

```base
formulas:
  type: sample.type
  description: sample.description
properties:
  file.name:
    displayName: Sample
views:
  - type: table
    name: All Samples
    filters:
      and:
        - tags.contains("sample")
        - project.name == this.project.name
    order:
      - file.name
      - formula.type
      - formula.description
      - date created
    sort:
      - property: file.name
        direction: DESC
      - property: formula.type
        direction: ASC
    columnSize:
      formula.description: 475

```
