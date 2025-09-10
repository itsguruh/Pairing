const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 8000;

// Prevent EventEmitter memory leak warnings
require("events").EventEmitter.defaultMaxListeners = 500;

// Import your pairing logic
let code = require("./pair");

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mount /code routes
app.use("/code", code);

// Serve static assets from /public
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "main.html"));
});

app.get("/pair", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pair.html"));
});

app.get("/qr", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "qr.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`
✅ Deployment Successful!
🚀 Caseyrhodes-Session-Server Running on http://localhost:${PORT}
  `);
});

module.exports = app;
