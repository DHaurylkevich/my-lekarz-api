process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("Prescription routes", () => {
    let testMedication, server;

    before(async () => {
        server = app.listen(0);
        await db.sequelize.sync({ force: true });
    });
    after(async () => {
        await server.close();
    });

    beforeEach(async () => {
        fakePrescription = {
            expiration_date: faker.date.future(),
        };
        testMedication = await db.Medications.create({ name: faker.lorem.sentence() });
    });
    afterEach(async () => {
        await db.Prescriptions.destroy({ where: {} });
        await db.Medications.destroy({ where: {} });
        await db.Patients.destroy({ where: {} });
        await db.Doctors.destroy({ where: {} });
        await db.Users.destroy({ where: {} });
    });

    describe("Positive tests", () => {
        describe("POST /api/prescriptions", () => {
            let sessionCookies;
            beforeEach(async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "doctor",
                };
                const createdUser = await db.Users.create(fakeUser);
                await createdUser.createDoctor();

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];
            });
            it("expect to create prescriptions with 1 medication, when data is valid", async () => {
                const testPatient = await db.Patients.create();

                const response = await request(app)
                    .post("/api/prescriptions/")
                    .send({ expirationDate: faker.date.future(), patientId: testPatient.id, medicationsIds: [testMedication.id] })
                    .set("Cookie", sessionCookies)
                    .expect(201);

                expect(response.body).to.have.property("message", "Prescription created successfully");
                const prescriptionInDb = await db.Prescriptions.findAll({
                    include: [{ model: db.Medications, as: "medications", through: { attributes: [] }, attributes: ["name"] }]
                });
                expect(prescriptionInDb[0]).to.have.property("code");
                expect(prescriptionInDb[0]).to.have.property("expiration_date");
                expect(prescriptionInDb[0]).to.have.property("patient_id", testPatient.id);
                expect(prescriptionInDb[0]).to.have.property("medications");
                expect(prescriptionInDb[0].medications).to.have.length(1);
                expect(prescriptionInDb[0].medications[0]).to.have.property("name", testMedication.name);
            });
            it("expect to create prescriptions with 2 medication, when data is valid", async () => {
                const testMedication2 = await db.Medications.create({ name: faker.lorem.sentence() });
                const testPatient = await db.Patients.create();
                const expirationDate = faker.date.future();

                const response = await request(app)
                    .post("/api/prescriptions/")
                    .send({ expirationDate, patientId: testPatient.id, medicationsIds: [testMedication.id, testMedication2.id] })
                    .set("Cookie", sessionCookies)
                    .expect(201);

                expect(response.body).to.have.property("message", "Prescription created successfully");
                const prescriptionInDb = await db.Prescriptions.findAll({
                    include: [{ model: db.Medications, as: "medications", through: { attributes: [] }, attributes: ["name"] }]
                });
                expect(prescriptionInDb[0]).to.have.property("code");
                expect(prescriptionInDb[0]).to.have.property("expiration_date");
                expect(prescriptionInDb[0]).to.have.property("patient_id", testPatient.id);
                expect(prescriptionInDb[0]).to.have.property("medications");
                expect(prescriptionInDb[0].medications).to.have.length(2);
                expect(prescriptionInDb[0].medications[0]).to.have.property("name", testMedication.name);
                expect(prescriptionInDb[0].medications[1]).to.have.property("name", testMedication2.name);
            });
        });
        describe("GET /api/prescriptions", () => {
            let testDoctor, fakeUserPatient, testPatient, sessionCookies, testPrescription, testPrescription2;
            describe("doctor role:", async () => {
                beforeEach(async () => {
                    const fakeUser = {
                        email: faker.internet.email(),
                        password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                        role: "doctor",
                    };
                    const createdUserDoctor = await db.Users.create(fakeUser);
                    testDoctor = await createdUserDoctor.createDoctor();

                    const res = await request(app)
                        .post('/login')
                        .send({
                            loginParam: fakeUser.email,
                            password: "123456789"
                        })
                        .expect(200);

                    expect(res.body).to.have.property("user");
                    sessionCookies = res.headers['set-cookie'];

                    fakeUserPatient = {
                        email: faker.internet.email(),
                        password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                        role: "patient",
                    };
                    const createdUserPatient = await db.Users.create(fakeUserPatient);
                    testPatient = await createdUserPatient.createPatient();

                    testPrescription = await db.Prescriptions.create({ expirationDate: faker.date.future(), patient_id: testPatient.id, doctor_id: testDoctor.id });
                    testPrescription2 = await db.Prescriptions.create({ expirationDate: faker.date.future(), patient_id: testPatient.id, doctor_id: testDoctor.id });
                    await testPrescription.addMedication(testMedication);
                });
                it("expect get prescriptions with filter ASC, when they exists", async () => {
                    const response = await request(app)
                        .get(`/api/prescriptions`)
                        .set("Cookie", sessionCookies)
                        .query({ sort: "asc", page: 1, limit: 10 })
                        .expect(200);

                    expect(response.body).to.be.an("object");
                    expect(response.body).to.have.property("active");
                    expect(response.body).to.have.property("inactive");
                    expect(response.body.active).to.be.an("array");
                    expect(response.body.active[0]).to.include({
                        id: testPrescription.id,
                    });
                    expect(response.body.active[1]).to.include({
                        id: testPrescription2.id,
                    });
                });
                it("expect get prescriptions with filter DESC, when they exists", async () => {
                    const response = await request(app)
                        .get(`/api/prescriptions`)
                        .set("Cookie", sessionCookies)
                        .query({ sort: "desc", page: 1, limit: 10 })
                        .expect(200);

                    expect(response.body).to.be.an("object");
                    expect(response.body).to.have.property("active");
                    expect(response.body).to.have.property("inactive");
                    expect(response.body.active).to.be.an("array");
                    expect(response.body.active[0]).to.include({
                        id: testPrescription2.id,
                    });
                    expect(response.body.active[1]).to.include({
                        id: testPrescription.id,
                    });
                });
            });
            describe("patient role:", async () => {
                beforeEach(async () => {
                    const fakeUser = {
                        email: faker.internet.email(),
                        password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                        role: "patient",
                    };
                    const createdUserPatient = await db.Users.create(fakeUser);
                    testPatient = await createdUserPatient.createPatient();

                    const res = await request(app)
                        .post('/login')
                        .send({
                            loginParam: fakeUser.email,
                            password: "123456789"
                        })
                        .expect(200);

                    expect(res.body).to.have.property("user");
                    sessionCookies = res.headers['set-cookie'];

                    fakeUserPatient = {
                        email: faker.internet.email(),
                        password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                        role: "doctor",
                    };
                    const createdUserDoctor = await db.Users.create(fakeUserPatient);
                    testDoctor = await createdUserDoctor.createDoctor();

                    testPrescription = await db.Prescriptions.create({ expirationDate: faker.date.future(), patient_id: testPatient.id, doctor_id: testDoctor.id });
                    testPrescription2 = await db.Prescriptions.create({ expirationDate: faker.date.future(), patient_id: testPatient.id, doctor_id: testDoctor.id });
                    await testPrescription.addMedication(testMedication);
                });
                it("expect get prescriptions with filter ASC, when they exists", async () => {
                    const response = await request(app)
                        .get(`/api/prescriptions`)
                        .set("Cookie", sessionCookies)
                        .query({ sort: "ASC", page: 1, limit: 10 })
                        .expect(200);

                    expect(response.body).to.be.an("object");
                    expect(response.body).to.have.property("active");
                    expect(response.body).to.have.property("inactive");
                    expect(response.body.active).to.be.an("array");
                    expect(response.body.active[0]).to.include({
                        id: testPrescription.id,
                    });
                    expect(response.body.active[0]).to.have.property("code");
                    expect(response.body.active[1]).to.include({
                        id: testPrescription2.id,
                    });
                });
                it("expect get prescriptions with filter DESC, when they exists", async () => {
                    const response = await request(app)
                        .get(`/api/prescriptions`)
                        .set("Cookie", sessionCookies)
                        .query({ sort: "desc", page: 1, limit: 10 })
                        .expect(200);

                    expect(response.body).to.have.property("active");
                    expect(response.body).to.have.property("inactive");
                    expect(response.body.active).to.be.an("array");
                    expect(response.body.active[0]).to.include({
                        id: testPrescription2.id,
                    });
                    expect(response.body.active[0]).to.have.property("code");
                    expect(response.body.active[1]).to.include({
                        id: testPrescription.id,
                    });
                });
            });
        });
    });
    describe("Negative tests", () => {
        describe("POST /api/prescriptions", () => {
            it("expect to AppError('expirationDate is required'), when 'expirationDate' is not provided", async () => {
                const response = await request(app)
                    .post("/api/prescriptions/")
                    .send()
                    .expect(400);

                expect(response.body).to.have.property("message", "expirationDate is required");
            });
            it("expect to AppError('Unauthorized user'), when user is not unauthorized", async () => {
                const response = await request(app)
                    .post("/api/prescriptions/")
                    .send({ expirationDate: "" })
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
                    .post("/api/prescriptions/")
                    .send({ expirationDate: "" })
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect Error, when expiration date not be between today and 360 days from today", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "doctor",
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
                    .post("/api/prescriptions/")
                    .send({ expirationDate: new Date() })
                    .set("Cookie", sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("message", "Expiration date must be between today and 360 days from today");
            });
            it("expect AppError('Patient or medication not found'), when patient doesn't exist in Database", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "doctor",
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
                    .post("/api/prescriptions")
                    .send({ expirationDate: faker.date.future(), patientId: 1, medicationsIds: [testMedication.id] })
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Patient or medication not found");
            });
            it("expect AppError('Patient or medication not found'), when medication doesn't exist in Database", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "doctor",
                };
                const testPatient = await db.Patients.create();
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
                    .post("/api/prescriptions/")
                    .send({ expirationDate: faker.date.future(), patientId: testPatient.id, medicationsIds: [testMedication.id + 1] })
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Patient or medication not found");
            });
        });
    });
});