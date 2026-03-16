/**
 * Template utilities to reduce duplication across different CV templates.
 */

export const createTemplateUtils = (doc, config) => {
  const { 
    margin = 18, 
    pageHeight = 297, 
    pageWidth = 210,
    startY = 18,
    lineHeightMultiplier = 0.38,
    lineHeightOffset = 1.1
  } = config;

  let y = startY;

  const utils = {
    get y() { return y; },
    set y(val) { y = val; },
    margin,
    pageWidth,
    pageHeight,
    contentWidth: pageWidth - (margin * 2),

    chk: (n = 8) => {
      if (y + n > pageHeight - 20) {
        doc.addPage();
        y = startY;
        return true;
      }
      return false;
    },

    wrap: (text, x, maxW, sz, style, color, lh) => {
      doc.setFont('helvetica', style);
      doc.setFontSize(sz);
      doc.setTextColor(color);
      const lines = doc.splitTextToSize(text, maxW);
      const step = lh || (sz * lineHeightMultiplier + lineHeightOffset);
      lines.forEach(l => {
        utils.chk(step + 1);
        doc.text(l, x, y);
        y += step;
      });
    },

    rule: (color = '#999999', width = 0.4) => {
      doc.setDrawColor(color);
      doc.setLineWidth(width);
      doc.line(margin, y, pageWidth - margin, y);
    }
  };

  return utils;
};
