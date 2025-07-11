---
ELN version: ""
cssclasses:
  - chemical
date created: 2025-07-03
author: ""
note type: chemical
tags:
  - chemical/binder
chemical:
  type: binder
  field of use:
    - electrode
  name: PVDF
  IUPAC name: ""
  CAS: ""
  formula: ""
  smiles:
  properties:
    density:
      value: 1
      unit: g/cm³
    melting point:
      value: 120
      unit: °C
    boiling point: ""
    chemical.properties.mean molecular weight: ""
    chemical.properties.soluble in: ""
    binder type: soluble
  batch:
    grade: ""
    supplier: abcr
    manufacturer: abcr
    product name: ""
    delivery date: 2025-07-03
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

