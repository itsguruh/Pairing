const express = require("express");
const router = express.Router();
const pino = require("pino");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  delay,
  Browsers
} = require("@whiskeysockets/baileys");

// GET /pair?number=xxxx
router.get("/pair", async (req, res) => {
  try {
    let num = req.query.number;
    if (!num) {
      return res.status(400).json({ error: "❌ Missing number parameter" });
    }

    // clean number (only digits)
    num = num.replace(/[^0-9]/g, "");

    const { state, saveCreds } = await useMultiFileAuthState("./session");

    const Gifted = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(
          state.keys,
          pino({ level: "fatal" }).child({ level: "fatal" })
        ),
      },
      printQRInTerminal: false,
      logger: pino({ level: "fatal" }).child({ level: "fatal" }),
      browser: Browsers.macOS("Safari"),
    });

    // Save credentials on update
    Gifted.ev.on("creds.update", saveCreds);

    // If not registered, request a new pairing code
    if (!Gifted.authState.creds.registered) {
      await delay(1500);
      const code = await Gifted.requestPairingCode(num);
      console.log(`✅ Pairing Code for ${num}: ${code}`);
      return res.json({ number: num, code });
    }

    // Already registered case
    return res.json({
      message: "✅ Already registered. Delete session folder to reset."
    });
  } catch (err) {
    console.error("❌ Error in /pair:", err);
    res.status(500).json({ error: "❌ Server error" });
  }
});

module.exports = router;
