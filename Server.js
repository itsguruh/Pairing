const express = require('express');
const pino = require('pino');
const path = require('path');
const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

// Express setup
const app = express();
const PORT = process.env.PORT || 3000;
const logger = pino({ level: 'debug' });

// Simple route
app.get('/', (req, res) => {
    res.send('CRYPTIX-MD WhatsApp bot is running!');
});

// Baileys auth state
const authFile = path.resolve('./auth_info.json');
const { state, saveState } = useSingleFileAuthState(authFile);

async function startApp() {
    try {
        logger.info('Starting Baileys connection...');

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
        });

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                logger.info('Connection closed. Reconnecting:', shouldReconnect);
                if (shouldReconnect) {
                    startApp();
                } else {
                    logger.info('Logged out from WhatsApp, please re-authenticate.');
                    process.exit(0);
                }
            } else if (connection === 'open') {
                logger.info('Connection opened!');
            }
        });

        sock.ev.on('creds.update', saveState);

        // You can add event handlers here, e.g., message handling

    } catch (error) {
        logger.error(error, 'Failed to start Baileys connection.');
        process.exit(1);
    }
}

// Start Express server
app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
});

// Start Baileys connection
startApp();
