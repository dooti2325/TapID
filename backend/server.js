const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('./app');
const logger = require('./config/logger');
const db = require('./config/database');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    logger.info(`TapID Backend server is running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
    logger.info('Shutting down server gracefully...');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Background Job: Check for missing heartbeats and mark devices offline
setInterval(async () => {
    try {
        await db.query(`
            UPDATE devices 
            SET status = 'offline' 
            WHERE status = 'online' AND last_heartbeat < NOW() - INTERVAL 30 SECOND
        `);
    } catch (err) {
        logger.error('Error in device offline cron job: ' + err.message);
    }
}, 15000); // Check every 15 seconds
