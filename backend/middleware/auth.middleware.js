const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/jwt');

module.exports = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), getJwtSecret());
        req.user = verified;
        next();
    } catch (err) {
        const status = err.message.includes('JWT_SECRET') ? 500 : 400;
        res.status(status).json({ message: status === 500 ? err.message : 'Invalid Token' });
    }
};
