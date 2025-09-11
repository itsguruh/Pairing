require('dotenv').config();
const express = require('express');
const pino = require('pino');
const path = require('path');
const {
  default: makeWASocket,
  useSingleFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  generateRegistrationCode
} = require('@whiskeysockets/baileys');
const { Buffer } = require('buffer');

const app = express();
const PORT = process.env.PORT || 3000;
const COMMAND_PREFIX = process.env.COMMAND_PREFIX || '!';
const logger = pino({ level: 'debug' });

const authFile = path.resolve('./auth_info.json');
const { state, saveState } = useSingleFileAuthState(authFile);

let latestQRCode = null;
let isConnected = false;

const rateLimitStore = new Map();
const RATE_LIMIT_TIME = 3000; // 3 seconds cooldown

app.get('/', (req, res) => {
  res.send('CRYPTIX-MD WhatsApp bot is running!');
});

app.get('/qr', (req, res) => {
  if (!latestQRCode) return res.status(404).send('QR code not available yet. Please wait...');
  const imgBuffer = Buffer.from(latestQRCode.split(',')[1], 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': imgBuffer.length
  });
  res.end(imgBuffer);
});

app.get('/status', (req, res) => {
  res.json({ connected: isConnected });
});

async function startApp() {
  try {
    logger.info('Fetching latest Baileys version...');
    const { version } = await fetchLatestBaileysVersion();
    logger.info(`Using Baileys version: ${version}`);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      version,
    });

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr, pairingQRCode } = update;

      if (qr) {
        logger.info('Old-style QR code received (terminal output)');
        console.log(qr);
      }

      if (pairingQRCode) {
        const { code, qrCodeData } = generateRegistrationCode(pairingQRCode);
        logger.info(`New pairing code: ${code}`);
        latestQRCode = qrCodeData;
      }

      if (connection === 'close') {
        isConnected = false;
        const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
        logger.info(`Connection closed. Reconnect? ${shouldReconnect}`);
        if (shouldReconnect) {
          logger.info('Reconnecting...');
          startApp();
        } else {
          logger.warn('Logged out. Delete auth_info.json and re-authenticate.');
          process.exit(0);
        }
      } else if (connection === 'open') {
        isConnected = true;
        logger.info('WhatsApp connection opened!');
        latestQRCode = null;
      }
    });

    sock.ev.on('creds.update', saveState);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;
        const senderId = msg.key.remoteJid;
        const messageType = Object.keys(msg.message)[0];
        let text = '';

        // Extract text from different message types
        if (msg.message.conversation) text = msg.message.conversation;
        else if (msg.message[messageType]?.text) text = msg.message[messageType].text;
        else if (msg.message[messageType]?.caption) text = msg.message[messageType].caption;

        logger.info(`Message from ${senderId}: ${text || '[non-text message]'}`);

        // Rate limiting commands only
        if (text.startsWith(COMMAND_PREFIX)) {
          const lastCommandTime = rateLimitStore.get(senderId) || 0;
          if (Date.now() - lastCommandTime < RATE_LIMIT_TIME) {
            logger.info(`Rate limited command from ${senderId}`);
            continue;
          }
          rateLimitStore.set(senderId, Date.now());

          const commandBody = text.slice(COMMAND_PREFIX.length).trim().toLowerCase();

          if (commandBody === 'ping') {
            await sock.sendMessage(senderId, { text: 'Pong! 🏓' });
          } else if (commandBody === 'help') {
            const helpMsg = `*CRYPTIX-MD Commands:*\n` +
              `• ${COMMAND_PREFIX}ping - Check bot status\n` +
              `• ${COMMAND_PREFIX}help - Show this help message\n`;
            await sock.sendMessage(senderId, { text: helpMsg });
          } else {
            await sock.sendMessage(senderId, { text: `Unknown command: ${commandBody}\nTry ${COMMAND_PREFIX}help` });
          }
          continue; // skip media echo if command
        }

        // Media handling — echo back images, stickers, audio
        if (msg.message.imageMessage) {
          const stream = await sock.downloadMediaMessage(msg);
          await sock.sendMessage(senderId, { image: stream, caption: 'Here is your image back!' });
        } else if (msg.message.stickerMessage) {
          const stream = await sock.downloadMediaMessage(msg);
          await sock.sendMessage(senderId, { sticker: stream });
        } else if (msg.message.audioMessage) {
          const stream = await sock.downloadMediaMessage(msg);
          await sock.sendMessage(senderId, { audio: stream, mimetype: 'audio/mpeg' });
        } else if (msg.message.videoMessage) {
          const stream = await sock.downloadMediaMessage(msg);
          await sock.sendMessage(senderId, { video: stream, caption: 'Here is your video back!' });
        } else {
          // Optionally reply to non-command text (uncomment to enable)
          // await sock.sendMessage(senderId, { text: `Hi! Use ${COMMAND_PREFIX}help to see commands.` });
        }
      }
    });

    // Welcome message when new chat opens (only individual chats)
    sock.ev.on('chats.upsert', async (chats) => {
      for (const chat of chats) {
        if (!chat.readOnly && chat.id.endsWith('@s.whatsapp.net')) {
          try {
            await sock.sendMessage(chat.id, { text: `Hello! I am CRYPTIX-MD. Type ${COMMAND_PREFIX}help to see commands.` });
            logger.info(`Sent welcome message to ${chat.id}`);
          } catch (e) {
            logger.error(e, `Failed to send welcome message to ${chat.id}`);
          }
        }
      }
    });

  } catch (error) {
    logger.error(error, 'Failed to start Baileys connection.');
    process.exit(1);
  }
}

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

startApp();
