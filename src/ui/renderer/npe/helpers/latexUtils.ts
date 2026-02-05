/**
 * Simple latex to HTML conversion. Supports sub- and superscript,
 * greek letters, and some basic math symbols.
 * @param latex - The latex formula to convert to HTML.
 * @returns The HTML representation of the latex formula.
 */
export function latexToHTML(latex: string): string {
    const greekLetters: Record<string, string> = {
        alpha: '&alpha;',
        beta: '&beta;',
        gamma: '&gamma;',
        delta: '&delta;',
        epsilon: '&epsilon;',
        zeta: '&zeta;',
        eta: '&eta;',
        theta: '&theta;',
        iota: '&iota;',
        kappa: '&kappa;',
        lambda: '&lambda;',
        mu: '&mu;',
        nu: '&nu;',
        xi: '&xi;',
        omicron: '&omicron;',
        pi: '&pi;',
        rho: '&rho;',
        sigma: '&sigma;',
        tau: '&tau;',
        upsilon: '&upsilon;',
        phi: '&phi;',
        chi: '&chi;',
        psi: '&psi;',
        omega: '&omega;',
        Alpha: '&Alpha;',
        Beta: '&Beta;',
        Gamma: '&Gamma;',
        Delta: '&Delta;',
        Epsilon: '&Epsilon;',
        Zeta: '&Zeta;',
        Eta: '&Eta;',
        Theta: '&Theta;',
        Iota: '&Iota;',
        Kappa: '&Kappa;',
        Lambda: '&Lambda;',
        Mu: '&Mu;',
        Nu: '&Nu;',
        Xi: '&Xi;',
        Omicron: '&Omicron;',
        Pi: '&Pi;',
        Rho: '&Rho;',
        Sigma: '&Sigma;',
        Tau: '&Tau;',
        Upsilon: '&Upsilon;',
        Phi: '&Phi;',
        Chi: '&Chi;',
        Psi: '&Psi;',
        Omega: '&Omega;',
    };
    
    const subSup: Record<string, string> = {
        '^': 'sup',
        '_': 'sub',
    };
    
    const mathSymbols: Record<string, string> = {
        'pm': '&plusmn;',
        'mp': '∓',
        'times': '&times;',
        'div': '&divide;',
        'cdot': '&middot;',
        'ast': '&lowast;',
        'star': '&starf;',
        'circ': '&cir;',
        'bullet': '&bull;',
        'sqrt': '&radic;',
        'sqrt\\[3\\]': '∛',
        'sqrt\\[4\\]': '∜',
        'infty': '&infin;',
        'int': '&int;',
        'sum': '&sum;',
        'prod': '&prod;',
        'coprod': '&coprod;',
    };
    
    const mathFunctions: Record<string, string> = {
        'sin': 'sin',
        'cos': 'cos',
        'tan': 'tan',
        'cot': 'cot',
        'sec': 'sec',
        'csc': 'csc',
        'lim': 'lim',
        'log': 'log',
        'ln': 'ln',
        'arcsin': 'arcsin',
        'arccos': 'arccos',
        'arctan': 'arctan',
        'sinh': 'sinh',
        'cosh': 'cosh',
        'tanh': 'tanh',
        'coth': 'coth',
        'sech': 'sech',
        'csch': 'csch',
        'arcsinh': 'arcsinh',
        'arccosh': 'arccosh',
        'arctanh': 'arctanh',
        'arccoth': 'arccoth',
        'arcsech': 'arcsech',
        'arccsch': 'arccsch',
    };
    
    const mathOperators: Record<string, string> = {
        '\\*': '&times;',
        '\\/': '&divide;',
        '\\+': '+',
        '\\-': '&minus;',
        '\\=': '=',
        '\\<': '&lt;',
        '\\>': '&gt;',
        '\\!=': '&ne;',
        '\\<=': '&le;',
        '\\>=': '&ge;',
    };

    let html = latex;

    // Convert math operators
    // math operators are converted first to avoid conflicts with other symbols, in particular
    // the < and > symbols which are used in HTML tags
    Object.keys(mathOperators).forEach((mo) => {
        html = html.replace(new RegExp(mo, 'g'), mathOperators[mo]);
    });
    
    // Convert math symbols
    Object.keys(mathSymbols).forEach((ms) => {
        html = html.replace(new RegExp(`\\\\${ms}`, 'g'), mathSymbols[ms]);
    });
    
    // Convert math functions with <span> and class 'npe-math-function'
    Object.keys(mathFunctions).forEach((mf) => {
        html = html.replace(new RegExp(`\\\\${mf}(?:\\{([^}]*)\\}|\\(([^)]*)\\))`, 'g'), `<span class="npe-math-function">${mathFunctions[mf]}($1$2)</span>`);
    });
    
    // Convert greek letters
    Object.keys(greekLetters).forEach((gl) => {
        html = html.replace(new RegExp(`\\\\${gl}`, 'g'), greekLetters[gl]);
    });
    
    // Convert sub- and superscript
    Object.keys(subSup).forEach((ss) => {
        // Match multiple characters in sub- and superscript
        html = html.replace(new RegExp(`\\${ss}\\{([^}]*)\\}`, 'g'), `<${subSup[ss]}>$1</${subSup[ss]}>`);
        // Match single characters in sub- and superscript
        html = html.replace(new RegExp(`\\${ss}([^}])`, 'g'), `<${subSup[ss]}>$1</${subSup[ss]}>`);
    });

    return html;
}
