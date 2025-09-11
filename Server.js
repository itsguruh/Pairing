require('dotenv').config();
const express = require('express');
const pino = require('pino');
const {
  default: makeWASocket,
  useSingleFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const logger = pino({ level: 'info' });

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

let qrCodeBase64 = null;
let isConnected = false;

app.get('/', (req, res) => {
  res.send('CRYPTIX-MD is up and running 🚀');
});

app.get('/qr', (req, res) => {
  if (!qrCodeBase64) return res.status(404).send('QR Code not available yet.');
  const img = Buffer.from(qrCodeBase64.split(',')[1], 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': img.length
  });
  res.end(img);
});

app.get('/status', (req, res) => {
  res.json({ connected: isConnected });
});

async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    getMessage: async () => ({ conversation: 'placeholder' }),
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      const QRCode = require('qrcode');
      QRCode.toDataURL(qr, (err, url) => {
        qrCodeBase64 = url;
        logger.info('QR code generated. Visit /qr to scan.');
      });
    }

    if (connection === 'open') {
      logger.info('✅ Bot is connected to WhatsApp!');
      isConnected = true;
      qrCodeBase64 = null;
    }

    if (connection === 'close') {
      isConnected = false;
      const reason = lastDisconnect?.error?.output?.statusCode;
      logger.warn(`❌ Connection closed. Reason: ${reason}`);
      if (reason !== DisconnectReason.loggedOut) {
        logger.info('Reconnecting...');
        startBot();
      }
    }
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const messageType = Object.keys(msg.message)[0];
    let text = '';

    if (msg.message.conversation) text = msg.message.conversation;
    else if (msg.message[messageType]?.text) text = msg.message[messageType].text;
    else if (msg.message[messageType]?.caption) text = msg.message[messageType].caption;

    if (text === '!ping') {
      await sock.sendMessage(from, { text: 'Pong! 🏓' });
    } else if (text === '!help') {
      await sock.sendMessage(from, {
        text: '*CRYPTIX-MD Commands:*\n\n' +
              '• `!ping` - Bot status\n' +
              '• `!help` - Show help'
      });
    } else {
      await sock.sendMessage(from, { text: `Hi! Type *!help* to see available commands.` });
    }
  });
}

app.listen(PORT, () => {
  logger.info(`🌐 Express server started on port ${PORT}`);
  startBot();
});
