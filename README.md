# GenCv

GenCv is a web application built mainly to easily create and update a Curriculum Vitae (CV) directly in the browser.

## Features

- **Real-Time Data Entry**: Easy management of different CV sections.
- **Dynamic Skills Management**: Add dynamic tags for languages, technologies, and soft/hard skills.
- **Multiple Templates**: Choose from several professional templates to suit your style.
- **Instant PDF Export**: Client-side offline PDF generation using `jsPDF`.
- **Responsive Design**: Fast and accessible UI with distinct inputs.

## Setup & Usage

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/GenCv.git
   ```
2. **Open the application**:
   Since the project uses JavaScript ES Modules, you need to serve it using a local web server (like VS Code's "Live Server" extension, or `npx serve .`).
3. Fill in your CV sections and click **Export PDF**.

## Adding New Templates

Adding a new template is now easy!

1. Create a new JS file in the root [templates/](templates/) folder (e.g., `templates/modern.js`).
2. Define your template object with `id`, `name`, `desc`, and a `render(doc, data)` function.
3. Import your new template in [js/templates/index.js](js/templates/index.js) and add it to the `cvTemplates` object.
4. You can use the helpers in [js/templates/utils.js](js/templates/utils.js) to simplify your rendering logic.
5. Check out the [templates/README.md](templates/README.md) for more details and tips on using AI to generate new styles.

## Technologies Used

- HTML5
- CSS3 (Vanilla, Modern Properties, Custom Scrollbars)
- JavaScript (Vanilla, ES6+)
- [jsPDF](https://github.com/parallax/jsPDF) for client-side PDF Generation.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
