---
ELN version: 0.7.0
cssclasses:
  - chemical
date created: 2025-07-14
author: Anne Anybody
note type: chemical
tags:
  - chemical/metal
chemical:
  type: metal
  field of use:
    - electrode
    - electrochemical cell
  name: Lihium
  IUPAC name: ""
  CAS: ""
  formula: ""
  smiles: Li
  properties:
    molar mass:
      value: ""
      unit: g/mol
    density:
      value: ""
      unit: g/cm³
    melting point:
      value: ""
      unit: K
    boiling point: ""
    shape: powder
    alloy: false
  batch:
    grade: ""
    supplier: abcr
    manufacturer: abcr
    product name: ""
    delivery date: 2025-07-14
    batch number: 1
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
      unit: mg·kg⁻¹
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

