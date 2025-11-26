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

    const languageSelect = document.getElementById("languageSelect");

    // Allowed languages (India region only)
    const allowedLangs = new Set([
        "en-IN",
        "te-IN",
        "hi-IN",
        "ta-IN"
    ]);

    // Clear old entries
    languageSelect.innerHTML = "";

    // Avoid duplicates
    const added = new Set();

    voices.forEach(voice => {
        const lang = voice.lang;

        // Only add voices matching allowed languages
        if (allowedLangs.has(lang) && !added.has(lang)) {
            added.add(lang);

            let option = document.createElement("option");
            option.value = lang;
            option.textContent = `${lang} — ${voice.name}`;
            languageSelect.appendChild(option);
        }
    });

    // If no supported Indian voices found
    if (added.size === 0) {
        languageSelect.innerHTML = `
            <option value="" disabled selected>No supported voices found</option>
        `;
    }
}

// Trigger load
speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

// ===============================
// EMOTION SETTINGS
// ===============================
function applyEmotionSettings(utter, emotion) {
    switch (emotion) {
        case "happy":
            utter.pitch = 1.4;
            utter.rate = 1.1;
            break;
        case "sad":
            utter.pitch = 0.7;
            utter.rate = 0.9;
            break;
        case "friendly":
            utter.pitch = 1.2;
            utter.rate = 1.0;
            break;
        case "soft":
            utter.pitch = 0.9;
            utter.rate = 0.8;
            break;
        case "excited":
            utter.pitch = 1.5;
            utter.rate = 1.2;
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

    // Selected Language
    const selectedLang = languageSelect.value;
    utter.lang = selectedLang;

    // Match voice
    const matchVoice = voices.find(v => v.lang === selectedLang);
    if (matchVoice) {
        utter.voice = matchVoice;
    } else {
        aiResponse.textContent = `⚠️ No voice found for ${selectedLang}, using default voice`;
    }

    // Tone (Pitch)
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