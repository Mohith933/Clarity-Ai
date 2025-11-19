const speakButton = document.getElementById("speakButton");
const stopButton = document.getElementById("stopButton");
const userInput = document.getElementById("userInput");
const aiResponse = document.getElementById("aiResponse");
const languageSelect = document.getElementById("languageSelect");
const toneSelect = document.getElementById("toneSelect");

let synth = window.speechSynthesis;
const emotionSelect = document.getElementById("emotionSelect");

function applyEmotionSettings(utter, emotion) {
    switch (emotion) {
        case "happy":
            utter.pitch = 1.3;
            utter.rate = 1.2;
            utter.volume = 1;
            break;
        case "friendly":
            utter.pitch = 1.15;
            utter.rate = 1.05;
            utter.volume = 1;
            break;
        case "soft":
            utter.pitch = 1;
            utter.rate = 0.9;
            utter.volume = 0.5;
            break;
        case "sad":
            utter.pitch = 0.8;
            utter.rate = 0.85;
            utter.volume = 0.7;
            break;
        case "energetic":
            utter.pitch = 1.4;
            utter.rate = 1.3;
            utter.volume = 1;
            break;
        case "calm":
            utter.pitch = 0.95;
            utter.rate = 0.95;
            utter.volume = 0.8;
            break;
        default:
            utter.pitch = 1;
            utter.rate = 1;
            utter.volume = 1;
    }
}

speakButton.addEventListener("click", () => {
    const text = userInput.value.trim();
    if (!text) {
        aiResponse.textContent = "Please enter some text.";
        return;
    }

    let utter = new SpeechSynthesisUtterance(text);

    // Language
    utter.lang = languageSelect.value;

    // Tone (pitch)
    utter.pitch = parseFloat(toneSelect.value);

    // Emotion settings
    applyEmotionSettings(utter, emotionSelect.value);

    // Speak
    synth.speak(utter);

    aiResponse.textContent = "Speaking with emotion...";
});