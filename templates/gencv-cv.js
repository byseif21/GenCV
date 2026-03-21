import { createTemplateUtils } from '../js/templates/utils.js';

export const gencvCv = {
  id: 'gencv-cv',
  name: '◼ GenCv CV',
  desc: 'Gold accent, dark top strip',
  render: function(doc, d) {
    const utils = createTemplateUtils(doc, { margin: 18, startY: 20 });
    const { M, CW, W } = { M: utils.margin, CW: utils.contentWidth, W: utils.pageWidth };
    
    function secHead(t){
      utils.chk(12);
      utils.y += 5;
      doc.setFont('helvetica','bold');
      doc.setFontSize(8.5);
      doc.setTextColor('#1A1A1A');
      doc.text(t.toUpperCase(), M, utils.y);
      utils.y += 2;
      utils.rule('#B8960C', 0.5);
      utils.y += 5;
    }
    
    doc.setFillColor('#1A1A1A');doc.rect(0,0,W,36,'F');
    utils.y=13;
    doc.setFont('helvetica','bold');doc.setFontSize(20);doc.setTextColor('#FFFFFF');doc.text(d.name,M,utils.y);
    utils.y+=6.5;doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor('#B8960C');doc.text(d.jobtitle,M,utils.y);
    utils.y+=5;doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor('#AAAAAA');
    doc.text([d.address,d.email,d.mobile].filter(Boolean).join('   |   '),M,utils.y);
    utils.y+=4;doc.text([d.linkedin,d.github].filter(Boolean).join('   |   '),M,utils.y);
    
    utils.y=42;
    if(d.summary){secHead('Summary');utils.wrap(d.summary,M,CW,8.5,'normal','#444');}
    
    if(d.edu.length){
      secHead('Education');
      d.edu.forEach(e=>{
        if(!e.inst)return;utils.chk(10);
        doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor('#1A1A1A');doc.text(e.inst,M,utils.y);
        doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor('#888');doc.text(e.loc,W-M,utils.y,{align:'right'});
        utils.y+=4.5;doc.setFont('helvetica','italic');doc.setFontSize(8.5);doc.setTextColor('#444');
        const dl=doc.splitTextToSize(e.deg,CW-35);
        dl.forEach((l,i)=>{if(i>0)utils.chk(4);doc.text(l,M,utils.y);if(i===0){doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor('#B8960C');doc.text(e.period,W-M,utils.y,{align:'right'});}utils.y+=4.2;});
        utils.y+=2;
      });
    }
    
    if(d.exp.length){
      secHead('Experience');
      d.exp.forEach(e=>{
        if(!e.co)return;utils.chk(14);
        doc.setFont('helvetica','bold');doc.setFontSize(9.5);doc.setTextColor('#1A1A1A');doc.text(e.co,M,utils.y);
        doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor('#888');doc.text(e.loc,W-M,utils.y,{align:'right'});
        utils.y+=4.5;doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor('#B8960C');doc.text(e.role,M,utils.y);
        doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor('#888');doc.text(e.period,W-M,utils.y,{align:'right'});
        utils.y+=5;if(e.desc)utils.wrap(e.desc,M+3,CW-3,8,'normal','#555');
        if(e.ach){utils.chk(7);doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor('#1A1A1A');doc.text('Achievements:',M+3,utils.y);utils.y+=4;utils.wrap(e.ach,M+3,CW-3,8,'normal','#555');}
        utils.y+=3;
      });
    }
    
    if(d.proj.length){
      secHead('Projects');
      d.proj.forEach(p=>{
        if(!p.name)return;utils.chk(12);
        doc.setFont('helvetica','bold');doc.setFontSize(9.5);doc.setTextColor('#1A1A1A');doc.text(p.name,M,utils.y);utils.y+=4.5;
        if(p.tech){doc.setFont('helvetica','italic');doc.setFontSize(8);doc.setTextColor('#B8960C');doc.text('Technologies: '+p.tech,M,utils.y);utils.y+=4.5;}
        if(p.desc)utils.wrap(p.desc,M+3,CW-3,8,'normal','#555');
        if(p.ach){utils.chk(7);doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor('#1A1A1A');doc.text('Key Achievements:',M+3,utils.y);utils.y+=4;utils.wrap(p.ach,M+3,CW-3,8,'normal','#555');}
        utils.y+=4;
      });
    }
    
    secHead('Skills');
    [['Languages',d.skills.lang],['Technologies',d.skills.tech],['Hard Skills',d.skills.hard],['Soft Skills',d.skills.soft]].forEach(([lbl,arr])=>{
      if(!arr.length)return;utils.chk(7);
      doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor('#1A1A1A');
      const lw=doc.getTextWidth(lbl+': ');doc.text(lbl+': ',M,utils.y);
      doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor('#444');
      const txt=arr.join(', ');const lines=doc.splitTextToSize(txt,CW-lw-1);
      doc.text(lines[0],M+lw,utils.y);if(lines.length>1){utils.y+=4.5;lines.slice(1).forEach(l=>{doc.text(l,M,utils.y);utils.y+=4.5;});}else utils.y+=5;
    });
  }
};
