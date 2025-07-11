/* Function that is called to process a markdown template to replace
    variables with values enterd by the user through one of the new note modals
    or by some generic template variables such as date, year, month, etc.
    The followin syntax is supported for date variables: {{date:YYYY-MM-DD}} where
    YYYY-MM-DD is the format string to define the date format. moment.js is used
    to format the date. A format reference for moment.js can be found here: 
    https://momentjs.com/docs/#/displaying/format/
    If instead of the current date a date with an offset is needed, the
    following syntax can be used: {{date:YYYY-MM-DD, 2d}} where 2d is the offset
    in days. The offset can be positive or negative and can be specified in days (d),
    weeks (w), months (M), or years (y). For example, {{date:YYYY-MM-DD, -1w}} will
    return the date of one week ago in the format YYYY-MM-DD.
    The function will also replace the variables {{year}}, {{month}}, and {{day}} with
    the current year, month, and day respectively. For time variables, the
    following syntax can be used: {{time:HH:mm:ss}} where HH:mm:ss is the format
    string to define the time format. The time will be formatted using the current
    time zone of the user. If no format is specified, the default format will be used
    which is HH:mm:ss.
    Also for the time variables, an offset can be specified in the same way as for the date
    variables, e.g. {{time:HH:mm:ss, 2h}} will return the time two hours from now
    in the format HH:mm:ss. The offset can be positive or negative and can be specified
    in hours (h), minutes (m), or seconds (s).
    Variables in the template are enclosed in double curly braces, e.g. {{variableName}}.
    The function will replace these variables with the corresponding values from the
    data object passed to the function. If a variable is not found in the data object,
    it will be replaced with an empty string. Variables from user data input should have the follwing
    syntax: {{userData.variableName}}. The function will look for the variableName in the userData object.
    If the variable is a nested in the userData object, the syntax should be 
    {{userData.variableName.subVariableName}}.
    The function returns a string with the processed template.
 */
    import moment from "moment";

    /**
     * Safely get a nested value from an object using dot notation.
     */
    function getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : undefined, obj);
    }
    
    /**
     * Parse an offset string like "2d", "-1w", "3h", etc.
     * Returns an object: { amount: number, unit: string }
     */
    function parseOffset(offset: string): { amount: number, unit: moment.unitOfTime.DurationConstructor } | null {
        const match = offset.trim().match(/^([+-]?\d+)\s*([yMwdhms])$/);
        if (!match) return null;
        const [, amount, unit] = match;
        // Map single-letter units to moment.js units
        const unitMap: Record<string, moment.unitOfTime.DurationConstructor> = {
            y: "years",
            M: "months",
            w: "weeks",
            d: "days",
            h: "hours",
            m: "minutes",
            s: "seconds"
        };
        return { amount: parseInt(amount, 10), unit: unitMap[unit] };
    }
    
    /**
     * Process a markdown template string, replacing variables with user data or dynamic values.
     */
    export function processMarkdownTemplate(
        template: string,
        noteTitle: string,
        userData: Record<string, any>
    ): string {
        // Replace {{date:FORMAT, OFFSET}} and {{time:FORMAT, OFFSET}}
        template = template.replace(/{{\s*(date|time)(?::([^,}]+))?(?:,\s*([^}]+))?\s*}}/g, (_match, type, format, offset) => {
            let m = moment();
            if (offset) {
                const parsed = parseOffset(offset);
                if (parsed) m = m.add(parsed.amount, parsed.unit);
            }
            if (type === "date") {
                return m.format(format || "YYYY-MM-DD");
            } else if (type === "time") {
                return m.format(format || "HH:mm:ss");
            }
            return "";
        });
    
        // Replace {{title}}, {{year}}, {{month}}, {{day}}
        template = template.replace(/{{\s*(title|year|month|day)\s*}}/g, (_match, type) => {
            const m = moment();
            if (type === "title") return noteTitle;
            if (type === "year") return m.format("YYYY");
            if (type === "month") return m.format("MM");
            if (type === "day") return m.format("DD");
            return "";
        });
    
        // Replace {{userData.variableName}} and nested, e.g. {{userData.foo.bar}}
        template = template.replace(/{{\s*userData\.([a-zA-Z0-9_.]+)\s*}}/g, (_match, path) => {
            const value = getNestedValue(userData, path);
            return value !== undefined && value !== null ? String(value) : "";
        });
    
        // Replace any other {{variableName}} with userData[variableName] if present
        template = template.replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g, (_match, path) => {
            // Avoid replacing already processed userData fields
            if (path.startsWith("userData.")) return _match;
            const value = getNestedValue(userData, path);
            return value !== undefined && value !== null ? String(value) : "";
        });
    
        return template;
    }