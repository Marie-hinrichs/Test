const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = process.env.PORT || 3000;

// Importiere die app.js-Datei
const game = require("./app.js");
game(io);

server.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
