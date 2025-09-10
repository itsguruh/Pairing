const express = require("express");
const app = express();

// Root route
app.get("/", (req, res) => {
  res.send("🚀 CRYPTIX MD Pairing Server is running!");
});

// Heroku will provide a port → must use process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
