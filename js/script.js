let currentTemplate = 'classic';
let pdfjsLib = window['pdfjs-dist/build/pdf'] || null;
// Setup PDF.js worker
if (pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

const skillData = {
  lang: ["C#", "C++", "Python", "TypeScript", "JavaScript", "SQL", "HTML", "CSS"],
  tech: [".NET 8.0/9.0", "ASP.NET MVC", "Entity Framework", "Tailwind", "React", "Vite", "Node.js", "Git", "GitHub", "SQL Server", "Supabase", "MongoDB", "Express"],
  hard: ["Full-Stack Web Development", "Database Management", "Version Control (Git/GitHub)", "UI/UX Design", "Software Debugging", "Project Management", "API Development", "Computer Troubleshooting", "Digital Security"],
  soft: ["Problem-solving", "Adaptability", "Responsibility", "Communication", "Teamwork", "Leadership", "Active Listening", "Public Speaking", "Collaboration"]
};

// ... existing DOM logic
function renderSkills() {
  ['lang', 'tech', 'hard', 'soft'].forEach(k => {
    document.getElementById(k + '-tags').innerHTML = skillData[k].map((s, i) =>
      `<div class="skill-chip">${s}<button onclick="rmSkill('${k}',${i}); updatePreviews();">×</button></div>`).join('');
  });
}
function addSkill(k) { const i = document.getElementById(k + '-in'); const v = i.value.trim(); if (v) { skillData[k].push(v); i.value = ''; renderSkills(); updatePreviews(); } }
function rmSkill(k, i) { skillData[k].splice(i, 1); renderSkills(); }

// Create the template UI cards dynamically from templates.js
function renderTemplateCards() {
  const container = document.getElementById('tpl-cards-container');
  if (!container || !window.cvTemplates) return;

  container.innerHTML = '';

  Object.values(window.cvTemplates).forEach(tpl => {
    const card = document.createElement('div');
    card.className = `tpl-card ${currentTemplate === tpl.id ? 'selected' : ''}`;
    card.id = `tpl-${tpl.id}`;
    card.onclick = () => setTemplate(tpl.id);

    // preview hover handling
    card.onmouseenter = () => showLargePreview(tpl.id);
    card.onmouseleave = () => hideLargePreview();

    // Add canvas for the preview
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
    // Match dimensions but draw the current thumbnail content
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
  if (tooltip) {
    tooltip.classList.remove('show');
  }
}

function initListeners() {
  // Add input listeners to auto-update previews
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
  renderSkills();
  renderTemplateCards();
  initListeners();
  // Generate initial previews
  setTimeout(updatePreviews, 500);
});

const panels = ['header', 'summary', 'education', 'experience', 'projects', 'skills'];
function sw(name, el) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('pfill').style.width = ((panels.indexOf(name) + 1) / panels.length * 100) + '%';
  if(window.innerWidth <= 900) {
      document.querySelector('.sidebar').classList.remove('open');
  }
}

function setTemplate(t) {
  currentTemplate = t;
  document.querySelectorAll('.tpl-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(`tpl-${t}`)?.classList.add('selected');
}

let eduN = 1, expN = 3, prjN = 3;
function addBlock(type) {
  const lists = { edu: 'edu-list', exp: 'exp-list', proj: 'proj-list' };
  const labels = { edu: 'Degree', exp: 'Role', proj: 'Project' };
  const counters = { edu: ++eduN, exp: ++expN, proj: ++prjN };
  const n = counters[type];
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
  document.getElementById(lists[type]).appendChild(d);
  initListeners(); // re-init listeners for new inputs
  updatePreviews();
}

function getData() {
  const g = id => document.getElementById(id)?.value || '';
  return {
    name: g('name'), jobtitle: g('jobtitle'), email: g('email'), mobile: g('mobile'),
    address: g('address'), linkedin: g('linkedin'), github: g('github'), summary: g('summary'),
    edu: [...document.querySelectorAll('#edu-list .block-item')].map(el => ({
      inst: el.querySelector('.edu-inst')?.value || '', loc: el.querySelector('.edu-loc')?.value || '',
      deg: el.querySelector('.edu-deg')?.value || '', period: el.querySelector('.edu-period')?.value || ''
    })),
    exp: [...document.querySelectorAll('#exp-list .block-item')].map(el => ({
      co: el.querySelector('.exp-co')?.value || '', loc: el.querySelector('.exp-loc')?.value || '',
      role: el.querySelector('.exp-role')?.value || '', period: el.querySelector('.exp-period')?.value || '',
      desc: el.querySelector('.exp-desc')?.value || '', ach: el.querySelector('.exp-ach')?.value || ''
    })),
    proj: [...document.querySelectorAll('#proj-list .block-item')].map(el => ({
      name: el.querySelector('.proj-name')?.value || '', tech: el.querySelector('.proj-tech')?.value || '',
      desc: el.querySelector('.proj-desc')?.value || '', ach: el.querySelector('.proj-ach')?.value || ''
    })),
    skills: skillData
  };
}

function showToast(msg) {
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ─────────────────────────────────────────
// PDF EXPORT
// ─────────────────────────────────────────
function exportPDF() {
  showToast('Generating PDF…');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const d = getData();

  if (window.cvTemplates && window.cvTemplates[currentTemplate]) {
    window.cvTemplates[currentTemplate].render(doc, d);
  } else {
    console.error("Unknown template", currentTemplate);
  }

  doc.save((d.name || 'CV').replace(/\s+/g, '_') + '_CV.pdf');
  showToast('Exported successfully!');
}

// ─────────────────────────────────────────
// PREVIEW GENERATION
// ─────────────────────────────────────────
async function updatePreviews() {
  if (!window.cvTemplates || !window['pdfjs-dist/build/pdf']) return;
  const d = getData();
  const { jsPDF } = window.jspdf;

  for (const tpl of Object.values(window.cvTemplates)) {
    try {
      // 1. Generate invisible generic PDF
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      tpl.render(doc, d);

      // 2. Convert to ArrayBuffer
      const pdfOutput = doc.output('arraybuffer');

      // 3. Render first page to Canvas via pdf.js
      const loadingTask = pdfjsLib.getDocument({ data: pdfOutput });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const canvas = document.getElementById(`preview-${tpl.id}`);
      if (!canvas) continue;

      const context = canvas.getContext('2d');

      // Calculate scale based on canvas resolution (we want a small crisp thumbnail)
      const viewport = page.getViewport({ scale: 1 });

      // Render at high resolution to support the large preview popout
      const targetWidth = 800;
      const scale = targetWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale: scale });

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport
      };

      await page.render(renderContext).promise;

    } catch (e) {
      console.error(`Error rendering preview for ${tpl.id}:`, e);
    }
  }
}
