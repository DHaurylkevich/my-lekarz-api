const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized user' });
};

const hasRole = (roles) => {
    return (req, res, next) => {
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (req.user && allowedRoles.includes(req.user.role)) {
            return next();
        }
        res.status(403).json({ message: 'Access denied' });
    };
};

module.exports = { isAuthenticated, hasRole };