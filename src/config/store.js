const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const sessionStore = new pgSession({
    conString: process.env.POSTGRES_PRISMA_URL || "postgres://postgres:password@localhost/mylekarz",
    tableName: 'session'
});

module.exports = sessionStore;