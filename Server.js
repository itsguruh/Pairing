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
const logger = pino({ level: 'info' });

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

let qrCodeBase64 = null;
let isConnected = false;

app.get('/', (req, res) => {
  res.send(`
    <h1>CRYPTIX-MD Session Generator ✅</h1>
    <p>Use <a href="/qr">/qr</a> to scan a QR Code</p>
    <p>Check <a href="/status">/status</a> to see connection</p>
  `);
});

app.get('/qr', (req, res) => {
  if (!qrCodeBase64) return res.status(404).send('QR Code not available yet.');
  res.send(`<img src="${qrCodeBase64}" />`);
});

app.get('/status', (req, res) => {
  res.json({ connected: isConnected });
});

async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      qrCodeBase64 = await QRCode.toDataURL(qr);
      logger.info('QR code generated!');
    }

    if (connection === 'open') {
      isConnected = true;
      qrCodeBase64 = null;
      logger.info('✅ Connected successfully');
    }

    if (connection === 'close') {
      isConnected = false;
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        startBot(); // auto reconnect
      }
    }
  });

  sock.ev.on('creds.update', saveState);
}

startBot();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
