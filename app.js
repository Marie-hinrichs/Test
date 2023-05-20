const express = require("express");
const app = express();
const port = process.env.PORT || 3003;

let wtfCounter = 0;
const wtfTimestamps = [];

app.use(express.json());

app.post("/wtf", (req, res) => {
  const now = Date.now();
  wtfCounter++;
  wtfTimestamps.push(now);
  res.status(200).send({ message: "WTF received" });
});

app.get("/wtf-per-minute", (req, res) => {
  const oneMinuteAgo = Date.now() - 60 * 1000;

  // Remove outdated timestamps
  while (wtfTimestamps.length > 0 && wtfTimestamps[0] < oneMinuteAgo) {
    wtfTimestamps.shift();
  }

  res.status(200).send({ wtfPerMinute: wtfTimestamps.length });
});

app.get("/last-wtf", (req, res) => {
  res
    .status(200)
    .send({ wtfPerMinute: wtfTimestamps[wtfTimestamps.length - 1] });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
