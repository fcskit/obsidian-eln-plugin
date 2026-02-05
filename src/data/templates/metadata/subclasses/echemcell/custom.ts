export const customCellSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "cell.type code",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "",
                "placeholder": "Enter cell type code, e.g. CR2032"
            }
        },
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
                "default": "round",
            }
        },
        {
            "fullKey": "cell.dimensions.cell.diameter",
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
            "fullKey": "cell.dimensions.electrode.diameter",
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
            "fullKey": "cell.dimensions.separator.diameter",
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
        {
            "fullKey": "cell.contact.positive",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "Al-coated stainless steel",
                "placeholder": "Enter positive contact material"
            }
        },
        {
            "fullKey": "cell.contact.negative",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "stainless steel",
                "placeholder": "Enter negative contact material"
            }
        },
        {
            "fullKey": "cell.contact.spacer",
            "input": {
                "query": true,
                "inputType": "text",
                "default": "stainless steel",
                "placeholder": "Enter spacer contact material"
            }
        },
    ],
}