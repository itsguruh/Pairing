require('dotenv').config();
const express = require('express');
const pino = require('pino');
const QRCode = require('qrcode');
const {
  default: makeWASocket,
  useSingleFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const app = express();
const PORT = process.env.PORT || 3000;
const logger = pino({ level: 'info' });

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

let qrCodeBase64 = null;
let pairingCode = null;
let isConnected = false;
let sock;

// Homepage
app.get('/', (req, res) => {
  res.send(`
    <h1>🚀 CRYPTIX-MD Session Generator</h1>
    <p>Welcome! Use:</p>
    <ul>
      <li><a href="/qr">/qr</a> → Get QR code login</li>
      <li><a href="/pair">/pair</a> → Get pairing code login</li>
      <li><a href="/status">/status</a> → Check bot connection</li>
    </ul>
  `);
});

// Show QR code
app.get('/qr', (req, res) => {
  if (!qrCodeBase64) return res.status(404).send('QR Code not ready yet ❌');
  const img = Buffer.from(qrCodeBase64.split(',')[1], 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': img.length
  });
  res.end(img);
});

// Show Pairing code
app.get('/pair', async (req, res) => {
  if (isConnected) {
    return res.send("✅ Already connected. No pairing needed.");
  }
  if (!sock) {
    return res.send("❌ Bot is not initialized yet. Try again in a few seconds.");
  }

  try {
    // Request new pairing code from WhatsApp
    const code = await sock.requestPairingCode(process.env.WHATSAPP_NUMBER || "");
    pairingCode = code;
    res.send(`
      <h2>🔗 Your Pairing Code</h2>
      <p style="font-size:20px; font-weight:bold; color:green;">${code}</p>
      <p>Enter this code on WhatsApp ➝ Linked Devices ➝ Add Device</p>
    `);
  } catch (err) {
    res.status(500).send("⚠️ Error generating pairing code: " + err.message);
  }
});

// Status
app.get('/status', (req, res) => {
  res.json({ connected: isConnected });
});

// Start bot
async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  sock = makeWASocket({
    version,
    logger,
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrCodeBase64 = await QRCode.toDataURL(qr);
      logger.info("📱 Scan the QR from /qr to connect.");
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      logger.info("❌ Connection closed, reconnecting: " + shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      isConnected = true;
      logger.info("✅ Bot connected successfully!");
    }
  });

  sock.ev.on('creds.update', saveState);
}

// Start Express + Bot
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
  startBot();
});
