const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);

// Statische Dateien aus dem "public" Verzeichnis bereitstellen
app.use(express.static("public"));

const io = socketIO(server);

// Die Spiellogik und Socket.IO-Verbindungen in "app.js" behandeln
require("./app")(io);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server gestartet auf Port ${port}`);
});
