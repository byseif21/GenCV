import { cvTemplates } from './templates/index.js';
import { seifData } from './templates/seif-data.js';

window.cvTemplates = cvTemplates;

let currentTemplate = 'seif-cv';
let pdfjsLib = window['pdfjs-dist/build/pdf'] || null;
if (pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

const skillData = { lang: [], tech: [], hard: [], soft: [] };

function renderSkills() {
  ['lang', 'tech', 'hard', 'soft'].forEach(k => {
    const container = document.getElementById(k + '-tags');
    if (container) {
      container.innerHTML = (skillData[k] || []).map((s, i) =>
        `<div class="skill-chip">${s}<button onclick="rmSkill('${k}',${i}); updatePreviews();">×</button></div>`).join('');
    }
  });
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

function initListeners() {
  document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', debounce(updatePreviews, 1000));
  });
}

function debounce(func, wait) {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, arguments), wait);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  loadCVData(seifData);
  renderTemplateCards();
  initListeners();
  setTimeout(updatePreviews, 500);
});

function loadCVData(data) {
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

function setTemplate(t) {
  currentTemplate = t;
  document.querySelectorAll('.tpl-card').forEach(c => c.classList.remove('selected'));
  const card = document.getElementById(`tpl-${t}`);
  if (card) card.classList.add('selected');
  updatePreviews();
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
        const data = parseCVTextFromRaw(text);
        loadCVData(data);
        updatePreviews();
        showToast('Imported from PDF! (Verify your data)');
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

  const structuredLines = []; // [{ text, fontSize, pageY }]
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

    // Group text spans into logical lines by Y position
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

  // Store structured lines so the parser can use font-size for name detection
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

  // ── Contact info ──────────────────────────────────────────────────────────
  const emailRx    = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
  const phoneRx    = /(?:\+?[\d]{1,3}[\s\-.]?)?(?:\(?[\d]{2,4}\)?[\s\-.]?){2,}[\d]{3,6}/;
  const linkedinRx = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w\-]+/i;
  const githubRx   = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w\-]+/i;
  const streetRx   = /\b(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Blvd|Boulevard|Way|Court|Ct|Place|Pl|Square|Sq|District|City|Town|Cairo|Giza|Alexandria|Maadi|Nasr|Heliopolis|Zamalek|Dokki)\b/i;

  data.email    = text.match(emailRx)?.[0]    || '';
  data.mobile   = text.match(phoneRx)?.[0]    || '';
  data.linkedin = text.match(linkedinRx)?.[0] || '';
  data.github   = text.match(githubRx)?.[0]   || '';

  // ── Personal-detail label prefix regex ───────────────────────────────────
  // Lines like "Date of Birth: 01/01/1995" or "Current Address: 5th Settlement"
  // must be intercepted before they pollute name / jobtitle / role fields.
  const labelPrefixRx = /^(?:current\s+)?(?:address|date of birth|dob|birth\s*date|nationality|gender|sex|marital\s*status|religion|military\s*status|national\s*id|national\s*number|passport|blood\s*type|place of birth|driving\s*licen[cs]e|languages?|phone|mobile|tel(?:ephone)?|email|e-mail|linkedin|github|website|portfolio)\s*[:：\-]/i;

  // Extract address from label if present
  const addrLabelMatch = text.match(/(?:current\s+)?address\s*[:：]\s*(.+)/i);
  if (addrLabelMatch) data.address = addrLabelMatch[1].trim().substring(0, 100);

  // ── Clean lines ───────────────────────────────────────────────────────────
  const cleanBullet = l => l.trim().replace(/^[•●■▪▫◦‣➤➢➣»→\-\*]+\s*/, '').trim();
  const rawLines = text.split('\n').map(cleanBullet).filter(l => l.length > 0);

  // ── Section keyword map ───────────────────────────────────────────────────
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

  // ── Header Detection Constants ───────────────────────────────────────────
  const dateRangeRx  = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z.]*\s*)?\d{4}\s*(?:[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z.]*\s*)?(?:\d{4}|Present|Now|Current|Till date))?/i;
  const periodLineRx = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z.]*[\s,]*)?\d{4}\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z.]*[\s,]*)?(?:\d{4}|Present|Now|Current|Till date)/i;
  const companyRx    = /inc\.|llc|ltd|limited|corp\.|corporation|company|co\.|consulting|solutions|technologies|tech\b|group\b|agency|studio|labs/i;
  // Refined for lowercase starts like "monkeytype" and complex separators
  const projHeaderRx = /^(?:[A-Za-z][\w\s–—:|]{2,65}|[\w-]+(?:\s[\w-]+){0,10})$/;

  function isExpHeader(l) {
    if (l.length < 3 || labelPrefixRx.test(l)) return false;
    if (periodLineRx.test(l)) return true;
    if (companyRx.test(l))    return true;
    if (l.length < 55 && l === l.toUpperCase() && l.trim().split(' ').length >= 2) return true;
    return false;
  }

  // ── Section grouping ──────────────────────────────────────────────────────
  let currentSection = null;
  const sectionContent = { summary: [], edu: [], exp: [], proj: [], skills: [] };
  const headerLines = [];

  for (const line of rawLines) {
    let sec = detectSection(line);
    
    // Switch out of skills if we see a clear Project or Exp header
    if (!sec && currentSection === 'skills') {
      const low = line.toLowerCase();
      if (isExpHeader(line)) sec = 'exp';
      else if (projHeaderRx.test(line) && (line.includes('::') || low.includes(': link') || low.includes(': demo') || low.includes(':::'))) sec = 'proj';
    }

    if (sec) { currentSection = sec; continue; }
    if (currentSection) sectionContent[currentSection].push(line);
    else headerLines.push(line);
  }

  // ── Name & Job Title ──────────────────────────────────────────────────────
  // A line is safe for name/title only if it contains no contact info and no label prefix
  function isSafeIdentityLine(l) {
    return !l.match(emailRx) && !l.match(phoneRx) &&
           !l.match(linkedinRx) && !l.match(githubRx) &&
           !l.match(streetRx) && !labelPrefixRx.test(l) &&
           l.length > 2 && l.length < 80;
  }

  // Strategy A: use PDF font-size metadata — largest text is almost always the name
  const structured = extractTextFromPDF._lastStructured || [];
  if (structured.length > 0) {
    const topItems = structured.slice(0, 15);
    const maxFont  = Math.max(...topItems.map(l => l.fontSize));
    const safe     = topItems.filter(l => isSafeIdentityLine(l.text));
    const bySize   = safe.filter(l => l.fontSize >= maxFont * 0.85);

    if (bySize.length > 0)  data.name = bySize[0].text.substring(0, 60);

    // Job title: next safe line with font >= 60% of max
    const afterName = safe.filter(l => l !== bySize[0] && l.fontSize >= maxFont * 0.6);
    if (!data.name && afterName.length > 0)  data.name     = afterName[0].text.substring(0, 60);
    else if (afterName.length > 0)           data.jobtitle = afterName[0].text.substring(0, 100);
  }

  // Strategy B: positional fallback from header lines
  if (!data.name) {
    const identityLines = headerLines.filter(isSafeIdentityLine);
    if (identityLines.length > 0) data.name     = identityLines[0].substring(0, 60);
    if (identityLines.length > 1) data.jobtitle = identityLines[1].substring(0, 100);
  }

  // Address fallback: a header line with a comma that isn't a label or contact field
  if (!data.address) {
    const addrLine = headerLines.find(l =>
      l.match(/,/) && !labelPrefixRx.test(l) &&
      !l.match(emailRx) && !l.match(phoneRx) && !l.match(linkedinRx) &&
      l !== data.name && l !== data.jobtitle && l.length > 5
    );
    if (addrLine) data.address = addrLine.substring(0, 100);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  data.summary = sectionContent.summary.join(' ').replace(/\s+/g, ' ').trim();

  // ── Education ─────────────────────────────────────────────────────────────
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

  // ── Experience ────────────────────────────────────────────────────────────


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

  // ── Projects ──────────────────────────────────────────────────────────────
  if (sectionContent.proj.length) {
    let cur = null;
    const techLineRx = /(?:built with|tech(?:nologies)?(?:\s*used)?|stack|using|powered by)[:\s\-]/i;
    for (const l of sectionContent.proj) {
      if (labelPrefixRx.test(l)) continue;
      
      const low = l.toLowerCase();
      // Simple header detection: strong signal OR format-based
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

  // ── Skills (sub-section-aware, then regex-classified) ────────────────────
  if (sectionContent.skills.length) {
    // ... (rest of skills remains same)

    // Maps skill sub-section label → bucket
    const SUB_LABEL_MAP = {
      lang: [
        /^(?:spoken|human|natural|foreign)?\s*languages?\s*[:：]/i,
        /^language\s+proficiency\s*[:：]/i,
      ],
      tech: [
        /^(?:programming\s+)?languages?\s*[:：]/i,
        /^(?:coding|scripting)\s+languages?\s*[:：]/i,
        /^frameworks?(?:\s*[&+]\s*libraries?)?\s*[:：]/i,
        /^libraries?\s*[:：]/i,
        /^databases?(?:\s*[&+]\s*storage)?\s*[:：]/i,
        /^cloud(?:\s*[&+]\s*devops)?\s*[:：]/i,
        /^devops(?:\s*[&+]\s*tools?)?\s*[:：]/i,
        /^tools?(?:\s*[&+]\s*technologies?)?\s*[:：]/i,
        /^technologies\s*[:：]/i,
        /^software\s*[:：]/i,
        /^platforms?\s*[:：]/i,
        /^web\s*(?:development|technologies?)\s*[:：]/i,
        /^backend\s*[:：]/i,
        /^frontend\s*[:：]/i,
        /^mobile\s*[:：]/i,
        /^testing\s*[:：]/i,
        /^version\s+control\s*[:：]/i,
        /^other\s+(?:tech|technical|tools?)\s*[:：]/i,
      ],
      soft: [
        /^soft\s+skills?\s*[:：]/i,
        /^interpersonal\s*[:：]/i,
        /^personal\s+skills?\s*[:：]/i,
        /^transferable\s+skills?\s*[:：]/i,
      ],
      hard: [
        /^hard\s+skills?\s*[:：]/i,
        /^domain\s+skills?\s*[:：]/i,
        /^core\s+skills?\s*[:：]/i,
        /^professional\s+skills?\s*[:：]/i,
        /^other\s+skills?\s*[:：]/i,
      ],
    };

    // Expanded classification regexes
    const LANG_KW      = ['arabic', 'english', 'french', 'german', 'spanish', 'italian', 'chinese', 'mandarin', 'japanese', 'russian', 'portuguese', 'hindi', 'urdu', 'turkish', 'korean', 'dutch', 'swedish', 'danish', 'norwegian', 'polish', 'greek', 'hebrew', 'persian', 'farsi', 'malay', 'indonesian', 'thai', 'vietnamese'];
    const PROG_LANG_RX = /\b(?:javascript|js|typescript|ts|python|java|c\+\+|c#|c\b|ruby|golang|go|rust|swift|kotlin|php|scala|dart|elixir|perl|matlab|bash|shell|sh|powershell|sql|pl\/sql|t-sql|nosql|html5?|css3?|sass|scss|less|graphql|xml|json|yaml|r\b|fortran|cobol|assembly|vba|groovy|haskell|lua|julia|nim|zig)\b/i;
    const TECH_RX      = /\b(?:react(?:\.js)?|angular(?:js)?|vue(?:\.js)?|node(?:\.js)?|express(?:\.js)?|next(?:\.js)?|nuxt(?:\.js)?|svelte|gatsby|django|flask|fastapi|spring(?:\s*boot)?|laravel|rails|symfony|asp\.net|\.net|ef\s*core|hibernate|sqlalchemy|docker|kubernetes|k8s|aws|azure|gcp|google\s*cloud|firebase|heroku|vercel|netlify|git|github|gitlab|bitbucket|jira|confluence|trello|postman|swagger|insomnia|linux|ubuntu|debian|centos|macos|windows\s*server|nginx|apache|iis|postgresql|mysql|mariadb|sqlite|mongodb|redis|cassandra|dynamodb|elasticsearch|neo4j|influxdb|rabbitmq|kafka|celery|webpack|vite|babel|eslint|jest|mocha|chai|cypress|selenium|playwright|tensorflow|pytorch|keras|scikit.learn|pandas|numpy|matplotlib|seaborn|opencv|nltk|spacy|hugging\s*face|tableau|power\s*bi|looker|excel|word|powerpoint|google\s*sheets|figma|sketch|adobe\s*xd|photoshop|illustrator|indesign|after\s*effects|premiere|blender|unity|unreal|agile|scrum|kanban|ci\/cd|jenkins|github\s*actions|circleci|travis|ansible|terraform|chef|puppet|prometheus|grafana|datadog|splunk|supabase|prisma|typeorm|mongoose|axios|redux|zustand|tailwind|bootstrap|material\s*ui|mui|chakra|shadcn|three\.js|d3(?:\.js)?|socket\.io|rest(?:ful)?\s*api|microservices|oop|solid|tdd|bdd|data\s*structures|algorithms?|microsoft\s*office|ms\s*office|office\s*365|outlook|access|data\s*entry|5g\s*networks?)\b/i;
    const SOFT_SKILL_RX = /\b(?:communication|leadership|teamwork|team\s*work|problem[- ]solving|critical\s*thinking|creativity|creative|adaptability|time\s*management|collaboration|interpersonal|presentation|negotiation|analytical|detail[- ]oriented|self[- ]motivated|multitasking|work\s*ethic|empathy|conflict\s*resolution|decision[- ]making|planning|organization|mentoring|coaching|fast[- ]learner|quick\s*learner|proactive|initiative|flexibility|patience|resilience|accountability|integrity|punctuality|mentorship|supervision|supervising|management|managing\s*projects|peer\s*management)\b/i;

    // Strips proficiency annotations: "Arabic (Native)" → "Arabic", "English - C2" → "English"
    const stripProficiency = s => s.replace(/\s*[\(\[].+?[\)\]]/g, '').replace(/\s*[-–—]\s*(?:native|fluent|advanced|intermediate|beginner|basic|professional|c[12]|b[12]|a[12])\b.*/i, '').trim();

    // Detect which sub-label bucket a line prefix belongs to
    function detectSubLabel(line) {
      for (const [bucket, patterns] of Object.entries(SUB_LABEL_MAP)) {
        for (const rx of patterns) {
          if (rx.test(line)) return { bucket, value: line.replace(rx, '').trim() };
        }
      }
      return null;
    }

    // Classify a single skill token into a bucket by regex
    function classifySkill(skill) {
      const low = skill.toLowerCase();
      if (LANG_KW.some(lk => low === lk || low.startsWith(lk + ' ') || low.startsWith(lk + '(')))
        return 'lang';
      if (SOFT_SKILL_RX.test(skill)) return 'soft';
      if (PROG_LANG_RX.test(skill) || TECH_RX.test(skill)) return 'tech';
      return 'hard';
    }

    // Discards tokens that look like full-sentence descriptions, noise, or list tasks
    function isProbablyDescription(s) {
      if (s.length > 80) return true;
      const words = s.split(/\s+/);
      if (words.length > 6) return true;
      // Filter out past-tense verbs and "description" starters
      if (/^(?:implemented|developed|designed|built|created|optimized|refactored|collaborated|improved|contributed|managed|led|handled|conducted|performed|achieved|increased|reduced|delivered|launched|integrated|used|utilizing|configuring|deploying|built|organized|providing|featuring|supports|monitoring|focusing|enhancing|replacing|checkout|modernization|showcase|include|organization|Designed|Developed|Improved|Enhanced|Built|Organized|Contributed|Feature|Key|Achievements|consistency|modernization|Design|Refactoring)\b/i.test(s)) return true;
      // Filter out common "doing" phrase markers
      if (words.length > 2 && /\b(?:to|with|for|using|through|by|on|at|from|into|compared|instead|scratch|future|such|more|smooth|engaging|visual|structure|consistency|customization|seamless|interactive|efficiently|reliability|stability|performance|UX|UI|polish)\b/i.test(s)) return true;
      // Filter out link-like or metadata-like noise
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

    // Two-pass: first honor explicit sub-labels, then classify the rest
    let forceBucket = null; // set when a label-only heading line is detected

    for (const line of sectionContent.skills) {
      if (labelPrefixRx.test(line)) continue;

      const sub = detectSubLabel(line);

      if (sub) {
        forceBucket = sub.bucket;
        // If there are values on the same line as the label, process them now
        if (sub.value) {
          sub.value.split(/[,|•·●▪▫◦‣➤➢➣»→\/\\]| and | & /i).map(s => s.trim()).filter(s => s.length > 1 && s.length < 60)
            .forEach(s => pushSkill(forceBucket, s));
        }
        continue;
      }

      const STOPWORDS = /^(and|or|the|of|in|at|by|to|an|as|with|on|for|&|etc\.?|other|various|including|such|both|also|all)$/i;
      // Split on commas/bullets and also on natural connectors " and " / " & "
      const tokens = line.split(/[,|•·●▪▫◦‣➤➢➣»→\/\\]| and | & /i)
        .map(s => s.trim())
        .filter(s => s.length > 1 && s.length < 60 && !STOPWORDS.test(s));
      for (const token of tokens) {
        const regexBucket = classifySkill(token);
        // Regex wins for confident matches; forceBucket only guides ambiguous items
        const bucket = regexBucket !== 'hard' ? regexBucket : (forceBucket ?? 'hard');
        pushSkill(bucket, token);
      }
    }
  }

  // ── Final trim ────────────────────────────────────────────────────────────
  const trim = s => (s || '').replace(/\s+/g, ' ').trim();
  data.name     = trim(data.name).substring(0, 60);
  data.jobtitle = trim(data.jobtitle).substring(0, 100);
  data.address  = trim(data.address).substring(0, 100);
  data.summary  = trim(data.summary).substring(0, 1000);

  return data;
}

window.addEventListener('beforeunload', e => { e.preventDefault(); e.returnValue = ''; });

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
    initListeners(); // re-init so new inputs also trigger preview updates
  }
}

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

function showToast(msg) {
  const t = document.getElementById('toast');
  if (t) {
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }
}

// ── PDF Export ────────────────────────────────────────────────────────────────
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

// ── Preview Generation ────────────────────────────────────────────────────────
async function updatePreviews() {
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

      await page.render({ canvasContext: canvas.getContext('2d'), viewport: scaledViewport }).promise;
    } catch (e) {
      console.error(`Preview error for ${tpl.id}:`, e);
    }
  }
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

  showToast('Parsing pasted text...');
  try {
    const data = parseCVTextFromRaw(text);
    loadCVData(data);
    updatePreviews();
    closePasteModal();
    showToast('CV Text parsed successfully!');
    area.value = '';
  } catch (err) {
    console.error('Text parsing error:', err);
    alert('Error parsing text. Please ensure it follows a standard CV format.');
  }
}

// Expose functions to window for inline HTML onclick handlers
window.addSkill       = addSkill;
window.rmSkill        = rmSkill;
window.sw             = sw;
window.addBlock       = addBlock;
window.exportPDF      = exportPDF;
window.updatePreviews  = updatePreviews;
window.setTemplate    = setTemplate;
window.resetData      = resetData;
window.exportData     = exportData;
window.importData     = importData;
window.importFromText = importFromText;
window.openPasteModal = openPasteModal;
window.closePasteModal = closePasteModal;
