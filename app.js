// ===============================
// MyTone AI – M0.6 Frontend Script (Fixed & Hardened)
// ===============================

// ---------- Helper: safe getElement ----------
const $ = (id) => document.getElementById(id);

// ---------- DOM Elements (may be null on some pages) ----------
const userInput = $('userInput');
const speakButton = $('speakButton');
const stopButton = $('stopButton');
const aiResponse = $('aiResponse');

const languageSelect = $('languageSelect');
const toneSelect = $('toneSelect');
const emotionSelect = $('emotionSelect');

const modeToggle = $('modeToggle');

const presetList = $('presetList');
const presetName = $('presetName');
const createPresetBtn = $('createPresetBtn');
const resetSettingsBtn = $('resetSettingsBtn');

const historyList = $('historyList');
const clearHistoryBtn = $('clearHistoryBtn');

const analyzerSuggestion = $('analyzerSuggestion');
const textPreview = $('textPreview');

const openDashboard = $('openDashboard');
const dashboardPage = $('dashboardPage');
const backToStudio = $('backToStudio');

// Navbar / hamburger
const hamburgerBtn = $('hamburgerBtn'); // ensure your HTML uses id="hamburgerBtn"
const navMenu = $('navMenu');

// Wave canvas
const canvas = $('waveCanvas');

// ---------- Speech Synthesis ----------
let synth = window.speechSynthesis;
let voices = [];

// ---------- Voice loading (safe) ----------
function loadVoices() {
  // getVoices() can return [] initially — call again on onvoiceschanged
  voices = synth.getVoices() || [];

  if (!languageSelect) return;

  languageSelect.innerHTML = '';

  // prefer en-IN; fallback en-US; otherwise pick first 'en' or first available
  let chosen = null;
  for (const v of voices) {
    if (v.lang && v.lang.toLowerCase() === 'en-in') { chosen = v.lang; break; }
  }
  if (!chosen) {
    for (const v of voices) {
      if (v.lang && v.lang.toLowerCase() === 'en-us') { chosen = v.lang; break; }
    }
  }
  if (!chosen) {
    for (const v of voices) {
      if (v.lang && v.lang.toLowerCase().startsWith('en')) { chosen = v.lang; break; }
    }
  }
  // final fallback
  if (!chosen) chosen = 'en-US';

  // add a single option (M0.6 uses default english)
  const opt = document.createElement('option');
  opt.value = chosen;
  opt.textContent = `${chosen} — ${voices.find(v=>v.lang===chosen)?.name ?? 'Default'}`;
  languageSelect.appendChild(opt);
}

if ('onvoiceschanged' in speechSynthesis) {
  speechSynthesis.onvoiceschanged = loadVoices;
}
// try loading immediately too
setTimeout(loadVoices, 200);

// ---------- Canvas / Waveform safe setup ----------
let ctx = null;
let waveAnimating = false;
let waveFrame = 0;

function setupCanvas() {
  if (!canvas) return;
  if (!canvas.getContext) return;
  ctx = canvas.getContext('2d');
  resizeCanvas();
  // clear transform to avoid double-scaling on repeated calls
  ctx.setTransform(1,0,0,1,0,0);
}
function resizeCanvas() {
  if (!canvas || !ctx) return;
  // Use devicePixelRatio safely
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
  const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    // scale drawing to CSS px
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}
window.addEventListener('resize', () => {
  try { resizeCanvas(); } catch(e){}
});
setupCanvas();

// Draw wave (simulated bars)
function drawWave(intensity = 1, color = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#3B82F6') {
  if (!ctx || !canvas) return;
  // Clear using device pixels
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cssWidth = canvas.clientWidth || (canvas.width / (window.devicePixelRatio || 1));
  const cssHeight = canvas.clientHeight || (canvas.height / (window.devicePixelRatio || 1));

  const bars = 30;
  const gap = 4;
  const barWidth = Math.max(2, (cssWidth - (bars - 1) * gap) / bars);

  color = (color || '#3B82F6').trim();

  for (let i = 0; i < bars; i++) {
    const phase = Math.sin((waveFrame + i) * 0.15 + i * 0.07);
    const h = (0.2 + Math.abs(phase) * 0.8) * cssHeight * intensity;
    const x = i * (barWidth + gap);
    const y = (cssHeight - h) / 2;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, h);
  }
}

// animateWave control
function animateWave(intensity = 1) {
  if (!ctx || !canvas) return;
  waveAnimating = true;
  function step() {
    if (!waveAnimating) return;
    waveFrame++;
    // pick color by selected emotion if available
    let color = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#3B82F6';
    try {
      const emotion = (emotionSelect && emotionSelect.value) ? emotionSelect.value : 'normal';
      if (emotion === 'happy') color = '#ffd166';
      if (emotion === 'sad') color = '#8aa0ff';
      if (emotion === 'energetic') color = '#ff7b7b';
      if (emotion === 'soft') color = '#cbd5e1';
    } catch (e){}
    drawWave(intensity, color);
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function stopWave() {
  waveAnimating = false;
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// ---------- Emotion settings ----------
function applyEmotionSettings(utter, emotion) {
  // ensure utter has defaults
  utter.pitch = utter.pitch || 1;
  utter.rate = utter.rate || 1;
  utter.volume = (typeof utter.volume === 'number') ? utter.volume : 1;

  switch (emotion) {
    case 'happy':
      utter.pitch = utter.pitch * 1.25;
      utter.rate = utter.rate * 1.15;
      utter.volume = 1;
      break;
    case 'sad':
      utter.pitch = utter.pitch * 0.8;
      utter.rate = utter.rate * 0.9;
      utter.volume = 0.9;
      break;
    case 'friendly':
      utter.pitch = utter.pitch * 1.1;
      utter.rate = 1.0;
      utter.volume = 1;
      break;
    case 'soft':
      utter.pitch = utter.pitch * 0.95;
      utter.rate = utter.rate * 0.9;
      utter.volume = 0.8;
      break;
    case 'energetic':
      utter.pitch = utter.pitch * 1.35;
      utter.rate = utter.rate * 1.25;
      utter.volume = 1;
      break;
    case 'calm':
      utter.pitch = utter.pitch * 0.9;
      utter.rate = utter.rate * 0.95;
      utter.volume = 0.95;
      break;
    default:
      // normal - keep defaults
      break;
  }
}

// ---------- Simple text analyzer ----------
function analyzeTextForEmotion(text) {
  if (!text) return 'normal';
  const t = text.toLowerCase();
  const exclam = t.includes('!');
  const question = t.includes('?');
  const sadWords = ['sad','sorry','unhappy','depressed','regret','miss'];
  const happyWords = ['happy','joy','awesome','great','love','yay','excited'];
  let score = 0;
  sadWords.forEach(w => { if (t.includes(w)) score -= 2; });
  happyWords.forEach(w => { if (t.includes(w)) score += 2; });
  if (exclam) score += 1;
  if (question) score += 0;
  if (score >= 2) return 'happy';
  if (score <= -2) return 'sad';
  if (t.length > 250) return 'calm';
  return 'normal';
}

// ---------- Highlight preview (safe) ----------
function highlightTextEmotion(text, emotion) {
  if (!textPreview) return;
  // reset classes safely
  textPreview.className = 'text-highlight';
  textPreview.classList.remove('hl-happy','hl-sad','hl-excited','hl-calm');
  if (emotion === 'happy') textPreview.classList.add('hl-happy');
  if (emotion === 'sad') textPreview.classList.add('hl-sad');
  if (emotion === 'energetic') textPreview.classList.add('hl-excited');
  if (emotion === 'calm') textPreview.classList.add('hl-calm');
  textPreview.textContent = text || '';
}

// ---------- Presets (localStorage) ----------
const PRESETS_KEY = 'mytone_presets_v0.6';
function loadPresets() {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}
function savePresets(arr) {
  try { localStorage.setItem(PRESETS_KEY, JSON.stringify(arr)); } catch (e){}
}
function renderPresetList() {
  if (!presetList) return;
  const presets = loadPresets();
  presetList.innerHTML = '';
  if (!presets || presets.length === 0) {
    presetList.innerHTML = `<div class="small">No saved presets</div>`;
    return;
  }
  presets.forEach((p, idx) => {
    const el = document.createElement('div');
    el.className = 'preset-item';
    el.innerHTML = `<div><strong>${p.name}</strong><div class="small">${p.toneLabel} · ${p.emotion}</div></div>
      <div class="preset-actions">
        <button class="btn-secondary" data-load="${idx}">Load</button>
        <button class="btn-secondary" data-delete="${idx}">Delete</button>
      </div>`;
    presetList.appendChild(el);
  });

  // attach handlers
  presetList.querySelectorAll('[data-load]').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.getAttribute('data-load'));
      const presets = loadPresets();
      const p = presets[i];
      if (!p) return;
      if (toneSelect) toneSelect.value = p.tone;
      if (emotionSelect) emotionSelect.value = p.emotion;
      if (aiResponse) aiResponse.textContent = `Preset "${p.name}" loaded`;
    });
  });
  presetList.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.getAttribute('data-delete'));
      let presets = loadPresets();
      const removed = presets.splice(i,1);
      savePresets(presets);
      renderPresetList();
      if (aiResponse) aiResponse.textContent = `Preset "${removed[0].name}" deleted`;
    });
  });
}

// create preset
if (createPresetBtn) {
  createPresetBtn.addEventListener('click', () => {
    const name = (presetName && presetName.value) ? presetName.value.trim() : '';
    if (!name) { if (aiResponse) aiResponse.textContent = 'Please enter preset name'; return; }
    const tone = toneSelect ? toneSelect.value : '1';
    const toneLabel = toneSelect ? toneSelect.options[toneSelect.selectedIndex].textContent : 'Medium';
    const emotion = emotionSelect ? emotionSelect.value : 'normal';
    const presets = loadPresets();
    presets.push({ name, tone, toneLabel, emotion, created: Date.now() });
    savePresets(presets);
    if (presetName) presetName.value = '';
    renderPresetList();
    if (aiResponse) aiResponse.textContent = `Preset "${name}" saved`;
  });
}

// reset settings
if (resetSettingsBtn) {
  resetSettingsBtn.addEventListener('click', () => {
    if (toneSelect) toneSelect.value = '1';
    if (emotionSelect) emotionSelect.value = 'normal';
    if (aiResponse) aiResponse.textContent = 'Settings reset';
  });
}

// ---------- History (local) ----------
const HISTORY_KEY = 'mytone_history_v0.6';
function loadHistory() {
  try { const r = localStorage.getItem(HISTORY_KEY); return r ? JSON.parse(r) : []; } catch (e) { return []; }
}
function saveHistory(arr) { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(arr)); } catch(e){} }
function addHistory(item) {
  const h = loadHistory();
  h.unshift(item);
  if (h.length > 30) h.pop();
  saveHistory(h);
  renderHistory();
}
function renderHistory() {
  if (!historyList) return;
  const h = loadHistory();
  historyList.innerHTML = '';
  if (!h || h.length === 0) { historyList.innerHTML = `<div class="small">No history yet</div>`; return; }
  h.forEach((it, idx) => {
    const node = document.createElement('div');
    node.className = 'history-item';
    node.innerHTML = `<div style="flex:1"><div class="small">${new Date(it.ts).toLocaleString()}</div><div>${(it.text||'').slice(0,120)}</div></div>
      <div style="display:flex;gap:.4rem">
        <button class="btn-primary" data-replay="${idx}">Play</button>
        <button class="btn-secondary" data-copy="${idx}">Copy</button>
      </div>`;
    historyList.appendChild(node);
  });

  // replay / copy
  historyList.querySelectorAll('[data-replay]').forEach(b => b.addEventListener('click', () => {
    const i = parseInt(b.getAttribute('data-replay'));
    const h = loadHistory();
    if (!h[i]) return;
    if (userInput) userInput.value = h[i].text;
    speakNow(h[i].text, h[i].tone, h[i].emotion);
  }));
  historyList.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => {
    const i = parseInt(b.getAttribute('data-copy'));
    const h = loadHistory();
    if (!h[i]) return;
    try { navigator.clipboard?.writeText(h[i].text); if (aiResponse) aiResponse.textContent = 'Copied to clipboard'; } catch(e){}
  }));
}

if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener('click', () => {
    try { localStorage.removeItem(HISTORY_KEY); } catch(e){}
    renderHistory();
  });
}

// ---------- Speak logic ----------
function speakNow(text, tone = null, emotion = null) {
  if (!text || !text.trim()) { if (aiResponse) aiResponse.textContent = 'Please enter some text'; return; }

  const utter = new SpeechSynthesisUtterance(text);

  // language
  utter.lang = (languageSelect && languageSelect.value) ? languageSelect.value : 'en-US';

  // choose voice: prefer exact lang match, else fallback to first 'en' voice, else undefined
  let match = null;
  if (voices && voices.length) {
    match = voices.find(v => v.lang && v.lang.toLowerCase() === utter.lang.toLowerCase());
    if (!match) match = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en'));
    if (match) utter.voice = match;
  }

  // base tone/pitch
  const basePitch = tone ? parseFloat(tone) : (toneSelect ? parseFloat(toneSelect.value || '1') : 1);
  utter.pitch = basePitch;

  // emotion adjustments
  const chosenEmotion = emotion || (emotionSelect ? emotionSelect.value : 'normal');
  applyEmotionSettings(utter, chosenEmotion);

  // speak
  try { synth.cancel(); } catch(e){}
  try { synth.speak(utter); } catch(e) {
    if (aiResponse) aiResponse.textContent = 'Speech API failed';
    return;
  }
  if (aiResponse) aiResponse.textContent = 'Speaking...';
  animateWave(1.0);

  // add to history
  addHistory({ text, tone: basePitch, emotion: chosenEmotion, ts: Date.now() });

  utter.onend = () => {
    if (aiResponse) aiResponse.textContent = 'Finished speaking';
    stopWave();
  };
  utter.onerror = () => {
    if (aiResponse) aiResponse.textContent = 'Error speaking';
    stopWave();
  };
}

// button handlers (safe)
if (speakButton) {
  speakButton.addEventListener('click', () => {
    const text = userInput ? userInput.value : '';
    const tone = toneSelect ? toneSelect.value : null;
    const emotion = emotionSelect ? emotionSelect.value : null;
    const auto = analyzeTextForEmotion(text);
    if (analyzerSuggestion) analyzerSuggestion.textContent = auto === 'normal' ? 'No strong emotion detected' : auto;
    highlightTextEmotion(text, auto);
    speakNow(text, tone, emotion);
  });
}
if (stopButton) {
  stopButton.addEventListener('click', () => {
    try { synth.cancel(); } catch(e){}
    stopWave();
    if (aiResponse) aiResponse.textContent = 'Stopped.';
  });
}

// ---------- Dashboard routing (safe) ----------
if (openDashboard && dashboardPage) {
  openDashboard.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('section.app-section').forEach(s => s.style.display = 'none');
    dashboardPage.style.display = 'block';
  });
}
if (backToStudio) {
  backToStudio.addEventListener('click', () => {
    if (dashboardPage) dashboardPage.style.display = 'none';
    document.querySelectorAll('section.app-section').forEach(s => s.style.display = 'block');
  });
}

// ---------- Presets & History init ----------
renderPresetList();
renderHistory();

// ---------- Navbar: hamburger + close-on-link + animation (safe) ----------
if (hamburgerBtn && navMenu) {
  hamburgerBtn.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    hamburgerBtn.classList.toggle('active');
  });

  // close when clicking a nav link
  navMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburgerBtn.classList.remove('active');
    });
  });
}

// ---------- Dark Mode toggle (persist) ----------
(function initTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.body.classList.add('dark-mode');
      if (modeToggle) modeToggle.textContent = '☀️ Light Mode';
    } else {
      if (modeToggle) modeToggle.textContent = '🌙 Dark Mode';
    }
  } catch(e){}
})();

if (modeToggle) {
  modeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    try {
      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme','dark');
        modeToggle.textContent = '☀️ Light Mode';
      } else {
        localStorage.setItem('theme','light');
        modeToggle.textContent = '🌙 Dark Mode';
      }
    } catch(e){}
  });
}

// ---------- ensure canvas ready after DOM load ----------
window.addEventListener('load', () => {
  setupCanvas();
  // sometimes voices not loaded until after load
  setTimeout(loadVoices, 300);
});
