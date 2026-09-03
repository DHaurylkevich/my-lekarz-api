const cron = require('node-cron');
const { Op } = require("sequelize");
const db = require("../models");
const moment = require('moment');

const task = cron.schedule('*/10 * * * *', async () => {
    try {
        const now = moment();
        const today = now.format('YYYY-MM-DD');
        const currentTime = now.format('HH:mm:ss');

        const appointments = await db.Appointments.findAll({
            where: {
                status: 'active',
                [Op.or]: [
                    { '$Schedule.date$': { [Op.lt]: today } },
                    {
                        '$Schedule.date$': today,
                        time_slot: { [Op.lte]: currentTime }
                    }
                ]
            },
            include: [{ model: db.Schedules }]
        });

        for (const appointment of appointments) {
            await appointment.update({ status: 'completed' });
        }
    } catch (err) {
        console.error('Cron task error:', err);
    }
}, {
    scheduled: false
});

const startCron = () => {
    task.start();
    console.log('Cron task started');
};

const stopCron = () => {
    task.stop();
    console.log('Cron task stopped');
};

module.exports = { startCron, stopCron };