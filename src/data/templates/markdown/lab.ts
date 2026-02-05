
const labMarkdownTemplate = `

\`\`\`eln-properties
key: lab
actionButtons: hidden
cssclasses: npe-lab
\`\`\`

## Devices

\`\`\`base
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

\`\`\`

## Instruments

\`\`\`base
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

\`\`\`


`

export default labMarkdownTemplate;