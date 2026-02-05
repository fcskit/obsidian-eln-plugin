export interface ImageViewerOptions {
    folder: string;
    bgColor?: string;
    size?: number;
    image?: string; // specific image filename
    shuffle?: "auto" | "manual"; // auto = timed, manual = user controls
    shuffleOrder?: "random" | "alphabetic"; // order for shuffling
    interval?: number; // interval in seconds for auto-change
    thumbnails?: boolean; // show thumbnail stripe
    invertGray?: boolean; // apply invert and grayscale filter
}

export function parseImageViewerOptions(source: string): ImageViewerOptions {
    const opts: ImageViewerOptions = { folder: "assets/images/Motivation/" };
    source.split("\n").forEach(line => {
        const [key, ...rest] = line.split(":");
        if (!key || rest.length === 0) return;
        const value = rest.join(":").trim();
        if (key.trim() === "folder") opts.folder = value;
        else if (key.trim() === "bgColor") opts.bgColor = value;
        else if (key.trim() === "size") opts.size = Number(value);
        else if (key.trim() === "image") opts.image = value;
        else if (key.trim() === "shuffle") {
            opts.shuffle = value.toLowerCase() as "auto" | "manual";
        } else if (key.trim() === "shuffleOrder") {
            opts.shuffleOrder = value.toLowerCase() as "random" | "alphabetic";
        } else if (key.trim() === "interval") {
            opts.interval = Number(value);
        } else if (key.trim() === "thumbnails") {
            opts.thumbnails = value.toLowerCase() === "true";
        } else if (key.trim() === "invertGray") {
            opts.invertGray = value.toLowerCase() === "true";
        }
    });
    return opts;
}