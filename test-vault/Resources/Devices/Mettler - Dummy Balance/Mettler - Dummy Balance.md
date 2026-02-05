---
ELN version: 0.7.0
cssclasses:
  - device
date created: 2025-07-14
author: Anne Anybody
note type: device
tags:
  - device/balance
device:
  name: Dummy Balance
  type: balance
  manufacturer: Mettler
  model: "123"
  location:
    building: ""
    room: ""
  info: {}
  parameters:
    test: bla
---

![[dummy-image-device.png]]

```dataviewjs
await dv.view("/assets/javascript/dataview/views/device", {obsidian: obsidian});
```
