import { NestedPropertiesEditorView } from "../../../views/NestedPropertiesEditor";
import type { NestedPropertiesEditorCodeBlockView } from "../../../views/NestedPropertiesEditor";
import { updateProperties } from "../utils/updateProperties";
import { renderMath, finishRenderMath, loadMathJax } from "obsidian";
import { createLogger } from "../../../../utils/Logger";

const logger = createLogger('ui');

/**
 * Creates a LaTeX element with optional callback support for array contexts
 * @param view - The NPE view instance
 * @param value - The LaTeX value (with or without $ delimiters)
 * @param container - The container element to append to
 * @param dataKey - The data key for updates (used to detect context: primitive vs array)
 * @param onUpdate - Optional callback for array contexts
 */
export function createLatexElement(
    view: NestedPropertiesEditorView | NestedPropertiesEditorCodeBlockView,
    value: string,
    container: HTMLElement,
    dataKey: string,
    onUpdate?: (newValue: string) => void
): void {
    // Detect context from dataKey structure: array items have numeric indices (e.g., "key.0", "nested.key.1")
    const isArrayContext = /\.\d+$/.test(dataKey) || Boolean(onUpdate);
    
    // Store the current full LaTeX with delimiters for editing (will be updated)
    let currentFullLatex = value;
    
    // Extract LaTeX content for display (remove $ delimiters if present)
    const rawLatexContent = typeof value === 'string' ? value.replace(/^\$|\$$/g, '') : String(value);
    
    // Wrap LaTeX content in \mathsf{} for proper sans-serif rendering with correct kerning
    // Only wrap if not already wrapped to avoid double-wrapping
    const latexContent = rawLatexContent.includes('\\mathsf{') 
        ? rawLatexContent 
        : `\\mathsf{${rawLatexContent}}`;
    
    const latexDisplay = container.createDiv({ cls: 'npe-list-item-latex' });
    
    // Use Obsidian's renderMath for LaTeX rendering (confirmed working via debugging)
    logger.debug(`LaTeX rendering: "${latexContent}"`);
    loadMathJax().then(() => {
        try {
            logger.debug('Using renderMath() approach');
            const mathElement = renderMath(latexContent, false);
            latexDisplay.appendChild(mathElement);
            finishRenderMath();
            logger.debug('✅ renderMath() succeeded');
        } catch (error) {
            logger.warn('❌ renderMath() failed, using text fallback', error);
            latexDisplay.textContent = `$${rawLatexContent}$`;
        }
    }).catch((loadError) => {
        logger.warn('❌ MathJax loading failed, using text fallback', loadError);
        latexDisplay.textContent = `$${rawLatexContent}$`;
    });
    
    // Add contentEditable support for latex editing
    latexDisplay.contentEditable = "true";
    
    // Add click handler to show appropriate syntax during editing based on context
    view.registerDomEvent(latexDisplay, 'focus', () => {
        if (isArrayContext) {
            // Array context: show full $ syntax to allow type conversion
            // Ensure $ delimiters are present for editing
            if (currentFullLatex && !currentFullLatex.startsWith('$') && !currentFullLatex.endsWith('$')) {
                currentFullLatex = `$${currentFullLatex}$`;
            }
            latexDisplay.textContent = currentFullLatex;
        } else {
            // Primitive context: show raw content without $ delimiters (type preserved automatically)
            const rawContent = currentFullLatex.replace(/^\$|\$$/g, '');
            latexDisplay.textContent = rawContent;
        }
    });
    
    view.registerDomEvent(latexDisplay, 'blur', () => {
        const userInput = latexDisplay.textContent || '';
        
        if (onUpdate) {
            // Array context - use callback with user input as-is (allows type conversion)
            // Note: The array callback in renderArrayValueContainer.ts handles intelligent type conversion
            onUpdate(userInput);
            
            // Update stored value for future edits in array context
            currentFullLatex = userInput;
        } else {
            // Primitive context - add $ delimiters if not present to preserve LaTeX type
            let valueToStore = userInput;
            if (!userInput.startsWith('$') && !userInput.endsWith('$')) {
                valueToStore = `$${userInput}$`;
            }
            
            if (view.currentFile) {
                // Set internal change flag BEFORE calling updateProperties
                if (view instanceof NestedPropertiesEditorView) {
                    view.setInternalChangeFlag();
                }
                // Store the value with $ delimiters for primitive context
                updateProperties(view.app, view.currentFile, dataKey, valueToStore, 'latex');
            }
            
            // Update stored value for future edits
            currentFullLatex = valueToStore;
        }
        
        // Always restore the display after editing
        // For display rendering, use the appropriate content
        const displayValue = isArrayContext ? userInput : (currentFullLatex || userInput);
        const rawDisplayContent = displayValue.replace(/^\$|\$$/g, '');
        
        // Wrap in \mathsf{} for proper sans-serif rendering with correct kerning
        // Only wrap if not already wrapped to avoid double-wrapping
        const displayContent = rawDisplayContent.includes('\\mathsf{') 
            ? rawDisplayContent 
            : `\\mathsf{${rawDisplayContent}}`;
        
        // Update the display to show rendered LaTeX
        // Clear the container first
        latexDisplay.empty();
        
        // Re-render using the same proven renderMath approach
        logger.debug(`LaTeX re-rendering: "${displayContent}"`);
        loadMathJax().then(() => {
            try {
                logger.debug('Re-rendering: Using renderMath() approach');
                const mathElement = renderMath(displayContent, false);
                latexDisplay.appendChild(mathElement);
                finishRenderMath();
                logger.debug('✅ Re-rendering: renderMath() succeeded');
            } catch (error) {
                logger.warn('❌ Re-rendering: renderMath() failed, using text fallback', error);
                latexDisplay.textContent = `$${rawDisplayContent}$`;
            }
        }).catch((loadError) => {
            logger.warn('❌ Re-rendering: MathJax loading failed, using text fallback', loadError);
            latexDisplay.textContent = `$${rawDisplayContent}$`;
        });
    });
}