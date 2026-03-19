# Template Management

This directory contains the logic and registration for CV templates.

## Adding a Template

1.  **Create the file**:
    - Copy [template-boilerplate.js](template-boilerplate.js) to a new file (e.g., `style-name.js`).
    - Update the exported object properties (e.g., `id`, `name`).
    - Implement the rendering logic in the `render(doc, d)` function.

2.  **Register the template**:
    - Open [js/templates/index.js](../js/templates/index.js).
    - Import the template: `import { styleName } from '../../templates/style-name.js';`.
    - Add it to the `cvTemplates` object.

3.  **Utilities**:
    - Use `createTemplateUtils(doc, config)` in [js/templates/utils.js](../js/templates/utils.js):
        - `utils.chk(n)`: New page if overflow occurs.
        - `utils.wrap(text, x, maxW, sz, style, color)`: Text wrapping and page breaks.
        - `utils.rule(color, width)`: Horizontal lines.

---

## Technical Tip: AI-Generated Render Functions

You can use an LLM (ChatGPT, Claude, etc.) to generate the `render` function logic.

### Process:

1.  **Input**: Provide a description or screenshot of the desired layout.
2.  **Context**: Provide the contents of [template-boilerplate.js](template-boilerplate.js) and [js/templates/utils.js](../js/templates/utils.js).
3.  **Prompt Example**:
    > "Using the provided `template-boilerplate.js` and `utils.js` structure, create a 'Minimalist' template with a single-column layout. Use `utils.wrap` for descriptions and `utils.chk` for page breaks."

4.  **Copy & Paste**: The AI will generate the `render` function. Just copy it into your new template file and you're good to go!
