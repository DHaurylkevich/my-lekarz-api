'use strict';

// The session table used by express-session + connect-pg-simple. It is not a
// Sequelize model, so sync() and the other migrations never create it — without
// it, login/register requests cannot persist a session.
// Mirrors node_modules/connect-pg-simple/table.sql.
module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.query(`
            CREATE TABLE IF NOT EXISTS "session" (
              "sid" varchar NOT NULL COLLATE "default",
              "sess" json NOT NULL,
              "expire" timestamp(6) NOT NULL
            )
            WITH (OIDS=FALSE);
        `);

        await queryInterface.sequelize.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'session_pkey') THEN
                    ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");
                END IF;
            END $$;
        `);

        await queryInterface.sequelize.query(`
            CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
        `);
    },
    async down(queryInterface) {
        await queryInterface.dropTable('session');
    }
};
