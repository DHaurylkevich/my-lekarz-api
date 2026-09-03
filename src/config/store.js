const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const NODE_ENV = process.env.NODE_ENV || "development";

const conString = (NODE_ENV === "test"
    ? process.env.POSTGRES_URL_TEST
    : process.env.POSTGRES_PRISMA_URL) || "postgres://postgres:password@localhost/mylekarz";

const sessionStore = new pgSession({
    conString,
    tableName: 'session'
});

module.exports = sessionStore;
