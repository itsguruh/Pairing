const express = require("express");
const pino = require("pino");
const path = require("path");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  delay,
  Browsers,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

const app = express();
const PORT = process.env.PORT || 3000;

// Start the server immediately, before any bot initialization.
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// This will store the generated pairing code.
let globalPairingCode = null;

// Bot startup function
const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState(
    path.join(__dirname, "session")
  );
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

  Gifted.ev.on("creds.update", saveCreds);

  Gifted.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log("Connection closed due to " + lastDisconnect.error + ", reconnecting...");
        startBot(); // Reconnect
      } else {
        console.log("Connection logged out. Please generate a new pairing code.");
        globalPairingCode = "Logged out. Please restart the app."
      }
    } else if (connection === "open") {
      console.log("✅ Bot connected successfully!");
    }

    if (qr && !Gifted.authState.creds.registered) {
      await delay(1500);
      const num = "254105521300"; // Replace with the number you want to use
      const code = await Gifted.requestPairingCode(num);
      console.log(`✅ Pairing Code generated: ${code}`);
      globalPairingCode = code; // Store code in the global variable
    }
  });

  if (!Gifted.authState.creds.registered) {
    console.log("Generating a new pairing code...");
  } else {
    console.log("Bot already registered. To reset, delete the session folder.");
    globalPairingCode = "Already Registered. To reset, delete the session folder."
  }
};

startBot();

// Endpoint to get the pairing code
app.get("/code", (req, res) => {
  res.json({ code: globalPairingCode });
});

// Serve the static pairing.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pairing.html"));
});

// Create a 'public' directory if it doesn't exist
const publicPath = path.join(__dirname, "public");
if (!require("fs").existsSync(publicPath)) {
    require("fs").mkdirSync(publicPath);
}
