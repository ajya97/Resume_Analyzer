/**
 * ResumeAI — Main Page JavaScript
 * Handles upload, analysis display, tabs, and results rendering.
 */

/* ─── SVG Gradient Injection ─────────────────────────────── */
(function injectSvgGradient() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.cssText = 'width:0;height:0;position:absolute;overflow:visible';
  svg.innerHTML = `
    <defs>
      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FF6B35"/>
        <stop offset="50%" stop-color="#F7C948"/>
        <stop offset="100%" stop-color="#A855F7"/>
      </linearGradient>
    </defs>`;
  document.body.prepend(svg);
})();

/* ─── State ─────────────────────────────────────────────── */
let selectedFile = null;
let analysisData = null;

/* ─── DOM Refs ───────────────────────────────────────────── */
const dropZone      = document.getElementById('dropZone');
const fileInput     = document.getElementById('fileInput');
const fileSelected  = document.getElementById('fileSelected');
const fileName      = document.getElementById('fileName');
const fileSize      = document.getElementById('fileSize');
const fileRemove    = document.getElementById('fileRemove');
const analyzeBtn    = document.getElementById('analyzeBtn');
const analyzeBtnTxt = document.getElementById('analyzeBtnText');
const btnLoader     = document.getElementById('btnLoader');
const progressWrap  = document.getElementById('progressWrap');
const progressFill  = document.getElementById('progressFill');
const progressLabel = document.getElementById('progressLabel');
const errorBanner   = document.getElementById('errorBanner');
const errorText     = document.getElementById('errorText');
const resultsSection = document.getElementById('resultsSection');

/* ─── Drag & Drop ────────────────────────────────────────── */
['dragenter','dragover'].forEach(e => {
  dropZone.addEventListener(e, ev => { ev.preventDefault(); dropZone.classList.add('drag-over'); });
});

['dragleave','drop'].forEach(e => {
  dropZone.addEventListener(e, ev => { ev.preventDefault(); dropZone.classList.remove('drag-over'); });
});

dropZone.addEventListener('drop', ev => {
  const file = ev.dataTransfer.files[0];
  if (file) handleFileSelect(file);
});

dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFileSelect(fileInput.files[0]);
});

/* ─── File Handling ──────────────────────────────────────── */
function handleFileSelect(file) {
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    showError('Only PDF files are allowed. Please select a valid resume.');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showError('File is too large. Maximum size is 5MB.');
    return;
  }

  selectedFile = file;
  hideError();

  // Show file info
  dropZone.style.display = 'none';
  fileSelected.style.display = 'flex';
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);

  analyzeBtn.disabled = false;
  analyzeBtnTxt.textContent = 'Analyze My Resume';
}

fileRemove.addEventListener('click', () => {
  selectedFile = null;
  fileInput.value = '';
  dropZone.style.display = 'flex';
  fileSelected.style.display = 'none';
  analyzeBtn.disabled = true;
  analyzeBtnTxt.textContent = 'Select a PDF to analyze';
  hideError();
});

/* ─── Upload & Analyze ───────────────────────────────────── */
analyzeBtn.addEventListener('click', async () => {
  if (!selectedFile) return;

  // UI: loading state
  analyzeBtn.disabled = true;
  analyzeBtnTxt.style.display = 'none';
  btnLoader.style.display = 'inline-block';
  progressWrap.style.display = 'block';
  hideError();

  // Simulate progress
  let fakeProgress = 0;
  const progressSteps = [
    { pct: 20, label: 'Uploading PDF...' },
    { pct: 40, label: 'Extracting resume content...' },
    { pct: 60, label: 'Calculating ATS score...' },
    { pct: 80, label: 'Running GPT-4 analysis...' },
    { pct: 95, label: 'Finalizing results...' },
  ];

  let stepIdx = 0;
  const progressInterval = setInterval(() => {
    if (stepIdx < progressSteps.length) {
      const { pct, label } = progressSteps[stepIdx++];
      progressFill.style.width = pct + '%';
      progressLabel.textContent = label;
    }
  }, 600);

  try {
    const formData = new FormData();
    formData.append('resume', selectedFile);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    clearInterval(progressInterval);
    progressFill.style.width = '100%';
    progressLabel.textContent = 'Analysis complete!';

    const data = await response.json();

    if (!response.ok || data.error) {
      showError(data.error || 'Analysis failed. Please try again.');
      resetAnalyzeBtn();
      return;
    }

    analysisData = data;
    setTimeout(() => renderResults(data), 500);

  } catch (err) {
    clearInterval(progressInterval);
    showError('Network error. Please check your connection and try again.');
    resetAnalyzeBtn();
  }
});

function resetAnalyzeBtn() {
  analyzeBtn.disabled = false;
  analyzeBtnTxt.style.display = 'inline';
  btnLoader.style.display = 'none';
  progressWrap.style.display = 'none';
}

/* ─── Results Rendering ──────────────────────────────────── */
function renderResults(data) {
  const { parsed, ats, missing_sections, errors, gpt_analysis } = data;

  // Show section
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Name
  document.getElementById('candidateName').textContent = parsed.name || 'Your Resume';

  // ATS Score animation
  animateScore(ats.total_score, ats.rating);

  // Section breakdown
  renderSectionBreakdown(ats.sections);

  // Profile info
  renderProfileInfo(parsed);

  // Missing sections
  renderMissingSections(missing_sections);

  // Errors tab
  renderErrors(errors);

  // Keywords tab
  if (gpt_analysis && gpt_analysis.keyword_recommendations) {
    renderKeywords(gpt_analysis.keyword_recommendations);
  }

  // Skill gap tab
  if (gpt_analysis && gpt_analysis.skill_gap_analysis) {
    renderSkillGap(gpt_analysis.skill_gap_analysis);
  }

  // Suggestions tab
  if (gpt_analysis && gpt_analysis.improvement_suggestions) {
    renderSuggestions(gpt_analysis.improvement_suggestions);
  }

  // Score tags
  renderScoreTags(ats, gpt_analysis);
}

/* ─── ATS Score Ring Animation ───────────────────────────── */
function animateScore(score, rating) {
  const circumference = 427; // 2π × 68
  const ring = document.getElementById('scoreRingFill');
  const numEl = document.getElementById('scoreNumber');
  const ratingEl = document.getElementById('scoreRating');

  ratingEl.textContent = rating;

  // Animate number
  let current = 0;
  const duration = 1500;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    current = Math.round(eased * score);
    numEl.textContent = current;

    const offset = circumference - (circumference * eased * score / 100);
    ring.style.strokeDashoffset = offset;
    ring.setAttribute('stroke', 'url(#scoreGrad)');

    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/* ─── Section Breakdown ──────────────────────────────────── */
function renderSectionBreakdown(sections) {
  const container = document.getElementById('sectionScores');
  container.innerHTML = '';

  const colors = [
    'linear-gradient(90deg,#FF6B35,#F7C948)',
    'linear-gradient(90deg,#A855F7,#3B82F6)',
    'linear-gradient(90deg,#10B981,#3B82F6)',
    'linear-gradient(90deg,#F59E0B,#EF4444)',
    'linear-gradient(90deg,#FF6B35,#A855F7)',
    'linear-gradient(90deg,#3B82F6,#10B981)',
    'linear-gradient(90deg,#F7C948,#FF6B35)',
  ];

  let colorIdx = 0;
  for (const [key, val] of Object.entries(sections)) {
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const pct = Math.round((val.score / val.max) * 100);
    const color = colors[colorIdx++ % colors.length];

    const row = document.createElement('div');
    row.className = 'score-row';
    row.innerHTML = `
      <div class="score-row-label">${label}</div>
      <div class="score-row-bar">
        <div class="score-row-fill" style="background:${color};width:0%" data-width="${pct}%"></div>
      </div>
      <div class="score-row-val">${val.score}/${val.max}</div>
    `;
    container.appendChild(row);
  }

  // Animate bars after render
  setTimeout(() => {
    document.querySelectorAll('.score-row-fill[data-width]').forEach(el => {
      el.style.width = el.dataset.width;
    });
  }, 100);
}

/* ─── Profile Info ───────────────────────────────────────── */
function renderProfileInfo(parsed) {
  const container = document.getElementById('profileInfo');
  const fields = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'github', label: 'GitHub' },
    { key: 'skills', label: 'Skills' },
  ];

  container.innerHTML = fields.map(({ key, label }) => {
    const val = parsed[key];
    if (!val || (Array.isArray(val) && val.length === 0)) return '';

    let display = '';
    if (Array.isArray(val)) {
      display = val.slice(0, 8).map(s => `<span class="profile-tag">${s}</span>`).join('') +
        (val.length > 8 ? `<span class="profile-tag">+${val.length - 8} more</span>` : '');
    } else {
      display = `<span class="profile-val">${escapeHtml(val)}</span>`;
    }

    return `
      <div class="profile-row">
        <div class="profile-key">${label}</div>
        <div class="profile-val">${display}</div>
      </div>`;
  }).join('');
}

/* ─── Missing Sections ───────────────────────────────────── */
function renderMissingSections(sections) {
  const container = document.getElementById('missingSections');
  if (!sections || sections.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;padding:12px 0;">&#10003; No critical missing sections found!</p>';
    return;
  }

  container.innerHTML = sections.map(s => `
    <div class="missing-card">
      <div class="missing-icon">&#9888;</div>
      <div>
        <div class="missing-title">${escapeHtml(s.section)}</div>
        <div class="missing-why">${escapeHtml(s.why_it_matters)}</div>
        <div class="missing-sug"><strong>Fix: </strong>${escapeHtml(s.suggestion)}</div>
      </div>
    </div>
  `).join('');
}

/* ─── Errors ─────────────────────────────────────────────── */
function renderErrors(errors) {
  const container = document.getElementById('errorsList');
  if (!errors || errors.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;padding:20px 0;">&#10003; No critical errors detected!</p>';
    return;
  }

  container.innerHTML = errors.map(e => `
    <div class="error-card">
      <div class="severity-badge severity-${escapeHtml(e.severity)}">${escapeHtml(e.severity)}</div>
      <div class="error-body">
        <div class="error-type">${escapeHtml(e.type)}</div>
        <div class="error-fix"><strong>Fix: </strong>${escapeHtml(e.fix)}</div>
      </div>
    </div>
  `).join('');
}

/* ─── Keywords ───────────────────────────────────────────── */
function renderKeywords(kw) {
  const container = document.getElementById('keywordsGrid');
  const panels = [
    { title: '&#128308; Missing ATS Keywords', key: 'missing_ats_keywords', cls: 'kw-missing' },
    { title: '&#128309; Technical Keywords', key: 'recommended_technical_keywords', cls: 'kw-technical' },
    { title: '&#128994; Industry Keywords', key: 'industry_keywords', cls: 'kw-industry' },
    { title: '&#128995; Role-Specific Keywords', key: 'role_specific_keywords', cls: 'kw-role' },
  ];

  container.innerHTML = panels.map(p => {
    const items = kw[p.key] || [];
    const tags = items.map(k => `<span class="kw-tag ${p.cls}">${escapeHtml(k)}</span>`).join('');
    return `
      <div class="keyword-panel">
        <div class="keyword-panel-title">${p.title}</div>
        <div class="kw-tags">${tags || '<span style="color:var(--text-dim);font-size:0.85rem">None found</span>'}</div>
      </div>`;
  }).join('');
}

/* ─── Skill Gap ──────────────────────────────────────────── */
function renderSkillGap(gap) {
  const container = document.getElementById('skillsGrid');
  const panels = [];

  if (gap.strong_skills?.length) {
    panels.push({
      title: '&#9989; Strong Skills',
      items: gap.strong_skills.map(s => ({ name: s, type: 'strong' }))
    });
  }
  if (gap.weak_areas?.length) {
    panels.push({
      title: '&#9651; Weak Areas',
      items: gap.weak_areas.map(s => ({ name: s, type: 'weak' }))
    });
  }
  if (gap.missing_critical_skills?.length) {
    panels.push({
      title: '&#10060; Missing Critical Skills',
      items: gap.missing_critical_skills.map(s => ({ name: s, type: 'missing' }))
    });
  }
  if (gap.recommended_skills_to_learn?.length) {
    panels.push({
      title: '&#128161; Recommended to Learn',
      items: gap.recommended_skills_to_learn.map(s => ({
        name: s.skill, reason: s.reason, resource: s.resource, type: 'missing'
      }))
    });
  }

  container.innerHTML = panels.map(p => `
    <div class="skills-panel">
      <div class="skills-panel-title">${p.title}</div>
      ${p.items.map(item => `
        <div class="skill-item skill-${item.type}">
          <div class="skill-dot"></div>
          <div>
            <div class="skill-name">${escapeHtml(item.name)}</div>
            ${item.reason ? `<div class="skill-reason">${escapeHtml(item.reason)}</div>` : ''}
            ${item.resource ? `<div class="skill-resource">&#127891; ${escapeHtml(item.resource)}</div>` : ''}
          </div>
        </div>`).join('')}
    </div>`).join('');
}

/* ─── Suggestions ────────────────────────────────────────── */
function renderSuggestions(suggestions) {
  const container = document.getElementById('suggestionsList');
  const sorted = [...suggestions].sort((a, b) => {
    const order = { High: 0, Medium: 1, Low: 2 };
    return (order[a.priority] || 2) - (order[b.priority] || 2);
  });

  container.innerHTML = sorted.map(s => `
    <div class="suggestion-card priority-${escapeHtml(s.priority)}">
      <div class="priority-label pl-${escapeHtml(s.priority)}">${escapeHtml(s.priority)}</div>
      <div class="suggestion-body">
        <div class="suggestion-category">${escapeHtml(s.category)}</div>
        <div class="suggestion-text">${escapeHtml(s.suggestion)}</div>
      </div>
    </div>`).join('');
}

/* ─── Score Tags ─────────────────────────────────────────── */
function renderScoreTags(ats, gpt) {
  const container = document.getElementById('scoreTags');
  const tags = [];

  if (ats.sections.contact_info?.score === 10) tags.push('✓ Contact Complete');
  if (ats.sections.projects?.score >= 10) tags.push('✓ Strong Projects');
  if (ats.sections.skills?.score >= 15) tags.push('✓ Great Skills');
  if (gpt?.interview_readiness?.score >= 70) tags.push('✓ Interview Ready');
  if (ats.total_score < 50) tags.push('⚠ Needs Work');

  container.innerHTML = tags.map(t => `<span class="score-tag">${t}</span>`).join('');
}

/* ─── Tab Navigation ─────────────────────────────────────── */
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${target}`)?.classList.add('active');
  });
});

/* ─── Analyze Another Button ─────────────────────────────── */
document.getElementById('analyzeAnotherBtn')?.addEventListener('click', () => {
  resultsSection.style.display = 'none';
  selectedFile = null;
  fileInput.value = '';
  dropZone.style.display = 'flex';
  fileSelected.style.display = 'none';
  progressWrap.style.display = 'none';
  analyzeBtn.disabled = true;
  analyzeBtnTxt.textContent = 'Select a PDF to analyze';
  analyzeBtnTxt.style.display = 'inline';
  btnLoader.style.display = 'none';
  document.getElementById('upload').scrollIntoView({ behavior: 'smooth' });
});

/* ─── Utilities ──────────────────────────────────────────── */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function showError(msg) {
  errorText.textContent = msg;
  errorBanner.style.display = 'flex';
}

function hideError() {
  errorBanner.style.display = 'none';
}

function escapeHtml(str) {
  if (typeof str !== 'string') return String(str || '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ─── Smooth scroll for anchor links ─────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
  });
});
