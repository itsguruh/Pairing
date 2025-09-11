require('dotenv').config();
const express = require('express');
const pino = require('pino');
const {
  default: makeWASocket,
  useSingleFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;
const logger = pino({ level: 'silent' });

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

let qrCodeBase64 = null;
let isConnected = false;
let sock;

// Homepage
app.get("/", (req, res) => {
  res.send(`
    <h1>CRYPTIX-MD Session Generator ✅</h1>
    <p>Use <a href="/qr">/qr</a> to scan QR code</p>
    <p>Use <a href="/pair">/pair</a> to enter pairing code</p>
    <p>Use <a href="/status">/status</a> to check connection</p>
  `);
});

// QR route
app.get("/qr", (req, res) => {
  if (!qrCodeBase64) return res.status(404).send("QR not generated yet.");
  const img = Buffer.from(qrCodeBase64.split(',')[1], "base64");
  res.writeHead(200, {
    "Content-Type": "image/png",
    "Content-Length": img.length
  });
  res.end(img);
});

// Pairing route
app.get("/pair", (req, res) => {
  res.send("🚀 Pairing code mode is active. Enter your code via bot console.");
});

// Status route
app.get("/status", (req, res) => {
  res.json({ connected: isConnected });
});

// Start bot
async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  
  sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrCodeBase64 = await QRCode.toDataURL(qr);
      console.log("📲 Scan QR at: http://localhost:" + PORT + "/qr");
    }

    if (connection === "open") {
      isConnected = true;
      console.log("✅ CRYPTIX-MD connected successfully!");

      try {
        // Send welcome text
        await sock.sendMessage(sock.user.id, {
          text: `🎉 Welcome to *CRYPTIX-MD Bot* ✅\n\nYour bot is now live and ready to use 🚀.\n\n⚡ Features:\n- QR Login\n- Pairing Code\n- Public Access\n- Auto Welcome`
        });

        // Send branded welcome image
        await sock.sendMessage(sock.user.id, {
          image: { url: "https://i.ibb.co/DkqQyRF/cryptix-md-banner.png" }, // Replace this link with your new banner
          caption: "🔥 Welcome to CRYPTIX-MD 🔥\n\nYour WhatsApp Session is secured and ready 🚀"
        });

      } catch (e) {
        console.error("❌ Failed to send welcome message:", e);
      }
    } else if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        console.log("Reconnecting...");
        startBot();
      } else {
        console.log("Logged out. Delete auth_info.json and restart.");
      }
    }
  });

  sock.ev.on("creds.update", saveState);
}

startBot();

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
