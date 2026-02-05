export interface CodeBlockParams {
    key?: string;
    excludeKeys?: string[];
    actionButtons?: boolean;
    cssclasses?: string[];
    file?: string; // Currently not implemented
    unsupportedParams?: string[]; // Track unsupported parameters
}

export function parseNpeCodeBlockParams(source: string): CodeBlockParams {
    const lines = source.split("\n");
    const params: Partial<CodeBlockParams> = {};
    const unsupported: string[] = [];
    const supportedParams = ['key', 'excludeKeys', 'actionButtons', 'cssclasses'];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#')) continue; // Skip empty lines and comments
        
        if (line.startsWith("key:")) {
            params.key = line.slice(4).trim();
        } else if (line.startsWith("excludeKeys:")) {
            params.excludeKeys = line.slice(12).split(",").map(s => s.trim()).filter(Boolean);
        } else if (line.startsWith("actionButtons:")) {
            params.actionButtons = line.slice(14).trim().toLowerCase() !== "false";
        } else if (line.startsWith("cssclasses:")) {
            params.cssclasses = line.slice(11).split(",").map(s => s.trim()).filter(Boolean);
        } else if (line.includes(':')) {
            // Track unsupported parameters
            const paramName = line.split(':')[0].trim();
            if (!supportedParams.includes(paramName)) {
                unsupported.push(paramName);
            }
        }
    }

    return {
        key: params.key,
        excludeKeys: params.excludeKeys ?? [],
        actionButtons: params.actionButtons ?? true,
        cssclasses: params.cssclasses ?? [],
        unsupportedParams: unsupported.length > 0 ? unsupported : undefined,
    };
}