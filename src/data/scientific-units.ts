/**
 * Scientific Units Database
 * 
 * Comprehensive collection of scientific properties with their units, types,
 * and categorization for use in laboratory notebooks and experiments.
 */

export type UnitType = 'number' | 'int' | 'uint' | 'float' | 'double' | 'decimal';

export interface ScientificProperty {
    type: UnitType;
    category: string[];
    subcategory: string[];
    description: string;
    units: string[];
    defaultUnit: string;
    conversionFactor?: { [unit: string]: number }; // Optional conversion factors to base unit
    menuPath?: string; // Dot notation for nested menu structure (e.g., "Physical.Dimensions") - optional for now
    name?: string; // Display name for the property (e.g., "Length" instead of "length") - optional for now
}

export interface ScientificUnitsDatabase {
    [propertyName: string]: ScientificProperty;
}

/**
 * Scientific Units Database
 * Properties are organized with flexible categorization allowing multi-category assignment
 */
export const SCIENTIFIC_UNITS: ScientificUnitsDatabase = {
    // === PHYSICAL DIMENSIONS ===
    length: {
        type: 'float',
        category: ['physical', 'dimensional'],
        subcategory: ['distance', 'size', 'geometry'],
        description: 'Linear distance or extent in space',
        units: ['pm', 'nm', 'µm', 'mm', 'cm', 'm', 'km'],
        defaultUnit: 'm',
        conversionFactor: {
            'pm': 1e-12,
            'nm': 1e-9,
            'µm': 1e-6,
            'mm': 1e-3,
            'cm': 1e-2,
            'm': 1,
            'km': 1e3
        },
        menuPath: 'Physical.Dimensions',
        name: 'Length'
    },
    
    width: {
        type: 'float',
        category: ['physical', 'dimensional'],
        subcategory: ['distance', 'size', 'geometry'],
        description: 'Horizontal extent or breadth',
        units: ['pm', 'nm', 'µm', 'mm', 'cm', 'm'],
        defaultUnit: 'mm',
        menuPath: 'Physical.Dimensions',
        name: 'Width'
    },
    
    height: {
        type: 'float',
        category: ['physical', 'dimensional'],
        subcategory: ['distance', 'size', 'geometry'],
        description: 'Vertical extent or elevation',
        units: ['pm', 'nm', 'µm', 'mm', 'cm', 'm'],
        defaultUnit: 'mm',
        menuPath: 'Physical.Dimensions',
        name: 'Height'
    },
    
    diameter: {
        type: 'float',
        category: ['physical', 'dimensional'],
        subcategory: ['distance', 'size', 'geometry', 'circular'],
        description: 'Distance across a circular or spherical object',
        units: ['pm', 'nm', 'µm', 'mm', 'cm', 'm'],
        defaultUnit: 'mm',
        menuPath: 'Physical.Dimensions',
        name: 'Diameter'
    },
    
    radius: {
        type: 'float',
        category: ['physical', 'dimensional'],
        subcategory: ['distance', 'size', 'geometry', 'circular'],
        description: 'Distance from center to edge of circular or spherical object',
        units: ['pm', 'nm', 'µm', 'mm', 'cm', 'm'],
        defaultUnit: 'mm',
        menuPath: 'Physical.Dimensions',
        name: 'Radius'
    },
    
    thickness: {
        type: 'float',
        category: ['physical', 'dimensional'],
        subcategory: ['distance', 'size', 'geometry'],
        description: 'Extent of something from one surface to its opposite',
        units: ['pm', 'nm', 'µm', 'mm', 'cm'],
        defaultUnit: 'µm',
        menuPath: 'Physical.Dimensions',
        name: 'Thickness'
    },
    
    area: {
        type: 'float',
        category: ['physical', 'dimensional'],
        subcategory: ['surface', 'geometry'],
        description: 'Two-dimensional extent of a surface',
        units: ['mm²', 'cm²', 'm²', 'km²'],
        defaultUnit: 'cm²',
        menuPath: 'Physical.Dimensions',
        name: 'Area'
    },
    
    volume: {
        type: 'float',
        category: ['physical', 'dimensional'],
        subcategory: ['capacity', 'geometry'],
        description: 'Three-dimensional space occupied by an object',
        units: ['µL', 'mL', 'L', 'mm³', 'cm³', 'm³'],
        defaultUnit: 'mL',
        menuPath: 'Physical.Dimensions',
        name: 'Volume'
    },
    
    // === MASS AND WEIGHT ===
    mass: {
        type: 'float',
        category: ['physical', 'gravimetric'],
        subcategory: ['weight', 'quantity'],
        description: 'Amount of matter in an object',
        units: ['µg', 'mg', 'g', 'kg'],
        defaultUnit: 'g',
        conversionFactor: {
            'µg': 1e-6,
            'mg': 1e-3,
            'g': 1,
            'kg': 1e3
        },
        menuPath: 'Physical.Mass',
        name: 'Mass'
    },
    
    weight: {
        type: 'float',
        category: ['physical', 'gravimetric'],
        subcategory: ['force', 'quantity'],
        description: 'Force exerted by gravity on an object',
        units: ['µg', 'mg', 'g', 'kg', 'N'],
        defaultUnit: 'g',
        menuPath: 'Physical.Mass',
        name: 'Weight'
    },
    
    molecularWeight: {
        type: 'float',
        category: ['chemical', 'molecular'],
        subcategory: ['mass', 'property'],
        description: 'Mass of one mole of a substance',
        units: ['g/mol', 'Da', 'kDa'],
        defaultUnit: 'g/mol',
        menuPath: 'Chemical.Molecular',
        name: 'Molecular Weight'
    },
    
    // === TIME ===
    time: {
        type: 'float',
        category: ['temporal', 'kinetic'],
        subcategory: ['duration', 'measurement'],
        description: 'Duration or point in the progression of events',
        units: ['ns', 'µs', 'ms', 's', 'min', 'h', 'day'],
        defaultUnit: 's',
        conversionFactor: {
            'ns': 1e-9,
            'µs': 1e-6,
            'ms': 1e-3,
            's': 1,
            'min': 60,
            'h': 3600,
            'day': 86400
        },
        menuPath: 'Physical.Time',
        name: 'Time'
    },
    
    duration: {
        type: 'float',
        category: ['temporal', 'kinetic'],
        subcategory: ['time', 'interval'],
        description: 'Length of time for which something continues',
        units: ['ns', 'µs', 'ms', 's', 'min', 'h', 'day'],
        defaultUnit: 'min',
        menuPath: 'Physical.Time',
        name: 'Duration'
    },
    
    halfLife: {
        type: 'float',
        category: ['nuclear', 'kinetic'],
        subcategory: ['decay', 'time'],
        description: 'Time required for half of radioactive nuclei to decay',
        units: ['ns', 'µs', 'ms', 's', 'min', 'h', 'day', 'year'],
        defaultUnit: 's',
        menuPath: 'Nuclear.Decay',
        name: 'Half Life'
    },
    
    // === TEMPERATURE ===
    temperature: {
        type: 'float',
        category: ['thermal', 'physical'],
        subcategory: ['heat', 'energy'],
        description: 'Measure of average kinetic energy of particles',
        units: ['K', '°C', '°F'],
        defaultUnit: '°C',
        conversionFactor: {
            'K': 1,  // Base unit for conversion
            '°C': 1,  // K = °C + 273.15 (special case)
            '°F': 1   // Special conversion needed
        },
        menuPath: 'Physical.Thermal',
        name: 'Temperature'
    },
    
    meltingPoint: {
        type: 'float',
        category: ['thermal', 'physical', 'material'],
        subcategory: ['phase', 'transition'],
        description: 'Temperature at which solid becomes liquid',
        units: ['K', '°C', '°F'],
        defaultUnit: '°C',
        menuPath: 'Physical.Thermal',
        name: 'Melting Point'
    },
    
    boilingPoint: {
        type: 'float',
        category: ['thermal', 'physical', 'material'],
        subcategory: ['phase', 'transition'],
        description: 'Temperature at which liquid becomes gas',
        units: ['K', '°C', '°F'],
        defaultUnit: '°C',
        menuPath: 'Physical.Thermal',
        name: 'Boiling Point'
    },
    
    // === PRESSURE ===
    pressure: {
        type: 'float',
        category: ['physical', 'mechanical'],
        subcategory: ['force', 'fluid'],
        description: 'Force applied perpendicular to a surface per unit area',
        units: ['Pa', 'kPa', 'MPa', 'bar', 'mbar', 'atm', 'mmHg', 'psi'],
        defaultUnit: 'kPa',
        conversionFactor: {
            'Pa': 1,
            'kPa': 1e3,
            'MPa': 1e6,
            'bar': 1e5,
            'mbar': 1e2,
            'atm': 101325,
            'mmHg': 133.322,
            'psi': 6894.76
        },
        menuPath: 'Physical.Mechanical',
        name: 'Pressure'
    },
    
    vaporPressure: {
        type: 'float',
        category: ['physical', 'material', 'thermal'],
        subcategory: ['phase', 'equilibrium'],
        description: 'Pressure exerted by vapor in equilibrium with liquid',
        units: ['Pa', 'kPa', 'MPa', 'bar', 'mbar', 'atm', 'mmHg'],
        defaultUnit: 'kPa',
        menuPath: 'Physical.Thermal',
        name: 'Vapor Pressure'
    },
    
    // === CHEMICAL PROPERTIES ===
    concentration: {
        type: 'float',
        category: ['chemical', 'solution'],
        subcategory: ['molarity', 'quantity'],
        description: 'Amount of substance per unit volume',
        units: ['M', 'mM', 'µM', 'nM', 'mg/mL', 'g/L', '%w/v', '%w/w'],
        defaultUnit: 'mM',
        menuPath: 'Chemical.Solutions',
        name: 'Concentration'
    },
    
    molarity: {
        type: 'float',
        category: ['chemical', 'solution'],
        subcategory: ['concentration', 'molar'],
        description: 'Moles of solute per liter of solution',
        units: ['M', 'mM', 'µM', 'nM'],
        defaultUnit: 'mM',
        conversionFactor: {
            'M': 1,
            'mM': 1e-3,
            'µM': 1e-6,
            'nM': 1e-9
        },
        menuPath: 'Chemical.Solutions',
        name: 'Molarity'
    },
    
    molality: {
        type: 'float',
        category: ['chemical', 'solution'],
        subcategory: ['concentration', 'molar'],
        description: 'Moles of solute per kilogram of solvent',
        units: ['m', 'mM', 'µM'],
        defaultUnit: 'm',
        menuPath: 'Chemical.Solutions',
        name: 'Molality'
    },
    
    pH: {
        type: 'float',
        category: ['chemical', 'solution'],
        subcategory: ['acidity', 'ion'],
        description: 'Negative logarithm of hydrogen ion concentration',
        units: ['pH'],
        defaultUnit: 'pH',
        menuPath: 'Chemical.Solutions',
        name: 'pH'
    },
    
    pKa: {
        type: 'float',
        category: ['chemical', 'equilibrium'],
        subcategory: ['acidity', 'dissociation'],
        description: 'Negative logarithm of acid dissociation constant',
        units: ['pKa'],
        defaultUnit: 'pKa',
        menuPath: 'Chemical.Equilibrium',
        name: 'pKa'
    },
    
    // === OPTICAL PROPERTIES ===
    wavelength: {
        type: 'float',
        category: ['optical', 'electromagnetic'],
        subcategory: ['light', 'spectroscopy'],
        description: 'Distance between successive peaks of electromagnetic wave',
        units: ['pm', 'nm', 'µm', 'mm', 'cm', 'm'],
        defaultUnit: 'nm'
    },
    
    frequency: {
        type: 'float',
        category: ['optical', 'electromagnetic', 'acoustic'],
        subcategory: ['wave', 'oscillation'],
        description: 'Number of cycles per unit time',
        units: ['Hz', 'kHz', 'MHz', 'GHz', 'THz'],
        defaultUnit: 'Hz',
        conversionFactor: {
            'Hz': 1,
            'kHz': 1e3,
            'MHz': 1e6,
            'GHz': 1e9,
            'THz': 1e12
        }
    },
    
    absorbance: {
        type: 'float',
        category: ['optical', 'spectroscopy'],
        subcategory: ['absorption', 'measurement'],
        description: 'Logarithmic measure of light absorption',
        units: ['AU', 'OD'],
        defaultUnit: 'AU'
    },
    
    transmittance: {
        type: 'float',
        category: ['optical', 'spectroscopy'],
        subcategory: ['transmission', 'measurement'],
        description: 'Fraction of incident light transmitted through sample',
        units: ['%', 'fraction'],
        defaultUnit: '%'
    },
    
    refractiveIndex: {
        type: 'float',
        category: ['optical', 'material'],
        subcategory: ['property', 'light'],
        description: 'Ratio of speed of light in vacuum to speed in material',
        units: ['n', 'dimensionless'],
        defaultUnit: 'n'
    },
    
    // === ELECTRICAL PROPERTIES ===
    voltage: {
        type: 'float',
        category: ['electrical', 'electronic'],
        subcategory: ['potential', 'energy'],
        description: 'Electric potential difference between two points',
        units: ['µV', 'mV', 'V', 'kV'],
        defaultUnit: 'V',
        conversionFactor: {
            'µV': 1e-6,
            'mV': 1e-3,
            'V': 1,
            'kV': 1e3
        }
    },
    
    current: {
        type: 'float',
        category: ['electrical', 'electronic'],
        subcategory: ['flow', 'charge'],
        description: 'Rate of electric charge flow',
        units: ['pA', 'nA', 'µA', 'mA', 'A'],
        defaultUnit: 'mA',
        conversionFactor: {
            'pA': 1e-12,
            'nA': 1e-9,
            'µA': 1e-6,
            'mA': 1e-3,
            'A': 1
        }
    },
    
    resistance: {
        type: 'float',
        category: ['electrical', 'electronic'],
        subcategory: ['impedance', 'property'],
        description: 'Opposition to electric current flow',
        units: ['mΩ', 'Ω', 'kΩ', 'MΩ', 'GΩ'],
        defaultUnit: 'Ω',
        conversionFactor: {
            'mΩ': 1e-3,
            'Ω': 1,
            'kΩ': 1e3,
            'MΩ': 1e6,
            'GΩ': 1e9
        }
    },
    
    capacitance: {
        type: 'float',
        category: ['electrical', 'electronic'],
        subcategory: ['storage', 'charge'],
        description: 'Ability to store electric charge',
        units: ['pF', 'nF', 'µF', 'mF', 'F'],
        defaultUnit: 'µF',
        conversionFactor: {
            'pF': 1e-12,
            'nF': 1e-9,
            'µF': 1e-6,
            'mF': 1e-3,
            'F': 1
        }
    },
    
    // === ENERGY ===
    energy: {
        type: 'float',
        category: ['physical', 'thermal', 'mechanical'],
        subcategory: ['work', 'heat'],
        description: 'Capacity to do work or produce heat',
        units: ['J', 'kJ', 'MJ', 'cal', 'kcal', 'eV', 'keV', 'MeV'],
        defaultUnit: 'J',
        conversionFactor: {
            'J': 1,
            'kJ': 1e3,
            'MJ': 1e6,
            'cal': 4.184,
            'kcal': 4184,
            'eV': 1.602e-19,
            'keV': 1.602e-16,
            'MeV': 1.602e-13
        },
        menuPath: 'Physical.Energy',
        name: 'Energy'
    },
    
    power: {
        type: 'float',
        category: ['physical', 'electrical', 'mechanical'],
        subcategory: ['energy', 'rate'],
        description: 'Rate of energy transfer or work done',
        units: ['µW', 'mW', 'W', 'kW', 'MW'],
        defaultUnit: 'W',
        conversionFactor: {
            'µW': 1e-6,
            'mW': 1e-3,
            'W': 1,
            'kW': 1e3,
            'MW': 1e6
        },
        menuPath: 'Physical.Energy',
        name: 'Power'
    },
    
    // === FLOW RATES ===
    flowRate: {
        type: 'float',
        category: ['fluid', 'kinetic'],
        subcategory: ['velocity', 'volume'],
        description: 'Volume of fluid passing through cross-section per unit time',
        units: ['µL/min', 'mL/min', 'L/min', 'µL/s', 'mL/s', 'L/s'],
        defaultUnit: 'mL/min'
    },
    
    velocity: {
        type: 'float',
        category: ['kinetic', 'mechanical'],
        subcategory: ['motion', 'speed'],
        description: 'Rate of change of position with respect to time',
        units: ['mm/s', 'cm/s', 'm/s', 'km/h', 'mph'],
        defaultUnit: 'm/s'
    },
    
    // === COUNTS AND RATES ===
    count: {
        type: 'int',
        category: ['counting', 'discrete'],
        subcategory: ['quantity', 'number'],
        description: 'Discrete number of items or events',
        units: ['count', 'pieces', 'particles'],
        defaultUnit: 'count'
    },
    
    countRate: {
        type: 'float',
        category: ['counting', 'kinetic'],
        subcategory: ['rate', 'detection'],
        description: 'Number of events detected per unit time',
        units: ['cps', 'cpm', 'Hz'],
        defaultUnit: 'cps'
    },
    
    // === MAGNETIC PROPERTIES ===
    magneticField: {
        type: 'float',
        category: ['magnetic', 'electromagnetic'],
        subcategory: ['field', 'force'],
        description: 'Magnetic field strength',
        units: ['T', 'mT', 'µT', 'G', 'mG'],
        defaultUnit: 'mT',
        conversionFactor: {
            'T': 1,
            'mT': 1e-3,
            'µT': 1e-6,
            'G': 1e-4,
            'mG': 1e-7
        }
    },
    
    // === RADIOACTIVITY ===
    activity: {
        type: 'float',
        category: ['nuclear', 'radioactive'],
        subcategory: ['decay', 'rate'],
        description: 'Number of radioactive decays per unit time',
        units: ['Bq', 'kBq', 'MBq', 'GBq', 'Ci', 'mCi', 'µCi'],
        defaultUnit: 'kBq',
        conversionFactor: {
            'Bq': 1,
            'kBq': 1e3,
            'MBq': 1e6,
            'GBq': 1e9,
            'Ci': 3.7e10,
            'mCi': 3.7e7,
            'µCi': 3.7e4
        }
    },
    
    dose: {
        type: 'float',
        category: ['nuclear', 'radioactive', 'safety'],
        subcategory: ['radiation', 'exposure'],
        description: 'Amount of ionizing radiation absorbed',
        units: ['Gy', 'mGy', 'µGy', 'rad'],
        defaultUnit: 'µGy'
    }
};

/**
 * Get all available categories
 */
export function getCategories(): string[] {
    const categories = new Set<string>();
    Object.values(SCIENTIFIC_UNITS).forEach(prop => {
        prop.category.forEach(cat => categories.add(cat));
    });
    return Array.from(categories).sort();
}

/**
 * Get all available subcategories
 */
export function getSubcategories(): string[] {
    const subcategories = new Set<string>();
    Object.values(SCIENTIFIC_UNITS).forEach(prop => {
        prop.subcategory.forEach(subcat => subcategories.add(subcat));
    });
    return Array.from(subcategories).sort();
}

/**
 * Filter properties by category
 */
export function filterByCategory(category: string): { [key: string]: ScientificProperty } {
    const filtered: { [key: string]: ScientificProperty } = {};
    Object.entries(SCIENTIFIC_UNITS).forEach(([key, prop]) => {
        if (prop.category.includes(category)) {
            filtered[key] = prop;
        }
    });
    return filtered;
}

/**
 * Filter properties by subcategory
 */
export function filterBySubcategory(subcategory: string): { [key: string]: ScientificProperty } {
    const filtered: { [key: string]: ScientificProperty } = {};
    Object.entries(SCIENTIFIC_UNITS).forEach(([key, prop]) => {
        if (prop.subcategory.includes(subcategory)) {
            filtered[key] = prop;
        }
    });
    return filtered;
}

/**
 * Search properties by name or description
 */
export function searchProperties(query: string): { [key: string]: ScientificProperty } {
    const filtered: { [key: string]: ScientificProperty } = {};
    const lowerQuery = query.toLowerCase();
    
    Object.entries(SCIENTIFIC_UNITS).forEach(([key, prop]) => {
        if (
            key.toLowerCase().includes(lowerQuery) ||
            prop.description.toLowerCase().includes(lowerQuery) ||
            prop.category.some(cat => cat.toLowerCase().includes(lowerQuery)) ||
            prop.subcategory.some(subcat => subcat.toLowerCase().includes(lowerQuery))
        ) {
            filtered[key] = prop;
        }
    });
    return filtered;
}

/**
 * Get property by name
 */
export function getProperty(name: string): ScientificProperty | undefined {
    return SCIENTIFIC_UNITS[name];
}

/**
 * Convert value between units (when conversion factors are available)
 */
export function convertUnit(
    value: number, 
    fromUnit: string, 
    toUnit: string, 
    property: ScientificProperty
): number | null {
    if (!property.conversionFactor) return null;
    
    const fromFactor = property.conversionFactor[fromUnit];
    const toFactor = property.conversionFactor[toUnit];
    
    if (fromFactor === undefined || toFactor === undefined) return null;
    
    // Convert to base unit, then to target unit
    const baseValue = value * fromFactor;
    return baseValue / toFactor;
}
