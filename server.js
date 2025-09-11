const express = require("express");
const app = express();
const path = require("path");

// Routes
const pairRoute = require("./routes/pair");

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// API route
app.use("/", pairRoute);

// Health check
app.get("/status", (req, res) => {
  res.json({ status: "🟢 Server Online", timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
