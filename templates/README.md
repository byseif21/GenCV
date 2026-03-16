# Adding a New Template

This folder contains the core logic and registration for CV templates.

## How to add a new template

1.  **Create the template file**:
    - Copy the [template-boilerplate.js](template-boilerplate.js) file in this folder to a new file (e.g., `modern.js`).
    - Rename the export and properties (e.g., `export const modern = { id: 'modern', name: '✨ Modern Style', ... }`).
    - Define your rendering logic in the `render(doc, d)` function.

2.  **Register the template**:
    - Open [js/templates/index.js](../js/templates/index.js).
    - Import your new template: `import { modern } from '../../templates/modern.js';`.
    - Add it to the `cvTemplates` object: `export const cvTemplates = { 'seif-cv': seifCv, 'gencv-cv': gencvCv, 'modern': modern };`.

3.  **Using Utilities**:
    - Use `createTemplateUtils(doc, config)` in [js/templates/utils.js](../js/templates/utils.js) to handle:
        - `utils.chk(n)`: Automatically adds a new page if the next element would overflow.
        - `utils.wrap(text, x, maxW, sz, style, color)`: Wraps long text into multiple lines and handles page breaks.
        - `utils.rule(color, width)`: Draws a horizontal line across the page.

---

## 🤖 Tip: Use AI to Create Templates

You can use any AI (like ChatGPT, Claude, or Gemini) to generate the `render` function for you!

### How to ask:

1.  **Show the style**: Send a screenshot or describe the design you want.
2.  **Provide the format**: Paste the contents of [template-boilerplate.js](template-boilerplate.js) and [js/templates/utils.js](../js/templates/utils.js) as context.
3.  **Prompt example**:
    > "Using the provided `template-boilerplate.js` and `utils.js` structure, create a new CV template called 'Minimalist'. Use a single-column layout, blue accents for headers, and include sections for summary, education, experience, projects, and skills. Use `utils.wrap` for all descriptions and `utils.chk` for page breaks."

4.  **Copy & Paste**: The AI will generate the `render` function. Just copy it into your new template file and you're good to go!
