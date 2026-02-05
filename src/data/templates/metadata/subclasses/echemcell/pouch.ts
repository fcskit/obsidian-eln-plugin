export const pouchCellSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "cell.manufacturer",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
                "placeholder": "Enter cell manufacturer"
            }
        },
        {
            "fullKey": "cell.dimensions.geometry",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "rectangular",
            }
        },
        {
            "fullKey": "cell.dimensions.cell.width",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["mm", "cm", "m"],
                "defaultUnit": "mm",
            }
        },
        {
            "fullKey": "cell.dimensions.cell.length",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["mm", "cm", "m"],
                "defaultUnit": "mm",
            }
        },
        {
            "fullKey": "cell.dimensions.cell.height",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["mm", "cm", "m"],
                "defaultUnit": "mm",
            }
        },
        {
            "fullKey": "cell.dimensions.electrode.width",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["mm", "cm", "m"],
                "defaultUnit": "mm",
            }
        },
        {
            "fullKey": "cell.dimensions.electrode.length",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["mm", "cm", "m"],
                "defaultUnit": "mm",
            }
        },
        {
            "fullKey": "cell.dimensions.electrode.area",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["mm^2", "cm^2", "m^2"],
                "defaultUnit": "cm^2",
            }
        },
        {
            "fullKey": "cell.dimensions.separator.width",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["mm", "cm", "m"],
                "defaultUnit": "mm",
            }
        },
        {
            "fullKey": "cell.dimensions.separator.length",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["mm", "cm", "m"],
                "defaultUnit": "mm",
            }
        },
        {
            "fullKey": "cell.dimensions.separator.area",
            "input": {
                "query": true,
                "inputType": "number",
                "default": 0,
                "units": ["mm^2", "cm^2", "m^2"],
                "defaultUnit": "cm^2",
            }
        },
    ],
}