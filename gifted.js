const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");
const qrcode = require('qrcode');
const { default: Gifted_Tech, useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers } = require("@whiskeysockets/baileys");
const pino = require("pino");
require('events').EventEmitter.defaultMaxListeners = 500;

const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve 'main.html' as default homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.html'));
});

// Serve 'pair.html' when visiting '/pair'
app.get('/pair', (req, res) => {
  res.sendFile(path.join(__dirname, 'pair.html'));
});

// Generate QR code dynamically
app.get('/qr', async (req, res) => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./temp/qr-session');
    let qrString = "";

    const sock = Gifted_Tech({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
      },
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      browser: Browsers.macOS("Safari")
    });

    sock.ev.on("connection.update", (update) => {
      const { qr } = update;
      if (qr) {
        qrcode.toDataURL(qr, (err, url) => {
          if (err) {
            res.status(500).send("Error generating QR");
          } else {
            res.send(`<img src="${url}" alt="QR Code" style="width:300px;height:300px;">`);
          }
        });
      }
    });

    sock.ev.on("creds.update", saveCreds);
  } catch (error) {
    console.error("QR Error:", error);
    res.status(500).send("Failed to generate QR");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
Deployment Successful!

CRYPTIX-MD Session Server Running on http://localhost:${PORT}
  `);
});

module.exports = app;// Start server
app.listen(PORT, () => {
  console.log(`
Deployment Successful!

CRYPTIX-MD Session Server Running on http://localhost:${PORT}
  `);
});

module.exports = app;
