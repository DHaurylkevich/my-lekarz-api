const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized user' });
};

const hasRole = (role) => {
    return (req, res, next) => {
        if (!Array.isArray(role) && req.user && req.user.role === role) {
            return next();
        } else if (req.user && role.includes(req.user.role)) {
            return next();
        }
        res.status(403).json({ message: 'Access denied' });
    };
};

module.exports = { isAuthenticated, hasRole };