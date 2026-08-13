const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });
const app = require('./app');
const logger = require('./config/logger');

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
