const express = require("express");
const router = express.Router();

// A new function that takes the global code as input
module.exports = (pairingCode) => {
  // Pairing endpoint
  router.get("/pair", (req, res) => {
    if (pairingCode) {
      return res.json({
        message: "✅ Success",
        code: pairingCode
      });
    } else {
      return res.status(503).json({
        error: "❌ Pairing code not yet generated. Please wait."
      });
    }
  });

  return router;
};
