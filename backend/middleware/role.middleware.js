module.exports = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const allowed = Array.isArray(requiredRole) 
            ? requiredRole.includes(req.user.role) 
            : req.user.role === requiredRole;
            
        if (allowed) {
            next();
        } else {
            const roleStr = Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole;
            res.status(403).json({ message: `Access Denied: ${roleStr} only` });
        }
    };
};
