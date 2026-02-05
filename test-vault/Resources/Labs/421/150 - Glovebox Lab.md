---
ELN version: 0.7.0
cssclasses:
  - lab
date created: 2026-01-30
author: Anne Anybody
note type: lab
tags:
  - lab/chemical_lab
  - lab/building_421
lab:
  name: Glovebox Lab
  type: chemical lab
  building: "421"
  room: "150"
  contact: Anne Anybody
---


```eln-properties
key: lab
actionButtons: hidden
cssclasses: npe-lab
```

## Devices

```base
formulas:
  type: device.type
  manufacturer: device.manufacturer
  contact: device.contact.link
properties:
  file.name:
    displayName: Device
  formula.type:
    displayName: Type
  formula.manufacturer:
    displayName: Manufacturer
  formula.contact:
    displayName: Contact
views:
  - type: table
    name: Table
    filters:
      and:
        - tags.contains("device")
        - device.location.building == this.lab.building
        - device.location.room == this.lab.room
    order:
      - file.name
      - formula.type
      - formula.manufacturer
      - formula.contact
    sort:
      - property: file.name
        direction: DESC

```

## Instruments

```base
formulas:
  type: instrument.type
  manufacturer: instrument.manufacturer
  contact: instrument.contact.link
properties:
  file.name:
    displayName: Instrument
  formula.type:
    displayName: Type
  formula.manufacturer:
    displayName: Manufacturer
  formula.contact:
    displayName: Contact
views:
  - type: table
    name: Instruments
    filters:
      and:
        - tags.contains("instrument")
        - instrument.location.building == this.lab.building
        - instrument.location.room == this.lab.room
    order:
      - file.name
      - formula.type
      - formula.manufacturer
      - formula.contact
    sort:
      - property: file.name
        direction: DESC

```

