const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Array mit vorgegebenen Sätzen
const sentences = [
  "Der Hund __name__ gern im Park spazieren.",
  "In meiner Freizeit __hobby__ ich gern.",
  // Weitere Sätze hinzufügen...
];

let completedSentences = []; // Array für vervollständigte Sätze
let timer; // Timer für die Rundenzeit
let currentPlayer = 0; // Index des aktuellen Spielers
let scores = {}; // Punktestand der Spieler

io.on("connection", (socket) => {
  console.log("Neue Verbindung: " + socket.id);

  // Neuen Spieler hinzufügen
  scores[socket.id] = 0;

  // Startet ein neues Spiel
  socket.on("startGame", () => {
    startNewRound();
  });

  // Verarbeitet die eingegebene Satzvervollständigung eines Spielers
  socket.on("completeSentence", (completedSentence) => {
    if (
      completedSentences.length > currentPlayer &&
      completedSentences[currentPlayer].completed === false
    ) {
      // Setzt den vervollständigten Satz für den aktuellen Spieler
      completedSentences[currentPlayer].sentence = completedSentence;
      completedSentences[currentPlayer].completed = true;

      // Überprüft, ob alle Spieler ihre Sätze vervollständigt haben
      if (completedSentences.every((sentence) => sentence.completed === true)) {
        // Stoppt den Timer
        clearTimeout(timer);

        // Zeigt die vervollständigten Sätze allen Spielern
        io.emit("showCompletedSentences", completedSentences);

        // Wählt den Gewinner basierend auf den Spielervotes aus
        const winner = calculateWinner(completedSentences);
        scores[winner] += 1;

        // Aktualisiert den Punktestand und sendet ihn an alle Spieler
        io.emit("updateScores", scores);

        // Startet eine neue Runde
        setTimeout(() => {
          startNewRound();
        }, 5000);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Verbindung getrennt: " + socket.id);
    delete scores[socket.id];

    // Überprüft, ob der aktuelle Spieler das Spiel verlässt
    if (
      completedSentences.length > currentPlayer &&
      completedSentences[currentPlayer].player === socket.id
    ) {
      // Setzt den aktuellen Satz als unvollständig, um das Spiel fortzusetzen
      completedSentences[currentPlayer].completed = false;

      // Startet eine neue Runde, falls alle Spieler die Sätze verlassen
      if (
        completedSentences.every((sentence) => sentence.completed === false)
      ) {
        clearTimeout(timer);
        startNewRound();
      }
    }
  });
});

// Startet eine neue Runde
function startNewRound() {
  completedSentences = [];
  currentPlayer = 0;

  // Wählt einen zufälligen Satz für die Runde aus
  const randomSentence = getRandomSentence();

  // Erstellt für jeden Spieler eine leere vervollständigte Satzoption
  for (const player in scores) {
    completedSentences.push({
      player,
      sentence: "",
      completed: false,
    });
  }

  // Sendet die Informationen für die neue Runde an alle Spieler
  io.emit("startRound", {
    sentence: randomSentence,
    currentPlayer: currentPlayer,
    roundTime: 20, // Dauer der Runde in Sekunden
  });

  // Startet den Timer für die Runde
  startTimer();
}

// Startet den Timer für die Runde
function startTimer() {
  // Setzt den Timer auf die gewünschte Rundenzeit (in Millisekunden)
  timer = setTimeout(() => {
    // Stoppt den Timer, wenn die Zeit abgelaufen ist
    clearTimeout(timer);

    // Zeigt die vervollständigten Sätze allen Spielern
    io.emit("showCompletedSentences", completedSentences);

    // Wählt den Gewinner basierend auf den Spielervotes aus
    const winner = calculateWinner(completedSentences);
    scores[winner] += 1;

    // Aktualisiert den Punktestand und sendet ihn an alle Spieler
    io.emit("updateScores", scores);

    // Startet eine neue Runde
    setTimeout(() => {
      startNewRound();
    }, 5000); // Wartezeit (in Millisekunden) zwischen den Runden
  }, 20000); // Rundenzeit (in Millisekunden)
}

// Wählt einen zufälligen Satz für die Runde aus dem Array der Sätze
function getRandomSentence() {
  const randomIndex = Math.floor(Math.random() * sentences.length);
  return sentences[randomIndex];
}

// Berechnet den Gewinner basierend auf den Spielervotes
function calculateWinner(completedSentences) {
  // Implementieren Sie hier die Logik zur Ermittlung des Gewinners basierend auf den Spielervotes
  // Zum Beispiel könnten Sie die meisten Votes oder den ersten Spieler mit einem Vote als Gewinner wählen
  // Geben Sie den Gewinner zurück
}

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log("Server läuft auf Port " + port);
});
