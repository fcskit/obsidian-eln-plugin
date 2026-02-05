// Example metadata template using the new function descriptor approach
export const exampleMetadataTemplate = {
  "ELN version": {
    query: false,
    inputType: "text",
    default: { 
      type: "function", 
      value: "this.plugin.manifest.version" 
    }
  },
  author: {
    query: true,
    inputType: "text",
    default: { 
      type: "function", 
      value: "this.plugin.settings.authors[0]?.name || 'Unknown'" 
    },
    callback: { 
      type: "function", 
      value: "(value) => value.trim()" 
    }
  },
  date: {
    query: true,
    inputType: "date",
    default: { 
      type: "function", 
      value: "new Date().toISOString().split('T')[0]" 
    }
  },
  tags: {
    query: true,
    inputType: "multiselect",
    options: { 
      type: "function", 
      value: "this.app.metadataCache.getTags()" 
    },
    callback: { 
      type: "function", 
      value: "(values) => values.map(tag => tag.startsWith('#') ? tag : '#' + tag)" 
    }
  },
  "sample.weight": {
    query: true,
    inputType: "number",
    units: ["mg", "g", "kg"],
    defaultUnit: "mg",
    callback: { 
      type: "function", 
      value: "(value) => ({ value: parseFloat(value.value) || 0, unit: value.unit || 'mg' })" 
    }
  }
};
