process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("Patient routes", () => {
    let fakeUser, server;

    before(async () => {
        server = app.listen(0);
        await db.sequelize.sync({ force: true });
    });
    after(async () => {
        await server.close();
    });

    beforeEach(async () => {
        fakeUser = {
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
            role: "doctor",
        };
    });
    afterEach(async () => {
        await db.Patients.destroy({ where: {} });
        await db.Users.destroy({ where: {} });
        await db.Appointments.destroy({ where: {} });
    });

    describe("Positive tests", () => {
        describe("GET /api/patients", () => {
            let testClinic, testService, testPatient, createdUser;
            beforeEach(async () => {
                const fakeUser = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                    pesel: 12345678981,
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient",
                };
                createdUser = await db.Users.create(fakeUser);
                testPatient = await createdUser.createPatient();
                const fakeClinic = {
                    name: faker.company.name(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    nip: faker.number.int({ min: 1000000000, max: 9999999999 }),
                    nr_license: faker.vehicle.vin(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                };
                testClinic = await db.Clinics.create(fakeClinic);
                testService = await db.Services.create({
                    name: 'Test Service',
                    description: 'Test Service Description',
                    price: 100
                });
            });
            afterEach(async () => {
                await db.DoctorService.destroy({ where: {} });
                await db.Services.destroy({ where: {} });
                await db.Doctors.destroy({ where: {} });
            });
            it("expect to return patients by doctor, when they exist", async () => {
                const testUser = await db.Users.create(fakeUser);
                const testDoctor = await testUser.createDoctor();
                const testDoctorService = await db.DoctorService.create({ doctor_id: testDoctor.id, service_id: testService.id });
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                await db.Appointments.create({
                    time_slot: "10:00",
                    patient_id: testPatient.id,
                    doctor_service_id: testDoctorService.id,
                    clinic_id: testClinic.id,
                    appointment_date: new Date()
                });

                const response = await request(app)
                    .get("/api/patients")
                    .query({
                        sort: 'asc',
                        limit: 10,
                        pages: 0,
                    })
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("patients").to.be.an("array");
                expect(response.body.patients[0].patient.user).to.have.property("first_name", createdUser.first_name);
            });
            it("expect to return patients by clinic, when they exist", async () => {
                const testUser = await db.Users.create(fakeUser);
                const testDoctor = await testUser.createDoctor();
                const testDoctorService = await db.DoctorService.create({ doctor_id: testDoctor.id, service_id: testService.id });
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                await db.Appointments.create({
                    time_slot: "10:00",
                    patient_id: testPatient.id,
                    doctor_service_id: testDoctorService.id,
                    clinic_id: testClinic.id,
                    appointment_date: new Date()
                });

                const response = await request(app)
                    .get("/api/patients")
                    .query({
                        sort: 'asc',
                        limit: 10,
                        pages: 0,
                    })
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("patients").to.be.an("array");
                expect(response.body.patients[0].patient.user).to.have.property("first_name", createdUser.first_name);
                await db.Clinics.destroy({ where: {} });
            });
            it("should return patients sorted in descending order", async () => {
                const testUser = await db.Users.create(fakeUser);
                const testDoctor = await testUser.createDoctor();
                const testDoctorService = await db.DoctorService.create({ doctor_id: testDoctor.id, service_id: testService.id });
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                await db.Appointments.create({
                    time_slot: "10:00",
                    patient_id: testPatient.id,
                    doctor_service_id: testDoctorService.id,
                    clinic_id: testClinic.id,
                    appointment_date: new Date()
                });
                fakeUser.first_name = "Z";
                fakeUser.email = "test@gmail.com";
                const anotherUser = await db.Users.create(fakeUser);
                const anotherPatient = await anotherUser.createPatient();
                await db.Appointments.create({
                    time_slot: "10:00",
                    patient_id: anotherPatient.id,
                    doctor_service_id: testDoctorService.id,
                    clinic_id: testClinic.id,
                    appointment_date: new Date()
                });

                const response = await request(app)
                    .get("/api/patients")
                    .query({
                        sort: 'desc',
                        limit: 10,
                        pages: 0,
                    })
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("patients").to.be.an("array");
                expect(response.body.patients[0].patient.user).to.have.property("first_name", anotherUser.first_name);
                await db.Clinics.destroy({ where: {} });
            });
        });
        describe("GET /api/patients/:patientId", () => {
            let createdUser, testPatient, testService;
            beforeEach(async () => {
                const fakeUser = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                    pesel: 12345678981,
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient",
                    birthday: faker.date.past(30)
                };
                createdUser = await db.Users.create(fakeUser);
                testPatient = await createdUser.createPatient();
                testService = await db.Services.create({
                    name: 'Test Service',
                    description: 'Test Service Description',
                    price: 100
                });
            });
            it("expect patient by patientId for doctor, when it exists", async () => {
                const testUser = await db.Users.create(fakeUser);
                const testDoctor = await testUser.createDoctor();
                const testDoctorService = await db.DoctorService.create({ doctor_id: testDoctor.id, service_id: testService.id });
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                await db.Appointments.create({
                    time_slot: "10:00",
                    patient_id: testPatient.id,
                    doctor_service_id: testDoctorService.id,
                    clinic_id: null,
                    appointment_date: new Date()
                });

                const response = await request(app)
                    .get(`/api/patients/${testPatient.id}`)
                    .set('Cookie', sessionCookies)
                    .expect(200);
                expect(response.body.patient).to.have.property("id", testPatient.id);
                expect(response.body.patient.user).to.have.property("first_name", createdUser.first_name);
                await db.DoctorService.destroy({ where: {} });
                await db.Services.destroy({ where: {} });
                await db.Doctors.destroy({ where: {} });
            });
            it("expect patient by patientId for admin, when it exists", async () => {
                fakeUser.role = "admin";
                await db.Users.create(fakeUser);
                const testDoctor = await db.Doctors.create();
                const testDoctorService = await db.DoctorService.create({ doctor_id: testDoctor.id, service_id: testService.id });
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                await db.Appointments.create({
                    time_slot: "10:00",
                    patient_id: testPatient.id,
                    doctor_service_id: testDoctorService.id,
                    clinic_id: null,
                    appointment_date: new Date()
                });

                const response = await request(app)
                    .get(`/api/patients/${testPatient.id}`)
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body.patient).to.have.property("id", testPatient.id);
                expect(response.body.patient.user).to.have.property("first_name", createdUser.first_name);
                await db.DoctorService.destroy({ where: {} });
                await db.Services.destroy({ where: {} });
                await db.Doctors.destroy({ where: {} });
            });
        });
        describe("GET /api/admins/patients", () => {
            let sessionCookies, testPatient, createdUser, fakeMaleUser, fakeFemaleUser;
            beforeEach(async () => {
                fakeUser.role = "admin";
                await db.Users.create(fakeUser);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];
                fakeMaleUser = {
                    first_name: faker.person.firstName(),
                    gender: "male",
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                };
                createdUser = await db.Users.create(fakeMaleUser);
                await createdUser.createPatient();
                fakeFemaleUser = {
                    first_name: faker.person.firstName(),
                    gender: "female",
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                };
                createdUser = await db.Users.create(fakeFemaleUser);
                await createdUser.createPatient();
            });
            it("expect to return patients for admin, when they exist", async () => {
                const response = await request(app)
                    .get("/api/admins/patients")
                    .query({
                        sort: 'asc',
                        limit: 10,
                        pages: 0,
                    })
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("patients").to.be.an("array").is.length(2);
            });
            it("expect to return patients for admin with 'male' filter, when they exist", async () => {
                const response = await request(app)
                    .get("/api/admins/patients")
                    .query({
                        sort: 'asc',
                        limit: 10,
                        pages: 0,
                        gender: "male"
                    })
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("patients").to.be.an("array").is.length(1);
                expect(response.body.patients[0].user).to.have.property("first_name", fakeMaleUser.first_name);
            });
            it("expect to return patients for admin with 'female' filter, when they exist", async () => {
                const response = await request(app)
                    .get("/api/admins/patients")
                    .query({
                        sort: 'asc',
                        limit: 10,
                        pages: 0,
                        gender: "female"
                    })
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("patients").to.be.an("array").is.length(1);
                expect(response.body.patients[0].user).to.have.property("first_name", fakeFemaleUser.first_name);
            });
        });
    });
    describe("Negative tests", () => {
        describe("GET /api/patients", () => {
            it("expect return 401 'Unauthorized user' when authentication is missing", async () => {
                const response = await request(app)
                    .get("/api/patients")
                    .expect(401);

                expect(response.body).to.have.property('message', 'Unauthorized user');
            });
            it("expect return 403 'Access denied', when user is not a doctor or clinic", async () => {
                fakeUser.role = "admin";
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
                    .get("/api/patients")
                    .set('Cookie', sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property('message', 'Access denied');
            });
        });
        describe("GET /api/patient/:patientId", () => {
            it("expect AppError('Unauthorized user'),when authentication is missing", async () => {
                const response = await request(app)
                    .get("/api/patients/1")
                    .expect(401);

                expect(response.body).to.have.property('message', 'Unauthorized user');
            });
            it("expect AppError('Access denied'), when user is not a doctor or admin", async () => {
                fakeUser.role = "patient";
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
                    .get("/api/patients/1")
                    .set('Cookie', sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property('message', 'Access denied');
            });
            it("expect AppError('Patient not found'), when patient by id doesn't exist", async () => {
                fakeUser.role = "admin";
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
                    .get("/api/patients/1")
                    .set('Cookie', sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property('message', 'Patient not found');
            });
        });
        describe("GET /api/admins/patients", () => {
            it("expect return 401 'Unauthorized user' when authentication is missing", async () => {
                const response = await request(app)
                    .get("/api/admins/patients")
                    .expect(401);

                expect(response.body).to.have.property('message', 'Unauthorized user');
            });
            it("expect return 403 'Access denied', when user is not admin", async () => {
                fakeUser.role = "patient";
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
                    .get("/api/admins/patients")
                    .set('Cookie', sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property('message', 'Access denied');
            });
        });
    });
});