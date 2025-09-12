require('dotenv').config();
const express = require('express');
const pino = require('pino');
const qrcode = require('qrcode');
const {
  default: makeWASocket,
  useSingleFileAuthState,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const app = express();
const PORT = process.env.PORT || 3000;
const logger = pino({ level: 'info' });

// Save session to a file
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

let qrCodeBase64 = null;
let pairingCode = null;
let isConnected = false;

// Homepage
app.get('/', (req, res) => {
  res.send(`
    <h1>🚀 CRYPTIX-MD Session Generator</h1>
    <p>Welcome! This server is running on Heroku ✅</p>
    <ul>
      <li><a href="/status">/status</a></li>
      <li><a href="/qr">/qr</a></li>
      <li><a href="/pair">/pair</a></li>
    </ul>
  `);
});

// Status route
app.get('/status', (req, res) => {
  res.json({
    connected: isConnected,
    uptime: process.uptime(),
    message: isConnected ? "Bot is connected ✅" : "Bot not connected ❌"
  });
});

// QR route
app.get('/qr', async (req, res) => {
  if (!qrCodeBase64) {
    return res.status(404).send('QR Code not available yet.');
  }
  const img = Buffer.from(qrCodeBase64.split(',')[1], 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': img.length
  });
  res.end(img);
});

// Pairing route
app.get('/pair', async (req, res) => {
  if (!pairingCode) {
    return res.status(404).send('Pairing code not generated yet.');
  }
  res.send(`
    <h2>🔗 Your Pairing Code</h2>
    <p><b>${pairingCode}</b></p>
    <p>Use this in WhatsApp → Linked Devices → Enter Code</p>
  `);
});

// Start WhatsApp bot
async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr } = update;

    if (qr) {
      qrCodeBase64 = await qrcode.toDataURL(qr);
      pairingCode = null;
      logger.info('QR code generated.');
    }

    if (connection === 'open') {
      isConnected = true;
      qrCodeBase64 = null;
      pairingCode = null;
      logger.info('Bot connected ✅');
    } else if (connection === 'close') {
      isConnected = false;
      logger.error('Bot disconnected ❌');
      setTimeout(startBot, 5000); // auto-restart
    }
  });

  sock.ev.on('creds.update', saveState);

  // Pairing code
  if (!process.env.NUMBER) {
    logger.warn("⚠️ 'NUMBER' not set in environment variables. Skipping pairing code.");
    return;
  }

  try {
    const code = await sock.requestPairingCode(process.env.NUMBER);
    if (code) {
      pairingCode = code;
      qrCodeBase64 = null;
      logger.info('Pairing code generated.');
    }
  } catch (err) {
    logger.error("Failed to get pairing code:", err);
  }
}

// Start server + bot
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  startBot();
});
