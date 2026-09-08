const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);

  if (err.name === 'MulterError' || (err.message && err.message.startsWith('Only images'))) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A record with this identifier already exists',
    });
  }

  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(err.status || 500).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
