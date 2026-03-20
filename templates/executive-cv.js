import { createTemplateUtils } from '../js/templates/utils.js';

export const executiveCv = {
  id: 'executive-cv',
  name: '◼ Executive Sleek',
  desc: 'Modern two-column, gold & charcoal',
  render: function(doc, d) {
    const utils = createTemplateUtils(doc, { margin: 15, startY: 15 });
    const { M, CW, W, H } = { M: utils.margin, CW: utils.contentWidth, W: utils.pageWidth, H: utils.pageHeight };
    const GOLD = '#8C734B', DARK = '#222222', MID = '#555555', SOFT_GRAY = '#F8F8F8';
    
    const SX = M + 65; // Sidebar width
    const SW = 65 - M; // Sidebar internal width
    const MW = W - SX - M; // Main content width

    function drawSidebar() {
      doc.setFillColor(SOFT_GRAY);
      doc.rect(0, 0, SX - 5, H, 'F');
    }

    drawSidebar();

    // ── SIDEBAR CONTENT ──────────────────────────────────────────────────────
    let sy = M + 5;
    
    // Contact Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(GOLD);
    doc.text('CONTACT', M, sy);
    sy += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(MID);
    
    const contact = [
      ['Email', d.email],
      ['Mobile', d.mobile],
      ['LinkedIn', d.linkedin],
      ['GitHub', d.github],
      ['Location', d.address]
    ].filter(c => c[1]);

    contact.forEach(c => {
      doc.setFont('helvetica', 'bold');
      doc.text(c[0], M, sy);
      sy += 4.5;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(c[1], SW - 5);
      lines.forEach(l => {
        doc.text(l, M, sy);
        sy += 4.2;
      });
      sy += 2;
    });

    // Skills
    sy += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(GOLD);
    doc.text('SKILLS', M, sy);
    sy += 5;

    const skillCats = [
      { label: 'Technical', data: [...(d.skills.tech || []), ...(d.skills.lang || [])] },
      { label: 'Expertise', data: d.skills.hard },
      { label: 'Interpersonal', data: d.skills.soft }
    ].filter(s => s.data.length > 0);

    skillCats.forEach(cat => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(DARK);
      doc.text(cat.label, M, sy);
      sy += 4.5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(MID);
      const txt = cat.data.join(', ');
      const lines = doc.splitTextToSize(txt, SW - 5);
      lines.forEach(l => {
        doc.text(l, M, sy);
        sy += 4.2;
      });
      sy += 4;
    });

    // ── MAIN CONTENT ────────────────────────────────────────────────────────
    utils.y = M + 5;
    
    // Name & Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(DARK);
    doc.text(d.name || '', SX, utils.y);
    utils.y += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(GOLD);
    doc.text(d.jobtitle?.toUpperCase() || '', SX, utils.y);
    utils.y += 12;

    function mainHead(title) {
      utils.chk(15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(DARK);
      doc.text(title.toUpperCase(), SX, utils.y);
      utils.y += 1.5;
      doc.setDrawColor(GOLD);
      doc.setLineWidth(0.8);
      doc.line(SX, utils.y, SX + 10, utils.y);
      utils.y += 7;
    }

    // Summary
    if (d.summary) {
      mainHead('Professional Profile');
      utils.wrap(d.summary, SX, MW, 9.5, 'normal', MID, 5);
      utils.y += 6;
    }

    // Experience
    if (d.exp.length) {
      mainHead('Employment History');
      d.exp.forEach(e => {
        if (!e.co) return;
        utils.chk(20);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(DARK);
        doc.text(e.role, SX, utils.y);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(GOLD);
        doc.text(e.period, W - M, utils.y, { align: 'right' });
        
        utils.y += 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(MID);
        doc.text(e.co + (e.loc ? ' | ' + e.loc : ''), SX, utils.y);
        
        utils.y += 6;
        if (e.desc) {
          utils.wrap(e.desc, SX, MW, 9, 'normal', MID, 4.5);
          utils.y += 1.5;
        }
        if (e.ach) {
          utils.chk(8);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(DARK);
          doc.text('Key Achievements', SX, utils.y);
          utils.y += 4.5;
          utils.wrap(e.ach, SX + 3, MW - 3, 8.5, 'normal', MID, 4.2);
        }
        utils.y += 6;
      });
    }

    // Projects
    if (d.proj.length) {
      mainHead('Key Projects');
      d.proj.forEach(p => {
        if (!p.name) return;
        utils.chk(15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(DARK);
        doc.text(p.name, SX, utils.y);
        utils.y += 4.5;
        
        if (p.tech) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8.5);
          doc.setTextColor(GOLD);
          doc.text(p.tech, SX, utils.y);
          utils.y += 5;
        }
        
        if (p.desc) {
          utils.wrap(p.desc, SX, MW, 8.5, 'normal', MID, 4.2);
        }
        utils.y += 5;
      });
    }

    // Education
    if (d.edu.length) {
      mainHead('Education');
      d.edu.forEach(e => {
        if (!e.inst) return;
        utils.chk(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(DARK);
        doc.text(e.deg, SX, utils.y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(GOLD);
        doc.text(e.period, W - M, utils.y, { align: 'right' });
        
        utils.y += 4.8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(MID);
        doc.text(e.inst + (e.loc ? ', ' + e.loc : ''), SX, utils.y);
        utils.y += 8;
      });
    }
  }
};
