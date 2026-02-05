#!/usr/bin/env node

/**
 * Script to add menuPath and name properties to scientific-units.ts
 * This will systematically update all entries to include the new required properties
 */

import * as fs from 'fs';
import * as path from 'path';

// Define menu path mappings based on categories and logical grouping
const menuPathMappings: Record<string, { menuPath: string; getName: (key: string) => string }> = {
    // Physical properties
    'physical.dimensional': { 
        menuPath: 'Physical.Dimensions', 
        getName: (key: string) => key.charAt(0).toUpperCase() + key.slice(1) 
    },
    'physical.gravimetric': { 
        menuPath: 'Physical.Mass', 
        getName: (key: string) => key === 'molecularWeight' ? 'Molecular Weight' : key.charAt(0).toUpperCase() + key.slice(1) 
    },
    'temporal': { 
        menuPath: 'Physical.Time', 
        getName: (key: string) => key === 'halfLife' ? 'Half Life' : key.charAt(0).toUpperCase() + key.slice(1) 
    },
    'thermal': { 
        menuPath: 'Physical.Thermal', 
        getName: (key: string) => {
            if (key === 'meltingPoint') return 'Melting Point';
            if (key === 'boilingPoint') return 'Boiling Point';
            if (key === 'vaporPressure') return 'Vapor Pressure';
            return key.charAt(0).toUpperCase() + key.slice(1);
        }
    },
    'mechanical': { 
        menuPath: 'Physical.Mechanical', 
        getName: (key: string) => key.charAt(0).toUpperCase() + key.slice(1) 
    },
    'fluid': { 
        menuPath: 'Physical.Flow', 
        getName: (key: string) => key === 'flowRate' ? 'Flow Rate' : key.charAt(0).toUpperCase() + key.slice(1) 
    },
    'kinetic': { 
        menuPath: 'Physical.Motion', 
        getName: (key: string) => {
            if (key === 'countRate') return 'Count Rate';
            return key.charAt(0).toUpperCase() + key.slice(1);
        }
    },

    // Chemical properties
    'chemical.solution': { 
        menuPath: 'Chemical.Solutions', 
        getName: (key: string) => key.charAt(0).toUpperCase() + key.slice(1) 
    },
    'chemical.molecular': { 
        menuPath: 'Chemical.Molecular', 
        getName: (key: string) => key === 'molecularWeight' ? 'Molecular Weight' : key.charAt(0).toUpperCase() + key.slice(1) 
    },
    'chemical.equilibrium': { 
        menuPath: 'Chemical.Equilibrium', 
        getName: (key: string) => key.toUpperCase()  // pKa -> PKA
    },

    // Optical/Electromagnetic
    'optical': { 
        menuPath: 'Optical.Properties', 
        getName: (key: string) => {
            if (key === 'refractiveIndex') return 'Refractive Index';
            return key.charAt(0).toUpperCase() + key.slice(1);
        }
    },
    'electromagnetic': { 
        menuPath: 'Electromagnetic', 
        getName: (key: string) => {
            if (key === 'magneticField') return 'Magnetic Field';
            return key.charAt(0).toUpperCase() + key.slice(1);
        }
    },
    'spectroscopy': { 
        menuPath: 'Optical.Spectroscopy', 
        getName: (key: string) => key.charAt(0).toUpperCase() + key.slice(1) 
    },

    // Electrical
    'electrical': { 
        menuPath: 'Electrical', 
        getName: (key: string) => key.charAt(0).toUpperCase() + key.slice(1) 
    },
    'electronic': { 
        menuPath: 'Electrical', 
        getName: (key: string) => key.charAt(0).toUpperCase() + key.slice(1) 
    },

    // Nuclear/Radioactive
    'nuclear': { 
        menuPath: 'Nuclear', 
        getName: (key: string) => {
            if (key === 'halfLife') return 'Half Life';
            return key.charAt(0).toUpperCase() + key.slice(1);
        }
    },
    'radioactive': { 
        menuPath: 'Nuclear', 
        getName: (key: string) => key.charAt(0).toUpperCase() + key.slice(1) 
    },

    // Counting
    'counting': { 
        menuPath: 'Measurement.Counting', 
        getName: (key: string) => {
            if (key === 'countRate') return 'Count Rate';
            return key.charAt(0).toUpperCase() + key.slice(1);
        }
    },

    // Safety
    'safety': { 
        menuPath: 'Safety', 
        getName: (key: string) => key.charAt(0).toUpperCase() + key.slice(1) 
    }
};

// Function to determine menu path and name for a property
function getMenuPathAndName(key: string, categories: string[]): { menuPath: string; name: string } {
    // Try to find best match based on categories
    for (const category of categories) {
        if (menuPathMappings[category]) {
            return {
                menuPath: menuPathMappings[category].menuPath,
                name: menuPathMappings[category].getName(key)
            };
        }
    }

    // Try compound categories
    const compoundKey = categories.join('.');
    if (menuPathMappings[compoundKey]) {
        return {
            menuPath: menuPathMappings[compoundKey].menuPath,
            name: menuPathMappings[compoundKey].getName(key)
        };
    }

    // Fallback to first category
    const primaryCategory = categories[0] || 'general';
    const fallbackMenuPath = primaryCategory.charAt(0).toUpperCase() + primaryCategory.slice(1);
    const fallbackName = key.charAt(0).toUpperCase() + key.slice(1);

    return {
        menuPath: fallbackMenuPath,
        name: fallbackName
    };
}

// Main function to process the file
function processScientificUnits() {
    const filePath = path.join(__dirname, '../src/data/scientific-units.ts');
    const content = fs.readFileSync(filePath, 'utf8');

    // Parse the existing structure
    // This is a simple regex-based approach - would need proper AST parsing for production
    const propertyRegex = /(\w+):\s*\{[^}]+type:\s*'([^']+)'[^}]+category:\s*\[([^\]]+)\][^}]+\}/gs;
    
    let matches;
    const properties: Array<{key: string, type: string, categories: string[]}> = [];
    
    while ((matches = propertyRegex.exec(content)) !== null) {
        const key = matches[1];
        const type = matches[2];
        const categoriesStr = matches[3];
        const categories = categoriesStr.split(',').map(c => c.trim().replace(/'/g, ''));
        
        properties.push({ key, type, categories });
    }

    console.log(`Found ${properties.length} properties to update`);
    
    // Generate the menuPath and name assignments
    for (const prop of properties) {
        const { menuPath, name } = getMenuPathAndName(prop.key, prop.categories);
        console.log(`${prop.key}: menuPath: '${menuPath}', name: '${name}'`);
    }
}

// Run the script
if (require.main === module) {
    processScientificUnits();
}

export { getMenuPathAndName };