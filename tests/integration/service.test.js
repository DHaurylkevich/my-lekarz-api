require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("Service routes", () => {
    let fakeService, server;

    before(async () => {
        server = app.listen(0);
        await db.sequelize.sync({ force: true });
    });
    after(async () => {
        await server.close();
    });

    beforeEach(async () => {
        fakeService = {
            name: faker.lorem.sentence(),
            price: 10.1,
        };
    });
    afterEach(async () => {
        await db.Specialties.destroy({ where: {} });
        await db.Clinics.destroy({ where: {} });
        await db.Services.destroy({ where: {} });
    });

    describe("Positive tests", () => {
        describe("POST /api/clinics/services", () => {
            let sessionCookies;
            beforeEach(async () => {
                const fakeClinicData = {
                    name: faker.company.buzzAdjective(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    nip: 1234567890,
                    nr_license: faker.vehicle.vin(),
                    email: "clinic@gmail.com",
                    phone: faker.phone.number({ style: 'international' }),
                };
                await db.Clinics.create(fakeClinicData);

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeClinicData.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];
            });
            it("expect to create service, when data is valid", async () => {
                const specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
                const specialtyId = specialtiesInDb.id;

                const response = await request(app)
                    .post(`/api/clinics/services`)
                    .send({ name: fakeService.name, price: fakeService.price, specialtyId })
                    .set('Cookie', sessionCookies)
                    .expect(201);

                expect(response.body).that.is.a("object");
                expect(response.body).have.property("name", fakeService.name);
            });
        });
        describe("GET /api/clinics/:clinicId/services", () => {
            let serviceId, testClinic;
            beforeEach(async () => {
                const fakeClinicData = {
                    name: faker.company.buzzAdjective(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    nip: 1234567890,
                    nr_license: faker.vehicle.vin(),
                    email: "clinic@gmail.com",
                    phone: faker.phone.number({ style: 'international' }),
                };
                testClinic = await db.Clinics.create(fakeClinicData);
                const createdService = await db.Services.create({ ...fakeService, clinic_id: testClinic.id });
                serviceId = createdService.id;
            });
            it("expect services, when they exists", async () => {
                const response = await request(app)
                    .get(`/api/clinics/${testClinic.id}/services/`)
                    .expect(200);

                expect(response.body[0]).to.have.property("id", serviceId);
                expect(response.body[0]).have.property("name", fakeService.name);
            });
        });
        describe("GET /api/doctors/:doctorId/services", () => {
            let testDoctor;
            beforeEach(async () => {
                testDoctor = await db.Doctors.create();
                const createdService = await db.Services.create(fakeService);
                await db.DoctorService.create({ doctor_id: testDoctor.id, service_id: createdService.id });
            });
            it("expect services, when they exists", async () => {
                const response = await request(app)
                    .get(`/api/doctors/${testDoctor.id}/services/`)
                    .expect(200);

                expect(response.body).to.is.an("array");
                expect(response.body[0].service).have.property("name", fakeService.name);
                expect(Number(response.body[0].service.price)).to.equal(Number(fakeService.price));
            });
        });
        describe("GET /api/services/:id", () => {
            let serviceId;
            beforeEach(async () => {
                const createdService = await db.Services.create(fakeService);
                serviceId = createdService.id;
            });
            it("expect service by id, when it exists", async () => {
                const response = await request(app)
                    .get(`/api/services/${serviceId}`)
                    .expect(200);
                expect(response.body).to.have.property("id", serviceId);
                expect(response.body).have.property("name", fakeService.name);
            });
        });
        describe("PUT /api/clinics/services/:serviceId", () => {
            let serviceId, sessionCookies;
            beforeEach(async () => {
                const fakeClinicData = {
                    name: faker.company.buzzAdjective(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    nip: 1234567890,
                    nr_license: faker.vehicle.vin(),
                    email: "clinic@gmail.com",
                    phone: faker.phone.number({ style: 'international' }),
                };
                const testClinic = await db.Clinics.create(fakeClinicData);

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeClinicData.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];
                const createdService = await db.Services.create({ ...fakeService, clinic_id: testClinic.id });
                serviceId = createdService.id;
            });
            it("expect to update service by id, when data valid and it exists", async () => {
                await request(app)
                    .put(`/api/clinics/services/${serviceId}`)
                    .send({ name: "TEST" })
                    .set('Cookie', sessionCookies)
                    .expect(200);

                const serviceInDB = await db.Services.findByPk(serviceId);

                expect(serviceInDB.name).to.equals("TEST");
            });
        });
        describe("DELETE /api/clinics/services/:serviceId", () => {
            let serviceId, sessionCookies;
            beforeEach(async () => {
                const fakeClinicData = {
                    name: faker.company.buzzAdjective(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    nip: 1234567890,
                    nr_license: faker.vehicle.vin(),
                    email: "clinic@gmail.com",
                    phone: faker.phone.number({ style: 'international' }),
                };
                const testClinic = await db.Clinics.create(fakeClinicData);

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeClinicData.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];

                const createdService = await db.Services.create({ ...fakeService, clinic_id: testClinic.id });
                serviceId = createdService.id;
            });
            it("expect delete service by id, when it exists", async () => {
                const response = await request(app)
                    .delete(`/api/clinics/services/${serviceId}`)
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("message", "Service deleted successfully");
                const serviceInDb = await db.Services.findByPk(serviceId);
                expect(serviceInDb).to.be.null;
            });
        });
    })
    describe("Negative tests", () => {
        describe("POST /api/clinics/services", () => {
            let specialtiesInDb, specialtyId;
            beforeEach(async () => {
                specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
                specialtyId = specialtiesInDb.id;
            });
            it("expect AppError('Name is required') error when creating a service without a name", async () => {
                const response = await request(app)
                    .post(`/api/clinics/services`)
                    .send({ price: fakeService.price, specialtyId })
                    .expect(400);

                expect(response.body).to.have.property("error");
                expect(response.body).to.have.property("message", "Name is required");
            });
            it("expect AppError('Price is required') error when creating a service without a price", async () => {
                const response = await request(app)
                    .post(`/api/clinics/services`)
                    .send({ name: fakeService.name, specialtyId })
                    .expect(400);

                expect(response.body).to.have.property("error");
                expect(response.body).to.have.property("message", "Price is required");
            });
            it("expect AppError('SpecialtyId is required') error when creating a service without a specialtyId", async () => {
                const response = await request(app)
                    .post(`/api/clinics/services`)
                    .send({ name: fakeService.name, price: fakeService.price })
                    .expect(400);

                expect(response.body).to.have.property("error");
                expect(response.body).to.have.property("message", "SpecialtyId is required");
            });
            it("expect AppError('Unauthorized user') error when attempting to create a service without authentication", async () => {
                const response = await request(app)
                    .post(`/api/clinics/services`)
                    .send({ name: fakeService.name, price: fakeService.price, specialtyId })
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied') error when user is not unauthorized user", async () => {
                const fakeUserData = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient"
                };
                await db.Users.create(fakeUserData);

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUserData.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .post(`/api/clinics/services`)
                    .send({ name: fakeService.name, price: fakeService.price, specialtyId })
                    .set('Cookie', sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
                await db.Users.destroy({ where: {} });
            });
            it("expect AppError('Service already exists') error when this service exist", async () => {
                const fakeClinicData = {
                    name: faker.company.buzzAdjective(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    nip: 1234567890,
                    nr_license: faker.vehicle.vin(),
                    email: "clinic@gmail.com",
                    phone: faker.phone.number({ style: 'international' }),
                };
                const createdClinic = await db.Clinics.create(fakeClinicData);

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeClinicData.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                const createdService = await db.Services.create({ ...fakeService, specialty_id: specialtyId, clinic_id: createdClinic.id });

                const response = await request(app)
                    .post(`/api/clinics/services`)
                    .send({ name: createdService.name, price: createdService.price, specialtyId, clinic_id: createdClinic.id })
                    .set('Cookie', sessionCookies)
                    .expect(409);

                expect(response.body).to.have.property("message", "Service already exists");
            });
        });
        describe("GET /api/services/:serviceId", () => {
            it("expect service by id, when it exists", async () => {
                const response = await request(app)
                    .get("/api/services/1")
                    .expect(404);

                expect(response.body).to.have.property("message", "Service not found");
            });
        });
        describe("PUT /api/clinics/services/:serviceId", () => {
            it("expect AppError('Unauthorized user') error when attempting to create a service without authentication", async () => {
                const response = await request(app)
                    .put("/api/clinics/services/1")
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied') error when user is not unauthorized user", async () => {
                const fakeUserData = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient"
                };
                await db.Users.create(fakeUserData);

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUserData.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .put("/api/clinics/services/1")
                    .set('Cookie', sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
                await db.Users.destroy({ where: {} });
            });
            it("expect AppError('Service not found') error when a service not found", async () => {
                const fakeClinicData = {
                    name: faker.company.buzzAdjective(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    nip: 1234567890,
                    nr_license: faker.vehicle.vin(),
                    email: "clinic@gmail.com",
                    phone: faker.phone.number({ style: 'international' }),
                };
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

                const response = await request(app)
                    .put("/api/clinics/services/1")
                    .send({ name: "Updated Service Name", price: 20.20 })
                    .set('Cookie', sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Service not found");
            });
        });
        describe("DELETE /api/clinics/services/:serviceId", () => {
            it("expect AppError('Unauthorized user') error when attempting to create a service without authentication", async () => {
                const response = await request(app)
                    .delete(`/api/clinics/services/1`)
                    .send({ name: "Updated Service Name", price: 20.20 })
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied') error when user is not unauthorized user", async () => {
                const fakeUserData = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient"
                };
                await db.Users.create(fakeUserData);

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUserData.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .delete(`/api/clinics/services/1`)
                    .set('Cookie', sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
                await db.Users.destroy({ where: {} });
            });
        });
    })
});