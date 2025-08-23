// Speech recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript; // Put recognized speech in textbox
    };

    recognition.onerror = (err) => {
        alert("🎤 Error: " + err.error);
    };
} else {
    alert("Speech Recognition not supported in this browser");
}
micButton.addEventListener("click", () => {
    if (recognition) {
        recognition.start();
        aiResponse.textContent = "🎤 Listening...";
    }
});
sendButton.addEventListener("click", () => {
    const text = userInput.value.trim();
    if (text) {
        aiResponse.textContent = "Processing...";

        fetch("/api/ask/", {   // <-- we'll build this endpoint in Django
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken()
            },
            body: JSON.stringify({ query: text })
        })
        .then(res => res.json())
        .then(data => {
            aiResponse.textContent = data.response || "⚠️ No response";
            if (data.audio_url) {
                aiAudio.src = data.audio_url;
                aiAudio.play();
            }
        })
        .catch(() => aiResponse.textContent = "❌ Error contacting server");
    }
});
function getCSRFToken() {
    let cookieValue = null;
    const name = "csrftoken";
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
