// ===============================
// MyTone AI – Text-to-Voice Engine
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

// ===============================
// Speech Synthesis API
// ===============================
let synth = window.speechSynthesis;
let voices = [];

// ===============================
// LOAD VOICES (Web Speech API)
// ===============================
function loadVoices() {
    voices = synth.getVoices();

    const allowedLangs = new Set([
        "en-IN"   // Only default English for M0.5
    ]);

    languageSelect.innerHTML = "";
    let englishFound = false;

    voices.forEach(voice => {
        if (allowedLangs.has(voice.lang)) {
            let option = document.createElement("option");
            option.value = voice.lang;
            option.textContent = `${voice.lang} — ${voice.name}`;
            languageSelect.appendChild(option);

            if (voice.lang === "en-IN") englishFound = true;
        }
    });

    // Fallback if EN-IN not found
    if (!englishFound) {
        languageSelect.innerHTML = `
            <option value="en-US" selected>en-US — Default English</option>
        `;
    }
}

speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

// ===============================
// EMOTION SETTINGS (corrected)
// ===============================
function applyEmotionSettings(utter, emotion) {

    switch (emotion) {

        case "happy":
            utter.pitch = 1.3;
            utter.rate = 1.15;
            break;

        case "sad":
            utter.pitch = 0.7;
            utter.rate = 0.85;
            break;

        case "friendly":
            utter.pitch = 1.15;
            utter.rate = 1.0;
            break;

        case "soft":
            utter.pitch = 0.9;
            utter.rate = 0.9;
            utter.volume = 0.8;
            break;

        case "energetic":   // FIXED: matched HTML
            utter.pitch = 1.4;
            utter.rate = 1.25;
            break;

        case "calm":        // NEW: matched HTML
            utter.pitch = 0.85;
            utter.rate = 0.95;
            utter.volume = 0.9;
            break;

        default:
            break;
    }
}

// ===============================
// SPEAK BUTTON
// ===============================
speakButton.addEventListener("click", () => {
    const text = userInput.value.trim();
    if (!text) {
        aiResponse.textContent = "Please enter some text.";
        return;
    }

    let utter = new SpeechSynthesisUtterance(text);

    // Language
    const selectedLang = languageSelect.value;
    utter.lang = selectedLang;

    // Match voice
    const matchVoice = voices.find(v => v.lang === selectedLang);
    if (matchVoice) utter.voice = matchVoice;

    // Tone
    utter.pitch = parseFloat(toneSelect.value);

    // Emotion
    applyEmotionSettings(utter, emotionSelect.value);

    // Speak
    synth.cancel();
    synth.speak(utter);

    aiResponse.textContent = "Speaking...";
});

// ===============================
// STOP BUTTON
// ===============================
stopButton.addEventListener("click", () => {
    synth.cancel();
    aiResponse.textContent = "Stopped.";
});

// ===============================
// DARK MODE
// ===============================
modeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        modeToggle.textContent = "☀️ Light Mode";
    } else {
        modeToggle.textContent = "🌙 Dark Mode";
    }
});