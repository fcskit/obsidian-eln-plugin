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
        
        if (cas_is_valid) {
            // Create secure DOM structure for chemical links
            const headerEl = document.createElement('h4');
            headerEl.textContent = 'Chem Links';
            this.containerEl.appendChild(headerEl);
            
            const ulEl = document.createElement('ul');
            
            const links = [
                { text: 'Sigma-Aldrich', url: `https://www.sigmaaldrich.com/DE/de/search/${cas_number}?focus=products&page=1&perpage=30&sort=relevance&term=${cas_number}&type=product` },
                { text: 'VWR (Germany)', url: `https://de.vwr.com/store/product?casNum=${cas_number}` },
                { text: 'ThermoFisher Scientific', url: `https://www.thermofisher.com/search/cas/${cas_number}` },
                { text: 'ChemicalBook', url: `https://www.chemicalbook.com/Search_EN.aspx?keyword=${cas_number}` },
                { text: 'ChemSpider', url: `https://www.chemspider.com/Search.aspx?q=${cas_number}` },
                { text: 'PubChem', url: `https://pubchem.ncbi.nlm.nih.gov/#query=${cas_number}` },
                { text: 'abcr', url: `https://abcr.com/de_de/catalogsearch/advanced/result/?cas=${cas_number}` },
                { text: 'Google', url: `https://www.google.com/search?rls=en&q=cas+${cas_number}` },
                { text: 'Wikipedia', url: `https://en.wikipedia.org/w/index.php?search=cas+${cas_number}` }
            ];
            
            links.forEach(link => {
                const liEl = document.createElement('li');
                const aEl = document.createElement('a');
                aEl.textContent = link.text;
                aEl.href = link.url;
                aEl.target = '_blank';
                aEl.rel = 'noopener';
                liEl.appendChild(aEl);
                ulEl.appendChild(liEl);
            });
            
            this.containerEl.appendChild(ulEl);
        } else {
            // Create secure DOM structure for invalid CAS message
            const headerEl = document.createElement('h4');
            headerEl.textContent = 'Chem Links';
            this.containerEl.appendChild(headerEl);
            
            const p1El = document.createElement('p');
            p1El.textContent = 'Chem Links provide a convenient way to search chemical databases from Sigma-Aldrich, VWR, ThermoFisher Scientific, ChemicalBook, ChemSpider, PubChem, abcr, Google, and Wikipedia based on the CAS number of the substance.';
            this.containerEl.appendChild(p1El);
            
            const p2El = document.createElement('p');
            p2El.textContent = 'This information is displayed, because either the CAS number is not available or the CAS number is not in the correct format.';
            this.containerEl.appendChild(p2El);
            
            const p3El = document.createElement('p');
            p3El.textContent = 'To view the Chem-Links enter a valid CAS number in the metadata section with following format: 12345-67-8';
            this.containerEl.appendChild(p3El);
        }
    }
}
