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
const express = require("express");
const app = express();

// Homepage
app.get("/", (req, res) => {
  res.send(`
    <h1>CRYPTIX-MD Session Generator ✅</h1>
    <p>Welcome! Use <a href="/pair">/pair</a> to generate your Session ID.</p>
  `);
});

// Pairing route
app.get("/pair", (req, res) => {
  res.send("QR Code & Pairing logic will be here 🚀");
});

// Heroku PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
