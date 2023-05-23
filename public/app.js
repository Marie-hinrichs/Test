document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  const sentenceContainer = document.getElementById("sentence");
  const timerContainer = document.getElementById("timer");
  const sentenceInput = document.getElementById("sentence-input");
  const submitBtn = document.getElementById("submit-btn");
  const completedSentencesList = document.getElementById("completed-sentences");
  const scoresList = document.getElementById("scores");

  let currentPlayer = "";
  let roundTime = 0;

  socket.on("connect", () => {
    console.log("Verbunden mit dem Server: " + socket.id);
  });

  // Startet das Spiel
  socket.on("startRound", (data) => {
    currentPlayer = data.currentPlayer;
    roundTime = data.roundTime;

    sentenceContainer.textContent = data.sentence;
    timerContainer.textContent = `Verbleibende Zeit: ${roundTime}`;

    // Aktiviert die Eingabe und den Absenden-Button
    sentenceInput.disabled = false;
    submitBtn.disabled = false;

    // Startet den Timer
    startTimer();
  });

  // Aktualisiert den Timer
  socket.on("updateTimer", (time) => {
    timerContainer.textContent = `Verbleibende Zeit: ${time}`;
  });

  // Zeigt die vervollständigten Sätze aller Spieler an
  socket.on("showCompletedSentences", (completedSentences) => {
    completedSentencesList.innerHTML = "";

    completedSentences.forEach((sentence) => {
      const li = document.createElement("li");
      li.textContent = sentence.sentence;
      completedSentencesList.appendChild(li);
    });
  });

  // Aktualisiert den Punktestand
  socket.on("updateScores", (scores) => {
    scoresList.innerHTML = "";

    for (const player in scores) {
      const li = document.createElement("li");
      li.textContent = `${player}: ${scores[player]}`;
      scoresList.appendChild(li);
    }
  });

  // Ermöglicht das Absenden der vervollständigten Sätze
  submitBtn.addEventListener("click", () => {
    const completedSentence = sentenceInput.value.trim();

    if (completedSentence !== "") {
      sentenceInput.value = "";
      sentenceInput.disabled = true;
      submitBtn.disabled = true;

      socket.emit("completeSentence", completedSentence);
    }
  });

  // Startet den Timer für die Runde
  function startTimer() {
    let time = roundTime;

    const timerInterval = setInterval(() => {
      time -= 1;
      socket.emit("updateTimer", time);

      if (time <= 0) {
        clearInterval(timerInterval);
      }
    }, 1000);
  }
});
