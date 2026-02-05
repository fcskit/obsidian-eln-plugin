export const semiconductorSubclassMetadataTemplate = {
    "add": [
        {
            "fullKey": "chemical.properties.shape",
            "input": {
                "query": true,
                "inputType": "dropdown",
                "options": ["powder", "wafer", "single crystal", "other"],
            }
        },
        {
            "fullKey": "chemical.properties.semiconductor type",
            "input": {
                "query": true,
                "inputType": "dropdown",
                "options": ["group IV", "group III-V", "group II-VI", "organic", "other"],
            }
        },
        {
            "fullKey": "chemical.properties.doping",
            "input": {
                "query": true,
                "inputType": "dropdown",
                "options": ["n-type", "p-type", "none", "other"],
            }
        },
        {
            "fullKey": "chemical.properties.doping level",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "units": ["cm⁻³", "m⁻³"],
                "defaultUnit": "cm⁻³",
            }
        },
        {
            "fullKey": "chemical.properties.band gap",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "units": ["eV", "meV"],
                "defaultUnit": "eV",
            }
        },
        {
            "fullKey": "chemical.properties.band gap type",
            "input": {
                "query": true,
                "inputType": "dropdown",
                "options": ["direct", "indirect"],
            }
        },
        {
            "fullKey": "chemical.properties.mobility",
            "input": {
                "query": true,
                "inputType": "number",
                "default": "",
                "units": ["cm²/(V·s)", "m²/(V·s)"],
                "defaultUnit": "cm²/(V·s)",
            }
        },
    ],
    "remove": [
        "chemical.properties.solubility in water"
    ],
}