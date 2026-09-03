const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

const NODE_ENV = process.env.NODE_ENV || "development";

const conString = (NODE_ENV === "test"
    ? process.env.POSTGRES_URL_TEST
    : process.env.POSTGRES_PRISMA_URL) || "postgres://postgres:password@localhost/mylekarz";

// connect-pg-simple v10 does NOT create the "session" table by default, so
// logins/registrations fail (or hang) on databases without it. Let the store
// create it on first use.
const isRemote = Boolean(conString) && !/localhost|127\.0\.0\.1/.test(conString);

const pool = new Pool({
    connectionString: conString,
    // Never let a request wait forever on an unreachable database: surface an
    // error (which becomes a proper HTTP response) after a short timeout.
    connectionTimeoutMillis: 5000,
    ...(isRemote ? { ssl: { rejectUnauthorized: false } } : {}),
});

const sessionStore = new pgSession({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
});

module.exports = sessionStore;
