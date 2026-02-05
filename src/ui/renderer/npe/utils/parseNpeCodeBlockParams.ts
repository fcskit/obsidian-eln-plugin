export interface CodeBlockParams {
    key?: string;
    excludeKeys?: string[];
    actionButtons?: boolean;
    cssclasses?: string[];
}

export function parseNpeCodeBlockParams(source: string): CodeBlockParams {
    const lines = source.split("\n");
    const params: Partial<CodeBlockParams> = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("key:")) params.key = line.slice(4).trim();
        if (line.startsWith("excludeKeys:")) params.excludeKeys = line.slice(12).split(",").map(s => s.trim()).filter(Boolean);
        if (line.startsWith("actionButtons:")) params.actionButtons = line.slice(14).trim().toLowerCase() !== "false";
        if (line.startsWith("cssclasses:")) params.cssclasses = line.slice(11).split(",").map(s => s.trim()).filter(Boolean);
    }

    return {
        key: params.key,
        excludeKeys: params.excludeKeys ?? [],
        actionButtons: params.actionButtons ?? true,
        cssclasses: params.cssclasses ?? [],
    };
}