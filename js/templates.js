/**
 * templates.js
 * 
 * This file contains the registry of available templates.
 * To add a new template, simply define a new object in the `cvTemplates` object.
 * Each template must have:
 *  - id: A unique string identifier.
 *  - name: Display name in the UI.
 *  - desc: A short description for the UI card.
 *  - render: A function that takes a `jsPDF` instance (`doc`) and the user `data` object,
 *            and draws the CV onto the document.
 */

const cvTemplates = {
    // ─── TEMPLATE 1: Classic Document ───────────────
    classic: {
      id: 'classic',
      name: '◻ Classic Document',
      desc: 'Your original CV style',
      render: function(doc, d) {
        const W=210, M=18, CW=W-M*2;
        let y=18;
        const DARK='#1A1A1A', MID='#333333', MUTED='#555555', GRAY='#777777';
      
        function chk(n=8){if(y+n>277){doc.addPage();y=18;}}
      
        function secHead(title){
          chk(12);
          y+=4;
          doc.setFont('helvetica','bolditalic');
          doc.setFontSize(10);
          doc.setTextColor(DARK);
          doc.text(title.toUpperCase().split('').join(''), M, y);
          y+=1.5;
          doc.setDrawColor('#999999');doc.setLineWidth(0.4);
          doc.line(M, y, W-M, y);
          y+=5;
        }
      
        function wrap(text, x, maxW, sz, style, color, lh){
          doc.setFont('helvetica', style);
          doc.setFontSize(sz);
          doc.setTextColor(color);
          const lines = doc.splitTextToSize(text, maxW);
          const step = lh || (sz * 0.38 + 1.1);
          lines.forEach(l => { chk(step+1); doc.text(l, x, y); y += step; });
        }
      
        // Name (centered, large)
        doc.setFont('helvetica','bold');
        doc.setFontSize(18);
        doc.setTextColor(DARK);
        doc.text(d.name, W/2, y, {align:'center'});
        y += 7;
      
        // Job title (centered)
        doc.setFont('helvetica','normal');
        doc.setFontSize(10);
        doc.setTextColor(MID);
        doc.text(d.jobtitle, W/2, y, {align:'center'});
        y += 7;
      
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
          chk(5);
          if(contactLeft[i]){
            doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(DARK);
            doc.text(contactLeft[i][0], col1x, y);
            doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor('#1155CC');
            doc.text(contactLeft[i][1], col1x+16, y);
          }
          if(contactRight[i]){
            doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(DARK);
            doc.text(contactRight[i][0], col2x, y);
            doc.setFont('helvetica','normal');doc.setFontSize(8.5);
            doc.setTextColor(contactRight[i][0]==='Email:' ? '#1155CC' : DARK);
            doc.text(contactRight[i][1], col2x+14, y);
          }
          y += 4.8;
        }
        y += 2;
      
        // SUMMARY
        if(d.summary){
          secHead('Summary');
          wrap(d.summary, M, CW, 9, 'normal', MID);
          y += 2;
        }
      
        // EDUCATION
        if(d.edu.length){
          secHead('Education');
          d.edu.forEach(e=>{
            if(!e.inst) return;
            chk(10);
            doc.setFillColor(DARK);doc.circle(M+0.5, y-1.5, 0.9, 'F');
            doc.setFont('helvetica','bold');doc.setFontSize(9.5);doc.setTextColor(DARK);
            doc.text(e.inst, M+3, y);
            doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(GRAY);
            doc.text(e.loc, W-M, y, {align:'right'});
            y += 4.8;
            doc.setFont('helvetica','italic');doc.setFontSize(9);doc.setTextColor(MID);
            const degLines=doc.splitTextToSize(e.deg, CW-35);
            degLines.forEach((l,i)=>{
              chk(4);doc.text(l,M+3,y);
              if(i===0){doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(GRAY);doc.text(e.period,W-M,y,{align:'right'});}
              y+=4.2;doc.setFont('helvetica','italic');doc.setFontSize(9);doc.setTextColor(MID);
            });
            y += 2;
          });
        }
      
        // EXPERIENCE
        if(d.exp.length){
          secHead('Experience');
          d.exp.forEach(e=>{
            if(!e.co) return;
            chk(14);
            doc.setFillColor(DARK);doc.circle(M+0.5, y-1.5, 0.9, 'F');
            doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(DARK);
            doc.text(e.co, M+3, y);
            doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(GRAY);
            doc.text(e.loc, W-M, y, {align:'right'});
            y += 5;
            doc.setFont('helvetica','italic');doc.setFontSize(9);doc.setTextColor(MID);
            doc.text(e.role, M+3, y);
            doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(GRAY);
            doc.text(e.period, W-M, y, {align:'right'});
            y += 5;
            if(e.desc){
              doc.setFillColor('#555');doc.circle(M+4.5, y-1.5, 0.6, 'F');
              wrap(e.desc, M+7, CW-7, 8.5, 'normal', MUTED);
            }
            if(e.ach){
              chk(7);
              doc.setFillColor('#555');doc.circle(M+4.5, y-1.5, 0.6, 'F');
              doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(DARK);
              doc.text('Achievements:', M+7, y);
              y += 4.2;
              wrap(e.ach, M+7, CW-7, 8.5, 'normal', MUTED);
            }
            y += 3;
          });
        }
      
        // PROJECTS
        if(d.proj.length){
          secHead('Projects');
          d.proj.forEach(p=>{
            if(!p.name) return;
            chk(12);
            doc.setFillColor(DARK);doc.circle(M+0.5, y-1.5, 0.9, 'F');
            doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(DARK);
            doc.text(p.name, M+3, y);
            y += 5;
            if(p.tech){
              doc.setFillColor('#555');doc.circle(M+4.5, y-1.5, 0.6, 'F');
              doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(MUTED);
              const techLines=doc.splitTextToSize('Technologies: '+p.tech, CW-7);
              techLines.forEach(l=>{chk(4);doc.text(l,M+7,y);y+=4.2;});
            }
            if(p.desc){
              doc.setFillColor('#555');doc.circle(M+4.5, y-1.5, 0.6, 'F');
              doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(MUTED);
              doc.text('Description:', M+7, y);y+=4.2;
              wrap(p.desc, M+7, CW-7, 8.5, 'normal', MUTED);
            }
            if(p.ach){
              chk(7);
              doc.setFillColor('#555');doc.circle(M+4.5, y-1.5, 0.6, 'F');
              doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(DARK);
              doc.text('Key Achievements:', M+7, y);y+=4.2;
              wrap(p.ach, M+7, CW-7, 8.5, 'normal', MUTED);
            }
            y += 4;
          });
        }
      
        // SKILLS
        secHead('Skills');
        [['Languages',d.skills.lang],['Technologies',d.skills.tech],['Hard Skills',d.skills.hard],['Soft Skills',d.skills.soft]].forEach(([lbl,arr])=>{
          if(!arr.length) return;
          chk(7);
          doc.setFillColor(DARK);doc.circle(M+0.5, y-1.5, 0.9, 'F');
          const lw=doc.getTextWidth(lbl+': ');
          doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(DARK);
          doc.text(lbl+': ', M+3, y);
          doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(MID);
          const txt=arr.join(', ');
          const lines=doc.splitTextToSize(txt, CW-lw-5);
          doc.text(lines[0], M+3+lw, y);
          if(lines.length>1){y+=4.5;lines.slice(1).forEach(l=>{doc.text(l,M+3,y);y+=4.5;});}
          else y+=5.5;
        });
      }
    },
  
    // ─── TEMPLATE 2: Dark Header ───────────────
    dark: {
      id: 'dark',
      name: '◼ Dark Header',
      desc: 'Gold accent, dark top strip',
      render: function(doc, d) {
        const W=210,M=18,CW=W-M*2;
        let y=0;
        function chk(n=8){if(y+n>277){doc.addPage();y=18;}}
        function rule(c='#B8960C',w=0.4){doc.setDrawColor(c);doc.setLineWidth(w);doc.line(M,y,W-M,y);}
        function secHead(t){chk(12);y+=5;doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor('#1A1A1A');doc.text(t.toUpperCase(),M,y);y+=2;rule('#B8960C',0.5);y+=5;}
        function wrap(text,x,maxW,sz,style,color='#333333'){
          doc.setFont('helvetica',style);doc.setFontSize(sz);doc.setTextColor(color);
          const lines=doc.splitTextToSize(text,maxW);
          lines.forEach(l=>{chk(sz*0.38+1);doc.text(l,x,y);y+=sz*0.38+0.9;});
        }
        
        doc.setFillColor('#1A1A1A');doc.rect(0,0,W,36,'F');
        y=13;
        doc.setFont('helvetica','bold');doc.setFontSize(20);doc.setTextColor('#FFFFFF');doc.text(d.name,M,y);
        y+=6.5;doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor('#B8960C');doc.text(d.jobtitle,M,y);
        y+=5;doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor('#AAAAAA');
        doc.text([d.address,d.email,d.mobile].filter(Boolean).join('   |   '),M,y);
        y+=4;doc.text([d.linkedin,d.github].filter(Boolean).join('   |   '),M,y);
        
        y=42;
        if(d.summary){secHead('Summary');wrap(d.summary,M,CW,8.5,'normal','#444');}
        
        if(d.edu.length){
          secHead('Education');
          d.edu.forEach(e=>{
            if(!e.inst)return;chk(10);
            doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor('#1A1A1A');doc.text(e.inst,M,y);
            doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor('#888');doc.text(e.loc,W-M,y,{align:'right'});
            y+=4.5;doc.setFont('helvetica','italic');doc.setFontSize(8.5);doc.setTextColor('#444');
            const dl=doc.splitTextToSize(e.deg,CW-35);
            dl.forEach((l,i)=>{if(i>0)chk(4);doc.text(l,M,y);if(i===0){doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor('#B8960C');doc.text(e.period,W-M,y,{align:'right'});}y+=4.2;});
            y+=2;
          });
        }
        
        if(d.exp.length){
          secHead('Experience');
          d.exp.forEach(e=>{
            if(!e.co)return;chk(14);
            doc.setFont('helvetica','bold');doc.setFontSize(9.5);doc.setTextColor('#1A1A1A');doc.text(e.co,M,y);
            doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor('#888');doc.text(e.loc,W-M,y,{align:'right'});
            y+=4.5;doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor('#B8960C');doc.text(e.role,M,y);
            doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor('#888');doc.text(e.period,W-M,y,{align:'right'});
            y+=5;if(e.desc)wrap(e.desc,M+3,CW-3,8,'normal','#555');
            if(e.ach){chk(7);doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor('#1A1A1A');doc.text('Achievements:',M+3,y);y+=4;wrap(e.ach,M+3,CW-3,8,'normal','#555');}
            y+=3;
          });
        }
        
        if(d.proj.length){
          secHead('Projects');
          d.proj.forEach(p=>{
            if(!p.name)return;chk(12);
            doc.setFont('helvetica','bold');doc.setFontSize(9.5);doc.setTextColor('#1A1A1A');doc.text(p.name,M,y);y+=4.5;
            if(p.tech){doc.setFont('helvetica','italic');doc.setFontSize(8);doc.setTextColor('#B8960C');doc.text('Technologies: '+p.tech,M,y);y+=4.5;}
            if(p.desc)wrap(p.desc,M+3,CW-3,8,'normal','#555');
            if(p.ach){chk(7);doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor('#1A1A1A');doc.text('Key Achievements:',M+3,y);y+=4;wrap(p.ach,M+3,CW-3,8,'normal','#555');}
            y+=4;
          });
        }
        
        secHead('Skills');
        [['Languages',d.skills.lang],['Technologies',d.skills.tech],['Hard Skills',d.skills.hard],['Soft Skills',d.skills.soft]].forEach(([lbl,arr])=>{
          if(!arr.length)return;chk(7);
          doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor('#1A1A1A');
          const lw=doc.getTextWidth(lbl+': ');doc.text(lbl+': ',M,y);
          doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor('#444');
          const txt=arr.join(', ');const lines=doc.splitTextToSize(txt,CW-lw-1);
          doc.text(lines[0],M+lw,y);if(lines.length>1){y+=4.5;lines.slice(1).forEach(l=>{doc.text(l,M,y);y+=4.5;});}else y+=5;
        });
      }
    }
  };
  
  // Expose to window so other scripts can access it
  window.cvTemplates = cvTemplates;
