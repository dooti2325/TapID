const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/jwt');
const config = require('./config');

const generateToken = (payload, options = {}) => {
  const secret = getJwtSecret();
  const expiresIn = options.expiresIn || config.jwt.expiresIn;
  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token) => {
  const secret = getJwtSecret();
  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken,
};
