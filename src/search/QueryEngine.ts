import { App, TFile, FrontMatterCache } from "obsidian";

export type QueryValue = string | number | boolean | string[] | number[];

export interface QueryCondition {
    field: string;
    operator: 'is' | 'contains' | 'not' | 'gt' | 'lt' | 'gte' | 'lte' | 'exists' | 'regex';
    value?: QueryValue;
    conditions?: QueryCondition[]; // For nested logical operations
}

export interface QueryLogic {
    operator: 'and' | 'or' | 'not';
    conditions: (QueryCondition | QueryLogic)[];
}

export interface SearchQuery {
    tags?: string[];
    where?: QueryLogic | QueryCondition | QueryCondition[];
    return?: string[];
    limit?: number;
}

export interface SearchResult {
    file: TFile;
    returnValues?: Record<string, unknown>;
}

export class QueryEngine {
    private app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * Execute a search query and return matching files with optional return values
     */
    search(query: SearchQuery): SearchResult[] {
        let files = this.app.vault.getMarkdownFiles();

        // Filter by tags if specified
        if (query.tags && query.tags.length > 0) {
            files = files.filter(file => this.matchesTags(file, query.tags!));
        }

        // Filter by where conditions if specified
        if (query.where) {
            files = files.filter(file => this.evaluateCondition(file, query.where!));
        }

        // Convert to SearchResult objects with return values
        let results: SearchResult[] = files.map(file => ({
            file,
            returnValues: query.return ? this.extractReturnValues(file, query.return) : undefined
        }));

        // Apply limit if specified
        if (query.limit && query.limit > 0) {
            results = results.slice(0, query.limit);
        }

        return results;
    }

    /**
     * Check if a file matches the specified tags
     */
    private matchesTags(file: TFile, searchTags: string[]): boolean {
        const cache = this.app.metadataCache.getFileCache(file);
        const frontmatter = cache?.frontmatter;
        if (!frontmatter) return false;

        const fileTags = this.extractTags(frontmatter);
        
        return searchTags.some(searchTag => 
            fileTags.some(fileTag => fileTag.startsWith(searchTag))
        );
    }

    /**
     * Extract tags from frontmatter
     */
    private extractTags(frontmatter: FrontMatterCache): string[] {
        const tags = frontmatter['tags'] || frontmatter['tag'];
        if (Array.isArray(tags)) {
            return tags.map(tag => typeof tag === 'string' ? tag.trim() : tag.toString().trim());
        } else if (typeof tags === 'string') {
            return [tags.trim()];
        }
        return [];
    }

    /**
     * Evaluate a condition (or nested conditions) against a file
     */
    private evaluateCondition(file: TFile, condition: QueryLogic | QueryCondition | QueryCondition[]): boolean {
        const cache = this.app.metadataCache.getFileCache(file);
        const frontmatter = cache?.frontmatter ?? {};

        // Handle array of conditions (implicit AND)
        if (Array.isArray(condition)) {
            return condition.every(cond => this.evaluateSingleCondition(frontmatter, cond));
        }

        // Handle logical operations
        if ('operator' in condition && condition.operator) {
            return this.evaluateLogicalCondition(file, condition as QueryLogic);
        }

        // Handle single condition
        return this.evaluateSingleCondition(frontmatter, condition as QueryCondition);
    }

    /**
     * Evaluate logical operations (and, or, not)
     */
    private evaluateLogicalCondition(file: TFile, logic: QueryLogic): boolean {
        const { operator, conditions } = logic;

        switch (operator) {
            case 'and':
                return conditions.every(cond => this.evaluateCondition(file, cond));
            case 'or':
                return conditions.some(cond => this.evaluateCondition(file, cond));
            case 'not':
                return !conditions.every(cond => this.evaluateCondition(file, cond));
            default:
                return false;
        }
    }

    /**
     * Evaluate a single condition against frontmatter
     */
    private evaluateSingleCondition(frontmatter: Record<string, unknown>, condition: QueryCondition): boolean {
        const { field, operator, value } = condition;
        
        // Get the field value using dot notation
        const fieldValue = this.getNestedValue(frontmatter, field);

        switch (operator) {
            case 'is':
                return fieldValue === value;
            case 'not':
                return fieldValue !== value;
            case 'contains':
                if (typeof fieldValue === 'string' && typeof value === 'string') {
                    return fieldValue.includes(value);
                } else if (Array.isArray(fieldValue) && value !== undefined) {
                    return fieldValue.includes(value);
                }
                return false;
            case 'exists':
                return fieldValue !== undefined && fieldValue !== null;
            case 'gt':
                return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue > value;
            case 'lt':
                return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue < value;
            case 'gte':
                return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue >= value;
            case 'lte':
                return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue <= value;
            case 'regex':
                if (typeof fieldValue === 'string' && typeof value === 'string') {
                    const regex = new RegExp(value);
                    return regex.test(fieldValue);
                }
                return false;
            default:
                return false;
        }
    }

    /**
     * Extract return values from a file based on specified fields
     */
    private extractReturnValues(file: TFile, returnFields: string[]): Record<string, unknown> {
        const cache = this.app.metadataCache.getFileCache(file);
        const frontmatter = cache?.frontmatter ?? {};
        const result: Record<string, unknown> = {};

        for (const field of returnFields) {
            let value: unknown;
            
            // Handle special file properties
            if (field.startsWith('file.')) {
                const fileProp = field.substring(5); // Remove 'file.' prefix
                switch (fileProp) {
                    case 'name':
                        value = file.basename;
                        break;
                    case 'path':
                        value = file.path;
                        break;
                    case 'extension':
                        value = file.extension;
                        break;
                    case 'link': {
                        // Strip .md extension for markdown files, keep extension for other file types
                        const linkName = file.extension === 'md' ? file.basename : file.name;
                        value = `[[${linkName}]]`;
                        break;
                    }
                    case 'ctime':
                        value = new Date(file.stat.ctime).toISOString();
                        break;
                    case 'mtime':
                        value = new Date(file.stat.mtime).toISOString();
                        break;
                    case 'size':
                        value = file.stat.size;
                        break;
                    case 'ctime.ts':
                        value = file.stat.ctime;
                        break;
                    case 'mtime.ts':
                        value = file.stat.mtime;
                        break;
                    default:
                        value = undefined;
                }
            } else {
                // Extract from frontmatter using dot notation
                value = this.getNestedValue(frontmatter, field);
            }
            
            result[field] = value;
        }

        return result;
    }

    /**
     * Get nested value from object using dot notation
     */
    private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
        return path.split('.').reduce((current, key) => 
            (current && typeof current === 'object' && current !== null && key in current) ? 
                (current as Record<string, unknown>)[key] : undefined, obj as unknown
        );
    }

    /**
     * Convenience method for backward compatibility with searchFilesByTag
     */
    searchByTag(searchTag: string): TFile[] {
        const results = this.search({ tags: [searchTag] });
        return results.map(result => result.file);
    }
}
