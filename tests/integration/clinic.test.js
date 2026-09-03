process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("Clinic routes", () => {
    let fakeClinic, addressData, server;

    before(async () => {
        server = app.listen(0);
        await db.sequelize.sync({ force: true });
    });
    after(async () => {
        await server.close();
    });


    beforeEach(async () => {
        fakeClinic = {
            name: faker.company.buzzAdjective(),
            nip: 1234567890,
            nr_license: faker.vehicle.vin(),
            email: faker.internet.email(),
            phone: faker.phone.number({ style: 'international' }),
            password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
            description: faker.lorem.sentence(),
        };
        addressData = {
            city: faker.location.city(),
            province: faker.location.state(),
            street: faker.location.street(),
            home: faker.location.buildingNumber(),
            flat: faker.location.buildingNumber(),
            post_index: faker.location.zipCode()
        };
    });
    afterEach(async () => {
        await db.Clinics.destroy({ where: {} });
        await db.Addresses.destroy({ where: {} });
    });

    describe("Positive tests", () => {
        describe("GET /api/clinics", () => {
            it("expect clinic by id, when it exists", async () => {
                const createdSpecialty = await db.Specialties.create({ name: "Test Special" });
                const createdServices = await createdSpecialty.createService({ name: "Test Special", price: "123" });
                const createdClinic = await db.Clinics.create(fakeClinic);
                await createdClinic.setServices(createdServices.id);
                await createdClinic.createAddress(addressData);

                const response = await request(app)
                    .get(`/api/clinics`)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("clinics").to.be.an("array");
            });
        });
        describe("GET /api/admins/clinics", () => {
            let sessionCookies;
            beforeEach(async () => {
                const fakeUser = {
                    last_name: faker.person.lastName(),
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
                sessionCookies = res.headers['set-cookie'];
            });
            it("expect clinics for admin, when it exists", async () => {
                await db.Clinics.create(fakeClinic);

                const response = await request(app)
                    .get(`/api/admins/clinics`)
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("clinics").to.be.an("array");
                expect(response.body.clinics[0]).to.have.property("name", fakeClinic.name);
            });
        });
        describe("GET /api/clinics/cities", () => {
            it("expect all cities that have a clinic, when they exists", async () => {
                let createdClinic = await db.Clinics.create(fakeClinic);
                addressData.city = "Novo";
                await createdClinic.createAddress(addressData);

                const response = await request(app)
                    .get(`/api/clinics/cities`)
                    .expect(200);

                expect(response.body).is.an("array");
                expect(response.body[0]).to.have.property("city", addressData.city);
                expect(response.body[0]).to.have.property("province", addressData.province);
            });
        });
        describe("GET /api/clinics/:clinicId", () => {
            it("expect clinic by id, when it exists", async () => {
                const createdClinic = await db.Clinics.create(fakeClinic);
                await createdClinic.createAddress(addressData);
                clinicId = createdClinic.id;

                const response = await request(app)
                    .get(`/api/clinics/${clinicId}`)
                    .expect(200);

                expect(response.body).to.have.property("id", clinicId);
                expect(response.body.name).to.equal(fakeClinic.name);
            });
        });
        describe("PUT /api/clinics", () => {
            it("expect to update clinic, when data valid and it exists", async () => {
                const createdClinic = await db.Clinics.create(fakeClinic);
                await createdClinic.createAddress(addressData);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                const updatedClinic = { name: faker.company.buzzAdjective() };
                const updatedAddress = { city: faker.location.city() };

                const response = await request(app)
                    .put(`/api/clinics`)
                    .send({ clinicData: updatedClinic, addressData: updatedAddress })
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("message", "Clinic updated successfully");
            });
        });
    });
    describe("Negative tests", () => {
        describe("POST /api/clinics", () => {
            it("expect return 401 'Unauthorized user' when authentication is missing", async () => {
                const response = await request(app)
                    .post("/api/clinics")
                    .expect(401);

                expect(response.body).to.have.property('message', 'Unauthorized user');
            });
            it("expect return 403 'Access denied', when user is not admin", async () => {
                const fakeUser = {
                    last_name: faker.person.lastName(),
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
                    .post("/api/clinics")
                    .set('Cookie', sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property('message', 'Access denied');
            });
        });
        describe("GET /api/admins/clinics", () => {
            it("expect return 401 'Unauthorized user' when authentication is missing", async () => {
                const response = await request(app)
                    .get(`/api/admins/clinics`)
                    .expect(401);

                expect(response.body).to.have.property('message', 'Unauthorized user');
            });
            it("expect return 403 'Access denied', when user is not admin", async () => {
                const fakeUser = {
                    last_name: faker.person.lastName(),
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
                    .get(`/api/admins/clinics`)
                    .set('Cookie', sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property('message', 'Access denied');
            });
        });
        describe("PUT /api/clinics/:id", () => {
            it("expect return 401 'Unauthorized user' when authentication is missing", async () => {
                const response = await request(app)
                    .put(`/api/clinics`)
                    .expect(401);

                expect(response.body).to.have.property('message', 'Unauthorized user');
            });
            it("expect return 403 'Access denied', when user is not admin", async () => {
                const fakeUser = {
                    last_name: faker.person.lastName(),
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
                    .put(`/api/clinics`)
                    .set('Cookie', sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property('message', 'Access denied');
            });
        });
    });
});