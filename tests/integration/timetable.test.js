process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");;

describe("Timetable routes", () => {
    let fakeClinicData, server;

    before(async () => {
        server = app.listen(0);
        await db.sequelize.sync({ force: true });
    });
    after(async () => {
        await server.close();
    });

    beforeEach(async () => {
        fakeClinicData = {
            name: faker.company.buzzAdjective(),
            password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
            nip: 1234567890,
            nr_license: faker.vehicle.vin(),
            email: "clinic@gmail.com",
            phone: faker.phone.number({ style: 'international' }),
        };
    });
    afterEach(async () => {
        await db.Clinics.destroy({ where: {} });
        await db.Timetables.destroy({ where: {} });
    });

    describe("Positive tests", () => {
        let sessionCookies, testClinic;
        beforeEach(async () => {
            testClinic = await db.Clinics.create(fakeClinicData);
            const res = await request(app)
                .post('/login')
                .send({
                    loginParam: fakeClinicData.email,
                    password: "123456789"
                })
                .expect(200);

            expect(res.body).to.have.property("user");
            sessionCookies = res.headers['set-cookie'];

            testTimetable = await db.Timetables.bulkCreate(
                Array.from({ length: 7 }, (_, i) => ({
                    clinic_id: testClinic.id,
                    day_of_week: i + 1,
                }))
            );
        });
        describe("PUT /api/clinics/timetable", () => {
            it("expect to update timetable for clinic, when data valid and it exists", async () => {
                const updatedData = [
                    {
                        id: testTimetable[0].id,
                        dayOfWeek: 1,
                        startTime: "09:00",
                        endTime: "18:00"
                    },
                    {
                        id: testTimetable[1].id,
                        dayOfWeek: 2,
                        startTime: "08:00",
                        endTime: "09:00"
                    }
                ];

                const response = await request(app)
                    .put(`/api/clinics/timetable`)
                    .send(updatedData)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body[0].start_time).not.to.equal(testTimetable.start_time);
                expect(response.body[0]).to.have.property("start_time", updatedData[0].startTime + ":00");
                expect(response.body[0]).to.have.property("end_time", updatedData[0].endTime + ":00");
                expect(response.body[1]).to.have.property("start_time", updatedData[1].startTime + ":00");
                expect(response.body[1]).to.have.property("end_time", updatedData[1].endTime + ":00");
                const timetableInDb = await testClinic.getTimetables();
                expect(timetableInDb).to.length(7);
            });
        });
    });
    describe("Negative tests", () => {
        describe("PUT /api/categories/:categoryId", () => {
            it("expect to AppError('Unauthorized user'), when user is not unauthorized", async () => {
                const response = await request(app)
                    .put(`/api/clinics/timetable`)
                    .send()
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect to AppError('Access denied'), when user is not unauthorized", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient",
                };
                await db.Users.create(fakeUser);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .put(`/api/clinics/timetable`)
                    .send()
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect to AppError('Invalid day of week. Must be between 1 and 7'), when dayOfWeek is less than 1", async () => {
                await db.Clinics.create(fakeClinicData);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeClinicData.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                const updatedData = {
                    id: 0,
                    dayOfWeek: 0
                };

                const response = await request(app)
                    .put(`/api/clinics/timetable`)
                    .send([updatedData])
                    .set("Cookie", sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("message", "Invalid day of week. Must be between 1 and 7");
            });
            it("expect to AppError('Invalid day of week. Must be between 1 and 7'), when dayOfWeek is greater than 7", async () => {
                await db.Clinics.create(fakeClinicData);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeClinicData.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                const updatedData = {
                    id: 0,
                    dayOfWeek: 8
                };

                const response = await request(app)
                    .put(`/api/clinics/timetable`)
                    .send([updatedData])
                    .set("Cookie", sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("message", "Invalid day of week. Must be between 1 and 7");
            });
            it("expect to AppError('Invalid time format or missing a variable'), when startTime or endTime not provide", async () => {
                await db.Clinics.create(fakeClinicData);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeClinicData.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                const updatedData = {
                    id: 0,
                    dayOfWeek: 1,
                    startTime: "09:00",
                };

                const response = await request(app)
                    .put(`/api/clinics/timetable`)
                    .send([updatedData])
                    .set("Cookie", sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("message", "Invalid time format or missing a variable");
            });
            it("expect to AppError('Invalid time format or missing a variable'), when startTime or endTime is invalid time", async () => {
                await db.Clinics.create(fakeClinicData);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeClinicData.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                const updatedData = {
                    id: 0,
                    dayOfWeek: 1,
                    startTime: "9:00",
                    endTime: "19:00",
                };

                const response = await request(app)
                    .put(`/api/clinics/timetable`)
                    .send([updatedData])
                    .set("Cookie", sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("message", "Invalid time format or missing a variable");
            });
            it("expect to AppError('Start time must be before end time'), when endTime is less than startTime", async () => {
                await db.Clinics.create(fakeClinicData);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeClinicData.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                const updatedData = {
                    id: 0,
                    dayOfWeek: 1,
                    startTime: "19:00",
                    endTime: "09:00",
                };

                const response = await request(app)
                    .put(`/api/clinics/timetable`)
                    .send([updatedData])
                    .set("Cookie", sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("message", "Start time must be before end time");
            });
        });
    });
});