// ===============================
// MyTone AI – M0.6 Frontend Script
// ===============================

// DOM Elements
const userInput = document.getElementById("userInput");
const speakButton = document.getElementById("speakButton");
const stopButton = document.getElementById("stopButton");
const aiResponse = document.getElementById("aiResponse");

const languageSelect = document.getElementById("languageSelect");
const toneSelect = document.getElementById("toneSelect");
const emotionSelect = document.getElementById("emotionSelect");

const modeToggle = document.getElementById("modeToggle");

const presetList = document.getElementById("presetList");
const presetName = document.getElementById("presetName");
const createPresetBtn = document.getElementById("createPresetBtn");
const savePresetBtn = document.getElementById("savePresetBtn");
const resetSettingsBtn = document.getElementById("resetSettingsBtn");

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const analyzerSuggestion = document.getElementById("analyzerSuggestion");
const textPreview = document.getElementById("textPreview");

const openDashboard = document.getElementById("openDashboard");
const dashboardPage = document.getElementById("dashboardPage");
const backToStudio = document.getElementById("backToStudio");
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");
const modeToggle = document.getElementById("modeToggle");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("open");
    hamburger.classList.toggle("active");
  });
}

if (modeToggle) {
  modeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });
}


// Speech Synthesis
let synth = window.speechSynthesis;
let voices = [];

// -----------------------------
// Voice Loading (M0.6: default English only)
function loadVoices() {
    voices = synth.getVoices();
    languageSelect.innerHTML = "";

    // prefer en-IN, otherwise fallback en-US
    let added = false;
    for (let v of voices) {
        if (v.lang === "en-IN") {
            let opt = document.createElement("option");
            opt.value = v.lang;
            opt.textContent = `${v.lang} — ${v.name}`;
            languageSelect.appendChild(opt);
            added = true;
            break;
        }
    }
    if (!added) {
        // fallback
        let opt = document.createElement("option");
        opt.value = "en-US";
        opt.textContent = "en-US — Default English";
        languageSelect.appendChild(opt);
    }
}
speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

// -----------------------------
// Waveform (simulated) — canvas based simple animation
const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext ? canvas.getContext("2d") : null;
let waveAnimating = false;
let waveFrame = 0;

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
}
if (canvas && ctx) {
    window.addEventListener("resize", () => { resizeCanvas(); });
    resizeCanvas();
}

function drawWave(intensity = 1, color = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#3B82F6') {
    if (!ctx) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2 * devicePixelRatio;
    ctx.strokeStyle = color.trim();

    // simulate multi-bars
    const bars = 30;
    const gap = 4;
    const barWidth = (width - (bars - 1) * gap) / bars;
    for (let i = 0; i < bars; i++) {
        const phase = Math.sin((waveFrame + i) * 0.15);
        const h = (0.2 + Math.abs(phase) * 0.8) * (height / devicePixelRatio) * intensity;
        const x = i * (barWidth + gap);
        const y = ((height / devicePixelRatio) - h) / 2;
        ctx.fillStyle = color.trim();
        ctx.fillRect(x, y, barWidth, h);
    }
}

function animateWave(intensity = 1) {
    waveAnimating = true;
    function step() {
        if (!waveAnimating) return;
        waveFrame++;
        // color variation by emotion
        const emotion = emotionSelect.value;
        let color = getComputedStyle(document.documentElement).getPropertyValue('--accent');
        if (emotion === 'happy') color = '#ffd166';
        if (emotion === 'sad') color = '#8aa0ff';
        if (emotion === 'energetic') color = '#ff7b7b';
        drawWave(intensity, color);
        requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}
function stopWave() {
    waveAnimating = false;
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// -----------------------------
// Emotion settings (M0.6, consolidated)
function applyEmotionSettings(utter, emotion) {
    // base pitch from tone override applied later
    switch (emotion) {
        case "happy":
            utter.pitch = (utter.pitch || 1) * 1.25;
            utter.rate = (utter.rate || 1) * 1.15;
            utter.volume = 1;
            break;
        case "sad":
            utter.pitch = (utter.pitch || 1) * 0.8;
            utter.rate = (utter.rate || 1) * 0.9;
            utter.volume = 0.9;
            break;
        case "friendly":
            utter.pitch = (utter.pitch || 1) * 1.1;
            utter.rate = 1.0;
            utter.volume = 1;
            break;
        case "soft":
            utter.pitch = (utter.pitch || 1) * 0.95;
            utter.rate = (utter.rate || 1) * 0.9;
            utter.volume = 0.8;
            break;
        case "energetic":
            utter.pitch = (utter.pitch || 1) * 1.35;
            utter.rate = (utter.rate || 1) * 1.25;
            utter.volume = 1;
            break;
        case "calm":
            utter.pitch = (utter.pitch || 1) * 0.9;
            utter.rate = (utter.rate || 1) * 0.95;
            utter.volume = 0.95;
            break;
        default:
            // normal
            utter.pitch = utter.pitch || 1;
            utter.rate = utter.rate || 1;
            utter.volume = 1;
    }
}

// -----------------------------
// Simple text analyzer (rule-based)
function analyzeTextForEmotion(text) {
    const t = text.toLowerCase();
    const exclam = t.includes('!');
    const question = t.includes('?');
    const sadWords = ['sad','sorry','unhappy','depressed','regret','miss'];
    const happyWords = ['happy','joy','awesome','great','love','yay','excited'];
    let score = 0;
    for (const w of sadWords) if (t.includes(w)) score -= 2;
    for (const w of happyWords) if (t.includes(w)) score += 2;
    if (exclam) score += 1;
    if (question) score += 0;

    if (score >= 2) return 'happy';
    if (score <= -2) return 'sad';
    if (t.length > 250) return 'calm';
    return 'normal';
}

function highlightTextEmotion(text, emotion) {
    // sets a highlighted preview and class
    textPreview.className = 'text-highlight';
    if (emotion === 'happy') textPreview.classList.add('hl-happy');
    if (emotion === 'sad') textPreview.classList.add('hl-sad');
    if (emotion === 'energetic') textPreview.classList.add('hl-excited');
    if (emotion === 'calm') textPreview.classList.add('hl-calm');
    textPreview.textContent = text;
}

// -----------------------------
// Presets: localStorage helpers
const PRESETS_KEY = 'mytone_presets_v0.6';
function loadPresets() {
    const raw = localStorage.getItem(PRESETS_KEY);
    try {
        return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
}
function savePresets(arr) {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(arr));
}
function renderPresetList() {
    const presets = loadPresets();
    presetList.innerHTML = '';
    if (presets.length === 0) {
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
            toneSelect.value = p.tone;
            emotionSelect.value = p.emotion;
            aiResponse.textContent = `Preset "${p.name}" loaded`;
        });
    });
    presetList.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', () => {
            const i = parseInt(btn.getAttribute('data-delete'));
            let presets = loadPresets();
            const removed = presets.splice(i,1);
            savePresets(presets);
            renderPresetList();
            aiResponse.textContent = `Preset "${removed[0].name}" deleted`;
        });
    });
}

// create preset
createPresetBtn.addEventListener('click', () => {
    const name = (presetName.value || '').trim();
    if (!name) { aiResponse.textContent = 'Please enter preset name'; return; }
    const tone = toneSelect.value;
    const toneLabel = toneSelect.options[toneSelect.selectedIndex].textContent;
    const emotion = emotionSelect.value;
    const presets = loadPresets();
    presets.push({ name, tone, toneLabel, emotion, created: Date.now() });
    savePresets(presets);
    presetName.value = '';
    renderPresetList();
    aiResponse.textContent = `Preset "${name}" saved`;
});

// reset UI settings
resetSettingsBtn.addEventListener('click', () => {
    toneSelect.value = '1';
    emotionSelect.value = 'normal';
    aiResponse.textContent = 'Settings reset';
});

// -----------------------------
// History (local)
const HISTORY_KEY = 'mytone_history_v0.6';
function loadHistory() {
    try { const r = localStorage.getItem(HISTORY_KEY); return r ? JSON.parse(r) : []; } catch (e) { return []; }
}
function saveHistory(arr) { localStorage.setItem(HISTORY_KEY, JSON.stringify(arr)); }
function addHistory(item) {
    const h = loadHistory();
    h.unshift(item);
    if (h.length > 30) h.pop(); // keep last 30
    saveHistory(h);
    renderHistory();
}
function renderHistory() {
    const h = loadHistory();
    historyList.innerHTML = '';
    if (h.length === 0) { historyList.innerHTML = `<div class="small">No history yet</div>`; return; }
    h.forEach((it, idx) => {
        const node = document.createElement('div');
        node.className = 'history-item';
        node.innerHTML = `<div style="flex:1"><div class="small">${new Date(it.ts).toLocaleString()}</div><div>${it.text.slice(0,120)}</div></div>
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
        userInput.value = h[i].text;
        speakNow(h[i].text, h[i].tone, h[i].emotion);
    }));
    historyList.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => {
        const i = parseInt(b.getAttribute('data-copy'));
        const h = loadHistory();
        if (!h[i]) return;
        navigator.clipboard?.writeText(h[i].text);
        aiResponse.textContent = 'Copied to clipboard';
    }));
}

clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
});

// -----------------------------
// Speak logic (centralized so history + presets work)
function speakNow(text, tone = null, emotion = null) {
    if (!text || !text.trim()) { aiResponse.textContent = 'Please enter some text'; return; }

    const utter = new SpeechSynthesisUtterance(text);

    // language
    utter.lang = languageSelect.value || 'en-US';

    // pick voice if available
    const match = voices.find(v => v.lang === utter.lang);
    if (match) utter.voice = match;

    // base tone
    const basePitch = tone ? parseFloat(tone) : parseFloat(toneSelect.value || '1');
    utter.pitch = basePitch;

    // emotion adjustments
    const chosenEmotion = emotion || emotionSelect.value || 'normal';
    applyEmotionSettings(utter, chosenEmotion);

    // start waveform + play
    try { synth.cancel(); } catch (e){}
    synth.speak(utter);
    aiResponse.textContent = 'Speaking...';
    animateWave(1.0);

    // history entry
    addHistory({ text, tone: basePitch, emotion: chosenEmotion, ts: Date.now() });

    // when end -> stop waveform
    utter.onend = () => {
        aiResponse.textContent = 'Finished speaking';
        stopWave();
    };
    utter.onerror = (e) => {
        aiResponse.textContent = 'Error speaking';
        stopWave();
    };
}

// click handlers
speakButton.addEventListener('click', () => {
    const text = userInput.value;
    const tone = toneSelect.value;
    const emotion = emotionSelect.value;
    // update analyzer visuals
    const auto = analyzeTextForEmotion(text);
    analyzerSuggestion.textContent = auto === 'normal' ? 'No strong emotion detected' : auto;
    highlightTextEmotion(text, auto);
    speakNow(text, tone, emotion);
});

stopButton.addEventListener('click', () => {
    try { synth.cancel(); } catch (e){}
    stopWave();
    aiResponse.textContent = 'Stopped.';
});

// -----------------------------
// Simple UI / routing for dashboard placeholder
openDashboard.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('section.app-section').forEach(s => s.style.display = 'none');
    dashboardPage.style.display = 'block';
});
backToStudio.addEventListener('click', () => {
    dashboardPage.style.display = 'none';
    document.querySelectorAll('section.app-section').forEach(s => s.style.display = 'block');
});

// -----------------------------
// init presets/history on load
renderPresetList();
renderHistory();

// -----------------------------
// Dark Mode toggle (persist)
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    modeToggle.textContent = '☀️ Light Mode';
}
modeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme','dark');
        modeToggle.textContent = '☀️ Light Mode';
    } else {
        localStorage.setItem('theme','light');
        modeToggle.textContent = '🌙 Dark Mode';
    }
});
