'use strict';

module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.query(
            "ALTER TYPE \"enum_appointments_status\" ADD VALUE IF NOT EXISTS 'canceled';"
        );
    },
    async down(queryInterface) {
        await queryInterface.sequelize.query(
            `DELETE FROM pg_enum
             WHERE enumlabel = 'canceled'
               AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_appointments_status');`
        );
    }
};
