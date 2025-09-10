const express = require("express");
const cors = require("cors");
const path = require("path");

const pairRouter = require("./pair.js"); // import router

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

// Use pair router
app.use("/", pairRouter);

// Default route -> open pair.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pair.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
