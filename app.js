document.addEventListener("DOMContentLoaded", () => {
  const speakButton = document.getElementById("speakButton");
  const stopButton = document.getElementById("stopButton");
  const userInput = document.getElementById("userInput");
  const aiResponse = document.getElementById("aiResponse");

  // Initialize Speech Synthesis
  const synth = window.speechSynthesis;

  // Function to speak text
  function speakText(text, lang = "en-US") {
    if (!("speechSynthesis" in window)) {
      alert("Your browser does not support text-to-speech!");
      return;
    }

    if (synth.speaking) {
      synth.cancel(); // Stop ongoing speech
    }

    if (text.trim().length === 0) {
      aiResponse.textContent = "⚠️ Please enter a paragraph first.";
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.0;   // normal speed
    utterance.pitch = 1.0;  // normal tone
    utterance.volume = 1.0; // full volume

    // Pick best matching voice (based on language)
    const voices = synth.getVoices();
    utterance.voice = voices.find(v => v.lang === lang) || voices[0];

    // Update UI
    aiResponse.textContent = "🔊 Speaking...";
    synth.speak(utterance);

    utterance.onend = () => {
      aiResponse.textContent = "✅ Finished speaking.";
    };

    utterance.onerror = (err) => {
      aiResponse.textContent = "❌ Speech error occurred.";
      console.error(err);
    };
  }

  // Button Events
  speakButton.addEventListener("click", () => {
    const text = userInput.value;
    speakText(text);
  });

  stopButton.addEventListener("click", () => {
    if (synth.speaking) {
      synth.cancel();
      aiResponse.textContent = "⏹ Stopped speaking.";
    }
  });
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




