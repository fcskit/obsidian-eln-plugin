---
ELN version: 0.7.0
cssclasses:
  - chemical
date created: 2026-02-05
author: Anne Anybody
note type: chemical
tags:
  - chemical/electrolyte
chemical:
  type: electrolyte
  field of use:
    - electrode
  name: Test electrolyte
  IUPAC name: ""
  CAS: ""
  formula: $$
  smiles: ""
  properties:
    density:
      value: 0
      unit: g/cm³
    melting point:
      value: 0
      unit: K
    boiling point:
      value: 0
      unit: K
    composition:
      solvents:
        - name: EC
          volume fraction: "23"
        - name: DMC
          volume fraction: "45"
      salts:
        - name: LiPF6
          concentration:
            value: 5
            unit: mol/L
        - name: LiClO4
          concentration:
            value: 0.5
            unit: mol/L
      additives:
        - name: VC
          concentration:
            value: 3
            unit: mmol/L
        - name: FEC
          concentration:
            value: 56
            unit: mmol/L
      molarity:
        value: 0
        unit: mol/L
    conductivity:
      value: 0
      unit: S/m
    viscosity:
      value: 0
      unit: mPa·s
  batch:
    - batch number: 1
      product name: ""
      manufacturer: abcr
      supplier: abcr
      product url: "[link to product](https://)"
      grade:
        value: 0
        unit: "%"
      quantity:
        value: 0
        unit: g
      delivery date: 2026-02-05
    - batch number: 2
      product name: ""
      manufacturer: Acros Organics
      supplier: VWR
      product url: "[link to product](https://)"
      grade:
        value: 0
        unit: "%"
      quantity:
        value: 0
        unit: g
      delivery date: 2026-02-05
  safety:
    safety data sheet: "[[msds-dummy.pdf|MSDS]]"
    h-statements: []
    p-statements: []
    threshold limit value:
      value: 0
      unit: mg/m³
    toxicity:
      value: 0
      unit: mg·kg⁻¹
---

```smiles
=this.chemical.smiles
```

```eln-properties
key: chemical
actionButtons: hidden
cssclasses: npe-chemical
```

```chem-links

```

