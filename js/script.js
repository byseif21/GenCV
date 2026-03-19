import { cvTemplates } from './templates/index.js';
import { seifData } from './templates/seif-data.js';

window.cvTemplates = cvTemplates;

let currentTemplate = 'seif-cv';
let pdfjsLib = window['pdfjs-dist/build/pdf'] || null;
if (pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

const skillData = { lang: [], tech: [], hard: [], soft: [] };

// ── CORE DATA MANAGEMENT ─────────────────────────────────────────────────────

function getData() {
  const g = id => document.getElementById(id)?.value || '';
  return {
    name: g('name'), jobtitle: g('jobtitle'), email: g('email'), mobile: g('mobile'),
    address: g('address'), linkedin: g('linkedin'), github: g('github'), summary: g('summary'),
    edu: [...document.querySelectorAll('#edu-list .block-item')].map(el => ({
      inst: el.querySelector('.edu-inst')?.value || '', loc: el.querySelector('.edu-loc')?.value || '',
      deg:  el.querySelector('.edu-deg')?.value  || '', period: el.querySelector('.edu-period')?.value || ''
    })),
    exp: [...document.querySelectorAll('#exp-list .block-item')].map(el => ({
      co:   el.querySelector('.exp-co')?.value   || '', loc:    el.querySelector('.exp-loc')?.value    || '',
      role: el.querySelector('.exp-role')?.value || '', period: el.querySelector('.exp-period')?.value || '',
      desc: el.querySelector('.exp-desc')?.value || '', ach:    el.querySelector('.exp-ach')?.value    || ''
    })),
    proj: [...document.querySelectorAll('#proj-list .block-item')].map(el => ({
      name: el.querySelector('.proj-name')?.value || '', tech: el.querySelector('.proj-tech')?.value || '',
      desc: el.querySelector('.proj-desc')?.value || '', ach:  el.querySelector('.proj-ach')?.value  || ''
    })),
    skills: skillData
  };
}

function loadCVData(data) {
  if (!data) return;
  const s = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  s('name', data.name);
  s('jobtitle', data.jobtitle);
  s('email', data.email);
  s('mobile', data.mobile);
  s('address', data.address);
  s('linkedin', data.linkedin);
  s('github', data.github);
  s('summary', data.summary);

  ['lang', 'tech', 'hard', 'soft'].forEach(k => {
    skillData[k] = data.skills ? [...(data.skills[k] || [])] : [];
  });
  renderSkills();

  const clearList = id => { const el = document.getElementById(id); if (el) el.innerHTML = ''; };
  clearList('edu-list'); clearList('exp-list'); clearList('proj-list');

  if (data.edu) data.edu.forEach(e => addBlockWithData('edu', e));
  if (data.exp) data.exp.forEach(e => addBlockWithData('exp', e));
  if (data.proj) data.proj.forEach(p => addBlockWithData('proj', p));
}

function applyAIUpdates(updates) {
  if (!updates) return;
  const curr = getData();
  const merged = { ...curr };

  ['name', 'jobtitle', 'email', 'mobile', 'address', 'linkedin', 'github', 'summary'].forEach(k => {
    if (updates[k] !== undefined) merged[k] = updates[k];
  });

  ['edu', 'exp', 'proj'].forEach(k => {
    if (Array.isArray(updates[k])) merged[k] = updates[k];
  });

  if (updates.skills) {
    ['lang', 'tech', 'hard', 'soft'].forEach(k => {
      if (Array.isArray(updates.skills[k])) merged.skills[k] = updates.skills[k];
    });
  }

  loadCVData(merged);
  updatePreviews();
  
  document.querySelectorAll('.panel.active .card').forEach(el => {
    el.style.transition = 'background-color 0.3s';
    el.style.backgroundColor = 'rgba(184,150,12,0.1)';
    setTimeout(() => { el.style.backgroundColor = ''; }, 400);
  });
}

function resetData() {
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    loadCVData({
      name: '', jobtitle: '', email: '', mobile: '', address: '', linkedin: '', github: '', summary: '',
      edu: [], exp: [], proj: [],
      skills: { lang: [], tech: [], hard: [], soft: [] }
    });
    updatePreviews();
    showToast('Data cleared!');
  }
}

// ── UI RENDERING & NAVIGATION ────────────────────────────────────────────────

const panels = ['header', 'summary', 'education', 'experience', 'projects', 'skills'];
function sw(name, el) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  const pfill = document.getElementById('pfill');
  if (pfill) pfill.style.width = ((panels.indexOf(name) + 1) / panels.length * 100) + '%';
  if (window.innerWidth <= 900) {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('open');
  }
}

function renderTemplateCards() {
  const container = document.getElementById('tpl-cards-container');
  if (!container || !cvTemplates) return;
  container.innerHTML = '';
  Object.values(cvTemplates).forEach(tpl => {
    const card = document.createElement('div');
    card.className = `tpl-card ${currentTemplate === tpl.id ? 'selected' : ''}`;
    card.id = `tpl-${tpl.id}`;
    card.onclick = () => setTemplate(tpl.id);
    card.onmouseenter = () => showLargePreview(tpl.id);
    card.onmouseleave = () => hideLargePreview();
    card.innerHTML = `
      <div class="tpl-card-name">${tpl.name}</div>
      <div class="tpl-card-desc">${tpl.desc}</div>
      <div class="tpl-preview-container">
         <canvas id="preview-${tpl.id}" class="tpl-preview-canvas"></canvas>
      </div>
    `;
    container.appendChild(card);
  });
}

function setTemplate(t) {
  currentTemplate = t;
  document.querySelectorAll('.tpl-card').forEach(c => c.classList.remove('selected'));
  const card = document.getElementById(`tpl-${t}`);
  if (card) card.classList.add('selected');
  updatePreviews();
}

function showLargePreview(tplId) {
  const sourceCanvas = document.getElementById(`preview-${tplId}`);
  const tooltip = document.getElementById('preview-tooltip');
  const tooltipCanvas = document.getElementById('preview-tooltip-canvas');
  if (sourceCanvas && tooltip && tooltipCanvas) {
    tooltipCanvas.width = sourceCanvas.width;
    tooltipCanvas.height = sourceCanvas.height;
    const ctx = tooltipCanvas.getContext('2d');
    ctx.clearRect(0, 0, tooltipCanvas.width, tooltipCanvas.height);
    ctx.drawImage(sourceCanvas, 0, 0);
    tooltip.classList.add('show');
  }
}

function hideLargePreview() {
  const tooltip = document.getElementById('preview-tooltip');
  if (tooltip) tooltip.classList.remove('show');
}

function renderSkills() {
  ['lang', 'tech', 'hard', 'soft'].forEach(k => {
    const container = document.getElementById(k + '-tags');
    if (container) {
      container.innerHTML = (skillData[k] || []).map((s, i) =>
        `<div class="skill-chip">${s}<button onclick="rmSkill('${k}',${i}); updatePreviews();">×</button></div>`).join('');
    }
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (t) {
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }
}

// ── DYNAMIC SECTION HANDLING ─────────────────────────────────────────────────

let eduN = 0, expN = 0, prjN = 0;
function addBlock(type) {
  const lists  = { edu: 'edu-list', exp: 'exp-list', proj: 'proj-list' };
  const labels = { edu: 'Degree',   exp: 'Role',     proj: 'Project'   };
  const n = type === 'edu' ? ++eduN : type === 'exp' ? ++expN : ++prjN;
  const d = document.createElement('div');
  d.className = 'card block-item';
  if (type === 'edu') {
    d.innerHTML = `<div class="block-head"><span class="block-tag">${labels[type]} #${n}</span><button class="rm-btn" onclick="this.closest('.block-item').remove(); updatePreviews();">×</button></div>
    <div class="field-row"><div class="field"><label>Institution</label><input class="edu-inst"/></div><div class="field"><label>Location</label><input class="edu-loc"/></div></div>
    <div class="field-row"><div class="field"><label>Degree</label><input class="edu-deg"/></div><div class="field"><label>Period</label><input class="edu-period"/></div></div>`;
  } else if (type === 'exp') {
    d.innerHTML = `<div class="block-head"><span class="block-tag">${labels[type]} #${n}</span><button class="rm-btn" onclick="this.closest('.block-item').remove(); updatePreviews();">×</button></div>
    <div class="field-row"><div class="field"><label>Company</label><input class="exp-co"/></div><div class="field"><label>Location</label><input class="exp-loc"/></div></div>
    <div class="field-row"><div class="field"><label>Role</label><input class="exp-role"/></div><div class="field"><label>Period</label><input class="exp-period"/></div></div>
    <div class="field-row single"><div class="field"><label>Description</label><textarea class="exp-desc" rows="3"></textarea></div></div>
    <div class="field-row single"><div class="field"><label>Achievements</label><textarea class="exp-ach" rows="2"></textarea></div></div>`;
  } else {
    d.innerHTML = `<div class="block-head"><span class="block-tag">${labels[type]} #${n}</span><button class="rm-btn" onclick="this.closest('.block-item').remove(); updatePreviews();">×</button></div>
    <div class="field-row"><div class="field"><label>Project Name</label><input class="proj-name"/></div><div class="field"><label>Technologies</label><input class="proj-tech"/></div></div>
    <div class="field-row single"><div class="field"><label>Description</label><textarea class="proj-desc" rows="2"></textarea></div></div>
    <div class="field-row single"><div class="field"><label>Key Achievements</label><textarea class="proj-ach" rows="2"></textarea></div></div>`;
  }
  const listEl = document.getElementById(lists[type]);
  if (listEl) {
    listEl.appendChild(d);
    initListeners();
  }
}

function addBlockWithData(type, data) {
  addBlock(type);
  const list = document.getElementById(`${type}-list`);
  const last = list.lastElementChild;
  if (!last) return;
  if (type === 'edu') {
    last.querySelector('.edu-inst').value = data.inst || '';
    last.querySelector('.edu-loc').value = data.loc || '';
    last.querySelector('.edu-deg').value = data.deg || '';
    last.querySelector('.edu-period').value = data.period || '';
  } else if (type === 'exp') {
    last.querySelector('.exp-co').value = data.co || '';
    last.querySelector('.exp-loc').value = data.loc || '';
    last.querySelector('.exp-role').value = data.role || '';
    last.querySelector('.exp-period').value = data.period || '';
    last.querySelector('.exp-desc').value = data.desc || '';
    last.querySelector('.exp-ach').value = data.ach || '';
  } else if (type === 'proj') {
    last.querySelector('.proj-name').value = data.name || '';
    last.querySelector('.proj-tech').value = data.tech || '';
    last.querySelector('.proj-desc').value = data.desc || '';
    last.querySelector('.proj-ach').value = data.ach || '';
  }
}

function addSkill(k) {
  const i = document.getElementById(k + '-in');
  const v = i.value.trim();
  if (v) {
    if (!skillData[k]) skillData[k] = [];
    skillData[k].push(v);
    i.value = '';
    renderSkills();
    updatePreviews();
  }
}

function rmSkill(k, i) {
  if (skillData[k]) {
    skillData[k].splice(i, 1);
    renderSkills();
  }
}

// ── PREVIEW & EXPORT LOGIC ───────────────────────────────────────────────────

let previewTimeout = null;
const activeRenderTasks = {};

async function updatePreviews() {
  if (previewTimeout) clearTimeout(previewTimeout);
  
  previewTimeout = setTimeout(async () => {
    if (!cvTemplates || !window['pdfjs-dist/build/pdf']) return;
    const d = getData();
    const { jsPDF } = window.jspdf;

    for (const tpl of Object.values(cvTemplates)) {
      try {
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        tpl.render(doc, d);
        const pdfOutput = doc.output('arraybuffer');

        const pdf  = await pdfjsLib.getDocument({ data: pdfOutput }).promise;
        const page = await pdf.getPage(1);

        const canvas = document.getElementById(`preview-${tpl.id}`);
        if (!canvas) continue;

        const viewport       = page.getViewport({ scale: 1 });
        const scale          = 800 / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        canvas.width  = scaledViewport.width;
        canvas.height = scaledViewport.height;

        if (activeRenderTasks[tpl.id]) {
          try { await activeRenderTasks[tpl.id].cancel(); } catch (e) {}
        }

        const renderContext = { canvasContext: canvas.getContext('2d'), viewport: scaledViewport };
        const renderTask = page.render(renderContext);
        activeRenderTasks[tpl.id] = renderTask;
        
        await renderTask.promise;
        delete activeRenderTasks[tpl.id];
      } catch (e) {
        if (e.name !== 'RenderingCancelledException') {
          console.error(`Preview error for ${tpl.id}:`, e);
        }
      }
    }
  }, 250);
}

function exportPDF() {
  showToast('Generating PDF…');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const d = getData();
  if (cvTemplates && cvTemplates[currentTemplate]) {
    cvTemplates[currentTemplate].render(doc, d);
  } else {
    console.error('Unknown template', currentTemplate);
  }
  doc.save((d.name || 'CV').replace(/\s+/g, '_') + '_CV.pdf');
  showToast('Exported successfully!');
}

function exportData() {
  const data = getData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (data.name || 'CV_Data').replace(/\s+/g, '_') + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data exported!');
}

// ── FILE IMPORT & EXTRACTION LOGIC ──────────────────────────────────────────

async function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const isPDF = file.name.toLowerCase().endsWith('.pdf');
  const reader = new FileReader();

  if (isPDF) {
    showToast('Extracting text from PDF...');
    reader.onload = async (e) => {
      try {
        const text = await extractTextFromPDF(e.target.result);
        let data;
        
        // The secure AI proxy handles the API key and request
        showToast('✨ AI is analyzing your PDF...');
        try {
            const currentData = getData();
            const { updates } = await callAIProxy(text, currentData);
            if (updates) {
                const data = { ...currentData, ...updates };
                loadCVData(data);
                showToast('✅ AI import complete! Please review your data.');
            } else {
                throw new Error('No updates returned');
            }
        } catch (aiErr) {
            console.warn('AI parsing failed, falling back to heuristic parser:', aiErr);
            showToast('⚠️ AI failed — using fallback parser...');
            const data = parseCVTextFromRaw(text);
            loadCVData(data);
            showToast('Imported from PDF! (Verify your data)');
        }
        
        updatePreviews();
      } catch (err) {
        console.error('PDF parsing error:', err);
        alert('Could not parse this PDF. Please try a different one or use JSON.');
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        loadCVData(data);
        updatePreviews();
        showToast('Data imported successfully!');
      } catch (err) {
        console.error('JSON parsing error:', err);
        alert('Invalid JSON CV data file.');
      }
    };
    reader.readAsText(file);
  }

  event.target.value = '';
}

async function extractTextFromPDF(arrayBuffer) {
  if (!pdfjsLib) throw new Error('PDF.js not loaded');
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const structuredLines = [];
  let fullText = '';
  let pageYOffset = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();

    const items = content.items
      .filter(item => item.str && item.str.trim())
      .sort((a, b) => {
        const yDiff = b.transform[5] - a.transform[5];
        if (Math.abs(yDiff) > 3) return yDiff;
        return a.transform[4] - b.transform[4];
      });

    const lineGroups = [];
    let currentGroup = null;
    for (const item of items) {
      const y = item.transform[5];
      const x = item.transform[4];
      const fontSize = Math.abs(item.transform[3]) || 10;
      if (!currentGroup || Math.abs(y - currentGroup.y) > 3) {
        currentGroup = { y, pageY: pageYOffset + (viewport.height - y), texts: [], fontSize };
        lineGroups.push(currentGroup);
      }
      currentGroup.texts.push({ str: item.str, x, fontSize });
      if (fontSize > currentGroup.fontSize) currentGroup.fontSize = fontSize;
    }

    for (const group of lineGroups) {
      group.texts.sort((a, b) => a.x - b.x);
      let lineText = '';
      let lastX = null;
      for (const t of group.texts) {
        if (lastX !== null && t.x - lastX > 8) lineText += ' ';
        lineText += t.str;
        lastX = t.x + (t.str.length * t.fontSize * 0.5);
      }
      lineText = lineText.trim();
      if (lineText) {
        structuredLines.push({ text: lineText, fontSize: group.fontSize, pageY: group.pageY });
        fullText += lineText + '\n';
      }
    }
    pageYOffset += viewport.height;
  }

  extractTextFromPDF._lastStructured = structuredLines;
  return fullText;
}

function parseCVTextFromRaw(text) {
  const data = {
    name: '', jobtitle: '', email: '', mobile: '', address: '',
    linkedin: '', github: '', summary: '',
    edu: [], exp: [], proj: [],
    skills: { lang: [], tech: [], hard: [], soft: [] }
  };

  const emailRx    = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
  const phoneRx    = /(?:\+?[\d]{1,3}[\s\-.]?)?(?:\(?[\d]{2,4}\)?[\s\-.]?){2,}[\d]{3,6}/;
  const linkedinRx = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w\-]+/i;
  const githubRx   = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w\-]+/i;
  const streetRx   = /\b(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Blvd|Boulevard|Way|Court|Ct|Place|Pl|Square|Sq|District|City|Town|Cairo|Giza|Alexandria|Maadi|Nasr|Heliopolis|Zamalek|Dokki)\b/i;

  data.email    = text.match(emailRx)?.[0]    || '';
  data.mobile   = text.match(phoneRx)?.[0]    || '';
  data.linkedin = text.match(linkedinRx)?.[0] || '';
  data.github   = text.match(githubRx)?.[0]   || '';

  const labelPrefixRx = /^(?:current\s+)?(?:address|date of birth|dob|birth\s*date|nationality|gender|sex|marital\s*status|religion|military\s*status|national\s*id|national\s*number|passport|blood\s*type|place of birth|driving\s*licen[cs]e|languages?|phone|mobile|tel(?:ephone)?|email|e-mail|linkedin|github|website|portfolio)\s*[:：\-]/i;

  const addrLabelMatch = text.match(/(?:current\s+)?address\s*[:：]\s*(.+)/i);
  if (addrLabelMatch) data.address = addrLabelMatch[1].trim().substring(0, 100);

  const cleanBullet = l => l.trim().replace(/^[•●■▪▫◦‣➤➢➣»→\-\*]+\s*/, '').trim();
  const rawLines = text.split('\n').map(cleanBullet).filter(l => l.length > 0);

  const SECTION_MAP = {
    summary: ['summary', 'profile', 'objective', 'career objective', 'professional summary', 'about me', 'about', 'overview', 'personal statement', 'statement', 'bio'],
    exp:     ['experience', 'work experience', 'professional experience', 'work history', 'employment', 'employment history', 'internship', 'internships', 'career history', 'professional background', 'roles'],
    edu:     ['education', 'educational background', 'academic background', 'academic qualifications', 'qualifications', 'studies', 'academic', 'academics', 'degrees', 'certifications', 'certification', 'courses', 'training'],
    proj:    ['projects', 'key projects', 'personal projects', 'open source', 'portfolio', 'notable projects', 'selected projects'],
    skills:  ['skills', 'technical skills', 'core skills', 'key skills', 'competencies', 'expertise', 'technologies', 'tools', 'abilities', 'proficiencies', 'programming languages', 'languages', 'soft skills', 'hard skills']
  };

  const normLine = l => l.toLowerCase().replace(/[:\s]+$/, '').trim();

  function detectSection(line) {
    const n = normLine(line);
    for (const [key, kws] of Object.entries(SECTION_MAP)) {
      for (const kw of kws) {
        if (n === kw || n.startsWith(kw + ' ') || n.startsWith(kw + ':')) return key;
      }
    }
    return null;
  }

  const dateRangeRx  = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z.]*\s*)?\d{4}\s*(?:[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z.]*\s*)?(?:\d{4}|Present|Now|Current|Till date))?/i;
  const periodLineRx = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z.]*[\s,]*)?\d{4}\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z.]*[\s,]*)?(?:\d{4}|Present|Now|Current|Till date)/i;
  const companyRx    = /inc\.|llc|ltd|limited|corp\.|corporation|company|co\.|consulting|solutions|technologies|tech\b|group\b|agency|studio|labs/i;
  const projHeaderRx = /^(?:[A-Za-z][\w\s–—:|]{2,65}|[\w-]+(?:\s[\w-]+){0,10})$/;

  function isExpHeader(l) {
    if (l.length < 3 || labelPrefixRx.test(l)) return false;
    if (periodLineRx.test(l)) return true;
    if (companyRx.test(l))    return true;
    if (l.length < 55 && l === l.toUpperCase() && l.trim().split(' ').length >= 2) return true;
    return false;
  }

  let currentSection = null;
  const sectionContent = { summary: [], edu: [], exp: [], proj: [], skills: [] };
  const headerLines = [];

  for (const line of rawLines) {
    let sec = detectSection(line);
    
    if (!sec && currentSection === 'skills') {
      const low = line.toLowerCase();
      if (isExpHeader(line)) sec = 'exp';
      else if (projHeaderRx.test(line) && (line.includes('::') || low.includes(': link') || low.includes(': demo') || low.includes(':::'))) sec = 'proj';
    }

    if (sec) { currentSection = sec; continue; }
    if (currentSection) sectionContent[currentSection].push(line);
    else headerLines.push(line);
  }

  function isSafeIdentityLine(l) {
    return !l.match(emailRx) && !l.match(phoneRx) &&
           !l.match(linkedinRx) && !l.match(githubRx) &&
           !l.match(streetRx) && !labelPrefixRx.test(l) &&
           l.length > 2 && l.length < 80;
  }

  const structured = extractTextFromPDF._lastStructured || [];
  if (structured.length > 0) {
    const topItems = structured.slice(0, 15);
    const maxFont  = Math.max(...topItems.map(l => l.fontSize));
    const safe     = topItems.filter(l => isSafeIdentityLine(l.text));
    const bySize   = safe.filter(l => l.fontSize >= maxFont * 0.85);

    if (bySize.length > 0)  data.name = bySize[0].text.substring(0, 60);

    const afterName = safe.filter(l => l !== bySize[0] && l.fontSize >= maxFont * 0.6);
    if (!data.name && afterName.length > 0)  data.name     = afterName[0].text.substring(0, 60);
    else if (afterName.length > 0)           data.jobtitle = afterName[0].text.substring(0, 100);
  }

  if (!data.name) {
    const identityLines = headerLines.filter(isSafeIdentityLine);
    if (identityLines.length > 0) data.name     = identityLines[0].substring(0, 60);
    if (identityLines.length > 1) data.jobtitle = identityLines[1].substring(0, 100);
  }

  if (!data.address) {
    const addrLine = headerLines.find(l =>
      l.match(/,/) && !labelPrefixRx.test(l) &&
      !l.match(emailRx) && !l.match(phoneRx) && !l.match(linkedinRx) &&
      l !== data.name && l !== data.jobtitle && l.length > 5
    );
    if (addrLine) data.address = addrLine.substring(0, 100);
  }

  data.summary = sectionContent.summary.join(' ').replace(/\s+/g, ' ').trim();

  const degreeRx    = /bachelor|master|msc|bsc|b\.sc|m\.sc|phd|ph\.d|diploma|associate|high school|secondary|a-level|o-level|gcse|hnd|hnc/i;
  const uniRx       = /university|college|institute|school|academy|polytechnic|faculty|conservatory/i;

  if (sectionContent.edu.length) {
    let cur = null;
    for (const l of sectionContent.edu) {
      if (labelPrefixRx.test(l)) continue;
      const isInstHeader = uniRx.test(l) || degreeRx.test(l) || (l.length < 70 && l === l.toUpperCase() && l.length > 3);
      const hasDate = dateRangeRx.test(l);
      if (isInstHeader && !hasDate) {
        if (cur) data.edu.push(cur);
        cur = { inst: l, loc: '', deg: '', period: '' };
      } else if (cur) {
        if (hasDate && !cur.period) cur.period = l.match(dateRangeRx)?.[0].trim() || l;
        else if (degreeRx.test(l) && !cur.deg) cur.deg = l;
        else if (!cur.deg) cur.deg = l;
        else cur.deg += ' ' + l;
      } else {
        cur = { inst: l, loc: '', deg: '', period: '' };
      }
    }
    if (cur) data.edu.push(cur);
  }

  if (sectionContent.exp.length) {
    let cur = null;
    for (const l of sectionContent.exp) {
      if (labelPrefixRx.test(l)) continue;
      const hasPeriod = dateRangeRx.test(l) || periodLineRx.test(l);
      if (isExpHeader(l)) {
        if (cur) data.exp.push(cur);
        cur = { co: '', loc: '', role: '', period: '', desc: '', ach: '' };
        if (hasPeriod) {
          cur.period = l.match(dateRangeRx)?.[0]?.trim() || l;
          const remainder = l.replace(cur.period, '').replace(/[-–—|,]/g, '').trim();
          if (remainder) cur.co = remainder;
        } else {
          cur.co = l;
        }
      } else if (cur) {
        if (hasPeriod && !cur.period) {
          cur.period = l.match(dateRangeRx)?.[0]?.trim() || l;
          const remainder = l.replace(cur.period, '').replace(/[-–—|,]/g, '').trim();
          if (remainder && !cur.role) cur.role = remainder;
        } else if (!cur.role) {
          cur.role = l;
        } else {
          const achRx = /^(?:led|achieved|increased|reduced|improved|built|created|designed|developed|launched|delivered|saved|generated|managed|grew|boosted|cut|drove)/i;
          if (achRx.test(l)) cur.ach += (cur.ach ? '\n' : '') + l;
          else cur.desc += (cur.desc ? '\n' : '') + l;
        }
      } else {
        cur = { co: l, loc: '', role: '', period: '', desc: '', ach: '' };
      }
    }
    if (cur) data.exp.push(cur);
  }

  if (sectionContent.proj.length) {
    let cur = null;
    const techLineRx = /(?:built with|tech(?:nologies)?(?:\s*used)?|stack|using|powered by)[:\s\-]/i;
    for (const l of sectionContent.proj) {
      if (labelPrefixRx.test(l)) continue;
      const low = l.toLowerCase();
      const isStrongHeader = l.includes('::') || low.includes(': link') || low.includes(': demo') || (l.includes('–') && l.length < 65);
      const isLabel = techLineRx.test(l) || /^(?:description|about|overview|summary|key\s+achievements?|achievements?)[:\s\-]/i.test(l);
      const seemsHeader = !isLabel && (isStrongHeader || (l.length < 70 && projHeaderRx.test(l) && !l.match(dateRangeRx)) || (l.toUpperCase() === l && l.length > 5));

      if (seemsHeader) {
        if (cur) data.proj.push(cur);
        cur = { name: l, tech: '', desc: '', ach: '' };
      } else if (cur) {
        if (techLineRx.test(l)) {
          const val = l.replace(techLineRx, '').trim();
          if (val) cur.tech += (cur.tech ? ', ' : '') + val;
        } else {
          cur.desc += (cur.desc ? ' ' : '') + l;
        }
      } else {
        cur = { name: l, tech: '', desc: '', ach: '' };
      }
    }
    if (cur) data.proj.push(cur);
  }

  if (sectionContent.skills.length) {
    const SUB_LABEL_MAP = {
      lang: [/^(?:spoken|human|natural|foreign)?\s*languages?\s*[:：]/i, /^language\s+proficiency\s*[:：]/i],
      tech: [/^(?:programming\s+)?languages?\s*[:：]/i, /^(?:coding|scripting)\s+languages?\s*[:：]/i, /^frameworks?(?:\s*[&+]\s*libraries?)?\s*[:：]/i, /^libraries?\s*[:：]/i, /^databases?(?:\s*[&+]\s*storage)?\s*[:：]/i, /^cloud(?:\s*[&+]\s*devops)?\s*[:：]/i, /^devops(?:\s*[&+]\s*tools?)?\s*[:：]/i, /^tools?(?:\s*[&+]\s*technologies?)?\s*[:：]/i, /^technologies\s*[:：]/i, /^software\s*[:：]/i, /^platforms?\s*[:：]/i, /^web\s*(?:development|technologies?)\s*[:：]/i, /^backend\s*[:：]/i, /^frontend\s*[:：]/i, /^mobile\s*[:：]/i, /^testing\s*[:：]/i, /^version\s+control\s*[:：]/i, /^other\s+(?:tech|technical|tools?)\s*[:：]/i],
      soft: [/^soft\s+skills?\s*[:：]/i, /^interpersonal\s*[:：]/i, /^personal\s+skills?\s*[:：]/i, /^transferable\s+skills?\s*[:：]/i],
      hard: [/^hard\s+skills?\s*[:：]/i, /^domain\s+skills?\s*[:：]/i, /^core\s+skills?\s*[:：]/i, /^professional\s+skills?\s*[:：]/i, /^other\s+skills?\s*[:：]/i],
    };

    const LANG_KW      = ['arabic', 'english', 'french', 'german', 'spanish', 'italian', 'chinese', 'mandarin', 'japanese', 'russian', 'portuguese', 'hindi', 'urdu', 'turkish', 'korean', 'dutch', 'swedish', 'danish', 'norwegian', 'polish', 'greek', 'hebrew', 'persian', 'farsi', 'malay', 'indonesian', 'thai', 'vietnamese'];
    const PROG_LANG_RX = /\b(?:javascript|js|typescript|ts|python|java|c\+\+|c#|c\b|ruby|golang|go|rust|swift|kotlin|php|scala|dart|elixir|perl|matlab|bash|shell|sh|powershell|sql|pl\/sql|t-sql|nosql|html5?|css3?|sass|scss|less|graphql|xml|json|yaml|r\b|fortran|cobol|assembly|vba|groovy|haskell|lua|julia|nim|zig)\b/i;
    const TECH_RX      = /\b(?:react(?:\.js)?|angular(?:js)?|vue(?:\.js)?|node(?:\.js)?|express(?:\.js)?|next(?:\.js)?|nuxt(?:\.js)?|svelte|gatsby|django|flask|fastapi|spring(?:\s*boot)?|laravel|rails|symfony|asp\.net|\.net|ef\s*core|hibernate|sqlalchemy|docker|kubernetes|k8s|aws|azure|gcp|google\s*cloud|firebase|heroku|vercel|netlify|git|github|gitlab|bitbucket|jira|confluence|trello|postman|swagger|insomnia|linux|ubuntu|debian|centos|macos|windows\s*server|nginx|apache|iis|postgresql|mysql|mariadb|sqlite|mongodb|redis|cassandra|dynamodb|elasticsearch|neo4j|influxdb|rabbitmq|kafka|celery|webpack|vite|babel|eslint|jest|mocha|chai|cypress|selenium|playwright|tensorflow|pytorch|keras|scikit.learn|pandas|numpy|matplotlib|seaborn|opencv|nltk|spacy|hugging\s*face|tableau|power\s*bi|looker|excel|word|powerpoint|google\s*sheets|figma|sketch|adobe\s*xd|photoshop|illustrator|indesign|after\s*effects|premiere|blender|unity|unreal|agile|scrum|kanban|ci\/cd|jenkins|github\s*actions|circleci|travis|ansible|terraform|chef|puppet|prometheus|grafana|datadog|splunk|supabase|prisma|typeorm|mongoose|axios|redux|zustand|tailwind|bootstrap|material\s*ui|mui|chakra|shadcn|three\.js|d3(?:\.js)?|socket\.io|rest(?:ful)?\s*api|microservices|oop|solid|tdd|bdd|data\s*structures|algorithms?|microsoft\s*office|ms\s*office|office\s*365|outlook|access|data\s*entry|5g\s*networks?)\b/i;
    const SOFT_SKILL_RX = /\b(?:communication|leadership|teamwork|team\s*work|problem[- ]solving|critical\s*thinking|creativity|creative|adaptability|time\s*management|collaboration|interpersonal|presentation|negotiation|analytical|detail[- ]oriented|self[- ]motivated|multitasking|work\s*ethic|empathy|conflict\s*resolution|decision[- ]making|planning|organization|mentoring|coaching|fast[- ]learner|quick\s*learner|proactive|initiative|flexibility|patience|resilience|accountability|integrity|punctuality|mentorship|supervision|supervising|management|managing\s*projects|peer\s*management)\b/i;

    const stripProficiency = s => s.replace(/\s*[\(\[].+?[\)\]]/g, '').replace(/\s*[-–—]\s*(?:native|fluent|advanced|intermediate|beginner|basic|professional|c[12]|b[12]|a[12])\b.*/i, '').trim();

    function detectSubLabel(line) {
      for (const [bucket, patterns] of Object.entries(SUB_LABEL_MAP)) {
        for (const rx of patterns) {
          if (rx.test(line)) return { bucket, value: line.replace(rx, '').trim() };
        }
      }
      return null;
    }

    function classifySkill(skill) {
      const low = skill.toLowerCase();
      if (LANG_KW.some(lk => low === lk || low.startsWith(lk + ' ') || low.startsWith(lk + '('))) return 'lang';
      if (SOFT_SKILL_RX.test(skill)) return 'soft';
      if (PROG_LANG_RX.test(skill) || TECH_RX.test(skill)) return 'tech';
      return 'hard';
    }

    function isProbablyDescription(s) {
      if (s.length > 80) return true;
      const words = s.split(/\s+/);
      if (words.length > 6) return true;
      if (/^(?:implemented|developed|designed|built|created|optimized|refactored|collaborated|improved|contributed|managed|led|handled|conducted|performed|achieved|increased|reduced|delivered|launched|integrated|used|utilizing|configuring|deploying|built|organized|providing|featuring|supports|monitoring|focusing|enhancing|replacing|checkout|modernization|showcase|include|organization|Designed|Developed|Improved|Enhanced|Built|Organized|Contributed|Feature|Key|Achievements|consistency|modernization|Design|Refactoring)\b/i.test(s)) return true;
      if (words.length > 2 && /\b(?:to|with|for|using|through|by|on|at|from|into|compared|instead|scratch|future|such|more|smooth|engaging|visual|structure|consistency|customization|seamless|interactive|efficiently|reliability|stability|performance|UX|UI|polish)\b/i.test(s)) return true;
      if (/\b(?:DemoLink|Link|http|www|::|–)\b/i.test(s) && words.length > 1) return true;
      return false;
    }

    const seen = new Set();
    function pushSkill(bucket, raw) {
      if (isProbablyDescription(raw)) return;
      const cleaned = bucket === 'lang' ? stripProficiency(raw) : raw;
      const key = cleaned.toLowerCase();
      if (!cleaned || cleaned.length < 2 || seen.has(key)) return;
      seen.add(key);
      data.skills[bucket].push(cleaned);
    }

    let forceBucket = null;
    for (const line of sectionContent.skills) {
      if (labelPrefixRx.test(line)) continue;
      const sub = detectSubLabel(line);
      if (sub) {
        forceBucket = sub.bucket;
        if (sub.value) {
          sub.value.split(/[,|•·●▪▫◦‣➤➢➣»→\/\\]| and | & /i).map(s => s.trim()).filter(s => s.length > 1 && s.length < 60).forEach(s => pushSkill(forceBucket, s));
        }
        continue;
      }
      const STOPWORDS = /^(and|or|the|of|in|at|by|to|an|as|with|on|for|&|etc\.?|other|various|including|such|both|also|all)$/i;
      const tokens = line.split(/[,|•·●▪▫◦‣➤➢➣»→\/\\]| and | & /i).map(s => s.trim()).filter(s => s.length > 1 && s.length < 60 && !STOPWORDS.test(s));
      for (const token of tokens) {
        const regexBucket = classifySkill(token);
        const bucket = regexBucket !== 'hard' ? regexBucket : (forceBucket ?? 'hard');
        pushSkill(bucket, token);
      }
    }
  }

  const trim = s => (s || '').replace(/\s+/g, ' ').trim();
  data.name     = trim(data.name).substring(0, 60);
  data.jobtitle = trim(data.jobtitle).substring(0, 100);
  data.address  = trim(data.address).substring(0, 100);
  data.summary  = trim(data.summary).substring(0, 1000);

  return data;
}

function openPasteModal() {
  const modal = document.getElementById('paste-modal');
  if (modal) {
    modal.classList.add('open');
    document.getElementById('paste-area')?.focus();
  }
}

function closePasteModal() {
  document.getElementById('paste-modal')?.classList.remove('open');
}

async function importFromText() {
  const area = document.getElementById('paste-area');
  const text = area ? area.value.trim() : '';
  if (!text) return;

  showToast('✨ AI is analyzing your text...');
  const currentData = getData();
  try {
      const { updates } = await callAIProxy(text, currentData);
      if (updates) {
          const data = { ...currentData, ...updates };
          loadCVData(data);
          updatePreviews();
          closePasteModal();
          showToast('✅ AI import complete! Please review your data.');
          area.value = '';
          return;
      }
  } catch (aiErr) {
      console.warn('AI parsing failed, falling back to heuristic parser:', aiErr);
      showToast('⚠️ AI failed — using fallback parser...');
  }

  showToast('Parsing pasted text...');
  try {
    const data = parseCVTextFromRaw(text);
    loadCVData(data);
    updatePreviews();
    closePasteModal();
    showToast('Imported! Use AI Chat to clean anything up.');
    area.value = '';
  } catch (err) {
    console.error('Text parsing error:', err);
    alert('Error parsing text. Please ensure it follows a standard CV format.');
  }
}

// ── AI ASSISTANT CORE ────────────────────────────────────────────────────────

async function callAIAssistant(userMsg, currentCV, apiKey, endpoint = 'https://openrouter.ai/api/v1/chat/completions', overrideModel = 'meta-llama/llama-3.3-70b-instruct:free') {
  const sysPrompt = `You are a helpful CV editing assistant. You view and update the user's CV data.
CURRENT CV STATE:
${JSON.stringify(currentCV, null, 2)}

INSTRUCTIONS:
1. Look at the requested changes.
2. Formulate your response as a valid JSON object ONLY. Do not use markdown fences like \`\`\`json.
3. The JSON must have exactly two keys: "reply" (a friendly string responding to the user) and "updates" (an object with ONLY the fields to change).
4. For arrays (edu, exp, proj, skills.*), provide the ENTIRE updated array you want saved.
5. If the user asks for a simple text change (e.g., "rewrite my summary"), rewrite it professionally in the updates.

DATA SCHEMA FOR ARRAYS:
- edu: [{ inst: "University Name", loc: "City, Country", deg: "Degree Name", period: "YYYY - YYYY" }]
- exp: [{ co: "Company Name", loc: "City", role: "Job Title", period: "YYYY - YYYY", desc: "Short description", ach: "Bullet points of achievements" }]
- proj: [{ name: "Project Name", tech: "React, Node", desc: "Short description", ach: "Bullet points" }]`;

  const messages = [
    { role: 'system', content: sysPrompt },
    ...chatHistory.slice(-4), 
    { role: 'user', content: userMsg }
  ];

  let modelsToTry = [overrideModel];
  if (endpoint.toLowerCase().includes('openrouter.ai')) {
      modelsToTry = ['openrouter/free', 'google/gemini-2.0-pro-exp-02-05:free', 'google/gemini-2.5-flash-free', 'meta-llama/llama-3.1-8b-instruct:free', 'qwen/qwen-2.5-7b-instruct:free', 'mistralai/mistral-nemo-free', 'google/gemma-2-27b-it:free'];
      modelsToTry = [...new Set([overrideModel, ...modelsToTry])];
  }

  let finalRes = null;
  let finalTxt = '';
  let parsedJson = null;

  for (const model of modelsToTry) {
      try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': window.location.href,
              'X-Title': 'GenCV Assistant'
            },
            body: JSON.stringify({
              model: model,
              messages: messages,
              temperature: 0.1,
              response_format: { type: "json_object" }
            })
          });

          if (res.ok) {
              const json = await res.json();
              const content = json.choices?.[0]?.message?.content;
              if (content) {
                  finalRes = res;
                  const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
                  parsedJson = JSON.parse(cleaned);
                  break;
              } else {
                  finalTxt = "Model returned empty content";
              }
          } else {
              finalTxt = await res.text();
          }
      } catch(err) {
          finalTxt = err.message;
      }
  }

  if (!finalRes || !parsedJson) {
    throw new Error(`All available models failed. Last error: ${finalTxt}`);
  }

  return { reply: parsedJson.reply || "I've updated your CV.", updates: parsedJson.updates || null };
}

async function callAIProxy(userMsg, currentCV) {
  const res = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMsg, currentCV })
  });
  
  if (!res.ok) {
      if (res.status === 405 || res.status === 404) {
          throw new Error(`AI Proxy not found (405/404). If testing locally, please use 'netlify dev' or deploy to Netlify.`);
      }
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || `AI Proxy Error ${res.status}`);
  }
  
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content || '{}';
  const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const parsed = JSON.parse(cleaned);

  return { reply: parsed.reply || "I've updated your CV.", updates: parsed.updates || null };
}

// ── AI CHAT UI LOGIC ─────────────────────────────────────────────────────────

let chatHistory = [];

function updateAIKeyDot() {
  const dot1 = document.getElementById('ai-fab-dot');
  const dot2 = document.getElementById('ai-key-dot');
  const key = localStorage.getItem('genCV_chatKey');
  if (dot1) { dot1.style.background = key ? '#4ade80' : '#f87171'; }
  if (dot2) { dot2.style.background = key ? '#4ade80' : '#555'; }
}

function openAIModal() {
  const modal = document.getElementById('ai-modal');
  if (!modal) return;
  const existingKey = localStorage.getItem('genCV_chatKey');
  const existingEndpoint = localStorage.getItem('genCV_chatEndpoint') || 'https://api.openai.com/v1/chat/completions';
  const existingModel = localStorage.getItem('genCV_chatModel') || 'gpt-4o-mini';
  
  const keyInput = document.getElementById('ai-key-input');
  const epInput = document.getElementById('ai-endpoint-input');
  const modelInput = document.getElementById('ai-model-input');
  const status = document.getElementById('ai-key-status');
  
  if (keyInput) keyInput.value = existingKey ? '(key saved - paste new one to replace)' : '';
  if (epInput) epInput.value = existingEndpoint;
  if (modelInput) modelInput.value = existingModel;
  
  if (status) status.textContent = existingKey ? '✅ Provider configured.' : 'No provider configured yet.';
  if (status) status.style.color = existingKey ? '#4ade80' : '#888';
  
  modal.classList.add('open');
}

function closeAIModal() {
  document.getElementById('ai-modal')?.classList.remove('open');
}

function saveAIKey() {
  const keyInput = document.getElementById('ai-key-input');
  const epInput = document.getElementById('ai-endpoint-input');
  const modelInput = document.getElementById('ai-model-input');
  const status = document.getElementById('ai-key-status');
  const keyVal = keyInput?.value?.trim();
  const epVal = epInput?.value?.trim() || 'https://api.openai.com/v1/chat/completions';
  const modelVal = modelInput?.value?.trim() || 'gpt-4o-mini';
  
  let keyToSave = localStorage.getItem('genCV_chatKey');
  if (keyVal && !keyVal.startsWith('(key saved')) keyToSave = keyVal;
  
  if (!keyToSave) {
    if (status) { status.textContent = '⚠️ Please paste a valid API key.'; status.style.color = '#f87171'; }
    return;
  }
  
  localStorage.setItem('genCV_chatKey', keyToSave);
  localStorage.setItem('genCV_chatEndpoint', epVal);
  localStorage.setItem('genCV_chatModel', modelVal);
  
  if (status) { status.textContent = '✅ Provider saved! AI chat is ready.'; status.style.color = '#4ade80'; }
  updateAIKeyDot();
  setTimeout(closeAIModal, 1200);
}

function clearAIKey() {
  localStorage.removeItem('genCV_chatKey');
  localStorage.removeItem('genCV_chatEndpoint');
  localStorage.removeItem('genCV_chatModel');
  const status = document.getElementById('ai-key-status');
  if (status) { status.textContent = 'Provider cleared.'; status.style.color = '#888'; }
  const keyInput = document.getElementById('ai-key-input');
  if (keyInput) keyInput.value = '';
  updateAIKeyDot();
}

function toggleChat() {
  const drawer = document.getElementById('ai-chat-drawer');
  if (drawer) drawer.classList.toggle('open');
  if (drawer?.classList.contains('open') && chatHistory.length === 0) {
    if (!localStorage.getItem('genCV_chatKey')) {
      appendMessage('ai', 'Hi! Please click the ⚙️ icon above to configure your AI provider.');
    } else {
      appendMessage('ai', 'Hi! I can help you improve your CV. Try saying "Add Python to my skills".');
    }
  }
}

function clearChat() {
  document.getElementById('ai-chat-messages').innerHTML = '';
  chatHistory = [];
  appendMessage('ai', 'Chat cleared. How can I help you today?');
}

function sendSuggestion(text) {
  const input = document.getElementById('ai-chat-input');
  if (input) { input.value = text; sendChat(); }
}

function appendMessage(role, content) {
  const container = document.getElementById('ai-chat-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = `chat-bubble ${role}`;
  div.textContent = content;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  if (role !== 'typing') chatHistory.push({ role: role === 'ai' ? 'assistant' : 'user', content });
}

function showTyping() {
  const container = document.getElementById('ai-chat-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'chat-bubble ai ai-typing';
  div.id = 'ai-typing-indicator';
  div.innerHTML = '<span></span><span></span><span></span>';
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function hideTyping() {
  document.getElementById('ai-typing-indicator')?.remove();
}

async function sendChat() {
  const input = document.getElementById('ai-chat-input');
  const text = input ? input.value.trim() : '';
  if (!text) return;

  const key = localStorage.getItem('genCV_chatKey');
  const ep = localStorage.getItem('genCV_chatEndpoint') || 'https://api.openai.com/v1/chat/completions';
  const model = localStorage.getItem('genCV_chatModel') || 'gpt-4o-mini';
  
  if (!key) { openAIModal(); return; }

  input.value = '';
  input.style.height = 'auto';
  appendMessage('user', text);
  showTyping();

  try {
    const currentState = getData();
    const { reply, updates } = await callAIAssistant(text, currentState, key, ep, model);
    hideTyping();
    appendMessage('ai', reply);
    if (updates) applyAIUpdates(updates);
  } catch (err) {
    hideTyping();
    appendMessage('ai', `Error: ${err.message}.`);
  }
}

// ── UTILITIES & INITIALIZATION ───────────────────────────────────────────────

function debounce(func, wait) {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, arguments), wait);
  };
}

function initListeners() {
  document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', debounce(updatePreviews, 1000));
  });
}

window.addEventListener('beforeunload', e => { e.preventDefault(); e.returnValue = ''; });

// Expose functions for inline handlers
window.addSkill        = addSkill;
window.rmSkill         = rmSkill;
window.sw              = sw;
window.addBlock        = addBlock;
window.exportPDF       = exportPDF;
window.updatePreviews   = updatePreviews;
window.setTemplate     = setTemplate;
window.resetData       = resetData;
window.exportData      = exportData;
window.importData      = importData;
window.importFromText  = importFromText;
window.openPasteModal   = openPasteModal;
window.closePasteModal  = closePasteModal;
window.openAIModal      = openAIModal;
window.closeAIModal     = closeAIModal;
window.saveAIKey        = saveAIKey;
window.clearAIKey       = clearAIKey;
window.toggleChat       = toggleChat;
window.clearChat        = clearChat;
window.sendChat         = sendChat;
window.sendSuggestion   = sendSuggestion;

document.addEventListener('DOMContentLoaded', () => {
  loadCVData(seifData);
  renderTemplateCards();
  initListeners();
  updateAIKeyDot();
  setTimeout(updatePreviews, 500);
});
