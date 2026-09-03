const jwt = require('jsonwebtoken');

const createJWT = (userId, role) => {
    const payload = {
        id: userId,
        role: role
    };

    const options = {
        expiresIn: '24h'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, options);
};

module.exports = createJWT;