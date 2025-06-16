import { App, TFolder, getLanguage } from "obsidian";
import { PathTemplate } from "./types";

interface TemplateElement {
    type: string; // The type of the field (e.g., "dateField", "userInput", "string", "index")
    field: string; // The field to include in the title (e.g., "currentDate", "this.userInput.author")
    separator?: string; // Optional separator to append after the field
}

type PathType = "file" | "folder";

export async function parsePathTemplate(
    app: App, // The Obsidian app instance
    type: PathType,
    template: PathTemplate,
    context?: Record<string, any>
): Promise<string> {
    const dateLocalizationDict = {
        "en": "en-US",
        "fr": "fr-FR",
        "de": "de-DE",
        "es": "es-ES",
        "it": "it-IT",
        "pt": "pt-PT",
        "ru": "ru-RU",
        "zh": "zh-CN",
        "ja": "ja-JP",
        "ko": "ko-KR",
        "ar": "ar-SA",
        "tr": "tr-TR",
        "pl": "pl-PL",
        "nl": "nl-NL",
        "sv": "sv-SE",
        "da": "da-DK",
        "fi": "fi-FI",
        "no": "no-NO",
        "cs": "cs-CZ",
        "hu": "hu-HU",
        "ro": "ro-RO",
    };

    const lang = getLanguage();
    console.debug("Language detected:", lang);

    let dateLocalization = "en-US"; // Default to English
    if (lang in dateLocalizationDict) {
        dateLocalization = dateLocalizationDict[lang as keyof typeof dateLocalizationDict];
    }
    console.debug("Date localization set to:", dateLocalization);

    if (!template || !Array.isArray(template)) {
        console.warn("Invalid template provided:", template);
        return "";
    }

    // Default lookup fields
    let lookupFields = {
        currentDate: new Date().toLocaleDateString(dateLocalization),
        weekday: new Date().toLocaleString(dateLocalization, { weekday: "long" }),
        dayOfMonth: new Date().getDate(),
        month: new Date().toLocaleString(dateLocalization, { month: "2-digit" }),
        monthName: new Date().toLocaleString(dateLocalization, { month: "long" }),
        year: new Date().getFullYear(),
    };
    console.debug("Default lookup fields:", lookupFields);

    // Merge context into lookup fields
    if (context) {
        lookupFields = { ...lookupFields, ...context };
        console.debug("Merged lookup fields with context:", lookupFields);
    }

    // Process the template
    let path = template
        .map(({ type, field, separator }: TemplateElement) => {
            console.debug(`Processing template element:`, { type, field, separator });

            let value: string | undefined;

            switch (type) {
                case "dateField":
                    value = lookupFields[field]?.toString();
                    break;

                case "userInput":
                    value = getFieldValue(field, lookupFields);
                    break;

                case "string":
                    value = field; // Use the field directly as a string
                    break;

                case "index":
                    value = field; // Use the field directly (e.g., for numbering)
                    break;

                default:
                    console.warn(`Unknown template element type: "${type}"`);
                    value = undefined;
            }

            console.debug(`Resolved value for field "${field}":`, value);
            return value !== undefined ? `${value}${separator || ""}` : "";
        })
        .join("")
        .trim();

    // Handle index fields
    if (template.some((element) => element.type === "index")) {
        path = await handleIndexField(app, path, type);
    }

    return path;
}

/**
 * Handles the "index" field in the template by ensuring uniqueness of the file or folder path.
 * @param app The Obsidian app instance.
 * @param path The generated path.
 * @param type The type of the path (file or folder).
 * @returns A unique path with an incremented index if necessary.
 */
async function handleIndexField(app: App, path: string, type: PathType): Promise<string> {
    const parentFolder = path.substring(0, path.lastIndexOf("/"));
    const baseName = path.substring(path.lastIndexOf("/") + 1);

    const match = baseName.match(/(.*?)(\d+)?$/);
    if (!match) {
        console.warn("Failed to parse base name for index handling:", baseName);
        return path;
    }

    const base = match[1];
    const minDigits = match[2]?.length || 2; // Default to 2 digits if not specified
    let index = 1;

    const parentFolderObj = app.vault.getAbstractFileByPath(parentFolder) as TFolder;
    if (!parentFolderObj || !(parentFolderObj instanceof TFolder)) {
        console.warn("Parent folder does not exist:", parentFolder);
        return path;
    }

    const existingNames = new Set(
        parentFolderObj.children.map((child) =>
            type === "file" ? child.name.replace(/\.[^/.]+$/, "") : child.name
        )
    );

    let uniquePath = path;
    while (existingNames.has(uniquePath.substring(uniquePath.lastIndexOf("/") + 1))) {
        const paddedIndex = index.toString().padStart(minDigits, "0");
        uniquePath = `${parentFolder}/${base}${paddedIndex}`;
        index++;
    }

    return uniquePath;
}

/**
 * Safely retrieves the value of a field from the context.
 * Supports nested fields (e.g., "this.userInput.author").
 */
function getFieldValue(field: string, context: Record<string, any>): any {
    const keys = field.split(".");
    let current = context;

    for (const key of keys) {
        if (current && typeof current === "object" && key in current) {
            current = current[key];
        } else {
            console.warn(`Field "${field}" not found in context.`);
            return undefined; // Return undefined if the field does not exist
        }
    }

    return current;
}