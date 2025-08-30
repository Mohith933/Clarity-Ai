// ==== DOM Elements ====
const userInput = document.getElementById("userInput");
const micButton = document.getElementById("micButton");
const sendButton = document.getElementById("sendButton");
const aiResponse = document.getElementById("aiResponse");

// ==== Speech Recognition Setup ====
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
    };

    recognition.onerror = (err) => {
        alert("🎤 Error: " + err.error);
    };
} else {
    alert("❌ Your browser does not support Speech Recognition.");
}

// ==== Text-to-Speech Function ====
function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.pitch = 1;
        utterance.rate = 1;
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
    } else {
        alert("❌ Your browser does not support Text-to-Speech.");
    }
}

// ==== Simulated AI Response ====
function generateFakeAIResponse(input) {
    // Simple dummy response — you can enhance this or use real AI APIs
    return `You said: "${input}". How can I assist you further?`;
}

// ==== Mic Button: Start Listening ====
micButton.addEventListener("click", () => {
    if (recognition) {
        recognition.start();
        aiResponse.textContent = "🎤 Listening...";
    }
});

// ==== Send Button: Generate & Speak Response ====
sendButton.addEventListener("click", () => {
    const input = userInput.value.trim();
    if (input) {
        aiResponse.textContent = "🤖 Processing...";

        // Simulate response
        const response = generateFakeAIResponse(input);

        // Display and speak
        aiResponse.textContent = response;
        speak(response);
    } else {
        aiResponse.textContent = "⚠️ Please type or speak something first.";
    }
});
