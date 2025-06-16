---
ELN version: 0.4.2
cssclasses:
  - analysis
author: Name Surname
date created: 2024-08-01
note type: analysis
tags:
  - " #analysis "
project:
  name: Demo Project
  link: "[[Demo Project]]"
sample:
  name: MM-DP-el001
  type: electrode
  description: Test Sample
  link: "[[MM-DP-el001]]"
instrument:
  name: BioLogic - VMP 221
  link: "[[BioLogic - VMP 221]]"
  type: potentiostat
session:
  part of session: false
  name: none
  number of analyses: 0
analysis:
  method: GCPL
  date: 2023-08-10
  time: 10:31
  operator: Max Mustermann
  status: completed
  parameters:
    channel: 11 (SN 9xxx)
    user: ""
    electrode connection: standard
    potential control: Ewe
    Ewe control range: min = 0,00 V, max = 5,00 V
    safety limits:
      Do not start on E overload: true
    saved on:
      File: some_data.mpr
      Directory: E:\somepath\
      Host: 192.168.xxx.yy
    device: VMP3 (SN 0xxx)
    ip address: 192.168.xxx.yyy
    software version: "11.43"
    server version: "11.40"
    electrode material: some material
    initial state: 2,4
    electrolyte: 1wt-38ul
    comment: a comment
    mass of active material:
      value: 1.575
      unit: mg
      at x: 1
    molecular weigth (x=0):
      value: 90.93
      unit: g/mol
    mass of intercalated ion:
      value: 6.94
      unit: g/mol
    acquisition started at: xo = 0,900
    electrons per intercalated ion: 1
    battery capacity:
      value: 2.638
      unit: mA.h
    electrode surface area:
      value: 0.001
      unit: cm²
    characteristic mass:
      value: 1.575
      unit: mg
    volume:
      value: 0.001
      unit: cm³
    record options:
      Power: true
    cycle Definition: Charge/Discharge alternance
    modifyed: 08/10/20xx 18:26
  data:
    local:
      file: some_file.mpt
      folder: /SomeFolder/Research Data/EC-Lab
      link: "[local data file](file:///SomeFolder/Research Data/EC-Lab/some_file.mpt)"
      folder_link: "[local data folder](file:///SomeFolder/Research Data/EC-Lab)"
    remote:
      file: remote-data-file.mpt
      folder: /path/to_your/remote_data/folder
      link: "[remote data file](link-to-remote-data-file)"
      folder_link: "[remote data folder](file:///path/to_your/remote_data/folder/)"
      file_link: "[remote data file](file:///path/to_your/remote_data/folder/remote-data-file.mpt)"
---


```eln-properties
key: analysis
actionButtons: true
cssclasses: analysis
```


```image-viewer
folder: Experiments/Analyses/Dummy Sample/Dummy Analysis/plots
// bgColor: #151515
size: 800
shuffle: manual
shuffleOrder: alphabetical
interval: 5
thumbnails: true
// invertGray: true
```
