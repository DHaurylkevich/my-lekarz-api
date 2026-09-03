const cron = require('node-cron');
const { Op } = require("sequelize");
const db = require("../models");
const moment = require('moment');

const task = cron.schedule('*/10 * * * *', async () => {
    const now = moment();
    const appointments = await db.Appointments.findAll({
        where: {
            status: 'active',
            '$schedule.date$': { [Op.lte]: now.format('YYYY-MM-DD') },
            '$time_slot$': { [Op.lte]: now.format('HH:mm:ss') }
        },
        include: [{ model: db.Schedules, as: 'schedule' }]
    });

    for (const appointment of appointments) {
        await appointment.update({ status: 'completed' });
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