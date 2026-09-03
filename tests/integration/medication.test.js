process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("Medication routes", () => {
    let fakeMedication, server;

    before(async () => {
        server = app.listen(0);
        await db.sequelize.sync({ force: true });
    });
    after(async () => {
        await server.close();
    });

    beforeEach(async () => {
        fakeMedication = {
            name: faker.lorem.sentence(),
        };
    });
    afterEach(async () => {
        await db.Medications.destroy({ where: {} });
        await db.Users.destroy({ where: {} });
    });

    describe("Positive tests", () => {
        let sessionCookies;
        beforeEach(async () => {
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
            sessionCookies = res.headers['set-cookie'];
        });
        describe("POST /api/medications", () => {
            it("expect to create medication, when data is valid", async () => {
                const response = await request(app)
                    .post("/api/medications/")
                    .send(fakeMedication)
                    .set("Cookie", sessionCookies)
                    .expect(201);

                expect(response.body).that.is.a("object");
                expect(response.body).to.include({ name: fakeMedication.name });
            });
        });
        describe("GET /api/medications", () => {
            it("expect medications, when they exists", async () => {
                const testMedication = await db.Medications.create(fakeMedication);

                const response = await request(app)
                    .get(`/api/medications`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.be.an("array");
                expect(response.body[0]).to.have.property("id", testMedication.id);
                expect(response.body[0]).to.include({ name: testMedication.name });
            });
        });
        describe("PUT /api/medications/:medicationId", () => {
            it("expect to update medication, when data valid and it exists", async () => {
                const testMedication = await db.Medications.create(fakeMedication);

                const response = await request(app)
                    .put(`/api/medications/${testMedication.id}`)
                    .send({ name: "TEST" })
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("name", "TEST");
            });
        });
        describe("DELETE /api/medications/:medicationId", () => {
            it("expect delete medication by id, when it exists", async () => {
                const testMedication = await db.Medications.create(fakeMedication);

                const response = await request(app)
                    .delete(`/api/medications/${testMedication.id}`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("message", "Medication deleted successfully")
                const MedicationInDb = await db.Medications.findByPk(testMedication.id);
                expect(MedicationInDb).to.be.null;
            });
        });
    });
    describe("Negative tests", () => {
        describe("POST /api/medications", () => {
            it("expect to AppError('name is required'), when 'name' is not provided", async () => {
                const response = await request(app)
                    .post("/api/medications/")
                    .send()
                    .expect(400);

                expect(response.body).to.have.property("message", "name is required");
            });
            it("expect to AppError('Unauthorized user'), when user is not unauthorized", async () => {
                const response = await request(app)
                    .post("/api/medications/")
                    .send(fakeMedication)
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
                    .post("/api/medications/")
                    .send(fakeMedication)
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
        });
        describe("PUT /api/medications/:medicationId", () => {
            it("expect to AppError('name is required'), when 'name' is not provided", async () => {
                const response = await request(app)
                    .put("/api/medications/1")
                    .send()
                    .expect(400);

                expect(response.body).to.have.property("message", "name is required");
            });
            it("expect to AppError('Unauthorized user'), when user is not unauthorized", async () => {
                const response = await request(app)
                    .put("/api/medications/1")
                    .send({ name: "TEST" })
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
                    .put("/api/medications/1")
                    .send({ name: "TEST" })
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect to AppError('Medication not found'), when medication doesn't exist", async () => {
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
                    .put("/api/medications/1")
                    .send({ name: "TEST" })
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Medication not found");
            });
        });
        describe("DELETE /api/medications/:medicationId", () => {
            it("expect to AppError('Unauthorized user'), when user is not unauthorized", async () => {
                const response = await request(app)
                    .delete("/api/medications/1")
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
                    .delete("/api/medications/1")
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect to AppError('Medication not found'), when medication doesn't exist", async () => {
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
                    .delete("/api/medications/1")
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Medication not found");
            });
        });
    });
});