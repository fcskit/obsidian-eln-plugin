---
ELN version: 0.7.0
cssclasses:
  - analysis-list
date created: 2026-02-03
author: Anne Anybody
note type: analysis-list
tags:
  - list/analyses
project:
  name: Demo Project
---

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
        - project.name == this.project.name
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