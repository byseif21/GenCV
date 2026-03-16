import { createTemplateUtils } from '../js/templates/utils.js';

/**
 * boilerplate: A starting point for new templates.
 * Copy this file to the root `/templates/` folder and rename it.
 */
export const boilerplate = {
  id: 'boilerplate',
  name: '✨ New Template',
  desc: 'A basic structure for custom designs',
  render: function(doc, d) {
    // 1. Initialize utilities
    // Adjust margin and startY as needed
    const utils = createTemplateUtils(doc, { margin: 18, startY: 18 });
    const { M, CW, W } = { M: utils.margin, CW: utils.contentWidth, W: utils.pageWidth };
    
    // 2. Define colors and styles
    const PRIMARY = '#2563EB';
    const TEXT_DARK = '#1F2937';

    // 3. Helper for section headers
    function sectionHeader(title) {
      utils.chk(12); // Check for page overflow
      utils.y += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(PRIMARY);
      doc.text(title.toUpperCase(), M, utils.y);
      utils.y += 2;
      utils.rule(PRIMARY, 0.5); // Draw a line
      utils.y += 5;
    }

    // 4. Render Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(TEXT_DARK);
    doc.text(d.name || 'Your Name', M, utils.y);
    utils.y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(d.jobtitle || 'Professional Title', M, utils.y);
    utils.y += 10;

    // 5. Render Sections (Summary, Education, etc.)
    if (d.summary) {
      sectionHeader('Summary');
      utils.wrap(d.summary, M, CW, 10, 'normal', TEXT_DARK);
      utils.y += 5;
    }

    // Example: Experience
    if (d.exp && d.exp.length) {
      sectionHeader('Experience');
      d.exp.forEach(e => {
        if (!e.co) return;
        utils.chk(10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(e.co, M, utils.y);
        doc.setFont('helvetica', 'normal');
        doc.text(e.period, W - M, utils.y, { align: 'right' });
        utils.y += 5;
        if (e.desc) {
          utils.wrap(e.desc, M + 5, CW - 5, 9, 'normal', TEXT_DARK);
        }
        utils.y += 3;
      });
    }

    // Add more sections following the same pattern...
  }
};
