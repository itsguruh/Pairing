const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve pair.html directly on "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pair.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
