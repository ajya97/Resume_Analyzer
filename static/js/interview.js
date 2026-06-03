/**
 * ResumeAI — Interview Page JavaScript
 * Handles resume upload, question generation, answer submission, and scoring.
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
let selectedFile     = null;
let parsedResume     = null;
let allQuestions     = [];
let filteredQuestions = [];
let currentIdx       = 0;
let scores           = [];
let selectedType     = 'all';

/* ─── DOM Refs ───────────────────────────────────────────── */
const interviewHero    = document.getElementById('interviewHero');
const loadingScreen    = document.getElementById('loadingScreen');
const interviewSession = document.getElementById('interviewSession');
const resultsScreen    = document.getElementById('resultsScreen');

const miniDropZone  = document.getElementById('miniDropZone');
const miniFileInput = document.getElementById('miniFileInput');
const miniFileInfo  = document.getElementById('miniFileInfo');
const miniFileName  = document.getElementById('miniFileName');
const miniRemove    = document.getElementById('miniRemove');

const startBtn      = document.getElementById('startInterviewBtn');
const setupError    = document.getElementById('setupError');
const setupErrorTxt = document.getElementById('setupErrorText');

const answerInput   = document.getElementById('answerInput');
const charCount     = document.getElementById('charCount');
const submitBtn     = document.getElementById('submitAnswerBtn');
const nextBtn       = document.getElementById('nextQuestionBtn');
const skipBtn       = document.getElementById('skipQuestionBtn');
const retryBtn      = document.getElementById('retryInterviewBtn');

/* ─── Mini Upload (Interview Page) ───────────────────────── */
miniDropZone.addEventListener('click', () => miniFileInput.click());

miniDropZone.addEventListener('dragover', e => { e.preventDefault(); miniDropZone.classList.add('drag-over'); });
miniDropZone.addEventListener('dragleave', () => miniDropZone.classList.remove('drag-over'));
miniDropZone.addEventListener('drop', e => {
  e.preventDefault();
  miniDropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleMiniFileSelect(file);
});

miniFileInput.addEventListener('change', () => {
  if (miniFileInput.files[0]) handleMiniFileSelect(miniFileInput.files[0]);
});

miniRemove.addEventListener('click', () => {
  selectedFile = null;
  parsedResume = null;
  miniFileInput.value = '';
  miniFileInfo.style.display = 'none';
  miniDropZone.style.display = 'block';
  startBtn.disabled = true;
});

function handleMiniFileSelect(file) {
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    showSetupError('Only PDF files are allowed.');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showSetupError('File too large. Max 5MB.');
    return;
  }
  selectedFile = file;
  miniFileName.textContent = file.name;
  miniDropZone.style.display = 'none';
  miniFileInfo.style.display = 'flex';
  startBtn.disabled = false;
  hideSetupError();
}

/* ─── Interview Type Pills ───────────────────────────────── */
document.querySelectorAll('.type-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.type-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    selectedType = pill.dataset.type;
  });
});

/* ─── Start Interview ────────────────────────────────────── */
startBtn.addEventListener('click', async () => {
  if (!selectedFile) {
    showSetupError('Please upload your resume PDF first.');
    return;
  }

  hideSetupError();
  showScreen('loading');
  startLoadingSteps();

  try {
    // Step 1: Upload & parse resume
    const formData = new FormData();
    formData.append('resume', selectedFile);

    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const uploadData = await uploadRes.json();

    if (!uploadRes.ok || uploadData.error) {
      throw new Error(uploadData.error || 'Upload failed');
    }

    parsedResume = uploadData.parsed;
    markLoadingStep(2);

    // Step 2: Generate interview questions
    const qRes = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parsed: parsedResume }),
    });
    const qData = await qRes.json();

    if (!qRes.ok || qData.error) {
      throw new Error(qData.error || 'Failed to generate questions');
    }

    markLoadingStep(3);
    allQuestions = qData.questions || [];

    // Filter by selected type
    filteredQuestions = selectedType === 'all'
      ? allQuestions
      : allQuestions.filter(q => q.category === selectedType);

    if (filteredQuestions.length === 0) {
      filteredQuestions = allQuestions; // fallback
    }

    markLoadingStep(4);
    await sleep(600);

    // Reset state
    currentIdx = 0;
    scores = [];

    showScreen('session');
    renderQuestion(currentIdx);

  } catch (err) {
    showScreen('hero');
    showSetupError(err.message || 'Something went wrong. Please try again.');
  }
});

/* ─── Loading Steps Animation ────────────────────────────── */
function startLoadingSteps() {
  markLoadingStep(1);
  setTimeout(() => markLoadingStep(2), 1200);
}

function markLoadingStep(num) {
  for (let i = 1; i <= num; i++) {
    const el = document.getElementById(`ls${i}`);
    if (el) {
      el.classList.remove('active');
      if (i < num) el.classList.add('done');
      else el.classList.add('active');
    }
  }
}

/* ─── Render Question ────────────────────────────────────── */
function renderQuestion(idx) {
  const q = filteredQuestions[idx];
  if (!q) return;

  // Progress
  const total = filteredQuestions.length;
  const pct = Math.round(((idx + 1) / total) * 100);
  document.getElementById('ivProgressLabel').textContent = `Question ${idx + 1} of ${total}`;
  document.getElementById('ivProgressPct').textContent = `${pct}%`;
  document.getElementById('ivProgressFill').style.width = `${pct}%`;

  // Tracker
  document.getElementById('currentCategory').textContent = q.category || '—';
  document.getElementById('answeredCount').textContent = scores.length;
  updateAvgScore();

  // Question card
  document.getElementById('qNum').textContent = `Q${idx + 1}`;
  document.getElementById('qCategory').textContent = q.category || 'General';
  document.getElementById('questionText').textContent = q.question || '';

  // Difficulty badge
  const diffEl = document.getElementById('qDifficulty');
  diffEl.textContent = q.difficulty || 'Medium';
  diffEl.className = `q-difficulty diff-${q.difficulty || 'Medium'}`;

  // Follow-up hint
  const fuEl = document.getElementById('followupHint');
  if (q.follow_up) {
    fuEl.textContent = `💬 Follow-up: ${q.follow_up}`;
    fuEl.style.display = 'block';
  } else {
    fuEl.style.display = 'none';
  }

  // Reset answer area
  answerInput.value = '';
  charCount.textContent = '0 characters';
  answerInput.disabled = false;
  submitBtn.disabled = false;
  submitBtn.textContent = 'Submit Answer →';

  // Hide feedback
  document.getElementById('feedbackCard').style.display = 'none';
  document.getElementById('answerArea').style.display = 'block';

  // Animate in
  const card = document.getElementById('questionCard');
  card.style.opacity = '0';
  card.style.transform = 'translateY(12px)';
  requestAnimationFrame(() => {
    card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  });
}

/* ─── Char Counter ───────────────────────────────────────── */
answerInput.addEventListener('input', () => {
  charCount.textContent = `${answerInput.value.length} characters`;
});

/* ─── Submit Answer ──────────────────────────────────────── */
submitBtn.addEventListener('click', async () => {
  const answer = answerInput.value.trim();
  if (answer.length < 10) {
    answerInput.style.borderColor = 'var(--danger)';
    answerInput.placeholder = 'Please write a meaningful answer (at least a few sentences)...';
    setTimeout(() => { answerInput.style.borderColor = ''; }, 2000);
    return;
  }

  const q = filteredQuestions[currentIdx];

  // Loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Evaluating...';
  answerInput.disabled = true;

  try {
    const res = await fetch('/api/evaluate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: q.question,
        answer: answer,
        category: q.category,
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error || 'Evaluation failed');
    }

    const evaluation = data.evaluation;
    scores.push(evaluation.score || 5);
    updateAvgScore();

    renderFeedback(evaluation);

  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Answer →';
    answerInput.disabled = false;
    alert('Evaluation failed: ' + err.message);
  }
});

/* ─── Render Feedback ────────────────────────────────────── */
function renderFeedback(ev) {
  document.getElementById('answerArea').style.display = 'none';
  const card = document.getElementById('feedbackCard');
  card.style.display = 'block';

  // Score
  const scoreEl = document.getElementById('fbScore');
  scoreEl.textContent = `${ev.score}/10`;
  const scoreColor = ev.score >= 8 ? '#10B981' : ev.score >= 6 ? '#F59E0B' : '#EF4444';
  scoreEl.style.background = `linear-gradient(135deg, ${scoreColor}, var(--grad-3))`;
  scoreEl.style.webkitBackgroundClip = 'text';
  scoreEl.style.webkitTextFillColor = 'transparent';
  scoreEl.style.backgroundClip = 'text';

  document.getElementById('fbScoreLabel').textContent = ev.score_label || 'Average';

  // Strengths
  const strengthsEl = document.getElementById('fbStrengths');
  strengthsEl.innerHTML = (ev.strengths || []).map(s => `<li>${escapeHtml(s)}</li>`).join('') || '<li>No specific strengths noted.</li>';

  // Weaknesses
  const weakEl = document.getElementById('fbWeaknesses');
  weakEl.innerHTML = (ev.weaknesses || []).map(w => `<li>${escapeHtml(w)}</li>`).join('') || '<li>No major weaknesses noted.</li>';

  // Detailed feedback
  document.getElementById('fbDetailed').textContent = ev.detailed_feedback || '';

  // Model answer
  document.getElementById('fbModel').textContent = ev.model_answer || '';

  // Tip
  document.getElementById('fbTip').textContent = ev.tips_for_improvement || '';

  // Scroll to feedback
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─── Next / Skip ────────────────────────────────────────── */
nextBtn.addEventListener('click', () => advanceQuestion());
skipBtn.addEventListener('click', () => {
  scores.push(0); // skipped = 0
  advanceQuestion();
});

function advanceQuestion() {
  currentIdx++;
  if (currentIdx >= filteredQuestions.length) {
    showResults();
  } else {
    renderQuestion(currentIdx);
    document.getElementById('interviewSession').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ─── Average Score ──────────────────────────────────────── */
function updateAvgScore() {
  const el = document.getElementById('avgScore');
  if (scores.length === 0) { el.textContent = '—'; return; }
  const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  el.textContent = avg;
}

/* ─── Show Results Screen ────────────────────────────────── */
function showResults() {
  showScreen('results');

  const name = parsedResume?.name || 'Candidate';
  document.getElementById('resultsName').textContent = `Great job, ${name}!`;

  const avg = scores.length
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 0;
  const avgRounded = Math.round(avg * 10) / 10;

  // Animate ring (score out of 10 → map to 0–427 circumference)
  const circumference = 427;
  const ring = document.getElementById('finalRingFill');
  const numEl = document.getElementById('finalScoreNum');

  let current = 0;
  const duration = 1500;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    current = Math.round(eased * avgRounded * 10) / 10;
    numEl.textContent = current.toFixed(1);
    const offset = circumference - (circumference * eased * avgRounded / 10);
    ring.style.strokeDashoffset = offset;
    ring.setAttribute('stroke', 'url(#scoreGrad)');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  // Label
  let label = '';
  if (avgRounded >= 8.5) label = '🏆 Outstanding!';
  else if (avgRounded >= 7) label = '⭐ Great Performance!';
  else if (avgRounded >= 5.5) label = '👍 Good Effort!';
  else if (avgRounded >= 4) label = '📈 Keep Practicing!';
  else label = '💪 Room to Grow!';
  document.getElementById('finalScoreLabel').textContent = label;

  // Per-question breakdown
  const grid = document.getElementById('scoreBreakdownGrid');
  grid.innerHTML = scores.map((s, i) => {
    const q = filteredQuestions[i];
    const color = s >= 8 ? '#10B981' : s >= 6 ? '#F59E0B' : s === 0 ? '#6B7280' : '#EF4444';
    return `
      <div class="breakdown-item">
        <div class="breakdown-score" style="color:${color}">${s === 0 ? 'Skip' : s + '/10'}</div>
        <div class="breakdown-label">${q ? `Q${i + 1} ${q.category || ''}` : `Q${i + 1}`}</div>
      </div>`;
  }).join('');
}

/* ─── Retry Interview ────────────────────────────────────── */
retryBtn.addEventListener('click', () => {
  currentIdx = 0;
  scores = [];
  showScreen('session');
  renderQuestion(0);
});

/* ─── Screen Manager ─────────────────────────────────────── */
function showScreen(name) {
  interviewHero.style.display    = name === 'hero'    ? 'block' : 'none';
  loadingScreen.style.display    = name === 'loading' ? 'block' : 'none';
  interviewSession.style.display = name === 'session' ? 'block' : 'none';
  resultsScreen.style.display    = name === 'results' ? 'block' : 'none';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─── Utilities ──────────────────────────────────────────── */
function showSetupError(msg) {
  setupErrorTxt.textContent = msg;
  setupError.style.display = 'flex';
}

function hideSetupError() {
  setupError.style.display = 'none';
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
