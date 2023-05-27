module.exports = (io) => {
  const players = [];
  let tagger = null;

  io.on("connection", (socket) => {
    console.log("Neue Verbindung hergestellt:", socket.id);

    // Neuen Spieler hinzufügen
    const player = {
      id: socket.id,
      x: Math.random() * 800, // Zufällige Startposition X
      y: Math.random() * 600, // Zufällige Startposition Y
      color: "#" + ((Math.random() * 0xffffff) << 0).toString(16), // Zufällige Farbe
    };
    players.push(player);

    // Spielerliste an den verbundenen Client senden
    socket.emit("init", { players, tagger });

    // Wenn ein Spieler sich bewegt, die Position aktualisieren und an alle Clients senden
    socket.on("move", (movement) => {
      const { x, y } = movement;
      player.x = x;
      player.y = y;
      io.emit("update", player);
    });

    // Wenn ein Spieler das Spiel verlässt, ihn aus der Spielerliste entfernen und an alle Clients senden
    socket.on("disconnect", () => {
      const index = players.findIndex((p) => p.id === socket.id);
      if (index !== -1) {
        players.splice(index, 1);
        io.emit("playerDisconnected", socket.id);
        if (tagger === socket.id) {
          tagger = null;
        }
      }
    });

    // Wenn das Spiel gestartet wird und mindestens zwei Spieler vorhanden sind, einen Fänger auswählen
    if (players.length >= 2 && !tagger) {
      tagger = players[Math.floor(Math.random() * players.length)].id;
      io.emit("taggerSelected", tagger);
    }
  });
};
