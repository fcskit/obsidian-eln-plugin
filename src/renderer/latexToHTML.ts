/**
 * Converts a LaTeX formula to HTML.
 * @param latex - The LaTeX formula to convert.
 * @returns The HTML representation of the LaTeX formula.
 */
export function latexToHTML(latex: string): string {
    const greekLetters: Record<string, string> = {
        alpha: "&alpha;",
        beta: "&beta;",
        gamma: "&gamma;",
        delta: "&delta;",
        epsilon: "&epsilon;",
        zeta: "&zeta;",
        eta: "&eta;",
        theta: "&theta;",
        iota: "&iota;",
        kappa: "&kappa;",
        lambda: "&lambda;",
        mu: "&mu;",
        nu: "&nu;",
        xi: "&xi;",
        omicron: "&omicron;",
        pi: "&pi;",
        rho: "&rho;",
        sigma: "&sigma;",
        tau: "&tau;",
        upsilon: "&upsilon;",
        phi: "&phi;",
        chi: "&chi;",
        psi: "&psi;",
        omega: "&omega;",
        Alpha: "&Alpha;",
        Beta: "&Beta;",
        Gamma: "&Gamma;",
        Delta: "&Delta;",
        Epsilon: "&Epsilon;",
        Zeta: "&Zeta;",
        Eta: "&Eta;",
        Theta: "&Theta;",
        Iota: "&Iota;",
        Kappa: "&Kappa;",
        Lambda: "&Lambda;",
        Mu: "&Mu;",
        Nu: "&Nu;",
        Xi: "&Xi;",
        Omicron: "&Omicron;",
        Pi: "&Pi;",
        Rho: "&Rho;",
        Sigma: "&Sigma;",
        Tau: "&Tau;",
        Upsilon: "&Upsilon;",
        Phi: "&Phi;",
        Chi: "&Chi;",
        Psi: "&Psi;",
        Omega: "&Omega;",
    };

    const subSup: Record<string, string> = {
        "^": "sup",
        "_": "sub",
    };

    let html = latex;

    // Convert Greek letters
    for (const [key, value] of Object.entries(greekLetters)) {
        html = html.replace(new RegExp(`\\\\${key}`, "g"), value);
    }

    // Convert sub- and superscripts
    for (const [key, tag] of Object.entries(subSup)) {
        html = html.replace(new RegExp(`\\${key}\\{([^}]*)\\}`, "g"), `<${tag}>$1</${tag}>`);
        html = html.replace(new RegExp(`\\${key}([^}])`, "g"), `<${tag}>$1</${tag}>`);
    }

    return html;
}