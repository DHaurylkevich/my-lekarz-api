process.env.NODE_ENV = "test";

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require("@faker-js/faker");
const app = require("../../index");
const db = require("../../src/models");

describe("Schedule routes", () => {
    let testDoctor, testClinic, fakeDoctor, server;

    before(async () => {
        server = app.listen(0);
        await db.sequelize.sync({ force: true });
    });
    after(async () => {
        await server.close();
    });

    beforeEach(async () => {
        testClinic = await db.Clinics.create({
            name: faker.company.buzzAdjective(),
            password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
            nip: 1234567890,
            nr_license: faker.vehicle.vin(),
            email: faker.internet.email(),
            phone: faker.phone.number({ style: "international" }),
            description: faker.lorem.sentence()
        });
        fakeDoctor = {
            clinic_id: testClinic.id,
            rating: faker.number.float({ min: 1, max: 5 }),
            hired_at: faker.date.past(),
            description: faker.lorem.paragraph()
        };
        testDoctor = await db.Doctors.create(fakeDoctor);
    });
    afterEach(async () => {
        await db.Users.destroy({ where: {} });
        await db.Schedules.destroy({ where: {} });
        await db.Doctors.destroy({ where: {} });
        await db.Clinics.destroy({ where: {} });
    });

    describe("Positive tests", () => {
        describe("POST /clinics/schedules/", () => {
            let sessionCookies;
            beforeEach(async () => {
                const response = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(response.body).to.have.property("user");

                sessionCookies = response.headers['set-cookie'];
            });
            it("expect to create schedule for one doctor by clinic, when one date is set and interval is 30", async () => {
                const testDoctor2 = await db.Doctors.create(fakeDoctor);

                const scheduleData = {
                    doctorsIds: [testDoctor.id, testDoctor2.id,],
                    interval: 30,
                    dates: ["2024-11-10"],
                    start_time: "09:00",
                    end_time: "12:00",
                };

                const response = await request(app)
                    .post(`/api/clinics/schedules/`)
                    .send(scheduleData)
                    .set("Cookie", sessionCookies)
                    .expect(201);

                expect(response.body.length).to.equal(scheduleData.doctorsIds.length);
                expect(response.body[0].available_slots).to.length(6);
                expect(response.body[0]).to.have.property("doctor_id", scheduleData.doctorsIds[0]);
                expect(response.body[0]).to.have.property("interval", scheduleData.interval);
                expect(response.body[0]).to.have.property("date", scheduleData.dates[0]);
            });
            it("expect to create schedule for one doctor by clinic, when one date is set and interval is 60", async () => {
                const testDoctor2 = await db.Doctors.create(fakeDoctor);

                const scheduleData = {
                    doctorsIds: [testDoctor.id, testDoctor2.id,],
                    interval: 60,
                    dates: ["2024-11-10"],
                    start_time: "09:00",
                    end_time: "12:00",
                };

                const response = await request(app)
                    .post(`/api/clinics/schedules/`)
                    .send(scheduleData)
                    .set("Cookie", sessionCookies)
                    .expect(201);
                expect(response.body.length).to.equal(scheduleData.doctorsIds.length);
                expect(response.body[0].available_slots).to.length(3);
                expect(response.body[0]).to.have.property("doctor_id", scheduleData.doctorsIds[0]);
                expect(response.body[0]).to.have.property("interval", scheduleData.interval);
                expect(response.body[0]).to.have.property("date", scheduleData.dates[0]);
            });
            it("expect to create schedule for two doctors by clinic, when two date is set", async () => {
                const testDoctor2 = await db.Doctors.create(fakeDoctor);

                const scheduleData = {
                    doctorsIds: [testDoctor.id, testDoctor2.id,],
                    interval: 30,
                    dates: ["2024-11-10", "2024-11-11"],
                    start_time: "09:00",
                    end_time: "12:00",
                };

                const response = await request(app)
                    .post(`/api/clinics/schedules/`)
                    .send(scheduleData)
                    .set("Cookie", sessionCookies)
                    .expect(201);

                scheduleData.doctorsIds.forEach((doctorId, doctorIndex) => {
                    scheduleData.dates.forEach((date, dateIndex) => {
                        const index = doctorIndex * scheduleData.dates.length + dateIndex;
                        expect(response.body[index]).to.have.property("doctor_id", doctorId);
                        expect(response.body[index]).to.have.property("date", date);
                    });
                });
                expect(response.body[0]).to.have.property("interval", scheduleData.interval);
            });
        });
        describe("GET /schedules", () => {
            it("expect to get schedule for doctors by clinic, when it exists", async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                const scheduleData = {
                    doctor_id: testDoctor.id,
                    clinic_id: testClinic.id,
                    date: new Date,
                    start_time: "09:00",
                    end_time: "12:00",
                    interval: 30,
                };
                const createdSchedule = await db.Schedules.create(scheduleData);

                const response = await request(app)
                    .get(`/api/schedules`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("totalHours");
                expect(response.body).to.have.property("schedules");
                expect(response.body.schedules[0]).to.have.property("id", createdSchedule.id);
                expect(response.body.schedules[0]).to.have.property("start_time", createdSchedule.start_time);
                expect(response.body.schedules[0]).to.have.property("doctor");
            });
            it("expect to get empty array for clinic, when schedule doesn't exists", async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .get(`/api/schedules`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("totalHours");
                expect(response.body).to.have.property("schedules");
                expect(response.body.schedules).to.be.an('array').that.is.empty;
            });
            it("expect to get schedule for doctor, when it exists", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "doctor",
                };
                const testUser = await db.Users.create(fakeUser);
                await testUser.setDoctor(testDoctor.id);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                const scheduleData = {
                    doctor_id: testDoctor.id,
                    clinic_id: testClinic.id,
                    date: new Date,
                    start_time: "09:00",
                    end_time: "12:00",
                    interval: 30,
                };
                const createdSchedule = await db.Schedules.create(scheduleData);

                const response = await request(app)
                    .get(`/api/schedules`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("totalHours");
                expect(response.body).to.have.property("schedules");
                expect(response.body.schedules[0]).to.have.property("id", createdSchedule.id);
                expect(response.body.schedules[0]).to.have.property("start_time", createdSchedule.start_time);
            });
            it("expect to get empty array for doctor, when schedule doesn't exists", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "doctor",
                };
                const testUser = await db.Users.create(fakeUser);
                await testUser.setDoctor(testDoctor.id);
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
                    .get(`/api/schedules`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("totalHours");
                expect(response.body).to.have.property("schedules");
                expect(response.body.schedules).to.be.an('array').that.is.empty;
            });
        });
        describe("GET /schedules/:scheduleId", () => {
            it("expect to get schedule by id, when it exists", async () => {
                const scheduleData = {
                    doctor_id: testDoctor.id,
                    clinic_id: testClinic.id,
                    date: "2024-11-10",
                    start_time: "09:00",
                    end_time: "12:00",
                    interval: 30,
                };
                const createdSchedule = await db.Schedules.create(scheduleData);

                const response = await request(app)
                    .get(`/api/schedules/${createdSchedule.id}`)
                    .expect(200);
                expect(response.body).to.have.property("id", createdSchedule.id);
                expect(response.body).to.have.property("doctor");
                expect(response.body).to.have.property("clinic");
            });
        });
        describe("PUT /schedules/:scheduleId", () => {
            it("expect to update schedule, when it exists", async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                const scheduleData = {
                    doctor_id: testDoctor.id,
                    clinic_id: testClinic.id,
                    date: "2024-11-10",
                    start_time: "09:00",
                    end_time: "12:00",
                    interval: 30,
                };
                const createdSchedule = await db.Schedules.create(scheduleData);
                const updateData = {
                    start_time: "10:00",
                    end_time: "13:00",
                    interval: 60,
                };

                const response = await request(app)
                    .put(`/api/schedules/${createdSchedule.id}`)
                    .send(updateData)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body.start_time).to.equal(updateData.start_time);
                expect(response.body.end_time).to.equal(updateData.end_time);
                expect(response.body.interval).to.equal(updateData.interval);
            });
        });
        describe("DELETE /schedules/:scheduleId", () => {
            it("expect to delete schedule, when it exists", async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                const scheduleData = {
                    doctor_id: testDoctor.id,
                    clinic_id: testClinic.id,
                    date: "2024-11-10",
                    start_time: "09:00",
                    end_time: "12:00",
                };
                const createdSchedule = await db.Schedules.create(scheduleData);

                const response = await request(app)
                    .delete(`/api/schedules/${createdSchedule.id}`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("message", "Schedule deleted successfully");
                const schedule = await db.Schedules.findByPk(createdSchedule.id)
                expect(schedule).to.not.exist;
            });
        });
    });
    describe("Negative tests", () => {
        describe("POST /clinics/schedules", () => {
            it("expect AppError('Unauthorized user'), when user don't unauthorize", async () => {
                const testDoctor2 = await db.Doctors.create(fakeDoctor);

                const scheduleData = {
                    doctorsIds: [testDoctor.id, testDoctor2.id,],
                    interval: 30,
                    dates: ["2024-11-10"],
                    start_time: "09:00",
                    end_time: "12:00",
                };

                const response = await request(app)
                    .post(`/api/clinics/schedules`)
                    .send(scheduleData)
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied'), when user role isn't 'clinic'", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "admin",
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
                const scheduleData = {
                    doctorsIds: [1],
                    interval: 30,
                    dates: ["2024-11-10"],
                    start_time: "09:00",
                    end_time: "12:00",
                };

                const response = await request(app)
                    .post(`/api/clinics/schedules/`)
                    .send(scheduleData)
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect AppError('One or more doctors not found'), when doctor doesn't exist", async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                const scheduleData = {
                    doctorsIds: [1],
                    interval: 30,
                    dates: ["2024-11-10"],
                    start_time: "09:00",
                    end_time: "12:00",
                };

                const response = await request(app)
                    .post(`/api/clinics/schedules/`)
                    .send(scheduleData)
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "One or more doctors not found");
            });
            it("expect AppError('One or more schedules already exist'), when schedule exists", async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                const scheduleData = {
                    doctorsIds: [testDoctor.id],
                    interval: 30,
                    dates: ["2024-11-10"],
                    start_time: "09:00",
                    end_time: "12:00",
                };
                await db.Schedules.create({ doctor_id: testDoctor.id, clinic_id: testClinic.id, interval: 30, date: "2024-11-10", start_time: "09:00", end_time: "12:00" });

                const response = await request(app)
                    .post(`/api/clinics/schedules/`)
                    .send(scheduleData)
                    .set("Cookie", sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("message", "One or more schedules already exist");
            });
        });
        describe("GET /schedules", () => {
            it("expect AppError('Unauthorized user'), when user don't unauthorize", async () => {
                const response = await request(app)
                    .get(`/api/schedules`)
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied'), when user role isn't 'clinic'", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "admin",
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
                    .get(`/api/schedules`)
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
        });
        describe("GET /schedules/:scheduleId", () => {
            it("expect AppError('Schedule not found'), when schedule doesn't exist", async () => {
                const response = await request(app)
                    .get("/api/schedules/1")
                    .expect(404);

                expect(response.body).to.have.property("message", "Schedule not found");
            });
        });
        describe("PUT /schedules/:scheduleId", () => {
            it("expect AppError('Unauthorized user'), when user don't unauthorize", async () => {
                const response = await request(app)
                    .put("/api/schedules/1")
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied'), when user role isn't 'clinic'", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "admin",
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
                    .put("/api/schedules/1")
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect AppError('Schedule not found'), when schedule doesn't exist", async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .put("/api/schedules/1")
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Schedule not found");
            });
        });
        describe("DELETE /schedules/:scheduleId", () => {
            it("expect AppError('Unauthorized user'), when user don't unauthorize", async () => {
                const response = await request(app)
                    .delete("/api/schedules/1")
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied'), when user role isn't 'clinic'", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "admin",
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
                    .delete("/api/schedules/1")
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect AppError('Schedule not found'), when schedule doesn't exist", async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .delete("/api/schedules/1")
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Schedule not found");
            });
        });
    });
});