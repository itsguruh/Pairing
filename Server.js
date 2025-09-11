// Import the necessary modules from your package.json
const express = require('express');
const pino = require('pino');
const { WAConnection } = require('@whiskeysockets/baileys');

// Create a new Express application instance
const app = express();

// Set the port for the server, defaulting to 3000
const PORT = process.env.PORT || 3000;

// Set up a basic logger using pino
const logger = pino({ level: 'debug' });

// Set up a simple route for the root URL
app.get('/', (req, res) => {
    res.send('Your Node.js app is running!');
});

// An async function to set up the Baileys connection and other logic
async function startApp() {
    try {
        // Here you would add the rest of your Baileys logic,
        // such as creating the connection, listening for events, etc.
        logger.info('Starting up the Baileys connection...');

        // Example: This is a placeholder for your actual code
        const conn = new WAConnection();

        // Connect and handle events
        conn.on('open', () => logger.info('Connection to WhatsApp is now open!'));
        await conn.connect();

    } catch (error) {
        logger.error(error, 'Failed to start the application.');
        process.exit(1); // Exit with a failure code
    }
}

// Start the Express server
app.listen(PORT, () => {
    logger.info(`Server is listening on port ${PORT}`);
});

// Call the function to start the Baileys logic
startApp();
