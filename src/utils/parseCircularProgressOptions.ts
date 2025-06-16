export interface CircularProgressOptions {
    value?: number;
    color?: string;
    label?: string;
    taskLabel?: string;
}

export function parseCircularProgressOptions(source: string): CircularProgressOptions {
    // Parse options from code block
    const opts: CircularProgressOptions = {};
    source.split("\n").forEach(line => {
        const [key, ...rest] = line.split(":");
        if (!key || rest.length === 0) return;
        const value = rest.join(":").trim();
        if (key.trim() === "value") opts.value = Number(value);
        else if (key.trim() === "color") opts.color = value;
        else if (key.trim() === "label") opts.label = value;
        else if (key.trim() === "taskLabel") opts.taskLabel = value;
    });

    return opts;
}