// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;  // Put recognized speech in textbox
    aiResponse.textContent = "🎤 Speech recognized! You can now send or edit the text.";
  };

  recognition.onerror = (err) => {
    alert("🎤 Error: " + err.error);
  };
} else {
  alert("Speech Recognition not supported in this browser");
}

// Start recognition when mic button clicked
micButton.addEventListener("click", () => {
  if (recognition) {
    recognition.start();
    aiResponse.textContent = "🎤 Listening...";
  }
});

// Send button just shows the current input text as a response (no backend)
sendButton.addEventListener("click", () => {
  const text = userInput.value.trim();

  if (text) {
    // Just simulate a response without backend
    aiResponse.textContent = `You said: "${text}"`;
  } else {
    aiResponse.textContent = "Please enter or speak something first.";
  }
});

// app.js
window.addEventListener('DOMContentLoaded', () => {
    const modeToggleBtn = document.getElementById('modeToggle');
    
    if (!modeToggleBtn) {
        console.warn('modeToggle button not found!');
        return;
    }
    
    modeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        if (document.body.classList.contains('dark-mode')) {
            modeToggleBtn.textContent = '☀️ Light Mode';
            localStorage.setItem('theme', 'dark');
        } else {
            modeToggleBtn.textContent = '🌙 Dark Mode';
            localStorage.setItem('theme', 'light');
        }
    });

    // Apply saved theme on load
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        modeToggleBtn.textContent = '☀️ Light Mode';
    } else {
        modeToggleBtn.textContent = '🌙 Dark Mode';
    }
});




