import { createTemplateUtils } from '../js/templates/utils.js';

export const seifCv = {
  id: 'seif-cv',
  name: '◻ Seif CV',
  desc: 'Your original CV style',
  render: function(doc, d) {
    const utils = createTemplateUtils(doc, { margin: 18, startY: 18 });
    const { M, CW, W } = { M: utils.margin, CW: utils.contentWidth, W: utils.pageWidth };
    const DARK='#1A1A1A', MID='#333333', MUTED='#555555', GRAY='#777777';
  
    function secHead(title){
      utils.chk(12);
      utils.y += 4;
      doc.setFont('helvetica','bolditalic');
      doc.setFontSize(10);
      doc.setTextColor(DARK);
      doc.text(title.toUpperCase().split('').join(''), M, utils.y);
      utils.y += 1.5;
      utils.rule('#999999', 0.4);
      utils.y += 5;
    }
  
    // Name (centered, large)
    doc.setFont('helvetica','bold');
    doc.setFontSize(18);
    doc.setTextColor(DARK);
    doc.text(d.name, W/2, utils.y, {align:'center'});
    utils.y += 7;
  
    // Job title (centered)
    doc.setFont('helvetica','normal');
    doc.setFontSize(10);
    doc.setTextColor(MID);
    doc.text(d.jobtitle, W/2, utils.y, {align:'center'});
    utils.y += 7;
  
    // Contact block
    const col1x = M, col2x = W/2 + 5;
    const contactLeft = [
      d.address ? ['Address:', d.address] : null,
      d.linkedin ? ['LinkedIn:', d.linkedin] : null,
      d.github ? ['GitHub:', d.github] : null
    ].filter(Boolean);
    const contactRight = [
      d.email ? ['Email:', d.email] : null,
      d.mobile ? ['Mobile:', d.mobile] : null
    ].filter(Boolean);
  
    const maxRows = Math.max(contactLeft.length, contactRight.length);
    for(let i=0;i<maxRows;i++){
      utils.chk(5);
      if(contactLeft[i]){
        doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(DARK);
        doc.text(contactLeft[i][0], col1x, utils.y);
        doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor('#1155CC');
        doc.text(contactLeft[i][1], col1x+16, utils.y);
      }
      if(contactRight[i]){
        doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(DARK);
        doc.text(contactRight[i][0], col2x, utils.y);
        doc.setFont('helvetica','normal');doc.setFontSize(8.5);
        doc.setTextColor(contactRight[i][0]==='Email:' ? '#1155CC' : DARK);
        doc.text(contactRight[i][1], col2x+14, utils.y);
      }
      utils.y += 4.8;
    }
    utils.y += 2;
  
    // SUMMARY
    if(d.summary){
      secHead('Summary');
      utils.wrap(d.summary, M, CW, 9, 'normal', MID);
      utils.y += 2;
    }
  
    // EDUCATION
    if(d.edu.length){
      secHead('Education');
      d.edu.forEach(e=>{
        if(!e.inst) return;
        utils.chk(10);
        doc.setFillColor(DARK);doc.circle(M+0.5, utils.y-1.5, 0.9, 'F');
        doc.setFont('helvetica','bold');doc.setFontSize(9.5);doc.setTextColor(DARK);
        doc.text(e.inst, M+3, utils.y);
        doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(GRAY);
        doc.text(e.loc, W-M, utils.y, {align:'right'});
        utils.y += 4.8;
        doc.setFont('helvetica','italic');doc.setFontSize(9);doc.setTextColor(MID);
        const degLines=doc.splitTextToSize(e.deg, CW-35);
        degLines.forEach((l,i)=>{
          utils.chk(4);doc.text(l,M+3,utils.y);
          if(i===0){doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(GRAY);doc.text(e.period,W-M,utils.y,{align:'right'});}
          utils.y+=4.2;doc.setFont('helvetica','italic');doc.setFontSize(9);doc.setTextColor(MID);
        });
        utils.y += 2;
      });
    }
  
    // EXPERIENCE
    if(d.exp.length){
      secHead('Experience');
      d.exp.forEach(e=>{
        if(!e.co) return;
        utils.chk(14);
        doc.setFillColor(DARK);doc.circle(M+0.5, utils.y-1.5, 0.9, 'F');
        doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(DARK);
        doc.text(e.co, M+3, utils.y);
        doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(GRAY);
        doc.text(e.loc, W-M, utils.y, {align:'right'});
        utils.y += 5;
        doc.setFont('helvetica','italic');doc.setFontSize(9);doc.setTextColor(MID);
        doc.text(e.role, M+3, utils.y);
        doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(GRAY);
        doc.text(e.period, W-M, utils.y, {align:'right'});
        utils.y += 5;
        if(e.desc){
          doc.setFillColor('#555');doc.circle(M+4.5, utils.y-1.5, 0.6, 'F');
          utils.wrap(e.desc, M+7, CW-7, 8.5, 'normal', MUTED);
        }
        if(e.ach){
          utils.chk(7);
          doc.setFillColor('#555');doc.circle(M+4.5, utils.y-1.5, 0.6, 'F');
          doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(DARK);
          doc.text('Achievements:', M+7, utils.y);
          utils.y += 4.2;
          utils.wrap(e.ach, M+7, CW-7, 8.5, 'normal', MUTED);
        }
        utils.y += 3;
      });
    }
  
    // PROJECTS
    if(d.proj.length){
      secHead('Projects');
      d.proj.forEach(p=>{
        if(!p.name) return;
        utils.chk(12);
        doc.setFillColor(DARK);doc.circle(M+0.5, utils.y-1.5, 0.9, 'F');
        doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(DARK);
        doc.text(p.name, M+3, utils.y);
        utils.y += 5;
        if(p.tech){
          doc.setFillColor('#555');doc.circle(M+4.5, utils.y-1.5, 0.6, 'F');
          doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(MUTED);
          const techLines=doc.splitTextToSize('Technologies: '+p.tech, CW-7);
          techLines.forEach(l=>{utils.chk(4);doc.text(l,M+7,utils.y);utils.y+=4.2;});
        }
        if(p.desc){
          doc.setFillColor('#555');doc.circle(M+4.5, utils.y-1.5, 0.6, 'F');
          doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(MUTED);
          doc.text('Description:', M+7, utils.y);utils.y+=4.2;
          utils.wrap(p.desc, M+7, CW-7, 8.5, 'normal', MUTED);
        }
        if(p.ach){
          utils.chk(7);
          doc.setFillColor('#555');doc.circle(M+4.5, utils.y-1.5, 0.6, 'F');
          doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(DARK);
          doc.text('Key Achievements:', M+7, utils.y);utils.y+=4.2;
          utils.wrap(p.ach, M+7, CW-7, 8.5, 'normal', MUTED);
        }
        utils.y += 4;
      });
    }
  
    // SKILLS
    secHead('Skills');
    [['Languages',d.skills.lang],['Technologies',d.skills.tech],['Hard Skills',d.skills.hard],['Soft Skills',d.skills.soft]].forEach(([lbl,arr])=>{
      if(!arr.length) return;
      utils.chk(7);
      doc.setFillColor(DARK);doc.circle(M+0.5, utils.y-1.5, 0.9, 'F');
      const lw=doc.getTextWidth(lbl+': ');
      doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(DARK);
      doc.text(lbl+': ', M+3, utils.y);
      doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(MID);
      const txt=arr.join(', ');
      const lines=doc.splitTextToSize(txt, CW-lw-5);
      doc.text(lines[0], M+3+lw, utils.y);
      if(lines.length>1){utils.y+=4.5;lines.slice(1).forEach(l=>{doc.text(l,M+3,utils.y);utils.y+=4.5;});}
      else utils.y+=5.5;
    });
  }
};
