import { createTemplateUtils } from '../js/templates/utils.js';

export const ltsProCv = {
  id: 'lts-pro',
  name: '◼ LTS Professional',
  desc: 'Classic, reliable, deep navy accents',
  render: function(doc, d) {
    const utils = createTemplateUtils(doc, { margin: 18, startY: 18 });
    const { M, CW, W } = { M: utils.margin, CW: utils.contentWidth, W: utils.pageWidth };
    const COLD_NAVY = '#003366', DARK = '#1A1A1A', MID = '#444444', LIGHT_GRAY = '#EEEEEE';

    function secHead(title) {
      utils.chk(15);
      utils.y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(COLD_NAVY);
      doc.text(title.toUpperCase(), M, utils.y);
      utils.y += 1.5;
      doc.setDrawColor(COLD_NAVY);
      doc.setLineWidth(0.6);
      doc.line(M, utils.y, M + 15, utils.y); // Short underline
      doc.setDrawColor('#CCCCCC');
      doc.setLineWidth(0.1);
      doc.line(M + 16, utils.y, W - M, utils.y); // Faint full line
      utils.y += 6;
    }

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(COLD_NAVY);
    doc.text(d.name || 'NAME', M, utils.y);
    
    // Contact Info (Right Aligned)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(MID);
    let contactY = utils.y - 2;
    const rightSide = [d.email, d.mobile, d.address].filter(Boolean);
    rightSide.forEach(txt => {
      doc.text(txt, W - M, contactY, { align: 'right' });
      contactY += 4.5;
    });

    utils.y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(MID);
    doc.text(d.jobtitle || '', M, utils.y);
    
    utils.y += 3;
    const links = [d.linkedin, d.github].filter(Boolean).join('  |  ');
    if(links){
        utils.y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor('#0066CC');
        doc.text(links, M, utils.y);
    }
    
    utils.y += 8;

    // SUMMARY
    if (d.summary) {
      secHead('Professional Summary');
      utils.wrap(d.summary, M, CW, 9.5, 'normal', DARK, 5);
      utils.y += 2;
    }

    // EXPERIENCE
    if (d.exp.length) {
      secHead('Experience');
      d.exp.forEach(e => {
        if (!e.co) return;
        utils.chk(15);
        
        // Dot & Vertical Line (Timeline Style)
        doc.setDrawColor('#DDDDDD');
        doc.setLineWidth(0.5);
        doc.line(M + 1, utils.y, M + 1, utils.y + 15);
        doc.setFillColor(COLD_NAVY);
        doc.circle(M + 1, utils.y - 1, 0.8, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(DARK);
        doc.text(e.co, M + 5, utils.y);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(MID);
        doc.text(e.loc, W - M, utils.y, { align: 'right' });
        
        utils.y += 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(COLD_NAVY);
        doc.text(e.role, M + 5, utils.y);
        
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(MID);
        doc.text(e.period, W - M, utils.y, { align: 'right' });
        
        utils.y += 5;
        if (e.desc) {
          utils.wrap(e.desc, M + 5, CW - 5, 9, 'normal', MID, 4.5);
          utils.y += 1;
        }
        if (e.ach) {
          utils.chk(8);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(DARK);
          doc.text('Key Achievements:', M + 5, utils.y);
          utils.y += 4.5;
          utils.wrap(e.ach, M + 8, CW - 8, 8.5, 'normal', MID, 4.2);
        }
        utils.y += 4;
      });
    }

    // PROJECTS
    if (d.proj.length) {
      secHead('Projects');
      d.proj.forEach(p => {
        if (!p.name) return;
        utils.chk(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(DARK);
        doc.text(p.name, M, utils.y);
        
        if (p.tech) {
          const tw = doc.getTextWidth(p.name);
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8.5);
          doc.setTextColor(COLD_NAVY);
          doc.text(' - ' + p.tech, M + tw + 2, utils.y);
        }
        
        utils.y += 5;
        if (p.desc) {
          utils.wrap(p.desc, M, CW, 9, 'normal', MID, 4.5);
        }
        if (p.ach) {
          utils.chk(6);
          utils.y += 1;
          utils.wrap('• ' + p.ach, M + 3, CW - 3, 8.5, 'normal', MID, 4.2);
        }
        utils.y += 5;
      });
    }

    // EDUCATION
    if (d.edu.length) {
      secHead('Education');
      d.edu.forEach(e => {
        if (!e.inst) return;
        utils.chk(10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(DARK);
        doc.text(e.inst, M, utils.y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(MID);
        doc.text(e.loc, W - M, utils.y, { align: 'right' });
        
        utils.y += 4.8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(MID);
        doc.text(e.deg, M, utils.y);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(MID);
        doc.text(e.period, W - M, utils.y, { align: 'right' });
        utils.y += 6;
      });
    }

    // SKILLS
    secHead('Technical Skills');
    const skills = [
      { label: 'Languages', data: d.skills.lang },
      { label: 'Technologies', data: d.skills.tech },
      { label: 'Hard Skills', data: d.skills.hard },
      { label: 'Soft Skills', data: d.skills.soft }
    ].filter(s => s.data && s.data.length > 0);

    skills.forEach(s => {
      utils.chk(7);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(DARK);
      doc.text(s.label + ':', M, utils.y);
      
      const lw = doc.getTextWidth(s.label + ': ');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(MID);
      const txt = s.data.join(', ');
      const lines = doc.splitTextToSize(txt, CW - lw - 2);
      doc.text(lines[0], M + lw, utils.y);
      if (lines.length > 1) {
        utils.y += 4.5;
        lines.slice(1).forEach(l => {
          utils.chk(4.5);
          doc.text(l, M, utils.y);
          utils.y += 4.5;
        });
      } else {
        utils.y += 5.5;
      }
    });
  }
};
