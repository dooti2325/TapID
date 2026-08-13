const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'secret');
    if (!secret || (process.env.NODE_ENV === 'production' && secret.length < 32)) {
        throw new Error('JWT_SECRET must be set to at least 32 characters in production');
    }
    return secret;
};

module.exports = { getJwtSecret };
