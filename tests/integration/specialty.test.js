require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("Specialty routes", () => {
    let fakeSpecialty, server;

    before(async () => {
        server = app.listen(0);
        await db.sequelize.sync({ force: true });
    });
    after(async () => {
        await server.close();
    });

    beforeEach(async () => {
        fakeSpecialty = {
            name: faker.lorem.sentence(),
        };
    });
    afterEach(async () => {
        await db.Users.destroy({ where: {} });
        await db.Specialties.destroy({ where: {} });
        await db.Services.destroy({ where: {} });
        await db.Clinics.destroy({ where: {} });
    });

    describe("Positive tests", () => {
        describe("POST /api/specialties", () => {
            let sessionCookies;
            beforeEach(async () => {
                const fakeUser = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                    pesel: 12345678901,
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "admin",
                    birthday: faker.date.past(30)
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
            it("expect to create specialty, when data is valid", async () => {
                const response = await request(app)
                    .post("/api/specialties")
                    .send(fakeSpecialty)
                    .set('Cookie', sessionCookies)
                    .expect(201);

                expect(response.body).that.is.a("object");
                expect(response.body.name).to.deep.equals(fakeSpecialty.name);
            });
        });
        describe("GET /api/specialties", () => {
            it("expect specialties, when they exist", async () => {
                const createdSpecialty = await db.Specialties.create(fakeSpecialty);
                const specialtyId = createdSpecialty.id;

                const response = await request(app)
                    .get("/api/specialties/")
                    .expect(200);

                expect(response.body[0]).to.have.property("id", specialtyId);
                expect(response.body[0].name).to.equal(fakeSpecialty.name);
            });
            it("expect empty array, when they don't exist", async () => {
                const response = await request(app)
                    .get("/api/specialties/")
                    .expect(200);

                expect(response.body).to.be.an("array");
            });
        });
        describe("GET /api/clinic/:id/specialties", () => {
            let fakeClinic, createdClinic, specialtiesInDb, specialtyId, servicesInDb;
            beforeEach(async () => {
                fakeClinic = {
                    name: faker.company.buzzAdjective(),
                    password: faker.internet.password(),
                    nip: 12345678909,
                    nr_license: faker.vehicle.vin(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                    description: faker.lorem.sentence(),
                };
                createdClinic = await db.Clinics.create(fakeClinic);
                specialtiesInDb = await db.Specialties.create(fakeSpecialty);
                specialtyId = specialtiesInDb.id;
                servicesInDb = await db.Services.bulkCreate([{ clinic_id: createdClinic.id, specialty_id: specialtyId, name: "Cut hand", price: 10.10, }, { clinic_id: createdClinic.id, specialty_id: specialtyId, name: "Say less you", price: 10.10, }]);
            });
            it("expect to get specialties for clinic, when they exist", async () => {
                const response = await request(app)
                    .get(`/api/clinic/${createdClinic.id}/specialties`)
                    .expect(200);

                expect(response.body).to.be.an("array");
                expect(response.body[0]).to.have.property("id", specialtyId);
                expect(response.body[0].name).to.equal(specialtiesInDb.name);
                expect(response.body[0].services[0].name).to.deep.equal(servicesInDb[0].name);
            });
        });
        describe("GET /api/specialties/:id", () => {
            let specialtyId;
            beforeEach(async () => {
                const createdSpecialty = await db.Specialties.create(fakeSpecialty);
                specialtyId = createdSpecialty.id;
            });
            it("expect specialty by id, when it exists", async () => {
                const response = await request(app)
                    .get(`/api/specialties/${specialtyId}`)
                    .expect(200);

                expect(response.body).to.have.property("id", specialtyId);
                expect(response.body.name).to.equal(fakeSpecialty.name);
            });
        });
        describe("PUT /api/specialties/:id", () => {
            let specialtyId, sessionCookies;
            beforeEach(async () => {
                const fakeUser = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                    pesel: 12345678901,
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "admin",
                    birthday: faker.date.past(30)
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
                const createdSpecialty = await db.Specialties.create(fakeSpecialty);
                specialtyId = createdSpecialty.id;
            });
            it("expect to update specialty, when data valid and it exists", async () => {
                await request(app)
                    .put(`/api/specialties/${specialtyId}`)
                    .send({ name: "TEST" })
                    .set("Cookie", sessionCookies)
                    .expect(200);

                const specialtyInDB = await db.Specialties.findByPk(specialtyId);
                expect(specialtyInDB.name).to.equals("TEST")
            });
        });
        describe("DELETE /api/specialties/:id", () => {
            let specialtyId, sessionCookies;
            beforeEach(async () => {
                const fakeUser = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                    pesel: 12345678901,
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "admin",
                    birthday: faker.date.past(30)
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
                const createdSpecialty = await db.Specialties.create(fakeSpecialty);
                specialtyId = createdSpecialty.id;
            });
            it("expect delete service by id, when it exists", async () => {
                const response = await request(app)
                    .delete(`/api/specialties/${specialtyId}`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                const specialtyInDb = await db.Specialties.findByPk(specialtyId);
                expect(specialtyInDb).to.be.null;
                expect(response.body).to.have.property("message", "Specialty deleted successfully");
            });
        });
    })
    describe("Negative tests", () => {
        describe("POST /api/specialty", () => {
            it("expect AppError('Unauthorized user'), when user is unauthorized", async () => {
                const response = await request(app)
                    .post("/api/specialties")
                    .send(fakeSpecialty)
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied'), when user isn't admin", async () => {
                const fakeUser = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                    pesel: 12345678901,
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient",
                    birthday: faker.date.past(30)
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
                    .post("/api/specialties")
                    .send(fakeSpecialty)
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect AppError('Specialty already exists'), when special with this name exists in DB", async () => {
                const fakeUser = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                    pesel: 12345678901,
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "admin",
                    birthday: faker.date.past(30)
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
                await db.Specialties.create(fakeSpecialty);

                const response = await request(app)
                    .post("/api/specialties")
                    .send(fakeSpecialty)
                    .set("Cookie", sessionCookies)
                    .expect(409);

                expect(response.body).to.have.property("message", "Specialty already exists");
            });
        });
        describe("GET /api/specialties/:id", () => {
            it("expect AppError('Specialty not found'), when specialty doesn't exist", async () => {
                const response = await request(app)
                    .get('/api/specialties/1')
                    .expect(404);

                expect(response.body).to.have.property("message", "Specialty not found");
            });
        });
        describe("PUT /api/specialties/:id", () => {
            it("expect AppError('Unauthorized user'), when user is unauthorized", async () => {
                const response = await request(app)
                    .put("/api/specialties/1")
                    .send({ specialtyData: { name: "TEST" } })
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied'), when user isn't admin", async () => {
                const fakeUser = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                    pesel: 12345678901,
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient",
                    birthday: faker.date.past(30)
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
                    .put("/api/specialties/1")
                    .send({ specialtyData: { name: "TEST" } })
                    .set("Cookie", sessionCookies)
                    .expect(403);


                expect(response.body).to.have.property("message", "Access denied");
            });
        });
        describe("DELETE /api/specialties/:id", () => {
            it("expect AppError('Unauthorized user'), when user is unauthorized", async () => {
                const response = await request(app)
                    .delete("/api/specialties/1")
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied'), when user isn't admin", async () => {
                const fakeUser = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                    pesel: 12345678901,
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient",
                    birthday: faker.date.past(30)
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
                    .delete("/api/specialties/1")
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
        });
    });
});