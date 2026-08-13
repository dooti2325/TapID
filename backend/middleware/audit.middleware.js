const db = require('../config/database');

const auditLogger = async (req, res, next) => {
    if (process.env.NODE_ENV === 'test') {
        return next();
    }

    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        res.on('finish', async () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    const userId = req.user ? req.user.id : null;
                    const action = `${req.method}_${req.originalUrl.split('/')[2] || 'UNKNOWN'}`.toUpperCase();
                    const details = `Path: ${req.originalUrl}, Body Keys: ${Object.keys(req.body).join(',')}`;
                    
                    await db.execute(
                        'INSERT INTO audit_logs (user_id, action, entity_type, details) VALUES (?, ?, ?, ?)',
                        [userId, action, 'API_CALL', details]
                    );
                } catch (err) {
                    req.app.get('logger')?.error?.(`Audit Log Error: ${err.message}`);
                }
            }
        });
    }
    next();
};

module.exports = auditLogger;
