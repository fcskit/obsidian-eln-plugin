import { MarkdownRenderChild, App, TFile } from "obsidian";

export class ChemLinks extends MarkdownRenderChild {
    private app: App;
    private sourcePath: string;

    constructor(app: App, containerEl: HTMLElement, sourcePath: string) {
        super(containerEl);
        this.app = app;
        this.sourcePath = sourcePath;
    }

    onload() {
        this.renderLinks();
        // Optionally, listen for metadata changes if you want live updates
    }

    private renderLinks() {
        this.containerEl.empty();
        const file = this.app.vault.getAbstractFileByPath(this.sourcePath);
        if (!(file instanceof TFile)) return;
        const cache = this.app.metadataCache.getFileCache(file);
        const frontmatter = cache?.frontmatter;
        let cas_number = frontmatter?.chemical?.CAS ?? '';
        if (typeof cas_number !== 'string') {
            cas_number = cas_number?.toString?.() ?? '';
        }
        const cas_is_valid = /^\d{2,7}-\d{2}-\d$/.test(cas_number);
        let html = '';
        if (cas_is_valid) {
            html = `<h4>Chem Links</h4>
<ul>
  <li><a href="https://www.sigmaaldrich.com/DE/de/search/${cas_number}?focus=products&page=1&perpage=30&sort=relevance&term=${cas_number}&type=product" target="_blank" rel="noopener">Sigma-Aldrich</a></li>
  <li><a href="https://de.vwr.com/store/product?casNum=${cas_number}" target="_blank" rel="noopener">VWR (Germany)</a></li>
  <li><a href="https://www.thermofisher.com/search/cas/${cas_number}" target="_blank" rel="noopener">ThermoFisher Scientific</a></li>
  <li><a href="https://www.chemicalbook.com/Search_EN.aspx?keyword=${cas_number}" target="_blank" rel="noopener">ChemicalBook</a></li>
  <li><a href="https://www.chemspider.com/Search.aspx?q=${cas_number}" target="_blank" rel="noopener">ChemSpider</a></li>
  <li><a href="https://pubchem.ncbi.nlm.nih.gov/#query=${cas_number}" target="_blank" rel="noopener">PubChem</a></li>
  <li><a href="https://abcr.com/de_de/catalogsearch/advanced/result/?cas=${cas_number}" target="_blank" rel="noopener">abcr</a></li>
  <li><a href="https://www.google.com/search?rls=en&q=cas+${cas_number}" target="_blank" rel="noopener">Google</a></li>
  <li><a href="https://en.wikipedia.org/w/index.php?search=cas+${cas_number}" target="_blank" rel="noopener">Wikipedia</a></li>
</ul>`;
        } else {
            html = `<h4>Chem Links</h4>
<p>Chem Links provide a convenient way to search chemical databases from Sigma-Aldrich, VWR,
ThermoFisher Scientific, ChemicalBook, ChemSpider, PubChem, abcr, Google, and Wikipedia based on the CAS number of the substance.</p>
<p>This information is displayed, because either the CAS number is not available or the CAS number is not in the correct format.</p>
<p>To view the Chem-Links enter a valid CAS number in the metadata section with following format: 12345-67-8</p>`;
        }
        this.containerEl.insertAdjacentHTML("beforeend", html);
    }
}
