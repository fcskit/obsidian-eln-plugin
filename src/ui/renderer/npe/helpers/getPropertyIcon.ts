export function getPropertyIcon(key: string, dataType: string): string {
    const specialKeyIcons: Record<string, string> = {
        alias: 'forward',
        aliases: 'forward',
        tag: 'tags',
        tags: 'tags',
        cssclass: 'paintbrush',
        cssclasses: 'paintbrush',
        'ELN version': 'file-digit',
        time: 'clock',
        'given name': 'id-card',
        'family name': 'id-card',
        work: 'briefcase-business',
        private: 'shield-user',
        location: 'map-pin',
        building: 'building',
        room: 'door-closed',
        email: 'mail',
        phone: 'phone',
        mobile: 'smartphone',
        fax: 'printer',
        website: 'globe',
        address: 'map-pinned',
        city: 'map-pinned',
        street: 'map-pinned',
        country: 'earth',
        participants: 'users',
        title: 'type-outline',
        contributor: 'user',
        author: 'user-pen',
        smiles: 'hexagon',
        width: 'ruler-dimension-line',
        height: 'ruler-dimension-line',
        depth: 'ruler-dimension-line',
        density: 'scale',
        temperature: 'thermometer',
        'heating rate': 'triangle-right',
        'melting point': 'thermometer',
        'boiling point': 'thermometer',
        'molecular weight': 'weight',
        'molar mass': 'weight',
        series: 'gallery-vertical-end',
        batch: 'qr-code',
        CAS: 'barcode',
        supplier: 'truck',
        quantity: 'scale',
        manufacturer: 'factory',
        safety: 'shield-x',
        'h-statements': 'briefcase-medical',
        'p-statements': 'shield-alert',
        toxicity: 'skull',
        sample: 'atom',
        process: 'route',
        project: 'badge-check',
        analysis: 'search',
        meeting: 'users',
        chemical: 'flask-conical',
        contact: 'contact',
        device: 'pocket-knife',
        instrument: 'microscope',
    };

    const dataTypeIcons: Record<string, string> = {
        string: 'text',
        number: 'binary',
        boolean: 'square-check',
        list: 'list',
        object: 'box',
        objectArray: 'boxes',
        unknown: 'circle-help',
        link: 'link',
        externalLink: 'link',
        date: 'calendar',
        latex: 'sigma',
    };

    // Check if key is contained in specialKeyIcons
    if (key in specialKeyIcons) {
        return specialKeyIcons[key];
    } else if (dataType in dataTypeIcons) {
        return dataTypeIcons[dataType];
    } else {
        // Default icon for unknown types
        return 'help-circle';
    }
}