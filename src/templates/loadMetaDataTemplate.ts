import type { MetaDataTemplate } from "../utils/types";

export async function loadMetadataTemplate(templatePath: string): Promise<MetaDataTemplate> {
    try {
        // Use the Vault API to read the file
        const metadataContent = await this.app.vault.adapter.read(templatePath);
        const metadataTemplate = JSON.parse(metadataContent);

        // Process dynamic fields in the template
        console.log("Processing dynamic fields in metadata template.");
        this.processDynamicFields(metadataTemplate);

        return metadataTemplate;
    } catch (error) {
        console.error(`Failed to load metadata template from ${templatePath}:`, error);
        throw error;
    }
}  