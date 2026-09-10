/**
 * Device Authentication Middleware
 * Validates X-Device-Key header against configured DEVICE_API_KEY.
 */
module.exports = (req, res, next) => {
    const configuredKey = process.env.DEVICE_API_KEY;

    // In production, DEVICE_API_KEY must be configured
    if (process.env.NODE_ENV === 'production' && !configuredKey) {
        return res.status(500).json({
            success: false,
            message: 'Server configuration error: DEVICE_API_KEY is not configured',
        });
    }

    // If key is configured, enforce strict verification
    if (configuredKey) {
        const deviceKey = req.header('X-Device-Key');
        if (!deviceKey || deviceKey !== configuredKey) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid or missing Device API Key',
            });
        }
    }

    next();
};
