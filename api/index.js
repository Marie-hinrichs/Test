const express = require("express");
const app = express();

let wtfCounter = 0;
const wtfTimestamps = [];

app.use(express.json());

app.post("/api/wtf", (req, res) => {
  const now = Date.now();
  wtfCounter++;
  wtfTimestamps.push(now);
  res.status(200).send({ message: "WTF received" });
});

app.get("/api/wtf-per-minute", (req, res) => {
  const oneMinuteAgo = Date.now() - 60 * 1000;

  // Remove outdated timestamps
  while (wtfTimestamps.length > 0 && wtfTimestamps[0] < oneMinuteAgo) {
    wtfTimestamps.shift();
  }

  res.status(200).send({ wtfPerMinute: wtfTimestamps.length });
});

app.get("/api/last-wtf", (req, res) => {
  res
    .status(200)
    .send({ wtfPerMinute: wtfTimestamps[wtfTimestamps.length - 1] });
});

module.exports = app;
