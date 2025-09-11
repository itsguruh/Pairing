const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, images, etc.) from /public
app.use(express.static(path.join(__dirname, "public")));

// Routes
const pairRoutes = require("./routes/pair");
app.use("/api", pairRoutes); // pairing endpoint will be /api/pair

// Default route → show pairing.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pairing.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
