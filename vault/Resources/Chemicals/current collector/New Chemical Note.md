---
ELN version: 1.0.0
cssclasses:
  - chemical
date created: 2025-06-16
author: Anne Anybody
note type: chemical
tags:
  - "#chemical/unknown"
chemical:
  type: current collector
  field of use:
    - electrode
  name: NMP
  IUPAC name: 1-methylpyrrolidin-2-one
  CAS: ""
  formula: C5H9NO
  smiles: CN1CCCC1=O
  properties:
    molar mass:
      value: "99.1322"
      unit: g/mol
    density:
      value: ""
      unit: g/cm³
    melting point:
      value: ""
      unit: K
    boiling point: ""
    solubility in water: ""
  batch:
    grade: ""
    supplier: abcr
    manufacturer: abcr
    product name: ""
    delivery date: 2025-06-16
    batch number: "1"
    quantity:
      value: ""
      unit: g
    url: https://
  safety:
    safety data sheet: msds-dummy.pdf
    h-statements: Hxxx, Hyyy
    p-statements: Pxxx, Pyyy
    threshold limit value:
      value: ""
      unit: mg/m³
    toxicity:
      value: ""
      unit: mg·kg−1
---

```smiles
=this.chemical.smiles
```

```dataviewjs
await dv.view("/assets/javascript/dataview/views/chemical", {obsidian: obsidian});
```

```dataviewjs
  await dv.view("/assets/javascript/dataview/views/chem_links", {});
```

